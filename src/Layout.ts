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

module TypeViz {

    import Visual = TypeViz.SVG.Visual;
    import Point = TypeViz.Point;
    import Group = TypeViz.SVG.Group;
    import Path = TypeViz.SVG.Path;
    import Color = TypeViz.Media.Color;
    import Colors = TypeViz.Media.Colors;

    /*Various layout and packing algorithms.*/
    export module Layout {
        export enum PackType {
            /*Uses accumulation and tree traversals.*/
            Tree,
            /*Uses the data as a flat list without accumulation.*/
            Close
        }
        /* The packing layout.*/
        export class Pack {

            private size;
            private radius;
            private hierarchy: Hierarchy;
            private sort;
            public get Hierarchy() { return this.hierarchy; }
            public get SortAccessor() { return this.hierarchy.SortAccessor; }
            public set SortAccessor(v) {
                this.hierarchy.SortAccessor = v;
            }

            public get ValueAccessor() {
                return this.hierarchy.ValueAccessor;
            }
            public set ValueAccessor(v) {
                this.hierarchy.ValueAccessor = v;
            }

            public get TitleAccessor() {
                return this.hierarchy.TitleAccessor;
            }
            public set TitleAccessor(v) {
                this.hierarchy.TitleAccessor = v;
            }

            /**
             * Gets the function which defines how children nodes are fetched.
             */
            public get ChildrenAccessor() {
                return this.hierarchy.ChildrenAccessor;
            }

            /**
             * Sets the function which defines how children nodes are fetched.
             */
            public set ChildrenAccessor(value) {
                this.hierarchy.ChildrenAccessor = value;
            }
            constructor() {
                var h = new Hierarchy();
                h.SortAccessor = this.packSort;
                this.hierarchy = h;
                this.padding = 0;
                this.size = [1, 1];
            }


            treeVisitAfter(n, callback) {

                function visit(node, previousSibling) {
                    var children = node.children;
                    if (children && (n = children.length)) {
                        var child,
                            previousChild = null,
                            i = -1,
                            n;
                        while (++i < n) {
                            child = children[i];
                            visit.call(this, child, previousChild);
                            previousChild = child;
                        }
                    }
                    callback.call(this, node, previousSibling);
                }

                visit.call(this, n, null);
            }

            private padding;

            /**
             * Gets the padding.
             */
            public get Padding() {
                return this.padding;
            }

            /**
             * Sets the padding.
             */
            public set Padding(value) {
                this.padding = value;

            }

            /**
             * Gets the size.
             */
            public get Size() {
                return this.size;
            }

            /**
             * Sets the size.
             */
            public set Size(value) {
                this.size = value;

            }


            /**
             * Gets the radius.
             */
            public get Radius() {
                return this.radius;
            }

            /**
             * Sets the radius.
             */
            public set Radius(value) {
                this.radius = value;
                if (!value) {
                    this.radius = 0;
                }
                else {
                    if (typeof value === "function") this.radius = value.call(this);
                    else this.radius = value;
                }
            }

            public Layout(dataSource, type = PackType.Tree) {
                return layout_hierarchicalRebind(this.pack(dataSource, type == PackType.Close /*means flatten the hierarchy*/), this.hierarchy);
               
            }
          

            packSort(a, b) {
                return a.Data - b.Data;
            }

            packInsert(a, b) {
                var c = a._pack_next;
                a._pack_next = b;
                b._pack_prev = a;
                b._pack_next = c;
                c._pack_prev = b;
            }

            packSplice(a, b) {
                a._pack_next = b;
                b._pack_prev = a;
            }

            packIntersect(a, b) {
                var dx = b.x - a.x,
                    dy = b.y - a.y,
                    dr = a.r + b.r;
                return .999 * dr * dr > dx * dx + dy * dy; // relative error within epsilon
            }

            pack(d, flatten) {
                var nodes = this.hierarchy.Load.call(this.hierarchy, d, flatten),
                    root = nodes[0],
                    w = this.size[0],
                    h = this.size[1],
                    r = this.radius == null ? Math.sqrt : typeof this.radius === "function" ? this.radius : function () {
                        return this.radius;
                    };

                // Recursively compute the layout.
                root.x = root.y = 0;
                this.treeVisitAfter(root, cd=> {
                    cd.r = +r(cd.Data);
                });
                this.treeVisitAfter.call(this, root, this.packSiblings);

                // When padding, recompute the layout using scaled padding.
                if (this.padding) {
                    var dr = this.padding * (this.radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
                    this.treeVisitAfter(root, ad=> {
                        ad.r += dr;
                    });
                    this.treeVisitAfter(root, this.packSiblings);
                    this.treeVisitAfter(root, bd=> {
                        bd.r -= dr;
                    });
                }

                // Translate and scale the layout to fit the requested size.
                this.packTransform(root, w / 2, h / 2, this.radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));

                return nodes;
            }

            packSiblings(node) {
                if (!(nodes = node.children) || !(n = nodes.length)) return;

                var nodes,
                    xMin = Infinity,
                    xMax = -Infinity,
                    yMin = Infinity,
                    yMax = -Infinity,
                    a, b, c, i, j, k, n;

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

                        // Now iterate through the rest.
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
                                if (s1 < s2 || (s1 == s2 && b.r < a.r)) this.packSplice(a, b = j);
                                else this.packSplice(a = k, b);
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
                var cx = (xMin + xMax) / 2,
                    cy = (yMin + yMax) / 2,
                    cr = 0;
                for (i = 0; i < n; i++) {
                    c = nodes[i];
                    c.x -= cx;
                    c.y -= cy;
                    cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
                }
                node.r = cr;

                // Remove node links.
                nodes.ForEach(this.packUnlink);
            }

            packLink(node) {
                node._pack_next = node._pack_prev = node;
            }

            packUnlink(node) {
                delete node._pack_next;
                delete node._pack_prev;
            }

            packTransform(node, x, y, k) {
                var children = node.children;
                node.x = (x += k * node.x);
                node.y = (y += k * node.y);
                node.r *= k;
                if (children) {
                    var i = -1, n = children.length;
                    while (++i < n) this.packTransform(children[i], x, y, k);
                }
            }

            packPlace(a, b, c) {
                var db = a.r + c.r,
                    dx = b.x - a.x,
                    dy = b.y - a.y;
                if (db && (dx || dy)) {
                    var da = b.r + c.r,
                        dc = dx * dx + dy * dy;
                    da *= da;
                    db *= db;
                    var x = .5 + (db - da) / (2 * dc),
                        y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
                    c.x = a.x + x * dx + y * dy;
                    c.y = a.y + x * dy - y * dx;
                } else {
                    c.x = a.x + db;
                    c.y = a.y;
                }
            }
        }
    }

    /**
     * Loads and formats a hierarchy. The Data is the accumulation of the children and if data is defined on an item with children it's omitted.
     */
    export class Hierarchy {
        private sort;
        private getValue;
        private getChildren;
        public TitleAccessor = n=> n.Name;
        private dataSource;
        private nodes: Array<TreeNode<number>>;
        private flatList: Array<TreeNode<number>>;

        /*The hierarchy which can have multiple roots.*/
        public get Nodes() { return this.nodes; }
        public get FlatList() { return this.flatList; }
        /**
         * Gets the function which defines how the nodes are sorted.
         */
        public get SortAccessor() {
            return this.sort;
        }

        /**
         * Sets the function which defines how the nodes are sorted.
         */
        public set SortAccessor(value) {
            this.sort = value;
        }

        /**
         * Gets the function which defines how children nodes are fetched.
         */
        public get ChildrenAccessor() {
            return this.getChildren;
        }

        /**
         * Sets the function which defines how children nodes are fetched.
         */
        public set ChildrenAccessor(value) {
            this.getChildren = value;
        }

        /**
         * Gets the function which defines how the value of a node is fetched.
         */
        public get ValueAccessor() {
            return this.getValue;
        }

        /**
         * Sets the function which defines how the value of a node is fetched.
         */
        public set ValueAccessor(value) {
            this.getValue = value;
        }

        /**
         * Loads and parses the dataSource.
           flatten: puts all children from all levels underneath the root
         */
        public Load(json: any, flatten = false) {
            if (TypeViz.IsUndefined(json)) throw "Loading undefined or null data in the hierarchy";
            if (json instanceof TypeViz.Diagramming.Graph) {
                var conv;
                if (flatten) {
                    conv = TreeNode.Flatten(<TypeViz.Diagramming.Graph>json);
                    this.nodes = [conv.root];
                    this.flatList = conv.list;
                    if (this.sort) conv.root.Children.sort(this.sort);
                }
                else {
                    conv = TreeNode.FromGraph(<TypeViz.Diagramming.Graph>json);
                    this.nodes = [conv.root];
                    this.flatList = conv.list;
                }

            }
            else if (TypeViz.IsLiteral(json)) {
                this.dataSource = json;
                this.nodes = [];
                this.flatList = [];
                this.buildTree(json, 0/*, this.nodes*/);
            }
            return this.nodes;

        }

        constructor(json?, getChildren?, getValue?) {
            this.sort = (a, b) => b.Data - a.Data;

            // the default property of the children nodes is 'children'
            if (TypeViz.IsDefined(getChildren)) this.getChildren = getChildren;
            else this.getChildren = n=> n.children;

            if (TypeViz.IsDefined(getValue)) this.getValue = getValue;
            else this.getValue = n=> n.Data;

            if (TypeViz.IsDefined(json)) this.Load(json);

        }

        /* Recursively compute the node depth and value. Also converts to a standard hierarchy structure.*/
        private buildTree(json, depth, parent?) {
            var childs = this.getChildren.call(this.dataSource, json, depth);
            var node = new TreeNode<number>();
            //node.Data = this.getValue.call(this.dataSource, json, depth) || 0;
            node.Depth = depth;
            this.flatList.push(node);
            if (TypeViz.IsDefined(parent)) parent.Append(node);
            else this.nodes.push(node); // a root
            if (this.TitleAccessor) node.Title = this.TitleAccessor.call(this.dataSource, json, depth);
            if (childs && (n = childs.length)) {
                var i = -1,
                    n,
                    v = 0,
                    j = depth + 1,
                    d;
                while (++i < n) {
                    d = this.buildTree(childs[i], j, node);
                    v += d.Data;
                }
                if (this.sort) node.Children.sort(this.sort);
                if (this.getValue) node.Data = v;
            } else if (this.getValue) {
                node.Data = +this.getValue.call(this.dataSource, json, depth) || 0;
            }

            return node;
        }

        /* Recursively re-evaluates the node value. */
        private parseValues(node, depth) {
            var children = node.children;
            var v = 0;
            if (children && (n = children.length)) {
                var i = -1,
                    n,
                    j = depth + 1;
                while (++i < n) v += this.parseValues(children[i], j);
            } else if (this.getValue) {
                v = +this.getValue.call(this.dataSource, node, depth) || 0;
            }
            if (this.getValue) node.Data = v;
            return v;
        }
    }

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
            return (parent.children || []).map(child=> {
                return { source: parent, target: child };
            });
        });
        return Array.prototype.Merge(nds);
    }

    /**
     * Copies a variable number of methods from source to target.
     */
    export function myrebind(target, source) {
        var i = 1, n = arguments.length, method;
        while (++i < n) target[method = arguments[i]] = TypeViz.rebindMethod(target, source, source[method]);
        return target;
    }

}