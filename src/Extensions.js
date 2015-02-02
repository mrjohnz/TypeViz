/// <reference path="Globals.ts" />
/// <reference path="Animation.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="SVG.ts" />
/// <reference path="Arrays.ts" />



/*
******************** Array API *************************************
*/
if (!Array.prototype.AddRange) {
    Array.prototype.AddRange = function (range) {
        for (var i = 0; i < range.length; i++) {
            this.push(range[i]);
        }
    };
}

/* Adds one or more items to the current array.*/
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

/*Returns whether the array owns the property*/
if (Array.prototype.HasProperty == null) {
    Array.prototype.HasProperty = function (property) {
        return Object.prototype.hasOwnProperty.call(this, property);
    };
}

/*Returns whether the Object owns the property*/
if (Object.prototype.HasProperty == null) {
    Object.prototype.HasProperty = Object.prototype.hasOwnProperty;
}

/*Iterates over the array elements.*/
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

// Determine whether all of the elements match a truth test.
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

// Flattens arrays
if (Array.prototype.Flatten == null) {
    function _flatten(input, shallow, output) {
        if (shallow && input.ForEach(TypeViz.IsArray)) {
            return Array.prototype.concat.apply(output, input);
        }
        input.ForEach(function (value) {
            /// <summary>gkjhkhkj</summary>
            /// <param name="value" type="Object"></param>
            if (TypeViz.IsArray(value) || TypeViz.IsArguments(value)) {
                shallow ? Array.prototype.push.apply(output, value) : _flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    }
    ;

    // Internal implementation of a recursive `flatten` function.
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
        /**
        Maps the given functional to each element of the array. See also the 'apply' method which accepts in addition some parameters.
        */
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
    // builtin some() needs a predicate, we want to work when there is none as well
    /*if (Array.prototype.some != null) {
    Array.prototype.Any = Array.prototype.some;
    }
    else*/
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
    /**
    * Inserts the given item at begin of array.
    */
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
    //why not just setting the variable to []? It causes problems if used as byref argument; it will be another object than the one passed.
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

/**
* Takes a number of items from the array.
*/
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
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
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
    /*Returns the interval [min, max] that the array defines.*/
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

        //for (var j = 0; j < r.length; j++) {
        //    this[j] = r[j];
        //}
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
//# sourceMappingURL=Extensions.js.map
