/**
Copyright (c) 2007-2014, Orbifold bvba.
For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/
/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="SVG.ts" />
/// <reference path="Animation.ts" />
var TypeViz;
(function (TypeViz) {
    (function (Arrays) {
        /**
        * Returns a function which interpolates between the given arrays.
        */
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
//# sourceMappingURL=Arrays.js.map
