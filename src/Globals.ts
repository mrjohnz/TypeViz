/** 
    Copyright (c) 2007-2014, Orbifold bvba.
 
    For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/

module TypeViz {
    export var FUNCTION = "function";
    export var STRING = "string";
    export var VERSION = "0.1";

    /*Camel casing of the given string.*/
    export function Camelize(s) {
        var oStringList = s.split('-');
        if (oStringList.length == 1) return oStringList[0];

        var camelizedString = s.indexOf('-') == 0
            ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
            : oStringList[0];

        for (var i = 1, len = oStringList.length; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    }
    
    /*Returns true if the given object is neither null nor undefined.*/
    export function IsUndefined(obj) {
        return (typeof obj === 'undefined') || obj == null;
    };
    
    /*Returns whether the given object is a literal object.*/
    export function IsLiteral(obj) {
        var _test = obj;
        return (typeof obj !== 'object' || obj === null ?
            false :
            (
            (() => {
                while (true) {
                    if (Object.getPrototypeOf(_test = Object.getPrototypeOf(_test)) === null) {
                        break;
                    }
                }
                return Object.getPrototypeOf(obj) === _test;
            })()
            )
            );
    };
    
    /* Return a constant function if the argument is a value, otherwise the function itself is returned.*/
    export function Functor(v) {
        return typeof v === "function" ? v : function (d: any) {
            return v;
        };
    }

    export function ModelFunctor(v): IModelSubscriber {
        return typeof v === "function" ? v : (d: IModel) => v;
    }

    export function LimitValue(value, minimum = 0, maximum = 1) {
        if (value >= maximum) value = maximum;
        if (value <= minimum) value = minimum;
        return value;
    }

    /* The identity function.*/
    export function Identity(x: any) {
        return x;
    }

    export function TrueFunction() {
        return true;
    }

    export function AscendingComparer(a, b) {
        return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }
    /**
    * Sort the arrays on the basis of the first one (considered as keys and the other array as values).
    * @param sortfunc (optiona) sorting function for the values in the first array
    */
    export function BiSort(a, b, sortfunc?) {
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
    };

    export function rebind(target, source, ...stuff) {
        var i = -1, n = stuff.length, method;
        while (++i < n) target[method = stuff[i]] = rebindMethod(target, source, source[method]);
        return target;
    }

    /**Method is assumed to be a getter-setter:
     * If passed with no arguments, gets the value.
     * If passed with arguments, sets the value and returns the target.
     */
    export function rebindMethod(target, source, method) {
        return () => {
            var methodResult = method.apply(source, arguments);
            return methodResult === source ? target : methodResult;
        };
    }

    export function DescendingComparer(a, b) {
        return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    }

    export function IsDefined(obj) {
        return !(typeof obj === 'undefined') && obj !== null;
    };

    export function IsArray(obj) {
        return obj instanceof Array;
    };

    export function IsString(obj) {
        return (typeof obj) === "string";
    };

    export function IsObject(obj) {
        return obj === Object(obj);
    };

    export function IsNumber(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    }

    export function IsColor(obj) {
        return obj instanceof Media.Color;
    };

    export function IsGradient(obj) {
        return (obj instanceof Media.LinearGradient) || (obj instanceof Media.RadialGradient);
    };

    export function IsRadialGradient(obj) {
        return (obj instanceof Media.RadialGradient);
    };

    export function IsLinearGradient(obj) {
        return (obj instanceof Media.LinearGradient);
    };

    export function IsFunction(obj) {
        return obj instanceof Function;
    };

    export function IsArguments(obj) {
        return !!(obj && obj.HasProperty("callee"));
    };

    export function IsInteger(obj) {
        return IsNumber(obj) && obj % 1 === 0;
    };

    export function round(x, n) {
        return n
            ? Math.round(x * (n = Math.pow(10, n))) / n
            : Math.round(x);
    }

    export function deepExtend(destination, ...extenders) {
        var length = extenders.length;

        for (var i = 0; i < length; i++) {
            deepExtendOne(destination, extenders[i]);
        }

        return destination;
    }

    export function deepExtendOne(destination, source) {
        var
            property,
            propValue,
            propType,
            destProp;

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
    
    /* Hashing of a string.*/
    function hashString(s) {
        // see for example http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
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

    /* Returns a random identifier which can be used as an ID of objects, eventually augmented with a prefix.*/
    export function RandomId(length?) {
        if (IsUndefined(length)) {
            length = 10;
        }
        // old version return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
        var result = '';
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i = length; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    }

    /* Returns the hash of the object, string or number.*/
    export function Hash(key) {
        if (IsUndefined(key)) return null;
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
  

    /* Merges the default options with the given one and returns the result.*/
    export function MergeOptions(defaultOptions, givenOptions) {
        if (givenOptions == null) return defaultOptions;
        var r = {};
        for (var n in defaultOptions) {
            r[n] = givenOptions[n] != null ? givenOptions[n] : defaultOptions[n];
        }
        return r;
    }
    
    export function GetSVGRoot(): SVGSVGElement {
        return <SVGSVGElement>document.getElementsByTagName('svg')[0];
    }
} 