var TypeViz;
(function (TypeViz) {
    TypeViz.FUNCTION = "function";
    TypeViz.STRING = "string";
    TypeViz.VERSION = "0.1";

    function Camelize(s) {
        var oStringList = s.split('-');
        if (oStringList.length == 1)
            return oStringList[0];

        var camelizedString = s.indexOf('-') == 0 ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1) : oStringList[0];

        for (var i = 1, len = oStringList.length; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    }
    TypeViz.Camelize = Camelize;

    function IsUndefined(obj) {
        return (typeof obj === 'undefined') || obj == null;
    }
    TypeViz.IsUndefined = IsUndefined;
    ;

    function IsLiteral(obj) {
        var _test = obj;
        return (typeof obj !== 'object' || obj === null ? false : ((function () {
            while (true) {
                if (Object.getPrototypeOf(_test = Object.getPrototypeOf(_test)) === null) {
                    break;
                }
            }
            return Object.getPrototypeOf(obj) === _test;
        })()));
    }
    TypeViz.IsLiteral = IsLiteral;
    ;

    function Functor(v) {
        return typeof v === "function" ? v : function (d) {
            return v;
        };
    }
    TypeViz.Functor = Functor;

    function ModelFunctor(v) {
        return typeof v === "function" ? v : function (d) {
            return v;
        };
    }
    TypeViz.ModelFunctor = ModelFunctor;

    function LimitValue(value, minimum, maximum) {
        if (typeof minimum === "undefined") { minimum = 0; }
        if (typeof maximum === "undefined") { maximum = 1; }
        if (value >= maximum)
            value = maximum;
        if (value <= minimum)
            value = minimum;
        return value;
    }
    TypeViz.LimitValue = LimitValue;

    function Identity(x) {
        return x;
    }
    TypeViz.Identity = Identity;

    function TrueFunction() {
        return true;
    }
    TypeViz.TrueFunction = TrueFunction;

    function AscendingComparer(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }
    TypeViz.AscendingComparer = AscendingComparer;

    function BiSort(a, b, sortfunc) {
        if (TypeViz.IsUndefined(a)) {
            throw "First array is not specified.";
        }
        if (TypeViz.IsUndefined(b)) {
            throw "Second array is not specified.";
        }
        if (a.length != b.length) {
            throw "The two arrays should have equal length";
        }

        var all = [];

        var sort_by = function (field, reverse, primer) {
            var key = function (x) {
                return primer ? primer(x[field]) : x[field];
            };

            return function (a, b) {
                var A = key(a), B = key(b);
                return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
            };
        };

        for (var i = 0; i < a.length; i++) {
            all.push({ 'x': a[i], 'y': b[i] });
        }
        if (TypeViz.IsUndefined(sortfunc)) {
            all.sort(function (m, n) {
                return m.x - n.x;
            });
        } else {
            all.sort(function (m, n) {
                return sortfunc(m.x, n.x);
            });
        }

        a.Clear();
        b.Clear();

        for (var i = 0; i < all.length; i++) {
            a.push(all[i].x);
            b.push(all[i].y);
        }
    }
    TypeViz.BiSort = BiSort;
    ;

    function rebind(target, source) {
        var stuff = [];
        for (var _i = 0; _i < (arguments.length - 2); _i++) {
            stuff[_i] = arguments[_i + 2];
        }
        var i = -1, n = stuff.length, method;
        while (++i < n)
            target[method = stuff[i]] = rebindMethod(target, source, source[method]);
        return target;
    }
    TypeViz.rebind = rebind;

    function rebindMethod(target, source, method) {
        return function () {
            var methodResult = method.apply(source, arguments);
            return methodResult === source ? target : methodResult;
        };
    }
    TypeViz.rebindMethod = rebindMethod;

    function DescendingComparer(a, b) {
        return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    }
    TypeViz.DescendingComparer = DescendingComparer;

    function IsDefined(obj) {
        return !(typeof obj === 'undefined') && obj !== null;
    }
    TypeViz.IsDefined = IsDefined;
    ;

    function IsArray(obj) {
        return obj instanceof Array;
    }
    TypeViz.IsArray = IsArray;
    ;

    function IsString(obj) {
        return (typeof obj) === "string";
    }
    TypeViz.IsString = IsString;
    ;

    function IsObject(obj) {
        return obj === Object(obj);
    }
    TypeViz.IsObject = IsObject;
    ;

    function IsNumber(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }
    TypeViz.IsNumber = IsNumber;

    function IsColor(obj) {
        return obj instanceof TypeViz.Media.Color;
    }
    TypeViz.IsColor = IsColor;
    ;

    function IsGradient(obj) {
        return (obj instanceof TypeViz.Media.LinearGradient) || (obj instanceof TypeViz.Media.RadialGradient);
    }
    TypeViz.IsGradient = IsGradient;
    ;

    function IsRadialGradient(obj) {
        return (obj instanceof TypeViz.Media.RadialGradient);
    }
    TypeViz.IsRadialGradient = IsRadialGradient;
    ;

    function IsLinearGradient(obj) {
        return (obj instanceof TypeViz.Media.LinearGradient);
    }
    TypeViz.IsLinearGradient = IsLinearGradient;
    ;

    function IsFunction(obj) {
        return obj instanceof Function;
    }
    TypeViz.IsFunction = IsFunction;
    ;

    function IsArguments(obj) {
        return !!(obj && obj.HasProperty("callee"));
    }
    TypeViz.IsArguments = IsArguments;
    ;

    function IsInteger(obj) {
        return IsNumber(obj) && obj % 1 === 0;
    }
    TypeViz.IsInteger = IsInteger;
    ;

    function round(x, n) {
        return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
    }
    TypeViz.round = round;

    function deepExtend(destination) {
        var extenders = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            extenders[_i] = arguments[_i + 1];
        }
        var length = extenders.length;

        for (var i = 0; i < length; i++) {
            deepExtendOne(destination, extenders[i]);
        }

        return destination;
    }
    TypeViz.deepExtend = deepExtend;

    function deepExtendOne(destination, source) {
        var property, propValue, propType, destProp;

        for (property in source) {
            propValue = source[property];
            propType = typeof propValue;
            if (propType === "object" && propValue !== null && propValue.constructor !== Array) {
                if (propValue instanceof Date) {
                    destination[property] = new Date(propValue.getTime());
                } else if (IsFunction(propValue.clone)) {
                    destination[property] = propValue.clone();
                } else {
                    destProp = destination[property];
                    if (typeof (destProp) === "object") {
                        destination[property] = destProp || {};
                    } else {
                        destination[property] = {};
                    }
                    deepExtendOne(destination[property], propValue);
                }
            } else if (propType !== "undefined") {
                destination[property] = propValue;
            }
        }

        return destination;
    }
    TypeViz.deepExtendOne = deepExtendOne;

    function hashString(s) {
        var result = 0;
        if (s.length == 0) {
            return result;
        }
        for (var i = 0; i < s.length; i++) {
            var ch = s.charCodeAt(i);
            result = ((result << 5) - result) + ch;
            result = result & result;
        }
        return result;
    }

    function RandomId(length) {
        if (IsUndefined(length)) {
            length = 10;
        }

        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    }
    TypeViz.RandomId = RandomId;

    function Hash(key) {
        if (IsUndefined(key))
            return null;
        if (IsNumber(key)) {
            return key & key;
        }
        if (IsString(key)) {
            return hashString(key);
        }
        if (IsObject(key)) {
            var id = key.__hashId;
            if (IsUndefined(id)) {
                id = TypeViz.RandomId();
                key.__hashId = id;
            }
            return id;
        }
        throw "Unsupported key type.";
    }
    TypeViz.Hash = Hash;

    function MergeOptions(defaultOptions, givenOptions) {
        if (givenOptions == null)
            return defaultOptions;
        var r = {};
        for (var n in defaultOptions) {
            r[n] = givenOptions[n] != null ? givenOptions[n] : defaultOptions[n];
        }
        return r;
    }
    TypeViz.MergeOptions = MergeOptions;

    function GetSVGRoot() {
        return document.getElementsByTagName('svg')[0];
    }
    TypeViz.GetSVGRoot = GetSVGRoot;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    (function (Arrays) {
        function InterpolateArrays(a, b) {
            var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
            for (i = 0; i < n0; ++i)
                x.push(TypeViz.Maths.Lerp(a[i], b[i]));
            for (; i < na; ++i)
                c[i] = a[i];
            for (; i < nb; ++i)
                c[i] = b[i];
            return function (t) {
                for (i = 0; i < n0; ++i)
                    c[i] = x[i](t);
                return c;
            };
        }
        Arrays.InterpolateArrays = InterpolateArrays;

        function Take(array, fromOrAmount, to) {
            if (typeof to === "undefined") { to = null; }
            return array.Take(fromOrAmount, to);
        }
        Arrays.Take = Take;

        function Entries(map) {
            var entries = [];
            for (var key in map)
                entries.push({ key: key, value: map[key] });
            return entries;
        }
        Arrays.Entries = Entries;

        function Keys(map) {
            var keys = [];
            for (var key in map)
                keys.push(key);
            return keys;
        }
        Arrays.Keys = Keys;

        function Bisector(f) {
            if (TypeViz.IsUndefined(f))
                f = TypeViz.Identity;
            return {
                Left: function (a, x, lo, hi) {
                    if (lo == null)
                        lo = 0;
                    if (hi == null)
                        hi = a.length;
                    while (lo < hi) {
                        var mid = lo + hi >>> 1;
                        if (f.call(a, a[mid], mid) < x)
                            lo = mid + 1;
                        else
                            hi = mid;
                    }
                    return lo;
                },
                Right: function (a, x, lo, hi) {
                    if (lo == null)
                        lo = 0;
                    if (hi == null)
                        hi = a.length;
                    while (lo < hi) {
                        var mid = lo + hi >>> 1;
                        if (x < f.call(a, a[mid], mid))
                            hi = mid;
                        else
                            lo = mid + 1;
                    }
                    return lo;
                }
            };
        }
        Arrays.Bisector = Bisector;

        Arrays.Bisect = Bisector().Right;
        Arrays.BisectRight = Arrays.Bisect;
        Arrays.BisectLeft = Bisector().Left;
    })(TypeViz.Arrays || (TypeViz.Arrays = {}));
    var Arrays = TypeViz.Arrays;
})(TypeViz || (TypeViz = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeViz;
(function (TypeViz) {
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

    var Rect = (function () {
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
        Rect.prototype.Contains = function (point) {
            if (isNaN(this.X) || isNaN(this.Y) || isNaN(this.Width) || isNaN(this.Height))
                return false;
            if (isNaN(point.X) || isNaN(point.Y))
                return false;
            return ((point.X >= this.X) && (point.X <= (this.X + this.Width)) && (point.Y >= this.Y) && (point.Y <= (this.Y + this.Height)));
        };

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

        Rect.prototype.Offset = function (dx, dy) {
            if (typeof dy === "undefined") { dy = NaN; }
            if (isNaN(dy))
                dy = dx;
            this.X += dx;
            this.Y += dy;
        };

        Rect.prototype.Union = function (r) {
            var x1 = Math.min(this.X, r.X);
            var y1 = Math.min(this.Y, r.Y);
            var x2 = Math.max((this.X + this.Width), (r.X + r.Width));
            var y2 = Math.max((this.Y + this.Height), (r.Y + r.Height));
            return new Rect(x1, y1, x2 - x1, y2 - y1);
        };

        Object.defineProperty(Rect.prototype, "TopLeft", {
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
            get: function () {
                return new Point(this.X + this.Width, this.Y + this.Height);
            },
            enumerable: true,
            configurable: true
        });

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

    var HashTable = (function () {
        function HashTable() {
            this.buckets = [];
            this.length = 0;
        }
        HashTable.prototype.Add = function (key, value) {
            var obj = this._createGetBucket(key);
            if (TypeViz.IsDefined(value)) {
                obj.value = value;
            }
            return obj;
        };

        HashTable.prototype.Get = function (key) {
            if (this._bucketExists(key)) {
                return this._createGetBucket(key);
            }
            return null;
        };

        HashTable.prototype.Set = function (key, value) {
            this.Add(key, value);
        };

        HashTable.prototype.ContainsKey = function (key) {
            return this._bucketExists(key);
        };

        HashTable.prototype.Remove = function (key) {
            if (this._bucketExists(key)) {
                var hashId = this._hash(key);
                delete this.buckets[hashId];
                this.length--;
                return key;
            }
        };

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

        HashTable.prototype._hash = function (key) {
            return TypeViz.Hash(key);
        };
        return HashTable;
    })();
    TypeViz.HashTable = HashTable;

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

    var Queue = (function () {
        function Queue() {
            this.tail = null;
            this.head = null;
            this.length = 0;
        }
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

        Queue.prototype.dequeue = function () {
            if (this.length < 1) {
                throw new Error("The queue is empty.");
            }
            var value = this.head.value;
            this.head = this.head.next;
            this.length--;
            return value;
        };

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
            }
        };

        Set.prototype.Get = function (item) {
            if (this.Contains(item)) {
                return this.hashTable.Get(item).value;
            } else {
                return null;
            }
        };

        Set.prototype.hash = function (item) {
            return this.hashTable.hash(item);
        };

        Set.prototype.remove = function (item) {
            if (this.Contains(item)) {
                this.hashTable.remove(item);
                this.length--;
            }
        };

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
var TypeViz;
(function (TypeViz) {
    var Point = TypeViz.Point;

    (function (Media) {
        (function (RadialGradientSpreadMethod) {
            RadialGradientSpreadMethod[RadialGradientSpreadMethod["Pad"] = 0] = "Pad";
            RadialGradientSpreadMethod[RadialGradientSpreadMethod["Reflect"] = 1] = "Reflect";
            RadialGradientSpreadMethod[RadialGradientSpreadMethod["Repeat"] = 2] = "Repeat";
        })(Media.RadialGradientSpreadMethod || (Media.RadialGradientSpreadMethod = {}));
        var RadialGradientSpreadMethod = Media.RadialGradientSpreadMethod;

        var GradientBase = (function () {
            function GradientBase() {
                this.stops = [];
            }
            Object.defineProperty(GradientBase.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(GradientBase.prototype, "Id", {
                get: function () {
                    return this.Native == null ? null : this.Native.id;
                },
                set: function (value) {
                    this.Native.id = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(GradientBase.prototype, "GradientStops", {
                get: function () {
                    return this.stops;
                },
                enumerable: true,
                configurable: true
            });

            GradientBase.prototype.AddGradientStop = function (stop) {
                if (stop == null)
                    throw "The given GradientStop is null.";
                this.stops.push(stop);
                this.Native.appendChild(stop.Native);
            };

            GradientBase.prototype.AddGradientStops = function () {
                var stops = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    stops[_i] = arguments[_i + 0];
                }
                if (stops == null)
                    return;
                for (var i = 0; i < stops.length; i++) {
                    this.AddGradientStop(stops[i]);
                }
            };

            GradientBase.prototype.RemoveGradientStop = function (stop) {
                if (stop == null)
                    throw "The given GradientStop is null.";
                if (!this.stops.Contains(stop))
                    return;
                this.stops.Remove(stop);
                this.Native.removeChild(stop.Native);
            };

            GradientBase.prototype.ClearStops = function () {
                this.stops.Clear();
                while (this.Native.childNodes.length > 0) {
                    this.Native.removeChild(this.Native.childNodes[0]);
                }
            };

            GradientBase.prototype.Reverse = function () {
                var mem = [];
                for (var j = 0; j < this.stops.length; j++) {
                    var stop = this.stops[this.stops.length - 1 - j];
                    stop.Offset = 1 - stop.Offset;
                    mem.push(stop);
                }
                this.ClearStops();
                for (var i = 0; i < mem.length; i++) {
                    this.AddGradientStop(mem[i]);
                }
                return this;
            };
            return GradientBase;
        })();
        Media.GradientBase = GradientBase;

        var RadialGradient = (function (_super) {
            __extends(RadialGradient, _super);
            function RadialGradient() {
                _super.call(this);
                this.nativeElement = document.createElementNS(TypeViz.SVG.NS, "radialGradient");
                this.Id = TypeViz.RandomId();
                this.Center = new TypeViz.Point(0.5, 0.5);
            }
            Object.defineProperty(RadialGradient.prototype, "Center", {
                get: function () {
                    var cx = this.Native.getAttribute("cx") ? parseFloat(this.Native.getAttribute("cx")) : 0;
                    var cy = this.Native.getAttribute("cy") ? parseFloat(this.Native.getAttribute("cy")) : 0;
                    return new Point(cx, cy);
                },
                set: function (value) {
                    this.Native.setAttribute("cx", this.truncatedValue(value.X));
                    this.Native.setAttribute("cy", this.truncatedValue(value.Y));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RadialGradient.prototype, "Radius", {
                get: function () {
                    return this.Native.getAttribute("r") ? parseFloat(this.Native.getAttribute("r")) : 0;
                },
                set: function (value) {
                    this.Native.setAttribute("r", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RadialGradient.prototype, "SpreadMethod", {
                get: function () {
                    return this.Native.getAttribute("spreadMethod") ? this.toSpreadEnum(this.Native.getAttribute("spreadMethod")) : 0 /* Pad */;
                },
                set: function (value) {
                    this.Native.setAttribute("spreadMethod", this.toSpreadString(value));
                },
                enumerable: true,
                configurable: true
            });


            RadialGradient.prototype.truncatedValue = function (value) {
                return Math.max(0, Math.min(1, value)).toString();
            };

            RadialGradient.prototype.toSpreadEnum = function (method) {
                switch (method.toLowerCase()) {
                    case "pad":
                        return 0 /* Pad */;
                    case "reflect":
                        return 1 /* Reflect */;
                    case "repeat":
                        return 2 /* Repeat */;
                }
            };

            RadialGradient.prototype.toSpreadString = function (method) {
                switch (method) {
                    case 0 /* Pad */:
                        return "pad";
                    case 1 /* Reflect */:
                        return "reflect";
                    case 2 /* Repeat */:
                        return "repeat";
                }
            };
            return RadialGradient;
        })(GradientBase);
        Media.RadialGradient = RadialGradient;

        var LinearGradient = (function (_super) {
            __extends(LinearGradient, _super);
            function LinearGradient(canvas, from, to) {
                if (typeof canvas === "undefined") { canvas = null; }
                if (typeof from === "undefined") { from = null; }
                if (typeof to === "undefined") { to = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(TypeViz.SVG.NS, "linearGradient");
                this.canvas = canvas;
                this.from = from;
                this.to = to;
                this.Id = TypeViz.RandomId();
            }
            Object.defineProperty(LinearGradient.prototype, "From", {
                get: function () {
                    return this.from;
                },
                set: function (value) {
                    if (this.from != value) {
                        this.Native.setAttribute("x1", (value.X * 100).toString() + "%");
                        this.Native.setAttribute("y1", (value.Y * 100).toString() + "%");
                        this.from = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(LinearGradient.prototype, "To", {
                get: function () {
                    return this.to;
                },
                set: function (value) {
                    if (this.to != value) {
                        this.Native.setAttribute("x2", (value.X * 100).toString() + "%");
                        this.Native.setAttribute("y2", (value.Y * 100).toString() + "%");
                        this.to = value;
                    }
                },
                enumerable: true,
                configurable: true
            });

            return LinearGradient;
        })(GradientBase);
        Media.LinearGradient = LinearGradient;

        var GradientStop = (function () {
            function GradientStop(color, offset) {
                if (typeof color === "undefined") { color = null; }
                if (typeof offset === "undefined") { offset = null; }
                this.nativeElement = document.createElementNS(TypeViz.SVG.NS, "stop");
                this.color = Colors.White;
                if (color == null)
                    this.Color = Colors.White;
                else
                    this.Color = color;

                if (offset == null)
                    this.Offset = 0.0;
                else
                    this.Offset = TypeViz.LimitValue(offset);
            }
            Object.defineProperty(GradientStop.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(GradientStop.prototype, "Offset", {
                get: function () {
                    if (this.nativeElement.attributes["offset"] == null)
                        return 0.0;
                    return parseFloat(this.nativeElement.attributes["offset"].value) / 100.0;
                },
                set: function (value) {
                    if (value < 0 || value > 1)
                        throw "The Offset of the gradient stop should be in the [0,1] interval.";
                    this.Native.setAttribute("offset", (value * 100.0).toString() + "%");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(GradientStop.prototype, "Color", {
                get: function () {
                    return this.color;
                },
                set: function (value) {
                    if (value == null)
                        throw "The color cannot be null.";
                    this.color = value;
                    this.Native.style.stopColor = value.AsCSS1Color;
                    this.Native.style.stopOpacity = value.A == null ? "1.0" : value.A.toString();
                },
                enumerable: true,
                configurable: true
            });

            return GradientStop;
        })();
        Media.GradientStop = GradientStop;

        var RGB = (function () {
            function RGB(r, g, b) {
                this.R = r;
                this.G = g;
                this.B = b;
            }
            RGB.prototype.Darker = function (k) {
                if (!k)
                    k = 0.2;
                k = Math.pow(.7, k);
                return new RGB(~~(k * this.R), ~~(k * this.G), ~~(k * this.B));
            };

            RGB.prototype.Brighter = function (k) {
                if (!k)
                    k = 0.2;
                k = Math.pow(.7, k);
                var r = this.R, g = this.G, b = this.B, i = 30;
                if (!r && !g && !b)
                    return new RGB(i, i, i);
                if (r && r < i)
                    r = i;
                if (g && g < i)
                    g = i;
                if (b && b < i)
                    b = i;
                return new RGB(Math.min(255, ~~(r / k)), Math.min(255, ~~(g / k)), Math.min(255, ~~(b / k)));
            };

            Object.defineProperty(RGB.prototype, "AsHSL", {
                get: function () {
                    return ColorConverters.RGB2HSL(this);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RGB.prototype, "AsHex6", {
                get: function () {
                    return (new Color(this)).AsHex6;
                },
                enumerable: true,
                configurable: true
            });

            RGB.prototype.toString = function () {
                return "rgb(" + this.R + ", " + this.G + ", " + this.B + ")";
            };
            return RGB;
        })();
        Media.RGB = RGB;

        var HSL = (function () {
            function HSL(h, s, l) {
                this.H = h;
                this.S = s;
                this.L = l;
            }
            HSL.prototype.Brighter = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new HSL(this.H, this.S, this.L / k);
            };

            HSL.prototype.Darker = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new HSL(this.H, this.S, k * this.L);
            };

            Object.defineProperty(HSL.prototype, "AsRGB", {
                get: function () {
                    return ColorConverters.HSL2RGB(this);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(HSL.prototype, "AsHex6", {
                get: function () {
                    return (new Color(this)).AsHex6;
                },
                enumerable: true,
                configurable: true
            });
            HSL.prototype.toString = function () {
                return "hsl(" + this.H + ", " + this.S + ", " + this.L + ")";
            };
            return HSL;
        })();
        Media.HSL = HSL;

        var Color = (function () {
            function Color(r, g, b, a) {
                if (typeof r === "undefined") { r = null; }
                if (typeof g === "undefined") { g = null; }
                if (typeof b === "undefined") { b = null; }
                if (typeof a === "undefined") { a = null; }
                this.r = 0.0;
                this.g = 0.0;
                this.b = 0.0;
                this.a = 1.0;
                if (r == null)
                    return;
                if (TypeViz.IsString(r)) {
                    var s = r;
                    if (s.substring(0, 1) == "#")
                        s = s.substr(1);

                    var known = Colors.Parse(s.toLowerCase());
                    if (known != null) {
                        this.r = known.R;
                        this.g = known.G;
                        this.b = known.B;
                        return;
                    }
                    var c = Color.Parse(s.toUpperCase());
                    if (c != null) {
                        this.r = c.R;
                        this.g = c.G;
                        this.b = c.B;
                        return;
                    } else
                        throw "The string '" + r + "' could not be converted to a color value.";
                } else if (TypeViz.IsNumber(r)) {
                    this.r = parseFloat(r);
                    this.g = g;
                    this.b = b;
                    if (a != null)
                        this.a = a;
                    this.FixValues();
                } else if (r instanceof RGB) {
                    this.r = r.R;
                    this.g = r.G;
                    this.b = r.B;
                } else if (r instanceof HSL) {
                    var rgb = r.AsRGB;
                    this.r = rgb.R;
                    this.g = rgb.G;
                    this.b = rgb.B;
                }
            }
            Object.defineProperty(Color.prototype, "R", {
                get: function () {
                    return this.r;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "G", {
                get: function () {
                    return this.g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "B", {
                get: function () {
                    return this.b;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "A", {
                get: function () {
                    return this.a;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "RGB", {
                get: function () {
                    return new RGB(this.r, this.g, this.b);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "HSL", {
                get: function () {
                    return this.RGB.AsHSL;
                },
                enumerable: true,
                configurable: true
            });

            Color.prototype.Brighter = function (k) {
                var rgb = new RGB(this.r, this.g, this.b);
                rgb = rgb.Brighter(k);
                this.r = rgb.R;
                this.g = rgb.G;
                this.b = rgb.B;
                return this;
            };

            Color.prototype.Darker = function (k) {
                var rgb = new RGB(this.r, this.g, this.b);
                rgb = rgb.Darker(k);
                this.r = rgb.R;
                this.g = rgb.G;
                this.b = rgb.B;
                return this;
            };

            Color.Parse = function (s) {
                if (s == null || s.length == 0)
                    throw "Empty string";
                s = s.trim();
                var defs = ColorConverters.All;
                for (var i = 0; i < defs.length; i++) {
                    var re = new RegExp(defs[i].RegEx);
                    var processor = defs[i].Parse;
                    var bits = re.exec(s);
                    if (bits) {
                        var channels = processor(bits);
                        return new Color(channels[0], channels[1], channels[2]);
                    }
                }
            };

            Object.defineProperty(Color.prototype, "AsCSS1", {
                get: function () {
                    return 'fill:rgb(' + this.R + ', ' + this.G + ', ' + this.B + '); fill-opacity:' + this.a + ';';
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "AsCSS1Color", {
                get: function () {
                    return 'rgb(' + this.R + ', ' + this.G + ', ' + this.B + ')';
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "AsCSS3", {
                get: function () {
                    return 'fill:rgba(' + this.R + ', ' + this.G + ', ' + this.B + ', ' + this.a + ')';
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "AsHex6", {
                get: function () {
                    return ColorConverters.RgbToHex(this.r, this.g, this.b).toUpperCase();
                },
                enumerable: true,
                configurable: true
            });

            Color.prototype.FixValues = function () {
                this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
                this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
                this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
                this.a = (this.a < 0 || isNaN(this.a)) ? 0 : ((this.a > 255) ? 255 : this.a);
            };
            return Color;
        })();
        Media.Color = Color;

        var ColorConverters = (function () {
            function ColorConverters() {
            }
            Object.defineProperty(ColorConverters, "All", {
                get: function () {
                    return [ColorConverters.HEX6, ColorConverters.HEX3, ColorConverters.RGB];
                },
                enumerable: true,
                configurable: true
            });

            ColorConverters.componentToHex = function (c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            };

            ColorConverters.RgbToHex = function (r, g, b) {
                return "#" + ColorConverters.componentToHex(r) + ColorConverters.componentToHex(g) + ColorConverters.componentToHex(b);
            };

            Object.defineProperty(ColorConverters, "HEX6", {
                get: function () {
                    return {
                        RegEx: "^(\\w{2})(\\w{2})(\\w{2})$",
                        Parse: function (bits) {
                            return [
                                parseInt(bits[1], 16),
                                parseInt(bits[2], 16),
                                parseInt(bits[3], 16)
                            ];
                        }
                    };
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ColorConverters, "HEX3", {
                get: function () {
                    return {
                        RegEx: "^(\\w{1})(\\w{1})(\\w{1})$",
                        Parse: function (bits) {
                            return [
                                parseInt(bits[1] + bits[1], 16),
                                parseInt(bits[2] + bits[2], 16),
                                parseInt(bits[3] + bits[3], 16)
                            ];
                        }
                    };
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ColorConverters, "RGB", {
                get: function () {
                    return {
                        RegEx: "^rgb\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\)$",
                        Parse: function (bits) {
                            return [
                                parseInt(bits[1]),
                                parseInt(bits[2]),
                                parseInt(bits[3])
                            ];
                        }
                    };
                },
                enumerable: true,
                configurable: true
            });

            ColorConverters.RGB2HSL = function (rgb) {
                var r = rgb.R, g = rgb.G, b = rgb.B;
                var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
                if (d) {
                    s = l < .5 ? d / (max + min) : d / (2 - max - min);
                    if (r == max)
                        h = (g - b) / d + (g < b ? 6 : 0);
                    else if (g == max)
                        h = (b - r) / d + 2;
                    else
                        h = (r - g) / d + 4;
                    h *= 60;
                } else {
                    h = 0;
                    s = l > 0 && l < 1 ? 0 : h;
                }
                return new HSL(h, s, l);
            };

            ColorConverters.HSL2RGB = function (hsl) {
                var h = hsl.H, s = hsl.S, l = hsl.L;
                var m1, m2;
                h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
                s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
                l = l < 0 ? 0 : l > 1 ? 1 : l;
                m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
                m1 = 2 * l - m2;
                function v(h) {
                    if (h > 360)
                        h -= 360;
                    else if (h < 0)
                        h += 360;
                    if (h < 60)
                        return m1 + (m2 - m1) * h / 60;
                    if (h < 180)
                        return m2;
                    if (h < 240)
                        return m1 + (m2 - m1) * (240 - h) / 60;
                    return m1;
                }

                function vv(h) {
                    return Math.round(v(h) * 255);
                }

                return new RGB(vv(h + 120), vv(h), vv(h - 120));
            };
            return ColorConverters;
        })();
        Media.ColorConverters = ColorConverters;

        

        var Colors = (function () {
            function Colors() {
            }
            Colors.Parse = function (name) {
                for (var key in Colors.KnownColors) {
                    if (name == key)
                        return new Color(Colors.KnownColors[key]);
                }
                return null;
            };

            Object.defineProperty(Colors, "Random", {
                get: function () {
                    var result;
                    var count = 0;
                    for (var prop in this.KnownColors)
                        if (Math.random() < 1 / ++count)
                            result = prop;

                    return Colors.Parse(result);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomBlue", {
                get: function () {
                    return new Color(new HSL(222, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomRed", {
                get: function () {
                    return new Color(new HSL(2, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomGreen", {
                get: function () {
                    return new Color(new HSL(115, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomPurple", {
                get: function () {
                    return new Color(new HSL(290, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomGray", {
                get: function () {
                    return new Color(new HSL(0, 0, TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "AliceBlue", {
                get: function () {
                    return new Color("F0F8FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "AntiqueWhite", {
                get: function () {
                    return new Color("FAEBD7");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Aqua", {
                get: function () {
                    return new Color("00FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Aquamarine", {
                get: function () {
                    return new Color("7FFFD4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Azure", {
                get: function () {
                    return new Color("F0FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Beige", {
                get: function () {
                    return new Color("F5F5DC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Bisque", {
                get: function () {
                    return new Color("FFE4C4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Black", {
                get: function () {
                    return new Color("000000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "BlanchedAlmond", {
                get: function () {
                    return new Color("	FFEBCD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Blue", {
                get: function () {
                    return new Color("0000FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "BlueViolet", {
                get: function () {
                    return new Color("8A2BE2");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Brown", {
                get: function () {
                    return new Color("A52A2A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "BurlyWood", {
                get: function () {
                    return new Color("DEB887");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "CadetBlue", {
                get: function () {
                    return new Color("5F9EA0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Chartreuse", {
                get: function () {
                    return new Color("7FFF00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Chocolate", {
                get: function () {
                    return new Color("D2691E");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Coral", {
                get: function () {
                    return new Color("FF7F50");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "CornflowerBlue", {
                get: function () {
                    return new Color("	6495ED");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Cornsilk", {
                get: function () {
                    return new Color("FFF8DC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Crimson", {
                get: function () {
                    return new Color("DC143C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Cyan", {
                get: function () {
                    return new Color("00FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkBlue", {
                get: function () {
                    return new Color("00008B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkCyan", {
                get: function () {
                    return new Color("008B8B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkGoldenRod", {
                get: function () {
                    return new Color("	B8860B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkGray", {
                get: function () {
                    return new Color("A9A9A9");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkGreen", {
                get: function () {
                    return new Color("006400");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkKhaki", {
                get: function () {
                    return new Color("BDB76B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkMagenta", {
                get: function () {
                    return new Color("8B008B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkOliveGreen", {
                get: function () {
                    return new Color("	556B2F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Darkorange", {
                get: function () {
                    return new Color("FF8C00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkOrchid", {
                get: function () {
                    return new Color("9932CC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkRed", {
                get: function () {
                    return new Color("8B0000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSalmon", {
                get: function () {
                    return new Color("E9967A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSeaGreen", {
                get: function () {
                    return new Color("8FBC8F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSlateBlue", {
                get: function () {
                    return new Color("	483D8B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSlateGray", {
                get: function () {
                    return new Color("	2F4F4F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkTurquoise", {
                get: function () {
                    return new Color("	00CED1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkViolet", {
                get: function () {
                    return new Color("9400D3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DeepPink", {
                get: function () {
                    return new Color("FF1493");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DeepSkyBlue", {
                get: function () {
                    return new Color("00BFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DimGray", {
                get: function () {
                    return new Color("696969");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DimGrey", {
                get: function () {
                    return new Color("696969");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DodgerBlue", {
                get: function () {
                    return new Color("1E90FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "FireBrick", {
                get: function () {
                    return new Color("B22222");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "FloralWhite", {
                get: function () {
                    return new Color("FFFAF0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "ForestGreen", {
                get: function () {
                    return new Color("228B22");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Fuchsia", {
                get: function () {
                    return new Color("FF00FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Gainsboro", {
                get: function () {
                    return new Color("DCDCDC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "GhostWhite", {
                get: function () {
                    return new Color("F8F8FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Gold", {
                get: function () {
                    return new Color("FFD700");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "GoldenRod", {
                get: function () {
                    return new Color("DAA520");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Gray", {
                get: function () {
                    return new Color("808080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Green", {
                get: function () {
                    return new Color("008000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "GreenYellow", {
                get: function () {
                    return new Color("ADFF2F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "HoneyDew", {
                get: function () {
                    return new Color("F0FFF0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "HotPink", {
                get: function () {
                    return new Color("FF69B4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "IndianRed", {
                get: function () {
                    return new Color("CD5C5C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Indigo", {
                get: function () {
                    return new Color("4B0082");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Ivory", {
                get: function () {
                    return new Color("FFFFF0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Khaki", {
                get: function () {
                    return new Color("F0E68C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Lavender", {
                get: function () {
                    return new Color("E6E6FA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LavenderBlush", {
                get: function () {
                    return new Color("	FFF0F5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LawnGreen", {
                get: function () {
                    return new Color("7CFC00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LemonChiffon", {
                get: function () {
                    return new Color("FFFACD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightBlue", {
                get: function () {
                    return new Color("ADD8E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightCoral", {
                get: function () {
                    return new Color("F08080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightCyan", {
                get: function () {
                    return new Color("E0FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightGoldenRodYellow", {
                get: function () {
                    return new Color("	FAFAD2");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightGray", {
                get: function () {
                    return new Color("D3D3D3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightGreen", {
                get: function () {
                    return new Color("90EE90");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightPink", {
                get: function () {
                    return new Color("FFB6C1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSalmon", {
                get: function () {
                    return new Color("FFA07A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSeaGreen", {
                get: function () {
                    return new Color("	20B2AA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSkyBlue", {
                get: function () {
                    return new Color("87CEFA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSlateGray", {
                get: function () {
                    return new Color("	778899");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSteelBlue", {
                get: function () {
                    return new Color("	B0C4DE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightYellow", {
                get: function () {
                    return new Color("FFFFE0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Lime", {
                get: function () {
                    return new Color("00FF00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LimeGreen", {
                get: function () {
                    return new Color("32CD32");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Linen", {
                get: function () {
                    return new Color("FAF0E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Magenta", {
                get: function () {
                    return new Color("FF00FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Maroon", {
                get: function () {
                    return new Color("800000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumAquaMarine", {
                get: function () {
                    return new Color("	66CDAA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumBlue", {
                get: function () {
                    return new Color("0000CD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumOrchid", {
                get: function () {
                    return new Color("BA55D3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumPurple", {
                get: function () {
                    return new Color("9370DB");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumSeaGreen", {
                get: function () {
                    return new Color("	3CB371");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumSlateBlue", {
                get: function () {
                    return new Color("	7B68EE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumSpringGreen", {
                get: function () {
                    return new Color("	00FA9A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumTurquoise", {
                get: function () {
                    return new Color("	48D1CC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumVioletRed", {
                get: function () {
                    return new Color("	C71585");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MidnightBlue", {
                get: function () {
                    return new Color("191970");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MintCream", {
                get: function () {
                    return new Color("F5FFFA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MistyRose", {
                get: function () {
                    return new Color("FFE4E1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Moccasin", {
                get: function () {
                    return new Color("FFE4B5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "NavajoWhite", {
                get: function () {
                    return new Color("FFDEAD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Navy", {
                get: function () {
                    return new Color("000080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "OldLace", {
                get: function () {
                    return new Color("FDF5E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Olive", {
                get: function () {
                    return new Color("808000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "OliveDrab", {
                get: function () {
                    return new Color("6B8E23");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Orange", {
                get: function () {
                    return new Color("FFA500");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "OrangeRed", {
                get: function () {
                    return new Color("FF4500");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Orchid", {
                get: function () {
                    return new Color("DA70D6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleGoldenRod", {
                get: function () {
                    return new Color("	EEE8AA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleGreen", {
                get: function () {
                    return new Color("98FB98");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleTurquoise", {
                get: function () {
                    return new Color("	AFEEEE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleVioletRed", {
                get: function () {
                    return new Color("	DB7093");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PapayaWhip", {
                get: function () {
                    return new Color("FFEFD5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PeachPuff", {
                get: function () {
                    return new Color("FFDAB9");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Peru", {
                get: function () {
                    return new Color("CD853F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Pink", {
                get: function () {
                    return new Color("FFC0CB");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Plum", {
                get: function () {
                    return new Color("DDA0DD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PowderBlue", {
                get: function () {
                    return new Color("B0E0E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Purple", {
                get: function () {
                    return new Color("800080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Red", {
                get: function () {
                    return new Color("FF0000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RosyBrown", {
                get: function () {
                    return new Color("BC8F8F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RoyalBlue", {
                get: function () {
                    return new Color("4169E1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SaddleBrown", {
                get: function () {
                    return new Color("8B4513");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Salmon", {
                get: function () {
                    return new Color("FA8072");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SandyBrown", {
                get: function () {
                    return new Color("F4A460");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SeaGreen", {
                get: function () {
                    return new Color("2E8B57");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SeaShell", {
                get: function () {
                    return new Color("FFF5EE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Sienna", {
                get: function () {
                    return new Color("A0522D");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Silver", {
                get: function () {
                    return new Color("C0C0C0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SkyBlue", {
                get: function () {
                    return new Color("87CEEB");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SlateBlue", {
                get: function () {
                    return new Color("6A5ACD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SlateGray", {
                get: function () {
                    return new Color("708090");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Snow", {
                get: function () {
                    return new Color("FFFAFA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SpringGreen", {
                get: function () {
                    return new Color("0FF7F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SteelBlue", {
                get: function () {
                    return new Color("4682B4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Tan", {
                get: function () {
                    return new Color("D2B48C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Teal", {
                get: function () {
                    return new Color("008080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Thistle", {
                get: function () {
                    return new Color("D8BFD8");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Tomato", {
                get: function () {
                    return new Color("FF6347");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Turquoise", {
                get: function () {
                    return new Color("40E0D0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Violet", {
                get: function () {
                    return new Color("EE82EE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Wheat", {
                get: function () {
                    return new Color("F5DEB3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "White", {
                get: function () {
                    return new Color("FFFFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "WhiteSmoke", {
                get: function () {
                    return new Color("F5F5F5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Yellow", {
                get: function () {
                    return new Color("FFFF00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "YellowGreen", {
                get: function () {
                    return new Color("9ACD32");
                },
                enumerable: true,
                configurable: true
            });
            Colors.KnownColors = {
                aliceblue: 'f0f8ff',
                antiquewhite: 'faebd7',
                aqua: '00ffff',
                aquamarine: '7fffd4',
                azure: 'f0ffff',
                beige: 'f5f5dc',
                bisque: 'ffe4c4',
                black: '000000',
                blanchedalmond: 'ffebcd',
                blue: '0000ff',
                blueviolet: '8a2be2',
                brown: 'a52a2a',
                burlywood: 'deb887',
                cadetblue: '5f9ea0',
                chartreuse: '7fff00',
                chocolate: 'd2691e',
                coral: 'ff7f50',
                cornflowerblue: '6495ed',
                cornsilk: 'fff8dc',
                crimson: 'dc143c',
                cyan: '00ffff',
                darkblue: '00008b',
                darkcyan: '008b8b',
                darkgoldenrod: 'b8860b',
                darkgray: 'a9a9a9',
                darkgreen: '006400',
                darkkhaki: 'bdb76b',
                darkmagenta: '8b008b',
                darkolivegreen: '556b2f',
                darkorange: 'ff8c00',
                darkorchid: '9932cc',
                darkred: '8b0000',
                darksalmon: 'e9967a',
                darkseagreen: '8fbc8f',
                darkslateblue: '483d8b',
                darkslategray: '2f4f4f',
                darkturquoise: '00ced1',
                darkviolet: '9400d3',
                deeppink: 'ff1493',
                deepskyblue: '00bfff',
                dimgray: '696969',
                dodgerblue: '1e90ff',
                feldspar: 'd19275',
                firebrick: 'b22222',
                floralwhite: 'fffaf0',
                forestgreen: '228b22',
                fuchsia: 'ff00ff',
                gainsboro: 'dcdcdc',
                ghostwhite: 'f8f8ff',
                gold: 'ffd700',
                goldenrod: 'daa520',
                gray: '808080',
                green: '008000',
                greenyellow: 'adff2f',
                honeydew: 'f0fff0',
                hotpink: 'ff69b4',
                indianred: 'cd5c5c',
                indigo: '4b0082',
                ivory: 'fffff0',
                khaki: 'f0e68c',
                lavender: 'e6e6fa',
                lavenderblush: 'fff0f5',
                lawngreen: '7cfc00',
                lemonchiffon: 'fffacd',
                lightblue: 'add8e6',
                lightcoral: 'f08080',
                lightcyan: 'e0ffff',
                lightgoldenrodyellow: 'fafad2',
                lightgrey: 'd3d3d3',
                lightgreen: '90ee90',
                lightpink: 'ffb6c1',
                lightsalmon: 'ffa07a',
                lightseagreen: '20b2aa',
                lightskyblue: '87cefa',
                lightslateblue: '8470ff',
                lightslategray: '778899',
                lightsteelblue: 'b0c4de',
                lightyellow: 'ffffe0',
                lime: '00ff00',
                limegreen: '32cd32',
                linen: 'faf0e6',
                magenta: 'ff00ff',
                maroon: '800000',
                mediumaquamarine: '66cdaa',
                mediumblue: '0000cd',
                mediumorchid: 'ba55d3',
                mediumpurple: '9370d8',
                mediumseagreen: '3cb371',
                mediumslateblue: '7b68ee',
                mediumspringgreen: '00fa9a',
                mediumturquoise: '48d1cc',
                mediumvioletred: 'c71585',
                midnightblue: '191970',
                mintcream: 'f5fffa',
                mistyrose: 'ffe4e1',
                moccasin: 'ffe4b5',
                navajowhite: 'ffdead',
                navy: '000080',
                oldlace: 'fdf5e6',
                olive: '808000',
                olivedrab: '6b8e23',
                orange: 'ffa500',
                orangered: 'ff4500',
                orchid: 'da70d6',
                palegoldenrod: 'eee8aa',
                palegreen: '98fb98',
                paleturquoise: 'afeeee',
                palevioletred: 'd87093',
                papayawhip: 'ffefd5',
                peachpuff: 'ffdab9',
                peru: 'cd853f',
                pink: 'ffc0cb',
                plum: 'dda0dd',
                powderblue: 'b0e0e6',
                purple: '800080',
                red: 'ff0000',
                rosybrown: 'bc8f8f',
                royalblue: '4169e1',
                saddlebrown: '8b4513',
                salmon: 'fa8072',
                sandybrown: 'f4a460',
                seagreen: '2e8b57',
                seashell: 'fff5ee',
                sienna: 'a0522d',
                silver: 'c0c0c0',
                skyblue: '87ceeb',
                slateblue: '6a5acd',
                slategray: '708090',
                snow: 'fffafa',
                springgreen: '00ff7f',
                steelblue: '4682b4',
                tan: 'd2b48c',
                teal: '008080',
                thistle: 'd8bfd8',
                tomato: 'ff6347',
                turquoise: '40e0d0',
                violet: 'ee82ee',
                violetred: 'd02090',
                wheat: 'f5deb3',
                white: 'ffffff',
                whitesmoke: 'f5f5f5',
                yellow: 'ffff00',
                yellowgreen: '9acd32'
            };
            return Colors;
        })();
        Media.Colors = Colors;

        var GradientSampler = (function () {
            function GradientSampler(colors) {
                this.indexStart = 0;
                this.indexEnd = 10;
                this.colors = ['ff0000', 'ffff00', '00ff00', '0000ff'];
                this.defs = [];
                if (colors != null) {
                    if (colors instanceof LinearGradient) {
                        this.colors = [];
                        var lg = colors;
                        for (var i = 0; i < lg.GradientStops.length; i++) {
                            var gradstop = lg.GradientStops[i];
                            this.colors.push(gradstop.Color.AsHex6);
                        }
                    } else if (colors instanceof Array) {
                        this.colors = [];
                        for (var j = 0; j < colors.length; j++) {
                            var c = colors[j];
                            if (c instanceof Color)
                                this.colors.push(c.AsHex6);
                            else if (TypeViz.IsString(c))
                                this.colors.push(c);
                            else
                                throw "Colors in the array should be HEX strings or instance of Color.";
                        }
                    }
                }
                if (this.colors == null || this.colors.length == 0)
                    throw "No colors to sample from.";
                this.setColours(this.colors);
            }
            Object.defineProperty(GradientSampler.prototype, "IndexStart", {
                get: function () {
                    return this.indexStart;
                },
                set: function (value) {
                    this.indexStart = value;
                    this.setColours(this.colors);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(GradientSampler.prototype, "IndexEnd", {
                get: function () {
                    return this.indexEnd;
                },
                set: function (value) {
                    this.indexEnd = value;
                    this.setColours(this.colors);
                },
                enumerable: true,
                configurable: true
            });


            GradientSampler.prototype.ColorAt = function (n) {
                if (isNaN(n)) {
                    throw new TypeError(n + ' is not a number');
                } else if (this.defs.length === 1) {
                    return this.fromPart(this.defs[0], n);
                } else {
                    var segment = (this.indexEnd - this.indexStart) / (this.defs.length);
                    var index = Math.min(Math.floor((Math.max(n, this.indexStart) - this.indexStart) / segment), this.defs.length - 1);
                    return this.fromPart(this.defs[index], n);
                }
            };

            GradientSampler.prototype.fromPart = function (part, n) {
                return this.calcHex(n, part.From.substring(1, 3), part.To.substring(1, 3)) + this.calcHex(n, part.From.substring(3, 5), part.To.substring(3, 5)) + this.calcHex(n, part.From.substring(5, 7), part.To.substring(5, 7));
            };

            GradientSampler.prototype.calcHex = function (n, channelStart_Base16, channelEnd_Base16) {
                var num = n;
                if (num < this.indexStart) {
                    num = this.indexStart;
                }
                if (num > this.indexEnd) {
                    num = this.indexEnd;
                }
                var numRange = this.indexEnd - this.indexStart;
                var cStart_Base10 = parseInt(channelStart_Base16, 16);
                var cEnd_Base10 = parseInt(channelEnd_Base16, 16);
                var cPerUnit = (cEnd_Base10 - cStart_Base10) / numRange;
                var c_Base10 = Math.round(cPerUnit * (num - this.indexStart) + cStart_Base10);
                return this.formatHex(c_Base10.toString(16));
            };

            GradientSampler.prototype.formatHex = function (hex) {
                if (hex.length === 1) {
                    return '0' + hex;
                } else {
                    return hex;
                }
            };

            GradientSampler.prototype.setColours = function (spectrum) {
                if (spectrum.length < 2) {
                    throw new Error('Rainbow must have two or more colors.');
                } else {
                    var increment = (this.indexEnd - this.indexStart) / (spectrum.length - 1);
                    this.defs = [
                        {
                            From: spectrum[0],
                            To: spectrum[1],
                            Min: this.indexStart,
                            Max: this.indexStart + increment
                        }
                    ];
                    for (var i = 1; i < spectrum.length - 1; i++) {
                        this.defs.push({
                            From: spectrum[i],
                            To: spectrum[i + 1],
                            Min: this.indexStart + increment * i,
                            Max: this.indexStart + increment * (i + 1)
                        });
                    }

                    this.colors = spectrum;
                    return this;
                }
            };
            return GradientSampler;
        })();
        Media.GradientSampler = GradientSampler;

        var Gradients = (function () {
            function Gradients() {
            }
            Object.defineProperty(Gradients, "Names", {
                get: function () {
                    return Gradients.names;
                },
                enumerable: true,
                configurable: true
            });

            Gradients.FromName = function (name) {
                if (Gradients.names.Contains(name))
                    return Gradients[name];
            };

            Object.defineProperty(Gradients, "BlueWhite", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "BlueWhite";
                    var b = new GradientStop(Colors.SteelBlue, 0);
                    var w = new GradientStop(Colors.White, 1);
                    g.AddGradientStops(b, w);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Beach", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "Beach";
                    var o = new GradientStop(Colors.Orange, 0);
                    var y = new GradientStop(Colors.Yellow, 0.4);
                    var a = new GradientStop(Colors.Azure, 0.7);
                    var c = new GradientStop(Colors.CornflowerBlue, 0.9);
                    g.AddGradientStops(o, y, a, c);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Solar", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "Solar";
                    var d = new GradientStop(Colors.DarkRed, 0);
                    var r = new GradientStop(Colors.Red, 0.4);
                    var y = new GradientStop(Colors.Yellow, 0.9);
                    g.AddGradientStops(d, r, y);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Temperature", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "Temperature";
                    var b = new GradientStop(Colors.Blue, 0);
                    var a = new GradientStop(Colors.CornflowerBlue, 0.2);
                    var w = new GradientStop(Colors.White, 0.4);
                    var y = new GradientStop(Colors.Yellow, 0.7);
                    var r = new GradientStop(Colors.Red, 0.9);
                    g.AddGradientStops(b, a, w, y, r);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Rainbow", {
                get: function () {
                    var gr = new LinearGradient();
                    gr.Id = "Rainbow";
                    var r = new GradientStop(Colors.Red, 0);
                    var o = new GradientStop(Colors.Orange, 0.15);
                    var y = new GradientStop(Colors.Yellow, 0.3);
                    var g = new GradientStop(Colors.Green, 0.45);
                    var b = new GradientStop(Colors.Blue, 0.6);
                    var i = new GradientStop(Colors.Indigo, 0.75);
                    var v = new GradientStop(Colors.BlueViolet, 0.9);
                    gr.AddGradientStops(r, o, y, g, b, i, v);
                    return gr;
                },
                enumerable: true,
                configurable: true
            });
            Gradients.names = ["Beach", "BlueWhite", "Temperature", "Solar", "Rainbow"];
            return Gradients;
        })();
        Media.Gradients = Gradients;
    })(TypeViz.Media || (TypeViz.Media = {}));
    var Media = TypeViz.Media;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    var Point = TypeViz.Point;
    var Rect = TypeViz.Rect;

    

    (function (SVG) {
        SVG.NS = "http://www.w3.org/2000/svg";
        SVG.XLINKNS = "http://www.w3.org/1999/xlink";

        var Visual = (function () {
            function Visual() {
                this.mouseMoveHandlers = [];
                this.mouseUpHandlers = [];
                this.mouseOverHandlers = [];
                this.mouseOutHandlers = [];
                this.mouseDownHandlers = [];
                this.mouseClickHandlers = [];
            }

            Object.defineProperty(Visual.prototype, "Cursor", {
                get: function () {
                    var current = this.Native.style.cursor;
                    if (!current)
                        return 1 /* Default */;
                    return this.toCursorEnum(current.toString());
                },
                set: function (value) {
                    this.Native.style.cursor = this.toCursorString(value);
                },
                enumerable: true,
                configurable: true
            });

            Visual.prototype.toCursorString = function (cursor) {
                switch (cursor) {
                    case 0:
                    case "CrossHair":
                        return "crosshair";
                    case 1:
                    case "Default":
                        return "default";
                    case 2:
                    case "Pointer":
                        return "pointer";
                    case 3:
                    case "Move":
                        return "move";
                    case 4:
                    case "EastResize":
                        return "e-resize";
                    case 5:
                    case "NorthEastResize":
                        return "ne-resize";
                    case 6:
                    case "NorthWestResize":
                        return "nw-resize";
                    case 7:
                    case "NorthResize":
                        return "n-resize";
                    case 8:
                    case "SouthEastResize":
                        return "se-resize";
                    case 9:
                    case "SouthWestResize":
                        return "sw-resize";
                    case 10:
                    case "SouthResize":
                        return "s-resize";
                    case 11:
                    case "WestResize":
                        return "w-resize";
                    case 12:
                    case "Text":
                        return "text";
                    case 13:
                    case "Wait":
                        return "wait";
                    case 14:
                    case "Help":
                        return "help";
                }
            };

            Visual.prototype.toCursorEnum = function (cursor) {
                switch (cursor.toLowerCase()) {
                    case "crosshair":
                        return 0 /* CrossHair */;
                    case "default":
                        return 1 /* Default */;
                    case "e-resize":
                        return 4 /* EastResize */;
                    case "help":
                        return 14 /* Help */;
                    case "move":
                        return 3 /* Move */;
                    case "ne-resize":
                        return 5 /* NorthEastResize */;
                    case "n-resize":
                        return 7 /* NorthResize */;
                    case "nw-resize":
                        return 6 /* NorthWestResize */;
                    case "pointer":
                        return 2 /* Pointer */;
                    case "se-resize":
                        return 8 /* SouthEastResize */;
                    case "s-resize":
                        return 10 /* SouthResize */;
                    case "sw-resize":
                        return 9 /* SouthWestResize */;
                    case "text":
                        return 12 /* Text */;
                    case "wait":
                        return 13 /* Wait */;
                    case "w-resize":
                        return 11 /* WestResize */;
                    default:
                        throw "Unsupported cursor type '" + cursor + "'.";
                }
            };

            Object.defineProperty(Visual.prototype, "Clip", {
                get: function () {
                    return this.clip;
                },
                set: function (value) {
                    this.clip = value;
                    if (value.Id == null)
                        throw "The clip path needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("clip-path", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "DataContext", {
                get: function () {
                    return this.dataContext ? this.dataContext : (this.Canvas ? this.Canvas.DataContext : null);
                },
                set: function (value) {
                    this.dataContext = value;
                },
                enumerable: true,
                configurable: true
            });


            Visual.prototype.Bind = function (property, f) {
                if (!(property in this))
                    throw "Property '" + property + "' does not exist on this object.";
                if (!this.DataContext)
                    throw "No DataContext to bind to. Define a DataContext on this object first or attach it to a Canvas with a DataContext.";
                if (!("Subscribe" in this.DataContext))
                    throw "Cannot bind the function; the DataContext does not have a 'Subscribe' method to subscribe to.";
                var visual = this;
                var subscription = function (model, subset) {
                    var returned = f.call(visual, model, subset);
                    if (returned)
                        visual[property] = returned;
                };
                if (!this.subscriptions)
                    this.subscriptions = new TypeViz.Map();
                this.subscriptions.Set(f, subscription);
                this.DataContext.Subscribe(subscription);
            };

            Visual.prototype.Unbind = function (f) {
                if (!this.subscriptions || !this.subscriptions.Contains(f))
                    throw "The given function is not bound to this objects.";
                if (!this.DataContext)
                    throw "No DataContext anymore; the function was bound to another DataContext.";
                var subscription = this.subscriptions.Get(f);
                if (!subscription)
                    throw "Functions was found but the corresponding subscription is null.";
                this.DataContext.RemoveSubscriber(subscription);
                this.subscriptions.remove(f);
            };

            Visual.prototype.Change = function (to, options) {
                if (this.animator == null)
                    this.animator = new TypeViz.Animation.Animator([this]);

                this.animator.Clear();
                return this.animator.Change(to, options);
            };

            Visual.prototype.MouseMove = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseMoveHandlers.push(handler);
            };

            Visual.prototype.RemoveMouseMoveHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseMoveHandlers.Contains(handler))
                    this.mouseMoveHandlers.Remove(handler);
            };

            Visual.prototype.ClearMouseMoveHandlers = function () {
                this.mouseMoveHandlers.Clear();
            };

            Visual.prototype.MouseDown = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseDownHandlers.push(handler);
            };

            Visual.prototype.RemoveMouseDownHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseDownHandlers.Contains(handler))
                    this.mouseDownHandlers.Remove(handler);
            };

            Visual.prototype.ClearMouseDownHandlers = function () {
                this.mouseDownHandlers.Clear();
            };

            Visual.prototype.MouseUp = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseUpHandlers.push(handler);
            };

            Visual.prototype.RemoveMouseUpHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseUpHandlers.Contains(handler))
                    this.mouseUpHandlers.Remove(handler);
            };

            Visual.prototype.ClearMouseUpHandlers = function () {
                this.mouseUpHandlers.Clear();
            };

            Visual.prototype.MouseOver = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseOverHandlers.push(handler);
            };

            Visual.prototype.RemoveMouseOverHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseOverHandlers.Contains(handler))
                    this.mouseOverHandlers.Remove(handler);
            };

            Visual.prototype.ClearMouseOverHandlers = function () {
                this.mouseOverHandlers.Clear();
            };

            Visual.prototype.MouseOut = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseOutHandlers.push(handler);
            };

            Visual.prototype.RemoveMouseOutHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseOutHandlers.Contains(handler))
                    this.mouseOutHandlers.Remove(handler);
            };

            Visual.prototype.ClearMouseOutHandlers = function () {
                this.mouseOutHandlers.Clear();
            };

            Visual.prototype.MouseClick = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseClickHandlers.push(handler);
            };

            Visual.prototype.RemoveMouseClickHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseClickHandlers.Contains(handler))
                    this.mouseClickHandlers.Remove(handler);
            };

            Visual.prototype.ClearMouseClickHandlers = function () {
                this.mouseClickHandlers.Clear();
            };

            Object.defineProperty(Visual.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Position", {
                get: function () {
                    return null;
                },
                set: function (v) {
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Id", {
                get: function () {
                    return this.Native == null ? null : this.Native.id;
                },
                set: function (value) {
                    this.Native.id = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Title", {
                get: function () {
                    return this.title.textContent;
                },
                set: function (v) {
                    if (this.title == null) {
                        this.title = document.createElementNS(SVG.NS, "title");
                        this.Native.appendChild(this.title);
                    }

                    this.title.textContent = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Class", {
                get: function () {
                    if (this.Native.attributes["class"] == null)
                        return null;
                    return this.Native.attributes["class"].value;
                },
                set: function (v) {
                    if (v == null)
                        this.Native.removeAttribute("class");
                    else
                        this.Native.setAttribute("class", v);
                },
                enumerable: true,
                configurable: true
            });


            Visual.prototype.Initialize = function () {
                this.nativeElement.id = TypeViz.RandomId();
                this.ListenToEvents();
            };

            Visual.prototype.ListenToEvents = function () {
                var _this = this;
                this.Native.onmousedown = function (e) {
                    return _this.onMouseDown(e);
                };
                this.Native.onmousemove = function (e) {
                    return _this.onMouseMove(e);
                };
                this.Native.onmouseup = function (e) {
                    return _this.onMouseUp(e);
                };
                this.Native.onmouseover = function (e) {
                    return _this.onMouseOver(e);
                };
                this.Native.onmouseout = function (e) {
                    return _this.onMouseOut(e);
                };
            };

            Visual.prototype.StopListeningToEvents = function () {
                this.Native.onmousedown = null;
                this.Native.onmousemove = null;
                this.Native.onmouseup = null;
            };

            Object.defineProperty(Visual.prototype, "IsVisible", {
                get: function () {
                    if (this.Native.attributes["visibility"] == null)
                        return true;
                    return this.Native.attributes["visibility"].value == "visible";
                },
                set: function (value) {
                    this.Native.setAttribute("visibility", (value ? "visible" : "hidden"));
                },
                enumerable: true,
                configurable: true
            });


            Visual.prototype.onMouseDown = function (e) {
                if (this.mouseDownHandlers.length > 0) {
                    for (var i = 0; i < this.mouseDownHandlers.length; i++) {
                        this.mouseDownHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseMove = function (e) {
                if (this.mouseMoveHandlers.length > 0) {
                    for (var i = 0; i < this.mouseMoveHandlers.length; i++) {
                        this.mouseMoveHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseUp = function (e) {
                if (this.mouseUpHandlers.length > 0) {
                    for (var i = 0; i < this.mouseUpHandlers.length; i++) {
                        this.mouseUpHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseOver = function (e) {
                if (this.mouseOverHandlers.length > 0) {
                    for (var i = 0; i < this.mouseOverHandlers.length; i++) {
                        this.mouseOverHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseOut = function (e) {
                if (this.mouseOutHandlers.length > 0) {
                    for (var i = 0; i < this.mouseOutHandlers.length; i++) {
                        this.mouseOutHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseClick = function (e) {
                if (this.mouseClickHandlers.length > 0) {
                    for (var i = 0; i < this.mouseClickHandlers.length; i++) {
                        this.mouseClickHandlers[i](e);
                    }
                }
            };

            Visual.prototype.PrePendTransform = function (transform) {
                var current = this.Native.attributes["transform"] == null ? "" : this.Native.attributes["transform"].value;
                this.Native.setAttribute("transform", transform.toString() + current);
            };

            Visual.prototype.Transform = function () {
                var transforms = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    transforms[_i] = arguments[_i + 0];
                }
                if (transforms.length == 1 && transforms[0] == null) {
                    this.Native.removeAttribute("transform");
                    return;
                }
                var current = this.Native.attributes["transform"] == null ? "" : this.Native.attributes["transform"].value;
                var s = current;
                for (var i = 0; i < transforms.length; i++)
                    s += transforms[i];
                this.Native.setAttribute("transform", s);
                return;
                if (current != null) {
                    var s = current;
                    for (var i = 0; i < transforms.length; i++)
                        s += transforms[i].toString();
                    this.Native.setAttribute("transform", s.toString());
                } else {
                    var m = Matrix.Unit;
                    for (var i = 0; i < transforms.length; i++)
                        m = m.Times(transforms[i].ToMatrix());
                    this.Native.setAttribute("transform", m.toString());
                }
            };

            Visual.prototype.getColorString = function (color) {
                if (TypeViz.IsString(color))
                    return color;
                if (TypeViz.IsColor(color))
                    return color.AsHex6;
                if (color instanceof TypeViz.Media.RGB)
                    return color.AsHex6;
                if (color instanceof TypeViz.Media.HSL)
                    return color.AsHex6;
                if (TypeViz.IsLinearGradient(color)) {
                    var radialGradient = color;
                    if (radialGradient != null) {
                        if (radialGradient.Id == null)
                            throw "The radialGradientadient needs an Id.";

                        return "url(#" + radialGradient.Id + ")";
                    }
                }

                if (TypeViz.IsRadialGradient(color)) {
                    var linearGradient = color;
                    if (linearGradient != null) {
                        if (linearGradient.Id == null)
                            throw "The linearGradientadient needs an Id.";

                        return "url(#" + linearGradient.Id + ")";
                    }
                }

                throw "Could not convert '" + color + "' to a color string.";
            };
            return Visual;
        })();
        SVG.Visual = Visual;

        var ClipPath = (function () {
            function ClipPath() {
                this.nativeElement = document.createElementNS(SVG.NS, "clipPath");
                this.Id = TypeViz.RandomId();
                this.children = [];
                this.position = new TypeViz.Point(0, 0);
            }
            Object.defineProperty(ClipPath.prototype, "Id", {
                get: function () {
                    return this.id;
                },
                set: function (value) {
                    this.id = value;
                    this.nativeElement.setAttribute("id", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ClipPath.prototype, "Position", {
                get: function () {
                    return this.position;
                },
                set: function (p) {
                    if (p == null)
                        return;
                    this.position = p;
                    try  {
                        if (this.nativeElement.ownerSVGElement == null)
                            return;
                    } catch (err) {
                        return;
                    }

                    var tr = this.Native.ownerSVGElement.createSVGTransform();
                    tr.setTranslate(p.X, p.Y);
                    if (this.Native.transform.baseVal.numberOfItems == 0)
                        this.Native.transform.baseVal.appendItem(tr);
                    else
                        this.Native.transform.baseVal.replaceItem(tr, 0);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ClipPath.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            ClipPath.prototype.Append = function (child) {
                if (this.children.Contains(child))
                    return;
                this.children.Append(child);
                this.nativeElement.appendChild(child.Native);
            };

            ClipPath.prototype.Remove = function (child) {
                if (this.children.Contains(child)) {
                    this.children.Remove(child);
                    this.nativeElement.removeChild(child.Native);
                }
            };
            return ClipPath;
        })();
        SVG.ClipPath = ClipPath;

        var LineBase = (function (_super) {
            __extends(LineBase, _super);
            function LineBase(from, to) {
                if (typeof from === "undefined") { from = null; }
                if (typeof to === "undefined") { to = null; }
                _super.call(this);
            }
            Object.defineProperty(LineBase.prototype, "MarkerEnd", {
                get: function () {
                    if (this.Native.attributes["marker-end"] == null) {
                        return null;
                    }
                    var ss = this.Native.attributes["marker-end"].value.toString();
                    var id = ss.substr(5, ss.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++) {
                        if (markers[i].Id == id)
                            return markers[i];
                    }
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-end", s);
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(LineBase.prototype, "MarkerStart", {
                get: function () {
                    if (this.Native.attributes["marker-start"] == null)
                        return null;
                    var s = this.Native.attributes["marker-start"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-start", s);
                },
                enumerable: true,
                configurable: true
            });
            return LineBase;
        })(Visual);
        SVG.LineBase = LineBase;

        var Image = (function (_super) {
            __extends(Image, _super);
            function Image() {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "image");
                this.Width = 50;
                this.Height = 50;
            }
            Object.defineProperty(Image.prototype, "Position", {
                get: function () {
                    return new TypeViz.Point(this.Native.x.baseVal.value, this.Native.y.baseVal.value);
                },
                set: function (p) {
                    this.Native.x.baseVal.value = p.X;
                    this.Native.y.baseVal.value = p.Y;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Image.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Image.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Image.prototype, "Height", {
                get: function () {
                    return this.Native.height.baseVal.value;
                },
                set: function (value) {
                    this.Native.height.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Image.prototype, "Width", {
                get: function () {
                    return this.Native.width.baseVal.value;
                },
                set: function (value) {
                    this.Native.width.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Image.prototype, "Url", {
                get: function () {
                    if (this.Native.attributes["xlink:href"] == null)
                        return null;
                    return this.Native.attributes["xlink.href"].value;
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("xlink:href", "");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttributeNS(SVG.XLINKNS, "href", value.call(this, this.DataContext));
                        else
                            this.Native.setAttributeNS(SVG.XLINKNS, "href", value);
                    }
                },
                enumerable: true,
                configurable: true
            });

            return Image;
        })(Visual);
        SVG.Image = Image;

        var Line = (function (_super) {
            __extends(Line, _super);
            function Line(from, to) {
                if (typeof from === "undefined") { from = null; }
                if (typeof to === "undefined") { to = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "line");
                this.Initialize();
                this.From = from;
                this.To = to;
                this.Stroke = "DimGray";
            }
            Object.defineProperty(Line.prototype, "From", {
                get: function () {
                    return this.from;
                },
                set: function (value) {
                    if (this.from != value) {
                        this.Native.setAttribute("x1", value.X.toString());
                        this.Native.setAttribute("y1", value.Y.toString());
                        this.from = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "To", {
                get: function () {
                    return this.to;
                },
                set: function (value) {
                    if (this.to != value) {
                        this.Native.setAttribute("x2", value.X.toString());
                        this.Native.setAttribute("y2", value.Y.toString());
                        this.to = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["opacity"].value);
                },
                set: function (value) {
                    if (value < 0 || value > 1.0)
                        throw "The opacity should be in the [0,1] interval.";
                    this.Native.setAttribute("opacity", value.toString());
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Line.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Line.prototype, "X1", {
                get: function () {
                    return this.x1;
                },
                set: function (value) {
                    this.x1 = value;
                    this.from.X = value;
                    this.Native.setAttribute("x1", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "X2", {
                get: function () {
                    return this.x2;
                },
                set: function (value) {
                    this.x2 = value;
                    this.Native.setAttribute("x2", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Y1", {
                get: function () {
                    return this.y1;
                },
                set: function (value) {
                    this.y1 = value;
                    this.Native.setAttribute("y1", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Y2", {
                get: function () {
                    return this.y2;
                },
                set: function (value) {
                    this.y2 = value;
                    this.Native.setAttribute("y2", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            return Line;
        })(LineBase);
        SVG.Line = Line;

        

        var Scale = (function () {
            function Scale(x, y) {
                if (typeof x === "undefined") { x = null; }
                if (typeof y === "undefined") { y = null; }
                if (x != null)
                    this.ScaleX = x;
                if (y != null)
                    this.ScaleY = y;
            }
            Scale.prototype.ToMatrix = function () {
                return Matrix.Scaling(this.ScaleX, this.ScaleY);
            };

            Scale.prototype.toString = function () {
                return "scale(" + this.ScaleX + ", " + this.ScaleY + ")";
            };
            return Scale;
        })();
        SVG.Scale = Scale;

        var Translation = (function () {
            function Translation(x, y) {
                if (typeof x === "undefined") { x = null; }
                if (typeof y === "undefined") { y = null; }
                if (x != null)
                    this.X = x;
                if (y != null)
                    this.Y = y;
            }
            Object.defineProperty(Translation.prototype, "X", {
                get: function () {
                    return this.x;
                },
                set: function (v) {
                    this.x = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Translation.prototype, "Y", {
                get: function () {
                    return this.y;
                },
                set: function (v) {
                    this.y = v;
                },
                enumerable: true,
                configurable: true
            });


            Translation.prototype.ToMatrixVector = function () {
                return new MatrixVector(0, 0, 0, 0, this.X, this.Y);
            };

            Translation.prototype.ToMatrix = function () {
                return Matrix.Translation(this.X, this.Y);
            };

            Translation.prototype.toString = function () {
                return "translate(" + this.X + ", " + this.Y + ")";
            };

            Translation.prototype.Plus = function (delta) {
                return new Translation(this.X + delta.X, this.Y + delta.Y);
            };

            Translation.prototype.Times = function (factor) {
                return new Translation(this.X * factor, this.Y * factor);
            };

            Object.defineProperty(Translation.prototype, "Length", {
                get: function () {
                    return Math.sqrt(this.X * this.X + this.Y * this.Y);
                },
                enumerable: true,
                configurable: true
            });

            Translation.prototype.Normalize = function () {
                if (this.Length == 0)
                    return new Translation();
                return new Translation(this.X / this.Length, this.Y / this.Length);
            };
            return Translation;
        })();
        SVG.Translation = Translation;

        var Rotation = (function () {
            function Rotation(angle, x, y) {
                if (typeof angle === "undefined") { angle = null; }
                if (typeof x === "undefined") { x = null; }
                if (typeof y === "undefined") { y = null; }
                if (x != null)
                    this.X = x;
                if (y != null)
                    this.Y = y;
                if (angle != null)
                    this.Angle = angle;
            }
            Rotation.prototype.toString = function () {
                if (this.X != null || this.Y != null)
                    return "rotate(" + this.Angle + ", " + this.X + ", " + this.Y + ")";
                else
                    return "rotate(" + this.Angle + ")";
            };

            Rotation.prototype.ToMatrix = function () {
                if (this.X == 0 && this.Y == 0)
                    return Matrix.Rotation(this.Angle);
                else {
                    return Matrix.Rotation(this.Angle, this.X, this.Y);
                }
            };
            return Rotation;
        })();
        SVG.Rotation = Rotation;

        var TextSpan = (function () {
            function TextSpan() {
                this.nativeElement = document.createElementNS(SVG.NS, "tspan");
                this.dx = 0;
                this.dy = 0;
            }
            Object.defineProperty(TextSpan.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextSpan.prototype, "dx", {
                get: function () {
                    if (this.nativeElement.attributes["dx"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dx"].value);
                },
                set: function (v) {
                    this.Native.setAttribute("dx", v.toString() + 'em');
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextSpan.prototype, "dy", {
                get: function () {
                    if (this.nativeElement.attributes["dy"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dy"].value);
                },
                set: function (v) {
                    this.Native.setAttribute("dy", v.toString() + "em");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextSpan.prototype, "X", {
                get: function () {
                    return parseFloat(this.Native.x.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("x", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextSpan.prototype, "Y", {
                get: function () {
                    return parseFloat(this.Native.y.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("y", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            return TextSpan;
        })();
        SVG.TextSpan = TextSpan;

        (function (TextAnchor) {
            TextAnchor[TextAnchor["Left"] = 0] = "Left";
            TextAnchor[TextAnchor["Center"] = 1] = "Center";
            TextAnchor[TextAnchor["Right"] = 3] = "Right";
        })(SVG.TextAnchor || (SVG.TextAnchor = {}));
        var TextAnchor = SVG.TextAnchor;

        var TextBlock = (function (_super) {
            __extends(TextBlock, _super);
            function TextBlock(canvas) {
                if (typeof canvas === "undefined") { canvas = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "text");
                this.Initialize();
                this.dx = 0;
                this.dy = 0;
                this.FontFamily = "Verdana";
                this.FontVariant = 0 /* Normal */;
                this.Stroke = "steelblue";
                this.FontWeight = 0 /* Normal */;
                this.StrokeThickness = 0;
                this.FontSize = 10;
            }
            Object.defineProperty(TextBlock.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Background", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(TextBlock.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextBlock.prototype, "X", {
                get: function () {
                    return parseFloat(this.Native.x.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("x", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Y", {
                get: function () {
                    return parseFloat(this.Native.y.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("y", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Position", {
                get: function () {
                    if (this.Native.x.baseVal.numberOfItems > 0)
                        return new TypeViz.Point(this.Native.x.baseVal.getItem(0).value, this.Native.y.baseVal.getItem(0).value);
                    else
                        return new TypeViz.Point(0, 0);
                },
                set: function (p) {
                    this.Native.setAttribute("x", p.X.toString());
                    this.Native.setAttribute("y", p.Y.toString());
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(TextBlock.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextBlock.prototype, "TextLength", {
                get: function () {
                    return this.Native["textLength"] ? this.Native.textLength.baseVal.value : this.Native.getComputedTextLength();
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextBlock.prototype, "Text", {
                get: function () {
                    return this.Native.textContent;
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.textContent = "";
                    } else {
                        if (typeof value === "function")
                            this.Native.textContent = value.call(this, this.DataContext);
                        else
                            this.Native.textContent = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontFamily", {
                get: function () {
                    if (this.nativeElement.attributes["font-family"] == null)
                        return null;
                    return this.Native.attributes["font-family"].value;
                },
                set: function (v) {
                    this.Native.setAttribute("font-family", v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontVariant", {
                get: function () {
                    if (this.nativeElement.attributes["font-variant"] == null)
                        return null;
                    return TextBlock.ParseFontVariant(this.nativeElement.attributes["font-variant"].value);
                },
                set: function (v) {
                    var s = TextBlock.FontVariantString(v);
                    if (s != null)
                        this.Native.setAttribute("font-variant", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontSize", {
                get: function () {
                    if (this.nativeElement.attributes["font-size"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["font-size"].value);
                },
                set: function (v) {
                    this.Native.setAttribute("font-size", v.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontWeight", {
                get: function () {
                    if (this.nativeElement.attributes["font-weight"] == null)
                        return 14 /* NotSet */;
                    return TextBlock.ParseFontWeight(this.nativeElement.attributes["font-weight"].value);
                },
                set: function (v) {
                    var s = TextBlock.FontWeightString(v);
                    if (s != null)
                        this.Native.setAttribute("font-weight", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Anchor", {
                get: function () {
                    if (this.nativeElement.attributes["text-anchor"] == null)
                        return null;
                    return this.getTextAnchor(this.nativeElement.attributes["text-anchor"].value);
                },
                set: function (v) {
                    this.Native.setAttribute("text-anchor", this.getAnchorString(v));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "dx", {
                get: function () {
                    if (this.nativeElement.attributes["dx"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dx"].value);
                },
                set: function (v) {
                    this.Native.setAttribute("dx", v.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "dy", {
                get: function () {
                    if (this.nativeElement.attributes["dy"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dy"].value);
                },
                set: function (v) {
                    this.Native.setAttribute("dy", v.toString() + "em");
                },
                enumerable: true,
                configurable: true
            });


            TextBlock.prototype.getAnchorString = function (anchor) {
                switch (anchor) {
                    case 0 /* Left */:
                        return "start";
                    case 1 /* Center */:
                        return "middle";
                    case 3 /* Right */:
                        return "end";
                    default:
                        throw "Unsupported anchor type.";
                }
            };

            TextBlock.prototype.getTextAnchor = function (anchor) {
                switch (anchor.toLowerCase()) {
                    case "start":
                        return 0 /* Left */;
                    case "middle":
                        return 1 /* Center */;
                    case "end":
                        return 3 /* Right */;
                    default:
                        throw "Unsupported anchor type.";
                }
            };

            TextBlock.ParseFontWeight = function (v) {
                if (v == null)
                    return 14 /* NotSet */;
                switch (v.toLowerCase()) {
                    case "normal":
                        return 0 /* Normal */;
                    case "bold":
                        return 1 /* Bold */;
                    case "bolder":
                        return 2 /* Bolder */;
                    case "lighter":
                        return 3 /* Lighter */;
                    case "100":
                        return 4 /* W100 */;
                    case "200":
                        return 5 /* W200 */;
                    case "300":
                        return 6 /* W300 */;
                    case "400":
                        return 7 /* W400 */;
                    case "500":
                        return 8 /* W500 */;
                    case "600":
                        return 9 /* W600 */;
                    case "700":
                        return 10 /* W700 */;
                    case "800":
                        return 11 /* W800 */;
                    case "900":
                        return 12 /* W900 */;
                    case "inherit":
                        return 13 /* Inherit */;
                }
                throw "String '" + v + "' could not be parsed to a FontWeights member.";
            };

            TextBlock.FontWeightString = function (value) {
                switch (value) {
                    case 0:
                        return "normal";
                    case 1:
                        return "bold";
                    case 2:
                        return "bolder";
                    case 3:
                        return "lighter";
                    case 4:
                        return "100";
                    case 5:
                        return "200";
                    case 6:
                        return "300";
                    case 7:
                        return "400";
                    case 8:
                        return "500";
                    case 9:
                        return "600";
                    case 10:
                        return "700";
                    case 11:
                        return "800";
                    case 12:
                        return "900";
                    case 13:
                        return "inherit";
                    case 14:
                        return null;
                }
                throw "Unexpected FontWeight";
            };

            TextBlock.ParseFontVariant = function (v) {
                if (v == null)
                    return 3 /* NotSet */;
                switch (v.toLowerCase()) {
                    case "normal":
                        return 0 /* Normal */;
                    case "small-caps":
                        return 1 /* SmallCaps */;
                }
            };

            TextBlock.FontVariantString = function (value) {
                switch (value) {
                    case 0:
                        return "normal";
                    case 1:
                        return "small-caps";
                    case 2:
                        return null;
                }
            };
            return TextBlock;
        })(Visual);
        SVG.TextBlock = TextBlock;

        (function (FontWeights) {
            FontWeights[FontWeights["Normal"] = 0] = "Normal";
            FontWeights[FontWeights["Bold"] = 1] = "Bold";
            FontWeights[FontWeights["Bolder"] = 2] = "Bolder";
            FontWeights[FontWeights["Lighter"] = 3] = "Lighter";
            FontWeights[FontWeights["W100"] = 4] = "W100";
            FontWeights[FontWeights["W200"] = 5] = "W200";
            FontWeights[FontWeights["W300"] = 6] = "W300";
            FontWeights[FontWeights["W400"] = 7] = "W400";
            FontWeights[FontWeights["W500"] = 8] = "W500";
            FontWeights[FontWeights["W600"] = 9] = "W600";
            FontWeights[FontWeights["W700"] = 10] = "W700";
            FontWeights[FontWeights["W800"] = 11] = "W800";
            FontWeights[FontWeights["W900"] = 12] = "W900";
            FontWeights[FontWeights["Inherit"] = 13] = "Inherit";
            FontWeights[FontWeights["NotSet"] = 14] = "NotSet";
        })(SVG.FontWeights || (SVG.FontWeights = {}));
        var FontWeights = SVG.FontWeights;

        (function (FontVariants) {
            FontVariants[FontVariants["Normal"] = 0] = "Normal";
            FontVariants[FontVariants["SmallCaps"] = 1] = "SmallCaps";
            FontVariants[FontVariants["Inherit"] = 2] = "Inherit";
            FontVariants[FontVariants["NotSet"] = 3] = "NotSet";
        })(SVG.FontVariants || (SVG.FontVariants = {}));
        var FontVariants = SVG.FontVariants;

        var Rectangle = (function (_super) {
            __extends(Rectangle, _super);
            function Rectangle(position) {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "rect");
                this.Width = 15;
                this.Height = 15;
                this.Background = "Silver";
                if (position)
                    this.Position = position;
                this.Initialize();
            }
            Object.defineProperty(Rectangle.prototype, "Width", {
                get: function () {
                    return this.Native.width.baseVal.value;
                },
                set: function (value) {
                    this.Native.width.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Height", {
                get: function () {
                    return this.Native.height.baseVal.value;
                },
                set: function (value) {
                    this.Native.height.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Background", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "CornerRadius", {
                get: function () {
                    return this.Native.rx.baseVal.value;
                },
                set: function (v) {
                    this.Native.rx.baseVal.value = v;
                    this.Native.ry.baseVal.value = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Position", {
                get: function () {
                    return new TypeViz.Point(this.Native.x.baseVal.value, this.Native.y.baseVal.value);
                },
                set: function (p) {
                    this.Native.x.baseVal.value = p.X;
                    this.Native.y.baseVal.value = p.Y;
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Rectangle.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", this.getColorString(value));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });
            return Rectangle;
        })(Visual);
        SVG.Rectangle = Rectangle;

        var PathBase = (function (_super) {
            __extends(PathBase, _super);
            function PathBase() {
                _super.call(this);
                this.xf = 1;
                this.yf = 1;
                this.nativeElement = document.createElementNS(SVG.NS, "path");
                this.Initialize();
                this.Background = "Black";
                this.Stroke = "Black";
                this.position = new TypeViz.Point(0, 0);
            }
            Object.defineProperty(PathBase.prototype, "MarkerEnd", {
                get: function () {
                    if (this.Native.attributes["marker-end"] == null) {
                        return null;
                    }
                    var ss = this.Native.attributes["marker-end"].value.toString();
                    var id = ss.substr(5, ss.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++) {
                        if (markers[i].Id == id)
                            return markers[i];
                    }
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-end", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "MarkerStart", {
                get: function () {
                    if (this.Native.attributes["marker-start"] == null)
                        return null;
                    var s = this.Native.attributes["marker-start"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-start", s);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(PathBase.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", this.getColorString(value));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(PathBase.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Position", {
                get: function () {
                    return this.position;
                },
                set: function (p) {
                    if (p == null)
                        return;
                    this.position = p;
                    try  {
                        if (this.nativeElement.ownerSVGElement == null)
                            throw "Add the Path first to a parent element before positioning.";
                    } catch (err) {
                        return;
                    }

                    var tr = this.Native.ownerSVGElement.createSVGTransform();
                    tr.setTranslate(p.X, p.Y);
                    if (this.Native.transform.baseVal.numberOfItems == 0)
                        this.Native.transform.baseVal.appendItem(tr);
                    else
                        this.Native.transform.baseVal.replaceItem(tr, 0);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Data", {
                get: function () {
                    if (this.Native.attributes["d"] == null)
                        return null;

                    return this.Native.attributes["d"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("d", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Background", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Width", {
                get: function () {
                    try  {
                        return this.Native.getBBox().width;
                    } catch (err) {
                        return 0;
                    }
                },
                set: function (value) {
                    if (this.Width == 0) {
                        this.xf = value / 100;
                    } else
                        this.xf = value / this.Width;
                    this.Native.setAttribute("transform", "scale(" + this.xf + "," + this.yf + ")");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Height", {
                get: function () {
                    try  {
                        return this.Native.getBBox().height;
                    } catch (err) {
                        return 0;
                    }
                },
                set: function (value) {
                    if (this.Height == 0) {
                        console.log("Warning: current path bounding box is nil, assuming that the path's geometry is scaled at 100x100.");
                        this.yf = value / 100;
                    } else
                        this.yf = value / this.Height;
                    this.Native.setAttribute("transform", "scale(" + this.xf + "," + this.yf + ")");
                },
                enumerable: true,
                configurable: true
            });


            PathBase.ParseNode = function (node) {
                if (node == null)
                    return null;
                if (node.localName != "path")
                    return null;
                var path = new PathBase();
                path.Data = node.attributes["d"] == null ? null : node.attributes["d"].value;
                path.StrokeThickness = node.attributes["stroke-width"] == null ? 0 : parseFloat(node.attributes["stroke-width"].value);
                path.Stroke = node.attributes["stroke"] == null ? null : node.attributes["stroke"].value;
                path.Background = node.attributes["fill"] == null ? null : node.attributes["fill"].value;
                return path;
            };
            return PathBase;
        })(LineBase);
        SVG.PathBase = PathBase;

        var Path = (function (_super) {
            __extends(Path, _super);
            function Path() {
                _super.call(this);
                this.interpolator = Interpolate();
                this.Background = "none";
                this.points = [];
            }
            Object.defineProperty(Path.prototype, "Interpolator", {
                get: function () {
                    return this.interpolator;
                },
                set: function (value) {
                    this.interpolator = value;
                    if (this.points != null && this.points.length > 0) {
                        this.refreshData();
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Path.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["stroke-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["stroke-opacity"].value);
                },
                set: function (value) {
                    if (value < 0 || value > 1.0)
                        throw "The opacity should be in the [0,1] interval.";
                    this.Native.setAttribute("stroke-opacity", value.toString());
                    this.Native.setAttribute("opacity", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            Path.prototype.AddPoint = function (p) {
                this.points.push(p);
                this.refreshData();
            };

            Object.defineProperty(Path.prototype, "Points", {
                get: function () {
                    return this.points.Reverse();
                },
                set: function (value) {
                    if (value == null || value.length == 0) {
                        this.Data = "";
                        return;
                    }

                    this.points = value.Reverse();
                    this.refreshData();
                },
                enumerable: true,
                configurable: true
            });


            Path.prototype.refreshData = function () {
                this.Data = this.Interpolator(TypeViz.Point.ToArray(this.points));
            };

            Path.prototype.Grow = function (points, complete) {
                if (points == null || points.length == 0)
                    return;
                if (points.length == 1)
                    this.Points = points;

                var states = [];
                states.push([].Initialize(points[0], points.length));
                for (var i = 1; i < points.length; i++) {
                    var state = [];
                    for (var j = 0; j < points.length; j++) {
                        if (j >= i)
                            state[j] = points[i];
                        else
                            state[j] = states[i - 1][j];
                    }
                    states.push(state);
                }
                this.Points = states[0];
                var anim;

                for (var k = 1; k < states.length; k++) {
                    if (k == 1)
                        anim = this.Change({ Data: states[k] }, complete ? function () {
                            complete(states[1][1], 1);
                        } : null);
                    else {
                        var s = states[k];
                        anim = anim.Change({ Data: s }, complete ? (function (m) {
                            return function () {
                                complete(points[m], m);
                            };
                        })(k) : null);
                    }
                }
                if (TypeViz.IsDefined(complete))
                    complete(points[0], 0);
                anim.Play();
            };
            return Path;
        })(PathBase);
        SVG.Path = Path;

        var Marker = (function (_super) {
            __extends(Marker, _super);
            function Marker() {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "marker");
                this.Initialize();
            }
            Object.defineProperty(Marker.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "RefX", {
                get: function () {
                    if (this.nativeElement.attributes["refX"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["refX"].value);
                },
                set: function (value) {
                    this.Native.refX.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "RefY", {
                get: function () {
                    if (this.nativeElement.attributes["refY"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["refY"].value);
                },
                set: function (value) {
                    this.Native.refY.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Ref", {
                get: function () {
                    return new Point(this.RefX, this.RefY);
                },
                set: function (value) {
                    this.RefX = value.X;
                    this.RefY = value.Y;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "MarkerWidth", {
                get: function () {
                    if (this.nativeElement.attributes["markerWidth"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["markerWidth"].value);
                },
                set: function (value) {
                    this.Native.markerWidth.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "MarkerHeight", {
                get: function () {
                    if (this.nativeElement.attributes["markerHeight"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["markerHeight"].value);
                },
                set: function (value) {
                    this.Native.markerHeight.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Size", {
                get: function () {
                    return new TypeViz.Size(this.MarkerWidth, this.MarkerHeight);
                },
                set: function (value) {
                    this.MarkerWidth = value.Width;
                    this.MarkerHeight = value.Height;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "ViewBox", {
                get: function () {
                    if (this.Native.viewBox == null)
                        return Rect.Empty;
                    return new Rect(this.Native.viewBox.baseVal.x, this.Native.viewBox.baseVal.y, this.Native.viewBox.baseVal.width, this.Native.viewBox.baseVal.height);
                },
                set: function (value) {
                    if (this.Native.viewBox.baseVal == null)
                        return;
                    this.Native.viewBox.baseVal.height = value.Height;
                    this.Native.viewBox.baseVal.width = value.Width;
                    this.Native.viewBox.baseVal.x = value.X;
                    this.Native.viewBox.baseVal.y = value.Y;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Orientation", {
                get: function () {
                    if (this.Native.orientType == null)
                        return 2 /* NotSet */;
                    return Marker.ParseOrientation(this.Native.orientType.baseVal.toString());
                },
                set: function (value) {
                    if (value == 2 /* NotSet */)
                        return;
                    var s = Marker.OrientationString(value);
                    if (s != null)
                        this.Native.setAttribute("orient", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Path", {
                get: function () {
                    return this.path;
                },
                set: function (value) {
                    if (value == this.path)
                        return;
                    this.path = value;
                    if (this.nativeElement.firstChild != null)
                        this.Native.removeChild(this.nativeElement.firstChild);
                    this.Native.appendChild(value.Native);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "MarkerUnits", {
                get: function () {
                    if (this.Native.orientType == null)
                        return 2 /* NotSet */;
                    return Marker.ParseMarkerUnits(this.Native.orientType.baseVal.toString());
                },
                set: function (value) {
                    if (value == 2 /* NotSet */)
                        return;
                    var s = Marker.MarkerUnitsString(value);
                    if (s != null)
                        this.Native.setAttribute("markerUnits", s);
                },
                enumerable: true,
                configurable: true
            });


            Marker.ParseOrientation = function (v) {
                if (v == null)
                    return 2 /* NotSet */;
                if (v.toLowerCase() == "auto")
                    return 0 /* Auto */;
                if (v.toLowerCase() == "angle")
                    return 1 /* Angle */;
                throw "Unexpected value '" + v + "' cannot be converted to a MarkerOrientation.";
            };

            Marker.OrientationString = function (value) {
                switch (value) {
                    case 0:
                        return "auto";
                    case 1:
                        return "angle";
                    case 2:
                        return null;
                }
                throw "Unexpected MarkerOrientation value '" + value + "'.";
            };

            Marker.ParseMarkerUnits = function (v) {
                if (v == null)
                    return 2 /* NotSet */;
                if (v.toLowerCase() == "strokewidth")
                    return 0 /* StrokeWidth */;
                if (v.toLowerCase() == "userspaceonuse")
                    return 1 /* UserSpaceOnUse */;
                throw "Unexpected MarkerUnits value '" + v + "'.";
            };

            Marker.MarkerUnitsString = function (value) {
                switch (value) {
                    case 0:
                        return "strokewidth";
                    case 1:
                        return "userspaceonuse";
                    case 2:
                        return null;
                }
                throw "Unexpected MarkerUnits value '" + value + "'.";
            };


            Object.defineProperty(Marker.prototype, "Stroke", {
                get: function () {
                    if (this.Path == null)
                        return null;
                    return this.Path.Stroke;
                },
                set: function (value) {
                    if (this.Path != null)
                        this.Path.Stroke = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Color", {
                set: function (value) {
                    if (this.Path != null) {
                        this.Path.Background = value;
                        this.Path.Stroke = value;
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Marker.prototype, "Background", {
                get: function () {
                    if (this.Path == null)
                        return null;
                    return this.Path.Background;
                },
                set: function (value) {
                    if (value == null)
                        value = "none";
                    if (this.Path != null)
                        this.Path.Background = value;
                },
                enumerable: true,
                configurable: true
            });
            return Marker;
        })(Visual);
        SVG.Marker = Marker;

        (function (MarkerOrientation) {
            MarkerOrientation[MarkerOrientation["Auto"] = 0] = "Auto";
            MarkerOrientation[MarkerOrientation["Angle"] = 1] = "Angle";
            MarkerOrientation[MarkerOrientation["NotSet"] = 2] = "NotSet";
        })(SVG.MarkerOrientation || (SVG.MarkerOrientation = {}));
        var MarkerOrientation = SVG.MarkerOrientation;

        (function (MarkerUnits) {
            MarkerUnits[MarkerUnits["StrokeWidth"] = 0] = "StrokeWidth";
            MarkerUnits[MarkerUnits["UserSpaceOnUse"] = 1] = "UserSpaceOnUse";
            MarkerUnits[MarkerUnits["NotSet"] = 2] = "NotSet";
        })(SVG.MarkerUnits || (SVG.MarkerUnits = {}));
        var MarkerUnits = SVG.MarkerUnits;

        var Polyline = (function (_super) {
            __extends(Polyline, _super);
            function Polyline(points) {
                if (typeof points === "undefined") { points = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "polyline");
                this.Initialize();
                this.Initialize();
                if (points != null)
                    this.Points = points;
                else
                    this.points = [];
                this.Stroke = "Black";
                this.StrokeThickness = 2;
                this.Background = "none";
            }
            Object.defineProperty(Polyline.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Background", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    if (typeof (v) == "string")
                        this.Native.style.fill = v;
                    if (typeof (v) == "object") {
                        var gr = v;
                        if (gr != null) {
                            if (gr.Id == null)
                                throw "The gradient needs an Id.";
                            this.Native.style.fill = "url(#" + gr.Id + ")";
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Points", {
                get: function () {
                    return this.points;
                },
                set: function (value) {
                    if (this.points != value) {
                        if (value == null || value.length == 0)
                            this.Native.setAttribute("points", null);
                        else {
                            var s = "";
                            for (var i = 0; i < value.length; i++)
                                s += " " + value[i].X + "," + value[i].Y;
                            s = s.trim();
                            this.Native.setAttribute("points", s);
                        }
                        this.points = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (value < 0 || value > 1.0)
                        throw "The opacity should be in the [0,1] interval.";
                    this.Native.setAttribute("fill-opacity", value.toString());
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Polyline.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "MarkerEnd", {
                get: function () {
                    if (this.Native.attributes["marker-end"] == null)
                        return null;
                    var s = this.Native.attributes["marker-end"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-end", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "MarkerStart", {
                get: function () {
                    if (this.Native.attributes["marker-start"] == null)
                        return null;
                    var s = this.Native.attributes["marker-start"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-start", s);
                },
                enumerable: true,
                configurable: true
            });
            return Polyline;
        })(LineBase);
        SVG.Polyline = Polyline;

        var Group = (function (_super) {
            __extends(Group, _super);
            function Group() {
                _super.call(this);
                this.children = [];
                this.nativeElement = document.createElementNS(SVG.NS, "g");
                this.Initialize();
                this.position = new TypeViz.Point(0, 0);
            }
            Group.prototype.Contains = function (visual) {
                return this.Children.Contains(visual);
            };

            Group.prototype.FadeIn = function (visual, duration, complete) {
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeIn cannot proceed, the given visual is null.";
                visual.Opacity = 0;
                if (!this.Contains(visual)) {
                    this.Append(visual);
                }
                visual.Change({ Opacity: 1, Duration: duration }, complete).Play();
            };
            Group.prototype.FadeOut = function (visual, remove, duration, complete) {
                if (typeof remove === "undefined") { remove = true; }
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeOut cannot proceed, the given visual is null.";
                var c = this;
                visual.Change({ Opacity: 0, Duration: duration }, function () {
                    if (remove) {
                        c.Remove(visual);
                    }
                    if (TypeViz.IsDefined(complete)) {
                        complete(visual);
                    }
                });
            };
            Object.defineProperty(Group.prototype, "Children", {
                get: function () {
                    return this.children;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Group.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Group.prototype, "Position", {
                get: function () {
                    return this.position;
                },
                set: function (p) {
                    this.position = p;
                    try  {
                        if (this.nativeElement.ownerSVGElement == null) {
                            this.Native.setAttribute("transform", "translate(" + p.X + "," + p.Y + ")");
                            return;
                        }
                    } catch (err) {
                        return;
                    }
                    var tr = this.Native.ownerSVGElement.createSVGTransform();
                    tr.setTranslate(p.X, p.Y);
                    if (this.Native.transform.baseVal.numberOfItems == 0)
                        this.Native.transform.baseVal.appendItem(tr);
                    else
                        this.Native.transform.baseVal.replaceItem(tr, 0);
                },
                enumerable: true,
                configurable: true
            });


            Group.prototype.Append = function (visual) {
                this.Native.appendChild(visual.Native);
                visual.Canvas = this.Canvas;
                if (visual["OnAppendToCanvas"])
                    visual["OnAppendToCanvas"](this.Canvas);
                visual.ParentLayer = this;
                this.children.push(visual);
            };

            Group.prototype.Prepend = function (visual) {
                if (this.children.length > 0) {
                    this.Native.insertBefore(visual.Native, this.children[0].Native);
                    visual.Canvas = this.Canvas;
                    if (visual["OnAppendToCanvas"])
                        visual["OnAppendToCanvas"](this.Canvas);
                    visual.ParentLayer = this;
                    this.children.push(visual);
                } else {
                    this.Append(visual);
                }
            };
            Group.prototype.Remove = function (visual) {
                this.Native.removeChild(visual.Native);
                if (visual["OnDetachFromCanvas"] != null)
                    visual["OnDetachFromCanvas"](this.Canvas);
                visual.ParentLayer = null;
                visual.Canvas = null;
                this.children.Remove(visual);
            };

            Group.prototype.Clear = function () {
                while (this.Native.childNodes.length > 0) {
                    this.Native.removeChild(this.Native.childNodes[0]);
                }
                while (this.children.length > 0) {
                    var child = this.children[0];
                    if (child["OnDetachFromCanvas"] != null)
                        child["OnDetachFromCanvas"](this.Canvas);
                    child.Canvas = null;
                    this.children.Remove(child);
                }
            };
            return Group;
        })(Visual);
        SVG.Group = Group;

        var Matrix = (function () {
            function Matrix(a, b, c, d, e, f) {
                if (typeof a === "undefined") { a = null; }
                if (typeof b === "undefined") { b = null; }
                if (typeof c === "undefined") { c = null; }
                if (typeof d === "undefined") { d = null; }
                if (typeof e === "undefined") { e = null; }
                if (typeof f === "undefined") { f = null; }
                if (a != null)
                    this.a = a;
                if (b != null)
                    this.b = b;
                if (c != null)
                    this.c = c;
                if (d != null)
                    this.d = d;
                if (e != null)
                    this.e = e;
                if (f != null)
                    this.f = f;
            }
            Matrix.prototype.Plus = function (m) {
                this.a += m.a;
                this.b += m.b;
                this.c += m.c;
                this.d += m.d;
                this.e += m.e;
                this.f += m.f;
            };

            Matrix.prototype.Minus = function (m) {
                this.a -= m.a;
                this.b -= m.b;
                this.c -= m.c;
                this.d -= m.d;
                this.e -= m.e;
                this.f -= m.f;
            };

            Matrix.prototype.Times = function (m) {
                return Matrix.FromList([
                    this.a * m.a + this.c * m.b,
                    this.b * m.a + this.d * m.b,
                    this.a * m.c + this.c * m.d,
                    this.b * m.c + this.d * m.d,
                    this.a * m.e + this.c * m.f + this.e,
                    this.b * m.e + this.d * m.f + this.f
                ]);
            };

            Matrix.prototype.Apply = function (p) {
                return new Point(this.a * p.X + this.c * p.Y + this.e, this.b * p.X + this.d * p.Y + this.f);
            };

            Matrix.FromSVGMatrix = function (vm) {
                var m = new Matrix();
                m.a = vm.a;
                m.b = vm.b;
                m.c = vm.c;
                m.d = vm.d;
                m.e = vm.e;
                m.f = vm.f;
                return m;
            };

            Matrix.FromMatrixVector = function (v) {
                var m = new Matrix();
                m.a = v.a;
                m.b = v.b;
                m.c = v.c;
                m.d = v.d;
                m.e = v.e;
                m.f = v.f;
                return m;
            };

            Matrix.FromList = function (v) {
                if (v.length != 6)
                    throw "The given list should consist of six elements.";
                var m = new Matrix();
                m.a = v[0];
                m.b = v[1];
                m.c = v[2];
                m.d = v[3];
                m.e = v[4];
                m.f = v[5];
                return m;
            };

            Matrix.Translation = function (x, y) {
                var m = new Matrix();
                m.a = 1;
                m.b = 0;
                m.c = 0;
                m.d = 1;
                m.e = x;
                m.f = y;
                return m;
            };

            Object.defineProperty(Matrix, "Unit", {
                get: function () {
                    return Matrix.FromList([1, 0, 0, 1, 0, 0]);
                },
                enumerable: true,
                configurable: true
            });

            Matrix.prototype.toString = function () {
                return "matrix(" + this.a + " " + this.b + " " + this.c + " " + this.d + " " + this.e + " " + this.f + ")";
            };

            Matrix.Rotation = function (angle, x, y) {
                if (typeof x === "undefined") { x = 0; }
                if (typeof y === "undefined") { y = 0; }
                var m = new Matrix();
                m.a = Math.cos(angle * Math.PI / 180);
                m.b = Math.sin(angle * Math.PI / 180);
                m.c = -m.b;
                m.d = m.a;
                m.e = x - x * m.a + y * m.b;
                m.f = y - y * m.a - x * m.b;
                return m;
            };

            Matrix.Scaling = function (scaleX, scaleY) {
                if (typeof scaleY === "undefined") { scaleY = null; }
                if (scaleY == null)
                    scaleY = scaleX;
                var m = new Matrix();
                m.a = scaleX;
                m.b = 0;
                m.c = 0;
                m.d = scaleY;
                m.e = 0;
                m.f = 0;
                return m;
            };

            Matrix.Parse = function (v) {
                if (v == null)
                    return null;
                v = v.trim();

                if (v.slice(0, 6).toLowerCase() == "matrix") {
                    var nums = v.slice(7, v.length - 1).trim();
                    var parts = nums.split(",");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                    parts = nums.split(" ");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                }

                if (v.slice(0, 1) == "(" && v.slice(v.length - 1) == ")")
                    v = v.substr(1, v.length - 1);
                if (v.indexOf(",") > 0) {
                    var parts = v.split(",");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                }

                if (v.indexOf(" ") > 0) {
                    var parts = v.split(" ");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                }
                return null;
            };
            return Matrix;
        })();
        SVG.Matrix = Matrix;

        var MatrixVector = (function () {
            function MatrixVector(a, b, c, d, e, f) {
                if (typeof a === "undefined") { a = null; }
                if (typeof b === "undefined") { b = null; }
                if (typeof c === "undefined") { c = null; }
                if (typeof d === "undefined") { d = null; }
                if (typeof e === "undefined") { e = null; }
                if (typeof f === "undefined") { f = null; }
                if (a != null)
                    this.a = a;
                if (b != null)
                    this.b = b;
                if (c != null)
                    this.c = c;
                if (d != null)
                    this.d = d;
                if (e != null)
                    this.e = e;
                if (f != null)
                    this.f = f;
            }
            MatrixVector.FromMatrix = function (m) {
                var v = new MatrixVector();
                v.a = m.a;
                v.b = m.b;
                v.c = m.c;
                v.d = m.d;
                v.e = m.e;
                v.f = m.f;
                return v;
            };
            return MatrixVector;
        })();
        SVG.MatrixVector = MatrixVector;

        var EllipseBase = (function (_super) {
            __extends(EllipseBase, _super);
            function EllipseBase() {
                _super.apply(this, arguments);
            }
            Object.defineProperty(EllipseBase.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(EllipseBase.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("stroke", "none");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("stroke", this.getColorString(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("stroke", this.getColorString(value));
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(EllipseBase.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("stroke-width", "0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("stroke-width", value.call(this, this.DataContext));
                        else
                            this.Native.setAttribute("stroke-width", value);
                    }
                },
                enumerable: true,
                configurable: true
            });

            return EllipseBase;
        })(Visual);
        SVG.EllipseBase = EllipseBase;

        var Ellipse = (function (_super) {
            __extends(Ellipse, _super);
            function Ellipse(position, width, height) {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "ellipse");
                if (width)
                    this.Width = width;
                else
                    this.Width = 15;

                if (height)
                    this.Height = height;
                else
                    this.Height = 15;

                if (position)
                    this.Position = position;
                this.Initialize();
            }
            Object.defineProperty(Ellipse.prototype, "Width", {
                get: function () {
                    return this.Native.rx.baseVal.value;
                },
                set: function (v) {
                    this.Native.rx.baseVal.value = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Height", {
                get: function () {
                    return this.Native.ry.baseVal.value;
                },
                set: function (v) {
                    this.Native.ry.baseVal.value = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Background", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Ellipse.prototype, "Center", {
                get: function () {
                    return new TypeViz.Point(this.Native.cx.baseVal.value + this.Width, this.Native.cy.baseVal.value + this.Height);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = -this.Width;
                        this.Native.cy.baseVal.value = -this.Height;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X - this.Width;
                        this.Native.cy.baseVal.value = p.Y - this.Height;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Position", {
                get: function () {
                    return new TypeViz.Point(this.Center.X - this.Width, this.Center.Y - this.Height);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = 0;
                        this.Native.cy.baseVal.value = 0;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X + this.Width;
                        this.Native.cy.baseVal.value = p.Y + this.Height;
                    }
                },
                enumerable: true,
                configurable: true
            });

            return Ellipse;
        })(EllipseBase);
        SVG.Ellipse = Ellipse;

        var Circle = (function (_super) {
            __extends(Circle, _super);
            function Circle(position, radius) {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "circle");
                if (radius)
                    this.Radius = radius;
                else
                    this.Radius = 15;
                if (position)
                    this.Position = position;
                this.Initialize();
            }
            Object.defineProperty(Circle.prototype, "Background", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Circle.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Circle.prototype, "Radius", {
                get: function () {
                    return this.Native.r.baseVal.value;
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.r.baseVal.value = 0;
                    } else {
                        if (typeof value === "function")
                            this.Native.r.baseVal.value = TypeViz.LimitValue(value.call(this, this.DataContext), 0, 1000);
                        else
                            this.Native.r.baseVal.value = TypeViz.LimitValue(value, 0, 1000);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Center", {
                get: function () {
                    return new TypeViz.Point(this.Native.cx.baseVal.value, this.Native.cy.baseVal.value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = 0;
                        this.Native.cy.baseVal.value = 0;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X;
                        this.Native.cy.baseVal.value = p.Y;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Position", {
                get: function () {
                    return new TypeViz.Point(this.Center.X - this.Radius, this.Center.Y - this.Radius);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = 0;
                        this.Native.cy.baseVal.value = 0;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X + this.Radius;
                        this.Native.cy.baseVal.value = p.Y + this.Radius;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Height", {
                get: function () {
                    return 2 * this.Radius;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Circle.prototype, "Width", {
                get: function () {
                    return 2 * this.Radius;
                },
                enumerable: true,
                configurable: true
            });

            Circle.prototype.Drag = function (action) {
                var ctx = this;

                if (!this.Canvas)
                    throw "Add this visual first to the Canvas before calling this method.";
                this.Canvas.MouseDown(function (e) {
                    var r = new TypeViz.Rect(ctx.Position.X, ctx.Position.Y, 2 * ctx.Radius, 2 * ctx.Radius);
                    var p = new TypeViz.Point(e.clientX, e.clientY);
                    ctx.dragOffset = new TypeViz.Point(ctx.Position.X - e.clientX, ctx.Position.Y - e.clientY);
                    if (r.Contains(p)) {
                        ctx.Canvas.Native.setAttribute("cursor", 'move');
                        ctx.isDragging = true;
                    }
                });
                this.Canvas.MouseMove(function (e) {
                    if (!ctx.isDragging)
                        return;
                    ctx.Position = new TypeViz.Point(e.clientX + ctx.dragOffset.X, e.clientY + ctx.dragOffset.Y);
                    if (action)
                        action(ctx.Position, ctx);
                });
                this.Canvas.MouseUp(function (e) {
                    ctx.isDragging = false;
                    ctx.Canvas.Native.setAttribute("cursor", 'default');
                });
            };
            return Circle;
        })(EllipseBase);
        SVG.Circle = Circle;

        var CanvasOptions = (function () {
            function CanvasOptions() {
                this.Width = 1024;
                this.Height = 768;
                this.BackgroundColor = "Transparent";
            }
            return CanvasOptions;
        })();
        SVG.CanvasOptions = CanvasOptions;
        var FactoryEngine = (function () {
            function FactoryEngine(factory, dataContext, canvas) {
                this.factory = factory;
                this.dataContext = dataContext;
                this.single = !(this.factory instanceof Array);
                this.canvas = canvas;
                this.dataSets = [];
            }
            FactoryEngine.prototype.Run = function () {
                this.prepare();
                this.create();
                this.bind();
            };

            FactoryEngine.prototype.prepare = function () {
                if (this.single) {
                    this.factory = [this.factory];
                }
                for (var i = 0; i < this.factory.length; i++) {
                    this.access(i);
                }
            };

            FactoryEngine.prototype.create = function () {
                this.visuals = [];
                for (var k = 0; k < this.factory.length; k++) {
                    var factor = this.factory[k];
                    if (!factor.creator)
                        throw "No creator method found at index " + k + ".";
                    var series = this.dataSets[k];
                    if (!series)
                        throw "No data array found for factory at index " + k + ".";
                    var visualset = [];
                    for (var i = 0; i < series.length; i++) {
                        var item = series[i];
                        var visual = factor.creator.call(this, item, i, series);
                        if (!visual || !(visual instanceof Visual))
                            throw "No visual returned from creator at index " + i + ".";
                        this.canvas.Append(visual);
                        visualset.push(visual);
                    }
                    this.visuals.push(visualset);
                }
            };

            FactoryEngine.prototype.bind = function () {
                for (var k = 0; k < this.factory.length; k++) {
                    var factor = this.factory[k];
                    if (!factor.binders)
                        continue;
                    var visualset = this.visuals[k];
                    if (visualset.length == 0)
                        continue;

                    for (var i = 0; i < visualset.length; i++) {
                        var visual = visualset[i];
                        factor.binders.call(this.canvas, visual, i);
                    }
                }
            };

            FactoryEngine.prototype.access = function (index) {
                var factor = this.factory[index];
                if (!factor.accessor)
                    return;
                var data = factor.accessor(this.dataContext);
                if (!data)
                    throw "Accessor returned null dataset.";
                if (!(data instanceof Array))
                    throw "Accessor did not return an Array.";
                this.dataSets[index] = data;
            };
            return FactoryEngine;
        })();
        SVG.FactoryEngine = FactoryEngine;

        var Canvas = (function (_super) {
            __extends(Canvas, _super);
            function Canvas(host, options) {
                if (typeof options === "undefined") { options = new CanvasOptions(); }
                _super.call(this);
                this.markers = [];
                this.gradients = [];
                this.clipPaths = [];
                this.defsNode = document.createElementNS(SVG.NS, "defs");
                this.defsPresent = false;
                this.Visuals = [];
                this.nativeElement = document.createElementNS(SVG.NS, "svg");
                this.nativeElement.setAttributeNS(SVG.NS, 'xlink', SVG.XLINKNS);
                this.Initialize();
                this.HostElement = host;
                this.InsertSVGRootElement(options);
                this.Native.style.background = options.BackgroundColor;

                this.Canvas = this;

                this.HostElement.setAttribute("tabindex", "0");
                this.HostElement.focus();
            }
            Canvas.prototype.MousePosition = function (e) {
                var currentPosition = new TypeViz.Point(e.pageX, e.pageY);
                var node = this.HostElement;

                while (node != null) {
                    currentPosition.X -= node.offsetLeft;
                    currentPosition.Y -= node.offsetTop;
                    node = node.offsetParent;
                }
                return currentPosition;
            };

            Canvas.prototype.Define = function (factory) {
                if (!factory)
                    throw "No factory given";
                var engine = new FactoryEngine(factory, this.DataContext, this);
                engine.Run();
            };

            Object.defineProperty(Canvas.prototype, "DataContext", {
                get: function () {
                    return this.canvasDataContext;
                },
                set: function (value) {
                    this.canvasDataContext = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Canvas.prototype, "KeyPress", {
                set: function (f) {
                    this.HostElement.addEventListener("keypress", f);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Canvas.prototype, "KeyDown", {
                set: function (f) {
                    this.HostElement.addEventListener("keydown", f);
                },
                enumerable: true,
                configurable: true
            });

            Canvas.prototype.Focus = function () {
                this.HostElement.focus();
            };

            Canvas.prototype.InsertSVGRootElement = function (options) {
                this.HostElement.style.width = options.Width.toString();
                this.HostElement.style.height = options.Height.toString();
                this.Width = parseInt(options.Width.toString());
                this.Height = parseInt(options.Height.toString());
                this.Native.setAttribute("width", options.Width.toString());
                this.Native.setAttribute("height", options.Height.toString());
                this.Native.id = "SVGRoot";
                this.HostElement.appendChild(this.nativeElement);
            };

            Object.defineProperty(Canvas.prototype, "Width", {
                get: function () {
                    return this.Native.width.animVal.value;
                },
                set: function (value) {
                    this.Native.setAttribute("width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Canvas.prototype, "Height", {
                get: function () {
                    return this.Native.height.baseVal.value;
                },
                set: function (value) {
                    this.Native.setAttribute("height", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Canvas.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Canvas.prototype.Append = function (shape) {
                this.Native.appendChild(shape.Native);
                shape.Canvas = this;
                if (shape["OnAppendToCanvas"] != null)
                    shape["OnAppendToCanvas"](this);
                this.Visuals.push(shape);

                if (shape.Position)
                    shape.Position = shape.Position;
                return this;
            };

            Canvas.prototype.Remove = function (visual) {
                if (this.Visuals.indexOf(visual) >= 0) {
                    this.Native.removeChild(visual.Native);
                    if (visual["OnAppendToCanvas"] != null)
                        visual["OnAppendToCanvas"](this);
                    visual.Canvas = null;
                    this.Visuals.Remove(visual);
                    return this;
                }
                return null;
            };

            Canvas.prototype.InsertBefore = function (visual, beforeVisual) {
                this.Native.insertBefore(visual.Native, beforeVisual.Native);
                visual.Canvas = this;
                this.Visuals.push(visual);
                return this;
            };

            Canvas.prototype.Prepend = function (visual) {
                this.Append(visual);
                this.SendToBack(visual);
            };

            Canvas.prototype.SendToBack = function (visual) {
                if (this.Visuals.indexOf(visual) < 0)
                    throw "The visual is not part of the canvas.";

                var element = visual.Native;
                if (element.previousSibling) {
                    element.parentNode.insertBefore(element, element.parentNode.firstChild);
                }
            };

            Canvas.prototype.SendToFront = function (visual) {
                if (!this.Visuals.Contains(visual))
                    throw "The visual is not part of the canvas.";
                var element = visual.Native;
                element.parentNode.appendChild(element);
            };

            Canvas.prototype.GetTransformedPoint = function (x, y) {
                var p = this.Native.createSVGPoint();
                p.x = x;
                p.y = y;
                return p.matrixTransform(this.Native.getScreenCTM().inverse());
            };

            Object.defineProperty(Canvas.prototype, "Markers", {
                get: function () {
                    return this.markers;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Canvas.prototype, "Gradients", {
                get: function () {
                    return this.gradients;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Canvas.prototype, "ClipPaths", {
                get: function () {
                    return this.clipPaths;
                },
                enumerable: true,
                configurable: true
            });

            Canvas.prototype.ensureDefsNode = function () {
                if (this.defsPresent)
                    return;
                if (this.nativeElement.childNodes.length > 0)
                    this.Native.insertBefore(this.defsNode, this.Native.childNodes[0]);
                else
                    this.Native.appendChild(this.defsNode);
                this.defsPresent = true;
            };

            Canvas.prototype.AddMarker = function (marker) {
                this.ensureDefsNode();
                this.defsNode.appendChild(marker.Native);
                this.markers.push(marker);
            };

            Canvas.prototype.RemoveMarker = function (marker) {
                if (marker == null)
                    throw "The given Marker is null";
                if (!this.markers.Contains(marker))
                    throw "The given Marker is not part of the Canvas";
                this.defsNode.removeChild(marker.Native);
                this.markers.Remove(marker);
            };

            Canvas.prototype.RemoveGradient = function (gradient) {
                if (gradient == null)
                    throw "The given Gradient is null";
                if (!this.gradients.Contains(gradient))
                    throw "The given Gradient is not part of the Canvas";
                this.defsNode.removeChild(gradient.Native);
                this.gradients.Remove(gradient);
            };

            Canvas.prototype.AddGradient = function (gradient) {
                this.ensureDefsNode();
                this.defsNode.appendChild(gradient.Native);
                this.gradients.push(gradient);
            };

            Canvas.prototype.AddClipPath = function (clipPath) {
                this.ensureDefsNode();
                this.defsNode.appendChild(clipPath.Native);
                this.clipPaths.push(clipPath);
            };

            Canvas.prototype.RemoveClipPath = function (clipPath) {
                this.ensureDefsNode();
                this.defsNode.removeChild(clipPath.Native);
                this.clipPaths.Remove(clipPath);
            };

            Canvas.prototype.ClearMarkers = function () {
                if (this.markers.length == 0)
                    return;

                for (var i = 0; i < this.markers.length; i++)
                    this.defsNode.removeChild(this.markers[i].Native);
                this.markers = [];
            };

            Canvas.prototype.ClearGradients = function () {
                if (this.gradients.length == 0)
                    return;
                for (var i = 0; i < this.gradients.length; i++)
                    this.defsNode.removeChild(this.gradients[i].Native);
                this.gradients = [];
            };

            Canvas.prototype.ClearClipPaths = function () {
                if (this.clipPaths.length == 0)
                    return;
                for (var i = 0; i < this.clipPaths.length; i++)
                    this.defsNode.removeChild(this.clipPaths[i].Native);
                this.clipPaths = [];
            };

            Canvas.prototype.Clear = function () {
                this.ClearMarkers();
                this.ClearGradients();
                this.ClearClipPaths();
                while (this.Visuals.length > 0) {
                    this.Remove(this.Visuals[0]);
                }
            };

            Canvas.prototype.GetId = function (id) {
                var first = Array.prototype.First;
                return first.call(this.Native.childNodes, function (c) {
                    return c.id == id;
                });
            };

            Canvas.prototype.Contains = function (visual) {
                return this.Visuals.Contains(visual);
            };

            Canvas.prototype.FadeIn = function (visual, duration, complete) {
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeIn cannot proceed, the given visual is null.";
                visual.Opacity = 0;
                if (!this.Contains(visual)) {
                    this.Append(visual);
                }
                visual.Change({ Opacity: 1, Duration: duration }, complete).Play();
            };
            Canvas.prototype.FadeOut = function (visual, remove, duration, complete) {
                if (typeof remove === "undefined") { remove = true; }
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeOut cannot proceed, the given visual is null.";
                var c = this;
                visual.Change({ Opacity: 0, Duration: duration }, function () {
                    if (remove) {
                        c.Remove(visual);
                    }
                    if (TypeViz.IsDefined(complete)) {
                        complete(visual);
                    }
                });
            };
            return Canvas;
        })(Visual);
        SVG.Canvas = Canvas;

        var Markers = (function () {
            function Markers() {
            }
            Object.defineProperty(Markers, "ArrowStart", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-30,-40l30,-40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Arrow" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "ArrowEnd", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m100,50l-100,40l30,-40l-30,-40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Arrow" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "FilledCircle", {
                get: function () {
                    var marker = new Marker();
                    var circle = new SVG.Circle();
                    circle.Radius = 30;
                    circle.Center = new TypeViz.Point(50, 50);
                    circle.StrokeThickness = 10;
                    marker.Path = circle;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "FilledCircle" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "Circle", {
                get: function () {
                    var marker = new Marker();
                    var circle = new SVG.Circle();
                    circle.Radius = 30;
                    circle.Center = new TypeViz.Point(50, 50);
                    circle.StrokeThickness = 10;
                    marker.Path = circle;
                    marker.Background = "none";
                    circle.Stroke = "Black";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Circle" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "OpenArrowStart", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-30,-40l30,-40l-100,40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.Background = "none";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "OpenArrowStart" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "OpenArrowEnd", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m100,50l-100,40l30,-40l-30,-40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.Background = "none";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "OpenArrowEnd" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "FilledDiamond", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m20,20l0,60l60,0l0,-60l-60,0z";
                    path.Transform(new Rotation(45, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "FilledDiamond" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "Diamond", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m20,20l0,60l60,0l0,-60l-60,0z";
                    path.Transform(new Rotation(45, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.Background = "none";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Diamond" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "WedgeStart", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-94,-40l94,-40l-100,40z";

                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "WedgeStart" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "WedgeEnd", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-94,-40l94,-40l-100,40z";
                    path.Transform(new Rotation(180, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "WedgeEnd" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "Square", {
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m20,20l0,60l60,0l0,-60z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Square" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });
            return Markers;
        })();
        SVG.Markers = Markers;

        var Arc = (function (_super) {
            __extends(Arc, _super);
            function Arc() {
                _super.call(this);
                this.innerRadius = 30;
                this.outerRadius = 100;
                this.startAngle = 0;
                this.endAngle = Math.PI;
                this.center = new TypeViz.Point(0, 0);
                this.arcMax = 2 * Math.PI - 1e-6;
                this.arcOffset = -Math.PI / 2;
                this.updateData();
            }
            Object.defineProperty(Arc.prototype, "Center", {
                get: function () {
                    return this.center;
                },
                set: function (v) {
                    this.center = v;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "InnerRadius", {
                get: function () {
                    return this.innerRadius;
                },
                set: function (value) {
                    this.innerRadius = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "OuterRadius", {
                get: function () {
                    return this.outerRadius;
                },
                set: function (value) {
                    this.outerRadius = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "StartAngle", {
                get: function () {
                    return this.startAngle;
                },
                set: function (value) {
                    this.startAngle = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "EndAngle", {
                get: function () {
                    return this.endAngle;
                },
                set: function (value) {
                    this.endAngle = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Arc.prototype.updateData = function () {
                this.Position = this.Center;
                var r0 = this.innerRadius, r1 = this.outerRadius, a0 = this.startAngle + this.arcOffset, a1 = this.endAngle + this.arcOffset, da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0), df = da < Math.PI ? "0" : "1", c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
                this.Data = da >= this.arcMax ? (r0 ? "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1) + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "M0," + r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + (-r0) + "A" + r0 + "," + r0 + " 0 1,0 0," + r0 + "Z" : "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1) + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "Z") : (r0 ? "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L" + r0 * c1 + "," + r0 * s1 + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0 + "Z" : "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L0,0" + "Z");
            };
            return Arc;
        })(PathBase);
        SVG.Arc = Arc;

        (function (Interpolators) {
            function LinearInterpolator(points, options) {
                if (options != null && options.IsClosed)
                    return points.join("L") + "Z";
                else
                    return points.join("L");
            }
            Interpolators.LinearInterpolator = LinearInterpolator;

            function LineStepInterpolator(points, options) {
                var i = 0, n = points.length, p = points[0], path = [p[0], ",", p[1]];
                while (++i < n)
                    path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
                if (n > 1)
                    path.push("H", p[0]);
                return path.join("");
            }
            Interpolators.LineStepInterpolator = LineStepInterpolator;

            function CardinalInterpolator(points, options) {
                return points.length < 3 ? LinearInterpolator(points, null) : points[0] + HermiteSpline(points, CardinalTangents(points, options));
            }
            Interpolators.CardinalInterpolator = CardinalInterpolator;

            function SplineInterpolator(points, options) {
                if (points.length < 3)
                    return LinearInterpolator(points, null);
                var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [x0, x0, x0, (pi = points[1])[0]], py = [y0, y0, y0, pi[1]], path = [x0, ",", y0, "L", DotProduct(bezierVector3, px), ",", DotProduct(bezierVector3, py)];
                points.push(points[n - 1]);
                while (++i <= n) {
                    pi = points[i];
                    px.shift();
                    px.push(pi[0]);
                    py.shift();
                    py.push(pi[1]);
                    BezierBasis(path, px, py);
                }
                points.pop();
                path.push("L", pi);
                return path.join("");
            }
            Interpolators.SplineInterpolator = SplineInterpolator;

            function CardinalTangents(points, options) {
                var tangents = [], a = (1 - options.Tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
                while (++i < n) {
                    p0 = p1;
                    p1 = p2;
                    p2 = points[i];
                    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
                }
                return tangents;
            }
            ;

            function DotProduct(a, b) {
                return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
            }

            function BezierBasis(path, x, y) {
                path.push("C", DotProduct(bezierVector1, x), ",", DotProduct(bezierVector1, y), ",", DotProduct(bezierVector2, x), ",", DotProduct(bezierVector2, y), ",", DotProduct(bezierVector3, x), ",", DotProduct(bezierVector3, y));
            }

            function HermiteSpline(points, tangents) {
                if (tangents.length < 1 || (points.length != tangents.length && points.length != tangents.length + 2)) {
                    return LinearInterpolator(points, null);
                }
                var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;

                if (quad) {
                    path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
                    p0 = points[1];
                    pi = 2;
                }

                if (tangents.length > 1) {
                    t = tangents[1];
                    p = points[pi];
                    pi++;
                    path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
                    for (var i = 2; i < tangents.length; i++, pi++) {
                        p = points[pi];
                        t = tangents[i];
                        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
                    }
                }

                if (quad) {
                    var lp = points[pi];
                    path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
                }

                return path;
            }

            var bezierVector1 = [0, 2 / 3, 1 / 3, 0], bezierVector2 = [0, 1 / 3, 2 / 3, 0], bezierVector3 = [0, 1 / 6, 2 / 3, 1 / 6];
        })(SVG.Interpolators || (SVG.Interpolators = {}));
        var Interpolators = SVG.Interpolators;

        SVG.DefaultInterpolationOptions = {
            projection: TypeViz.Identity,
            xProjector: function (p) {
                return p[0];
            },
            yProjector: function (p) {
                return p[1];
            },
            IsClosed: false,
            Tension: 0.7,
            Interpolator: Interpolators.LinearInterpolator
        };

        function Interpolate(options) {
            options = options == null ? SVG.DefaultInterpolationOptions : TypeViz.MergeOptions(SVG.DefaultInterpolationOptions, options);
            var x = options.xProjector, y = options.yProjector, projection = options.projection, defined = TypeViz.TrueFunction, interpolate = options.Interpolator;

            function line(data) {
                var segments = [], points = [], i = -1, n = data.length, d, fx = TypeViz.Functor(x), fy = TypeViz.Functor(y);

                function segment() {
                    segments.push("M", interpolate(projection(points), options));
                }

                while (++i < n) {
                    if (defined.call(this, d = data[i], i)) {
                        points.push([+fx.call(this, d, i), +fy.call(this, d, i)]);
                    } else if (points.length) {
                        segment();
                        points = [];
                    }
                }

                if (points.length)
                    segment();

                return segments.length ? segments.join("") : null;
            }

            return line;
        }
        SVG.Interpolate = Interpolate;

        (function (Cursors) {
            Cursors[Cursors["CrossHair"] = 0] = "CrossHair";
            Cursors[Cursors["Default"] = 1] = "Default";
            Cursors[Cursors["Pointer"] = 2] = "Pointer";
            Cursors[Cursors["Move"] = 3] = "Move";
            Cursors[Cursors["EastResize"] = 4] = "EastResize";
            Cursors[Cursors["NorthEastResize"] = 5] = "NorthEastResize";
            Cursors[Cursors["NorthWestResize"] = 6] = "NorthWestResize";
            Cursors[Cursors["NorthResize"] = 7] = "NorthResize";
            Cursors[Cursors["SouthEastResize"] = 8] = "SouthEastResize";
            Cursors[Cursors["SouthWestResize"] = 9] = "SouthWestResize";
            Cursors[Cursors["SouthResize"] = 10] = "SouthResize";
            Cursors[Cursors["WestResize"] = 11] = "WestResize";
            Cursors[Cursors["Text"] = 12] = "Text";
            Cursors[Cursors["Wait"] = 13] = "Wait";
            Cursors[Cursors["Help"] = 14] = "Help";
        })(SVG.Cursors || (SVG.Cursors = {}));
        var Cursors = SVG.Cursors;
    })(TypeViz.SVG || (TypeViz.SVG = {}));
    var SVG = TypeViz.SVG;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    (function (Maths) {
        Maths.Epsilon = 1E-6;
        var GammaConstants = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

        var PrecomputedFactorials = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1124000727777607680000, 25852016738884976640000, 620448401733239439360000, 15511210043330985984000000, 403291461126605635584000000, 10888869450418352160768000000, 304888344611713860501504000000, 8841761993739701954543616000000, 265252859812191058636308480000000, 8222838654177922817725562880000000, 263130836933693530167218012160000000, 8683317618811886495518194401280000000, 295232799039604140847618609643520000000, 10333147966386144929666651337523200000000, 371993326789901217467999448150835200000000, 13763753091226345046315979581580902400000000, 523022617466601111760007224100074291200000000, 20397882081197443358640281739902897356800000000, 815915283247897734345611269596115894272000000000, 33452526613163807108170062053440751665152000000000, 1405006117752879898543142606244511569936384000000000, 60415263063373835637355132068513997507264512000000000, 2658271574788448768043625811014615890319638528000000000, 119622220865480194561963161495657715064383733760000000000, 5502622159812088949850305428800254892961651752960000000000, 258623241511168180642964355153611979969197632389120000000000, 12413915592536072670862289047373375038521486354677760000000000, 608281864034267560872252163321295376887552831379210240000000000, 30414093201713378043612608166064768844377641568960512000000000000, 1551118753287382280224243016469303211063259720016986112000000000000, 80658175170943878571660636856403766975289505440883277824000000000000, 4274883284060025564298013753389399649690343788366813724672000000000000, 230843697339241380472092742683027581083278564571807941132288000000000000, 12696403353658275925965100847566516959580321051449436762275840000000000000, 710998587804863451854045647463724949736497978881168458687447040000000000000, 40526919504877216755680601905432322134980384796226602145184481280000000000000, 2350561331282878571829474910515074683828862318181142924420699914240000000000000, 138683118545689835737939019720389406345902876772687432540821294940160000000000000, 8320987112741390144276341183223364380754172606361245952449277696409600000000000000, 507580213877224798800856812176625227226004528988036003099405939480985600000000000000, 31469973260387937525653122354950764088012280797258232192163168247821107200000000000000, 1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000, 126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000, 8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000, 544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000, 36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000, 2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000, 171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000, 11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000, 850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000, 61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000, 4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000, 330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000, 24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000, 1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000, 145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000, 11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000, 894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000, 71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000, 5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000, 475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000, 39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000, 3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000, 281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000, 24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000, 2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000, 185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000, 16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000, 1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000, 135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000, 12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000, 1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000, 108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000, 10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000, 991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000, 96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000, 9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000, 933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000, 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000];

        Maths.Pi = window["Math"].PI;

        function RandomIntegerArray(amount, minimum, maximum) {
            if (typeof amount === "undefined") { amount = 20; }
            if (typeof minimum === "undefined") { minimum = 1; }
            if (typeof maximum === "undefined") { maximum = 100; }
            if (amount <= 1)
                throw "The amount should be at least one.";
            var data = new TypeViz.Maths.Range(1, amount).Values;
            return data.Map(function (d) {
                return TypeViz.Maths.RandomInteger(minimum, maximum);
            });
        }
        Maths.RandomIntegerArray = RandomIntegerArray;

        function Lerp(a, b) {
            if (a instanceof Array && b instanceof Array && a.length == b.length) {
                var f = [];
                for (var i = 0; i < a.length; i++) {
                    f.push(Lerp(a[i], b[i]));
                }
                return function (t) {
                    var r = [];
                    for (var i = 0; i < a.length; i++) {
                        r.push(f[i](t));
                    }
                    return r;
                };
            } else
                return function (t) {
                    return a + (b - a) * t;
                };
        }
        Maths.Lerp = Lerp;

        function RandomReal(min, max) {
            if (TypeViz.IsUndefined(min))
                min = 0;
            if (TypeViz.IsUndefined(max))
                max = 1;
            return window["Math"].random() * (max - min) + min;
        }
        Maths.RandomReal = RandomReal;
        function RandomPosition(widthInterval, heightInterval) {
            if (typeof widthInterval === "undefined") { widthInterval = null; }
            if (typeof heightInterval === "undefined") { heightInterval = null; }
            if (TypeViz.IsUndefined(widthInterval)) {
                widthInterval = new TypeViz.Maths.Interval(0, 1000);
            }
            if (TypeViz.IsUndefined(heightInterval)) {
                heightInterval = new TypeViz.Maths.Interval(0, 1000);
            }
            return new TypeViz.Point(RandomInteger(widthInterval.From, widthInterval.To), RandomInteger(heightInterval.From, heightInterval.To));
        }
        Maths.RandomPosition = RandomPosition;

        function RandomInteger(min, max) {
            if (TypeViz.IsUndefined(min))
                min = 0;
            if (TypeViz.IsUndefined(max))
                max = 100;
            return parseInt(RandomReal(min, max));
        }
        Maths.RandomInteger = RandomInteger;

        function Gamma(z) {
            var g = 7;
            if (z < 0.5)
                return Maths.Pi / (Sin(Maths.Pi * z) * Gamma(1 - z));
            else {
                z -= 1;
                var x = GammaConstants[0];
                for (var i = 1; i < g + 2; i++)
                    x += GammaConstants[i] / (z + i);
                var t = z + g + 0.5;
                return Sqrt(2 * Maths.Pi) * Pow(t, (z + 0.5)) * Exp(-t) * x;
            }
        }
        Maths.Gamma = Gamma;

        function Factorial(n) {
            if (n > (PrecomputedFactorials.length - 1))
                throw "The factorial is outside the acceptable range.";
            return PrecomputedFactorials[n - 1];
        }
        Maths.Factorial = Factorial;

        function LogFactorial(x) {
            if (x <= 1)
                x = 1;

            if (x < 12)
                return Log(Factorial(Round(x)));
            else {
                var invx = 1 / x;
                var invx2 = invx * invx;
                var invx3 = invx2 * invx;
                var invx5 = invx3 * invx2;
                var invx7 = invx5 * invx2;

                var sum = ((x + 0.5) * Log(x)) - x;
                sum += Log(2 * Maths.Pi) / 2;
                sum += (invx / 12) - (invx3 / 360);
                sum += (invx5 / 1260) - (invx7 / 1680);

                return sum;
            }
        }
        Maths.LogFactorial = LogFactorial;

        function Sin(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].sin);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].sin);
            else
                return window["Math"].sin(d);
        }
        Maths.Sin = Sin;
        function Sign(d) {
            return window["Math"].sin(d);
        }
        Maths.Sign = Sign;

        function Abs(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].abs);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].abs);
            else
                return window["Math"].abs(d);
        }
        Maths.Abs = Abs;

        function Log(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].log);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].log);
            else
                return window["Math"].log(d);
        }
        Maths.Log = Log;

        function Round(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].round);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].round);
            else
                return window["Math"].round(d);
        }
        Maths.Round = Round;

        function Floor(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].floor);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].floor);
            else
                return window["Math"].floor(d);
        }
        Maths.Floor = Floor;

        function Ceiling(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].ceiling);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].ceiling);
            else
                return window["Math"].ceiling(d);
        }
        Maths.Ceiling = Ceiling;

        function Tan(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].tan);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].tan);
            return window["Math"].tan(d);
        }
        Maths.Tan = Tan;

        function Atan2(y, x) {
            return window["Math"].atan2(y, x);
        }
        Maths.Atan2 = Atan2;

        function Cos(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].cos);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].cos);
            else
                return window["Math"].cos(d);
        }
        Maths.Cos = Cos;

        function Sqrt(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].sqrt);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].sqrt);
            else
                return window["Math"].sqrt(d);
        }
        Maths.Sqrt = Sqrt;

        function Exp(d) {
            if (TypeViz.IsArray(d))
                return d.Map(window["Math"].exp);
            if (d instanceof Range)
                return d.Values.Map(window["Math"].exp);
            else
                return window["Math"].exp(d);
        }
        Maths.Exp = Exp;

        function Pow(d, e) {
            if (TypeViz.IsArray(d))
                return d.Map(function (x) {
                    return window["Math"].pow(x, e);
                });
            if (d instanceof Range)
                d.Values.Map(function (x) {
                    return window["Math"].pow(x, e);
                });
            else
                return window["Math"].pow(d, e);
        }
        Maths.Pow = Pow;

        function LogBinomial(n, k) {
            if ((k == 0) || (k == n))
                return 0;
            else if ((k > n) || (k < 0))
                return -1E38;
            else
                return (LogFactorial(n) - LogFactorial(k) - LogFactorial(n - k));
        }
        Maths.LogBinomial = LogBinomial;

        function RangeValues(start, stop, step) {
            if (typeof stop === "undefined") { stop = null; }
            if (typeof step === "undefined") { step = null; }
            return new Range(start, stop, step).Values;
        }
        Maths.RangeValues = RangeValues;

        var Interval = (function () {
            function Interval(fromOrObject, to) {
                if (TypeViz.IsDefined(to)) {
                    if (TypeViz.IsNumber(to) && TypeViz.IsNumber(fromOrObject)) {
                        this.from = fromOrObject;
                        this.to = fromOrObject;
                    } else
                        throw "The Extent expects two numbers.";
                } else if (TypeViz.IsDefined(fromOrObject)) {
                    if (fromOrObject instanceof Array) {
                        if (fromOrObject.length == 2) {
                            this.from = fromOrObject[0];
                            this.to = fromOrObject[1];
                        } else
                            throw "Expecting an array of two numbers in the Extent.";
                    } else if (fromOrObject instanceof TypeViz.Maths.Range) {
                        var range = fromOrObject.Values;
                        this.from = range[0];
                        this.to = range[range.length - 1];
                    }
                }
            }
            Object.defineProperty(Interval.prototype, "From", {
                get: function () {
                    return this.from;
                },
                set: function (value) {
                    this.from = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Interval.prototype, "To", {
                get: function () {
                    return this.to;
                },
                set: function (value) {
                    this.to = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Interval.prototype, "Size", {
                get: function () {
                    return Maths.Abs(this.to - this.from);
                },
                enumerable: true,
                configurable: true
            });
            return Interval;
        })();
        Maths.Interval = Interval;

        var Range = (function () {
            function Range(start, stop, step) {
                if (typeof stop === "undefined") { stop = null; }
                if (typeof step === "undefined") { step = null; }
                if (step == null) {
                    step = 1;
                }
                if (stop == null) {
                    if (start instanceof Array) {
                        var ar = start;
                        if (ar.length < 2)
                            throw "The array needs two or three elements (the last one being the step size).";
                        if (ar.length == 3) {
                            step = ar[2];
                        }
                        start = ar[0];
                        stop = ar[1];
                    } else {
                        stop = start;
                        start = 0;
                    }
                }
                if ((stop - start) / step === Infinity)
                    throw "Infinite range defined.";
                var range = [];
                var i = -1;
                var j;
                var k = this.RangeIntegerScale(Math.abs(step));
                start *= k;
                stop *= k;
                step *= k;
                if (step < 0)
                    while ((j = start + step * ++i) >= stop)
                        range.push(j / k);
                else
                    while ((j = start + step * ++i) <= stop)
                        range.push(j / k);
                this.Values = range;
            }
            Object.defineProperty(Range.prototype, "length", {
                get: function () {
                    return this.Values == null ? 0 : this.Values.length;
                },
                enumerable: true,
                configurable: true
            });

            Range.prototype.RangeIntegerScale = function (x) {
                var k = 1;
                while (x * k % 1)
                    k *= 10;
                return k;
            };

            Range.Create = function (start, stop, step) {
                if (typeof stop === "undefined") { stop = null; }
                if (typeof step === "undefined") { step = null; }
                return new Range(start, stop, step);
            };
            return Range;
        })();
        Maths.Range = Range;

        (function (Statistics) {
            function RandomVariable(distribution) {
                if (TypeViz.IsUndefined(distribution))
                    distribution = TypeViz.Maths.Statistics.UniformDistribution();
                return function (amount) {
                    if (TypeViz.IsUndefined(amount)) {
                        return distribution();
                    } else {
                        var r = [];
                        for (var i = 0; i < amount; i++) {
                            r.push(distribution());
                        }
                        return r;
                    }
                };
            }
            Statistics.RandomVariable = RandomVariable;
            ;

            function UniformDistribution(min, max) {
                if (typeof min === "undefined") { min = 0; }
                if (typeof max === "undefined") { max = 1; }
                if (min >= max)
                    throw "The minimum should be less than the maximum.";
                return function () {
                    return Maths.RandomReal(min, max);
                };
            }
            Statistics.UniformDistribution = UniformDistribution;

            function NormalDistribution(µ, σ) {
                if (TypeViz.IsUndefined(σ))
                    σ = 1;
                if (TypeViz.IsUndefined(µ))
                    µ = 0;
                return function () {
                    var x, y, r;
                    do {
                        x = Maths.RandomReal(-1, 1);
                        y = Maths.RandomReal(-1, 1);
                        r = x * x + y * y;
                    } while(!r || r > 1);
                    return µ + σ * x * Maths.Sqrt(-2 * Maths.Log(r) / r);
                };
            }
            Statistics.NormalDistribution = NormalDistribution;

            function LogNormal(µ, σ) {
                var random = NormalDistribution(µ, σ);
                return function () {
                    return Maths.Exp(random());
                };
            }
            Statistics.LogNormal = LogNormal;

            function PoissonDistribution(lambda) {
                return function poisson() {
                    var n = 0, limit = Maths.Exp(-lambda), x = Maths.RandomReal();
                    while (x > limit) {
                        n++;
                        x *= Maths.RandomReal();
                        ;
                    }
                    return n;
                };
            }
            Statistics.PoissonDistribution = PoissonDistribution;

            function DiscreteUniformDistribution(min, max) {
                if (typeof min === "undefined") { min = 0; }
                if (typeof max === "undefined") { max = 100; }
                if (min >= max)
                    throw "The minimum should be less than the maximum.";
                return function () {
                    return Maths.RandomInteger(min, max);
                };
            }
            Statistics.DiscreteUniformDistribution = DiscreteUniformDistribution;
        })(Maths.Statistics || (Maths.Statistics = {}));
        var Statistics = Maths.Statistics;
    })(TypeViz.Maths || (TypeViz.Maths = {}));
    var Maths = TypeViz.Maths;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    

    

    var ModelBase = (function () {
        function ModelBase() {
            this.handlers = [];
        }
        ModelBase.prototype.Subscribe = function (handler) {
            this.handlers.push(handler);
        };

        ModelBase.prototype.RemoveSubscriber = function (handler) {
            this.handlers = this.handlers.filter(function (h) {
                return h !== handler;
            });
        };

        ModelBase.prototype.RaiseChanged = function (subsetName, changedRaiser) {
            if (typeof subsetName === "undefined") { subsetName = null; }
            if (typeof changedRaiser === "undefined") { changedRaiser = this; }
            var _this = this;
            if (this.handlers) {
                this.handlers.ForEach(function (h) {
                    return h.call(changedRaiser, _this, subsetName);
                });
            }
        };
        return ModelBase;
    })();
    TypeViz.ModelBase = ModelBase;
})(TypeViz || (TypeViz = {}));

if (!Array.prototype.BiSort) {
    Array.prototype.BiSort = TypeViz.BiSort;
}
var TypeViz;
(function (TypeViz) {
    (function (Animation) {
        var Point = TypeViz.Point;

        var Animator = (function () {
            function Animator(subjects) {
                this.subjects = [];
                this.stories = [];
                this.currentStoryIndex = -1;
                this.doloop = false;
                for (var i = 0; i < subjects.length; i++) {
                    this.subjects.push(subjects[i]);
                }
            }
            Animator.prototype.Change = function (to, complete) {
                var ticker = new Ticker();
                if (to.Easing) {
                    ticker.Easing = to.Easing();
                }
                if (to.Duration) {
                    ticker.Duration = to.Duration;
                    delete to.Duration;
                }
                var adapter = new GenericAdapter(this.subjects, to, null);
                ticker.AddAdapter(adapter);
                this.stories.push(ticker);
                if (complete) {
                    ticker.onComplete(complete);
                }
                return this;
            };

            Animator.prototype.moveTo = function (p) {
                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.PositionAdapter(this.subjects, "", null, p, null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            };

            Animator.prototype.changeOpacity = function (v) {
                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.NumericalStyleAdapter(this.subjects, "Opacity", 1, 0, null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            };

            Animator.prototype.changeAngle = function (a) {
                var ticker = new Ticker();
                var adapter = new TypeViz.Animation.NumericalStyleAdapter(this.subjects, "EndAngle", Math.PI, a, null);
                ticker.AddAdapter(adapter);
                this.stories.push(ticker);
                return this;
            };

            Animator.prototype.changeColor = function (color) {
                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.ColorStyleAdapter(this.subjects, "Background", "#FF0000", "#00FF00", null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            };

            Animator.prototype.Play = function () {
                if (this.subjects.length == 0 || this.stories.length == 0)
                    return;
                this.currentStoryIndex = -1;
                this.next();
            };

            Animator.prototype.loop = function () {
                this.doloop = true;
                return this;
            };

            Animator.prototype.nextHandler = function () {
                this.next();
            };

            Animator.prototype.next = function () {
                if (this.currentStory != null) {
                    this.currentStory.removeHandler(this.nextHandler);
                }
                if (this.currentStoryIndex < this.stories.length - 1) {
                    this.currentStoryIndex++;
                    this.currentStory = this.stories[this.currentStoryIndex];
                    this.currentStory.onComplete(this.nextHandler);
                    this.currentStory.init();
                    this.currentStory.play(this);
                    return;
                }
                if (this.doloop) {
                    this.Play();
                }
            };

            Animator.prototype.Clear = function () {
                this.currentStory = null;
                this.currentStoryIndex = -1;
                this.stories.Clear();
            };
            return Animator;
        })();
        Animation.Animator = Animator;

        var AdapterBase = (function () {
            function AdapterBase() {
                this.rgbRe = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
                this.hexRe = /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
            }
            AdapterBase.prototype.Update = function (t) {
            };

            AdapterBase.prototype.init = function () {
            };

            AdapterBase.prototype.makeArrayOfElements = function (o) {
                if (o == null)
                    return [];
                if ("string" == typeof o)
                    return [document.getElementById(o)];

                if (!o.length)
                    return [o];
                var result = [];
                for (var i = 0; i < o.length; i++) {
                    if ("string" == typeof o[i]) {
                        result[i] = document.getElementById(o[i]);
                    } else {
                        result[i] = o[i];
                    }
                }
                return result;
            };

            AdapterBase.prototype.parseColor = function (s) {
                var color = '#', match;
                var i;
                if (match = this.rgbRe.exec(s)) {
                    var part;
                    for (i = 1; i <= 3; i++) {
                        part = Math.max(0, Math.min(255, parseInt(match[i])));
                        color += this.toColorPart(part);
                    }
                    return color;
                }
                if (match = this.hexRe.exec(s)) {
                    if (match[1].length == 3) {
                        for (i = 0; i < 3; i++) {
                            color += match[1].charAt(i) + match[1].charAt(i);
                        }
                        return color;
                    }
                    return '#' + match[1];
                }
                return "";
            };

            AdapterBase.prototype.toColorPart = function (n) {
                if (n > 255)
                    n = 255;
                var digits = n.toString(16);
                if (n < 16)
                    return '0' + digits;
                return digits;
            };
            return AdapterBase;
        })();
        Animation.AdapterBase = AdapterBase;

        var NumericalStyleAdapter = (function (_super) {
            __extends(NumericalStyleAdapter, _super);
            function NumericalStyleAdapter(subjects, property, from, to, options) {
                _super.call(this);
                this.subjects = this.makeArrayOfElements(subjects);
                if (property == 'opacity' && window["ActiveXObject"]) {
                    this.property = 'filter';
                } else {
                    this.property = TypeViz.Camelize(property);
                }
                this.from = parseFloat(from);
                this.to = parseFloat(to);
                this.units = options.units != null ? options.units : 'px';
            }
            NumericalStyleAdapter.prototype.Update = function (tick) {
                var style = this.GetPropertyValue(tick);
                var visibility = (this.property == 'opacity' && tick == 0) ? 'hidden' : '';
                for (var i = 0; i < this.subjects.length; i++) {
                    try  {
                        if (this.subjects[i] != null) {
                            if (this.subjects[i][this.property] !== null) {
                                this.subjects[i][this.property] = parseFloat(style.toString());
                            }
                        } else {
                            if (this.subjects[i].style[this.property] !== null)
                                this.subjects[i].style[this.property] = style;
                            else if (this.subjects[i][this.property] !== null) {
                                var animl = this.subjects[i][this.property];
                                if (animl) {
                                    animl.baseVal.value = parseFloat(style.toString());
                                }
                            }
                        }
                    } catch (e) {
                        if (this.property != 'fontWeight')
                            throw e;
                    }
                }
            };

            NumericalStyleAdapter.prototype.GetPropertyValue = function (tick) {
                tick = this.from + ((this.to - this.from) * tick);
                if (this.property == 'filter')
                    return "alpha(opacity=" + Math.round(tick * 100) + ")";
                if (this.property == 'Opacity')
                    return tick;
                return tick + this.units;
            };

            NumericalStyleAdapter.prototype.inspect = function () {
                return "\t" + this.property + "(" + this.from + this.units + " to " + this.to + this.units + ")\n";
            };
            return NumericalStyleAdapter;
        })(AdapterBase);
        Animation.NumericalStyleAdapter = NumericalStyleAdapter;

        var ColorStyleAdapter = (function (_super) {
            __extends(ColorStyleAdapter, _super);
            function ColorStyleAdapter(subjects, property, from, to, options) {
                _super.call(this);
                this.subjects = this.makeArrayOfElements(subjects);
                this.property = TypeViz.Camelize(property);
                this.to = this.expandColor(to);
                this.from = this.expandColor(from);
                this.origFrom = from;
                this.origTo = to;
            }
            ColorStyleAdapter.prototype.expandColor = function (color) {
                var hexColor, red, green, blue;
                hexColor = this.parseColor(color);
                if (hexColor) {
                    red = parseInt(hexColor.slice(1, 3), 16);
                    green = parseInt(hexColor.slice(3, 5), 16);
                    blue = parseInt(hexColor.slice(5, 7), 16);
                    return [red, green, blue];
                }
                return null;
            };

            ColorStyleAdapter.prototype.getValueForState = function (color, tick) {
                return Math.round(this.from[color] + ((this.to[color] - this.from[color]) * tick));
            };

            ColorStyleAdapter.prototype.Update = function (tick) {
                var color = '#' + this.toColorPart(this.getValueForState(0, tick)) + this.toColorPart(this.getValueForState(1, tick)) + this.toColorPart(this.getValueForState(2, tick));
                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i][this.property] = color;
                }
            };

            ColorStyleAdapter.prototype.inspect = function () {
                return "\t" + this.property + "(" + this.origFrom + " to " + this.origTo + ")\n";
            };
            return ColorStyleAdapter;
        })(AdapterBase);
        Animation.ColorStyleAdapter = ColorStyleAdapter;

        var DiscreteStyleAdapter = (function (_super) {
            __extends(DiscreteStyleAdapter, _super);
            function DiscreteStyleAdapter(subjects, property, from, to, options) {
                _super.call(this);
                this.subjects = this.makeArrayOfElements(subjects);
                this.property = TypeViz.Camelize(property);
                this.from = from;
                this.to = to;
                this.threshold = options.threshold || 0.5;
            }
            DiscreteStyleAdapter.prototype.Update = function (tick) {
                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i].style[this.property] = tick <= this.threshold ? this.from : this.to;
                }
            };

            DiscreteStyleAdapter.prototype.inspect = function () {
                return "\t" + this.property + "(" + this.from + " to " + this.to + " @ " + this.threshold + ")\n";
            };
            return DiscreteStyleAdapter;
        })(AdapterBase);
        Animation.DiscreteStyleAdapter = DiscreteStyleAdapter;

        var PositionAdapter = (function (_super) {
            __extends(PositionAdapter, _super);
            function PositionAdapter(targets, property, from, to, options) {
                _super.call(this);
                this.targets = [];
                this.froms = [];
                this.tos = [];
                this.targets = targets;
                this.from = from;
                this.to = to;
                if (options && options["UseCenter"])
                    this.useCenter = options["UseCenter"];
                else
                    this.useCenter = false;
            }
            PositionAdapter.prototype.init = function () {
                this.froms = [];
                this.tos = [];

                for (var i = 0; i < this.targets.length; i++) {
                    if (this.from == null)
                        this.froms[i] = this.targets[i].Position;
                    else {
                        this.froms[i] = (this.from != null && this.from instanceof TypeViz.Point) ? this.from : this.from(this.targets[i]);
                    }
                    this.tos[i] = (this.to != null && this.to instanceof TypeViz.Point) ? this.to : this.to(this.targets[i]);
                }
            };

            PositionAdapter.prototype.Update = function (t) {
                if (this.targets.length > 0) {
                    for (var i = 0; i < this.targets.length; i++) {
                        var p = new TypeViz.Point(this.froms[i].X + (this.tos[i].X - this.froms[i].X) * t, this.froms[i].Y + (this.tos[i].Y - this.froms[i].Y) * t);
                        this.useCenter ? this.targets[i]["Center"] = p : this.targets[i].Position = p;
                    }
                }
            };
            return PositionAdapter;
        })(AdapterBase);
        Animation.PositionAdapter = PositionAdapter;

        var DataAdapter = (function (_super) {
            __extends(DataAdapter, _super);
            function DataAdapter(targets, property, from, to, options) {
                _super.call(this);
                this.targets = [];
                this.froms = [];
                this.tos = [];
                this.targets = targets;
                this.from = from;
                this.to = to;
            }
            DataAdapter.prototype.init = function () {
                this.froms = [];
                this.tos = [];
                this.lerp = [];
                for (var i = 0; i < this.targets.length; i++) {
                    if (this.from == null)
                        this.froms[i] = TypeViz.Point.ToArray(this.targets[i].Points);
                    else {
                        throw "Check again Swa.";
                    }
                    if (TypeViz.IsFunction(this.to))
                        throw "Functions not handled yet";
                    this.tos[i] = TypeViz.Point.ToArray(this.to);
                    this.lerp[i] = TypeViz.Arrays.InterpolateArrays(this.froms[i], this.tos[i]);
                }
            };

            DataAdapter.prototype.Update = function (t) {
                if (this.targets.length > 0) {
                    for (var i = 0; i < this.targets.length; i++) {
                        this.targets[i].Points = this.lerp[i](t);
                    }
                }
            };
            return DataAdapter;
        })(AdapterBase);
        Animation.DataAdapter = DataAdapter;

        var GenericAdapter = (function (_super) {
            __extends(GenericAdapter, _super);
            function GenericAdapter(subjects, style2, options) {
                _super.call(this);
                this.PropertyValueAssignmentRegex = /^\s*([a-zA-Z\-]+)\s*:\s*(\S(.+\S)?)\s*$/;
                this.NumberRegex = /^-?\d+(?:\.\d+)?(%|[a-zA-Z]{2})?$/;
                this.DiscreteRegex = /^\w+$/;
                this.adapters = [];
                this.subjects = [];
                this.cssProperties = ['azimuth', 'background', 'background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat', 'border-collapse', 'border-color', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-width', 'bottom', 'clear', 'clip', 'color', 'content', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'css-float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'max-height', 'max-width', 'min-height', 'min-width', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'pause', 'position', 'right', 'size', 'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'top', 'vertical-align', 'visibility', 'white-space', 'width', 'word-spacing', 'z-index', 'opacity', 'outline-offset', 'overflow-x', 'overflow-y'];
                this.defaultOptions = {
                    units: '',
                    Interpolator: TypeViz.SVG.Interpolators.LinearInterpolator,
                    threshold: 0.5,
                    Easing: TypeViz.Animation.Easing.EaseInOut
                };
                this.getStyle = function (el, property) {
                    return el[property];
                };
                this.options = TypeViz.MergeOptions(this.defaultOptions, options);
                this.subjects = this.makeArrayOfElements(subjects);
                this.adapters = [];
                if (this.subjects.length == 0)
                    return;

                this.style2 = style2;
            }
            GenericAdapter.prototype.init = function () {
                var prop;

                this.toStyle = this.style2;
                this.fromStyle = {};
                for (prop in this.toStyle) {
                    this.fromStyle[prop] = this.getStyle(this.subjects[0], prop);
                }

                for (prop in this.fromStyle) {
                    if (this.fromStyle[prop] == this.toStyle[prop]) {
                        delete this.fromStyle[prop];
                        delete this.toStyle[prop];
                    }
                }
                function formatPoints(prepoints) {
                    if (TypeViz.IsUndefined(prepoints))
                        return null;
                    var points;
                    if (TypeViz.IsArray(prepoints)) {
                        if (prepoints.length == 0) {
                            points = [];
                        } else {
                            if (prepoints[0] instanceof TypeViz.Point) {
                                points = TypeViz.Point.ToArray(prepoints);
                            } else
                                points = prepoints;
                        }
                    } else if (TypeViz.IsFunction(prepoints)) {
                        throw "Not implemented yet.";
                    }
                    ;
                    return points;
                }

                var units, match, type, from, to;
                for (prop in this.fromStyle) {
                    var fromValue = String(this.fromStyle[prop]);
                    var toValue = String(this.toStyle[prop]);
                    if (this.toStyle[prop] == null) {
                        if (window["ANIMATOR_DEBUG"])
                            alert("No target property provided for '" + prop + '"');
                        continue;
                    }

                    if (prop == "Data") {
                        from = formatPoints(this.fromStyle[prop]);
                        to = formatPoints(this.toStyle[prop]);
                        type = Animation.DataAdapter;
                    } else if (prop == "Position") {
                        from = this.fromStyle[prop];
                        to = this.toStyle[prop];
                        type = Animation.PositionAdapter;
                    } else if (prop == "Center") {
                        from = this.fromStyle[prop];
                        to = this.toStyle[prop];
                        type = Animation.PositionAdapter;
                        this.options["UseCenter"] = true;
                    } else if (from = this.parseColor(fromValue)) {
                        to = this.parseColor(toValue);
                        type = Animation.ColorStyleAdapter;
                    } else if (fromValue.match(this.NumberRegex) && toValue.match(this.NumberRegex)) {
                        from = parseFloat(fromValue);
                        to = parseFloat(toValue);
                        type = Animation.NumericalStyleAdapter;
                        match = this.NumberRegex.exec(fromValue);
                        var reResult = this.NumberRegex.exec(toValue);
                        if (match[1] != null) {
                            units = match[1];
                        } else if (reResult[1] != null) {
                            units = reResult[1];
                        } else {
                            units = '';
                        }
                    } else if (fromValue.match(this.DiscreteRegex) && toValue.match(this.DiscreteRegex)) {
                        from = fromValue;
                        to = toValue;
                        type = Animation.DiscreteStyleAdapter;
                        units = 0;
                    } else {
                        if (window["ANIMATOR_DEBUG"])
                            alert("Unrecognised format for value of " + prop + ": '" + this.fromStyle[prop] + "'");
                        continue;
                    }

                    this.options.units = units;
                    this.adapters[this.adapters.length] = new type(this.subjects, prop, from, to, this.options);
                }
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].init();
                }
            };

            GenericAdapter.prototype.Update = function (tick) {
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].Update(tick);
                }
            };

            GenericAdapter.prototype.parseStyle = function (style, el) {
                var rtn = {};

                var i;
                if (style.indexOf(":") != -1) {
                    var styles = style.split(";");
                    for (i = 0; i < styles.length; i++) {
                        var parts = this.PropertyValueAssignmentRegex.exec(styles[i]);
                        if (parts.length > 0) {
                            rtn[parts[1]] = parts[2];
                        }
                    }
                } else {
                    var prop, value, oldClass;
                    oldClass = el.className;
                    el.className = style;
                    for (i = 0; i < this.cssProperties.length; i++) {
                        prop = this.cssProperties[i];
                        value = this.getStyle(el, prop);
                        if (value != null) {
                            rtn[prop] = value;
                        }
                    }
                    el.className = oldClass;
                }
                return rtn;
            };

            GenericAdapter.prototype.inspect = function () {
                var str = "";
                for (var i = 0; i < this.adapters.length; i++) {
                    str += this.adapters[i].inspect();
                }
                return str;
            };
            return GenericAdapter;
        })(AdapterBase);
        Animation.GenericAdapter = GenericAdapter;

        var Ticker = (function () {
            function Ticker() {
                var _this = this;
                this.adapters = [];
                this.target = 0;
                this.tick = 0;
                this.interval = 20;
                this.duration = 1000;
                this.lastTime = null;
                this.handlers = [];
                this.forward = true;
                this.isLooping = false;
                this.easingFunction = Easing.EaseInOut();
                this.timerDelegate = function () {
                    _this.onTimerEvent();
                };
            }
            Object.defineProperty(Ticker.prototype, "Easing", {
                get: function () {
                    return this.easingFunction;
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value))
                        throw "The easing function cannot be undefined.";
                    this.easingFunction = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Ticker.prototype, "Duration", {
                get: function () {
                    return this.duration;
                },
                set: function (value) {
                    this.duration = value;
                },
                enumerable: true,
                configurable: true
            });

            Ticker.prototype.AddAdapter = function (a) {
                this.adapters.push(a);
            };

            Ticker.prototype.onComplete = function (handler) {
                this.handlers.push(handler);
            };

            Ticker.prototype.removeHandler = function (handler) {
                this.handlers = this.handlers.filter(function (h) {
                    return h !== handler;
                });
            };

            Ticker.prototype.trigger = function () {
                var _this = this;
                if (this.handlers) {
                    this.handlers.ForEach(function (h) {
                        return h.call(_this.caller != null ? _this.caller : _this);
                    });
                }
            };

            Ticker.prototype.onStep = function () {
            };

            Ticker.prototype.seekTo = function (to) {
                this.forward = this.tick < to;
                this.seekFromTo(this.tick, to);
            };

            Ticker.prototype.seekFromTo = function (from, to) {
                this.forward = from < to;
                this.target = Math.max(0, Math.min(1, to));
                this.tick = Math.max(0, Math.min(1, from));
                this.lastTime = new Date().getTime();
                if (!this.intervalId) {
                    this.intervalId = window.setInterval(this.timerDelegate, this.interval);
                }
            };

            Ticker.prototype.stop = function () {
                if (this.intervalId) {
                    window.clearInterval(this.intervalId);
                    this.intervalId = null;
                    this.trigger();
                }
            };

            Ticker.prototype.play = function (origin) {
                this.forward = true;
                this.isLooping = false;
                if (this.adapters.length == 0)
                    return;
                if (origin != null)
                    this.caller = origin;
                this.seekFromTo(0, 1);
            };
            Ticker.prototype.Loop = function (origin) {
                this.forward = true;
                this.isLooping = true;
                if (this.adapters.length == 0)
                    return;
                if (origin != null)
                    this.caller = origin;
                this.seekFromTo(0, 1);
            };
            Ticker.prototype.reverse = function () {
                if (this.forward)
                    this.seekFromTo(1, 0);
                else
                    this.seekFromTo(0, 1);
            };

            Ticker.prototype.init = function () {
                if (this.adapters.length == 0)
                    return;
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].init();
                }
            };

            Ticker.prototype.propagate = function () {
                var value = this.easingFunction(this.tick);

                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].Update(value);
                }
            };

            Ticker.prototype.onTimerEvent = function () {
                var now = new Date().getTime();
                var timePassed = now - this.lastTime;
                this.lastTime = now;
                var movement = (timePassed / this.duration) * (this.tick < this.target ? 1 : -1);
                if (Math.abs(movement) >= Math.abs(this.tick - this.target)) {
                    this.tick = this.target;
                } else {
                    this.tick += movement;
                }

                try  {
                    this.propagate();
                } finally {
                    this.onStep.call(this);
                    if (this.target == this.tick) {
                        if (this.isLooping)
                            this.reverse();
                        else
                            this.stop();
                    }
                }
            };
            return Ticker;
        })();
        Animation.Ticker = Ticker;

        var Easing = (function () {
            function Easing() {
            }
            Easing.EaseInOut = function () {
                return Easing.makeEaseInOut();
            };

            Easing.Linear = function () {
                return function (tick) {
                    return tick;
                };
            };

            Easing.Elastic = function (times) {
                if (TypeViz.IsUndefined(times))
                    times = 2;
                return Easing.makeElastic(times);
            };

            Easing.EaseIn = function () {
                return Easing.makeEaseIn(1.5);
            };

            Easing.EaseOut = function () {
                return Easing.makeEaseOut(1.5);
            };

            Easing.StrongEaseIn = function () {
                return Easing.makeEaseIn(2.5);
            };

            Easing.StrongEaseOut = function () {
                return Easing.makeEaseOut(2.5);
            };

            Easing.VeryElastic = function () {
                return Easing.makeElastic(3);
            };

            Easing.Bouncy = function () {
                return Easing.makeBounce(1);
            };

            Easing.VeryBouncy = function () {
                return Easing.makeBounce(3);
            };

            Easing.makeEaseIn = function (a) {
                return function (tick) {
                    return Math.pow(tick, a * 2);
                };
            };

            Easing.makeEaseOut = function (a) {
                return function (tick) {
                    return 1 - Math.pow(1 - tick, a * 2);
                };
            };

            Easing.makeEaseInOut = function () {
                return function (tick) {
                    return ((-Math.cos(tick * Math.PI) / 2) + 0.5);
                };
            };

            Easing.makeElastic = function (bounces) {
                return function (tick) {
                    tick = Easing.makeEaseInOut()(tick);
                    return ((1 - Math.cos(tick * Math.PI * bounces)) * (1 - tick)) + tick;
                };
            };

            Easing.prototype.makeADSR = function (attackEnd, decayEnd, sustainEnd, sustainLevel) {
                if (sustainLevel == null)
                    sustainLevel = 0.5;
                return function (tick) {
                    if (tick < attackEnd) {
                        return tick / attackEnd;
                    }
                    if (tick < decayEnd) {
                        return 1 - ((tick - attackEnd) / (decayEnd - attackEnd) * (1 - sustainLevel));
                    }
                    if (tick < sustainEnd) {
                        return sustainLevel;
                    }
                    return sustainLevel * (1 - ((tick - sustainEnd) / (1 - sustainEnd)));
                };
            };

            Easing.makeBounce = function (bounces) {
                var fn = Easing.makeElastic(bounces);
                return function (tick) {
                    tick = fn(tick);
                    return tick <= 1 ? tick : 2 - tick;
                };
            };
            return Easing;
        })();
        Animation.Easing = Easing;
    })(TypeViz.Animation || (TypeViz.Animation = {}));
    var Animation = TypeViz.Animation;
})(TypeViz || (TypeViz = {}));



if (!Array.prototype.AddRange) {
    Array.prototype.AddRange = function (range) {
        for (var i = 0; i < range.length; i++) {
            this.push(range[i]);
        }
    };
}

if (Array.prototype.Add == null) {
    Array.prototype.Add = function () {
        var items = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            items[_i] = arguments[_i + 0];
        }
        if (TypeViz.IsUndefined(items))
            throw "Cannot add undefined element to the array";
        for (var i = 0; i < items.length; i++) {
            this.push(items[i]);
        }
        return this;
    };
}
;

if (!Array.prototype.First) {
    Array.prototype.First = function (predicate, thisRef) {
        if (TypeViz.IsUndefined(predicate)) {
            if (this.length == 0)
                return null;
            return this[0];
        } else {
            for (var i = 0; i < this.length; ++i) {
                if (predicate.call(thisRef, this[i])) {
                    return this[i];
                }
            }
            return null;
        }
    };
}

if (Array.prototype.HasProperty == null) {
    Array.prototype.HasProperty = function (property) {
        return Object.prototype.hasOwnProperty.call(this, property);
    };
}

if (Object.prototype.HasProperty == null) {
    Object.prototype.HasProperty = Object.prototype.hasOwnProperty;
}

if (Array.prototype.ForEach == null) {
    if (Array.prototype.forEach != null) {
        Array.prototype.ForEach = Array.prototype.forEach;
    } else {
        Array.prototype.ForEach = function (iterator, thisRef) {
            var len = this.length >>> 0;
            if (typeof iterator != "function") {
                throw "The iterator should be a function.";
            }
            for (var i = 0; i < len; i++) {
                if (i in this) {
                    iterator.call(thisRef, this[i], i, this);
                }
            }
        };
    }
}

if (Array.prototype.All == null) {
    if (Array.prototype.every != null) {
        Array.prototype.All = Array.prototype.every;
    } else {
        Array.prototype.All = function (iterator, context) {
            if (TypeViz.IsUndefined(iterator))
                throw "The iterator is not defined.";
            var result = true;
            this.ForEach(function (value, index, list) {
                if (!(result = result && iterator.call(context, value, index, list)))
                    return {};
            });
            return !!result;
        };
    }
}
;

if (Array.prototype.Flatten == null) {
    function _flatten(input, shallow, output) {
        if (shallow && input.ForEach(TypeViz.IsArray)) {
            return Array.prototype.concat.apply(output, input);
        }
        input.ForEach(function (value) {
            if (TypeViz.IsArray(value) || TypeViz.IsArguments(value)) {
                shallow ? Array.prototype.push.apply(output, value) : _flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    }
    ;

    Array.prototype.Flatten = function (shallow) {
        if (typeof shallow === "undefined") { shallow = true; }
        return _flatten(this, shallow, []);
    };
}

if (Array.prototype.Merge == null) {
    Array.prototype.Merge = function (arrays) {
        return Array.prototype.concat.apply(this, arrays);
    };
}

if (Array.prototype.Contains == null) {
    Array.prototype.Contains = function () {
        var obj = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            obj[_i] = arguments[_i + 0];
        }
        var i = this.length;

        for (var j = 0; j < obj.length; j++) {
            var found = false;
            while (i--) {
                if (this[i] == obj[j]) {
                    found = true;
                    break;
                }
            }
            if (!found)
                return false;
        }
        return true;
    };
}

if (Array.prototype.IndexOf == null) {
    if (Array.prototype.indexOf != null) {
        Array.prototype.IndexOf = Array.prototype.indexOf;
    } else {
        Array.prototype.IndexOf = function (element) {
            for (var i = 0; i < this.length; ++i) {
                if (this[i] === element) {
                    return i;
                }
            }
            return -1;
        };
    }
}

if (Array.prototype.Fold == null) {
    if (Array.prototype.reduce != null) {
        Array.prototype.Fold = Array.prototype.reduce;
    } else {
        Array.prototype.Fold = function (iterator, acc, context) {
            var initial = arguments.length > 1;
            this.ForEach(function (value, index, list) {
                if (!initial) {
                    acc = value;
                    initial = true;
                } else {
                    acc = iterator.call(context, acc, value, index, list);
                }
            });
            if (!initial) {
                throw 'Reduce of empty array with no initial value';
            }
            return acc;
        };
    }
}
if (Array.prototype.Reduce == null) {
    Array.prototype.Reduce = Array.prototype.Fold;
}

if (Array.prototype.Map == null) {
    if (Array.prototype.map != null) {
        Array.prototype.Map = Array.prototype.map;
    } else {
        Array.prototype.Map = function (iterator, context) {
            var results = [];
            this.ForEach(function (value, index, list) {
                results.push(iterator.call(context, value, index, list));
            });
            return results;
        };
    }
}

if (Array.prototype.Any == null) {
    Array.prototype.Any = function (predicate, thisRef) {
        if (TypeViz.IsUndefined(predicate)) {
            return this.length > 0;
        } else {
            for (var i = 0; i < this.length; ++i) {
                if (predicate.call(thisRef, this[i])) {
                    return true;
                }
            }
            return false;
        }
    };
}

if (Array.prototype.Insert == null) {
    Array.prototype.Insert = function (element, position) {
        this.splice(position, 0, element);
        return this;
    };
}

if (!Array.prototype.Prepend) {
    Array.prototype.Prepend = function () {
        var items = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            items[_i] = arguments[_i + 0];
        }
        if (TypeViz.IsUndefined(items))
            throw "Cannot prepend undefined element to the array";
        for (var i = 0; i < items.length; i++) {
            this.unshift.call(this, items[i]);
        }

        return this;
    };
}

if (!Array.prototype.Append) {
    Array.prototype.Append = Array.prototype.Add;
}

if (Array.prototype.IsEmpty == null) {
    Array.prototype.IsEmpty = function () {
        return this.length == 0;
    };
}

if (Array.prototype.Clear == null) {
    Array.prototype.Clear = function () {
        while (this.length > 0) {
            this.pop();
        }
        return this;
    };
}

if (Array.prototype.Filter == null) {
    if (Array.prototype.filter != null) {
        Array.prototype.Filter = Array.prototype.filter;
    } else {
        Array.prototype.Filter = function (iterator, context) {
            var results = [];
            this.ForEach(function (value, index, list) {
                if (iterator.call(context, value, index, list))
                    results.push(value);
            });
            return results;
        };
    }
    ;
}

if (Array.prototype.Find == null) {
    Array.prototype.Find = Array.prototype.Filter;
}

if (Array.prototype.Where == null) {
    Array.prototype.Where = Array.prototype.Filter;
}

if (Array.prototype.Pop == null) {
    Array.prototype.Pop = Array.prototype.pop;
}
if (Array.prototype.Clone == null) {
    Array.prototype.Clone = function () {
        return this.slice(0);
    };
}

if (Array.prototype.Take == null) {
    Array.prototype["Take"] = function (fromOrAmount, to) {
        if (typeof to === "undefined") { to = null; }
        if (fromOrAmount < 0)
            throw "The first parameter cannot be less than zero.";
        if (to == null) {
            if (fromOrAmount == 0)
                return [];
            return this.slice(0, fromOrAmount);
        } else {
            if (to < fromOrAmount)
                throw "The second parameter cannot be less than the first one.";
            return this.slice(fromOrAmount, to);
        }
    };
}

if (Array.prototype.Pretty == null) {
    Array.prototype["Pretty"] = function (length) {
        if (typeof length === "undefined") { length = 10; }
        if (this.length == 0)
            return "Empty Array";
        var clone = this.Clone().slice(0, length);
        for (var i = 0; i < clone.length; i++) {
            if (clone[i] == null)
                clone[i] = "null";
        }
        var pretty = clone.join(",");
        if (this.length > length)
            pretty += ", <<" + (this.length - length).toString() + ">>";

        return "[" + pretty + "]";
    };
}

if (Array.prototype.SameAs == null) {
    Array.prototype["SameAs"] = function (array) {
        if (!array) {
            return false;
        }
        if (this.length != array.length) {
            return false;
        }
        for (var i = 0; i < this.length; i++) {
            if (this[i] instanceof Array && array[i] instanceof Array) {
                if (!this[i].compare(array[i])) {
                    return false;
                }
            } else if (this[i] != array[i]) {
                return false;
            }
        }
        return true;
    };
}

if (Array.prototype.Shuffle == null) {
    Array.prototype.Shuffle = function () {
        var result = this.Clone();
        var m = result.length, t, i;
        while (m) {
            i = Math.random() * m-- | 0;
            t = result[m], result[m] = result[i], result[i] = t;
        }
        return result;
    };
}

if (Array.prototype.Remove == null) {
    Array.prototype.Remove = function () {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };
}
;

if (Array.prototype.Flatten == null) {
    Array.prototype.Flatten = function () {
        var merged = [];
        return merged.concat.apply(merged, this);
    };
}
;

if (Array.prototype.Distinct == null) {
    Array.prototype.Distinct = function () {
        var a = this;
        var r = [];
        for (var i = 0; i < a.length; i++)
            if (r.indexOf(a[i]) < 0)
                r.push(a[i]);
        return r;
    };
}
;

if (Array.prototype.Contains == null) {
    Array.prototype.Contains = function () {
        var obj = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            obj[_i] = arguments[_i + 0];
        }
        var i = this.length;
        while (i--) {
            if (this[i] == obj)
                return true;
        }
        return false;
    };
}
;

if (Array.prototype.Min == null) {
    Array.prototype.Min = function (f) {
        var i = -1, n = this.length, a, b;
        if (f == null) {
            while (++i < n && !((a = this[i]) != null && a <= a))
                a = undefined;
            while (++i < n)
                if ((b = this[i]) != null && a > b)
                    a = b;
        } else {
            while (++i < n && !((a = f.call(this, this[i], i)) != null && a <= a))
                a = undefined;
            while (++i < n)
                if ((b = f.call(this, this[i], i)) != null && a > b)
                    a = b;
        }
        return a;
    };
}
;

if (Array.prototype.Max == null) {
    Array.prototype.Max = function (f) {
        var i = -1, n = this.length, a, b;
        if (f == null) {
            while (++i < n && !((a = this[i]) != null && a <= a))
                a = undefined;
            while (++i < n)
                if ((b = this[i]) != null && b > a)
                    a = b;
        } else {
            while (++i < n && !((a = f.call(this, this[i], i)) != null && a <= a))
                a = undefined;
            while (++i < n)
                if ((b = f.call(this, this[i], i)) != null && b > a)
                    a = b;
        }
        return a;
    };
}
;

if (Array.prototype.Zip == null) {
    Array.prototype.Zip = function () {
        var zipLength = function (d) {
            return d.length;
        };
        if (!(n = arguments.length))
            return [];
        var args = Array.prototype.slice.call(arguments, 0);
        var all = args.Prepend(this);
        var minLength = all.Min(zipLength);
        n++;
        for (var i = -1, m = minLength, zips = new Array(m); ++i < m;) {
            for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n;) {
                zip[j] = all[j][i];
            }
        }
        return zips;
    };
}

if (Array.prototype.Sum == null) {
    Array.prototype.Sum = function (f) {
        var s = 0, n = this.length, a, i = -1;

        if (f == null) {
            while (++i < n)
                if (!isNaN(a = +this[i]))
                    s += a;
        } else {
            while (++i < n)
                if (!isNaN(a = +f.call(this, this[i], i)))
                    s += a;
        }

        return s;
    };
}
;

if (Array.prototype.Extent == null) {
    Array.prototype.Extent = function (f) {
        var i = -1, n = this.length, a, b, c;
        if (TypeViz.IsUndefined(f)) {
            while (++i < n && !((a = c = this[i]) != null && a <= a))
                a = c = undefined;
            while (++i < n)
                if ((b = this[i]) != null) {
                    if (a > b)
                        a = b;
                    if (c < b)
                        c = b;
                }
        } else {
            while (++i < n && !((a = c = f.call(this, this[i], i)) != null && a <= a))
                a = undefined;
            while (++i < n)
                if ((b = f.call(this, this[i], i)) != null) {
                    if (a > b)
                        a = b;
                    if (c < b)
                        c = b;
                }
        }
        return [a, c];
    };
}

if (Array.prototype.Reverse == null) {
    Array.prototype.Reverse = function () {
        var r = [];
        if (this.length == 0)
            return r;
        for (var i = 0; i < this.length; i++) {
            r.push(this[this.length - 1 - i]);
        }

        return r;
    };
}

if (Array.prototype.Initialize == null) {
    Array.prototype.Initialize = function (what, amount) {
        if (this.length > 0)
            this.Clear();
        for (var i = 0; i < amount; i++) {
            this.push(what);
        }
        return this;
    };
}
var TypeViz;
(function (TypeViz) {
    var Visual = TypeViz.SVG.Visual;
    var Point = TypeViz.Point;
    var Group = TypeViz.SVG.Group;
    var Path = TypeViz.SVG.Path;
    var Color = TypeViz.Media.Color;
    var Colors = TypeViz.Media.Colors;
    var Interval = TypeViz.Maths.Interval;

    (function (Controls) {
        function transferOptions(defaultOptions, givenOptions) {
            if (givenOptions == null)
                return defaultOptions;
            var result = {};
            for (var option in defaultOptions) {
                if (givenOptions.hasOwnProperty(option))
                    result[option] = givenOptions[option];
                else
                    result[option] = defaultOptions[option];
            }
            return result;
        }

        var VisualizationBase = (function (_super) {
            __extends(VisualizationBase, _super);
            function VisualizationBase(model, source) {
                _super.call(this);
                this.RootVisual = new Group();
                this.nativeElement = this.RootVisual.Native;
                this.Initialize();
                this.source = TypeViz.Identity;
                this.cache = new TypeViz.Map();

                this.Height = 200;
                this.Width = 200;

                if (TypeViz.IsDefined(source)) {
                    this.Source = source;
                }
                if (TypeViz.IsDefined(model)) {
                    this.Model = model;
                    this.Update();
                }
            }
            Object.defineProperty(VisualizationBase.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VisualizationBase.prototype, "Position", {
                get: function () {
                    return this.RootVisual.Position;
                },
                set: function (p) {
                    this.RootVisual.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(VisualizationBase.prototype, "Source", {
                get: function () {
                    return this.source;
                },
                set: function (value) {
                    this.source = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(VisualizationBase.prototype, "Cache", {
                get: function () {
                    return this.cache;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VisualizationBase.prototype, "Data", {
                get: function () {
                    return this.data;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VisualizationBase.prototype, "Model", {
                get: function () {
                    return this.model;
                },
                set: function (value) {
                    this.detachFromModel();
                    this.model = value;
                    this.attachToModel();
                },
                enumerable: true,
                configurable: true
            });


            VisualizationBase.prototype.onModelChanged = function () {
                this.Update();
            };

            VisualizationBase.prototype.attachToModel = function () {
                if (this.model != null && this.model.Changed) {
                    this.model.Changed(this.onModelChanged);
                }
            };

            VisualizationBase.prototype.detachFromModel = function () {
                if (this.model != null && this.model.RemoveChangedHandler) {
                    this.model.RemoveChangedHandler(this.onModelChanged);
                }
            };

            VisualizationBase.prototype.Update = function () {
                if (this.model == null) {
                    console.warn("Update on Band called without Model.");
                    return;
                }
                if (this.Source == null) {
                    console.warn("Update on Band called without Source definition.");
                    return;
                }
                this.data = this.Source(this.model);
            };

            VisualizationBase.prototype.Present = function (gluons) {
                this.cleanupOldItems(gluons);
                for (var i = 0; i < gluons.length; i++) {
                    var gluon = gluons[i];

                    if (this.Cache.Contains(gluon.Id)) {
                        this.UpdateItem(gluon);
                    } else {
                        this.AddItem(gluon);
                    }
                }
            };

            VisualizationBase.prototype.cleanupOldItems = function (gluons) {
                this.Cache.ForEach(function (key, value) {
                    for (var j = 0; j < gluons.length; j++) {
                        if (gluons[j].Node == key)
                            return;
                    }
                    this.RemoveItem(value);
                }, this);
            };

            VisualizationBase.prototype.UpdateItem = function (gluon) {
            };

            VisualizationBase.prototype.RemoveItem = function (gluon) {
            };

            VisualizationBase.prototype.AddItem = function (gluon) {
            };
            return VisualizationBase;
        })(TypeViz.SVG.Visual);
        Controls.VisualizationBase = VisualizationBase;

        var IGluon = (function () {
            function IGluon() {
            }
            return IGluon;
        })();
        Controls.IGluon = IGluon;

        var BandDiagram = (function (_super) {
            __extends(BandDiagram, _super);
            function BandDiagram() {
                _super.apply(this, arguments);
            }
            BandDiagram.prototype.Update = function () {
                _super.prototype.Update.call(this);
                if (this.Data == null)
                    return;
                var adapter = new BandFactory();
                var gluon = adapter.Generate(this.Data);
                if (gluon != null) {
                    this.Present(gluon);
                }
            };

            BandDiagram.prototype.UpdateItem = function (gluon) {
                this.Cache.Get(gluon.Id).Data = gluon["Data"];
            };

            BandDiagram.prototype.AddItem = function (gluon) {
                this.RootVisual.Append(gluon.Visual);
                this.Cache.Set(gluon.Id, gluon.Visual);
            };
            return BandDiagram;
        })(VisualizationBase);
        Controls.BandDiagram = BandDiagram;

        var BandFactory = (function () {
            function BandFactory(options) {
                this.source = function (d) {
                    return d.Source;
                };
                this.endAngle = function (d) {
                    return d.EndAngle;
                };
                this.backgroundFunctor = function (d) {
                    return d.Background;
                };
                this.target = function (d) {
                    return d.Target;
                };
                this.radius = function (d) {
                    return d.Radius;
                };
                this.startAngle = function (d) {
                    return d.StartAngle;
                };
                this.arcOffset = -Math.PI / 2;
                this.arcMax = 2 * Math.PI - 1e-6;
                this.id = function (d) {
                    return TypeViz.Hash(d);
                };
            }
            Object.defineProperty(BandFactory.prototype, "Id", {
                get: function () {
                    return this.id;
                },
                set: function (value) {
                    this.id = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Background", {
                get: function () {
                    return this.backgroundFunctor;
                },
                set: function (value) {
                    this.backgroundFunctor = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Source", {
                get: function () {
                    return this.source;
                },
                set: function (value) {
                    this.source = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Target", {
                get: function () {
                    return this.target;
                },
                set: function (value) {
                    this.target = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Radius", {
                get: function () {
                    return this.radius;
                },
                set: function (value) {
                    this.radius = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "StartAngle", {
                get: function () {
                    return this.startAngle;
                },
                set: function (value) {
                    this.startAngle = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "EndAngle", {
                get: function () {
                    return this.endAngle;
                },
                set: function (value) {
                    this.endAngle = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            BandFactory.prototype.equals = function (a, b) {
                return a.a0 == b.a0 && a.a1 == b.a1;
            };

            BandFactory.prototype.Generate = function (data, i) {
                if (data instanceof Array) {
                    var result = [];
                    for (var j = 0; j < data.length; j++) {
                        var dataNode = data[j];
                        result.push(this.wrap(dataNode));
                    }
                    return result;
                } else {
                    return [this.wrap(data)];
                }
            };

            BandFactory.prototype.wrap = function (dataNode) {
                var calc = this.calculate(dataNode);
                var pathString = calc.data;
                var path = new Path();
                path.Background = this.backgroundFunctor(dataNode) || "#b0c4de";
                path.Opacity = dataNode.Opacity || 0.64;
                path.StrokeThickness = 1;
                path.Data = pathString;
                var g = new TypeViz.SVG.Group();
                g.Append(path);
                var text = new TypeViz.SVG.TextBlock();
                text.Text = dataNode.Data;
                text.Transform(new TypeViz.SVG.Translation((calc.to.p0[0] + calc.to.p1[0]) / 2, (calc.to.p0[1] + calc.to.p1[1]) / 2));
                text.Background = "White";
                text.Anchor = 1 /* Center */;
                text.dx = 1;
                text.dy = 1;
                g.Append(text);
                return {
                    Data: pathString,
                    Node: dataNode,
                    Visual: g,
                    Id: this.Id(dataNode),
                    StartPosition: calc.from
                };
            };

            BandFactory.prototype.calculate = function (data, i) {
                var startCoordinates = this.getCoordinates(this, this.source, data, i), endCoordinates = this.getCoordinates(this, this.target, data, i);
                return {
                    data: "M" + startCoordinates.p0 + this.arc(startCoordinates.r, startCoordinates.p1, startCoordinates.a1 - startCoordinates.a0) + (this.equals(startCoordinates, endCoordinates) ? this.curve(startCoordinates.r, startCoordinates.p1, startCoordinates.r, startCoordinates.p0) : this.curve(startCoordinates.r, startCoordinates.p1, endCoordinates.r, endCoordinates.p0) + this.arc(endCoordinates.r, endCoordinates.p1, endCoordinates.a1 - endCoordinates.a0) + this.curve(endCoordinates.r, endCoordinates.p1, startCoordinates.r, startCoordinates.p0)) + "Z",
                    from: startCoordinates,
                    to: endCoordinates
                };
            };

            BandFactory.prototype.arc = function (r, p, a) {
                return "A" + r + "," + r + " 0 " + +(a > Math.PI) + ",1 " + p;
            };

            BandFactory.prototype.curve = function (r0, p0, r1, p1) {
                return "Q 0,0 " + p1;
            };

            BandFactory.prototype.getCoordinates = function (self, pickFunction, d, i) {
                var endPointData = pickFunction.call(self, d, i), r = this.radius.call(self, endPointData, i), a0 = this.startAngle.call(self, endPointData, i) + this.arcOffset, a1 = this.endAngle.call(self, endPointData, i) + this.arcOffset;
                return {
                    r: r,
                    a0: a0,
                    a1: a1,
                    p0: [r * Math.cos(a0), r * Math.sin(a0)],
                    p1: [r * Math.cos(a1), r * Math.sin(a1)]
                };
            };
            return BandFactory;
        })();
        Controls.BandFactory = BandFactory;

        var WheelFactory = (function () {
            function WheelFactory() {
                this.title = function (d) {
                    return d.Name || "";
                };
                this.id = function (d) {
                    return TypeViz.Hash(d);
                };
                this.weights = [];
                this.weight = function (d) {
                    return d.Weight;
                };
                this.innerRadius = 200;
                this.outerRadius = 250;
                this.colorFunction = function (data, i) {
                    return TypeViz.Media.Colors.RandomBlue.AsHex6;
                };
            }
            Object.defineProperty(WheelFactory.prototype, "Name", {
                get: function () {
                    return this.title;
                },
                set: function (value) {
                    this.title = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelFactory.prototype, "Id", {
                get: function () {
                    return this.id;
                },
                set: function (value) {
                    this.id = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(WheelFactory.prototype, "ColorFunction", {
                get: function () {
                    return this.colorFunction;
                },
                set: function (value) {
                    this.colorFunction = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(WheelFactory.prototype, "Weight", {
                get: function () {
                    return this.weight;
                },
                set: function (value) {
                    this.weight = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelFactory.prototype, "InnerRadius", {
                get: function () {
                    return this.innerRadius;
                },
                set: function (value) {
                    this.innerRadius = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelFactory.prototype, "OuterRadius", {
                get: function () {
                    return this.outerRadius;
                },
                set: function (value) {
                    this.outerRadius = value;
                },
                enumerable: true,
                configurable: true
            });


            WheelFactory.prototype.normalizeData = function (data) {
                var sum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += this.Weight(data[i]);
                }
                if (sum == 0)
                    throw "Could not find a suitable normalization.";
                for (var i = 0; i < data.length; i++) {
                    this.weights[i] = this.Weight(data[i]) / sum;
                }
            };

            WheelFactory.prototype.Generate = function (data) {
                this.normalizeData(data);
                var startAngle = 0;
                var result = [];
                for (var i = 0; i < data.length; i++) {
                    var node = data[i];
                    var title = this.Name(node);
                    var id = this.id(node);
                    var g = new TypeViz.SVG.Group();
                    var arc = new TypeViz.SVG.Arc();
                    arc.Background = this.colorFunction(node, i);
                    arc.InnerRadius = this.InnerRadius;
                    arc.OuterRadius = this.OuterRadius;
                    arc.StartAngle = startAngle;
                    arc.StrokeThickness = 0;
                    arc.EndAngle = startAngle + this.weights[i] * Math.PI * 2;
                    g.Append(arc);
                    var tb = new TypeViz.SVG.TextBlock();
                    var halfAngle = (arc.StartAngle + arc.EndAngle) / 2;
                    var halfRadius = (arc.InnerRadius + arc.OuterRadius) / 2;
                    tb.Position = new TypeViz.Point(halfRadius * Math.sin(halfAngle), -halfRadius * Math.cos(halfAngle));
                    tb.Text = Math.round(this.weights[i] * 100) + "%";
                    tb.Anchor = 1 /* Center */;
                    tb.Background = "White";
                    g.Append(tb);
                    result.push({
                        Node: node,
                        Id: id,
                        Visual: g,
                        StartAngle: arc.StartAngle,
                        EndAngle: arc.EndAngle,
                        Text: tb.Text,
                        Color: arc.Background
                    });
                    startAngle = arc.EndAngle;
                }
                return result;
            };
            return WheelFactory;
        })();
        Controls.WheelFactory = WheelFactory;

        var WheelChart = (function (_super) {
            __extends(WheelChart, _super);
            function WheelChart(model, source) {
                _super.call(this, model, source);
            }
            Object.defineProperty(WheelChart.prototype, "InnerRadius", {
                get: function () {
                    return this.factory.InnerRadius;
                },
                set: function (value) {
                    this.factory.InnerRadius = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelChart.prototype, "OuterRadius", {
                get: function () {
                    return this.factory.OuterRadius;
                },
                set: function (value) {
                    this.factory.OuterRadius = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(WheelChart.prototype, "ColorFunction", {
                get: function () {
                    return this.factory.ColorFunction;
                },
                set: function (value) {
                    this.factory.ColorFunction = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });

            WheelChart.prototype.Update = function () {
                _super.prototype.Update.call(this);
                if (this.Data == null)
                    return;

                var gluon = this.Factory.Generate(this.Data);
                if (gluon != null) {
                    this.Present(gluon);
                }
            };

            Object.defineProperty(WheelChart.prototype, "Factory", {
                get: function () {
                    if (this.factory == null)
                        this.factory = new WheelFactory();
                    return this.factory;
                },
                enumerable: true,
                configurable: true
            });

            WheelChart.prototype.UpdateItem = function (gluon) {
                var arc = this.Cache.Get(gluon.Id).Children[0];
                var tb = this.Cache.Get(gluon.Id).Children[1];
                arc.InnerRadius = this.InnerRadius;
                arc.OuterRadius = this.OuterRadius;
                arc.StartAngle = gluon["StartAngle"];
                arc.Background = gluon["Color"];
                arc.EndAngle = gluon["EndAngle"];
                tb.Text = gluon["Text"];
                var halfAngle = (arc.StartAngle + arc.EndAngle) / 2;
                var halfRadius = (arc.InnerRadius + arc.OuterRadius) / 2;
                tb.Position = new TypeViz.Point(halfRadius * Math.sin(halfAngle), -halfRadius * Math.cos(halfAngle));
            };

            WheelChart.prototype.AddItem = function (gluon) {
                this.RootVisual.Append(gluon.Visual);
                this.Cache.Set(gluon.Id, gluon.Visual);
            };
            return WheelChart;
        })(VisualizationBase);
        Controls.WheelChart = WheelChart;

        (function (AxisDirection) {
            AxisDirection[AxisDirection["Horizontal"] = 0] = "Horizontal";
            AxisDirection[AxisDirection["Vertical"] = 1] = "Vertical";
        })(Controls.AxisDirection || (Controls.AxisDirection = {}));
        var AxisDirection = Controls.AxisDirection;

        Controls.AxisDefaultOptions = {
            ShowHorizontal: true,
            ShowVertical: true,
            ShowHorizontalArrowHead: true,
            ShowVerticalArrowHead: true,
            VerticalOffset: 0,
            HorizontalOffset: 0,
            HorizontalExtent: [0, 100],
            VerticalExtent: [0, 50],
            HorizontalStep: 5,
            VerticalStep: 5,
            ShowHorizontalLabels: true,
            ShowVerticalLabels: true,
            HorizontalTickSpace: 5,
            VerticalTickSpace: 5,
            TickSize: 5
        };
        Controls.CircularAxisDefaultOptions = {
            Interval: [0, 100],
            Radius: 200
        };

        var CircularAxis = (function (_super) {
            __extends(CircularAxis, _super);
            function CircularAxis(options) {
                _super.call(this);
                this.RootVisual = new Group();
                this.nativeElement = this.RootVisual.Native;
                this.Initialize();
                this.options = transferOptions(Controls.CircularAxisDefaultOptions, options);
                this.options["Interval"] = this.ensureExtent(this.options["Interval"]);

                this.Update();
            }
            Object.defineProperty(CircularAxis.prototype, "Position", {
                get: function () {
                    return this.RootVisual.Position;
                },
                set: function (p) {
                    this.RootVisual.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            CircularAxis.prototype.ensureExtent = function (value) {
                return (value instanceof Interval) ? value : new Interval(value);
            };

            CircularAxis.prototype.Update = function () {
                this.RootVisual.Clear();
                var circle = new TypeViz.SVG.Circle();
                circle.Radius = this.options.Radius;
                this.RootVisual.Append(circle);
            };
            return CircularAxis;
        })(TypeViz.SVG.Visual);
        Controls.CircularAxis = CircularAxis;

        var Axis = (function (_super) {
            __extends(Axis, _super);
            function Axis(options) {
                _super.call(this);
                this.RootVisual = new Group();
                this.nativeElement = this.RootVisual.Native;
                this.Initialize();
                this.options = transferOptions(Controls.AxisDefaultOptions, options);
                this.options["HorizontalExtent"] = this.ensureExtent(this.options["HorizontalExtent"]);
                this.options["VerticalExtent"] = this.ensureExtent(this.options["VerticalExtent"]);
                this.Stroke = "Dimgray";
                this.Update();
            }
            Object.defineProperty(Axis.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Axis.prototype, "HorizontalOffset", {
                get: function () {
                    return this.options.HorizontalOffset;
                },
                set: function (value) {
                    this.options.HorizontalOffset = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "VerticalOffset", {
                get: function () {
                    return this.options.VerticalOffset;
                },
                set: function (value) {
                    this.options.VerticalOffset = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "Position", {
                get: function () {
                    return this.RootVisual.Position;
                },
                set: function (p) {
                    this.RootVisual.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "Interval", {
                get: function () {
                    return this.options.HorizontalExtent;
                },
                set: function (value) {
                    this.horizontalExtent = this.ensureExtent(value);
                    this.options.HorizontalExtent = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "HorizontalTickSpace", {
                get: function () {
                    return this.options.HorizontalTickSpace;
                },
                set: function (value) {
                    this.options.HorizontalTickSpace = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "VerticalTickSpace", {
                get: function () {
                    return this.options.VerticalTickSpace;
                },
                set: function (value) {
                    this.options.VerticalTickSpace = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "TickSize", {
                get: function () {
                    return this.options.TickSize;
                },
                set: function (value) {
                    this.options.TickSize = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "HorizontalStep", {
                get: function () {
                    return this.options.HorizontalStep;
                },
                set: function (value) {
                    this.options.HorizontalStep = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Axis.prototype, "Stroke", {
                get: function () {
                    return this.stroke;
                },
                set: function (value) {
                    this.stroke = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "VerticalStep", {
                get: function () {
                    return this.options.VerticalStep;
                },
                set: function (value) {
                    this.options.VerticalStep = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Axis.prototype.OnAppendToCanvas = function (canvas) {
                if (this.options.ShowHorizontalArrowHead)
                    canvas.AddMarker(this.horizontalMarker);
                if (this.options.ShowVerticalArrowHead)
                    canvas.AddMarker(this.verticalMarker);
            };

            Axis.prototype.OnDetachFromCanvas = function (canvas) {
                if (this.horizontalMarker != null)
                    canvas.RemoveMarker(this.horizontalMarker);
                if (this.verticalMarker != null)
                    canvas.RemoveMarker(this.verticalMarker);
            };

            Axis.prototype.ensureExtent = function (value) {
                return (value instanceof Interval) ? value : new Interval(value);
            };

            Axis.prototype.Update = function () {
                this.RootVisual.Clear();
                var amount, tickSize, totalSize, label;
                if (this.options.ShowHorizontal) {
                    amount = this.options.HorizontalExtent.Size;
                    tickSize = amount * this.options.HorizontalTickSpace;
                    totalSize = this.options.HorizontalOffset + tickSize + 10;
                    var horizontalLine = new TypeViz.SVG.Line();
                    horizontalLine.From = new Point(0, 0);
                    horizontalLine.To = new Point(totalSize, 0);
                    horizontalLine.Stroke = this.Stroke;
                    this.horizontalGroup = new Group();
                    this.horizontalGroup.Append(horizontalLine);
                    if (this.options.ShowHorizontalArrowHead) {
                        this.horizontalMarker = TypeViz.SVG.Markers.ArrowEnd;
                        this.horizontalMarker.Path.Stroke = this.Stroke;
                        this.horizontalMarker.Path.Background = this.stroke;
                        horizontalLine.MarkerEnd = this.horizontalMarker;
                    }
                    for (var i = 0; i < amount; i += this.options.HorizontalStep) {
                        var tick = new TypeViz.SVG.Line(new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, 0), new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, this.options.TickSize));
                        tick.Stroke = this.Stroke;
                        this.horizontalGroup.Append(tick);
                        if (this.options.ShowHorizontalLabels) {
                            label = new TypeViz.SVG.TextBlock();
                            label.Text = i.toString();
                            label.Position = new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, this.options.TickSize + 2);
                            label.dy = 1;
                            label.Background = this.Stroke;
                            label.Anchor = 1 /* Center */;
                            this.horizontalGroup.Append(label);
                        }
                    }
                    this.RootVisual.Append(this.horizontalGroup);
                }

                if (this.options.ShowVertical) {
                    amount = this.options.VerticalExtent.Size;
                    tickSize = amount * this.options.VerticalTickSpace;
                    totalSize = this.options.VerticalOffset + tickSize + 10;
                    var verticalLine = new TypeViz.SVG.Line();
                    verticalLine.From = new Point(0, totalSize);
                    verticalLine.To = new Point(0, 0);
                    verticalLine.Stroke = this.Stroke;
                    this.verticalGroup = new Group();
                    this.verticalGroup.Append(verticalLine);
                    if (this.options.ShowVerticalArrowHead) {
                        this.verticalMarker = TypeViz.SVG.Markers.ArrowEnd;
                        this.verticalMarker.Path.Stroke = this.stroke;
                        this.verticalMarker.Path.Background = this.stroke;
                        verticalLine.MarkerEnd = this.verticalMarker;
                    }

                    if (this.options.ShowHorizontal)
                        this.horizontalGroup.Position = new Point(0, totalSize);
                    for (var i = 0; i < amount; i += this.options.VerticalStep) {
                        var tick = new TypeViz.SVG.Line(new Point(0, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace)), new Point(-this.options.TickSize, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace)));
                        tick.Stroke = this.Stroke;
                        this.verticalGroup.Append(tick);
                        if (this.options.ShowVerticalLabels) {
                            label = new TypeViz.SVG.TextBlock();
                            label.Text = i.toString();
                            label.Position = new Point(-this.options.TickSize - 2, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace));
                            label.dx = -10;
                            label.dy = 0.3;
                            label.Background = this.Stroke;
                            label.Anchor = 1 /* Center */;
                            this.verticalGroup.Append(label);
                        }
                    }
                    this.RootVisual.Append(this.verticalGroup);
                }
            };
            return Axis;
        })(TypeViz.SVG.Visual);
        Controls.Axis = Axis;

        var Popup = (function () {
            function Popup(content) {
                var anchors = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    anchors[_i] = arguments[_i + 1];
                }
                this.Delay = 500;
                this.Remains = 500;
                if (content)
                    this.Content = content;
                this.visualsMap = new TypeViz.Map();
                if (anchors) {
                    this.anchors = anchors;
                }
            }
            Object.defineProperty(Popup.prototype, "Position", {
                get: function () {
                    return this.position;
                },
                set: function (value) {
                    this.position = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Popup.prototype, "Content", {
                get: function () {
                    return this.content;
                },
                set: function (value) {
                    if (TypeViz.IsDefined(value)) {
                        this.content = TypeViz.Functor(value);
                        this.content(null).IsVisible = false;
                    } else {
                        this.content = null;
                    }
                },
                enumerable: true,
                configurable: true
            });

            Popup.prototype.AddAnchor = function (anchor) {
                if (anchor == null)
                    throw "Cannot add a null anchor.";
                var popup = this;
                anchor.MouseOver.call(anchor, (function (e) {
                    setTimeout(function () {
                        popup.showContent(anchor, e);
                    }, popup.Delay);
                }));

                anchor.MouseOut.call(anchor, (function (e) {
                    setTimeout(function () {
                        popup.hideContent(anchor, e);
                    }, popup.Remains);
                }));
            };

            Popup.prototype.hideContent = function (anchor, e) {
                if (this.visualsMap.ContainsKey(anchor.Id)) {
                    var visual = this.visualsMap.Get(anchor.Id);
                    if (TypeViz.IsDefined(visual))
                        visual.IsVisible = false;
                }
            };

            Popup.prototype.showContent = function (anchor, e) {
                if (this.content == null)
                    return;
                var visual = this.content(anchor);
                if (TypeViz.IsDefined(visual)) {
                    visual.IsVisible = true;
                    if (TypeViz.IsDefined(this.position)) {
                        visual.Position = this.position(anchor, e);
                    } else {
                        var p = anchor.Position;
                        visual.Position = new TypeViz.Point(p.X + anchor.Width / 2, p.Y + anchor.Height + 2);
                    }
                    this.visualsMap.Set(anchor.Id, visual);
                }
            };
            return Popup;
        })();
        Controls.Popup = Popup;

        (function (TextAlign) {
            TextAlign[TextAlign["Left"] = 0] = "Left";
            TextAlign[TextAlign["Right"] = 1] = "Right";
            TextAlign[TextAlign["Center"] = 2] = "Center";
            TextAlign[TextAlign["Justify"] = 3] = "Justify";
        })(Controls.TextAlign || (Controls.TextAlign = {}));
        var TextAlign = Controls.TextAlign;
        ;

        var TextLine = (function () {
            function TextLine(parent, length, content) {
                this.parent = parent;
                this.length = length;
                this.content = content;
            }
            return TextLine;
        })();
        Controls.TextLine = TextLine;

        var TextWrap = (function (_super) {
            __extends(TextWrap, _super);
            function TextWrap() {
                _super.call(this);
                this.lines = [];
                this.textBlock = new TypeViz.SVG.TextBlock();
                this.group = new TypeViz.SVG.Group();
                this.group.Append(this.textBlock);
                this.nativeElement = this.group.Native;
                this.Width = 200;
                this.Update();
            }
            Object.defineProperty(TextWrap.prototype, "Anchor", {
                get: function () {
                    return this.textBlock.Anchor;
                },
                set: function (anchor) {
                    this.textBlock.Anchor = anchor;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextWrap.prototype, "Text", {
                get: function () {
                    return this.text;
                },
                set: function (value) {
                    this.text = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });

            TextWrap.prototype.OnAppendToCanvas = function () {
                this.Update();
            };
            TextWrap.prototype.Append = function (span) {
                this.textBlock.Native.appendChild(span.Native);
            };

            Object.defineProperty(TextWrap.prototype, "Align", {
                get: function () {
                    return this.align;
                },
                set: function (value) {
                    this.align = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextWrap.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextWrap.prototype, "Position", {
                get: function () {
                    return this.group.Position;
                },
                set: function (p) {
                    this.group.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            TextWrap.prototype.Update = function () {
                this.splitString();
                this.layout();
            };

            TextWrap.prototype.layout = function () {
                if (this.lines.length == 0)
                    return;
                this.clearPresentation();
                var lines = (new Array(0)).concat(this.lines);
                var anchor = 0 /* Left */;
                if (this.Align == 2 /* Center */) {
                    anchor = 1 /* Center */;
                } else if (this.Align == 1 /* Right */) {
                    anchor = 3 /* Right */;
                }
                for (var i = 0; i < lines.length; i++) {
                    var x = 0;
                    var line = lines[i];

                    var tspan = new TypeViz.SVG.TextSpan();
                    tspan.Native.appendChild(document.createTextNode(line.content.join(' ')));
                    if (this.Align == 3 /* Justify */) {
                        var space = (this.Width - line.Width) / (line.content.length - 1);
                        space = (i != lines.length - 1) ? space : 0;
                        tspan.Native.style.setProperty('word-spacing', space + 'px');
                    } else if (this.Align == 2 /* Center */) {
                        anchor = 1 /* Center */;
                        x = this.Width / 2;
                    } else if (this.Align == 1 /* Right */) {
                        anchor = 3 /* Right */;
                        x = this.Width;
                    }
                    tspan.X = x;
                    tspan.dy = 1.2;

                    this.Append(tspan);
                }
                this.textBlock.Anchor = anchor;
            };
            Object.defineProperty(TextWrap.prototype, "Foreground", {
                get: function () {
                    return this.Native.style.fill;
                },
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            TextWrap.prototype.Clear = function () {
            };

            TextWrap.prototype.clearPresentation = function () {
                this.textBlock.Native.textContent = null;
            };

            TextWrap.prototype.splitString = function () {
                var text = this.Text;
                this.clearPresentation();
                if (text == null || text.length == 0)
                    return;
                var words = text.split(' ');
                var lines = [];
                var line = [];
                var length = 0;
                var prevLength = 0;
                while (words.length) {
                    var word = words[0];
                    this.textBlock.nativeElement.textContent = line.join(' ') + ' ' + word;
                    length = this.textBlock.TextLength;
                    if (length > this.Width) {
                        if (!words.length) {
                            line.push(words[0]);
                        }
                        lines.push(new TextLine(this, prevLength, line));
                        line = new Array();
                    } else {
                        line.push(words.shift());
                    }
                    prevLength = length;
                    if (words.length == 0) {
                        lines.push(new TextLine(this, 0, line));
                    }
                }
                this.lines = lines;
            };
            return TextWrap;
        })(TypeViz.SVG.Visual);
        Controls.TextWrap = TextWrap;

        var SparkLine = (function (_super) {
            __extends(SparkLine, _super);
            function SparkLine(model, source) {
                _super.call(this, model, source);
                this.stroke = "Silver";
            }
            Object.defineProperty(SparkLine.prototype, "Stroke", {
                get: function () {
                    return this.stroke;
                },
                set: function (value) {
                    this.stroke = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });
            SparkLine.prototype.TurnElementsVisible = function (isVisible) {
                if (TypeViz.IsDefined(this.topLine)) {
                    this.topLine.IsVisible = isVisible;
                    this.midLine.IsVisible = isVisible;
                    this.bottomLine.IsVisible = isVisible;

                    this.topText.IsVisible = isVisible;
                    this.midText.IsVisible = isVisible;
                    this.bottomText.IsVisible = isVisible;
                }
                if (TypeViz.IsDefined(this.path)) {
                    this.path.IsVisible = isVisible;
                    this.maxDot.IsVisible = isVisible;
                    this.minDot.IsVisible = isVisible;
                }
            };
            SparkLine.prototype.getTextBlock = function () {
                var tb = new TypeViz.SVG.TextBlock();
                tb.Background = "White";
                tb.Opacity = 0.2;
                tb.FontSize = 7;
                this.RootVisual.Append(tb);
                return tb;
            };
            SparkLine.prototype.getLine = function () {
                var line = new TypeViz.SVG.Line();
                line.Stroke = "White";
                line.Opacity = 0.2;
                this.RootVisual.Prepend(line);
                return line;
            };
            SparkLine.prototype.Update = function () {
                var BACKOPACITY = 0.2;
                _super.prototype.Update.call(this);
                if (TypeViz.IsUndefined(this.Data) || !(this.Data instanceof Array) || this.Data.length === 0) {
                    this.TurnElementsVisible(false);
                    return;
                }

                if (TypeViz.IsUndefined(this.path)) {
                    this.path = new TypeViz.SVG.Path();
                    this.path.Opacity = 0.8;
                    this.RootVisual.Append(this.path);
                    this.maxDot = new TypeViz.SVG.Circle();
                    this.RootVisual.Append(this.maxDot);
                    this.minDot = new TypeViz.SVG.Circle();
                    this.RootVisual.Append(this.minDot);

                    this.midLine = this.getLine();
                    this.topLine = this.getLine();
                    this.bottomLine = this.getLine();

                    this.topText = this.getTextBlock();
                    this.midText = this.getTextBlock();
                    this.bottomText = this.getTextBlock();

                    this.backRectangle = new TypeViz.SVG.Rectangle();
                    this.backRectangle.Height = this.Height;
                    this.backRectangle.Width = this.Width;
                    this.backRectangle.Background = "Transparent";
                    this.RootVisual.Append(this.backRectangle);
                }
                this.TurnElementsVisible(true);

                var imax = 0, imin = 0;
                var deltax = this.Width / this.Data.length;
                var maxValue = this.Data.Max();
                var minValue = this.Data.Min();
                var scaling = maxValue === 0 ? 1 : this.Height / maxValue;
                var points = [];
                for (var i = 0; i < this.Data.length; i++) {
                    points.push(new Point(5 + i * deltax, this.Data[i] * scaling));
                    if (this.Data[i] == maxValue)
                        imax = i;
                    if (this.Data[i] == minValue)
                        imin = i;
                }

                this.path.Points = points;
                this.path.Stroke = this.stroke || "Silver";
                this.maxDot.Center = new Point(5 + imax * deltax, maxValue * scaling);
                this.maxDot.Radius = 3;
                this.maxDot.Background = "LimeGreen";
                this.maxDot.Stroke = "Transparent";

                this.minDot.Center = new Point(5 + imin * deltax, minValue * scaling);
                this.minDot.Radius = 3;
                this.minDot.Background = "OrangeRed";
                this.minDot.Stroke = "Transparent";

                this.midLine.From = new Point(0, this.Height / 2);
                this.midLine.To = new Point(this.Width, this.Height / 2);

                this.topLine.From = new Point(0, 0);
                this.topLine.To = new Point(this.Width, 0);

                this.bottomLine.From = new Point(0, this.Height);
                this.bottomLine.To = new Point(this.Width, this.Height);

                this.topText.Text = Math.round(maxValue);
                this.topText.Position = new Point(-15, 0);
                this.midText.Text = Math.round((maxValue + minValue) / 2);
                this.midText.Position = new Point(-15, this.Height / 2);
                this.bottomText.Text = Math.round(minValue);
                this.bottomText.Position = new Point(-15, this.Height);
            };
            return SparkLine;
        })(VisualizationBase);
        Controls.SparkLine = SparkLine;
    })(TypeViz.Controls || (TypeViz.Controls = {}));
    var Controls = TypeViz.Controls;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    var Visual = TypeViz.SVG.Visual;
    var Point = TypeViz.Point;
    var Group = TypeViz.SVG.Group;
    var Path = TypeViz.SVG.Path;
    var Color = TypeViz.Media.Color;
    var Colors = TypeViz.Media.Colors;

    (function (Layout) {
        (function (PackType) {
            PackType[PackType["Tree"] = 0] = "Tree";

            PackType[PackType["Close"] = 1] = "Close";
        })(Layout.PackType || (Layout.PackType = {}));
        var PackType = Layout.PackType;

        var Pack = (function () {
            function Pack() {
                var h = new TypeViz.Hierarchy();
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
                get: function () {
                    return this.hierarchy.ChildrenAccessor;
                },
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
                get: function () {
                    return this.padding;
                },
                set: function (value) {
                    this.padding = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Pack.prototype, "Size", {
                get: function () {
                    return this.size;
                },
                set: function (value) {
                    this.size = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Pack.prototype, "Radius", {
                get: function () {
                    return this.radius;
                },
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

                root.x = root.y = 0;
                this.treeVisitAfter(root, function (cd) {
                    cd.r = +r(cd.Data);
                });
                this.treeVisitAfter.call(this, root, this.packSiblings);

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

                nodes.ForEach(this.packLink, this);

                a = nodes[0];
                a.x = -a.r;
                a.y = 0;
                bound(a);

                if (n > 1) {
                    b = nodes[1];
                    b.x = b.r;
                    b.y = 0;
                    bound(b);

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

                var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
                for (i = 0; i < n; i++) {
                    c = nodes[i];
                    c.x -= cx;
                    c.y -= cy;
                    cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
                }
                node.r = cr;

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

    var Hierarchy = (function () {
        function Hierarchy(json, getChildren, getValue) {
            this.TitleAccessor = function (n) {
                return n.Name;
            };
            this.sort = function (a, b) {
                return b.Data - a.Data;
            };

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
            get: function () {
                return this.sort;
            },
            set: function (value) {
                this.sort = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Hierarchy.prototype, "ChildrenAccessor", {
            get: function () {
                return this.getChildren;
            },
            set: function (value) {
                this.getChildren = value;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Hierarchy.prototype, "ValueAccessor", {
            get: function () {
                return this.getValue;
            },
            set: function (value) {
                this.getValue = value;
            },
            enumerable: true,
            configurable: true
        });


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

        Hierarchy.prototype.buildTree = function (json, depth, parent) {
            var childs = this.getChildren.call(this.dataSource, json, depth);
            var node = new TypeViz.TreeNode();

            node.Depth = depth;
            this.flatList.push(node);
            if (TypeViz.IsDefined(parent))
                parent.Append(node);
            else
                this.nodes.push(node);
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

    function layout_hierarchicalRebind(object, hierarchy) {
        TypeViz.rebind(object, hierarchy, "sort", "children", "Data");

        object.nodes = object;
        object.links = layout_hierarchicalLinks;

        return object;
    }

    function layout_hierarchicalLinks(nodes) {
        var nds = nodes.map(function (parent) {
            return (parent.children || []).map(function (child) {
                return { source: parent, target: child };
            });
        });
        return Array.prototype.Merge(nds);
    }

    function myrebind(target, source) {
        var i = 1, n = arguments.length, method;
        while (++i < n)
            target[method = arguments[i]] = TypeViz.rebindMethod(target, source, source[method]);
        return target;
    }
    TypeViz.myrebind = myrebind;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    (function (Diagramming) {
        var SVG = TypeViz.SVG;
        var Group = TypeViz.SVG.Group;
        var Canvas = TypeViz.SVG.Canvas;
        var Point = TypeViz.Point;
        var Rect = TypeViz.Rect;
        var Marker = TypeViz.SVG.Marker;
        var Visual = TypeViz.SVG.Visual;
        var PathBase = TypeViz.SVG.PathBase;
        var NS = TypeViz.SVG.NS;

        var LayoutUndoUnit = (function () {
            function LayoutUndoUnit(initialState, finalState, animate) {
                if (TypeViz.IsUndefined(animate)) {
                    this.animate = false;
                } else {
                    this.animate = animate;
                }
                this.initialState = initialState;
                this._finalState = finalState;
                this.Title = "Diagram layout";
            }
            LayoutUndoUnit.prototype.Undo = function () {
                this.setState(this.initialState);
            };
            LayoutUndoUnit.prototype.Redo = function () {
                this.setState(this._finalState);
            };
            LayoutUndoUnit.prototype.setState = function (state) {
                var diagram = state.diagram;
                if (this.animate) {
                    state.linkMap.ForEach(function (id, points) {
                        var conn = diagram.getId(id);
                        conn.visible(false);
                        if (conn) {
                            conn.Points = points;
                        }
                    });
                    var ticker = new TypeViz.Animation.Ticker();
                    ticker.AddAdapter(new TypeViz.Diagramming.NodePositionAdapter(state));
                    ticker.onComplete(function () {
                        state.linkMap.ForEach(function (id) {
                            var conn = diagram.getId(id);
                            conn.IsVisible = true;
                        });
                    });
                    ticker.play();
                } else {
                    state.nodeMap.ForEach(function (id, bounds) {
                        var shape = diagram.getId(id);
                        if (shape) {
                            shape.Rectangle = bounds;
                        }
                    });

                    state.linkMap.ForEach(function (id, points) {
                        var conn = diagram.getId(id);
                        if (conn) {
                            var ps = [];

                            for (var i = 0; i < points.length; i++) {
                                ps.push(new Point(points[i].x, points[i].y));
                            }
                            conn.Points = ps;
                        }
                    });
                }
            };
            return LayoutUndoUnit;
        })();
        Diagramming.LayoutUndoUnit = LayoutUndoUnit;

        var DiagramSurface = (function () {
            function DiagramSurface(div) {
                var _this = this;
                this.currentPosition = new TypeViz.Point(0, 0);
                this.isShiftPressed = false;
                this.pan = Point.Empty;
                this.isPanning = false;
                this.zoomRate = 1.1;
                this.undoRedoService = new UndoRedoService();
                this.shapes = [];
                this.connections = [];
                this.lastUsedShapeTemplate = null;
                this.hoveredItem = null;
                this.newItem = null;
                this.newConnection = null;
                this.selector = null;
                this.isManipulating = false;
                this.currentZoom = 1.0;
                this.isLayouting = false;
                this.div = div;

                this.canvas = new SVG.Canvas(div);
                this.canvas.Width = div.clientWidth;
                this.canvas.Height = div.clientHeight;

                this.mainLayer = new SVG.Group();
                this.mainLayer.Id = "mainLayer";

                this.canvas.Append(this.mainLayer);

                this.theme = {
                    background: "#fff",
                    connection: "#000",
                    selection: "#ff8822",
                    connector: "#31456b",
                    connectorBorder: "#fff",
                    connectorHoverBorder: "#000",
                    connectorHover: "#0c0"
                };

                this.isSafari = typeof navigator.userAgent.split("WebKit/")[1] != "undefined";
                this.isFirefox = navigator.appVersion.indexOf('Gecko/') >= 0 || ((navigator.userAgent.indexOf("Gecko") >= 0) && !this.isSafari && (typeof navigator.appVersion != "undefined"));

                this.MouseDownHandler = function (e) {
                    _this.MouseDown(e);
                };
                this.MouseUpHandler = function (e) {
                    _this.MouseUp(e);
                };
                this.MouseMoveHandler = function (e) {
                    _this.MouseMove(e);
                };
                this._doubleClickHandler = function (e) {
                    _this.doubleClick(e);
                };
                this._touchStartHandler = function (e) {
                    _this.touchStart(e);
                };
                this._touchEndHandler = function (e) {
                    _this.touchEnd(e);
                };
                this._touchMoveHandler = function (e) {
                    _this.touchMove(e);
                };
                this.KeyDownHandler = function (e) {
                    _this.KeyDown(e);
                };
                this.KeyPressHandler = function (e) {
                    _this.KeyPress(e);
                };
                this.KeyUpHandler = function (e) {
                    _this.keyUp(e);
                };

                this.canvas.MouseMove(this.MouseMoveHandler);
                this.canvas.MouseDown(this.MouseDownHandler);
                this.canvas.MouseUp(this.MouseUpHandler);
                this.canvas.KeyDown = this.KeyDownHandler;
                this.canvas.KeyPress = this.KeyPressHandler;

                this.selector = new Selector(this);
                this.listToWheel(this);
            }
            DiagramSurface.prototype.Layout = function (settings) {
                if (typeof settings === "undefined") { settings = null; }
                this.isLayouting = true;

                if (TypeViz.IsUndefined(settings)) {
                    settings = new TypeViz.Diagramming.LayoutSettings();
                }
                if (TypeViz.IsUndefined(settings.Type)) {
                    settings.Type = 2 /* ForceDirectedLayout */;
                }
                var l;
                switch (settings.Type) {
                    case 0 /* TreeLayout */:
                        l = new TypeViz.Diagramming.TreeLayout(this);
                        break;

                    case 1 /* LayeredLayout */:
                        l = new TypeViz.Diagramming.LayeredLayout(this);
                        break;

                    case 2 /* ForceDirectedLayout */:
                        l = new TypeViz.Diagramming.SpringLayout(this);
                        break;
                    default:
                        throw "Layout algorithm '" + settings.Type + "' is not supported.";
                }
                var initialState = new TypeViz.Diagramming.LayoutState(this);
                var finalState = l.Layout(settings);
                if (finalState) {
                    var unit = new TypeViz.Diagramming.LayoutUndoUnit(initialState, finalState, settings.Animate ? settings.Animate : null);
                    this.undoRedoService.Add(unit);
                }
                this.isLayouting = false;
            };

            DiagramSurface.prototype.randomDiagram = function (shapeCount, maxIncidence, isTree, randomSize) {
                var g = TypeViz.Diagramming.Graph.Utils.createRandomConnectedGraph(shapeCount, maxIncidence, isTree);
                TypeViz.Diagramming.Graph.Utils.createDiagramFromGraph(this, g, false, randomSize);
            };

            Object.defineProperty(DiagramSurface.prototype, "Shapes", {
                get: function () {
                    return this.shapes;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DiagramSurface.prototype, "Connections", {
                get: function () {
                    return this.connections;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DiagramSurface.prototype, "Canvas", {
                get: function () {
                    return this.canvas;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DiagramSurface.prototype, "Zoom", {
                get: function () {
                    return this.currentZoom;
                },
                set: function (v) {
                    if (this.mainLayer == null)
                        throw "The 'mainLayer' is not present.";

                    this.currentZoom = Math.min(Math.max(v, 0.55), 2.0);

                    this.mainLayer.Native.setAttribute("transform", "translate(" + this.pan.X + "," + this.pan.Y + ")scale(" + this.currentZoom + "," + this.currentZoom + ")");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DiagramSurface.prototype, "Pan", {
                get: function () {
                    return this.pan;
                },
                set: function (v) {
                    this.pan = v;
                    this.mainLayer.Native.setAttribute("transform", "translate(" + this.pan.X + "," + this.pan.Y + ")scale(" + this.currentZoom + "," + this.currentZoom + ")");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DiagramSurface.prototype, "MainLayer", {
                get: function () {
                    return this.mainLayer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DiagramSurface.prototype, "Element", {
                get: function () {
                    return this.div;
                },
                enumerable: true,
                configurable: true
            });

            DiagramSurface.prototype.listToWheel = function (self) {
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                var handler = function (e) {
                    var evt = window.event || e;
                    if (evt.preventDefault)
                        evt.preventDefault();
                    else
                        evt.returnValue = false;

                    self.zoomViaMouseWheel(evt, self);
                    return;
                };
                if (self.div.attachEvent)
                    self.div.attachEvent("on" + mousewheelevt, handler);
                else if (self.div.addEventListener)
                    self.div.addEventListener(mousewheelevt, handler, false);
            };
            DiagramSurface.prototype.zoomViaMouseWheel = function (mouseWheelEvent, diagram) {
                var evt = window.event || mouseWheelEvent;
                var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
                var z = diagram.Zoom;
                ;
                if (delta > 0)
                    z *= this.zoomRate;
                else
                    z /= this.zoomRate;

                diagram.Zoom = z;

                mouseWheelEvent.cancelBubble = true;
                return false;
            };

            DiagramSurface.prototype.Focus = function () {
                this.canvas.Focus();
            };

            Object.defineProperty(DiagramSurface.prototype, "Theme", {
                get: function () {
                    return this.theme;
                },
                set: function (value) {
                    this.theme = value;
                },
                enumerable: true,
                configurable: true
            });

            DiagramSurface.prototype.Delete = function (undoable) {
                if (typeof undoable === "undefined") { undoable = false; }
                this.DeleteCurrentSelection(undoable);
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            Object.defineProperty(DiagramSurface.prototype, "Selection", {
                get: function () {
                    return this.getCurrentSelection();
                },
                enumerable: true,
                configurable: true
            });

            DiagramSurface.prototype.Clear = function () {
                this.currentZoom = 1.0;
                this.pan = Point.Empty;
                this.shapes = [];
                this.connections = [];
                this.canvas.Clear();
                this.mainLayer = new SVG.Group();
                this.mainLayer.Id = "mainLayer";
                this.canvas.Append(this.mainLayer);
                this.undoRedoService = new UndoRedoService();
            };

            DiagramSurface.prototype.getCurrentSelection = function () {
                var selection = [];
                for (var i = 0; i < this.shapes.length; i++) {
                    var shape = this.shapes[i];
                    if (shape.IsSelected)
                        selection.push(shape);

                    for (var j = 0; j < shape.Connectors.length; j++) {
                        var connector = shape.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if (connection.IsSelected)
                                selection.push(connection);
                        }
                    }
                }
                return selection;
            };


            Object.defineProperty(DiagramSurface.prototype, "elements", {
                get: function () {
                    return this.shapes;
                },
                enumerable: true,
                configurable: true
            });

            DiagramSurface.prototype.AddConnection = function (item, sink) {
                var connection = null;
                var source = null;

                if (item instanceof Connection) {
                    if (sink != null)
                        throw "Connection and sink cannot be specified simultaneously.";
                    connection = item;
                    source = connection.From;
                    sink = connection.To;
                } else {
                    if (item instanceof Connector) {
                        source = item;
                        connection = new Connection(source, sink);
                    } else if (item instanceof Shape && TypeViz.IsDefined(sink) && sink instanceof Shape) {
                        source = item.Connectors[0];
                        sink = sink.Connectors[0];
                        connection = new Connection(source, sink);
                    } else
                        throw "AddConnection with unsupported parameter combination.";
                }

                source.Connections.push(connection);

                if (sink != null) {
                    sink.Connections.push(connection);
                }
                this.mainLayer.Prepend(connection.Visual);
                connection.Diagram = this;
                connection.Invalidate();
                this.connections.push(connection);
                return connection;
            };
            DiagramSurface.prototype.getId = function (id) {
                var found;
                found = this.shapes.First(function (s) {
                    return s.Visual.Native.id === id;
                });
                if (found) {
                    return found;
                }
                found = this.connections.First(function (c) {
                    return c.Visual.Native.id === id;
                });
                return found;
            };

            DiagramSurface.prototype.AddShape = function (input1, input2) {
                var template, position;
                if (TypeViz.IsUndefined(input1)) {
                    input1 = new TypeViz.Point(0, 0);
                }
                if (input1 instanceof TypeViz.Point) {
                    if (TypeViz.IsDefined(input2)) {
                        template = input2;
                        position = template.hasOwnProperty("position") ? template["position"] : new Point(0, 0);
                    } else {
                        template = TypeViz.Diagramming.Shapes.Rectangle;
                        position = input1;
                    }
                    this.lastUsedShapeTemplate = template;
                    var item = new Shape(template, position);
                    var options = input2 || {};
                    if (options.id)
                        item.Visual.Native.id = options.id;
                    return this.AddItem(item);
                } else {
                    template = input1;
                    if (!template)
                        throw "Expecting a Point or IShapeTemplate";
                    this.lastUsedShapeTemplate = template;
                    var item = new Shape(template, template.Position);
                    this.AddItem(item);
                    return item;
                }
            };

            DiagramSurface.prototype.AddItem = function (shape) {
                this.shapes.push(shape);
                shape.Diagram = this;
                this.mainLayer.Append(shape.Visual);

                return shape;
            };
            DiagramSurface.prototype.AddMarker = function (marker) {
                this.canvas.AddMarker(marker);
            };

            DiagramSurface.prototype.Undo = function () {
                this.undoRedoService.Undo();
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            DiagramSurface.prototype.SelectAll = function () {
                this.undoRedoService.begin();
                var selectionUndoUnit = new SelectionUndoUnit();
                this.selectAll(selectionUndoUnit, null);
                this.undoRedoService.Add(selectionUndoUnit);
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            DiagramSurface.prototype.Redo = function () {
                this.undoRedoService.Redo();
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            DiagramSurface.prototype.RecreateLastUsedShape = function () {
                var shape = new Shape(this.lastUsedShapeTemplate, this.currentPosition);
                var unit = new AddShapeUnit(shape, this);
                this.undoRedoService.Add(unit);
            };

            DiagramSurface.prototype.RemoveConnection = function (con) {
                con.IsSelected = false;
                con.From.Connections.Remove(con);
                if (con.To != null)
                    con.To.Connections.Remove(con);
                con.Diagram = null;
                this.Connections.Remove(con);
                this.mainLayer.Remove(con.Visual);
            };

            DiagramSurface.prototype.RemoveShape = function (shape) {
                shape.Diagram = null;
                shape.IsSelected = false;
                this.shapes.Remove(shape);
                this.mainLayer.Remove(shape.Visual);
            };

            DiagramSurface.prototype.setElementContent = function (element, content) {
                this.undoRedoService.Add(new ContentChangedUndoUnit(element, content));
                this.Refresh();
            };

            DiagramSurface.prototype.DeleteCurrentSelection = function (undoable) {
                if (typeof undoable === "undefined") { undoable = true; }
                if (undoable)
                    this.undoRedoService.begin();

                var deletedConnections = [];
                for (var i = 0; i < this.shapes.length; i++) {
                    var shape = this.shapes[i];
                    for (var j = 0; j < shape.Connectors.length; j++) {
                        var connector = shape.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if ((shape.IsSelected || connection.IsSelected) && (!deletedConnections.Contains(connection))) {
                                if (undoable)
                                    this.undoRedoService.AddCompositeItem(new DeleteConnectionUnit(connection));
                                deletedConnections.push(connection);
                            }
                        }
                    }
                }

                if (!undoable && deletedConnections.length > 0) {
                    for (var i = 0; i < deletedConnections.length; i++) {
                        var connection = deletedConnections[i];
                        this.RemoveConnection(connection);
                    }
                }

                for (var i = 0; i < this.shapes.length; i++) {
                    var shape = this.shapes[i];
                    if (shape.IsSelected) {
                        if (undoable)
                            this.undoRedoService.AddCompositeItem(new DeleteShapeUnit(shape));
                        else
                            this.RemoveShape(shape);
                    }
                }
                if (undoable)
                    this.undoRedoService.commit();
            };

            DiagramSurface.prototype.MouseDown = function (e) {
                this.Focus();
                e.preventDefault();
                this.UpdateCurrentPosition(e);
                if (e.button === 0) {
                    if ((this.newItem === null) && (e.altKey))
                        this.RecreateLastUsedShape();
                    else
                        this.Down(e);
                }
            };

            DiagramSurface.prototype.MouseUp = function (e) {
                e.preventDefault();
                this.UpdateCurrentPosition(e);
                if (e.button === 0)
                    this.Up();
            };

            DiagramSurface.prototype.MouseMove = function (e) {
                e.preventDefault();
                this.UpdateCurrentPosition(e);
                this.Move();
            };

            DiagramSurface.prototype.doubleClick = function (e) {
                e.preventDefault();
                this.UpdateCurrentPosition(e);

                if (e.button === 0) {
                    var point = this.currentPosition;

                    this.UpdateHoveredItem(point);
                    if ((this.hoveredItem != null) && (this.hoveredItem instanceof Shape)) {
                        var item = this.hoveredItem;
                        if ((item.Template != null) && ("edit" in item.Template)) {
                            item.Template.Edit(item, this.canvas, point);
                            this.Refresh();
                        }
                    }
                }
            };

            DiagramSurface.prototype.touchStart = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault();
                    this.UpdateCurrentTouchPosition(e);
                    this.Down(e);
                }
            };

            DiagramSurface.prototype.touchEnd = function (e) {
                e.preventDefault();
                this.Up();
            };

            DiagramSurface.prototype.touchMove = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault();
                    this.UpdateCurrentTouchPosition(e);
                    this.Move();
                }
            };

            DiagramSurface.prototype.Down = function (e) {
                var p = this.currentPosition;

                if (this.newItem != null) {
                    this.undoRedoService.begin();

                    this.newItem.Rectangle = new Rect(p.X, p.Y, this.newItem.Rectangle.Width, this.newItem.Rectangle.Height);
                    this.newItem.Invalidate();
                    this.undoRedoService.AddCompositeItem(new AddShapeUnit(this.newItem, this));
                    this.undoRedoService.commit();
                    this.newItem = null;
                } else {
                    this.selector.End();
                    this.UpdateHoveredItem(p);
                    if (this.hoveredItem === null) {
                        var ev = window.event || e;
                        if (ev.ctrlKey == true) {
                            this.isPanning = true;
                            this.panStart = this.Pan;
                            this.panOffset = p;
                            this.panDelta = Point.Empty;
                        } else {
                            this.selector.Start(p);
                        }
                    } else {
                        if ((this.hoveredItem instanceof Connector) && (!this.isShiftPressed)) {
                            var connector = this.hoveredItem;

                            if (connector.CanConnectTo(null)) {
                                this.newConnection = this.AddConnection(connector, null);
                                this.newConnection.UpdateEndPoint(p);
                            }
                        } else {
                            var item = this.hoveredItem;
                            if (!item.IsSelected) {
                                this.undoRedoService.begin();
                                var selectionUndoUnit = new SelectionUndoUnit();
                                if (!this.isShiftPressed)
                                    this.DeselectAll(selectionUndoUnit);
                                selectionUndoUnit.select(item);
                                this.undoRedoService.AddCompositeItem(selectionUndoUnit);
                                this.undoRedoService.commit();
                            } else if (this.isShiftPressed) {
                                this.undoRedoService.begin();
                                var deselectUndoUnit = new SelectionUndoUnit();
                                deselectUndoUnit.deselect(item);
                                this.undoRedoService.AddCompositeItem(deselectUndoUnit);
                                this.undoRedoService.commit();
                            }

                            var hit = new Point(0, 0);
                            if (this.hoveredItem instanceof Shape) {
                                var element = this.hoveredItem;
                                hit = element.Adorner.HitTest(p);
                            }
                            for (var i = 0; i < this.shapes.length; i++) {
                                var shape = this.shapes[i];
                                if (shape.Adorner != null)
                                    shape.Adorner.Start(p, hit);
                            }
                            this.isManipulating = true;
                        }
                    }
                }

                this.Refresh();
                this.UpdateCursor();
            };

            DiagramSurface.prototype.Move = function () {
                var p = this.currentPosition;

                if (this.newItem != null) {
                    this.newItem.Rectangle = new Rect(p.X, p.Y, this.newItem.Rectangle.Width, this.newItem.Rectangle.Height);
                    this.newItem.Invalidate();
                }
                if (this.isPanning) {
                    this.panDelta = new Point(this.panDelta.X + p.X - this.panOffset.X, this.panDelta.Y + p.Y - this.panOffset.Y);
                    this.Pan = new Point(this.panStart.X + this.panDelta.X, this.panStart.Y + this.panDelta.Y);

                    return;
                }
                if (this.isManipulating) {
                    for (var i = 0; i < this.shapes.length; i++) {
                        var shape = this.shapes[i];
                        if (shape.Adorner != null) {
                            shape.Adorner.MoveTo(p);

                            shape.Rectangle = shape.Adorner.Rectangle;
                        }
                    }
                }

                if (this.newConnection != null) {
                    this.newConnection.UpdateEndPoint(p);
                    this.newConnection.Invalidate();
                }

                if (this.selector != null)
                    this.selector.updateCurrentPoint(p);

                this.UpdateHoveredItem(p);
                this.Refresh();
                this.UpdateCursor();
            };

            DiagramSurface.prototype.Up = function () {
                var point = this.currentPosition;
                if (this.isPanning) {
                    this.isPanning = false;

                    var unit = new PanUndoUnit(this.panStart, this.Pan, this);
                    this.undoRedoService.Add(unit);
                    return;
                }
                if (this.newConnection != null) {
                    this.UpdateHoveredItem(point);
                    this.newConnection.Invalidate();
                    if ((this.hoveredItem != null) && (this.hoveredItem instanceof Connector)) {
                        var connector = this.hoveredItem;
                        if ((connector != this.newConnection.From) && (connector.CanConnectTo(this.newConnection.From))) {
                            this.newConnection.To = connector;
                            this.undoRedoService.Add(new AddConnectionUnit(this.newConnection, this.newConnection.From, connector));
                            console.log("Connection established.");
                        } else
                            this.RemoveConnection(this.newConnection);
                    } else
                        this.RemoveConnection(this.newConnection);
                    this.newConnection = null;
                }

                if (this.selector.IsActive) {
                    this.undoRedoService.begin();
                    var selectionUndoUnit = new SelectionUndoUnit();
                    var rectangle = this.selector.Rectangle;
                    var selectable = this.hoveredItem;
                    if (((this.hoveredItem === null) || (!selectable.IsSelected)) && !this.isShiftPressed)
                        this.DeselectAll(selectionUndoUnit);
                    if ((rectangle.Width != 0) || (rectangle.Height != 0))
                        this.selectAll(selectionUndoUnit, rectangle);
                    this.undoRedoService.AddCompositeItem(selectionUndoUnit);
                    this.undoRedoService.commit();
                    this.selector.End();
                }

                if (this.isManipulating) {
                    this.undoRedoService.begin();
                    for (var i = 0; i < this.shapes.length; i++) {
                        var shape = this.shapes[i];
                        if (shape.Adorner != null) {
                            shape.Adorner.Stop();
                            shape.Invalidate();
                            var r1 = shape.Adorner.InitialState;
                            var r2 = shape.Adorner.FinalState;
                            if ((r1.X != r2.X) || (r1.Y != r2.Y) || (r1.Width != r2.Width) || (r1.Height != r2.Height))
                                this.undoRedoService.AddCompositeItem(new TransformUnit(shape, r1, r2));
                        }
                    }

                    this.undoRedoService.commit();
                    this.isManipulating = false;
                    this.UpdateHoveredItem(point);
                }

                this.Refresh();
                this.UpdateCursor();
            };

            DiagramSurface.prototype.KeyDown = function (e) {
                if (!this.isFirefox)
                    this.ProcessKey(e, e.keyCode);
            };

            DiagramSurface.prototype.KeyPress = function (e) {
                 {
                    if (typeof this.keyCodeTable === "undefined") {
                        this.keyCodeTable = [];
                        var charCodeTable = {
                            32: ' ',
                            48: '0',
                            49: '1',
                            50: '2',
                            51: '3',
                            52: '4',
                            53: '5',
                            54: '6',
                            55: '7',
                            56: '8',
                            57: '9',
                            59: ';',
                            61: '=',
                            65: 'a',
                            66: 'b',
                            67: 'c',
                            68: 'd',
                            69: 'e',
                            70: 'f',
                            71: 'g',
                            72: 'h',
                            73: 'i',
                            74: 'j',
                            75: 'k',
                            76: 'l',
                            77: 'm',
                            78: 'n',
                            79: 'o',
                            80: 'p',
                            81: 'q',
                            82: 'r',
                            83: 's',
                            84: 't',
                            85: 'u',
                            86: 'v',
                            87: 'w',
                            88: 'x',
                            89: 'y',
                            90: 'z',
                            107: '+',
                            109: '-',
                            110: '.',
                            188: ',',
                            190: '.',
                            191: '/',
                            192: '`',
                            219: '[',
                            220: '\\',
                            221: ']',
                            222: '\"'
                        };

                        for (var keyCode in charCodeTable) {
                            var key = charCodeTable[keyCode];
                            this.keyCodeTable[key.charCodeAt(0)] = keyCode;
                            if (key.toUpperCase() != key)
                                this.keyCodeTable[key.toUpperCase().charCodeAt(0)] = keyCode;
                        }
                    }

                    this.ProcessKey(e, (this.keyCodeTable[e.charCode] != null) ? this.keyCodeTable[e.charCode] : e.keyCode);
                }
            };

            DiagramSurface.prototype.keyUp = function (e) {
                this.UpdateCursor();
            };

            DiagramSurface.prototype.ProcessKey = function (e, keyCode) {
                if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                    if (keyCode == 65) {
                        this.SelectAll();
                        this.stopEvent(e);
                    }

                    if ((keyCode == 90) && (!e.shiftKey)) {
                        this.Undo();
                        this.stopEvent(e);
                    }

                    if (((keyCode == 90) && (e.shiftKey)) || (keyCode == 89)) {
                        this.Redo();
                        this.stopEvent(e);
                    }
                }

                if ((keyCode == 46) || (keyCode == 8)) {
                    this.Delete(true);
                    this.stopEvent(e);
                }

                if (keyCode == 27) {
                    this.newItem = null;
                    if (this.newConnection != null) {
                        this.RemoveConnection(this.newConnection);
                        this.newConnection = null;
                    }
                    this.isManipulating = false;
                    for (var i = 0; i < this.shapes.length; i++) {
                        var element = this.shapes[i];
                        if (element.Adorner != null)
                            element.Adorner.Stop();
                    }

                    this.Refresh();
                    this.UpdateHoveredItem(this.currentPosition);
                    this.UpdateCursor();
                    this.stopEvent(e);
                }
            };

            DiagramSurface.prototype.stopEvent = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };

            DiagramSurface.prototype.selectAll = function (selectionUndoUnit, r) {
                for (var i = 0; i < this.shapes.length; i++) {
                    var element = this.shapes[i];
                    if ((r === null) || (element.HitTest(r)))
                        selectionUndoUnit.select(element);
                    for (var j = 0; j < element.Connectors.length; j++) {
                        var connector = element.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if ((r === null) || (connection.HitTest(r)))
                                selectionUndoUnit.select(connection);
                        }
                    }
                }
            };

            DiagramSurface.prototype.DeselectAll = function (selectionUndoUnit) {
                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    selectionUndoUnit.deselect(item);

                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++)
                            selectionUndoUnit.deselect(connector.Connections[k]);
                    }
                }
            };

            DiagramSurface.prototype.UpdateHoveredItem = function (p) {
                var hitObject = this.HitTest(p);
                if (hitObject != this.hoveredItem) {
                    if (this.hoveredItem != null)
                        this.hoveredItem.IsHovered = false;
                    this.hoveredItem = hitObject;
                    if (this.hoveredItem != null)
                        this.hoveredItem.IsHovered = true;
                }
            };

            DiagramSurface.prototype.HitTest = function (point) {
                var rectangle = new Rect(point.X, point.Y, 0, 0);

                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        if (connector.HitTest(rectangle))
                            return connector;
                    }
                }

                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    if (item.HitTest(rectangle))
                        return item;
                }

                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if (connection.HitTest(rectangle))
                                return connection;
                        }
                    }
                }
                return null;
            };

            DiagramSurface.prototype.UpdateCursor = function () {
            };

            DiagramSurface.prototype.UpdateCurrentPosition = function (e) {
                this.isShiftPressed = e.shiftKey;
                this.currentPosition = new Point(e.pageX - this.pan.X, e.pageY - this.pan.Y);
                var node = this.div;

                while (node != null) {
                    this.currentPosition.X -= node.offsetLeft;
                    this.currentPosition.Y -= node.offsetTop;
                    node = node.offsetParent;
                }
                this.currentPosition.X /= this.Zoom;
                this.currentPosition.Y /= this.Zoom;
            };

            DiagramSurface.prototype.UpdateCurrentTouchPosition = function (e) {
                this.isShiftPressed = false;
                this.currentPosition = new Point(e.touches[0].pageX, e.touches[0].pageY);
                var node = this.div;
                while (node != null) {
                    this.currentPosition.X -= node.offsetLeft;
                    this.currentPosition.Y -= node.offsetTop;
                    node = node.offsetParent;
                }
            };

            DiagramSurface.prototype.Refresh = function () {
                var connections = [];
                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if (!connections.Contains(connection)) {
                                connection.paint(this.canvas);
                                connections.push(connection);
                            }
                        }
                    }
                }
                for (var i = 0; i < this.shapes.length; i++)
                    this.shapes[i].paint(this.canvas);
                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        var IsHovered = false;
                        for (var k = 0; k < connector.Connections.length; k++)
                            if (connector.Connections[k].IsHovered)
                                IsHovered = true;
                        if ((item.IsHovered) || (connector.IsHovered) || IsHovered)
                            connector.Invalidate((this.newConnection != null) ? this.newConnection.From : null);
                        else if ((this.newConnection != null) && (connector.CanConnectTo(this.newConnection.From)))
                            connector.Invalidate(this.newConnection.From);
                    }
                }

                if (this.newItem != null)
                    this.newItem.paint(this.canvas);
                if (this.newConnection != null)
                    this.newConnection.paintAdorner(this.canvas);
                if (this.selector.IsActive)
                    this.selector.paint(this.canvas);
            };
            return DiagramSurface;
        })();
        Diagramming.DiagramSurface = DiagramSurface;

        var Cursors = (function () {
            function Cursors() {
            }
            Cursors.arrow = "default";
            Cursors.grip = "pointer";
            Cursors.cross = "pointer";
            Cursors.add = "pointer";
            Cursors.MoveTo = "move";
            Cursors.select = "pointer";
            return Cursors;
        })();
        Diagramming.Cursors = Cursors;

        

        

        

        

        

        var Connection = (function () {
            function Connection(from, to, options) {
                this.toPoint = null;
                if (from instanceof Shape) {
                    from = from.Connectors[0];
                }
                if (to instanceof Shape) {
                    to = to.Connectors[0];
                }
                options = options || {};
                this.fromConnector = from;
                this.toConnector = to;
                this.createVisual();
                if (options.id)
                    this.Id = options.id;
                this.points = [];
            }
            Object.defineProperty(Connection.prototype, "Visual", {
                get: function () {
                    return this.visual;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connection.prototype, "Points", {
                get: function () {
                    return this.points;
                },
                set: function (ps) {
                    this.points = ps;
                    this.updateVisual();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Connection.prototype, "Content", {
                set: function (v) {
                    if (v == null)
                        this.removeContent();
                    var tb = new SVG.TextBlock();
                    tb.dy = -5;
                    tb.Text = v.toString();
                    this.contentVisual = tb;
                    this.visual.Append(this.contentVisual);
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });

            Connection.prototype.removeContent = function () {
                if (this.contentVisual == null)
                    return;
                this.visual.Remove(this.contentVisual);
                this.contentVisual = null;
            };

            Object.defineProperty(Connection.prototype, "IsVisible", {
                get: function () {
                    return (this.Visual.Native.attributes["visibility"] == null) ? true : this.Visual.Native.attributes["visibility"].value == "visible";
                },
                set: function (value) {
                    if (value)
                        this.Visual.Native.setAttribute("visibility", "visible");
                    else
                        this.Visual.Native.setAttribute("visibility", "hidden");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connection.prototype, "Id", {
                get: function () {
                    return this.Visual.Native.id;
                },
                set: function (id) {
                    this.Visual.Native.id = id;
                },
                enumerable: true,
                configurable: true
            });
            Connection.prototype.createVisual = function () {
                var g = new Group;
                this.path = new SVG.Path();
                var interpolator = TypeViz.SVG.Interpolate({
                    Interpolator: TypeViz.SVG.Interpolators.SplineInterpolator,
                    IsClosed: false
                });
                this.path.Interpolator = interpolator;
                this.path.Stroke = "Green";
                g.Append(this.path);
                this.visual = g;
                this.updateCoordinates();
                this.unselectedColor = this.path.Stroke;
                this.path.StrokeThickness = 1;
            };

            Connection.prototype.updateCoordinates = function () {
                if (this.toConnector == null) {
                    var merged;

                    if (this.toPoint == null || isNaN(this.toPoint.X) || isNaN(this.toPoint.Y))
                        return;
                    var globalSourcePoint = this.fromConnector.Parent.GetConnectorPosition(this.fromConnector);
                    var globalSinkPoint = this.toPoint;
                    var bounds = Rect.FromPoints(globalSourcePoint, globalSinkPoint);
                    var localSourcePoint = globalSourcePoint.Minus(bounds.TopLeft);
                    var localSinkPoint = globalSinkPoint.Minus(bounds.TopLeft);

                    if (TypeViz.IsDefined(this.points) && this.points.length > 0) {
                        merged = [localSourcePoint];
                        for (var i = 0; i < this.points.length; i++) {
                            merged.push(this.points[i].Minus(bounds.TopLeft));
                        }
                        merged.push(localSinkPoint);
                        this.path.Points = merged;
                    } else {
                        this.path.Points = [localSourcePoint, localSinkPoint];
                    }

                    this.visual.Position = bounds.TopLeft;
                    return;
                }
                var globalSourcePoint = this.fromConnector.Parent.GetConnectorPosition(this.fromConnector);
                var globalSinkPoint = this.toConnector.Parent.GetConnectorPosition(this.toConnector);
                var bounds = Rect.FromPoints(globalSourcePoint, globalSinkPoint);
                var localSourcePoint = globalSourcePoint.Minus(bounds.TopLeft);
                var localSinkPoint = globalSinkPoint.Minus(bounds.TopLeft);

                if (TypeViz.IsDefined(this.points) && this.points.length > 0) {
                    merged = [localSourcePoint];
                    for (var i = 0; i < this.points.length; i++) {
                        merged.push(this.points[i].Minus(bounds.TopLeft));
                    }
                    merged.push(localSinkPoint);
                    this.path.Points = merged;
                } else {
                    this.path.Points = [localSourcePoint, localSinkPoint];
                }
                this.visual.Position = bounds.TopLeft;

                if (this.contentVisual != null) {
                    var m = Point.MiddleOf(localSourcePoint, localSinkPoint);
                    this.contentVisual.Position = m;
                    var p = localSinkPoint.Minus(localSourcePoint);
                    var tr = this.contentVisual.Native.ownerSVGElement.createSVGTransform();
                    tr.setRotate(p.ToPolar(true).Angle, m.X, m.Y);
                    var tb = this.contentVisual.Native;
                    if (tb.transform.baseVal.numberOfItems == 0)
                        tb.transform.baseVal.appendItem(tr);
                    else
                        tb.transform.baseVal.replaceItem(tr, 0);
                }
            };

            Connection.prototype.updateVisual = function () {
                this.updateCoordinates();
                if (this.isSelected) {
                    this.path.Stroke = "Orange";
                    this.path.StrokeThickness = 2;
                    if (this.EndCap != null)
                        this.EndCap.Color = "Orange";
                    if (this.StartCap != null)
                        this.StartCap.Color = "Orange";
                } else {
                    this.path.Stroke = this.unselectedColor;
                    this.path.StrokeThickness = 1;
                    if (this.EndCap != null)
                        this.EndCap.Color = this.unselectedColor;
                    if (this.StartCap != null)
                        this.StartCap.Color = this.unselectedColor;
                }
            };

            Connection.prototype.updateContent = function () {
            };


            Object.defineProperty(Connection.prototype, "EndCap", {
                get: function () {
                    return this.endCap;
                },
                set: function (marker) {
                    if (marker == null)
                        throw "Given Marker is null.";
                    if (marker.Id == null)
                        throw "Given Marker has no Id.";
                    marker.Color = this.Stroke;
                    this.Diagram.AddMarker(marker);
                    this.path.MarkerEnd = marker;
                    this.endCap = marker;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "StartCap", {
                get: function () {
                    return this.startCap;
                },
                set: function (marker) {
                    if (marker == null)
                        throw "Given Marker is null.";
                    if (marker.Id == null)
                        throw "Given Marker has no Id.";
                    marker.Color = this.Stroke;
                    this.Diagram.AddMarker(marker);
                    this.path.MarkerStart = marker;
                    this.startCap = marker;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "Stroke", {
                get: function () {
                    return this.path.Stroke;
                },
                set: function (value) {
                    this.path.Stroke = value;
                    this.unselectedColor = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "Opacity", {
                get: function () {
                    return this.path.Opacity;
                },
                set: function (value) {
                    this.path.Opacity = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "StrokeDash", {
                get: function () {
                    return this.path.StrokeDash;
                },
                set: function (value) {
                    this.path.StrokeDash = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connection.prototype, "From", {
                get: function () {
                    return this.fromConnector;
                },
                set: function (v) {
                    this.fromConnector = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "To", {
                get: function () {
                    return this.toConnector;
                },
                set: function (v) {
                    this.toConnector = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "IsSelected", {
                get: function () {
                    return this.isSelected;
                },
                set: function (value) {
                    this.isSelected = value;
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "IsHovered", {
                get: function () {
                    return this.isHovered;
                },
                set: function (value) {
                    this.isHovered = value;
                },
                enumerable: true,
                configurable: true
            });


            Connection.prototype.UpdateEndPoint = function (toPoint) {
                this.toPoint = toPoint;
                this.updateCoordinates();
            };

            Connection.prototype.GetCursor = function (point) {
                return Cursors.select;
            };

            Connection.prototype.HitTest = function (rectangle) {
                if ((this.From != null) && (this.To != null)) {
                    var p1 = this.From.Parent.GetConnectorPosition(this.From);
                    var p2 = this.To.Parent.GetConnectorPosition(this.To);
                    if ((rectangle.Width != 0) || (rectangle.Width != 0))
                        return (rectangle.Contains(p1) && rectangle.Contains(p2));

                    var p = rectangle.TopLeft;

                    if (p1.X > p2.X) {
                        var temp = p2;
                        p2 = p1;
                        p1 = temp;
                    }

                    var r1 = new Rect(p1.X, p1.Y, 0, 0);
                    var r2 = new Rect(p2.X, p2.Y, 0, 0);
                    r1.Inflate(3, 3);
                    r2.Inflate(3, 3);

                    if (r1.Union(r2).Contains(p)) {
                        if ((p1.X == p2.X) || (p1.Y == p2.Y))
                            return true;
                        else if (p1.Y < p2.Y) {
                            var o1 = r1.X + (((r2.X - r1.X) * (p.Y - (r1.Y + r1.Height))) / ((r2.Y + r2.Height) - (r1.Y + r1.Height)));
                            var u1 = (r1.X + r1.Width) + ((((r2.X + r2.Width) - (r1.X + r1.Width)) * (p.Y - r1.Y)) / (r2.Y - r1.Y));
                            return ((p.X > o1) && (p.X < u1));
                        } else {
                            var o2 = r1.X + (((r2.X - r1.X) * (p.Y - r1.Y)) / (r2.Y - r1.Y));
                            var u2 = (r1.X + r1.Width) + ((((r2.X + r2.Width) - (r1.X + r1.Width)) * (p.Y - (r1.Y + r1.Height))) / ((r2.Y + r2.Height) - (r1.Y + r1.Height)));
                            return ((p.X > o2) && (p.X < u2));
                        }
                    }
                }
                return false;
            };

            Connection.prototype.Invalidate = function () {
                this.updateVisual();
            };

            Connection.prototype.paint = function (context) {
            };

            Connection.prototype.paintAdorner = function (context) {
                this.paintLine(context, true);
            };

            Connection.prototype.paintLine = function (context, dashed) {
                if (this.From != null) {
                    var Start = this.From.Parent.GetConnectorPosition(this.From);
                    var end = (this.To != null) ? this.To.Parent.GetConnectorPosition(this.To) : this.toPoint;
                }
            };
            return Connection;
        })();
        Diagramming.Connection = Connection;

        var Connector = (function () {
            function Connector(parent, template) {
                this.connections = [];
                this.isHovered = false;
                this.parent = parent;
                this.template = template;
            }
            Object.defineProperty(Connector.prototype, "Parent", {
                get: function () {
                    return this.parent;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "Template", {
                get: function () {
                    return this.template;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "Connections", {
                get: function () {
                    return this.connections;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "Background", {
                set: function (value) {
                    this.Visual.Native.setAttribute("fill", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "IsHovered", {
                get: function () {
                    return this.isHovered;
                },
                set: function (value) {
                    this.isHovered = value;
                    this.IsVisible = value;
                    this.Background = value ? "Green" : "Black";
                },
                enumerable: true,
                configurable: true
            });


            Connector.prototype.GetCursor = function (point) {
                return Cursors.grip;
            };

            Connector.prototype.HitTest = function (r) {
                if ((r.Width === 0) && (r.Height === 0))
                    return this.Rectangle.Contains(r.TopLeft);
                return r.Contains(this.Rectangle.TopLeft);
            };

            Object.defineProperty(Connector.prototype, "IsVisible", {
                get: function () {
                    return (this.Visual.Native.attributes["visibility"] == null) ? true : this.Visual.Native.attributes["visibility"].value == "visible";
                },
                set: function (value) {
                    if (value)
                        this.Visual.Native.setAttribute("visibility", "visible");
                    else
                        this.Visual.Native.setAttribute("visibility", "hidden");
                },
                enumerable: true,
                configurable: true
            });


            Connector.prototype.Invalidate = function (other) {
                var r = this.Rectangle;
                var strokeStyle = this.parent.Diagram.Theme.connectorBorder;
                var fillStyle = this.parent.Diagram.Theme.connector;
                if (this.isHovered) {
                    strokeStyle = this.parent.Diagram.Theme.connectorHoverBorder;
                    fillStyle = this.parent.Diagram.Theme.connectorHover;
                    if (other != null && !this.CanConnectTo(other))
                        fillStyle = "#f00";
                }
                this.Visual.Native.setAttribute("fill", fillStyle);
            };

            Connector.prototype.CanConnectTo = function (other) {
                if (other === this)
                    return false;
                if (other == null)
                    return true;
                return this.Template.CanConnectTo(other);
            };

            Connector.prototype.toString = function () {
                return "Connector";
            };

            Object.defineProperty(Connector.prototype, "Rectangle", {
                get: function () {
                    var point = this.parent.GetConnectorPosition(this);
                    var rectangle = new Rect(point.X, point.Y, 0, 0);
                    rectangle.Inflate(3, 3);
                    return rectangle;
                },
                enumerable: true,
                configurable: true
            });
            return Connector;
        })();
        Diagramming.Connector = Connector;

        var CompositeUnit = (function () {
            function CompositeUnit(unit) {
                if (typeof unit === "undefined") { unit = null; }
                this.units = [];
                if (unit != null)
                    this.units.push(unit);
            }
            CompositeUnit.prototype.Add = function (undoUnit) {
                this.units.push(undoUnit);
            };

            CompositeUnit.prototype.Undo = function () {
                for (var i = 0; i < this.units.length; i++)
                    this.units[i].Undo();
            };

            CompositeUnit.prototype.Redo = function () {
                for (var i = 0; i < this.units.length; i++)
                    this.units[i].Redo();
            };

            Object.defineProperty(CompositeUnit.prototype, "Title", {
                get: function () {
                    return "Composite unit";
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CompositeUnit.prototype, "IsEmpty", {
                get: function () {
                    if (this.units.length > 0) {
                        for (var i = 0; i < this.units.length; i++) {
                            if (!this.units[i].IsEmpty) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            return CompositeUnit;
        })();
        Diagramming.CompositeUnit = CompositeUnit;

        ;

        var ContentChangedUndoUnit = (function () {
            function ContentChangedUndoUnit(element, content) {
                this.item = element;
                this._undoContent = element.Content;
                this._redoContent = content;
            }
            Object.defineProperty(ContentChangedUndoUnit.prototype, "Title", {
                get: function () {
                    return "Content Editing";
                },
                enumerable: true,
                configurable: true
            });

            ContentChangedUndoUnit.prototype.Undo = function () {
                this.item.Content = this._undoContent;
            };

            ContentChangedUndoUnit.prototype.Redo = function () {
                this.item.Content = this._redoContent;
            };

            Object.defineProperty(ContentChangedUndoUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return ContentChangedUndoUnit;
        })();
        Diagramming.ContentChangedUndoUnit = ContentChangedUndoUnit;

        var DeleteConnectionUnit = (function () {
            function DeleteConnectionUnit(connection) {
                this.connection = connection;
                this.diagram = connection.Diagram;
                this.from = connection.From;
                this.to = connection.To;
            }
            Object.defineProperty(DeleteConnectionUnit.prototype, "Title", {
                get: function () {
                    return "Delete connection";
                },
                enumerable: true,
                configurable: true
            });

            DeleteConnectionUnit.prototype.Undo = function () {
                this.diagram.AddConnection(this.connection);
            };

            DeleteConnectionUnit.prototype.Redo = function () {
                this.diagram.RemoveConnection(this.connection);
            };

            Object.defineProperty(DeleteConnectionUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return DeleteConnectionUnit;
        })();
        Diagramming.DeleteConnectionUnit = DeleteConnectionUnit;

        var DeleteShapeUnit = (function () {
            function DeleteShapeUnit(shape) {
                this.shape = shape;
                this.diagram = shape.Diagram;
            }
            Object.defineProperty(DeleteShapeUnit.prototype, "Title", {
                get: function () {
                    return "Deletion";
                },
                enumerable: true,
                configurable: true
            });

            DeleteShapeUnit.prototype.Undo = function () {
                this.diagram.AddItem(this.shape);
                this.shape.IsSelected = false;
            };

            DeleteShapeUnit.prototype.Redo = function () {
                this.shape.IsSelected = false;
                this.diagram.RemoveShape(this.shape);
            };

            Object.defineProperty(DeleteShapeUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return DeleteShapeUnit;
        })();
        Diagramming.DeleteShapeUnit = DeleteShapeUnit;

        var TransformUnit = (function () {
            function TransformUnit(shape, undoRectangle, redoRectangle) {
                this.shape = shape;
                this.undoRectangle = undoRectangle.Clone();
                this.redoRectangle = redoRectangle.Clone();
            }
            Object.defineProperty(TransformUnit.prototype, "Title", {
                get: function () {
                    return "Transformation";
                },
                enumerable: true,
                configurable: true
            });

            TransformUnit.prototype.Undo = function () {
                this.shape.Rectangle = this.undoRectangle;
                this.shape.Invalidate();
            };

            TransformUnit.prototype.Redo = function () {
                this.shape.Rectangle = this.redoRectangle;
                this.shape.Invalidate();
            };

            Object.defineProperty(TransformUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return TransformUnit;
        })();
        Diagramming.TransformUnit = TransformUnit;

        var AddConnectionUnit = (function () {
            function AddConnectionUnit(connection, from, to) {
                this.connection = connection;
                this.diagram = connection.Diagram;
                this.from = from;
                this.to = to;
            }
            Object.defineProperty(AddConnectionUnit.prototype, "Title", {
                get: function () {
                    return "New connection";
                },
                enumerable: true,
                configurable: true
            });

            AddConnectionUnit.prototype.Undo = function () {
                this.diagram.RemoveConnection(this.connection);
            };

            AddConnectionUnit.prototype.Redo = function () {
                this.diagram.AddConnection(this.connection);
            };

            Object.defineProperty(AddConnectionUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return AddConnectionUnit;
        })();
        Diagramming.AddConnectionUnit = AddConnectionUnit;

        var AddShapeUnit = (function () {
            function AddShapeUnit(shape, diagram) {
                this.shape = shape;
                this.diagram = diagram;
            }
            Object.defineProperty(AddShapeUnit.prototype, "Title", {
                get: function () {
                    return "Insert";
                },
                enumerable: true,
                configurable: true
            });

            AddShapeUnit.prototype.Undo = function () {
                this.diagram.RemoveShape(this.shape);
            };

            AddShapeUnit.prototype.Redo = function () {
                this.diagram.AddItem(this.shape);
            };

            Object.defineProperty(AddShapeUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return AddShapeUnit;
        })();
        Diagramming.AddShapeUnit = AddShapeUnit;

        var SelectionUndoUnit = (function () {
            function SelectionUndoUnit() {
                this.shapeStates = [];
            }
            Object.defineProperty(SelectionUndoUnit.prototype, "Title", {
                get: function () {
                    return "Selection Unit";
                },
                enumerable: true,
                configurable: true
            });

            SelectionUndoUnit.prototype.Undo = function () {
                for (var i = 0; i < this.shapeStates.length; i++)
                    this.shapeStates[i].Item.IsSelected = this.shapeStates[i].undo;
            };

            SelectionUndoUnit.prototype.Redo = function () {
                for (var i = 0; i < this.shapeStates.length; i++)
                    this.shapeStates[i].Item.IsSelected = this.shapeStates[i].redo;
            };

            Object.defineProperty(SelectionUndoUnit.prototype, "IsEmpty", {
                get: function () {
                    for (var i = 0; i < this.shapeStates.length; i++)
                        if (this.shapeStates[i].undo != this.shapeStates[i].redo)
                            return false;
                    return true;
                },
                enumerable: true,
                configurable: true
            });

            SelectionUndoUnit.prototype.select = function (item) {
                this.Refresh(item, item.IsSelected, true);
            };

            SelectionUndoUnit.prototype.deselect = function (Item) {
                this.Refresh(Item, Item.IsSelected, false);
            };

            SelectionUndoUnit.prototype.Refresh = function (item, undo, redo) {
                for (var i = 0; i < this.shapeStates.length; i++) {
                    if (this.shapeStates[i].Item == item) {
                        this.shapeStates[i].redo = redo;
                        return;
                    }
                }
                this.shapeStates.push({ Item: item, undo: undo, redo: redo });
            };
            return SelectionUndoUnit;
        })();
        Diagramming.SelectionUndoUnit = SelectionUndoUnit;

        var PanUndoUnit = (function () {
            function PanUndoUnit(initial, final, diagram) {
                this.initial = initial;
                this.final = final;
                this.diagram = diagram;
            }
            Object.defineProperty(PanUndoUnit.prototype, "Title", {
                get: function () {
                    return "Pan Unit";
                },
                enumerable: true,
                configurable: true
            });

            PanUndoUnit.prototype.Undo = function () {
                this.diagram.Pan = this.initial;
            };

            PanUndoUnit.prototype.Redo = function () {
                this.diagram.Pan = this.final;
            };

            Object.defineProperty(PanUndoUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return PanUndoUnit;
        })();
        Diagramming.PanUndoUnit = PanUndoUnit;

        var Shape = (function () {
            function Shape(template, point) {
                this.isHovered = false;
                this.isSelected = false;
                this.adorner = null;
                this.connectors = [];
                this.rotation = new SVG.Rotation(0);
                this.translation = new SVG.Translation(0, 0);
                this.template = template;
                this._content = template.DefaultContent;
                this.rectangle = Rect.Create(point.X, point.Y, Math.floor(template.Width), Math.floor(template.Height));
                this.createVisual();
            }
            Object.defineProperty(Shape.prototype, "Id", {
                get: function () {
                    return this.Visual.Native.id;
                },
                set: function (id) {
                    this.Visual.Native.id = id;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shape.prototype, "bounds", {
                get: function () {
                    return new TypeViz.Rect(this.Position.X, this.Position.Y, this.Width, this.Height);
                },
                set: function (r) {
                    this.Position = r.TopLeft;
                    this.Width = r.Width;
                    this.Height = r.Height;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "IsVisible", {
                get: function () {
                    return (this.Visual.Native.attributes["visibility"] == null) ? true : this.Visual.Native.attributes["visibility"].value == "visible";
                },
                set: function (value) {
                    if (value)
                        this.Visual.Native.setAttribute("visibility", "visible");
                    else
                        this.Visual.Native.setAttribute("visibility", "hidden");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Visual", {
                get: function () {
                    return this.visual;
                    ;
                },
                enumerable: true,
                configurable: true
            });

            Shape.prototype.getTemplateVisual = function () {
                if (this.template == null)
                    throw "Template is not set.";
                if (this.template.Geometry == null)
                    throw "Geometry is not set in the template.";
                var v = null;
                if (this.template.Geometry.toLowerCase() == "rectangle") {
                    v = new SVG.Rectangle();
                } else if (this.template.Geometry.toLowerCase() == "circle") {
                    v = new SVG.Circle();
                } else {
                    var path = new PathBase();
                    path.Data = this.template.Geometry;
                    v = path;
                }
                v.Stroke = this.template.Stroke;
                v.StrokeThickness = this.template.StrokeThickness;
                v.Background = this.template.Background;
                v.Width = this.template.Width;
                v.Height = this.template.Height;
                v.Opacity = this.Template.Opacity;

                if (v instanceof SVG.Rectangle) {
                    v.CornerRadius = this.Template.CornerRadius;
                }
                if (this.template.Rotation != 0) {
                    var r = this.template.Rotation;
                }
                return v;
            };

            Object.defineProperty(Shape.prototype, "Width", {
                get: function () {
                    return this.Rectangle.Width;
                },
                set: function (v) {
                    this.Rectangle.Width = v;
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Height", {
                get: function () {
                    return this.Rectangle.Height;
                },
                set: function (v) {
                    this.Rectangle.Height = v;
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Shape.prototype, "Class", {
                get: function () {
                    return this.visual.Class;
                },
                set: function (v) {
                    this.visual.Class = v;
                },
                enumerable: true,
                configurable: true
            });

            Shape.prototype.createVisual = function () {
                var g = new Group();
                g.Id = this.template.Id;
                g.Position = this.rectangle.TopLeft;

                var vis = this.getTemplateVisual();
                vis.Position = Point.Empty;
                g.Append(vis);
                this.mainVisual = vis;
                g.Title = (g.Id == null || g.Id.length == 0) ? "Shape" : g.Id;
                if (this.template.hasOwnProperty("ConnectorTemplates")) {
                    if (this.template.ConnectorTemplates != null && this.template.ConnectorTemplates.length > 0) {
                        this.createConnectors(g);
                    }
                } else {
                    this.template.ConnectorTemplates = ShapeTemplateBase.DefaultConnectorTemplates;
                    this.createConnectors(g);
                }

                var tb = new SVG.TextBlock();
                tb.Text = this.Content;
                tb.Background = "White";
                tb.FontFamily = "Segoe UI";
                tb.FontSize = 15;
                tb.X = 10;
                tb.Y = 20;
                g.Append(tb);
                this.visual = g;
            };

            Shape.prototype.createConnectors = function (g) {
                for (var i = 0; i < this.template.ConnectorTemplates.length; i++) {
                    var ct = this.template.ConnectorTemplates[i];
                    var connector = new Connector(this, ct);
                    var c = new SVG.Rectangle();
                    c.Width = 7;
                    c.Height = 7;
                    var relative = ct.GetConnectorPosition(this);
                    c.Position = new Point(relative.X - 3, relative.Y - 3);
                    connector.Visual = c;
                    connector.IsVisible = false;
                    connector.Parent = this;
                    var text = (ct.Description == null || ct.Description.length == 0) ? ct.Name : ct.Description;
                    c.Title = text;
                    g.Append(c);
                    this.Connectors.push(connector);
                }
            };

            Object.defineProperty(Shape.prototype, "Title", {
                get: function () {
                    return this.visual.Title;
                },
                set: function (v) {
                    this.visual.Title = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Rectangle", {
                get: function () {
                    return ((this.adorner != null)) ? this.adorner.Rectangle : this.rectangle;
                },
                set: function (r) {
                    this.rectangle = r;
                    if (this.adorner != null)
                        this.adorner.UpdateRectangle(r);
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Template", {
                get: function () {
                    return this.template;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "Connectors", {
                get: function () {
                    return this.connectors;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "Adorner", {
                get: function () {
                    return this.adorner;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "IsSelected", {
                get: function () {
                    return this.isSelected;
                },
                set: function (value) {
                    if (this.isSelected != value) {
                        this.isSelected = value;

                        if (this.isSelected) {
                            this.adorner = new ResizingAdorner(this.Rectangle, this.template.IsResizable);
                            this.Diagram.MainLayer.Append(this.adorner.Visual);
                            this.Invalidate();
                        } else {
                            this.Invalidate();
                            this.Diagram.MainLayer.Remove(this.adorner.Visual);
                            this.adorner = null;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "IsHovered", {
                get: function () {
                    return this.isHovered;
                },
                set: function (value) {
                    this.isHovered = value;
                    if (this.Connectors.length > 0)
                        for (var i = 0; i < this.Connectors.length; i++)
                            this.Connectors[i].IsVisible = value;
                },
                enumerable: true,
                configurable: true
            });


            Shape.prototype.paint = function (context) {
                if (this.isSelected)
                    this.adorner.paint(context);
            };
            Object.defineProperty(Shape.prototype, "Position", {
                set: function (value) {
                    this.translation.X = value.X;
                    this.translation.Y = value.Y;
                    this.visual.Native.setAttribute("transform", this.translation.toString() + this.rotation.toString());
                },
                enumerable: true,
                configurable: true
            });
            Shape.prototype.Invalidate = function () {
                this.Position = this.Rectangle.TopLeft;
                this.mainVisual.Width = this.Rectangle.Width;
                this.mainVisual.Height = this.Rectangle.Height;
                if (this.Connectors.length > 0) {
                    var cons = [];
                    for (var i = 0; i < this.Connectors.length; i++) {
                        var c = this.Connectors[i];
                        var ct = this.Template.ConnectorTemplates[i];
                        var relative = ct.GetConnectorPosition(this);
                        c.Visual.Position = new Point(relative.X - 3, relative.Y - 3);
                        if (c.Connections.length > 0) {
                            for (var j = 0; j < c.Connections.length; j++)
                                if (!cons.Contains(c.Connections[j]))
                                    cons.push(c.Connections[j]);
                        }
                    }
                    cons.ForEach(function (con) {
                        return con.Invalidate();
                    });
                }
            };

            Shape.prototype.toString = function () {
                return (this.Template == null) ? "Shape" : ("Shape '" + this.Template.Id) + "'";
            };

            Shape.prototype.HitTest = function (r) {
                if ((r.Width === 0) && (r.Height === 0)) {
                    if (this.Rectangle.Contains(r.TopLeft))
                        return true;
                    if ((this.adorner != null)) {
                        var h = this.adorner.HitTest(r.TopLeft);
                        if ((h.X >= -1) && (h.X <= +1) && (h.Y >= -1) && (h.Y <= +1))
                            return true;
                    }
                    for (var i = 0; i < this.connectors.length; i++)
                        if (this.connectors[i].HitTest(r))
                            return true;

                    return false;
                }
                return r.Contains(this.Rectangle.TopLeft);
            };

            Shape.prototype.GetCursor = function (point) {
                if (this.adorner != null) {
                    var cursor = this.adorner.GetCursor(point);
                    if (cursor != null)
                        return cursor;
                }
                if (window.event.shiftKey)
                    return Cursors.add;
                return Cursors.select;
            };

            Shape.prototype.GetConnector = function (name) {
                for (var i = 0; i < this.connectors.length; i++) {
                    var connector = this.connectors[i];
                    if (connector.Template.Name == name)
                        return connector;
                }
                return null;
            };

            Shape.prototype.GetConnectorPosition = function (connector) {
                var r = this.Rectangle;
                var point = connector.Template.GetConnectorPosition(this);
                point.X += r.X;
                point.Y += r.Y;
                return point;
            };

            Shape.prototype.setContent = function (content) {
                this.Diagram.setElementContent(this, content);
            };

            Object.defineProperty(Shape.prototype, "Content", {
                get: function () {
                    return this._content;
                },
                set: function (value) {
                    this._content = value;
                },
                enumerable: true,
                configurable: true
            });

            return Shape;
        })();
        Diagramming.Shape = Shape;

        var UndoRedoService = (function () {
            function UndoRedoService() {
                this.composite = null;
                this.stack = [];
                this.index = 0;
            }
            UndoRedoService.prototype.begin = function () {
                this.composite = new CompositeUnit();
            };

            UndoRedoService.prototype.Cancel = function () {
                this.composite = null;
            };

            UndoRedoService.prototype.commit = function () {
                if (!this.composite.IsEmpty) {
                    this.stack.splice(this.index, this.stack.length - this.index);
                    this.stack.push(this.composite);
                    this.Redo();
                }
                this.composite = null;
            };

            UndoRedoService.prototype.AddCompositeItem = function (undoUnit) {
                if (this.composite == null)
                    throw "Use begin() to initiate and then add an undoable unit.";
                this.composite.Add(undoUnit);
            };

            UndoRedoService.prototype.Add = function (undoUnit) {
                if (undoUnit == null)
                    throw "No undoable unit supplied.";

                this.stack.splice(this.index, this.stack.length - this.index);
                this.stack.push(new CompositeUnit(undoUnit));
                this.Redo();
            };

            UndoRedoService.prototype.count = function () {
                return this.stack.length;
            };

            UndoRedoService.prototype.Undo = function () {
                if (this.index != 0) {
                    this.index--;
                    this.stack[this.index].Undo();
                }
            };

            UndoRedoService.prototype.Redo = function () {
                if ((this.stack.length != 0) && (this.index < this.stack.length)) {
                    this.stack[this.index].Redo();
                    this.index++;
                } else {
                    throw "Reached the end of the undo-redo stack.";
                }
            };
            return UndoRedoService;
        })();
        Diagramming.UndoRedoService = UndoRedoService;

        var ResizingAdorner = (function () {
            function ResizingAdorner(rectangle, resizable) {
                this.isManipulating = false;
                this.map = {};
                this.initialState = null;
                this.finalState = null;
                this.rectangle = rectangle.Clone();
                this.isresizable = resizable;
                this.createVisuals();
            }
            Object.defineProperty(ResizingAdorner.prototype, "Visual", {
                get: function () {
                    return this.visual;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ResizingAdorner.prototype, "InitialState", {
                get: function () {
                    return this.initialState;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ResizingAdorner.prototype, "FinalState", {
                get: function () {
                    return this.finalState;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ResizingAdorner.prototype, "Rectangle", {
                get: function () {
                    return this.rectangle;
                },
                enumerable: true,
                configurable: true
            });

            ResizingAdorner.prototype.createVisuals = function () {
                var g = new Group();
                for (var x = -1; x <= +1; x++) {
                    for (var y = -1; y <= +1; y++) {
                        if ((x != 0) || (y != 0)) {
                            var r = this.GetHandleBounds(new Point(x, y));
                            var visual = new SVG.Rectangle();
                            visual.Position = r.TopLeft;
                            visual.Width = 7;
                            visual.Height = 7;
                            visual.Background = "DimGray";

                            this.map[x.toString() + y.toString()] = visual;
                            g.Append(visual);
                        }
                    }
                }
                g.Position = this.rectangle.TopLeft;
                g.IsVisible = true;
                this.text = new SVG.TextBlock();
                this.text.FontSize = 10;
                this.text.Position = new Point(0, this.rectangle.Height + 20);
                this.text.Text = "Width: " + this.rectangle.Width + ", Height: " + this.rectangle.Height;
                g.Append(this.text);
                this.visual = g;
            };

            ResizingAdorner.prototype.updateVisual = function () {
                for (var x = -1; x <= +1; x++) {
                    for (var y = -1; y <= +1; y++) {
                        if ((x != 0) || (y != 0)) {
                            var v = this.map[x.toString() + y.toString()];
                            var r = this.GetHandleBounds(new Point(x, y));
                            v.Position = r.TopLeft;
                        }
                    }
                }
                this.text.Position = new Point(0, this.rectangle.Height + 20);
                this.text.Text = "Width: " + this.rectangle.Width + ", Height: " + this.rectangle.Height;
                this.visual.Position = this.rectangle.TopLeft;
            };

            ResizingAdorner.prototype.HitTest = function (point) {
                if (this.isresizable) {
                    for (var x = -1; x <= +1; x++) {
                        for (var y = -1; y <= +1; y++) {
                            if ((x != 0) || (y != 0)) {
                                var hit = new Point(x, y);
                                var r = this.GetHandleBounds(hit);
                                r.Offset(this.rectangle.X, this.rectangle.Y);
                                if (r.Contains(point))
                                    return hit;
                            }
                        }
                    }
                }

                if (this.rectangle.Contains(point))
                    return new Point(0, 0);
                return new Point(-2, -2);
            };

            ResizingAdorner.prototype.GetHandleBounds = function (p) {
                var r = new Rect(0, 0, 7, 7);
                if (p.X < 0) {
                    r.X = -7;
                }
                if (p.X === 0) {
                    r.X = Math.floor(this.rectangle.Width / 2) - 3;
                }
                if (p.X > 0) {
                    r.X = this.rectangle.Width + 1.0;
                }
                if (p.Y < 0) {
                    r.Y = -7;
                }
                if (p.Y === 0) {
                    r.Y = Math.floor(this.rectangle.Height / 2) - 3;
                }
                if (p.Y > 0) {
                    r.Y = this.rectangle.Height + 1.0;
                }
                return r;
            };

            ResizingAdorner.prototype.GetCursor = function (point) {
                var hit = this.HitTest(point);
                if ((hit.X === 0) && (hit.Y === 0))
                    return (this.isManipulating) ? Cursors.MoveTo : Cursors.select;
                if ((hit.X >= -1) && (hit.X <= +1) && (hit.Y >= -1) && (hit.Y <= +1) && this.isresizable) {
                    if (hit.X === -1 && hit.Y === -1) {
                        return "nw-resize";
                    }
                    if (hit.X === +1 && hit.Y === +1) {
                        return "se-resize";
                    }
                    if (hit.X === -1 && hit.Y === +1) {
                        return "sw-resize";
                    }
                    if (hit.X === +1 && hit.Y === -1) {
                        return "ne-resize";
                    }
                    if (hit.X === 0 && hit.Y === -1) {
                        return "n-resize";
                    }
                    if (hit.X === 0 && hit.Y === +1) {
                        return "s-resize";
                    }
                    if (hit.X === +1 && hit.Y === 0) {
                        return "e-resize";
                    }
                    if (hit.X === -1 && hit.Y === 0) {
                        return "w-resize";
                    }
                }
                return null;
            };

            ResizingAdorner.prototype.Start = function (point, handle) {
                if ((handle.X >= -1) && (handle.X <= +1) && (handle.Y >= -1) && (handle.Y <= +1)) {
                    this.currentHandle = handle;
                    this.initialState = this.rectangle;
                    this.finalState = null;
                    this.currentPoint = point;
                    this.isManipulating = true;
                }
            };

            ResizingAdorner.prototype.Stop = function () {
                this.finalState = this.rectangle;
                this.isManipulating = false;
            };

            Object.defineProperty(ResizingAdorner.prototype, "IsManipulation", {
                get: function () {
                    return this.isManipulating;
                },
                enumerable: true,
                configurable: true
            });

            ResizingAdorner.prototype.MoveTo = function (p) {
                var h = this.currentHandle;
                var a = Point.Empty;
                var b = Point.Empty;
                if ((h.X == -1) || ((h.X === 0) && (h.Y === 0))) {
                    a.X = p.X - this.currentPoint.X;
                }
                if ((h.Y == -1) || ((h.X === 0) && (h.Y === 0))) {
                    a.Y = p.Y - this.currentPoint.Y;
                }
                if ((h.X == +1) || ((h.X === 0) && (h.Y === 0))) {
                    b.X = p.X - this.currentPoint.X;
                }
                if ((h.Y == +1) || ((h.X === 0) && (h.Y === 0))) {
                    b.Y = p.Y - this.currentPoint.Y;
                }
                var tl = this.rectangle.TopLeft;
                var br = new Point(this.rectangle.X + this.rectangle.Width, this.rectangle.Y + this.rectangle.Height);
                tl.X += a.X;
                tl.Y += a.Y;
                br.X += b.X;
                br.Y += b.Y;

                if (Math.abs(br.X - tl.X) <= 4 || Math.abs(br.Y - tl.Y) <= 4)
                    return;
                this.rectangle.X = tl.X;
                this.rectangle.Y = tl.Y;
                this.rectangle.Width = Math.floor(br.X - tl.X);
                this.rectangle.Height = Math.floor(br.Y - tl.Y);
                this.currentPoint = p;
                this.updateVisual();
            };

            ResizingAdorner.prototype.UpdateRectangle = function (r) {
                this.rectangle = r.Clone();
                this.updateVisual();
            };

            ResizingAdorner.prototype.paint = function (context) {
            };
            return ResizingAdorner;
        })();
        Diagramming.ResizingAdorner = ResizingAdorner;

        var Selector = (function () {
            function Selector(diagram) {
                this.IsActive = false;
                this.visual = new SVG.Rectangle();

                this.visual.Stroke = "#778899";
                this.visual.StrokeThickness = 1;
                this.visual.StrokeDash = "2,2";
                this.visual.Opacity = 0.0;
                this.diagram = diagram;
            }
            Object.defineProperty(Selector.prototype, "Visual", {
                get: function () {
                    return this.visual;
                },
                enumerable: true,
                configurable: true
            });

            Selector.prototype.Start = function (startPoint) {
                this.startPoint = startPoint;
                this.currentPoint = startPoint;
                this.visual.IsVisible = true;
                this.visual.Position = startPoint;
                this.diagram.MainLayer.Append(this.visual);
                this.IsActive = true;
            };

            Selector.prototype.End = function () {
                if (!this.IsActive)
                    return;

                this.startPoint = null;
                this.currentPoint = null;
                this.visual.IsVisible = false;
                this.diagram.MainLayer.Remove(this.visual);
                this.IsActive = false;
            };

            Object.defineProperty(Selector.prototype, "Rectangle", {
                get: function () {
                    var r = new Rect((this.startPoint.X <= this.currentPoint.X) ? this.startPoint.X : this.currentPoint.X, (this.startPoint.Y <= this.currentPoint.Y) ? this.startPoint.Y : this.currentPoint.Y, this.currentPoint.X - this.startPoint.X, this.currentPoint.Y - this.startPoint.Y);
                    if (r.Width < 0)
                        r.Width *= -1;
                    if (r.Height < 0)
                        r.Height *= -1;
                    return r;
                },
                enumerable: true,
                configurable: true
            });

            Selector.prototype.updateCurrentPoint = function (p) {
                this.currentPoint = p;
            };

            Selector.prototype.paint = function (context) {
                var r = this.Rectangle;
                this.visual.Position = r.TopLeft;
                this.visual.Width = r.Width + 1;
                this.visual.Height = r.Height + 1;
            };
            return Selector;
        })();
        Diagramming.Selector = Selector;

        var ShapeTemplateBase = (function () {
            function ShapeTemplateBase(id) {
                if (typeof id === "undefined") { id = null; }
                this.IsResizable = true;
                this.DefaultContent = "";
                this.ConnectorTemplates = ShapeTemplateBase.DefaultConnectorTemplates;
                this.Id = id;
                this.Width = 150;
                this.Height = 80;
                this.Position = Point.Empty;
                this.Stroke = "Silver";
                this.StrokeThickness = 0;
                this.Background = "#1e90ff";
            }
            ShapeTemplateBase.prototype.Edit = function (element, canvas, point) {
            };

            ShapeTemplateBase.prototype.Clone = function () {
                var clone = new ShapeTemplateBase();
                clone.Id = this.Id;
                clone.Width = this.Width;
                clone.Height = this.Height;
                clone.Position = this.Position;
                clone.Background = this.Background;
                return clone;
            };
            ShapeTemplateBase.DefaultConnectorTemplates = [
                {
                    Name: "Top",
                    Type: "Data [in]",
                    Description: "Top Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(Math.floor(parent.Rectangle.Width / 2), 0);
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Top";
                    }
                },
                {
                    Name: "Right",
                    Type: "Data [in]",
                    Description: "Right Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(Math.floor(parent.Rectangle.Width), Math.floor(parent.Rectangle.Height / 2));
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Left";
                    }
                },
                {
                    Name: "Bottom",
                    Type: "Data [out] [array]",
                    Description: "Bottom Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(Math.floor(parent.Rectangle.Width / 2), parent.Rectangle.Height);
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Bottom";
                    }
                },
                {
                    Name: "Left",
                    Type: "Data [in]",
                    Description: "Left Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(0, Math.floor(parent.Rectangle.Height / 2));
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Right";
                    }
                }
            ];
            return ShapeTemplateBase;
        })();
        Diagramming.ShapeTemplateBase = ShapeTemplateBase;

        var Shapes = (function () {
            function Shapes() {
            }
            Object.defineProperty(Shapes, "Rectangle", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "Rectangle";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "Triangle", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m2.5,109.24985l61,-106.74985l61,106.74985l-122,0z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "SequentialData", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m50.21875,97.4375l0,0c-26.35457,0 -47.71875,-21.25185 -47.71875,-47.46875l0,0c0,-26.21678 21.36418,-47.46875 47.71875,-47.46875l0,0c12.65584,0 24.79359,5.00155 33.74218,13.90339c8.94862,8.90154 13.97657,20.97617 13.97657,33.56536l0,0c0,12.58895 -5.02795,24.66367 -13.97657,33.56542l13.97657,0l0,13.90333l-47.71875,0z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "Data", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m2.5,97.70305l19.07013,-95.20305l76.27361,0l-19.0702,95.20305l-76.27354,0z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "Wave", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m2.5,15.5967c31.68356,-45.3672 63.37309,45.3642 95.05661,0l0,81.65914c-31.68353,45.36404 -63.37305,-45.36732 -95.05661,0l0,-81.65914z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });
            return Shapes;
        })();
        Diagramming.Shapes = Shapes;

        (function (NodeTypes) {
            NodeTypes[NodeTypes["ElementNode"] = 1] = "ElementNode";
            NodeTypes[NodeTypes["AttributeNode"] = 2] = "AttributeNode";
            NodeTypes[NodeTypes["TextNode"] = 3] = "TextNode";
            NodeTypes[NodeTypes["CDataNode"] = 4] = "CDataNode";
            NodeTypes[NodeTypes["EntityReferenceNode"] = 5] = "EntityReferenceNode";
            NodeTypes[NodeTypes["EntityNode"] = 6] = "EntityNode";
            NodeTypes[NodeTypes["ProcessingInstructionNode"] = 7] = "ProcessingInstructionNode";
            NodeTypes[NodeTypes["CommentNode"] = 8] = "CommentNode";
            NodeTypes[NodeTypes["DocumentNode"] = 9] = "DocumentNode";
            NodeTypes[NodeTypes["DocumentTypeNode"] = 10] = "DocumentTypeNode";
            NodeTypes[NodeTypes["DocumentFragmentNode"] = 11] = "DocumentFragmentNode";
            NodeTypes[NodeTypes["NotationNode"] = 12] = "NotationNode";
        })(Diagramming.NodeTypes || (Diagramming.NodeTypes = {}));
        var NodeTypes = Diagramming.NodeTypes;
    })(TypeViz.Diagramming || (TypeViz.Diagramming = {}));
    var Diagramming = TypeViz.Diagramming;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    (function (Diagramming) {
        var Node = (function () {
            function Node(id, shape) {
                this.links = [];

                this.outgoing = [];

                this.incoming = [];

                this.weight = 1;

                if (TypeViz.IsDefined(id)) {
                    this.id = id;
                } else {
                    this.id = TypeViz.RandomId();
                }
                if (TypeViz.IsDefined(shape)) {
                    this.associatedShape = shape;

                    var b = shape.Rectangle;
                    this.Width = b.Width;
                    this.Height = b.Height;
                    this.X = b.X;
                    this.Y = b.Y;
                } else {
                    this.associatedShape = null;
                }

                this.data = null;
                this.type = "Node";
                this.shortForm = "Node '" + this.id + "'";

                this.isVirtual = false;
            }
            Object.defineProperty(Node.prototype, "IsIsolated", {
                get: function () {
                    return this.links.IsEmpty();
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Node.prototype, "Bounds", {
                get: function () {
                    return new TypeViz.Rect(this.X, this.Y, this.Width, this.Height);
                },
                set: function (r) {
                    this.X = r.X;
                    this.Y = r.Y;
                    this.Width = r.Width;
                    this.Height = r.Height;
                },
                enumerable: true,
                configurable: true
            });


            Node.prototype.IsLinkedTo = function (node) {
                var thisRef = this;
                return this.links.Any(function (link) {
                    return link.getComplement(thisRef) === node;
                });
            };

            Node.prototype.getChildren = function () {
                if (this.outgoing.length === 0) {
                    return [];
                }
                var children = [];
                for (var i = 0, len = this.outgoing.length; i < len; i++) {
                    var link = this.outgoing[i];
                    children.Add(link.getComplement(this));
                }
                return children;
            };

            Node.prototype.getParents = function () {
                if (this.incoming.length === 0) {
                    return [];
                }
                var parents = [];
                for (var i = 0, len = this.incoming.length; i < len; i++) {
                    var link = this.incoming[i];
                    parents.Add(link.getComplement(this));
                }
                return parents;
            };

            Node.prototype.clone = function () {
                var copy = new TypeViz.Diagramming.Node();
                if (TypeViz.IsDefined(this.weight)) {
                    copy.weight = this.weight;
                }
                if (TypeViz.IsDefined(this.balance)) {
                    copy.balance = this.balance;
                }
                if (TypeViz.IsDefined(this.owner)) {
                    copy.owner = this.owner;
                }
                copy.associatedShape = this.associatedShape;
                copy.X = this.X;
                copy.Y = this.Y;
                copy.Width = this.Width;
                copy.Height = this.Height;
                copy.data = this.data;
                return copy;
            };

            Node.prototype.adjacentTo = function (node) {
                return this.IsLinkedTo(node) !== null;
            };

            Node.prototype.removeLink = function (link) {
                if (link.source === this) {
                    this.links.Remove(link);
                    this.outgoing.Remove(link);
                    link.source = null;
                }

                if (link.target === this) {
                    this.links.Remove(link);
                    this.incoming.Remove(link);
                    link.target = null;
                }
            };

            Node.prototype.hasLinkTo = function (node) {
                return this.outgoing.Any(function (link) {
                    return link.target === node;
                });
            };

            Node.prototype.degree = function () {
                return this.links.length;
            };

            Node.prototype.incidentWith = function (link) {
                return this.links.Contains(link);
            };

            Node.prototype.getLinksWith = function (node) {
                return this.links.All(function (link) {
                    return link.getComplement(this) === node;
                }, this);
            };

            Node.prototype.getNeighbors = function () {
                var neighbors = [];
                this.incoming.ForEach(function (e) {
                    neighbors.push(e.getComplement(this));
                }, this);
                this.outgoing.ForEach(function (e) {
                    neighbors.push(e.getComplement(this));
                }, this);
                return neighbors;
            };
            return Node;
        })();
        Diagramming.Node = Node;

        var Link = (function () {
            function Link(source, target, id, connection) {
                if (TypeViz.IsUndefined(source)) {
                    throw "The source of the new link is not set.";
                }
                if (TypeViz.IsUndefined(target)) {
                    throw "The target of the new link is not set.";
                }
                var sourceFound, targetFound;
                if (TypeViz.IsString(source)) {
                    sourceFound = new Node(source);
                } else {
                    sourceFound = source;
                }
                if (TypeViz.IsString(target)) {
                    targetFound = new TypeViz.Diagramming.Node(target);
                } else {
                    targetFound = target;
                }
                this.points = [];
                this.source = sourceFound;
                this.target = targetFound;
                this.source.links.Add(this);
                this.target.links.Add(this);
                this.source.outgoing.Add(this);
                this.target.incoming.Add(this);
                if (TypeViz.IsDefined(id)) {
                    this.id = id;
                } else {
                    this.id = TypeViz.RandomId();
                }
                if (TypeViz.IsDefined(connection)) {
                    this.associatedConnection = connection;
                } else {
                    this.associatedConnection = null;
                }
                this.type = "Link";
                this.shortForm = "Link '" + this.source.id + "->" + this.target.id + "'";
            }
            Link.prototype.getComplement = function (node) {
                if (this.source !== node && this.target !== node) {
                    throw "The given node is not incident with this link.";
                }
                return this.source === node ? this.target : this.source;
            };

            Link.prototype.getCommonNode = function (link) {
                if (this.source === link.source || this.source === link.target) {
                    return this.source;
                }
                if (this.target === link.source || this.target === link.target) {
                    return this.target;
                }
                return null;
            };

            Link.prototype.isBridging = function (v1, v2) {
                return this.source === v1 && this.target === v2 || this.source === v2 && this.target === v1;
            };

            Link.prototype.getNodes = function () {
                return [this.source, this.target];
            };

            Link.prototype.incidentWith = function (node) {
                return this.source === node || this.target === node;
            };

            Link.prototype.adjacentTo = function (link) {
                return this.source.links.Contains(link) || this.target.links.Contains(link);
            };

            Link.prototype.changeSource = function (node) {
                this.source.links.Remove(this);
                this.source.outgoing.Remove(this);

                node.links.push(this);
                node.outgoing.push(this);

                this.source = node;
            };

            Link.prototype.changeTarget = function (node) {
                this.target.links.Remove(this);
                this.target.incoming.Remove(this);

                node.links.push(this);
                node.incoming.push(this);

                this.target = node;
            };

            Link.prototype.changesNodes = function (v, w) {
                if (this.source === v) {
                    this.changeSource(w);
                } else if (this.target === v) {
                    this.changeTarget(w);
                }
            };

            Link.prototype.reverse = function () {
                var oldSource = this.source;
                var oldTarget = this.target;

                this.source = oldTarget;
                oldSource.outgoing.Remove(this);
                this.source.outgoing.push(this);

                this.target = oldSource;
                oldTarget.incoming.Remove(this);
                this.target.incoming.push(this);
                this.reversed = true;
                return this;
            };

            Link.prototype.directTo = function (target) {
                if (this.source !== target && this.target !== target) {
                    throw "The given node is not incident with this link.";
                }
                if (this.target !== target) {
                    this.reverse();
                }
            };

            Link.prototype.createReverseEdge = function () {
                var r = this.clone();
                r.reverse();
                r.reversed = true;
                return r;
            };

            Link.prototype.clone = function () {
                var clone = new TypeViz.Diagramming.Link(this.source, this.target);
                return clone;
            };
            return Link;
        })();
        Diagramming.Link = Link;

        var Graph = (function () {
            function Graph(idOrDiagram) {
                this.links = [];

                this.nodes = [];

                this.diagram = null;

                this._root = null;
                if (TypeViz.IsDefined(idOrDiagram)) {
                    if (TypeViz.IsString(idOrDiagram)) {
                        this.id = idOrDiagram;
                    } else {
                        this.diagram = idOrDiagram;
                        this.id = idOrDiagram.id;
                    }
                } else {
                    this.id = TypeViz.RandomId();
                }

                this.bounds = new TypeViz.Rect();

                this._hasCachedRelationships = false;
                this.type = "Graph";
            }
            Graph.prototype.cacheRelationships = function (forceRebuild) {
                if (TypeViz.IsUndefined(forceRebuild)) {
                    forceRebuild = false;
                }
                if (this._hasCachedRelationships && !forceRebuild) {
                    return;
                }
                for (var i = 0, len = this.nodes.length; i < len; i++) {
                    var node = this.nodes[i];
                    node.children = this.getChildren(node);
                    node.parents = this.getParents(node);
                }
                this._hasCachedRelationships = true;
            };

            Graph.prototype.assignLevels = function (startNode, offset, visited) {
                if (!startNode) {
                    throw "Start node not specified.";
                }
                if (TypeViz.IsUndefined(offset)) {
                    offset = 0;
                }

                this.cacheRelationships();
                if (TypeViz.IsUndefined(visited)) {
                    visited = new TypeViz.Map();
                    this.nodes.ForEach(function (n) {
                        visited.Add(n, false);
                    });
                }
                visited.Set(startNode, true);
                startNode.level = offset;
                var children = startNode.children;
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (!child || visited.Get(child)) {
                        continue;
                    }
                    this.assignLevels(child, offset + 1, visited);
                }
            };
            Object.defineProperty(Graph.prototype, "root", {
                get: function () {
                    if (!this._root) {
                        var found = this.nodes.First(function (n) {
                            return n.incoming.length === 0;
                        });
                        if (found) {
                            return found;
                        }
                        return this.nodes.First();
                    } else {
                        return this._root;
                    }
                },
                set: function (value) {
                    this._root = value;
                },
                enumerable: true,
                configurable: true
            });


            Graph.prototype.getConnectedComponents = function () {
                this.componentIndex = 0;
                this.setItemIndices();
                var componentId = [].Initialize(-1, this.nodes.length);

                for (var v = 0; v < this.nodes.length; v++) {
                    if (componentId[v] === -1) {
                        this._collectConnectedNodes(componentId, v);
                        this.componentIndex++;
                    }
                }

                var components = [], i;
                for (i = 0; i < this.componentIndex; ++i) {
                    components[i] = new Graph();
                }
                for (i = 0; i < componentId.length; ++i) {
                    var graph = components[componentId[i]];
                    graph.addNodeAndOutgoings(this.nodes[i]);
                }

                components.sort(function (a, b) {
                    return b.nodes.length - a.nodes.length;
                });
                return components;
            };

            Graph.prototype._collectConnectedNodes = function (setIds, nodeIndex) {
                setIds[nodeIndex] = this.componentIndex;
                var node = this.nodes[nodeIndex];
                node.links.ForEach(function (link) {
                    var next = link.getComplement(node);
                    var nextId = next.index;
                    if (setIds[nextId] === -1) {
                        this._collectConnectedNodes(setIds, nextId);
                    }
                }, this);
            };

            Graph.prototype.calcBounds = function () {
                if (this.IsEmpty) {
                    this.bounds = new TypeViz.Rect();
                    return this.bounds;
                }
                var b = null;
                for (var i = 0, len = this.nodes.length; i < len; i++) {
                    var node = this.nodes[i];
                    if (!b) {
                        b = node.Bounds;
                    } else {
                        b = b.Union(node.Bounds);
                    }
                }
                this.bounds = b;
                return this.bounds;
            };

            Graph.prototype.getSpanningTree = function (root) {
                var tree = new Graph();
                var map = new TypeViz.Map(), source, target;
                tree.root = root.clone();
                tree.root.level = 0;
                tree.root.id = root.id;
                map.Add(root, tree.root);
                root.level = 0;

                var visited = [];
                var remaining = [];
                tree.nodes.Add(tree.root);
                visited.Add(root);
                remaining.Add(root);

                var levelCount = 1;
                while (remaining.length > 0) {
                    var next = remaining.pop();
                    for (var ni = 0; ni < next.links.length; ni++) {
                        var link = next.links[ni];
                        var cn = link.getComplement(next);
                        if (visited.Contains(cn)) {
                            continue;
                        }

                        cn.level = next.level + 1;
                        if (levelCount < cn.level + 1) {
                            levelCount = cn.level + 1;
                        }
                        if (!remaining.Contains(cn)) {
                            remaining.Add(cn);
                        }
                        if (!visited.Contains(cn)) {
                            visited.Add(cn);
                        }
                        if (map.ContainsKey(next)) {
                            source = map.Get(next);
                        } else {
                            source = next.clone();
                            source.level = next.level;
                            source.id = next.id;
                            map.Add(next, source);
                        }
                        if (map.ContainsKey(cn)) {
                            target = map.Get(cn);
                        } else {
                            target = cn.clone();
                            target.level = cn.level;
                            target.id = cn.id;
                            map.Add(cn, target);
                        }
                        var newLink = new TypeViz.Diagramming.Link(source, target);
                        tree.addLink(newLink);
                    }
                }

                var treeLevels = [];
                for (var i = 0; i < levelCount; i++) {
                    treeLevels.Add([]);
                }

                tree.nodes.ForEach(function (node) {
                    treeLevels[node.level].Add(node);
                });

                tree.treeLevels = treeLevels;
                tree.cacheRelationships();
                return tree;
            };

            Graph.prototype.takeRandomNode = function (excludedNodes, incidenceLessThan) {
                if (TypeViz.IsUndefined(excludedNodes)) {
                    excludedNodes = [];
                }
                if (TypeViz.IsUndefined(incidenceLessThan)) {
                    incidenceLessThan = 4;
                }
                if (this.nodes.length === 0) {
                    return null;
                }
                if (this.nodes.length === 1) {
                    return excludedNodes.Contains(this.nodes[0]) ? null : this.nodes[0];
                }
                var pool = this.nodes.Where(function (node) {
                    return !excludedNodes.Contains(node) && node.degree() <= incidenceLessThan;
                });
                if (pool.IsEmpty()) {
                    return null;
                }
                return pool[TypeViz.Maths.RandomInteger(0, pool.length)];
            };

            Object.defineProperty(Graph.prototype, "IsEmpty", {
                get: function () {
                    return this.nodes.IsEmpty();
                },
                enumerable: true,
                configurable: true
            });

            Graph.prototype.isHealthy = function () {
                return this.links.All(function (link) {
                    return this.nodes.Contains(link.source) && this.nodes.Contains(link.target);
                }, this);
            };

            Graph.prototype.getParents = function (n) {
                if (!this.hasNode(n)) {
                    throw "The given node is not part of this graph.";
                }
                return n.getParents();
            };

            Graph.prototype.getChildren = function (n) {
                if (!this.hasNode(n)) {
                    throw "The given node is not part of this graph.";
                }
                return n.getChildren();
            };

            Graph.prototype.addLink = function (sourceOrLink, target, owner) {
                if (TypeViz.IsUndefined(sourceOrLink)) {
                    throw "The source of the link is not defined.";
                }
                if (TypeViz.IsUndefined(target)) {
                    if (TypeViz.IsDefined(sourceOrLink.type) && sourceOrLink.type === "Link") {
                        this.addExistingLink(sourceOrLink);
                        return;
                    } else {
                        throw "The target of the link is not defined.";
                    }
                }

                var foundSource = this.getNode(sourceOrLink);
                if (TypeViz.IsUndefined(foundSource)) {
                    foundSource = this.addNode(sourceOrLink);
                }
                var foundTarget = this.getNode(target);
                if (TypeViz.IsUndefined(foundTarget)) {
                    foundTarget = this.addNode(target);
                }

                var newLink = new Link(foundSource, foundTarget);

                if (TypeViz.IsDefined(owner)) {
                    newLink.owner = owner;
                }

                this.links.push(newLink);

                return newLink;
            };

            Graph.prototype.removeAllLinks = function () {
                while (this.links.length > 0) {
                    var link = this.links[0];
                    this.removeLink(link);
                }
            };

            Graph.prototype.addExistingLink = function (link) {
                if (this.hasLink(link)) {
                    return;
                }
                this.links.push(link);
                if (this.hasNode(link.source.id)) {
                    var s = this.getNode(link.source.id);
                    link.changeSource(s);
                } else {
                    this.addNode(link.source);
                }

                if (this.hasNode(link.target.id)) {
                    var t = this.getNode(link.target.id);
                    link.changeTarget(t);
                } else {
                    this.addNode(link.target);
                }
            };

            Graph.prototype.hasLink = function (linkOrId) {
                if (TypeViz.IsString(linkOrId)) {
                    return this.links.Any(function (link) {
                        return link.id === linkOrId;
                    });
                }
                if (linkOrId.type === "Link") {
                    return this.links.Contains(linkOrId);
                }
                throw "The given object is neither an identifier nor a Link.";
            };

            Graph.prototype.getNode = function (nodeOrId) {
                if (TypeViz.IsUndefined(nodeOrId)) {
                    throw "No identifier or Node specified.";
                }
                if (TypeViz.IsString(nodeOrId)) {
                    var ar = this.nodes.Find(function (n) {
                        return n.id == nodeOrId;
                    });
                    if (ar.length == 0)
                        return null;
                    return ar[0];
                } else {
                    if (this.hasNode(nodeOrId)) {
                        return nodeOrId;
                    } else {
                        return null;
                    }
                }
            };

            Graph.prototype.hasNode = function (nodeOrId) {
                if (TypeViz.IsString(nodeOrId)) {
                    return this.nodes.Any(function (n) {
                        return n.id === nodeOrId;
                    });
                }
                if (TypeViz.IsObject(nodeOrId)) {
                    return this.nodes.Any(function (n) {
                        return n === nodeOrId;
                    });
                }
                throw "The identifier should be a Node or the Id (string) of a node.";
            };

            Graph.prototype.removeNode = function (nodeOrId) {
                var n = nodeOrId;
                if (TypeViz.IsString(nodeOrId)) {
                    n = this.getNode(nodeOrId);
                }

                if (TypeViz.IsDefined(n)) {
                    var links = n.links;
                    n.links = [];
                    for (var i = 0, len = links.length; i < len; i++) {
                        var link = links[i];
                        this.removeLink(link);
                    }
                    this.nodes.Remove(n);
                } else {
                    throw "The identifier should be a Node or the Id (string) of a node.";
                }
            };

            Graph.prototype.areConnected = function (n1, n2) {
                return this.links.Any(function (link) {
                    return link.source == n1 && link.target == n2 || link.source == n2 && link.target == n1;
                });
            };

            Graph.prototype.removeLink = function (link) {
                this.links.Remove(link);

                link.source.outgoing.Remove(link);
                link.source.links.Remove(link);
                link.target.incoming.Remove(link);
                link.target.links.Remove(link);
            };

            Graph.prototype.addNode = function (nodeOrId, layoutRect, owner) {
                var newNode = null;

                if (!TypeViz.IsDefined(nodeOrId)) {
                    throw "No Node or identifier for a new Node is given.";
                }

                if (TypeViz.IsString(nodeOrId)) {
                    if (this.hasNode(nodeOrId)) {
                        return this.getNode(nodeOrId);
                    }
                    newNode = new Node(nodeOrId);
                } else {
                    if (this.hasNode(nodeOrId)) {
                        return this.getNode(nodeOrId);
                    }

                    newNode = nodeOrId;
                }

                if (TypeViz.IsDefined(layoutRect)) {
                    newNode.bounds(layoutRect);
                }

                if (TypeViz.IsDefined(owner)) {
                    newNode.owner = owner;
                }
                this.nodes.Add(newNode);
                return newNode;
            };

            Graph.prototype.addNodeAndOutgoings = function (node) {
                if (!this.nodes.Contains(node)) {
                    this.nodes.push(node);
                }

                var newLinks = node.outgoing;
                node.outgoing = [];
                newLinks.ForEach(function (link) {
                    this.addExistingLink(link);
                }, this);
            };

            Graph.prototype.setItemIndices = function () {
                var i;
                for (i = 0; i < this.nodes.length; ++i) {
                    this.nodes[i].index = i;
                }

                for (i = 0; i < this.links.length; ++i) {
                    this.links[i].index = i;
                }
            };

            Graph.prototype.clone = function (saveMapping) {
                var copy = new Graph();
                var save = TypeViz.IsDefined(saveMapping) && saveMapping === true;
                if (save) {
                    copy.nodeMap = new TypeViz.Map();
                    copy.linkMap = new TypeViz.Map();
                }

                var map = new TypeViz.Map();
                this.nodes.ForEach(function (nOriginal) {
                    var nCopy = nOriginal.clone();
                    map.Set(nOriginal, nCopy);
                    copy.nodes.push(nCopy);

                    if (save) {
                        copy.nodeMap.Set(nCopy, nOriginal);
                    }
                });

                this.links.ForEach(function (linkOriginal) {
                    if (map.ContainsKey(linkOriginal.source) && map.ContainsKey(linkOriginal.target)) {
                        var linkCopy = copy.addLink(map.Get(linkOriginal.source), map.Get(linkOriginal.target));
                        if (save) {
                            copy.linkMap.Set(linkCopy, linkOriginal);
                        }
                    }
                });

                return copy;
            };

            Graph.prototype.linearize = function (addIds) {
                return Graph.Utils.linearize(this, addIds);
            };

            Graph.prototype.depthFirstTraversal = function (startNode, action) {
                if (TypeViz.IsUndefined(startNode)) {
                    throw "You need to supply a starting node.";
                }
                if (TypeViz.IsUndefined(action)) {
                    throw "You need to supply an action.";
                }
                if (!this.hasNode(startNode)) {
                    throw "The given start-node is not part of this graph";
                }
                var foundNode = this.getNode(startNode);
                var visited = [];
                this._dftIterator(foundNode, action, visited, null);
            };

            Graph.prototype._dftIterator = function (node, action, visited, parent) {
                action(node, parent);
                visited.Add(node);
                var children = node.getChildren();
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (visited.Contains(child)) {
                        continue;
                    }
                    this._dftIterator(child, action, visited, node);
                }
            };

            Graph.prototype.breadthFirstTraversal = function (startNode, action) {
                if (TypeViz.IsUndefined(startNode)) {
                    throw "You need to supply a starting node.";
                }
                if (TypeViz.IsUndefined(action)) {
                    throw "You need to supply an action.";
                }

                if (!this.hasNode(startNode)) {
                    throw "The given start-node is not part of this graph";
                }
                var foundNode = this.getNode(startNode);
                var queue = new TypeViz.Queue();
                var visited = [];
                queue.enqueue(foundNode);

                while (queue.length > 0) {
                    var node = queue.dequeue();
                    action(node);
                    visited.Add(node);
                    var children = node.getChildren();
                    for (var i = 0, len = children.length; i < len; i++) {
                        var child = children[i];
                        if (visited.Contains(child) || queue.Contains(child)) {
                            continue;
                        }
                        queue.enqueue(child);
                    }
                }
            };

            Graph.prototype._stronglyConnectedComponents = function (excludeSingleItems, node, indices, lowLinks, connected, stack, index) {
                indices.Add(node, index);
                lowLinks.Add(node, index);
                index++;

                stack.push(node);

                var children = node.getChildren(), next;
                for (var i = 0, len = children.length; i < len; i++) {
                    next = children[i];
                    if (!indices.ContainsKey(next)) {
                        this._stronglyConnectedComponents(excludeSingleItems, next, indices, lowLinks, connected, stack, index);
                        lowLinks.Add(node, Math.min(lowLinks.Get(node), lowLinks.Get(next)));
                    } else if (stack.Contains(next)) {
                        lowLinks.Add(node, Math.min(lowLinks.Get(node), indices.Get(next)));
                    }
                }

                if (lowLinks.Get(node) === indices.Get(node)) {
                    var component = [];
                    do {
                        next = stack.pop();
                        component.Add(next);
                    } while(next !== node);
                    if (!excludeSingleItems || (component.length > 1)) {
                        connected.Add(component);
                    }
                }
            };

            Graph.prototype.findCycles = function (excludeSingleItems) {
                if (TypeViz.IsUndefined(excludeSingleItems)) {
                    excludeSingleItems = true;
                }
                var indices = new TypeViz.Map();
                var lowLinks = new TypeViz.Map();
                var connected = [];
                var stack = [];
                for (var i = 0, len = this.nodes.length; i < len; i++) {
                    var node = this.nodes[i];
                    if (indices.ContainsKey(node)) {
                        continue;
                    }
                    this._stronglyConnectedComponents(excludeSingleItems, node, indices, lowLinks, connected, stack, 0);
                }
                return connected;
            };

            Graph.prototype.isAcyclic = function () {
                return this.findCycles().IsEmpty();
            };

            Graph.prototype.isSubGraph = function (other) {
                var otherArray = other.linearize();
                var thisArray = this.linearize();
                return otherArray.All(function (s) {
                    return thisArray.Contains(s);
                });
            };

            Graph.prototype.makeAcyclic = function () {
                if (this.IsEmpty || this.nodes.length <= 1 || this.links.length <= 1) {
                    return [];
                }

                if (this.nodes.length == 2) {
                    var result = [];
                    if (this.links.length > 1) {
                        var oneLink = this.links[0];
                        var oneNode = oneLink.source;
                        for (var i = 0, len = this.links.length; i < len; i++) {
                            var link = this.links[i];
                            if (link.source == oneNode) {
                                continue;
                            }
                            var rev = link.reverse();
                            result.Add(rev);
                        }
                    }
                    return result;
                }

                var copy = this.clone(true);
                var N = this.nodes.length;

                var intensityCatalog = new TypeViz.Map();

                var flowIntensity = function (node) {
                    if (node.outgoing.length === 0) {
                        return (2 - N);
                    } else if (node.incoming.length === 0) {
                        return (N - 2);
                    } else {
                        return node.outgoing.length - node.incoming.length;
                    }
                };

                var catalogEqualIntensity = function (node, intensityCatalog) {
                    var intensity = flowIntensity(node);
                    if (!intensityCatalog.ContainsKey(intensity)) {
                        intensityCatalog.Set(intensity, []);
                    }
                    intensityCatalog.Get(intensity).push(node);
                };

                copy.nodes.ForEach(function (v) {
                    catalogEqualIntensity(v, intensityCatalog);
                });

                var sourceStack = [];
                var targetStack = [];

                while (copy.nodes.length > 0) {
                    var source, target, intensity;
                    if (intensityCatalog.ContainsKey(2 - N)) {
                        var targets = intensityCatalog.Get(2 - N);
                        while (targets.length > 0) {
                            target = targets.pop();
                            for (var li = 0; li < target.links.length; li++) {
                                var targetLink = target.links[li];
                                source = targetLink.getComplement(target);
                                intensity = flowIntensity(source);
                                intensityCatalog.Get(intensity).Remove(source);
                                source.removeLink(targetLink);
                                catalogEqualIntensity(source, intensityCatalog);
                            }
                            copy.nodes.Remove(target);
                            targetStack.unshift(target);
                        }
                    }

                    if (intensityCatalog.ContainsKey(N - 2)) {
                        var sources = intensityCatalog.Get(N - 2);
                        while (sources.length > 0) {
                            source = sources.pop();
                            for (var si = 0; si < source.links.length; si++) {
                                var sourceLink = source.links[si];
                                target = sourceLink.getComplement(source);
                                intensity = flowIntensity(target);
                                intensityCatalog.Get(intensity).Remove(target);
                                target.removeLink(sourceLink);
                                catalogEqualIntensity(target, intensityCatalog);
                            }
                            sourceStack.push(source);
                            copy.nodes.Remove(source);
                        }
                    }

                    if (copy.nodes.length > 0) {
                        for (var k = N - 3; k > 2 - N; k--) {
                            if (intensityCatalog.ContainsKey(k) && intensityCatalog.Get(k).length > 0) {
                                var maxdiff = intensityCatalog.Get(k);
                                var v = maxdiff.pop();
                                for (var ri = 0; ri < v.links.length; ri++) {
                                    var ril = v.links[ri];
                                    var u = ril.getComplement(v);
                                    intensity = flowIntensity(u);
                                    intensityCatalog.Get(intensity).Remove(u);
                                    u.removeLink(ril);
                                    catalogEqualIntensity(u, intensityCatalog);
                                }
                                sourceStack.push(v);
                                copy.nodes.Remove(v);
                                break;
                            }
                        }
                    }
                }

                sourceStack = sourceStack.concat(targetStack);

                var vertexOrder = new TypeViz.Map();
                for (var kk = 0; kk < this.nodes.length; kk++) {
                    vertexOrder.Set(copy.nodeMap.Get(sourceStack[kk]), kk);
                }

                var reversedEdges = [];
                this.links.ForEach(function (link) {
                    if (vertexOrder.Get(link.source) > vertexOrder.Get(link.target)) {
                        link.reverse();
                        reversedEdges.push(link);
                    }
                });
                return reversedEdges;
            };
            Graph.Utils = {
                parse: function (graphString) {
                    var previousLink, graph = new Graph(), parts = graphString;
                    for (var i = 0, len = parts.length; i < len; i++) {
                        var part = parts[i];
                        if (TypeViz.IsString(part)) {
                            if (part.indexOf("->") < 0) {
                                throw "The link should be specified as 'a->b'.";
                            }
                            var p = part.split("->");
                            if (p.length != 2) {
                                throw "The link should be specified as 'a->b'.";
                            }
                            previousLink = new Link(p[0], p[1]);
                            graph.addLink(previousLink);
                        }
                        if (TypeViz.IsObject(part)) {
                            if (!previousLink) {
                                throw "Specification found before Link definition.";
                            }
                            TypeViz.deepExtend(previousLink, part);
                        }
                    }
                    return graph;
                },
                linearize: function (graph, addIds) {
                    if (TypeViz.IsUndefined(graph)) {
                        throw "Expected an instance of a Graph object in slot one.";
                    }
                    if (TypeViz.IsUndefined(addIds)) {
                        addIds = false;
                    }
                    var lin = [];
                    for (var i = 0, len = graph.links.length; i < len; i++) {
                        var link = graph.links[i];
                        lin.Add(link.source.id + "->" + link.target.id);
                        if (addIds) {
                            lin.Add({ id: link.id });
                        }
                    }
                    return lin;
                },
                _addShape: function (diagram, p, id, shapeOptions) {
                    if (TypeViz.IsUndefined(p)) {
                        p = new TypeViz.Point(0, 0);
                    }
                    if (TypeViz.IsUndefined(id)) {
                        id = TypeViz.RandomId();
                    }
                    shapeOptions = TypeViz.deepExtend({
                        Width: 20,
                        Height: 20,
                        Id: id,
                        Radius: 10,
                        CornerRadius: 3,
                        Opacity: 0.5,
                        Background: "#0000FF",
                        Stroke: "Transparent",
                        StrokeThickness: 0,
                        Geometry: "rectangle",
                        undoable: false
                    }, shapeOptions);

                    return diagram.AddShape(p, shapeOptions);
                },
                _addConnection: function (diagram, from, to, options) {
                    var connection = new TypeViz.Diagramming.Connection(from, to, options);
                    connection.Stroke = "WhiteSmoke";
                    connection.Opacity = 0.853;
                    return diagram.AddConnection(connection);
                },
                createDiagramFromGraph: function (diagram, graph, doLayout, randomSize) {
                    if (TypeViz.IsUndefined(diagram)) {
                        throw "The diagram surface is undefined.";
                    }
                    if (TypeViz.IsUndefined(graph)) {
                        throw "No graph specification defined.";
                    }
                    if (TypeViz.IsUndefined(doLayout)) {
                        doLayout = true;
                    }
                    if (TypeViz.IsUndefined(randomSize)) {
                        randomSize = false;
                    }

                    var width = diagram.Element.clientWidth || 200;
                    var height = diagram.Element.clientHeight || 200;
                    var map = [], node, shape;
                    for (var i = 0, len = graph.nodes.length; i < len; i++) {
                        node = graph.nodes[i];
                        var p = node.position;
                        if (TypeViz.IsUndefined(p)) {
                            if (TypeViz.IsDefined(node.X) && TypeViz.IsDefined(node.Y)) {
                                p = new TypeViz.Point(node.X, node.Y);
                            } else {
                                p = new TypeViz.Point(TypeViz.Maths.RandomInteger(10, width - 20), TypeViz.Maths.RandomInteger(10, height - 20));
                            }
                        }
                        var opt = {};

                        if (node.id === "0") {
                        } else if (randomSize) {
                            TypeViz.deepExtend(opt, {
                                width: Math.random() * 150 + 20,
                                height: Math.random() * 80 + 50,
                                data: 'rectangle',
                                background: "#778899"
                            });
                        }

                        shape = this._addShape(diagram, p, node.id, opt);

                        var bounds = shape.Rectangle;
                        if (TypeViz.IsDefined(bounds)) {
                            node.X = bounds.X;
                            node.Y = bounds.Y;
                            node.Width = bounds.Width;
                            node.Height = bounds.Height;
                        }
                        map[node.id] = shape;
                    }
                    for (var gli = 0; gli < graph.links.length; gli++) {
                        var link = graph.links[gli];
                        var sourceShape = map[link.source.id];
                        if (TypeViz.IsUndefined(sourceShape)) {
                            continue;
                        }
                        var targetShape = map[link.target.id];
                        if (TypeViz.IsUndefined(targetShape)) {
                            continue;
                        }
                        this._addConnection(diagram, sourceShape.Connectors[2], targetShape.Connectors[0], { id: link.id });
                    }
                    if (doLayout) {
                        var l = new TypeViz.Diagramming.SpringLayout(diagram);
                        var settings = new TypeViz.Diagramming.LayoutSettings();
                        settings.LimitToView = false;
                        l.layoutGraph(graph, settings);
                        for (var shi = 0; shi < graph.nodes.length; shi++) {
                            node = graph.nodes[shi];
                            shape = map[node.id];
                            shape.Rectangle = new TypeViz.Rect(node.X, node.Y, node.Width, node.Height);
                        }
                    }
                },
                createBalancedTree: function (levels, siblingsCount) {
                    if (TypeViz.IsUndefined(levels)) {
                        levels = 3;
                    }
                    if (TypeViz.IsUndefined(siblingsCount)) {
                        siblingsCount = 3;
                    }

                    var g = new Graph(), counter = -1, lastAdded = [], news;
                    if (levels <= 0 || siblingsCount <= 0) {
                        return g;
                    }
                    var root = new Node((++counter).toString());
                    g.addNode(root);
                    g.root = root;
                    lastAdded.Add(root);
                    for (var i = 0; i < levels; i++) {
                        news = [];
                        for (var j = 0; j < lastAdded.length; j++) {
                            var parent = lastAdded[j];
                            for (var k = 0; k < siblingsCount; k++) {
                                var item = new Node((++counter).toString());
                                g.addLink(parent, item);
                                news.Add(item);
                            }
                        }
                        lastAdded = news;
                    }
                    return g;
                },
                createBalancedForest: function (levels, siblingsCount, treeCount) {
                    if (TypeViz.IsUndefined(levels)) {
                        levels = 3;
                    }
                    if (TypeViz.IsUndefined(siblingsCount)) {
                        siblingsCount = 3;
                    }
                    if (TypeViz.IsUndefined(treeCount)) {
                        treeCount = 5;
                    }
                    var g = new TypeViz.Diagramming.Graph(), counter = -1, lastAdded = [], news;
                    if (levels <= 0 || siblingsCount <= 0 || treeCount <= 0) {
                        return g;
                    }

                    for (var t = 0; t < treeCount; t++) {
                        var root = new TypeViz.Diagramming.Node((++counter).toString());
                        g.addNode(root);
                        lastAdded = [root];
                        for (var i = 0; i < levels; i++) {
                            news = [];
                            for (var j = 0; j < lastAdded.length; j++) {
                                var parent = lastAdded[j];
                                for (var k = 0; k < siblingsCount; k++) {
                                    var item = new TypeViz.Diagramming.Node((++counter).toString());
                                    g.addLink(parent, item);
                                    news.Add(item);
                                }
                            }
                            lastAdded = news;
                        }
                    }
                    return g;
                },
                createRandomConnectedGraph: function (nodeCount, maxIncidence, isTree) {
                    if (TypeViz.IsUndefined(nodeCount)) {
                        nodeCount = 40;
                    }
                    if (TypeViz.IsUndefined(maxIncidence)) {
                        maxIncidence = 4;
                    }
                    if (TypeViz.IsUndefined(isTree)) {
                        isTree = false;
                    }

                    var g = new Graph(), counter = -1;
                    if (nodeCount <= 0) {
                        return g;
                    }

                    var root = new Node((++counter).toString());
                    g.addNode(root);
                    if (nodeCount === 1) {
                        return g;
                    }
                    if (nodeCount > 1) {
                        for (var i = 1; i < nodeCount; i++) {
                            var poolNode = g.takeRandomNode([], maxIncidence);
                            if (!poolNode) {
                                break;
                            }
                            var newNode = g.addNode(i.toString());
                            g.addLink(poolNode, newNode);
                        }
                        if (!isTree && nodeCount > 1) {
                            var randomAdditions = TypeViz.Maths.RandomInteger(1, nodeCount);
                            for (var ri = 0; ri < randomAdditions; ri++) {
                                var n1 = g.takeRandomNode([], maxIncidence);
                                var n2 = g.takeRandomNode([], maxIncidence);
                                if (n1 && n2 && !g.areConnected(n1, n2)) {
                                    g.addLink(n1, n2);
                                }
                            }
                        }
                        return g;
                    }
                }
            };

            Graph.Predefined = {
                EightGraph: function () {
                    return Graph.Utils.parse(["1->2", "2->3", "3->4", "4->1", "3->5", "5->6", "6->7", "7->3"]);
                },
                Mindmap: function () {
                    return Graph.Utils.parse([
                        "0->1", "0->2", "0->3", "0->4", "0->5", "1->6", "1->7", "7->8", "2->9", "9->10", "9->11", "3->12",
                        "12->13", "13->14", "4->15", "4->16", "15->17", "15->18", "18->19", "18->20", "14->21", "14->22", "5->23", "23->24", "23->25", "6->26"]);
                },
                ThreeGraph: function () {
                    return Graph.Utils.parse(["1->2", "2->3", "3->1"]);
                },
                BinaryTree: function (levels) {
                    if (TypeViz.IsUndefined(levels)) {
                        levels = 5;
                    }
                    return Graph.Utils.createBalancedTree(levels, 2);
                },
                Linear: function (length) {
                    if (TypeViz.IsUndefined(length)) {
                        length = 10;
                    }
                    return Graph.Utils.createBalancedTree(length, 1);
                },
                Tree: function (levels, siblingsCount) {
                    return Graph.Utils.createBalancedTree(levels, siblingsCount);
                },
                Forest: function (levels, siblingsCount, trees) {
                    return Graph.Utils.createBalancedForest(levels, siblingsCount, trees);
                },
                Workflow: function () {
                    return Graph.Utils.parse(["0->1", "1->2", "2->3", "1->4", "4->3", "3->5", "5->6", "6->3", "6->7", "5->4"]);
                },
                Grid: function (n, m) {
                    var g = new Graph();
                    if (n <= 0 && m <= 0) {
                        return g;
                    }

                    for (var i = 0; i < n + 1; i++) {
                        var previous = null;
                        for (var j = 0; j < m + 1; j++) {
                            var node = new Node(i.toString() + "." + j.toString());
                            g.addNode(node);
                            if (previous) {
                                g.addLink(previous, node);
                            }
                            if (i > 0) {
                                var left = g.getNode((i - 1).toString() + "." + j.toString());
                                g.addLink(left, node);
                            }
                            previous = node;
                        }
                    }
                    return g;
                }
            };
            return Graph;
        })();
        Diagramming.Graph = Graph;
    })(TypeViz.Diagramming || (TypeViz.Diagramming = {}));
    var Diagramming = TypeViz.Diagramming;
})(TypeViz || (TypeViz = {}));
var TypeViz;
(function (TypeViz) {
    (function (Diagramming) {
        var HyperTree = TypeViz.Diagramming.Graph;
        var Map = TypeViz.Map;

        (function (ChildrenLayout) {
            ChildrenLayout[ChildrenLayout["TopAlignedWithParent"] = 0] = "TopAlignedWithParent";

            ChildrenLayout[ChildrenLayout["BottomAlignedWithParent"] = 1] = "BottomAlignedWithParent";

            ChildrenLayout[ChildrenLayout["Underneath"] = 2] = "Underneath";

            ChildrenLayout[ChildrenLayout["Default"] = 3] = "Default";
        })(Diagramming.ChildrenLayout || (Diagramming.ChildrenLayout = {}));
        var ChildrenLayout = Diagramming.ChildrenLayout;
        ;

        (function (LayoutTypes) {
            LayoutTypes[LayoutTypes["TreeLayout"] = 0] = "TreeLayout";

            LayoutTypes[LayoutTypes["LayeredLayout"] = 1] = "LayeredLayout";

            LayoutTypes[LayoutTypes["ForceDirectedLayout"] = 2] = "ForceDirectedLayout";

            LayoutTypes[LayoutTypes["None"] = 3] = "None";
        })(Diagramming.LayoutTypes || (Diagramming.LayoutTypes = {}));
        var LayoutTypes = Diagramming.LayoutTypes;
        ;

        (function (TreeDirection) {
            TreeDirection[TreeDirection["Left"] = 0] = "Left";

            TreeDirection[TreeDirection["Right"] = 1] = "Right";

            TreeDirection[TreeDirection["Up"] = 2] = "Up";

            TreeDirection[TreeDirection["Down"] = 3] = "Down";

            TreeDirection[TreeDirection["None"] = 4] = "None";

            TreeDirection[TreeDirection["Radial"] = 5] = "Radial";

            TreeDirection[TreeDirection["Undefined"] = 6] = "Undefined";
        })(Diagramming.TreeDirection || (Diagramming.TreeDirection = {}));
        var TreeDirection = Diagramming.TreeDirection;
        ;

        (function (TreeLayoutType) {
            TreeLayoutType[TreeLayoutType["MindmapHorizontal"] = 0] = "MindmapHorizontal";

            TreeLayoutType[TreeLayoutType["MindmapVertical"] = 1] = "MindmapVertical";

            TreeLayoutType[TreeLayoutType["TreeRight"] = 2] = "TreeRight";

            TreeLayoutType[TreeLayoutType["TreeLeft"] = 3] = "TreeLeft";

            TreeLayoutType[TreeLayoutType["TreeUp"] = 4] = "TreeUp";

            TreeLayoutType[TreeLayoutType["TreeDown"] = 5] = "TreeDown";

            TreeLayoutType[TreeLayoutType["TipOverTree"] = 6] = "TipOverTree";

            TreeLayoutType[TreeLayoutType["RadialTree"] = 7] = "RadialTree";

            TreeLayoutType[TreeLayoutType["Undefined"] = 8] = "Undefined";
        })(Diagramming.TreeLayoutType || (Diagramming.TreeLayoutType = {}));
        var TreeLayoutType = Diagramming.TreeLayoutType;
        ;

        (function (LayeredLayoutType) {
            LayeredLayoutType[LayeredLayoutType["Up"] = 0] = "Up";
            LayeredLayoutType[LayeredLayoutType["Down"] = 1] = "Down";
            LayeredLayoutType[LayeredLayoutType["Left"] = 2] = "Left";
            LayeredLayoutType[LayeredLayoutType["Right"] = 3] = "Right";
        })(Diagramming.LayeredLayoutType || (Diagramming.LayeredLayoutType = {}));
        var LayeredLayoutType = Diagramming.LayeredLayoutType;
        ;

        var LayoutSettings = (function () {
            function LayoutSettings() {
                this.Type = 0 /* TreeLayout */;
                this.SubType = 5 /* TreeDown */;
                this.Roots = null;
                this.Animate = false;
                this.LimitToView = false;
                this.Friction = 0.9;
                this.NodeDistance = 50;
                this.Iterations = 300;
                this.HorizontalSeparation = 90;
                this.VerticalSeparation = 50;
                this.UnderneathVerticalTopOffset = 15;
                this.UnderneathHorizontalOffset = 15;
                this.UnderneathVerticalSeparation = 15;
                this.TipOverTreeStartLevel = 0;
                this.ComponentsGridWidth = 1500;
                this.TotalMargin = new TypeViz.Size(50, 50);
                this.ComponentMargin = new TypeViz.Size(20, 20);
                this.LayerSeparation = 50;
                this.LayeredIterations = 2;
                this.StartRadialAngle = 0;
                this.EndRadialAngle = 2 * Math.PI;
                this.RadialSeparation = 150;
                this.RadialFirstLevelSeparation = 200;
                this.KeepComponentsInOneRadialLayout = false;
                this.ignoreContainers = true;
                this.layoutContainerChildren = false;
                this.ignoreInvisible = true;
                this.animateTransitions = false;
            }
            return LayoutSettings;
        })();
        Diagramming.LayoutSettings = LayoutSettings;

        var LayoutBase = (function () {
            function LayoutBase() {
            }
            LayoutBase.prototype.gridLayoutComponents = function (components) {
                if (!components) {
                    throw "No components supplied.";
                }

                components.ForEach(function (c) {
                    c.calcBounds();
                });

                components.sort(function (a, b) {
                    return b.bounds.Width - a.bounds.Width;
                });

                var maxWidth = this.options.ComponentsGridWidth, offsetX = this.options.ComponentMargin.Width, offsetY = this.options.ComponentMargin.Height, height = 0, startX = this.options.TotalMargin.Width, startY = this.options.TotalMargin.Height, x = startX, y = startY, i, resultLinkSet = [], resultNodeSet = [];

                while (components.length > 0) {
                    if (x >= maxWidth) {
                        x = startX;
                        y += height + offsetY;

                        height = 0;
                    }
                    var component = components.pop();
                    this.moveToOffset(component, new TypeViz.Point(x, y));
                    for (i = 0; i < component.nodes.length; i++) {
                        resultNodeSet.push(component.nodes[i]);
                    }
                    for (i = 0; i < component.links.length; i++) {
                        resultLinkSet.push(component.links[i]);
                    }
                    var boundingRect = component.bounds;
                    var currentHeight = boundingRect.Height;
                    if (currentHeight <= 0 || isNaN(currentHeight)) {
                        currentHeight = 0;
                    }
                    var currentWidth = boundingRect.Width;
                    if (currentWidth <= 0 || isNaN(currentWidth)) {
                        currentWidth = 0;
                    }

                    if (currentHeight >= height) {
                        height = currentHeight;
                    }
                    x += currentWidth + offsetX;
                }

                return {
                    nodes: resultNodeSet,
                    links: resultLinkSet
                };
            };

            LayoutBase.prototype.moveToOffset = function (component, p) {
                var i, j, bounds = component.bounds, deltax = p.X - bounds.X, deltay = p.Y - bounds.Y;

                for (i = 0; i < component.nodes.length; i++) {
                    var node = component.nodes[i];
                    var nodeBounds = node.Bounds;
                    if (nodeBounds.Width === 0 && nodeBounds.Height === 0 && nodeBounds.X === 0 && nodeBounds.Y === 0) {
                        nodeBounds = new TypeViz.Rect(0, 0, 0, 0);
                    }
                    nodeBounds.X += deltax;
                    nodeBounds.Y += deltay;
                    node.Bounds = nodeBounds;
                }

                for (i = 0; i < component.links.length; i++) {
                    var link = component.links[i];
                    if (TypeViz.IsDefined(link.points) && link.points.length > 0) {
                        var newpoints = [];
                        var points = link.points;
                        for (j = 0; j < points.length; j++) {
                            var pt = points[j];
                            pt.x += deltax;
                            pt.y += deltay;
                            newpoints.push(pt);
                        }
                        link.points = newpoints;
                    }
                }

                return new TypeViz.Point(deltax, deltay);
            };
            return LayoutBase;
        })();
        Diagramming.LayoutBase = LayoutBase;

        var NodePositionAdapter = (function (_super) {
            __extends(NodePositionAdapter, _super);
            function NodePositionAdapter(layoutState) {
                _super.call(this);
                this.layoutState = layoutState;
                this.diagram = layoutState.diagram;
            }
            NodePositionAdapter.prototype.initState = function () {
                this.froms = [];
                this.tos = [];
                this.subjects = [];
                function pusher(id, bounds) {
                    var shape = this.diagram.getId(id);
                    if (shape) {
                        this.subjects.push(shape);
                        this.froms.push(shape.Rectangle.TopLeft);
                        this.tos.push(bounds.TopLeft);
                    }
                }

                this.layoutState.nodeMap.forEach(pusher, this);
            };
            NodePositionAdapter.prototype.update = function (tick) {
                if (this.subjects.length <= 0) {
                    return;
                }
                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i].position(new TypeViz.Point(this.froms[i].X + (this.tos[i].X - this.froms[i].X) * tick, this.froms[i].Y + (this.tos[i].Y - this.froms[i].Y) * tick));
                }
            };
            return NodePositionAdapter;
        })(TypeViz.Animation.AdapterBase);
        Diagramming.NodePositionAdapter = NodePositionAdapter;

        var DiagramToHyperTreeAdapter = (function () {
            function DiagramToHyperTreeAdapter(diagram) {
                this.nodeMap = new Map();

                this.shapeMap = new Map();

                this.nodes = [];

                this.edges = [];

                this.edgeMap = new Map();

                this.finalNodes = [];

                this.finalLinks = [];

                this.ignoredConnections = [];

                this.ignoredShapes = [];

                this.hyperMap = new Map();

                this.hyperTree = new TypeViz.Diagramming.Graph();

                this.finalGraph = null;

                this.diagram = diagram;
            }
            DiagramToHyperTreeAdapter.prototype.convert = function (options) {
                if (TypeViz.IsUndefined(this.diagram)) {
                    throw "No diagram to convert.";
                }

                this.options = TypeViz.deepExtend({
                    ignoreInvisible: true,
                    ignoreContainers: true,
                    layoutContainerChildren: false
                }, options || {});

                this.clear();

                this._renormalizeShapes();

                this._renormalizeConnections();

                this.finalGraph = new TypeViz.Diagramming.Graph();
                this.nodes.ForEach(function (n) {
                    this.finalGraph.addNode(n);
                }, this);
                this.edges.ForEach(function (l) {
                    this.finalGraph.addExistingLink(l);
                }, this);
                return this.finalGraph;
            };

            DiagramToHyperTreeAdapter.prototype.mapConnection = function (connection) {
                return this.edgeMap.first(function (edge) {
                    return this.edgeMap.Get(edge).Contains(connection);
                });
            };

            DiagramToHyperTreeAdapter.prototype.mapShape = function (shape) {
                var keys = this.nodeMap.keys();
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    if (this.nodeMap.Get(key).Contains(shape)) {
                        return key;
                    }
                }
            };

            DiagramToHyperTreeAdapter.prototype.getEdge = function (a, b) {
                return a.links.first(function (link) {
                    return link.getComplement(a) === b;
                });
            };

            DiagramToHyperTreeAdapter.prototype.clear = function () {
                this.finalGraph = null;
                this.hyperTree = (!this.options.ignoreContainers && this.options.layoutContainerChildren) ? new HyperTree() : null;
                this.hyperMap = (!this.options.ignoreContainers && this.options.layoutContainerChildren) ? new Map() : null;
                this.nodeMap = new Map();
                this.shapeMap = new Map();
                this.nodes = [];
                this.edges = [];
                this.edgeMap = new Map();
                this.ignoredConnections = [];
                this.ignoredShapes = [];
                this.finalNodes = [];
                this.finalLinks = [];
            };

            DiagramToHyperTreeAdapter.prototype.listToRoot = function (containerGraph) {
                var list = [];
                var s = containerGraph.container;
                if (!s) {
                    return list;
                }
                list.Add(s);
                while (s.parentContainer) {
                    s = s.parentContainer;
                    list.Add(s);
                }
                list.reverse();
                return list;
            };

            DiagramToHyperTreeAdapter.prototype.firstNonIgnorableContainer = function (shape) {
                if (shape.isContainer && !this.isIgnorableItem(shape)) {
                    return shape;
                }
                return !shape.parentContainer ? null : this.firstNonIgnorableContainer(shape.parentContainer);
            };
            DiagramToHyperTreeAdapter.prototype.isContainerConnection = function (a, b) {
                if (a.isContainer && this.isDescendantOf(a, b)) {
                    return true;
                }
                return b.isContainer && this.isDescendantOf(b, a);
            };

            DiagramToHyperTreeAdapter.prototype.isDescendantOf = function (scope, a) {
                if (!scope.isContainer) {
                    throw "Expecting a container.";
                }
                if (scope === a) {
                    return false;
                }
                if (scope.children.Contains(a)) {
                    return true;
                }
                var containers = [];
                for (var i = 0, len = scope.children.length; i < len; i++) {
                    var c = scope.children[i];
                    if (c.isContainer && this.isDescendantOf(c, a)) {
                        containers.push(c);
                    }
                }

                return containers.length > 0;
            };
            DiagramToHyperTreeAdapter.prototype.isIgnorableItem = function (shape) {
                if (this.options.ignoreInvisible) {
                    return !this._isVisible(shape);
                } else {
                    return shape.isCollapsed && !this._isTop(shape);
                }
            };

            DiagramToHyperTreeAdapter.prototype.isShapeMapped = function (shape) {
                return shape.isCollapsed && !this._isVisible(shape) && !this._isTop(shape);
            };

            DiagramToHyperTreeAdapter.prototype.leastCommonAncestor = function (a, b) {
                if (!a) {
                    throw "Parameter should not be null.";
                }
                if (!b) {
                    throw "Parameter should not be null.";
                }

                if (!this.hyperTree) {
                    throw "No hypertree available.";
                }
                var al = this.listToRoot(a);
                var bl = this.listToRoot(b);
                var found = null;
                if (al.IsEmpty() || bl.IsEmpty()) {
                    return this.hyperTree.root.data;
                }
                var xa = al[0];
                var xb = bl[0];
                var i = 0;
                while (xa === xb) {
                    found = al[i];
                    i++;
                    if (i >= al.length || i >= bl.length) {
                        break;
                    }
                    xa = al[i];
                    xb = bl[i];
                }
                if (!found) {
                    return this.hyperTree.root.data;
                } else {
                    return this.hyperTree.nodes.Where(function (n) {
                        return n.data.container === found;
                    });
                }
            };

            DiagramToHyperTreeAdapter.prototype._isTop = function (item) {
                return !item.parentContainer;
            };

            DiagramToHyperTreeAdapter.prototype._isVisible = function (shape) {
                if (!shape.IsVisible) {
                    return false;
                }
                return !shape.parentContainer ? shape.IsVisible : this._isVisible(shape.parentContainer);
            };

            DiagramToHyperTreeAdapter.prototype._isCollapsed = function (shape) {
                if (shape.isContainer && shape.isCollapsed) {
                    return true;
                }
                return shape.parentContainer && this._isCollapsed(shape.parentContainer);
            };

            DiagramToHyperTreeAdapter.prototype._renormalizeShapes = function () {
                if (this.options.ignoreContainers) {
                    for (var i = 0, len = this.diagram.shapes.length; i < len; i++) {
                        var shape = this.diagram.shapes[i];

                        if ((this.options.ignoreInvisible && !this._isVisible(shape)) || shape.isContainer) {
                            this.ignoredShapes.Add(shape);
                            continue;
                        }
                        var node = new TypeViz.Diagramming.Node(shape.Id, shape);
                        node.isVirtual = false;

                        this.nodeMap.Add(node, [shape]);
                        this.nodes.Add(node);
                    }
                } else {
                    throw "Containers are not supported yet, but stay tuned.";
                }
            };

            DiagramToHyperTreeAdapter.prototype._renormalizeConnections = function () {
                if (this.diagram.connections.length === 0) {
                    return;
                }
                for (var i = 0, len = this.diagram.connections.length; i < len; i++) {
                    var conn = this.diagram.connections[i];

                    if (this.isIgnorableItem(conn)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    var source = !conn.fromConnector ? null : conn.fromConnector.parent;
                    var sink = !conn.toConnector ? null : conn.toConnector.parent;

                    if (!source || !sink) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    if (this.ignoredShapes.Contains(source) && !this.shapeMap.ContainsKey(source)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }
                    if (this.ignoredShapes.Contains(sink) && !this.shapeMap.ContainsKey(sink)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    if (this.shapeMap.ContainsKey(source)) {
                        source = this.shapeMap[source];
                    }
                    if (this.shapeMap.ContainsKey(sink)) {
                        sink = this.shapeMap[sink];
                    }

                    var sourceNode = this.mapShape(source);
                    var sinkNode = this.mapShape(sink);
                    if ((sourceNode === sinkNode) || this.areConnectedAlready(sourceNode, sinkNode)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    if (sourceNode === null || sinkNode === null) {
                        throw "A shape was not mapped to a node.";
                    }
                    if (this.options.ignoreContainers) {
                        if (sourceNode.isVirtual || sinkNode.isVirtual) {
                            this.ignoredConnections.Add(conn);
                            continue;
                        }
                        var newEdge = new TypeViz.Diagramming.Link(sourceNode, sinkNode, conn.Id, conn);

                        this.edgeMap.Add(newEdge, [conn]);
                        this.edges.Add(newEdge);
                    } else {
                        throw "Containers are not supported yet, but stay tuned.";
                    }
                }
            };

            DiagramToHyperTreeAdapter.prototype.areConnectedAlready = function (n, m) {
                return this.edges.Any(function (l) {
                    return l.source === n && l.target === m || l.source === m && l.target === n;
                });
            };
            return DiagramToHyperTreeAdapter;
        })();
        Diagramming.DiagramToHyperTreeAdapter = DiagramToHyperTreeAdapter;

        var SpringLayout = (function (_super) {
            __extends(SpringLayout, _super);
            function SpringLayout(diagram) {
                _super.call(this);
                var that = this;

                if (TypeViz.IsUndefined(diagram)) {
                    throw "Diagram is not specified.";
                }
                this.diagram = diagram;
            }
            SpringLayout.prototype.Layout = function (options) {
                this.options = options;
                var adapter = new DiagramToHyperTreeAdapter(this.diagram);
                var graph = adapter.convert(options);
                if (graph.IsEmpty) {
                    return;
                }

                var components = graph.getConnectedComponents();
                if (components.IsEmpty()) {
                    return;
                }
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    this.layoutGraph(component, options);
                }
                var finalNodeSet = this.gridLayoutComponents(components);
                return new LayoutState(this.diagram, finalNodeSet);
            };

            SpringLayout.prototype.layoutGraph = function (graph, options) {
                this.options = options;
                this.graph = graph;

                var initialTemperature = this.options.NodeDistance * 9;
                this.temperature = initialTemperature;

                var guessBounds = this._expectedBounds();
                this.Width = guessBounds.Width;
                this.Height = guessBounds.Height;

                for (var step = 0; step < this.options.Iterations; step++) {
                    this.refineStage = step >= this.options.Iterations * 5 / 6;
                    this.tick();

                    this.temperature = this.refineStage ? initialTemperature / 30 : initialTemperature * (1 - step / (2 * this.options.Iterations));
                }
            };

            SpringLayout.prototype.tick = function () {
                var i;

                for (i = 0; i < this.graph.nodes.length; i++) {
                    this._repulsion(this.graph.nodes[i]);
                }

                for (i = 0; i < this.graph.links.length; i++) {
                    this._attraction(this.graph.links[i]);
                }

                for (i = 0; i < this.graph.nodes.length; i++) {
                    var node = this.graph.nodes[i];
                    var offset = Math.sqrt(node.dx * node.dx + node.dy * node.dy);
                    if (offset === 0) {
                        return;
                    }
                    node.X += Math.min(offset, this.temperature) * node.dx / offset;
                    node.Y += Math.min(offset, this.temperature) * node.dy / offset;
                    if (this.options.LimitToView) {
                        node.X = Math.min(this.Width, Math.max(node.Width / 2, node.X));
                        node.Y = Math.min(this.Height, Math.max(node.Height / 2, node.Y));
                    }
                }
            };

            SpringLayout.prototype._shake = function (node) {
                var rho = Math.random() * this.options.NodeDistance / 4;
                var alpha = Math.random() * 2 * Math.PI;
                node.X += rho * Math.cos(alpha);
                node.Y -= rho * Math.sin(alpha);
            };

            SpringLayout.prototype._InverseSquareForce = function (d, n, m) {
                var force;
                if (!this.refineStage) {
                    force = Math.pow(d, 2) / Math.pow(this.options.NodeDistance, 2);
                } else {
                    var deltax = n.X - m.X;
                    var deltay = n.Y - m.Y;

                    var wn = n.Width / 2;
                    var hn = n.Height / 2;
                    var wm = m.Width / 2;
                    var hm = m.Height / 2;

                    force = (Math.pow(deltax, 2) / Math.pow(wn + wm + this.options.NodeDistance, 2)) + (Math.pow(deltay, 2) / Math.pow(hn + hm + this.options.NodeDistance, 2));
                }
                return force * 4 / 3;
            };

            SpringLayout.prototype._SquareForce = function (d, n, m) {
                return 1 / this._InverseSquareForce(d, n, m);
            };

            SpringLayout.prototype._repulsion = function (n) {
                n.dx = 0;
                n.dy = 0;
                this.graph.nodes.ForEach(function (m) {
                    if (m === n) {
                        return;
                    }
                    while (n.X === m.X && n.Y === m.Y) {
                        this._shake(m);
                    }
                    var vx = n.X - m.X;
                    var vy = n.Y - m.Y;
                    var distance = Math.sqrt(vx * vx + vy * vy);
                    var r = this._SquareForce(distance, n, m) * 2;
                    n.dx += (vx / distance) * r;
                    n.dy += (vy / distance) * r;
                }, this);
            };
            SpringLayout.prototype._attraction = function (link) {
                var t = link.target;
                var s = link.source;
                if (s === t) {
                    return;
                }
                while (s.X === t.X && s.Y === t.Y) {
                    this._shake(t);
                }

                var vx = s.X - t.X;
                var vy = s.Y - t.Y;
                var distance = Math.sqrt(vx * vx + vy * vy);

                var a = this._InverseSquareForce(distance, s, t) * 5;
                var dx = (vx / distance) * a;
                var dy = (vy / distance) * a;
                t.dx += dx;
                t.dy += dy;
                s.dx -= dx;
                s.dy -= dy;
            };

            SpringLayout.prototype._expectedBounds = function () {
                var size, N = this.graph.nodes.length, ratio = 1.5, multiplier = 4;
                if (N === 0) {
                    return size;
                }
                size = this.graph.nodes.Fold(function (s, node) {
                    var area = node.Width * node.Height;
                    if (area > 0) {
                        s += Math.sqrt(area);
                        return s;
                    }
                    return 0;
                }, 0, this);
                var av = size / N;
                var squareSize = av * Math.ceil(Math.sqrt(N));
                var width = squareSize * Math.sqrt(ratio);
                var height = squareSize / Math.sqrt(ratio);
                return { width: width * multiplier, height: height * multiplier };
            };
            return SpringLayout;
        })(LayoutBase);
        Diagramming.SpringLayout = SpringLayout;

        var TreeLayoutProcessor = (function () {
            function TreeLayoutProcessor(options) {
                this.center = null;
                this.options = options;
            }
            TreeLayoutProcessor.prototype.Layout = function (treeGraph, root) {
                this.graph = treeGraph;
                if (!this.graph.nodes || this.graph.nodes.length === 0) {
                    return;
                }

                if (!this.graph.nodes.Contains(root)) {
                    throw "The given root is not in the graph.";
                }

                this.center = root;
                this.graph.cacheRelationships();

                this.layoutSwitch();
            };

            TreeLayoutProcessor.prototype.layoutLeft = function (left) {
                this.setChildrenDirection(this.center, "Left", false);
                this.setChildrenLayout(this.center, "Default", false);
                var h = 0, w = 0, y, i, node;
                for (i = 0; i < left.length; i++) {
                    node = left[i];
                    node.TreeDirection = "Left";
                    var s = this.measure(node, TypeViz.Size.Empty);
                    w = Math.max(w, s.Width);
                    h += s.Height + this.options.VerticalSeparation;
                }

                h -= this.options.VerticalSeparation;
                var x = this.center.X - this.options.HorizontalSeparation;
                y = this.center.Y + ((this.center.Height - h) / 2);
                for (i = 0; i < left.length; i++) {
                    node = left[i];
                    var p = new TypeViz.Point(x - node.Size.Width, y);

                    this.arrange(node, p);
                    y += node.Size.Height + this.options.VerticalSeparation;
                }
            };

            TreeLayoutProcessor.prototype.layoutRight = function (right) {
                this.setChildrenDirection(this.center, "Right", false);
                this.setChildrenLayout(this.center, "Default", false);
                var h = 0, w = 0, y, i, node;
                for (i = 0; i < right.length; i++) {
                    node = right[i];
                    node.TreeDirection = "Right";
                    var s = this.measure(node, TypeViz.Size.Empty);
                    w = Math.max(w, s.Width);
                    h += s.Height + this.options.VerticalSeparation;
                }

                h -= this.options.VerticalSeparation;
                var x = this.center.X + this.options.HorizontalSeparation + this.center.Width;
                y = this.center.Y + ((this.center.Height - h) / 2);
                for (i = 0; i < right.length; i++) {
                    node = right[i];
                    var p = new TypeViz.Point(x, y);
                    this.arrange(node, p);
                    y += node.Size.Height + this.options.VerticalSeparation;
                }
            };

            TreeLayoutProcessor.prototype.layoutUp = function (up) {
                this.setChildrenDirection(this.center, "Up", false);
                this.setChildrenLayout(this.center, "Default", false);
                var w = 0, y, node, i;
                for (i = 0; i < up.length; i++) {
                    node = up[i];
                    node.TreeDirection = "Up";
                    var s = this.measure(node, TypeViz.Size.Empty);
                    w += s.Width + this.options.HorizontalSeparation;
                }

                w -= this.options.HorizontalSeparation;
                var x = this.center.X + (this.center.Width / 2) - (w / 2);

                for (i = 0; i < up.length; i++) {
                    node = up[i];
                    y = this.center.Y - this.options.VerticalSeparation - node.Size.Height;
                    var p = new TypeViz.Point(x, y);
                    this.arrange(node, p);
                    x += node.Size.Width + this.options.HorizontalSeparation;
                }
            };

            TreeLayoutProcessor.prototype.layoutDown = function (down) {
                var node, i;
                this.setChildrenDirection(this.center, "Down", false);
                this.setChildrenLayout(this.center, "Default", false);
                var w = 0, y;
                for (i = 0; i < down.length; i++) {
                    node = down[i];
                    node.treeDirection = "Down";
                    var s = this.measure(node, TypeViz.Size.Empty);
                    w += s.Width + this.options.HorizontalSeparation;
                }

                w -= this.options.HorizontalSeparation;
                var x = this.center.X + (this.center.Width / 2) - (w / 2);
                y = this.center.Y + this.options.VerticalSeparation + this.center.Height;
                for (i = 0; i < down.length; i++) {
                    node = down[i];
                    var p = new TypeViz.Point(x, y);
                    this.arrange(node, p);
                    x += node.Size.Width + this.options.HorizontalSeparation;
                }
            };

            TreeLayoutProcessor.prototype.layoutRadialTree = function () {
                this.setChildrenDirection(this.center, "Radial", false);
                this.setChildrenLayout(this.center, "Default", false);
                this.previousRoot = null;
                var startAngle = this.options.StartRadialAngle;
                var endAngle = this.options.EndRadialAngle;
                if (endAngle <= startAngle) {
                    throw "Final angle should not be less than the start angle.";
                }

                this.maxDepth = 0;
                this.origin = new TypeViz.Point(this.center.X, this.center.Y);
                this.calculateAngularWidth(this.center, 0);

                if (this.maxDepth > 0) {
                    this.radialLayout(this.center, this.options.RadialFirstLevelSeparation, startAngle, endAngle);
                }

                this.center.Angle = endAngle - startAngle;
            };

            TreeLayoutProcessor.prototype.tipOverTree = function (down, startFromLevel) {
                if (TypeViz.IsUndefined(startFromLevel)) {
                    startFromLevel = 0;
                }

                this.setChildrenDirection(this.center, "Down", false);
                this.setChildrenLayout(this.center, "Default", false);
                this.setChildrenLayout(this.center, "Underneath", false, startFromLevel);
                var w = 0, y, node, i;
                for (i = 0; i < down.length; i++) {
                    node = down[i];

                    node.TreeDirection = "Down";
                    var s = this.measure(node, TypeViz.Size.Empty);
                    w += s.Width + this.options.HorizontalSeparation;
                }

                w -= this.options.HorizontalSeparation;

                w -= down[down.length - 1].Width;
                w += down[down.length - 1].associatedShape.Rectangle.Width;

                var x = this.center.X + (this.center.Width / 2) - (w / 2);
                y = this.center.Y + this.options.VerticalSeparation + this.center.Height;
                for (i = 0; i < down.length; i++) {
                    node = down[i];

                    var p = new TypeViz.Point(x, y);
                    this.arrange(node, p);
                    x += node.Size.Width + this.options.HorizontalSeparation;
                }
            };

            TreeLayoutProcessor.prototype.calculateAngularWidth = function (n, d) {
                if (d > this.maxDepth) {
                    this.maxDepth = d;
                }

                var aw = 0, w = 1000, h = 1000, diameter = d === 0 ? 0 : Math.sqrt((w * w) + (h * h)) / d;

                if (n.children.length > 0) {
                    for (var i = 0, len = n.children.length; i < len; i++) {
                        var child = n.children[i];
                        aw += this.calculateAngularWidth(child, d + 1);
                    }
                    aw = Math.max(diameter, aw);
                } else {
                    aw = diameter;
                }

                n.sectorAngle = aw;
                return aw;
            };

            TreeLayoutProcessor.prototype.sortChildren = function (n) {
                var basevalue = 0, i;

                if (n.parents.length > 1) {
                    throw "Node is not part of a tree.";
                }
                var p = n.parents[0];
                if (p) {
                    var pl = new TypeViz.Point(p.X, p.Y);
                    var nl = new TypeViz.Point(n.X, n.Y);
                    basevalue = this.normalizeAngle(Math.atan2(pl.Y - nl.Y, pl.X - nl.X));
                }

                var count = n.children.length;
                if (count === 0) {
                    return null;
                }

                var angle = [];
                var idx = [];

                for (i = 0; i < count; ++i) {
                    var c = n.children[i];
                    var l = new TypeViz.Point(c.X, c.Y);
                    idx[i] = i;
                    angle[i] = this.normalizeAngle(-basevalue + Math.atan2(l.Y - l.Y, l.X - l.X));
                }

                Array.prototype.BiSort(angle, idx);
                var col = [];
                var children = n.children;
                for (i = 0; i < count; ++i) {
                    col.Add(children[idx[i]]);
                }

                return col;
            };

            TreeLayoutProcessor.prototype.normalizeAngle = function (angle) {
                while (angle > Math.PI * 2) {
                    angle -= 2 * Math.PI;
                }
                while (angle < 0) {
                    angle += Math.PI * 2;
                }
                return angle;
            };

            TreeLayoutProcessor.prototype.radialLayout = function (node, radius, startAngle, endAngle) {
                var deltaTheta = endAngle - startAngle;
                var deltaThetaHalf = deltaTheta / 2.0;
                var parentSector = node.sectorAngle;
                var fraction = 0;
                var sorted = this.sortChildren(node);
                for (var i = 0, len = sorted.length; i < len; i++) {
                    var childNode = sorted[i];
                    var cp = childNode;
                    var childAngleFraction = cp.sectorAngle / parentSector;
                    if (childNode.children.length > 0) {
                        this.radialLayout(childNode, radius + this.options.RadialSeparation, startAngle + (fraction * deltaTheta), startAngle + ((fraction + childAngleFraction) * deltaTheta));
                    }

                    this.setPolarLocation(childNode, radius, startAngle + (fraction * deltaTheta) + (childAngleFraction * deltaThetaHalf));
                    cp.angle = childAngleFraction * deltaTheta;
                    fraction += childAngleFraction;
                }
            };

            TreeLayoutProcessor.prototype.setPolarLocation = function (node, radius, angle) {
                node.X = this.origin.X + (radius * Math.cos(angle));
                node.Y = this.origin.Y + (radius * Math.sin(angle));
                node.BoundingRectangle = new TypeViz.Rect(node.X, node.Y, node.Width, node.Height);
            };

            TreeLayoutProcessor.prototype.setChildrenDirection = function (node, direction, includeStart) {
                var rootDirection = node.treeDirection;
                this.graph.depthFirstTraversal(node, function (n) {
                    n.treeDirection = direction;
                });
                if (!includeStart) {
                    node.treeDirection = rootDirection;
                }
            };

            TreeLayoutProcessor.prototype.setChildrenLayout = function (node, layout, includeStart, startFromLevel) {
                if (TypeViz.IsUndefined(startFromLevel)) {
                    startFromLevel = 0;
                }
                var rootLayout = node.childrenLayout;
                if (startFromLevel > 0) {
                    this.graph.assignLevels(node);

                    this.graph.depthFirstTraversal(node, function (s) {
                        if (s.level >= startFromLevel + 1) {
                            s.childrenLayout = layout;
                        }
                    });
                } else {
                    this.graph.depthFirstTraversal(node, function (s) {
                        s.childrenLayout = layout;
                    });

                    if (!includeStart) {
                        node.childrenLayout = rootLayout;
                    }
                }
            };

            TreeLayoutProcessor.prototype.measure = function (node, givenSize) {
                var w = 0, h = 0, s;
                var result = new TypeViz.Size(0, 0);
                if (!node) {
                    throw "";
                }
                var b = node.associatedShape.Rectangle;
                var shapeWidth = b.Width;
                var shapeHeight = b.Height;
                if (node.parents.length !== 1) {
                    throw "Node not in a spanning tree.";
                }

                var parent = node.parents[0];
                if (node.treeDirection === "Undefined") {
                    node.treeDirection = parent.treeDirection;
                }

                if (node.children.IsEmpty()) {
                    result = new TypeViz.Size(Math.abs(shapeWidth) < TypeViz.Maths.Epsilon ? 50 : shapeWidth, Math.abs(shapeHeight) < TypeViz.Maths.Epsilon ? 25 : shapeHeight);
                } else if (node.children.length === 1) {
                    switch (node.treeDirection) {
                        case "Radial":
                            s = this.measure(node.children[0], givenSize);
                            w = shapeWidth + (this.options.RadialSeparation * Math.cos(node.AngleToParent)) + s.Width;
                            h = shapeHeight + Math.abs(this.options.RadialSeparation * Math.sin(node.AngleToParent)) + s.Height;
                            break;
                        case "Left":
                        case "Right":
                            switch (node.childrenLayout) {
                                case "TopAlignedWithParent":
                                    break;

                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    s = this.measure(node.children[0], givenSize);
                                    w = shapeWidth + s.Width + this.options.UnderneathHorizontalOffset;
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset + s.Height;
                                    break;

                                case "Default":
                                    s = this.measure(node.children[0], givenSize);
                                    w = shapeWidth + this.options.HorizontalSeparation + s.Width;
                                    h = Math.max(shapeHeight, s.Height);
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Radial layout measuring.";
                            }
                            break;
                        case "Up":
                        case "Down":
                            switch (node.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    s = this.measure(node.children[0], givenSize);
                                    w = Math.max(shapeWidth, s.Width + this.options.UnderneathHorizontalOffset);
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset + s.Height;
                                    break;

                                case "Default":
                                    s = this.measure(node.children[0], givenSize);
                                    h = shapeHeight + this.options.VerticalSeparation + s.Height;
                                    w = Math.max(shapeWidth, s.Width);
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Down layout measuring.";
                            }
                            break;
                        default:
                            throw "Unhandled TreeDirection in the layout measuring.";
                    }

                    result = new TypeViz.Size(w, h);
                } else {
                    var i, childNode;
                    switch (node.treeDirection) {
                        case "Left":
                        case "Right":
                            switch (node.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    w = shapeWidth;
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w = Math.max(w, s.Width + this.options.UnderneathHorizontalOffset);
                                        h += s.Height + this.options.UnderneathVerticalSeparation;
                                    }

                                    h -= this.options.UnderneathVerticalSeparation;
                                    break;

                                case "Default":
                                    w = shapeWidth;
                                    h = 0;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w = Math.max(w, shapeWidth + this.options.HorizontalSeparation + s.Width);
                                        h += s.Height + this.options.VerticalSeparation;
                                    }
                                    h -= this.options.VerticalSeparation;
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Right layout measuring.";
                            }

                            break;
                        case "Up":
                        case "Down":
                            switch (node.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    w = shapeWidth;
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w = Math.max(w, s.Width + this.options.UnderneathHorizontalOffset);
                                        h += s.Height + this.options.UnderneathVerticalSeparation;
                                    }

                                    h -= this.options.UnderneathVerticalSeparation;
                                    break;

                                case "Default":
                                    w = 0;
                                    h = 0;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w += s.Width + this.options.HorizontalSeparation;
                                        h = Math.max(h, s.Height + this.options.VerticalSeparation + shapeHeight);
                                    }

                                    w -= this.options.HorizontalSeparation;
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Down layout measuring.";
                            }

                            break;
                        default:
                            throw "Unhandled TreeDirection in the layout measuring.";
                    }

                    result = new TypeViz.Size(w, h);
                }

                node.SectorAngle = Math.sqrt((w * w / 4) + (h * h / 4));
                node.Size = result;
                return result;
            };

            TreeLayoutProcessor.prototype.arrange = function (n, p) {
                var i, pp, child, node, childrenwidth, b = n.associatedShape.Rectangle;
                var shapeWidth = b.Width;
                var shapeHeight = b.Height;
                if (n.children.IsEmpty()) {
                    n.X = p.X;
                    n.Y = p.Y;
                    n.BoundingRectangle = new TypeViz.Rect(p.X, p.Y, shapeWidth, shapeHeight);
                } else {
                    var x, y;
                    var selfLocation;
                    switch (n.treeDirection) {
                        case "Left":
                            switch (n.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    selfLocation = p;
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                                    y = p.Y + shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < node.children.length; i++) {
                                        node = node.children[i];
                                        x = selfLocation.X - node.associatedShape.Width - this.options.UnderneathHorizontalOffset;
                                        pp = new TypeViz.Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.UnderneathVerticalSeparation;
                                    }
                                    break;

                                case "Default":
                                    selfLocation = new TypeViz.Point(p.X + n.Size.Width - shapeWidth, p.Y + ((n.Size.Height - shapeHeight) / 2));
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                                    x = selfLocation.X - this.options.HorizontalSeparation;
                                    y = p.Y;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new TypeViz.Point(x - node.Size.Width, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.VerticalSeparation;
                                    }
                                    break;

                                default:
                                    throw "Unsupported TreeDirection";
                            }

                            break;
                        case "Right":
                            switch (n.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    selfLocation = p;
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                                    x = p.X + shapeWidth + this.options.UnderneathHorizontalOffset;

                                    y = p.Y + shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new TypeViz.Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.UnderneathVerticalSeparation;
                                    }

                                    break;

                                case "Default":
                                    selfLocation = new TypeViz.Point(p.X, p.Y + ((n.Size.Height - shapeHeight) / 2));
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                                    x = p.X + shapeWidth + this.options.HorizontalSeparation;
                                    y = p.Y;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new TypeViz.Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.VerticalSeparation;
                                    }
                                    break;

                                default:
                                    throw "Unsupported TreeDirection";
                            }

                            break;
                        case "Up":
                            selfLocation = new TypeViz.Point(p.X + ((n.Size.Width - shapeWidth) / 2), p.Y + n.Size.Height - shapeHeight);
                            n.X = selfLocation.X;
                            n.Y = selfLocation.Y;
                            n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                            if (Math.abs(selfLocation.X - p.X) < TypeViz.Maths.Epsilon) {
                                childrenwidth = 0;

                                for (i = 0; i < n.children.length; i++) {
                                    child = n.children[i];
                                    childrenwidth += child.Size.Width + this.options.HorizontalSeparation;
                                }
                                childrenwidth -= this.options.HorizontalSeparation;
                                x = p.X + ((shapeWidth - childrenwidth) / 2);
                            } else {
                                x = p.X;
                            }

                            for (i = 0; i < n.children.length; i++) {
                                node = n.children[i];
                                y = selfLocation.Y - this.options.VerticalSeparation - node.Size.Height;
                                pp = new TypeViz.Point(x, y);
                                this.arrange(node, pp);
                                x += node.Size.Width + this.options.HorizontalSeparation;
                            }
                            break;

                        case "Down":
                            switch (n.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;
                                case "Underneath":
                                    selfLocation = p;
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                                    x = p.X + this.options.UnderneathHorizontalOffset;
                                    y = p.Y + shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new TypeViz.Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.UnderneathVerticalSeparation;
                                    }
                                    break;

                                case "Default":
                                    selfLocation = new TypeViz.Point(p.X + ((n.Size.Width - shapeWidth) / 2), p.Y);
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new TypeViz.Rect(n.X, n.Y, n.Width, n.Height);
                                    if (Math.abs(selfLocation.X - p.X) < TypeViz.Maths.Epsilon) {
                                        childrenwidth = 0;

                                        for (i = 0; i < n.children.length; i++) {
                                            child = n.children[i];
                                            childrenwidth += child.Size.Width + this.options.HorizontalSeparation;
                                        }

                                        childrenwidth -= this.options.HorizontalSeparation;
                                        x = p.X + ((shapeWidth - childrenwidth) / 2);
                                    } else {
                                        x = p.X;
                                    }

                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        y = selfLocation.Y + this.options.VerticalSeparation + shapeHeight;
                                        pp = new TypeViz.Point(x, y);
                                        this.arrange(node, pp);
                                        x += node.Size.Width + this.options.HorizontalSeparation;
                                    }
                                    break;

                                default:
                                    throw "Unsupported TreeDirection";
                            }
                            break;

                        case "None":
                            break;

                        default:
                            throw "Unsupported TreeDirection";
                    }
                }
            };

            TreeLayoutProcessor.prototype.layoutSwitch = function () {
                if (!this.center) {
                    return;
                }

                if (this.center.children.IsEmpty()) {
                    return;
                }

                var type = this.options.SubType;
                if (TypeViz.IsUndefined(type)) {
                    type = 5 /* TreeDown */;
                }
                var single, male, female, leftcount;
                var children = this.center.children;
                switch (type) {
                    case 7 /* RadialTree */:
                        this.layoutRadialTree();
                        break;

                    case 0 /* MindmapHorizontal */:
                        single = this.center.children;

                        if (this.center.children.length === 1) {
                            this.layoutRight(single);
                        } else {
                            leftcount = children.length / 2;
                            male = this.center.children.Where(function (n) {
                                return children.indexOf(n) < leftcount;
                            });
                            female = this.center.children.Where(function (n) {
                                return children.indexOf(n) >= leftcount;
                            });

                            this.layoutLeft(male);
                            this.layoutRight(female);
                        }
                        break;

                    case 1 /* MindmapVertical */:
                        single = this.center.children;

                        if (this.center.children.length === 1) {
                            this.layoutDown(single);
                        } else {
                            leftcount = children.length / 2;
                            male = this.center.children.Where(function (n) {
                                return children.indexOf(n) < leftcount;
                            });
                            female = this.center.children.Where(function (n) {
                                return children.indexOf(n) >= leftcount;
                            });
                            this.layoutUp(male);
                            this.layoutDown(female);
                        }
                        break;

                    case 2 /* TreeRight */:
                        this.layoutRight(this.center.children);
                        break;

                    case 3 /* TreeLeft */:
                        this.layoutLeft(this.center.children);
                        break;

                    case 4 /* TreeUp */:
                        this.layoutUp(this.center.children);
                        break;

                    case 5 /* TreeDown */:
                        this.layoutDown(this.center.children);
                        break;

                    case 6 /* TipOverTree */:
                        if (this.options.TipOverTreeStartLevel < 0) {
                            throw "The tip-over level should be a positive integer.";
                        }
                        this.tipOverTree(this.center.children, this.options.TipOverTreeStartLevel);
                        break;

                    default:
                        break;
                }
            };
            return TreeLayoutProcessor;
        })();
        Diagramming.TreeLayoutProcessor = TreeLayoutProcessor;

        var TreeLayout = (function (_super) {
            __extends(TreeLayout, _super);
            function TreeLayout(diagram) {
                _super.call(this);
                var that = this;
                if (TypeViz.IsUndefined(diagram)) {
                    throw "No diagram specified.";
                }
                this.diagram = diagram;
            }
            TreeLayout.prototype.Layout = function (options) {
                this.options = options;

                var adapter = new DiagramToHyperTreeAdapter(this.diagram);

                this.graph = adapter.convert();

                var finalNodeSet = this.layoutComponents();

                return new LayoutState(this.diagram, finalNodeSet);
            };

            TreeLayout.prototype.layoutComponents = function () {
                if (this.graph.IsEmpty) {
                    return;
                }

                var components = this.graph.getConnectedComponents();
                if (components.IsEmpty()) {
                    return;
                }

                var layout = new TreeLayoutProcessor(this.options);
                var trees = [];

                for (var i = 0; i < components.length; i++) {
                    var component = components[i];

                    var treeGraph = this.getTree(component);
                    if (!treeGraph) {
                        throw "Failed to find a spanning tree for the component.";
                    }
                    var root = treeGraph.root;
                    var tree = treeGraph.tree;
                    layout.Layout(tree, root);

                    trees.push(tree);
                }

                return this.gridLayoutComponents(trees);
            };

            TreeLayout.prototype.getTree = function (graph) {
                var root = null;
                if (this.options.Roots && this.options.Roots.length > 0) {
                    for (var i = 0, len = graph.nodes.length; i < len; i++) {
                        var node = graph.nodes[i];
                        for (var j = 0; j < this.options.Roots.length; j++) {
                            var givenRootShape = this.options.Roots[j];
                            if (givenRootShape === node.associatedShape) {
                                root = node;
                                break;
                            }
                        }
                    }
                }
                if (!root) {
                    root = graph.root;

                    if (!root) {
                        throw "Unable to find a root for the tree.";
                    }
                }
                return this.getTreeForRoot(graph, root);
            };

            TreeLayout.prototype.getTreeForRoot = function (graph, root) {
                var tree = graph.getSpanningTree(root);
                if (TypeViz.IsUndefined(tree) || tree.IsEmpty) {
                    return null;
                }
                return {
                    tree: tree,
                    root: tree.root
                };
            };
            return TreeLayout;
        })(LayoutBase);
        Diagramming.TreeLayout = TreeLayout;

        var LayeredLayout = (function (_super) {
            __extends(LayeredLayout, _super);
            function LayeredLayout(diagram) {
                _super.call(this);
                var that = this;
                if (TypeViz.IsUndefined(diagram)) {
                    throw "Diagram is not specified.";
                }
                this.diagram = diagram;
            }
            LayeredLayout.prototype.Layout = function (options) {
                this.options = options;

                var adapter = new DiagramToHyperTreeAdapter(this.diagram);
                var graph = adapter.convert(options);
                if (graph.IsEmpty) {
                    return;
                }

                var components = graph.getConnectedComponents();
                if (components.IsEmpty()) {
                    return;
                }
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    this.layoutGraph(component, options);
                }
                var finalNodeSet = this.gridLayoutComponents(components);
                return new LayoutState(this.diagram, finalNodeSet);
            };

            LayeredLayout.prototype._initRuntimeProperties = function () {
                for (var k = 0; k < this.graph.nodes.length; k++) {
                    var node = this.graph.nodes[k];
                    node.layer = -1;
                    node.downstreamLinkCount = 0;
                    node.upstreamLinkCount = 0;

                    node.isVirtual = false;

                    node.uBaryCenter = 0.0;
                    node.dBaryCenter = 0.0;

                    node.upstreamPriority = 0;
                    node.downstreamPriority = 0;

                    node.gridPosition = 0;
                }
            };

            LayeredLayout.prototype._prepare = function (graph, options) {
                var current = [], i, l, link;
                for (l = 0; l < graph.links.length; l++) {
                    graph.links[l].depthOfDumminess = 0;
                }

                var layerMap = new Map();

                graph.nodes.ForEach(function (node) {
                    if (node.incoming.length === 0) {
                        layerMap.Set(node, 0);
                        current.push(node);
                    }
                });

                while (current.length > 0) {
                    var next = current.shift();
                    for (i = 0; i < next.outgoing.length; i++) {
                        link = next.outgoing[i];
                        var target = link.target;

                        if (layerMap.ContainsKey(target)) {
                            layerMap.Set(target, Math.max(layerMap.Get(next) + 1, layerMap.Get(target)));
                        } else {
                            layerMap.Set(target, layerMap.Get(next) + 1);
                        }

                        if (!current.Contains(target)) {
                            current.push(target);
                        }
                    }
                }

                var layerCount = 0;
                layerMap.forEachValue(function (nodecount) {
                    layerCount = Math.max(layerCount, nodecount);
                });

                var sortedNodes = [];
                sortedNodes.AddRange(layerMap.keys());
                sortedNodes.sort(function (o1, o2) {
                    var o1layer = layerMap.Get(o1);
                    var o2layer = layerMap.Get(o2);
                    return TypeViz.Maths.Sign(o2layer - o1layer);
                });

                for (var n = 0; n < sortedNodes.length; ++n) {
                    var node = sortedNodes[n];
                    var minLayer = Number.MAX_VALUE;

                    if (node.outgoing.length === 0) {
                        continue;
                    }

                    for (l = 0; l < node.outgoing.length; ++l) {
                        link = node.outgoing[l];
                        minLayer = Math.min(minLayer, layerMap.Get(link.target));
                    }

                    if (minLayer > 1) {
                        layerMap.Set(node, minLayer - 1);
                    }
                }

                this.layers = [];
                for (i = 0; i < layerCount + 1; i++) {
                    this.layers.push([]);
                }

                layerMap.ForEach(function (node, layer) {
                    node.layer = layer;
                    this.layers[layer].push(node);
                }, this);

                for (l = 0; l < this.layers.length; l++) {
                    var layer = this.layers[l];
                    for (i = 0; i < layer.length; i++) {
                        layer[i].gridPosition = i;
                    }
                }
            };

            LayeredLayout.prototype.layoutGraph = function (graph, options) {
                if (TypeViz.IsUndefined(graph)) {
                    throw "No graph given or graph analysis of the diagram failed.";
                }
                this.options = options;
                this.graph = graph;

                graph.setItemIndices();

                var reversedEdges = graph.makeAcyclic();

                this._initRuntimeProperties();

                this._prepare(graph, options);

                this._dummify();

                this._optimizeCrossings();

                this._swapPairs();

                this.arrangeNodes();

                this._moveThingsAround();

                this._dedummify();

                reversedEdges.ForEach(function (e) {
                    if (e.points) {
                        e.points.reverse();
                    }
                });
            };

            LayeredLayout.prototype.setMinDist = function (m, n, minDist) {
                var l = m.layer;
                var i = m.layerIndex;
                this.minDistances[l][i] = minDist;
            };

            LayeredLayout.prototype.getMinDist = function (m, n) {
                var dist = 0, i1 = m.layerIndex, i2 = n.layerIndex, l = m.layer, min = Math.min(i1, i2), max = Math.max(i1, i2);

                for (var k = min; k < max; ++k) {
                    dist += this.minDistances[l][k];
                }
                return dist;
            };

            LayeredLayout.prototype.placeLeftToRight = function (leftClasses) {
                var leftPos = new Map(), n, node;
                for (var c = 0; c < this.layers.length; ++c) {
                    var classNodes = leftClasses[c];
                    if (!classNodes) {
                        continue;
                    }

                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        if (!leftPos.ContainsKey(node)) {
                            this.placeLeft(node, leftPos, c);
                        }
                    }

                    var d = Number.POSITIVE_INFINITY;
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        var rightSibling = this.rightSibling(node);
                        if (rightSibling && this.nodeLeftClass.Get(rightSibling) !== c) {
                            d = Math.min(d, leftPos.Get(rightSibling) - leftPos.Get(node) - this.getMinDist(node, rightSibling));
                        }
                    }
                    if (d === Number.POSITIVE_INFINITY) {
                        var D = [];
                        for (n = 0; n < classNodes.length; n++) {
                            node = classNodes[n];
                            var neighbors = [];
                            neighbors.AddRange(this.upNodes.Get(node));
                            neighbors.AddRange(this.downNodes.Get(node));

                            for (var e = 0; e < neighbors.length; e++) {
                                var neighbor = neighbors[e];
                                if (this.nodeLeftClass.Get(neighbor) < c) {
                                    D.push(leftPos.Get(neighbor) - leftPos.Get(node));
                                }
                            }
                        }
                        D.sort();
                        if (D.length === 0) {
                            d = 0;
                        } else if (D.length % 2 === 1) {
                            d = D[this.intDiv(D.length, 2)];
                        } else {
                            d = (D[this.intDiv(D.length, 2) - 1] + D[this.intDiv(D.length, 2)]) / 2;
                        }
                    }
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        leftPos.Set(node, leftPos.Get(node) + d);
                    }
                }
                return leftPos;
            };

            LayeredLayout.prototype.placeRightToLeft = function (rightClasses) {
                var rightPos = new Map(), n, node;
                for (var c = 0; c < this.layers.length; ++c) {
                    var classNodes = rightClasses[c];
                    if (!classNodes) {
                        continue;
                    }

                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        if (!rightPos.ContainsKey(node)) {
                            this.placeRight(node, rightPos, c);
                        }
                    }

                    var d = Number.NEGATIVE_INFINITY;
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        var leftSibling = this.leftSibling(node);
                        if (leftSibling && this.nodeRightClass.Get(leftSibling) !== c) {
                            d = Math.max(d, rightPos.Get(leftSibling) - rightPos.Get(node) + this.getMinDist(leftSibling, node));
                        }
                    }
                    if (d === Number.NEGATIVE_INFINITY) {
                        var D = [];
                        for (n = 0; n < classNodes.length; n++) {
                            node = classNodes[n];
                            var neighbors = [];
                            neighbors.AddRange(this.upNodes.Get(node));
                            neighbors.AddRange(this.downNodes.Get(node));

                            for (var e = 0; e < neighbors.length; e++) {
                                var neighbor = neighbors[e];
                                if (this.nodeRightClass.Get(neighbor) < c) {
                                    D.push(rightPos.Get(node) - rightPos.Get(neighbor));
                                }
                            }
                        }
                        D.sort();
                        if (D.length === 0) {
                            d = 0;
                        } else if (D.length % 2 === 1) {
                            d = D[this.intDiv(D.length, 2)];
                        } else {
                            d = (D[this.intDiv(D.length, 2) - 1] + D[this.intDiv(D.length, 2)]) / 2;
                        }
                    }
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        rightPos.Set(node, rightPos.Get(node) + d);
                    }
                }
                return rightPos;
            };

            LayeredLayout.prototype._getLeftWing = function () {
                var leftWing = { value: null };
                var result = this.computeClasses(leftWing, 1);
                this.nodeLeftClass = leftWing.value;
                return result;
            };

            LayeredLayout.prototype._getRightWing = function () {
                var rightWing = { value: null };
                var result = this.computeClasses(rightWing, -1);
                this.nodeRightClass = rightWing.value;
                return result;
            };

            LayeredLayout.prototype.computeClasses = function (wingPair, d) {
                var currentWing = 0, wing = wingPair.value = new Map();

                for (var l = 0; l < this.layers.length; ++l) {
                    currentWing = l;

                    var layer = this.layers[l];
                    for (var n = d === 1 ? 0 : layer.length - 1; 0 <= n && n < layer.length; n += d) {
                        var node = layer[n];
                        if (!wing.ContainsKey(node)) {
                            wing.Set(node, currentWing);
                            if (node.isVirtual) {
                                var ndsinl = this._nodesInLink(node);
                                for (var kk = 0; kk < ndsinl.length; kk++) {
                                    var vnode = ndsinl[kk];
                                    wing.Set(vnode, currentWing);
                                }
                            }
                        } else {
                            currentWing = wing.Get(node);
                        }
                    }
                }

                var wings = [];
                for (var i = 0; i < this.layers.length; i++) {
                    wings.push(null);
                }
                wing.ForEach(function (node, classIndex) {
                    if (wings[classIndex] === null) {
                        wings[classIndex] = [];
                    }
                    wings[classIndex].push(node);
                });

                return wings;
            };

            LayeredLayout.prototype._isVerticalLayout = function () {
                return this.options.SubType === 0 /* Up */ || this.options.SubType === 1 /* Down */;
            };

            LayeredLayout.prototype._isHorizontalLayout = function () {
                return this.options.SubType === 2 /* Left */ || this.options.SubType === 3 /* Right */;
            };

            LayeredLayout.prototype._isIncreasingLayout = function () {
                return this.options.SubType === 3 /* Right */ || this.options.SubType === 1 /* Down */;
            };

            LayeredLayout.prototype._moveThingsAround = function () {
                var i, l, node, layer, n, w;

                for (l = 0; l < this.layers.length; ++l) {
                    layer = this.layers[l];
                    layer.sort(this._gridPositionComparer);
                }

                this.minDistances = [];
                for (l = 0; l < this.layers.length; ++l) {
                    layer = this.layers[l];
                    this.minDistances[l] = [];
                    for (n = 0; n < layer.length; ++n) {
                        node = layer[n];
                        node.layerIndex = n;
                        this.minDistances[l][n] = this.options.NodeDistance;
                        if (n < layer.length - 1) {
                            if (this._isVerticalLayout()) {
                                this.minDistances[l][n] += (node.Width + layer[n + 1].Width) / 2;
                            } else {
                                this.minDistances[l][n] += (node.Height + layer[n + 1].Height) / 2;
                            }
                        }
                    }
                }

                this.downNodes = new Map();
                this.upNodes = new Map();
                this.graph.nodes.ForEach(function (node) {
                    this.downNodes.Set(node, []);
                    this.upNodes.Set(node, []);
                }, this);
                this.graph.links.ForEach(function (link) {
                    var origin = link.source;
                    var dest = link.target;
                    var down = null, up = null;
                    if (origin.layer > dest.layer) {
                        down = link.source;
                        up = link.target;
                    } else {
                        up = link.source;
                        down = link.target;
                    }
                    this.downNodes.Get(up).push(down);
                    this.upNodes.Get(down).push(up);
                }, this);
                this.downNodes.forEachValue(function (list) {
                    list.sort(this._gridPositionComparer);
                });
                this.upNodes.forEachValue(function (list) {
                    list.sort(this._gridPositionComparer);
                });

                for (l = 0; l < this.layers.length - 1; ++l) {
                    layer = this.layers[l];
                    for (w = 0; w < layer.length - 1; w++) {
                        var currentNode = layer[w];
                        if (!currentNode.isVirtual) {
                            continue;
                        }

                        var currDown = this.downNodes.Get(currentNode)[0];
                        if (!currDown.isVirtual) {
                            continue;
                        }

                        for (n = w + 1; n < layer.length; ++n) {
                            node = layer[n];
                            if (!node.isVirtual) {
                                continue;
                            }

                            var downNode = this.downNodes.Get(node)[0];
                            if (!downNode.isVirtual) {
                                continue;
                            }

                            if (currDown.gridPosition > downNode.gridPosition) {
                                var pos = currDown.gridPosition;
                                currDown.gridPosition = downNode.gridPosition;
                                downNode.gridPosition = pos;
                                var i1 = currDown.layerIndex;
                                var i2 = downNode.layerIndex;
                                this.layers[l + 1][i1] = downNode;
                                this.layers[l + 1][i2] = currDown;
                                currDown.layerIndex = i2;
                                downNode.layerIndex = i1;
                            }
                        }
                    }
                }

                var leftClasses = this._getLeftWing();
                var rightClasses = this._getRightWing();

                var leftPos = this.placeLeftToRight(leftClasses);
                var rightPos = this.placeRightToLeft(rightClasses);
                var x = new Map();
                this.graph.nodes.ForEach(function (node) {
                    x.Set(node, (leftPos.Get(node) + rightPos.Get(node)) / 2);
                });

                var order = new Map();
                var placed = new Map();
                for (l = 0; l < this.layers.length; ++l) {
                    layer = this.layers[l];
                    var sequenceStart = -1, sequenceEnd = -1;
                    for (n = 0; n < layer.length; ++n) {
                        node = layer[n];
                        order.Set(node, 0);
                        placed.Set(node, false);
                        if (node.isVirtual) {
                            if (sequenceStart === -1) {
                                sequenceStart = n;
                            } else if (sequenceStart === n - 1) {
                                sequenceStart = n;
                            } else {
                                sequenceEnd = n;
                                order.Set(layer[sequenceStart], 0);
                                if (x.Get(node) - x.Get(layer[sequenceStart]) === this.getMinDist(layer[sequenceStart], node)) {
                                    placed.Set(layer[sequenceStart], true);
                                } else {
                                    placed.Set(layer[sequenceStart], false);
                                }
                                sequenceStart = n;
                            }
                        }
                    }
                }
                var directions = [1, -1];
                directions.ForEach(function (d) {
                    var start = d === 1 ? 0 : this.layers.length - 1;
                    for (var l = start; 0 <= l && l < this.layers.length; l += d) {
                        var layer = this.layers[l];
                        var virtualStartIndex = this._firstVirtualNode(layer);
                        var virtualStart = null;
                        var sequence = null;
                        if (virtualStartIndex !== -1) {
                            virtualStart = layer[virtualStartIndex];
                            sequence = [];
                            for (i = 0; i < virtualStartIndex; i++) {
                                sequence.push(layer[i]);
                            }
                        } else {
                            virtualStart = null;
                            sequence = layer;
                        }
                        if (sequence.length > 0) {
                            this._sequencer(x, null, virtualStart, d, sequence);
                            for (i = 0; i < sequence.length - 1; ++i) {
                                this.setMinDist(sequence[i], sequence[i + 1], x.Get(sequence[i + 1]) - x.Get(sequence[i]));
                            }
                            if (virtualStart) {
                                this.setMinDist(sequence[sequence.length - 1], virtualStart, x.Get(virtualStart) - x.Get(sequence[sequence.length - 1]));
                            }
                        }

                        while (virtualStart) {
                            var virtualEnd = this.nextVirtualNode(layer, virtualStart);
                            if (!virtualEnd) {
                                virtualStartIndex = virtualStart.layerIndex;
                                sequence = [];
                                for (i = virtualStartIndex + 1; i < layer.length; i++) {
                                    sequence.push(layer[i]);
                                }
                                if (sequence.length > 0) {
                                    this._sequencer(x, virtualStart, null, d, sequence);
                                    for (i = 0; i < sequence.length - 1; ++i) {
                                        this.setMinDist(sequence[i], sequence[i + 1], x.Get(sequence[i + 1]) - x.Get(sequence[i]));
                                    }
                                    this.setMinDist(virtualStart, sequence[0], x.Get(sequence[0]) - x.Get(virtualStart));
                                }
                            } else if (order.Get(virtualStart) === d) {
                                virtualStartIndex = virtualStart.layerIndex;
                                var virtualEndIndex = virtualEnd.layerIndex;
                                sequence = [];
                                for (i = virtualStartIndex + 1; i < virtualEndIndex; i++) {
                                    sequence.push(layer[i]);
                                }
                                if (sequence.length > 0) {
                                    this._sequencer(x, virtualStart, virtualEnd, d, sequence);
                                }
                                placed.Set(virtualStart, true);
                            }
                            virtualStart = virtualEnd;
                        }
                        this.adjustDirections(l, d, order, placed);
                    }
                }, this);

                var fromLayerIndex = this._isIncreasingLayout() ? 0 : this.layers.length - 1;
                var reachedFinalLayerIndex = function (k, ctx) {
                    if (ctx._isIncreasingLayout()) {
                        return k < ctx.layers.length;
                    } else {
                        return k >= 0;
                    }
                };
                var layerIncrement = this._isIncreasingLayout() ? +1 : -1, offset = 0;

                function maximumHeight(layer, ctx) {
                    var height = Number.MIN_VALUE;
                    for (var n = 0; n < layer.length; ++n) {
                        var node = layer[n];
                        if (ctx._isVerticalLayout()) {
                            height = Math.max(height, node.Height);
                        } else {
                            height = Math.max(height, node.Width);
                        }
                    }
                    return height;
                }

                for (i = fromLayerIndex; reachedFinalLayerIndex(i, this); i += layerIncrement) {
                    layer = this.layers[i];
                    var height = maximumHeight(layer, this);

                    for (n = 0; n < layer.length; ++n) {
                        node = layer[n];
                        if (this._isVerticalLayout()) {
                            node.X = x.Get(node);
                            node.Y = offset + height / 2;
                        } else {
                            node.X = offset + height / 2;
                            node.Y = x.Get(node);
                        }
                    }

                    offset += this.options.LayerSeparation + height;
                }
            };

            LayeredLayout.prototype.adjustDirections = function (l, d, order, placed) {
                if (l + d < 0 || l + d >= this.layers.length) {
                    return;
                }

                var prevBridge = null, prevBridgeTarget = null;
                var layer = this.layers[l + d];
                for (var n = 0; n < layer.length; ++n) {
                    var nextBridge = layer[n];
                    if (nextBridge.isVirtual) {
                        var nextBridgeTarget = this.getNeighborOnLayer(nextBridge, l);
                        if (nextBridgeTarget.isVirtual) {
                            if (prevBridge) {
                                var p = placed.Get(prevBridgeTarget);
                                var clayer = this.layers[l];
                                var i1 = prevBridgeTarget.layerIndex;
                                var i2 = nextBridgeTarget.layerIndex;
                                for (var i = i1 + 1; i < i2; ++i) {
                                    if (clayer[i].isVirtual) {
                                        p = p && placed.Get(clayer[i]);
                                    }
                                }
                                if (p) {
                                    order.Set(prevBridge, d);
                                    var j1 = prevBridge.layerIndex;
                                    var j2 = nextBridge.layerIndex;
                                    for (var j = j1 + 1; j < j2; ++j) {
                                        if (layer[j].isVirtual) {
                                            order.Set(layer[j], d);
                                        }
                                    }
                                }
                            }
                            prevBridge = nextBridge;
                            prevBridgeTarget = nextBridgeTarget;
                        }
                    }
                }
            };

            LayeredLayout.prototype.getNeighborOnLayer = function (node, l) {
                var neighbor = this.upNodes.Get(node)[0];
                if (neighbor.layer === l) {
                    return neighbor;
                }
                neighbor = this.downNodes.Get(node)[0];
                if (neighbor.layer === l) {
                    return neighbor;
                }
                return null;
            };

            LayeredLayout.prototype._sequencer = function (x, virtualStart, virtualEnd, dir, sequence) {
                if (sequence.length === 1) {
                    this._sequenceSingle(x, virtualStart, virtualEnd, dir, sequence[0]);
                }

                if (sequence.length > 1) {
                    var r = sequence.length, t = this.intDiv(r, 2);
                    this._sequencer(x, virtualStart, virtualEnd, dir, sequence.slice(0, t));
                    this._sequencer(x, virtualStart, virtualEnd, dir, sequence.slice(t));
                    this.combineSequences(x, virtualStart, virtualEnd, dir, sequence);
                }
            };

            LayeredLayout.prototype._sequenceSingle = function (x, virtualStart, virtualEnd, dir, node) {
                var neighbors = dir === -1 ? this.downNodes.Get(node) : this.upNodes.Get(node);

                var n = neighbors.length;
                if (n !== 0) {
                    if (n % 2 === 1) {
                        x.Set(node, x.Get(neighbors[this.intDiv(n, 2)]));
                    } else {
                        x.Set(node, (x.Get(neighbors[this.intDiv(n, 2) - 1]) + x.Get(neighbors[this.intDiv(n, 2)])) / 2);
                    }

                    if (virtualStart) {
                        x.Set(node, Math.max(x.Get(node), x.Get(virtualStart) + this.getMinDist(virtualStart, node)));
                    }
                    if (virtualEnd) {
                        x.Set(node, Math.min(x.Get(node), x.Get(virtualEnd) - this.getMinDist(node, virtualEnd)));
                    }
                }
            };

            LayeredLayout.prototype.combineSequences = function (x, virtualStart, virtualEnd, dir, sequence) {
                var r = sequence.length, t = this.intDiv(r, 2);

                var leftHeap = [], i, c, n, neighbors, neighbor, pair;
                for (i = 0; i < t; ++i) {
                    c = 0;
                    neighbors = dir === -1 ? this.downNodes.Get(sequence[i]) : this.upNodes.Get(sequence[i]);
                    for (n = 0; n < neighbors.length; ++n) {
                        neighbor = neighbors[n];
                        if (x.Get(neighbor) >= x.Get(sequence[i])) {
                            c++;
                        } else {
                            c--;
                            leftHeap.push({ k: x.Get(neighbor) + this.getMinDist(sequence[i], sequence[t - 1]), v: 2 });
                        }
                    }
                    leftHeap.push({ k: x.Get(sequence[i]) + this.getMinDist(sequence[i], sequence[t - 1]), v: c });
                }
                if (virtualStart) {
                    leftHeap.push({ k: x.Get(virtualStart) + this.getMinDist(virtualStart, sequence[t - 1]), v: Number.MAX_VALUE });
                }
                leftHeap.sort(this._positionDescendingComparer);

                var rightHeap = [];
                for (i = t; i < r; ++i) {
                    c = 0;
                    neighbors = dir === -1 ? this.downNodes.Get(sequence[i]) : this.upNodes.Get(sequence[i]);
                    for (n = 0; n < neighbors.length; ++n) {
                        neighbor = neighbors[n];
                        if (x.Get(neighbor) <= x.Get(sequence[i])) {
                            c++;
                        } else {
                            c--;
                            rightHeap.push({ k: x.Get(neighbor) - this.getMinDist(sequence[i], sequence[t]), v: 2 });
                        }
                    }
                    rightHeap.push({ k: x.Get(sequence[i]) - this.getMinDist(sequence[i], sequence[t]), v: c });
                }
                if (virtualEnd) {
                    rightHeap.push({ k: x.Get(virtualEnd) - this.getMinDist(virtualEnd, sequence[t]), v: Number.MAX_VALUE });
                }
                rightHeap.sort(this._positionAscendingComparer);

                var leftRes = 0, rightRes = 0;
                var m = this.getMinDist(sequence[t - 1], sequence[t]);
                while (x.Get(sequence[t]) - x.Get(sequence[t - 1]) < m) {
                    if (leftRes < rightRes) {
                        if (leftHeap.length === 0) {
                            x.Set(sequence[t - 1], x.Get(sequence[t]) - m);
                            break;
                        } else {
                            pair = leftHeap.shift();
                            leftRes = leftRes + pair.v;
                            x.Set(sequence[t - 1], pair.k);
                            x.Set(sequence[t - 1], Math.max(x.Get(sequence[t - 1]), x.Get(sequence[t]) - m));
                        }
                    } else {
                        if (rightHeap.length === 0) {
                            x.Set(sequence[t], x.Get(sequence[t - 1]) + m);
                            break;
                        } else {
                            pair = rightHeap.shift();
                            rightRes = rightRes + pair.v;
                            x.Set(sequence[t], pair.k);
                            x.Set(sequence[t], Math.min(x.Get(sequence[t]), x.Get(sequence[t - 1]) + m));
                        }
                    }
                }
                for (i = t - 2; i >= 0; i--) {
                    x.Set(sequence[i], Math.min(x.Get(sequence[i]), x.Get(sequence[t - 1]) - this.getMinDist(sequence[i], sequence[t - 1])));
                }
                for (i = t + 1; i < r; i++) {
                    x.Set(sequence[i], Math.max(x.Get(sequence[i]), x.Get(sequence[t]) + this.getMinDist(sequence[i], sequence[t])));
                }
            };

            LayeredLayout.prototype.placeLeft = function (node, leftPos, leftClass) {
                var pos = Number.NEGATIVE_INFINITY;
                this._getComposite(node).ForEach(function (v) {
                    var leftSibling = this.leftSibling(v);
                    if (leftSibling && this.nodeLeftClass.Get(leftSibling) === this.nodeLeftClass.Get(v)) {
                        if (!leftPos.ContainsKey(leftSibling)) {
                            this.placeLeft(leftSibling, leftPos, leftClass);
                        }
                        pos = Math.max(pos, leftPos.Get(leftSibling) + this.getMinDist(leftSibling, v));
                    }
                }, this);
                if (pos === Number.NEGATIVE_INFINITY) {
                    pos = 0;
                }
                this._getComposite(node).ForEach(function (v) {
                    leftPos.Set(v, pos);
                });
            };

            LayeredLayout.prototype.placeRight = function (node, rightPos, rightClass) {
                var pos = Number.POSITIVE_INFINITY;
                this._getComposite(node).ForEach(function (v) {
                    var rightSibling = this.rightSibling(v);
                    if (rightSibling && this.nodeRightClass.Get(rightSibling) === this.nodeRightClass.Get(v)) {
                        if (!rightPos.ContainsKey(rightSibling)) {
                            this.placeRight(rightSibling, rightPos, rightClass);
                        }
                        pos = Math.min(pos, rightPos.Get(rightSibling) - this.getMinDist(v, rightSibling));
                    }
                }, this);
                if (pos === Number.POSITIVE_INFINITY) {
                    pos = 0;
                }
                this._getComposite(node).ForEach(function (v) {
                    rightPos.Set(v, pos);
                });
            };

            LayeredLayout.prototype.leftSibling = function (node) {
                var layer = this.layers[node.layer], layerIndex = node.layerIndex;
                return layerIndex === 0 ? null : layer[layerIndex - 1];
            };

            LayeredLayout.prototype.rightSibling = function (node) {
                var layer = this.layers[node.layer];
                var layerIndex = node.layerIndex;
                return layerIndex === layer.length - 1 ? null : layer[layerIndex + 1];
            };

            LayeredLayout.prototype._getComposite = function (node) {
                return node.isVirtual ? this._nodesInLink(node) : [node];
            };

            LayeredLayout.prototype.arrangeNodes = function () {
                var i, l, ni, layer, node;

                for (l = 0; l < this.layers.length; l++) {
                    layer = this.layers[l];

                    for (ni = 0; ni < layer.length; ni++) {
                        node = layer[ni];
                        node.upstreamPriority = node.upstreamLinkCount;
                        node.downstreamPriority = node.downstreamLinkCount;
                    }
                }

                var maxLayoutIterations = 2;
                for (var it = 0; it < maxLayoutIterations; it++) {
                    for (i = this.layers.length - 1; i >= 1; i--) {
                        this.layoutLayer(false, i);
                    }

                    for (i = 0; i < this.layers.length - 1; i++) {
                        this.layoutLayer(true, i);
                    }
                }

                var gridPos = Number.MAX_VALUE;
                for (l = 0; l < this.layers.length; l++) {
                    layer = this.layers[l];

                    for (ni = 0; ni < layer.length; ni++) {
                        node = layer[ni];
                        gridPos = Math.min(gridPos, node.gridPosition);
                    }
                }

                if (gridPos < 0) {
                    for (l = 0; l < this.layers.length; l++) {
                        layer = this.layers[l];

                        for (ni = 0; ni < layer.length; ni++) {
                            node = layer[ni];
                            node.gridPosition = node.gridPosition - gridPos;
                        }
                    }
                }
            };

            LayeredLayout.prototype.layoutLayer = function (down, layer) {
                var iconsidered;
                var considered;

                if (down) {
                    considered = this.layers[iconsidered = layer + 1];
                } else {
                    considered = this.layers[iconsidered = layer - 1];
                }

                var sorted = [];
                for (var n = 0; n < considered.length; n++) {
                    sorted.push(considered[n]);
                }
                sorted.sort(function (n1, n2) {
                    var n1Priority = (n1.upstreamPriority + n1.downstreamPriority) / 2;
                    var n2Priority = (n2.upstreamPriority + n2.downstreamPriority) / 2;

                    if (Math.abs(n1Priority - n2Priority) < 0.0001) {
                        return 0;
                    }
                    if (n1Priority < n2Priority) {
                        return 1;
                    }
                    return -1;
                });

                sorted.ForEach(function (node) {
                    var nodeGridPos = node.gridPosition;
                    var nodeBaryCenter = this.calcBaryCenter(node);
                    var nodePriority = (node.upstreamPriority + node.downstreamPriority) / 2;

                    if (Math.abs(nodeGridPos - nodeBaryCenter) < 0.0001) {
                        return;
                    }

                    if (Math.abs(nodeGridPos - nodeBaryCenter) < 0.25 + 0.0001) {
                        return;
                    }

                    if (nodeGridPos < nodeBaryCenter) {
                        while (nodeGridPos < nodeBaryCenter) {
                            if (!this.moveRight(node, considered, nodePriority)) {
                                break;
                            }

                            nodeGridPos = node.gridPosition;
                        }
                    } else {
                        while (nodeGridPos > nodeBaryCenter) {
                            if (!this.moveLeft(node, considered, nodePriority)) {
                                break;
                            }

                            nodeGridPos = node.gridPosition;
                        }
                    }
                }, this);

                if (iconsidered > 0) {
                    this.calcDownData(iconsidered - 1);
                }
                if (iconsidered < this.layers.length - 1) {
                    this.calcUpData(iconsidered + 1);
                }
            };

            LayeredLayout.prototype.moveRight = function (node, layer, priority) {
                var index = layer.indexOf(node);
                if (index === layer.length - 1) {
                    node.gridPosition = node.gridPosition + 0.5;
                    return true;
                }

                var rightNode = layer[index + 1];
                var rightNodePriority = (rightNode.upstreamPriority + rightNode.downstreamPriority) / 2;

                if (rightNode.gridPosition > node.gridPosition + 1) {
                    node.gridPosition = node.gridPosition + 0.5;
                    return true;
                }

                if (rightNodePriority > priority || Math.abs(rightNodePriority - priority) < 0.0001) {
                    return false;
                }

                if (this.moveRight(rightNode, layer, priority)) {
                    node.gridPosition = node.gridPosition + 0.5;
                    return true;
                }

                return false;
            };

            LayeredLayout.prototype.moveLeft = function (node, layer, priority) {
                var index = layer.indexOf(node);
                if (index === 0) {
                    node.gridPosition = node.gridPosition - 0.5;
                    return true;
                }

                var leftNode = layer[index - 1];
                var leftNodePriority = (leftNode.upstreamPriority + leftNode.downstreamPriority) / 2;

                if (leftNode.gridPosition < node.gridPosition - 1) {
                    node.gridPosition = node.gridPosition - 0.5;
                    return true;
                }

                if (leftNodePriority > priority || Math.abs(leftNodePriority - priority) < 0.0001) {
                    return false;
                }

                if (this.moveLeft(leftNode, layer, priority)) {
                    node.gridPosition = node.gridPosition - 0.5;
                    return true;
                }

                return false;
            };

            LayeredLayout.prototype.mapVirtualNode = function (node, link) {
                this.nodeToLinkMap.Set(node, link);
                if (!this.linkToNodeMap.ContainsKey(link)) {
                    this.linkToNodeMap.Set(link, []);
                }
                this.linkToNodeMap.Get(link).push(node);
            };

            LayeredLayout.prototype._nodesInLink = function (node) {
                return this.linkToNodeMap.Get(this.nodeToLinkMap.Get(node));
            };

            LayeredLayout.prototype._dummify = function () {
                this.linkToNodeMap = new Map();
                this.nodeToLinkMap = new Map();

                var layer, pos, newNode, node, r, newLink, i, l, links = this.graph.links.slice(0);
                for (l = 0; l < links.length; l++) {
                    var link = links[l];
                    var o = link.source;
                    var d = link.target;

                    var oLayer = o.layer;
                    var dLayer = d.layer;
                    var oPos = o.gridPosition;
                    var dPos = d.gridPosition;

                    var step = (dPos - oPos) / Math.abs(dLayer - oLayer);

                    var p = o;
                    if (oLayer - dLayer > 1) {
                        for (i = oLayer - 1; i > dLayer; i--) {
                            newNode = new TypeViz.Diagramming.Node();
                            newNode.X = o.X;
                            newNode.Y = o.Y;
                            newNode.Width = o.Width / 100;
                            newNode.Height = o.Height / 100;

                            layer = this.layers[i];
                            pos = (i - dLayer) * step + oPos;
                            if (pos > layer.length) {
                                pos = layer.length;
                            }

                            if (oPos >= this.layers[oLayer].length - 1 && dPos >= this.layers[dLayer].length - 1) {
                                pos = layer.length;
                            } else if (oPos === 0 && dPos === 0) {
                                pos = 0;
                            }

                            newNode.layer = i;
                            newNode.uBaryCenter = 0.0;
                            newNode.dBaryCenter = 0.0;
                            newNode.upstreamLinkCount = 0;
                            newNode.downstreamLinkCount = 0;
                            newNode.gridPosition = pos;
                            newNode.isVirtual = true;

                            layer.Insert(newNode, pos);

                            for (r = pos + 1; r < layer.length; r++) {
                                node = layer[r];
                                node.gridPosition = node.gridPosition + 1;
                            }

                            newLink = new TypeViz.Diagramming.Link(p, newNode);
                            newLink.depthOfDumminess = 0;
                            p = newNode;

                            this.graph.nodes.push(newNode);
                            this.graph.addLink(newLink);

                            newNode.index = this.graph.nodes.length - 1;
                            this.mapVirtualNode(newNode, link);
                        }

                        link.changeSource(p);
                        link.depthOfDumminess = oLayer - dLayer - 1;
                    }

                    if (oLayer - dLayer < -1) {
                        for (i = oLayer + 1; i < dLayer; i++) {
                            newNode = new TypeViz.Diagramming.Node();
                            newNode.X = o.X;
                            newNode.Y = o.Y;
                            newNode.Width = o.Width / 100;
                            newNode.Height = o.Height / 100;

                            layer = this.layers[i];
                            pos = (i - oLayer) * step + oPos;
                            if (pos > layer.length) {
                                pos = layer.length;
                            }

                            if (oPos >= this.layers[oLayer].length - 1 && dPos >= this.layers[dLayer].length - 1) {
                                pos = layer.length;
                            } else if (oPos === 0 && dPos === 0) {
                                pos = 0;
                            }

                            newNode.layer = i;
                            newNode.uBaryCenter = 0.0;
                            newNode.dBaryCenter = 0.0;
                            newNode.upstreamLinkCount = 0;
                            newNode.downstreamLinkCount = 0;
                            newNode.gridPosition = pos;
                            newNode.isVirtual = true;

                            pos &= pos;
                            layer.Insert(newNode, pos);

                            for (r = pos + 1; r < layer.length; r++) {
                                node = layer[r];
                                node.gridPosition = node.gridPosition + 1;
                            }

                            newLink = new TypeViz.Diagramming.Link(p, newNode);
                            newLink.depthOfDumminess = 0;
                            p = newNode;

                            this.graph.nodes.push(newNode);
                            this.graph.addLink(newLink);

                            newNode.index = this.graph.nodes.length - 1;
                            this.mapVirtualNode(newNode, link);
                        }

                        link.changeSource(p);
                        link.depthOfDumminess = dLayer - oLayer - 1;
                    }
                }
            };

            LayeredLayout.prototype._dedummify = function () {
                var dedum = true;
                while (dedum) {
                    dedum = false;

                    for (var l = 0; l < this.graph.links.length; l++) {
                        var link = this.graph.links[l];
                        if (link.depthOfDumminess === 0) {
                            continue;
                        }

                        var points = [];

                        points.Prepend({ x: link.target.X, y: link.target.Y });
                        points.Prepend({ x: link.source.X, y: link.source.Y });

                        var temp = link;
                        var depthOfDumminess = link.depthOfDumminess;
                        for (var d = 0; d < depthOfDumminess; d++) {
                            var node = temp.source;
                            var prevLink = node.incoming[0];

                            points.Prepend({ x: prevLink.source.X, y: prevLink.source.Y });

                            temp = prevLink;
                        }

                        link.changeSource(temp.source);

                        link.depthOfDumminess = 0;

                        if (points.length > 2) {
                            points.splice(0, 1);
                            points.splice(points.length - 1);
                            link.points = points;
                        } else {
                            link.points = [];
                        }

                        dedum = true;
                        break;
                    }
                }
            };

            LayeredLayout.prototype._optimizeCrossings = function () {
                var moves = -1, i;
                var maxIterations = 3;
                var iter = 0;

                while (moves !== 0) {
                    if (iter++ > maxIterations) {
                        break;
                    }

                    moves = 0;

                    for (i = this.layers.length - 1; i >= 1; i--) {
                        moves += this.optimizeLayerCrossings(false, i);
                    }

                    for (i = 0; i < this.layers.length - 1; i++) {
                        moves += this.optimizeLayerCrossings(true, i);
                    }
                }
            };

            LayeredLayout.prototype.calcUpData = function (layer) {
                if (layer === 0) {
                    return;
                }

                var considered = this.layers[layer], i, l, link;
                var upLayer = new TypeViz.Set();
                var temp = this.layers[layer - 1];
                for (i = 0; i < temp.length; i++) {
                    upLayer.Add(temp[i]);
                }

                for (i = 0; i < considered.length; i++) {
                    var node = considered[i];

                    var sum = 0;
                    var total = 0;

                    for (l = 0; l < node.incoming.length; l++) {
                        link = node.incoming[l];
                        if (upLayer.Contains(link.source)) {
                            total++;
                            sum += link.source.gridPosition;
                        }
                    }

                    for (l = 0; l < node.outgoing.length; l++) {
                        link = node.outgoing[l];
                        if (upLayer.Contains(link.target)) {
                            total++;
                            sum += link.target.gridPosition;
                        }
                    }

                    if (total > 0) {
                        node.uBaryCenter = sum / total;
                        node.upstreamLinkCount = total;
                    } else {
                        node.uBaryCenter = i;
                        node.upstreamLinkCount = 0;
                    }
                }
            };

            LayeredLayout.prototype.calcDownData = function (layer) {
                if (layer === this.layers.length - 1) {
                    return;
                }

                var considered = this.layers[layer], i, l, link;
                var downLayer = new TypeViz.Set();
                var temp = this.layers[layer + 1];
                for (i = 0; i < temp.length; i++) {
                    downLayer.Add(temp[i]);
                }

                for (i = 0; i < considered.length; i++) {
                    var node = considered[i];

                    var sum = 0;
                    var total = 0;

                    for (l = 0; l < node.incoming.length; l++) {
                        link = node.incoming[l];
                        if (downLayer.Contains(link.source)) {
                            total++;
                            sum += link.source.gridPosition;
                        }
                    }

                    for (l = 0; l < node.outgoing.length; l++) {
                        link = node.outgoing[l];
                        if (downLayer.Contains(link.target)) {
                            total++;
                            sum += link.target.gridPosition;
                        }
                    }

                    if (total > 0) {
                        node.dBaryCenter = sum / total;
                        node.downstreamLinkCount = total;
                    } else {
                        node.dBaryCenter = i;
                        node.downstreamLinkCount = 0;
                    }
                }
            };

            LayeredLayout.prototype.optimizeLayerCrossings = function (down, layer) {
                var iconsidered;
                var considered;

                if (down) {
                    considered = this.layers[iconsidered = layer + 1];
                } else {
                    considered = this.layers[iconsidered = layer - 1];
                }

                var presorted = considered.slice(0);

                if (down) {
                    this.calcUpData(iconsidered);
                } else {
                    this.calcDownData(iconsidered);
                }

                Array.prototype.sort.call(this, considered, function (n1, n2) {
                    var n1BaryCenter = this.calcBaryCenter(n1), n2BaryCenter = this.calcBaryCenter(n2);

                    if (Math.abs(n1BaryCenter - n2BaryCenter) < 0.0001) {
                        if (n1.degree() === n2.degree()) {
                            return this.compareByIndex(n1, n2);
                        } else if (n1.degree() < n2.degree()) {
                            return 1;
                        }
                        return -1;
                    }

                    var compareValue = (n2BaryCenter - n1BaryCenter) * 1000;
                    if (compareValue > 0) {
                        return -1;
                    } else if (compareValue < 0) {
                        return 1;
                    }
                    return this.compareByIndex(n1, n2);
                });

                var i, moves = 0;
                for (i = 0; i < considered.length; i++) {
                    if (considered[i] !== presorted[i]) {
                        moves++;
                    }
                }

                if (moves > 0) {
                    var inode = 0;
                    for (i = 0; i < considered.length; i++) {
                        var node = considered[i];
                        node.gridPosition = inode++;
                    }
                }

                return moves;
            };

            LayeredLayout.prototype._swapPairs = function () {
                var maxIterations = this.options.LayeredIterations;
                var iter = 0;

                while (true) {
                    if (iter++ > maxIterations) {
                        break;
                    }

                    var downwards = (iter % 4 <= 1);
                    var secondPass = (iter % 4 === 1);

                    for (var l = (downwards ? 0 : this.layers.length - 1); downwards ? l <= this.layers.length - 1 : l >= 0; l += (downwards ? 1 : -1)) {
                        var layer = this.layers[l];
                        var hasSwapped = false;

                        var calcCrossings = true;
                        var memCrossings = 0;

                        for (var n = 0; n < layer.length - 1; n++) {
                            var up = 0;
                            var down = 0;
                            var crossBefore = 0;

                            if (calcCrossings) {
                                if (l !== 0) {
                                    up = this.countLinksCrossingBetweenTwoLayers(l - 1, l);
                                }
                                if (l !== this.layers.length - 1) {
                                    down = this.countLinksCrossingBetweenTwoLayers(l, l + 1);
                                }
                                if (downwards) {
                                    up *= 2;
                                } else {
                                    down *= 2;
                                }

                                crossBefore = up + down;
                            } else {
                                crossBefore = memCrossings;
                            }

                            if (crossBefore === 0) {
                                continue;
                            }

                            var node1 = layer[n];
                            var node2 = layer[n + 1];

                            var node1GridPos = node1.gridPosition;
                            var node2GridPos = node2.gridPosition;
                            layer[n] = node2;
                            layer[n + 1] = node1;
                            node1.gridPosition = node2GridPos;
                            node2.gridPosition = node1GridPos;

                            up = 0;
                            if (l !== 0) {
                                up = this.countLinksCrossingBetweenTwoLayers(l - 1, l);
                            }
                            down = 0;
                            if (l !== this.layers.length - 1) {
                                down = this.countLinksCrossingBetweenTwoLayers(l, l + 1);
                            }
                            if (downwards) {
                                up *= 2;
                            } else {
                                down *= 2;
                            }
                            var crossAfter = up + down;

                            var revert = false;
                            if (secondPass) {
                                revert = crossAfter >= crossBefore;
                            } else {
                                revert = crossAfter > crossBefore;
                            }

                            if (revert) {
                                node1 = layer[n];
                                node2 = layer[n + 1];

                                node1GridPos = node1.gridPosition;
                                node2GridPos = node2.gridPosition;
                                layer[n] = node2;
                                layer[n + 1] = node1;
                                node1.gridPosition = node2GridPos;
                                node2.gridPosition = node1GridPos;

                                memCrossings = crossBefore;
                                calcCrossings = false;
                            } else {
                                hasSwapped = true;
                                calcCrossings = true;
                            }
                        }

                        if (hasSwapped) {
                            if (l !== this.layers.length - 1) {
                                this.calcUpData(l + 1);
                            }
                            if (l !== 0) {
                                this.calcDownData(l - 1);
                            }
                        }
                    }
                }
            };

            LayeredLayout.prototype.countLinksCrossingBetweenTwoLayers = function (ulayer, dlayer) {
                var i, crossings = 0;

                var upperLayer = new TypeViz.Set();
                var temp1 = this.layers[ulayer];
                for (i = 0; i < temp1.length; i++) {
                    upperLayer.Add(temp1[i]);
                }

                var lowerLayer = new TypeViz.Set();
                var temp2 = this.layers[dlayer];
                for (i = 0; i < temp2.length; i++) {
                    lowerLayer.Add(temp2[i]);
                }

                var dlinks = new TypeViz.Set();
                var links = [];
                var temp = [];

                upperLayer.ForEach(function (node) {
                    temp.AddRange(node.incoming);
                    temp.AddRange(node.outgoing);
                });

                for (var ti = 0; ti < temp.length; ti++) {
                    var link = temp[ti];

                    if (upperLayer.Contains(link.source) && lowerLayer.Contains(link.target)) {
                        dlinks.Add(link);
                        links.push(link);
                    } else if (lowerLayer.Contains(link.source) && upperLayer.Contains(link.target)) {
                        links.push(link);
                    }
                }

                for (var l1 = 0; l1 < links.length; l1++) {
                    var link1 = links[l1];
                    for (var l2 = 0; l2 < links.length; l2++) {
                        if (l1 === l2) {
                            continue;
                        }

                        var link2 = links[l2];

                        var n11, n12;
                        var n21, n22;

                        if (dlinks.Contains(link1)) {
                            n11 = link1.source;
                            n12 = link1.target;
                        } else {
                            n11 = link1.target;
                            n12 = link1.source;
                        }

                        if (dlinks.Contains(link2)) {
                            n21 = link2.source;
                            n22 = link2.target;
                        } else {
                            n21 = link2.target;
                            n22 = link2.source;
                        }

                        var n11gp = n11.gridPosition;
                        var n12gp = n12.gridPosition;
                        var n21gp = n21.gridPosition;
                        var n22gp = n22.gridPosition;

                        if ((n11gp - n21gp) * (n12gp - n22gp) < 0) {
                            crossings++;
                        }
                    }
                }

                return crossings / 2;
            };

            LayeredLayout.prototype.calcBaryCenter = function (node) {
                var upstreamLinkCount = node.upstreamLinkCount;
                var downstreamLinkCount = node.downstreamLinkCount;
                var uBaryCenter = node.uBaryCenter;
                var dBaryCenter = node.dBaryCenter;

                if (upstreamLinkCount > 0 && downstreamLinkCount > 0) {
                    return (uBaryCenter + dBaryCenter) / 2;
                }
                if (upstreamLinkCount > 0) {
                    return uBaryCenter;
                }
                if (downstreamLinkCount > 0) {
                    return dBaryCenter;
                }

                return 0;
            };

            LayeredLayout.prototype._gridPositionComparer = function (x, y) {
                if (x.gridPosition < y.gridPosition) {
                    return -1;
                }
                if (x.gridPosition > y.gridPosition) {
                    return 1;
                }
                return 0;
            };

            LayeredLayout.prototype._positionAscendingComparer = function (x, y) {
                return x.k < y.k ? -1 : x.k > y.k ? 1 : 0;
            };

            LayeredLayout.prototype._positionDescendingComparer = function (x, y) {
                return x.k < y.k ? 1 : x.k > y.k ? -1 : 0;
            };

            LayeredLayout.prototype._firstVirtualNode = function (layer) {
                for (var c = 0; c < layer.length; c++) {
                    if (layer[c].isVirtual) {
                        return c;
                    }
                }
                return -1;
            };

            LayeredLayout.prototype.compareByIndex = function (o1, o2) {
                var i1 = o1.index;
                var i2 = o2.index;

                if (i1 < i2) {
                    return 1;
                }

                if (i1 > i2) {
                    return -1;
                }

                return 0;
            };

            LayeredLayout.prototype.intDiv = function (numerator, denominator) {
                return (numerator - numerator % denominator) / denominator;
            };

            LayeredLayout.prototype.nextVirtualNode = function (layer, node) {
                var nodeIndex = node.layerIndex;
                for (var i = nodeIndex + 1; i < layer.length; ++i) {
                    if (layer[i].isVirtual) {
                        return layer[i];
                    }
                }
                return null;
            };
            return LayeredLayout;
        })(LayoutBase);
        Diagramming.LayeredLayout = LayeredLayout;

        var LayoutState = (function () {
            function LayoutState(diagram, graphOrNodes) {
                if (TypeViz.IsUndefined(diagram)) {
                    throw "No diagram given";
                }
                this.diagram = diagram;
                this.nodeMap = new Map();
                this.linkMap = new Map();
                this.capture(graphOrNodes ? graphOrNodes : diagram);
            }
            LayoutState.prototype.capture = function (diagramOrGraphOrNodes) {
                var node, nodes, shape, i, conn, link, links;

                if (diagramOrGraphOrNodes instanceof TypeViz.Diagramming.Graph) {
                    for (i = 0; i < diagramOrGraphOrNodes.nodes.length; i++) {
                        node = diagramOrGraphOrNodes.nodes[i];
                        shape = node.associatedShape;

                        this.nodeMap.Set(shape.visual.Native.id, new TypeViz.Rect(node.X, node.Y, node.Width, node.Height));
                    }
                    for (i = 0; i < diagramOrGraphOrNodes.links.length; i++) {
                        link = diagramOrGraphOrNodes.links[i];
                        conn = link.associatedConnection;
                        this.linkMap.Set(conn.visual.Native.id, link.points);
                    }
                } else if (diagramOrGraphOrNodes instanceof Array) {
                    nodes = diagramOrGraphOrNodes;
                    for (i = 0; i < nodes.length; i++) {
                        node = nodes[i];
                        shape = node.associatedShape;
                        if (shape) {
                            this.nodeMap.Set(shape.visual.Native.id, new TypeViz.Rect(node.X, node.Y, node.Width, node.Height));
                        }
                    }
                } else if (diagramOrGraphOrNodes.hasOwnProperty("links") && diagramOrGraphOrNodes.hasOwnProperty("nodes")) {
                    nodes = diagramOrGraphOrNodes.nodes;
                    links = diagramOrGraphOrNodes.links;
                    for (i = 0; i < nodes.length; i++) {
                        node = nodes[i];
                        shape = node.associatedShape;
                        if (shape) {
                            this.nodeMap.Set(shape.visual.Native.id, new TypeViz.Rect(node.X, node.Y, node.Width, node.Height));
                        }
                    }
                    for (i = 0; i < links.length; i++) {
                        link = links[i];
                        conn = link.associatedConnection;
                        if (conn) {
                            this.linkMap.Set(conn.visual.Native.id, link.points);
                        }
                    }
                } else {
                    var shapes = this.diagram.shapes;
                    var connections = this.diagram.connections;
                    for (i = 0; i < shapes.length; i++) {
                        shape = shapes[i];
                        this.nodeMap.Set(shape.visual.Native.id, shape.Rectangle);
                    }

                    for (i = 0; i < connections.length; i++) {
                        conn = connections[i];
                        this.linkMap.Set(conn.visual.Native.id, conn.Points);
                    }
                }
            };
            return LayoutState;
        })();
        Diagramming.LayoutState = LayoutState;
    })(TypeViz.Diagramming || (TypeViz.Diagramming = {}));
    var Diagramming = TypeViz.Diagramming;
})(TypeViz || (TypeViz = {}));
