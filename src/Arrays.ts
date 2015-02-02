/** 
    Copyright (c) 2007-2014, Orbifold bvba.
 
    For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/

/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="SVG.ts" />
/// <reference path="Animation.ts" />
module TypeViz {
    export module Arrays {
        /**
         * Returns a function which interpolates between the given arrays.
         */
        export function InterpolateArrays(a: any[], b: any[]) {
            var x = [],
                c = [],
                na = a.length,
                nb = b.length,
                n0 = Math.min(a.length, b.length),
                i;
            for (i = 0; i < n0; ++i) x.push(Maths.Lerp(a[i], b[i]));
            for (; i < na; ++i) c[i] = a[i];
            for (; i < nb; ++i) c[i] = b[i];
            return function (t) {
                for (i = 0; i < n0; ++i) c[i] = x[i](t);
                return c;
            };
        }

        export function Take(array, fromOrAmount:number, to:number = null) {
            return array.Take(fromOrAmount, to);
        }

        export function Entries(map) {
            var entries = [];
            for (var key in map) entries.push({ key: key, value: map[key] });
            return entries;
        }

        export function Keys(map) {
            var keys = [];
            for (var key in map) keys.push(key);
            return keys;
        }

        export function Bisector(f?) {
            if (TypeViz.IsUndefined(f)) f = TypeViz.Identity;
            return {
                Left: function (a, x, lo?, hi?) {
                    if (lo == null) lo = 0;
                    if (hi == null) hi = a.length;
                    while (lo < hi) {
                        var mid = lo + hi >>> 1;
                        if (f.call(a, a[mid], mid) < x) lo = mid + 1;
                        else hi = mid;
                    }
                    return lo;
                },
                Right: function (a, x, lo?, hi?) {
                    if (lo == null) lo = 0;
                    if (hi == null) hi = a.length;
                    while (lo < hi) {
                        var mid = lo + hi >>> 1;
                        if (x < f.call(a, a[mid], mid)) hi = mid;
                        else lo = mid + 1;
                    }
                    return lo;
                }
            };
        }

        export var Bisect = Bisector().Right;
        export var BisectRight = Bisect;
        export var BisectLeft = Bisector().Left;

    }
}