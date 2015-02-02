var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
/// <reference path="SVG.ts" />
var TypeViz;
(function (TypeViz) {
    /*Generic node for a standard tree structure.*/
    var TreeNode = (function () {
        function TreeNode(data) {
            this.children = [];
            if (TypeViz.IsDefined(data)) {
                this.data = data;
            }
        }
        Object.defineProperty(TreeNode.prototype, "Data", {
            get: function () {
                return this.data;
            },
            set: function (value) {
                this.data = value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TreeNode.prototype, "Children", {
            get: function () {
                return this.children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeNode.prototype, "Parent", {
            get: function () {
                return this.parent;
            },
            set: function (value) {
                this.parent = value;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TreeNode.prototype, "IsRoot", {
            get: function () {
                return this.children.length === 0;
            },
            enumerable: true,
            configurable: true
        });
        TreeNode.prototype.Append = function (node) {
            if (TypeViz.IsUndefined(node))
                throw "Cannot append a null node";
            this.children.push(node);
            node.Parent = this;
        };
        TreeNode.Flatten = function (g, root) {
            if (g.IsEmpty)
                throw "Supplied an empty graph.";
            if (TypeViz.IsUndefined(root))
                root = g.nodes[0];
            var rootNode = new TreeNode(root.data);
            var flatList = [rootNode];
            for (var i = 0; i < g.nodes.length; i++) {
                var n = g.nodes[i];
                if (n == root)
                    continue;
                var newNode = new TreeNode(n.data);
                newNode.Title = n.Data;
                rootNode.Data += n.Data;
                flatList.push(newNode);
                rootNode.Append(newNode);
            }
            return {
                root: rootNode,
                list: flatList
            };
        };
        TreeNode.FromGraph = function (g, root) {
            if (g.IsEmpty)
                throw "Supplied an empty graph.";
            if (TypeViz.IsUndefined(root))
                root = g.nodes[0];
            var tree = g.getSpanningTree(root);
            var rootNode;
            var flatList = [];
            var map = new TypeViz.Map();
            var acc = function (node, parent) {
                if (TypeViz.IsUndefined(parent)) {
                    rootNode = new TreeNode(node.data);
                    map.Set(node.id, rootNode);
                    flatList.push(rootNode);
                } else {
                    var pn = map.Get(parent.id);
                    if (TypeViz.IsUndefined(pn))
                        throw "Trouble in the Graph to Tree conversion.";
                    var newone = new TreeNode(node.data);
                    map.Set(node.id, newone);
                    pn.Append(newone);
                    flatList.push(newone);
                }
            };
            tree.depthFirstTraversal(tree.getNode(root.id), acc);
            return {
                root: rootNode,
                list: flatList
            };
        };
        return TreeNode;
    })();
    TypeViz.TreeNode = TreeNode;

    /* The Point structure.*/
    var Point = (function () {
        function Point(x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            this.X = x;
            this.Y = y;
        }
        Point.FromArray = function (a) {
            if (a[0] instanceof Array) {
                var points = [];
                for (var i = 0; i < a.length; i++) {
                    points.push(new Point(a[i][0], a[i][1]));
                }
                return points;
            } else {
                return new Point(a[0], a[1]);
            }
        };

        /**
        * Turns a Point to a tuple.
        */
        Point.ToArray = function (p) {
            if (p instanceof Point) {
                return [p.X, p.Y];
            } else if (p instanceof Array) {
                if (p.length === 0)
                    return p;
                if (p[0] instanceof Point) {
                    var points = [];
                    for (var i = 0; i < p.length; i++) {
                        points.push([p[i].X, p[i].Y]);
                    }
                    return points;
                }
                return p;
            }
            throw "Cannot convert type to an array.";
        };

        Object.defineProperty(Point, "Empty", {
            get: function () {
                return new Point(0, 0);
            },
            enumerable: true,
            configurable: true
        });

        Point.prototype.Plus = function (p) {
            return new Point(this.X + p.X, this.Y + p.Y);
        };

        Point.prototype.Minus = function (p) {
            return new Point(this.X - p.X, this.Y - p.Y);
        };

        Point.prototype.Times = function (s) {
            return new Point(this.X * s, this.Y * s);
        };

        Point.prototype.Normalize = function () {
            if (this.Length == 0)
                return Point.Empty;
            return this.Times(1 / this.Length);
        };

        Object.defineProperty(Point.prototype, "Length", {
            get: function () {
                return TypeViz.Maths.Sqrt(this.X * this.X + this.Y * this.Y);
            },
            enumerable: true,
            configurable: true
        });

        Point.prototype.toString = function () {
            return "(" + this.X + "," + this.Y + ")";
        };

        Object.defineProperty(Point.prototype, "LengthSquared", {
            get: function () {
                return (this.X * this.X + this.Y * this.Y);
            },
            enumerable: true,
            configurable: true
        });

        Point.MiddleOf = function (p, q) {
            return new Point(q.X - p.X, q.Y - p.Y).Times(0.5).Plus(p);
        };

        Point.prototype.ToPolar = function (useDegrees) {
            if (typeof useDegrees === "undefined") { useDegrees = false; }
            var factor = 1;
            if (useDegrees)
                factor = 180 / TypeViz.Maths.Pi;
            var a = TypeViz.Maths.Atan2(TypeViz.Maths.Abs(this.Y), TypeViz.Maths.Abs(this.X));
            var halfpi = TypeViz.Maths.Pi / 2;
            if (this.X == 0) {
                // note that the angle goes down and not the usual mathematical convention
                if (this.Y == 0)
                    return new Polar(0, 0);
                if (this.Y > 0)
                    return new Polar(this.Length, factor * halfpi);
                if (this.Y < 0)
                    return new Polar(this.Length, factor * 3 * halfpi);
            } else if (this.X > 0) {
                if (this.Y == 0)
                    return new Polar(this.Length, 0);
                if (this.Y > 0)
                    return new Polar(this.Length, factor * a);
                if (this.Y < 0)
                    return new Polar(this.Length, factor * (4 * halfpi - a));
            } else {
                if (this.Y == 0)
                    return new Polar(this.Length, 2 * halfpi);
                if (this.Y > 0)
                    return new Polar(this.Length, factor * (2 * halfpi - a));
                if (this.Y < 0)
                    return new Polar(this.Length, factor * (2 * halfpi + a));
            }
        };
        return Point;
    })();
    TypeViz.Point = Point;

    /* Defines a rectangular region.*/
    var Rect = (function () {
        /**
        * Instantiates a new rectangle.
        * @param x The horizontal coordinate of the upper-left corner.
        * @param y The vertical coordinate of the upper-left corner.
        * @param width The width of the rectangle.
        * @param height The height of the rectangle.
        */
        function Rect(x, y, width, height) {
            if (typeof x === "undefined") { x = NaN; }
            if (typeof y === "undefined") { y = NaN; }
            if (typeof width === "undefined") { width = NaN; }
            if (typeof height === "undefined") { height = NaN; }
            this.X = x;
            this.Y = y;
            this.Width = width;
            this.Height = height;
        }
        /**
        * Determines whether the given point is contained inside this rectangle.
        */
        Rect.prototype.Contains = function (point) {
            if (isNaN(this.X) || isNaN(this.Y) || isNaN(this.Width) || isNaN(this.Height))
                return false;
            if (isNaN(point.X) || isNaN(point.Y))
                return false;
            return ((point.X >= this.X) && (point.X <= (this.X + this.Width)) && (point.Y >= this.Y) && (point.Y <= (this.Y + this.Height)));
        };

        /**
        * Inflates this rectangle with the given amount.
        * @param dx The horizontal inflation which is also the vertical one if the vertical inflation is not specified.
        * @param dy The vertical inflation.
        */
        Rect.prototype.Inflate = function (dx, dy) {
            if (typeof dy === "undefined") { dy = null; }
            if (dy == null)
                dy = dx;
            this.X -= dx;
            this.Y -= dy;
            this.Width += dx + dx + 1;
            this.Height += dy + dy + 1;
            return this;
        };

        /**
        * Offsets this rectangle with the given amount.
        * @param dx The horizontal offset which is also the vertical one if the vertical offset is not specified.
        * @param dy The vertical offset.
        */
        Rect.prototype.Offset = function (dx, dy) {
            if (typeof dy === "undefined") { dy = NaN; }
            if (isNaN(dy))
                dy = dx;
            this.X += dx;
            this.Y += dy;
        };

        /**
        * Returns the union of the current rectangle with the given one.
        * @param r The rectangle to union with the current one.
        */
        Rect.prototype.Union = function (r) {
            var x1 = Math.min(this.X, r.X);
            var y1 = Math.min(this.Y, r.Y);
            var x2 = Math.max((this.X + this.Width), (r.X + r.Width));
            var y2 = Math.max((this.Y + this.Height), (r.Y + r.Height));
            return new Rect(x1, y1, x2 - x1, y2 - y1);
        };

        Object.defineProperty(Rect.prototype, "TopLeft", {
            /**
            * Get the upper-left corner position of this rectangle.
            */
            get: function () {
                return new Point(this.X, this.Y);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Rect.prototype, "Size", {
            get: function () {
                return new TypeViz.Size(this.Width, this.Height);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Rect.prototype, "BottomRight", {
            /**
            * Get the bottom-right corner position of this rectangle.
            */
            get: function () {
                return new Point(this.X + this.Width, this.Y + this.Height);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Returns a clone of this rectangle.
        */
        Rect.prototype.Clone = function () {
            return new Rect(this.X, this.Y, this.Width, this.Height);
        };

        Rect.Create = function (x, y, w, h) {
            return new Rect(x, y, w, h);
        };

        Object.defineProperty(Rect, "Empty", {
            get: function () {
                return new Rect(0, 0, 0, 0);
            },
            enumerable: true,
            configurable: true
        });

        Rect.FromPoints = function (p, q) {
            if (isNaN(p.X) || isNaN(p.Y) || isNaN(q.X) || isNaN(q.Y))
                throw "Some values are NaN.";
            return new Rect(Math.min(p.X, q.X), Math.min(p.Y, q.Y), Math.abs(p.X - q.X), Math.abs(p.Y - q.Y));
        };
        return Rect;
    })();
    TypeViz.Rect = Rect;

    /* The Size structure.*/
    var Size = (function () {
        function Size(width, height) {
            if (typeof height === "undefined") { height = null; }
            if (height == null)
                height = width;
            this.Width = width;
            this.Height = height;
        }
        Object.defineProperty(Size, "Empty", {
            get: function () {
                return new Size(0);
            },
            enumerable: true,
            configurable: true
        });
        return Size;
    })();
    TypeViz.Size = Size;

    /* Defines a polar coordinate.*/
    var Polar = (function () {
        function Polar(r, a) {
            if (typeof r === "undefined") { r = null; }
            if (typeof a === "undefined") { a = null; }
            this.R = r;
            this.Angle = a;
        }
        Polar.ToPoint = function (p) {
            return new Point(p.R * TypeViz.Maths.Cos(p.Angle), p.R * TypeViz.Maths.Sin(p.Angle));
        };

        Polar.FromPoint = function (p) {
            return new Polar(p.Length, TypeViz.Maths.Atan2(p.Y, p.X));
        };
        return Polar;
    })();
    TypeViz.Polar = Polar;

    /**
    * Represents a collection of key-value pairs that are organized based on the hash code of the key.
    * buckets[hashId] = {key: key, value:...}
    * Important: do not use the standard Array access method, use the get/set methods instead.
    * See http://en.wikipedia.org/wiki/Hash_table
    */
    var HashTable = (function () {
        function HashTable() {
            this.buckets = [];
            this.length = 0;
        }
        /**
        * Adds the literal object with the given key (of the form {key: key,....}).
        */
        HashTable.prototype.Add = function (key, value) {
            var obj = this._createGetBucket(key);
            if (TypeViz.IsDefined(value)) {
                obj.value = value;
            }
            return obj;
        };

        /**
        * Gets the literal object with the given key.
        */
        HashTable.prototype.Get = function (key) {
            if (this._bucketExists(key)) {
                return this._createGetBucket(key);
            }
            return null;
        };

        /**
        * Set the key-value pair.
        * @param key The key of the entry.
        * @param value The value to set. If the key already exists the value will be overwritten.
        */
        HashTable.prototype.Set = function (key, value) {
            this.Add(key, value);
        };

        /**
        * Determines whether the HashTable contains a specific key.
        */
        HashTable.prototype.ContainsKey = function (key) {
            return this._bucketExists(key);
        };

        /**
        * Removes the element with the specified key from the hashtable.
        * Returns the removed bucket.
        */
        HashTable.prototype.Remove = function (key) {
            if (this._bucketExists(key)) {
                var hashId = this._hash(key);
                delete this.buckets[hashId];
                this.length--;
                return key;
            }
        };

        /**
        * Foreach with an iterator working on the key-value pairs.
        * @param func
        */
        HashTable.prototype.ForEach = function (func) {
            var hashes = this._hashes();
            for (var i = 0, len = hashes.length; i < len; i++) {
                var hash = hashes[i];
                var bucket = this.buckets[hash];
                if (TypeViz.IsUndefined(bucket)) {
                    continue;
                }
                func(bucket);
            }
        };

        /**
        * Returns a (shallow) clone of the current HashTable.
        * @returns {HashTable}
        */
        HashTable.prototype.Clone = function () {
            var ht = new HashTable();
            var hashes = this._hashes();
            for (var i = 0, len = hashes.length; i < len; i++) {
                var hash = hashes[i];
                var bucket = this.buckets[hash];
                if (TypeViz.IsUndefined(bucket)) {
                    continue;
                }
                ht.Add(bucket.key, bucket.value);
            }
            return ht;
        };

        /**
        * Returns the hashes of the buckets.
        * @returns {Array}
        * @private
        */
        HashTable.prototype._hashes = function () {
            var hashes = [];
            for (var hash in this.buckets) {
                if (this.buckets.hasOwnProperty(hash)) {
                    hashes.push(hash);
                }
            }
            return hashes;
        };

        HashTable.prototype._bucketExists = function (key) {
            var hashId = this._hash(key);
            return TypeViz.IsDefined(this.buckets[hashId]);
        };

        /**
        * Returns-adds the createGetBucket with the given key. If not present it will
        * be created and returned.
        * A createGetBucket is a literal object of the form {key: key, ...}.
        */
        HashTable.prototype._createGetBucket = function (key) {
            var hashId = this._hash(key);
            var bucket = this.buckets[hashId];
            if (TypeViz.IsUndefined(bucket)) {
                bucket = { key: key };
                this.buckets[hashId] = bucket;
                this.length++;
            }
            return bucket;
        };

        /**
        * Hashing of the given key.
        */
        HashTable.prototype._hash = function (key) {
            return TypeViz.Hash(key);
        };
        return HashTable;
    })();
    TypeViz.HashTable = HashTable;

    /**
    Base class for event emitters.
    */
    var Observable = (function () {
        function Observable() {
            this._events = {};
            this.preventDefault = true;
        }
        Observable.prototype.bind = function (eventName, handlers, one) {
            var that = this, idx, eventNames = typeof eventName === TypeViz.STRING ? [eventName] : eventName, length, original, handler, handlersIsFunction = typeof handlers === TypeViz.FUNCTION, events;

            if (handlers === undefined) {
                for (idx in eventName) {
                    that.bind(idx, eventName[idx]);
                }
                return that;
            }

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    if (one) {
                        original = handler;
                        handler = function () {
                            that.unbind(eventName, handler);
                            original.apply(that, arguments);
                        };
                    }
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.push(handler);
                }
            }

            return that;
        };

        Observable.prototype.one = function (eventNames, handlers) {
            return this.bind(eventNames, handlers, true);
        };

        Observable.prototype.first = function (eventName, handlers) {
            var that = this, idx, eventNames = typeof eventName === TypeViz.STRING ? [eventName] : eventName, length, handler, handlersIsFunction = typeof handlers === TypeViz.FUNCTION, events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.unshift(handler);
                }
            }

            return that;
        };

        Observable.prototype.trigger = function (eventName, e) {
            var that = this, events = that._events[eventName], idx, length;

            if (events) {
                e = e || {};

                e.sender = that;

                e._defaultPrevented = false;

                events = events.slice();

                for (idx = 0, length = events.length; idx < length; idx++) {
                    events[idx].call(that, e);
                }

                return e._defaultPrevented === true;
            }

            return false;
        };

        Observable.prototype.unbind = function (eventName, handler) {
            var that = this, events = that._events[eventName], idx;

            if (eventName === undefined) {
                that._events = {};
            } else if (events) {
                if (handler) {
                    for (idx = events.length - 1; idx >= 0; idx--) {
                        if (events[idx] === handler) {
                            events.splice(idx, 1);
                        }
                    }
                } else {
                    that._events[eventName] = [];
                }
            }

            return that;
        };
        return Observable;
    })();
    TypeViz.Observable = Observable;

    /*Queue structure*/
    var Queue = (function () {
        function Queue() {
            this.tail = null;
            this.head = null;
            this.length = 0;
        }
        /* Enqueues an object to the end of the queue.*/
        Queue.prototype.enqueue = function (value) {
            var entry = { value: value, next: null };
            if (!this.head) {
                this.head = entry;
                this.tail = this.head;
            } else {
                this.tail.next = entry;
                this.tail = this.tail.next;
            }
            this.length++;
        };

        /* Removes and returns the object at top of the queue.*/
        Queue.prototype.dequeue = function () {
            if (this.length < 1) {
                throw new Error("The queue is empty.");
            }
            var value = this.head.value;
            this.head = this.head.next;
            this.length--;
            return value;
        };

        /*Returns whether the given item is in the queue.*/
        Queue.prototype.Contains = function (item) {
            var current = this.head;
            while (current) {
                if (current.value === item) {
                    return true;
                }
                current = current.next;
            }
            return false;
        };
        return Queue;
    })();
    TypeViz.Queue = Queue;

    /**
    * While other data structures can have multiple times the same item a Set owns only
    * once a particular item.
    */
    var Set = (function () {
        function Set(resource) {
            var that = this;

            this.hashTable = new HashTable();
            this.length = 0;
            if (TypeViz.IsDefined(resource)) {
                if (resource instanceof HashTable) {
                    resource.ForEach(function (d) {
                        this.Add(d);
                    });
                } else if (resource instanceof Map) {
                    resource.ForEach(function (k, v) {
                        this.Add({ key: k, value: v });
                    }, this);
                }
            }
        }
        Set.prototype.Contains = function (item) {
            return this.hashTable.ContainsKey(item);
        };

        Set.prototype.Add = function (item) {
            var entry = this.hashTable.Get(item);
            if (!entry) {
                this.hashTable.Add(item, item);
                this.length++;
                //this.trigger('changed');
            }
        };

        Set.prototype.Get = function (item) {
            if (this.Contains(item)) {
                return this.hashTable.Get(item).value;
            } else {
                return null;
            }
        };

        /* Returns the hash of the item.*/
        Set.prototype.hash = function (item) {
            return this.hashTable.hash(item);
        };

        /* Removes the given item from the set. No exception is thrown if the item is not in the Set.*/
        Set.prototype.remove = function (item) {
            if (this.Contains(item)) {
                this.hashTable.remove(item);
                this.length--;
                //this.trigger('changed');
            }
        };

        /* Foreach with an iterator working on the key-value pairs.*/
        Set.prototype.ForEach = function (func, context) {
            this.hashTable.ForEach(function (kv) {
                func(kv.value);
            }, context);
        };

        Set.prototype.toArray = function () {
            var r = [];
            this.ForEach(function (d) {
                r.push(d);
            });
            return r;
        };
        return Set;
    })();
    TypeViz.Set = Set;

    /**
    * A dictionary structure.
    */
    var Map = (function (_super) {
        __extends(Map, _super);
        function Map(stuff) {
            _super.call(this);
            this.length = 0;
            var that = this;

            this.hashTable = new HashTable();
            this.length = 0;
            if (TypeViz.IsDefined(stuff)) {
                if (stuff instanceof Map) {
                    stuff.ForEach(function (k, v) {
                        this.Add(k, v);
                    }, this);
                } else if (stuff instanceof Array) {
                    throw "Need to do Array->Map still";
                } else {
                    for (var k in stuff) {
                        if (stuff.hasOwnProperty(k)) {
                            this.Add(k, stuff[k]);
                        }
                    }
                }
            }
        }
        Map.prototype.has = function (key) {
            return this.ContainsKey(key);
        };

        Map.prototype.Contains = function (key) {
            return this.has(key);
        };
        Map.prototype.ContainsKey = function (key) {
            return this.hashTable.ContainsKey(key);
        };
        Map.prototype.Get = function (key) {
            var entry = this.hashTable.Get(key);
            if (entry) {
                return entry.value;
            }
            throw new Error("Cannot find key " + key);
        };

        Map.prototype.Set = function (key, value) {
            this.Add(key, value);
        };
        Map.prototype.Add = function (key, value) {
            var entry = this.hashTable.Get(key);
            if (!entry) {
                entry = this.hashTable.Add(key);
                this.length++;
                this.trigger('changed');
            }
            entry.value = value;
        };
        Object.defineProperty(Map.prototype, "Count", {
            get: function () {
                return this.length;
            },
            enumerable: true,
            configurable: true
        });
        Map.prototype.remove = function (key) {
            if (this.ContainsKey(key)) {
                this.trigger("changed");
                this.length--;
                return this.hashTable.Remove(key);
            }
        };

        Map.prototype.keys = function () {
            var keys = [];
            this.ForEach(function (key) {
                keys.push(key);
            });
            return keys;
        };

        Map.prototype.values = function () {
            var values = [];
            this.ForEach(function (key, value) {
                values.push(value);
            });
            return values;
        };

        Map.prototype.entries = function () {
            var entries = [];
            this.ForEach(function (key, value) {
                entries.push({ key: key, value: value });
            });
            return entries;
        };

        Map.prototype.ForEach = function (f, ctx) {
            this.hashTable.ForEach(function (entry) {
                f.call(ctx || this, entry.key, entry.value);
            });
        };

        Map.prototype.forEachValue = function (f, ctx) {
            this.hashTable.ForEach(function (entry) {
                f.call(ctx || this, entry.value);
            });
        };
        return Map;
    })(TypeViz.Observable);
    TypeViz.Map = Map;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=Structures.js.map
