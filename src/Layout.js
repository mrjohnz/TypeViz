/**
Copyright (c) 2007-2014, Orbifold bvba.
For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/
/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="Animation.ts" />
/// <reference path="Arrays.ts" />
/// <reference path='Structures.ts' />
/// <reference path='Media.ts' />
/// <reference path='SVG.ts' />
var TypeViz;
(function (TypeViz) {
    /*Various layout and packing algorithms.*/
    (function (Layout) {
        (function (PackType) {
            /*Uses accumulation and tree traversals.*/
            PackType[PackType["Tree"] = 0] = "Tree";

            /*Uses the data as a flat list without accumulation.*/
            PackType[PackType["Close"] = 1] = "Close";
        })(Layout.PackType || (Layout.PackType = {}));
        var PackType = Layout.PackType;

        /* The packing layout.*/
        var Pack = (function () {
            function Pack() {
                var h = new Hierarchy();
                h.SortAccessor = this.packSort;
                this.hierarchy = h;
                this.padding = 0;
                this.size = [1, 1];
            }
            Object.defineProperty(Pack.prototype, "Hierarchy", {
                get: function () {
                    return this.hierarchy;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pack.prototype, "SortAccessor", {
                get: function () {
                    return this.hierarchy.SortAccessor;
                },
                set: function (v) {
                    this.hierarchy.SortAccessor = v;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Pack.prototype, "ValueAccessor", {
                get: function () {
                    return this.hierarchy.ValueAccessor;
                },
                set: function (v) {
                    this.hierarchy.ValueAccessor = v;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Pack.prototype, "TitleAccessor", {
                get: function () {
                    return this.hierarchy.TitleAccessor;
                },
                set: function (v) {
                    this.hierarchy.TitleAccessor = v;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Pack.prototype, "ChildrenAccessor", {
                /**
                * Gets the function which defines how children nodes are fetched.
                */
                get: function () {
                    return this.hierarchy.ChildrenAccessor;
                },
                /**
                * Sets the function which defines how children nodes are fetched.
                */
                set: function (value) {
                    this.hierarchy.ChildrenAccessor = value;
                },
                enumerable: true,
                configurable: true
            });


            Pack.prototype.treeVisitAfter = function (n, callback) {
                function visit(node, previousSibling) {
                    var children = node.children;
                    if (children && (n = children.length)) {
                        var child, previousChild = null, i = -1, n;
                        while (++i < n) {
                            child = children[i];
                            visit.call(this, child, previousChild);
                            previousChild = child;
                        }
                    }
                    callback.call(this, node, previousSibling);
                }

                visit.call(this, n, null);
            };

            Object.defineProperty(Pack.prototype, "Padding", {
                /**
                * Gets the padding.
                */
                get: function () {
                    return this.padding;
                },
                /**
                * Sets the padding.
                */
                set: function (value) {
                    this.padding = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Pack.prototype, "Size", {
                /**
                * Gets the size.
                */
                get: function () {
                    return this.size;
                },
                /**
                * Sets the size.
                */
                set: function (value) {
                    this.size = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Pack.prototype, "Radius", {
                /**
                * Gets the radius.
                */
                get: function () {
                    return this.radius;
                },
                /**
                * Sets the radius.
                */
                set: function (value) {
                    this.radius = value;
                    if (!value) {
                        this.radius = 0;
                    } else {
                        if (typeof value === "function")
                            this.radius = value.call(this);
                        else
                            this.radius = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Pack.prototype.Layout = function (dataSource, type) {
                if (typeof type === "undefined") { type = 0 /* Tree */; }
                return layout_hierarchicalRebind(this.pack(dataSource, type == 1 /* Close */), this.hierarchy);
            };

            Pack.prototype.packSort = function (a, b) {
                return a.Data - b.Data;
            };

            Pack.prototype.packInsert = function (a, b) {
                var c = a._pack_next;
                a._pack_next = b;
                b._pack_prev = a;
                b._pack_next = c;
                c._pack_prev = b;
            };

            Pack.prototype.packSplice = function (a, b) {
                a._pack_next = b;
                b._pack_prev = a;
            };

            Pack.prototype.packIntersect = function (a, b) {
                var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
                return .999 * dr * dr > dx * dx + dy * dy;
            };

            Pack.prototype.pack = function (d, flatten) {
                var nodes = this.hierarchy.Load.call(this.hierarchy, d, flatten), root = nodes[0], w = this.size[0], h = this.size[1], r = this.radius == null ? Math.sqrt : typeof this.radius === "function" ? this.radius : function () {
                    return this.radius;
                };

                // Recursively compute the layout.
                root.x = root.y = 0;
                this.treeVisitAfter(root, function (cd) {
                    cd.r = +r(cd.Data);
                });
                this.treeVisitAfter.call(this, root, this.packSiblings);

                // When padding, recompute the layout using scaled padding.
                if (this.padding) {
                    var dr = this.padding * (this.radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
                    this.treeVisitAfter(root, function (ad) {
                        ad.r += dr;
                    });
                    this.treeVisitAfter(root, this.packSiblings);
                    this.treeVisitAfter(root, function (bd) {
                        bd.r -= dr;
                    });
                }

                // Translate and scale the layout to fit the requested size.
                this.packTransform(root, w / 2, h / 2, this.radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));

                return nodes;
            };

            Pack.prototype.packSiblings = function (node) {
                if (!(nodes = node.children) || !(n = nodes.length))
                    return;

                var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;

                function bound(item) {
                    xMin = Math.min(item.x - item.r, xMin);
                    xMax = Math.max(item.x + item.r, xMax);
                    yMin = Math.min(item.y - item.r, yMin);
                    yMax = Math.max(item.y + item.r, yMax);
                }

                // Create node links.
                nodes.ForEach(this.packLink, this);

                // Create first node.
                a = nodes[0];
                a.x = -a.r;
                a.y = 0;
                bound(a);

                // Create second node.
                if (n > 1) {
                    b = nodes[1];
                    b.x = b.r;
                    b.y = 0;
                    bound(b);

                    // Create third node and build chain.
                    if (n > 2) {
                        c = nodes[2];
                        this.packPlace(a, b, c);
                        bound(c);
                        this.packInsert(a, c);
                        a._pack_prev = c;
                        this.packInsert(c, b);
                        b = a._pack_next;

                        for (i = 3; i < n; i++) {
                            this.packPlace(a, b, c = nodes[i]);

                            // Search for the closest intersection.
                            var isect = 0, s1 = 1, s2 = 1;
                            for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
                                if (this.packIntersect(j, c)) {
                                    isect = 1;
                                    break;
                                }
                            }
                            if (isect == 1) {
                                for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
                                    if (this.packIntersect(k, c)) {
                                        break;
                                    }
                                }
                            }

                            // Update node chain.
                            if (isect) {
                                if (s1 < s2 || (s1 == s2 && b.r < a.r))
                                    this.packSplice(a, b = j);
                                else
                                    this.packSplice(a = k, b);
                                i--;
                            } else {
                                this.packInsert(a, c);
                                b = c;
                                bound(c);
                            }
                        }
                    }
                }

                // Re-center the circles and compute the encompassing radius.
                var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
                for (i = 0; i < n; i++) {
                    c = nodes[i];
                    c.x -= cx;
                    c.y -= cy;
                    cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
                }
                node.r = cr;

                // Remove node links.
                nodes.ForEach(this.packUnlink);
            };

            Pack.prototype.packLink = function (node) {
                node._pack_next = node._pack_prev = node;
            };

            Pack.prototype.packUnlink = function (node) {
                delete node._pack_next;
                delete node._pack_prev;
            };

            Pack.prototype.packTransform = function (node, x, y, k) {
                var children = node.children;
                node.x = (x += k * node.x);
                node.y = (y += k * node.y);
                node.r *= k;
                if (children) {
                    var i = -1, n = children.length;
                    while (++i < n)
                        this.packTransform(children[i], x, y, k);
                }
            };

            Pack.prototype.packPlace = function (a, b, c) {
                var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
                if (db && (dx || dy)) {
                    var da = b.r + c.r, dc = dx * dx + dy * dy;
                    da *= da;
                    db *= db;
                    var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
                    c.x = a.x + x * dx + y * dy;
                    c.y = a.y + x * dy - y * dx;
                } else {
                    c.x = a.x + db;
                    c.y = a.y;
                }
            };
            return Pack;
        })();
        Layout.Pack = Pack;
    })(TypeViz.Layout || (TypeViz.Layout = {}));
    var Layout = TypeViz.Layout;

    /**
    * Loads and formats a hierarchy. The Data is the accumulation of the children and if data is defined on an item with children it's omitted.
    */
    var Hierarchy = (function () {
        function Hierarchy(json, getChildren, getValue) {
            this.TitleAccessor = function (n) {
                return n.Name;
            };
            this.sort = function (a, b) {
                return b.Data - a.Data;
            };

            // the default property of the children nodes is 'children'
            if (TypeViz.IsDefined(getChildren))
                this.getChildren = getChildren;
            else
                this.getChildren = function (n) {
                    return n.children;
                };

            if (TypeViz.IsDefined(getValue))
                this.getValue = getValue;
            else
                this.getValue = function (n) {
                    return n.Data;
                };

            if (TypeViz.IsDefined(json))
                this.Load(json);
        }
        Object.defineProperty(Hierarchy.prototype, "Nodes", {
            /*The hierarchy which can have multiple roots.*/
            get: function () {
                return this.nodes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Hierarchy.prototype, "FlatList", {
            get: function () {
                return this.flatList;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Hierarchy.prototype, "SortAccessor", {
            /**
            * Gets the function which defines how the nodes are sorted.
            */
            get: function () {
                return this.sort;
            },
            /**
            * Sets the function which defines how the nodes are sorted.
            */
            set: function (value) {
                this.sort = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Hierarchy.prototype, "ChildrenAccessor", {
            /**
            * Gets the function which defines how children nodes are fetched.
            */
            get: function () {
                return this.getChildren;
            },
            /**
            * Sets the function which defines how children nodes are fetched.
            */
            set: function (value) {
                this.getChildren = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Hierarchy.prototype, "ValueAccessor", {
            /**
            * Gets the function which defines how the value of a node is fetched.
            */
            get: function () {
                return this.getValue;
            },
            /**
            * Sets the function which defines how the value of a node is fetched.
            */
            set: function (value) {
                this.getValue = value;
            },
            enumerable: true,
            configurable: true
        });


        /**
        * Loads and parses the dataSource.
        flatten: puts all children from all levels underneath the root
        */
        Hierarchy.prototype.Load = function (json, flatten) {
            if (typeof flatten === "undefined") { flatten = false; }
            if (TypeViz.IsUndefined(json))
                throw "Loading undefined or null data in the hierarchy";
            if (json instanceof TypeViz.Diagramming.Graph) {
                var conv;
                if (flatten) {
                    conv = TypeViz.TreeNode.Flatten(json);
                    this.nodes = [conv.root];
                    this.flatList = conv.list;
                    if (this.sort)
                        conv.root.Children.sort(this.sort);
                } else {
                    conv = TypeViz.TreeNode.FromGraph(json);
                    this.nodes = [conv.root];
                    this.flatList = conv.list;
                }
            } else if (TypeViz.IsLiteral(json)) {
                this.dataSource = json;
                this.nodes = [];
                this.flatList = [];
                this.buildTree(json, 0);
            }
            return this.nodes;
        };

        /* Recursively compute the node depth and value. Also converts to a standard hierarchy structure.*/
        Hierarchy.prototype.buildTree = function (json, depth, parent) {
            var childs = this.getChildren.call(this.dataSource, json, depth);
            var node = new TypeViz.TreeNode();

            //node.Data = this.getValue.call(this.dataSource, json, depth) || 0;
            node.Depth = depth;
            this.flatList.push(node);
            if (TypeViz.IsDefined(parent))
                parent.Append(node);
            else
                this.nodes.push(node); // a root
            if (this.TitleAccessor)
                node.Title = this.TitleAccessor.call(this.dataSource, json, depth);
            if (childs && (n = childs.length)) {
                var i = -1, n, v = 0, j = depth + 1, d;
                while (++i < n) {
                    d = this.buildTree(childs[i], j, node);
                    v += d.Data;
                }
                if (this.sort)
                    node.Children.sort(this.sort);
                if (this.getValue)
                    node.Data = v;
            } else if (this.getValue) {
                node.Data = +this.getValue.call(this.dataSource, json, depth) || 0;
            }

            return node;
        };

        /* Recursively re-evaluates the node value. */
        Hierarchy.prototype.parseValues = function (node, depth) {
            var children = node.children;
            var v = 0;
            if (children && (n = children.length)) {
                var i = -1, n, j = depth + 1;
                while (++i < n)
                    v += this.parseValues(children[i], j);
            } else if (this.getValue) {
                v = +this.getValue.call(this.dataSource, node, depth) || 0;
            }
            if (this.getValue)
                node.Data = v;
            return v;
        };
        return Hierarchy;
    })();
    TypeViz.Hierarchy = Hierarchy;

    // A method assignment helper for hierarchy subclasses.
    function layout_hierarchicalRebind(object, hierarchy) {
        TypeViz.rebind(object, hierarchy, "sort", "children", "Data");

        // Add an alias for nodes and links, for convenience.
        object.nodes = object;
        object.links = layout_hierarchicalLinks;

        return object;
    }

    // Returns an array source+target objects for the specified nodes.
    function layout_hierarchicalLinks(nodes) {
        var nds = nodes.map(function (parent) {
            return (parent.children || []).map(function (child) {
                return { source: parent, target: child };
            });
        });
        return Array.prototype.Merge(nds);
    }

    /**
    * Copies a variable number of methods from source to target.
    */
    function myrebind(target, source) {
        var i = 1, n = arguments.length, method;
        while (++i < n)
            target[method = arguments[i]] = TypeViz.rebindMethod(target, source, source[method]);
        return target;
    }
    TypeViz.myrebind = myrebind;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=Layout.js.map
