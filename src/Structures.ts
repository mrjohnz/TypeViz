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
module TypeViz {
    /*Generic node for a standard tree structure.*/
    export class TreeNode<TData> {
        private children: Array<TreeNode<TData>>;
        private parent: TreeNode<TData>;
        private data: TData;
        public Depth: number;
        public Title: string;
        public get Data(): TData { return this.data; }
        public set Data(value: TData) { this.data = value; }

        public get Children(): Array<TreeNode<TData>> {
            return this.children;
        }
        public get Parent(): TreeNode<TData> {
            return this.parent;
        }
        public set Parent(value: TreeNode<TData>) { this.parent = value; }

        constructor(data?: TData) {
            this.children = [];
            if (TypeViz.IsDefined(data)) {
                this.data = data;
            }
        }

        public get IsRoot(): boolean { return this.children.length === 0; }
        public Append(node: TreeNode<TData>) {
            if (TypeViz.IsUndefined(node)) throw "Cannot append a null node";
            this.children.push(node);
            node.Parent = this;
        }
        public static Flatten(g: TypeViz.Diagramming.Graph, root?) {
            if (g.IsEmpty) throw "Supplied an empty graph.";
            if (TypeViz.IsUndefined(root)) root = g.nodes[0];
            var rootNode = new TreeNode(root.data);
            var flatList = [rootNode];
            for (var i = 0; i < g.nodes.length; i++) {
                var n = g.nodes[i];
                if (n == root) continue;
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
        }
        public static FromGraph(g: TypeViz.Diagramming.Graph, root?) {
            if (g.IsEmpty) throw "Supplied an empty graph.";
            if (TypeViz.IsUndefined(root)) root = g.nodes[0];
            var tree = g.getSpanningTree(root);
            var rootNode;
            var flatList = [];
            var map = new TypeViz.Map();
            var acc = function (node, parent) {
                if (TypeViz.IsUndefined(parent)) {
                    rootNode = new TreeNode(node.data);
                    map.Set(node.id, rootNode);
                    flatList.push(rootNode);
                }
                else {
                    var pn = map.Get(parent.id);
                    if (TypeViz.IsUndefined(pn)) throw "Trouble in the Graph to Tree conversion.";
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
        }
    }

    /* The Point structure.*/
    export class Point {
        X: number;
        Y: number;

        constructor(x: number= 0, y: number= 0) {
            this.X = x;
            this.Y = y;
        }

        static FromArray(a: any[]): any {
            if (a[0] instanceof Array) { // array of point-array
                var points: Array<Point> = [];
                for (var i = 0; i < a.length; i++) {
                    points.push(new Point(a[i][0], a[i][1]));
                }
                return points;
            } else {
                return new Point(<number><Object>a[0], <number><Object>a[1]);
            }
        }

        /**
         * Turns a Point to a tuple.
         */
        static ToArray(p) {
            if (p instanceof Point) {
                return [p.X, p.Y];
            }
            else if (p instanceof Array) {

                if (p.length === 0) return p;
                if (p[0] instanceof Point) {
                    var points = [];
                    for (var i = 0; i < p.length; i++) {
                        points.push([p[i].X, p[i].Y]);
                    }
                    return points;
                }
                return p; //right format already
            }
            throw "Cannot convert type to an array.";
        }

        static get Empty() {
            return new Point(0, 0);
        }

        public Plus(p: Point): Point {
            return new Point(this.X + p.X, this.Y + p.Y);
        }

        public Minus(p: Point): Point {
            return new Point(this.X - p.X, this.Y - p.Y);
        }

        public Times(s: number): Point {
            return new Point(this.X * s, this.Y * s);
        }

        public Normalize(): Point {
            if (this.Length == 0) return Point.Empty;
            return this.Times(1 / this.Length);
        }

        public get Length(): number {
            return Maths.Sqrt(this.X * this.X + this.Y * this.Y);
        }

        public toString() {
            return "(" + this.X + "," + this.Y + ")";
        }

        public get LengthSquared(): number {
            return (this.X * this.X + this.Y * this.Y);
        }

        static MiddleOf(p: Point, q: Point) {
            return new Point(q.X - p.X, q.Y - p.Y).Times(0.5).Plus(p);
        }

        public ToPolar(useDegrees: boolean = false) {
            var factor = 1;
            if (useDegrees) factor = 180 / Maths.Pi;
            var a = Maths.Atan2(Maths.Abs(this.Y), Maths.Abs(this.X));
            var halfpi = Maths.Pi / 2;
            if (this.X == 0) {
                // note that the angle goes down and not the usual mathematical convention
                if (this.Y == 0) return new Polar(0, 0);
                if (this.Y > 0) return new Polar(this.Length, factor * halfpi);
                if (this.Y < 0) return new Polar(this.Length, factor * 3 * halfpi);
            }
            else if (this.X > 0) {
                if (this.Y == 0) return new Polar(this.Length, 0);
                if (this.Y > 0) return new Polar(this.Length, factor * a);
                if (this.Y < 0) return new Polar(this.Length, factor * (4 * halfpi - a));
            }
            else {
                if (this.Y == 0) return new Polar(this.Length, 2 * halfpi);
                if (this.Y > 0) return new Polar(this.Length, factor * (2 * halfpi - a));
                if (this.Y < 0) return new Polar(this.Length, factor * (2 * halfpi + a));
            }
        }
    }

    /* Defines a rectangular region.*/
    export class Rect {
        public X: number;
        public Y: number;
        public Width: number;
        public Height: number;

        /**
         * Instantiates a new rectangle.
         * @param x The horizontal coordinate of the upper-left corner.
         * @param y The vertical coordinate of the upper-left corner.
         * @param width The width of the rectangle.
         * @param height The height of the rectangle.
         */
        constructor(x: number = NaN, y: number = NaN, width: number = NaN, height: number = NaN) {
            this.X = x;
            this.Y = y;
            this.Width = width;
            this.Height = height;
        }

        /**
         * Determines whether the given point is contained inside this rectangle.
         */
        public Contains(point: Point) {
            if (isNaN(this.X) || isNaN(this.Y) || isNaN(this.Width) || isNaN(this.Height))
                return false;// throw "This rectangle is not fully specified and containment is hence undefined.";
            if (isNaN(point.X) || isNaN(point.Y))
                return false;//throw "The point is not fully specified (NaN) and containment is hence undefined.";
            return ((point.X >= this.X) && (point.X <= (this.X + this.Width)) && (point.Y >= this.Y) && (point.Y <= (this.Y + this.Height)));
        }

        /**
         * Inflates this rectangle with the given amount.
         * @param dx The horizontal inflation which is also the vertical one if the vertical inflation is not specified.
         * @param dy The vertical inflation.
         */
        public Inflate(dx: number, dy: number = null) {
            if (dy == null) dy = dx;
            this.X -= dx;
            this.Y -= dy;
            this.Width += dx + dx + 1;
            this.Height += dy + dy + 1;
            return this;
        }

        /**
         * Offsets this rectangle with the given amount.
         * @param dx The horizontal offset which is also the vertical one if the vertical offset is not specified.
         * @param dy The vertical offset.
         */
        public Offset(dx: number, dy: number = NaN) {
            if (isNaN(dy)) dy = dx;
            this.X += dx;
            this.Y += dy;
        }

        /**
         * Returns the union of the current rectangle with the given one.
         * @param r The rectangle to union with the current one.
         */
        public Union(r: Rect) {
            var x1 = Math.min(this.X, r.X);
            var y1 = Math.min(this.Y, r.Y);
            var x2 = Math.max((this.X + this.Width), (r.X + r.Width));
            var y2 = Math.max((this.Y + this.Height), (r.Y + r.Height));
            return new Rect(x1, y1, x2 - x1, y2 - y1);
        }

        /**
         * Get the upper-left corner position of this rectangle.
         */
        public get TopLeft(): Point {
            return new Point(this.X, this.Y);
        }

        public get Size(): TypeViz.Size {
            return new TypeViz.Size(this.Width, this.Height);
        }

        /**
         * Get the bottom-right corner position of this rectangle.
         */
        public get BottomRight() {
            return new Point(this.X + this.Width, this.Y + this.Height);
        }

        /**
         * Returns a clone of this rectangle.
         */
        public Clone(): Rect {
            return new Rect(this.X, this.Y, this.Width, this.Height);
        }

        static Create(x, y, w, h) {
            return new Rect(x, y, w, h);
        }

        static get Empty() {
            return new Rect(0, 0, 0, 0);
        }

        static FromPoints(p: Point, q: Point) {
            if (isNaN(p.X) || isNaN(p.Y) || isNaN(q.X) || isNaN(q.Y)) throw "Some values are NaN.";
            return new Rect(Math.min(p.X, q.X), Math.min(p.Y, q.Y), Math.abs(p.X - q.X), Math.abs(p.Y - q.Y));
        }
    }

    /* The Size structure.*/
    export class Size {
        Width: number;
        Height: number;

        constructor(width: number, height: number = null) {
            if (height == null) height = width;
            this.Width = width;
            this.Height = height;
        }

        static get Empty() {
            return new Size(0);
        }
    }

    /* Defines a polar coordinate.*/
    export class Polar {
        public Angle: number;
        public R: number;

        constructor(r: number = null, a: number = null) {
            this.R = r;
            this.Angle = a;
        }

        public static ToPoint(p: Polar): Point {
            return new Point(p.R * Maths.Cos(p.Angle), p.R * Maths.Sin(p.Angle));
        }

        public static FromPoint(p: Point): Polar {
            return new Polar(p.Length, Maths.Atan2(p.Y, p.X));
        }
    }

    /**
     * Represents a collection of key-value pairs that are organized based on the hash code of the key.
     * buckets[hashId] = {key: key, value:...}
     * Important: do not use the standard Array access method, use the get/set methods instead.
     * See http://en.wikipedia.org/wiki/Hash_table
     */
    export class HashTable {
        private buckets;
        public length;

        constructor() {
            this.buckets = [];
            this.length = 0;
        }

        /**
         * Adds the literal object with the given key (of the form {key: key,....}).
         */
        Add(key, value?) {

            var obj = this._createGetBucket(key);
            if (IsDefined(value)) {
                obj.value = value;
            }
            return obj;
        }

        /**
         * Gets the literal object with the given key.
         */
        Get(key) {
            if (this._bucketExists(key)) {
                return this._createGetBucket(key);
            }
            return null;
        }

        /**
         * Set the key-value pair.
         * @param key The key of the entry.
         * @param value The value to set. If the key already exists the value will be overwritten.
         */
        Set(key, value) {
            this.Add(key, value);
        }

        /**
         * Determines whether the HashTable contains a specific key.
         */
        ContainsKey(key) {
            return this._bucketExists(key);
        }

        /**
         * Removes the element with the specified key from the hashtable.
         * Returns the removed bucket.
         */
        Remove(key) {
            if (this._bucketExists(key)) {
                var hashId = this._hash(key);
                delete this.buckets[hashId];
                this.length--;
                return key;
            }
        }

        /**
         * Foreach with an iterator working on the key-value pairs.
         * @param func
         */
        ForEach(func) {
            var hashes = this._hashes();
            for (var i = 0, len = hashes.length; i < len; i++) {
                var hash = hashes[i];
                var bucket = this.buckets[hash];
                if (IsUndefined(bucket)) {
                    continue;
                }
                func(bucket);
            }
        }

        /**
         * Returns a (shallow) clone of the current HashTable.
         * @returns {HashTable}
         */
        Clone() {
            var ht = new HashTable();
            var hashes = this._hashes();
            for (var i = 0, len = hashes.length; i < len; i++) {
                var hash = hashes[i];
                var bucket = this.buckets[hash];
                if (IsUndefined(bucket)) {
                    continue;
                }
                ht.Add(bucket.key, bucket.value);
            }
            return ht;
        }

        /**
         * Returns the hashes of the buckets.
         * @returns {Array}
         * @private
         */
        _hashes() {
            var hashes = [];
            for (var hash in this.buckets) {
                if (this.buckets.hasOwnProperty(hash)) {
                    hashes.push(hash);
                }
            }
            return hashes;
        }

        _bucketExists(key) {
            var hashId = this._hash(key);
            return IsDefined(this.buckets[hashId]);
        }

        /**
         * Returns-adds the createGetBucket with the given key. If not present it will
         * be created and returned.
         * A createGetBucket is a literal object of the form {key: key, ...}.
         */
        _createGetBucket(key) {
            var hashId = this._hash(key);
            var bucket = this.buckets[hashId];
            if (IsUndefined(bucket)) {
                bucket = { key: key };
                this.buckets[hashId] = bucket;
                this.length++;
            }
            return bucket;
        }

        /**
         * Hashing of the given key.
         */
        _hash(key) {
            return TypeViz.Hash(key);
        }

    }

    /**
    Base class for event emitters.
    */
    export class Observable {
        private _events = {};
        private preventDefault = true;
        constructor() {
        }


        bind(eventName, handlers, one?) {
            var that = this,
                idx,
                eventNames = typeof eventName === STRING ? [eventName] : eventName,
                length,
                original,
                handler,
                handlersIsFunction = typeof handlers === FUNCTION,
                events;

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
        }

        one(eventNames, handlers) {
            return this.bind(eventNames, handlers, true);
        }

        first(eventName, handlers) {
            var that = this,
                idx,
                eventNames = typeof eventName === STRING ? [eventName] : eventName,
                length,
                handler,
                handlersIsFunction = typeof handlers === FUNCTION,
                events;

            for (idx = 0, length = eventNames.length; idx < length; idx++) {
                eventName = eventNames[idx];

                handler = handlersIsFunction ? handlers : handlers[eventName];

                if (handler) {
                    events = that._events[eventName] = that._events[eventName] || [];
                    events.unshift(handler);
                }
            }

            return that;
        }

        trigger(eventName, e?) {
            var that = this,
                events = that._events[eventName],
                idx,
                length;

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
        }

        unbind(eventName, handler) {
            var that = this,
                events = that._events[eventName],
                idx;

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
        }
    }


    /*Queue structure*/
    export class Queue {
        private tail;
        private head;
        public length;
        constructor() {
            this.tail = null;
            this.head = null;
            this.length = 0;
        }

        /* Enqueues an object to the end of the queue.*/
        enqueue(value) {
            var entry = { value: value, next: null };
            if (!this.head) {
                this.head = entry;
                this.tail = this.head;
            }
            else {
                this.tail.next = entry;
                this.tail = this.tail.next;
            }
            this.length++;
        }

        /* Removes and returns the object at top of the queue.*/
        dequeue() {
            if (this.length < 1) {
                throw new Error("The queue is empty.");
            }
            var value = this.head.value;
            this.head = this.head.next;
            this.length--;
            return value;
        }

        /*Returns whether the given item is in the queue.*/
        Contains(item) {
            var current = this.head;
            while (current) {
                if (current.value === item) {
                    return true;
                }
                current = current.next;
            }
            return false;
        }
    }

    /**
     * While other data structures can have multiple times the same item a Set owns only
     * once a particular item.
     */
    export class Set {

        private hashTable;
        private length;
        constructor(resource?) {

            var that = this;

            this.hashTable = new HashTable();
            this.length = 0;
            if (TypeViz.IsDefined(resource)) {
                if (resource instanceof HashTable) {
                    resource.ForEach(function (d) {
                        this.Add(d);
                    });
                }
                else if (resource instanceof Map) {
                    resource.ForEach(function (k, v) {
                        this.Add({ key: k, value: v });
                    }, this);
                }
            }
        }

        Contains(item) {
            return this.hashTable.ContainsKey(item);
        }

        Add(item) {
            var entry = this.hashTable.Get(item);
            if (!entry) {
                this.hashTable.Add(item, item);
                this.length++;
                //this.trigger('changed');
            }
        }

        Get(item) {
            if (this.Contains(item)) {
                return this.hashTable.Get(item).value;
            }
            else {
                return null;
            }
        }

        /* Returns the hash of the item.*/
        hash(item) {
            return this.hashTable.hash(item);
        }

        /* Removes the given item from the set. No exception is thrown if the item is not in the Set.*/
        remove(item) {
            if (this.Contains(item)) {
                this.hashTable.remove(item);
                this.length--;
                //this.trigger('changed');
            }
        }

        /* Foreach with an iterator working on the key-value pairs.*/
        ForEach(func, context?) {
            this.hashTable.ForEach(kv => { func(kv.value); }, context);
        }

        toArray() {
            var r = [];
            this.ForEach(d => { r.push(d); });
            return r;
        }
    }

    /**
     * A dictionary structure.
     */
    export class Map extends TypeViz.Observable {
        private hashTable: HashTable;

        public length = 0;
        constructor(array: Array<Object>);
        constructor(map: Map);
        constructor(map: Object);
        constructor();
        constructor(stuff?) {
            super();
            var that = this;

            this.hashTable = new HashTable();
            this.length = 0;
            if (TypeViz.IsDefined(stuff)) {
                if (stuff instanceof Map) {
                    (<Map>stuff).ForEach(function (k, v) {
                        this.Add(k, v);
                    }, this);
                }
                else if (stuff instanceof Array) {
                    /* (<Array<Object>>stuff).ForEach(function (k) {
                         this.Add(k, v);
                     }, this);*/
                    throw "Need to do Array->Map still";
                }
                else {
                    for (var k in stuff) {
                        if (stuff.hasOwnProperty(k)) {
                            this.Add(k, stuff[k]);
                        }
                    }
                }
            }
        }

        has(key) {
            return this.ContainsKey(key);
        }

        Contains(key) {
            return this.has(key);
        }
        ContainsKey(key) {
            return this.hashTable.ContainsKey(key);
        }
        Get(key) {
            var entry = this.hashTable.Get(key);
            if (entry) {
                return entry.value;
            }
            throw new Error("Cannot find key " + key);
        }

        Set(key, value) {
            this.Add(key, value);
        }
        Add(key, value) {
            var entry = this.hashTable.Get(key);
            if (!entry) {
                entry = this.hashTable.Add(key);
                this.length++;
                this.trigger('changed');
            }
            entry.value = value;
        }
        public get Count() { return this.length; }
        remove(key) {
            if (this.ContainsKey(key)) {
                this.trigger("changed");
                this.length--;
                return this.hashTable.Remove(key);
            }
        }

        keys() {
            var keys = [];
            this.ForEach(key => {keys.push(key);});
            return keys;
        }

        values() {
            var values = [];
            this.ForEach((key, value) => {values.push(value);});
            return values;
        }

        entries() {
            var entries = [];
            this.ForEach((key, value) => {entries.push({ key: key, value: value });});
            return entries;
        }

        ForEach(f, ctx?) {
            this.hashTable.ForEach(function (entry) {
                f.call(ctx || this, entry.key, entry.value);
            });
        }

        forEachValue(f, ctx?) {
            this.hashTable.ForEach(function (entry) {
                f.call(ctx || this, entry.value);
            });
        }
    }

}