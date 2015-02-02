/// <reference path="qunit.d.ts" />
/// <reference path="common.ts" />
///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Diagramming.ts' />
module UnitTests {

    import Range = TypeViz.Maths.Range;
    QUnit.module("Arrays tests");

    test("Ascending", function () {
        var ar: Array<number> = new Range(10, 100).Values;
        ar = ar.Shuffle();
        ar.sort(TypeViz.AscendingComparer);
        var shouldbe = new Range(10, 100).Values;
        ok(ar.SameAs(shouldbe), ar.Pretty());
    });

    test("Take", function () {
        var ar: Array<number> = new Range(1, 100).Values;
        var some = ar.Take(10);
        var shouldbe = new Range(1, 10).Values;
        ok(some.SameAs(shouldbe));
        some = ar.Take(20, 30);
        shouldbe = new Range(21, 30).Values;
        ok(some.SameAs(shouldbe));
        some = TypeViz.Arrays.Take(ar, 8);
        ok(some.length == 8);
    });

    test("Min", function () {
        var ar = new Range(10, 100).Values;
        ar = ar.Shuffle();
        var min = ar.Min();
        ok(min == 10);
        ar = [-44, 0, 12, 128];
        ok(ar.Min() == -44);
        var peops = [{ name: "Swa", age: 45 }, { name: "Ian", age: 55 }];
        min = peops.Min(function (d) {
            return d.age;
        });
        ok(min == 45);
    });

    test("Max", function () {
        var ar = new Range(10, 100).Values;
        ar = ar.Shuffle();
        var max = ar.Max();
        ok(max == 100);
        ar = [-44, 0, 12, 128];
        ok(ar.Max() == 128);
        var peops = [{ name: "Swa", age: 45 }, { name: "Ian", age: 55 }];
        max = peops.Max(function (d) {
            return d.age;
        });
        ok(max == 55);
    });

    test("Sum", function () {
        var ar = new Range(0, 100).Values;
        ar = ar.Shuffle();
        var max = ar.Sum();
        ok(max == 5050);
        ar = [-40, 0, 20, 128];
        ok(ar.Sum() == 108);
        var peops = [{ name: "Swa", age: 45 }, { name: "Ian", age: 55 }];
        max = peops.Sum(function (d) {
            return d.age;
        });
        ok(max == 100);
    });

    test("Distinct", function () {
        var ar = [1, 2, 1, 3, 5, 4, 4];
        var d = ar.Distinct();
        ok(d.length == 5, "Should have been reduced to distinct elements.");
    });

    test("Has property", function () {
        var ar = [1, 7, 8, 11];
        ar["name"] = "Geri";
        ok(ar.HasProperty("name"));
        ok(!ar.HasProperty("age"));

        var obj = { name: "Geri", age: 66 };
        ok(obj.HasProperty("name"));
    });

    test("Add", function () {
        var ar = [3, 4, 7];
        ar.Add(33).Add(44).Add(55);
        ar.Add(66, 77, 88);
        ok(ar.Contains(33));
        ok(ar.Contains(44));
        ok(ar.Contains(55));
        ok(ar.Contains(66));
        ok(ar.Contains(77));
        ok(ar.Contains(88));

    });

    test("Any", function () {
        // mixed array
        var a = new Range(1, 15).Values;
        ok(a.Any());
        a.Add("A", "B", "C", null);
        ok(a.Any(function (x) {
            return x == 'C';
        }), 'Should find element C in the array.');
        ok(!a.Any(function (x) {
            return x == 'S4';
        }), 'Should find element C in the array.');
        a.Clear();
        ok(!a.Any());
    });

    test("ForEach", function () {
        var a = new Range(0, 100).Values;
        var sum = 0;
        a.ForEach(function (x) { sum += x; });
        ok(sum == 5050);
        var ar = [1, 2, , 3];
        sum = 0;
        ar.ForEach(function (x) { sum += x; });
        ok(sum == 6);

        var answers = [];
        [1, 2, 3].ForEach(function (num) { answers.push(num * this.multiplier); }, { multiplier: 5 });
        equal(answers.join(', '), '5, 10, 15', 'context object property accessed');
    });

    test("Flatten", function () {
        var list = [1, [2], [3, [[[4]]]]];
        deepEqual(list.Flatten(false), [1, 2, 3, 4], 'can flatten nested arrays');
        deepEqual(list.Flatten(true), [1, 2, 3, [[[4]]]], 'can shallowly flatten nested arrays');
        var result = [1, [2], [3, [[[4]]]]].Flatten(false);
        deepEqual(result, [1, 2, 3, 4], 'works on an arguments object');
        list = [[1], [2], [3], [[4]]];
        deepEqual(list.Flatten(true), [1, 2, 3, [4]], 'can shallowly flatten arrays containing only other arrays');
    });

    test("IndexOf", function () {
        var ar = [4, 8, 7, 13];
        equal(ar.IndexOf(7), 2);
        equal(ar.IndexOf(147), -1);
    });

    test("Extent", function () {
        var ar = [4, -2, 7, 88];
        var ex = ar.Extent();
        deepEqual(ex, [-2, 88]);
        var objs = [{ name: "Geri", age: 66 }, { name: "Swa", age: 6 }];
        var exx = objs.Extent(function (d) { return d.age; });
        deepEqual(exx, [6, 66]);
    });

    test("Entries", function () {
        var obj = { address: "Kardinaalstraat", city: "Leuven", country: "Belgium" };
        var entries = TypeViz.Arrays.Entries(obj);
        equal(entries.length, 4);
        equal(entries[1].value, "Leuven");
        var ar = [];
        ar["date"] = "Monday";
        entries = TypeViz.Arrays.Entries(ar);
        equal(entries[0].value, "Monday");
        equal(entries[0].key, "date");
    });

    test("Bisect", function () {
        var bisect = TypeViz.Arrays.BisectLeft;
        var array = [1, 2, 3];
        equal(bisect(array, 1), 0);
        equal(bisect(array, 2), 1);
        equal(bisect(array, 3), 2);

        equal(bisect(array, 0.5), 0);
        equal(bisect(array, 1.5), 1);
        equal(bisect(array, 2.5), 2);
        equal(bisect(array, 3.5), 3);

        array = [1, 2, 2, 3];
        equal(bisect(array, 1), 0);
        equal(bisect(array, 2), 1);
        equal(bisect(array, 3), 3);

        array = [1, 2, 3, 4, 5];
        equal(bisect(array, 0, 2), 2);
        equal(bisect(array, 1, 2), 2);
        equal(bisect(array, 2, 2), 2);
        equal(bisect(array, 3, 2), 2);
        equal(bisect(array, 4, 2), 3);
        equal(bisect(array, 5, 2), 4);
        equal(bisect(array, 6, 2), 5);

        array = [1, 2, 3, 4, 5];
        equal(bisect(array, 0, 2, 3), 2);
        equal(bisect(array, 1, 2, 3), 2);
        equal(bisect(array, 2, 2, 3), 2);
        equal(bisect(array, 3, 2, 3), 2);
        equal(bisect(array, 4, 2, 3), 3);
        equal(bisect(array, 5, 2, 3), 3);
        equal(bisect(array, 6, 2, 3), 3);

        bisect = TypeViz.Arrays.BisectRight;

        array = [1, 2, 3];
        equal(bisect(array, 1), 1);
        equal(bisect(array, 2), 2);
        equal(bisect(array, 3), 3);

        array = [1, 2, 2, 3];
        equal(bisect(array, 1), 1);
        equal(bisect(array, 2), 3);
        equal(bisect(array, 3), 4);

        array = [1, 2, 3];
        equal(bisect(array, 0.5), 0);
        equal(bisect(array, 1.5), 1);
        equal(bisect(array, 2.5), 2);
        equal(bisect(array, 3.5), 3);

        array = [1, 2, 3, 4, 5];
        equal(bisect(array, 0, 2), 2);
        equal(bisect(array, 1, 2), 2);
        equal(bisect(array, 2, 2), 2);
        equal(bisect(array, 3, 2), 3);
        equal(bisect(array, 4, 2), 4);
        equal(bisect(array, 5, 2), 5);
        equal(bisect(array, 6, 2), 5);

        array = [1, 2, 3, 4, 5];
        equal(bisect(array, 0, 2, 3), 2);
        equal(bisect(array, 1, 2, 3), 2);
        equal(bisect(array, 2, 2, 3), 2);
        equal(bisect(array, 3, 2, 3), 3);
        equal(bisect(array, 4, 2, 3), 3);
        equal(bisect(array, 5, 2, 3), 3);
        equal(bisect(array, 6, 2, 3), 3);
    });

    test("Shuffle", function () {
        // not bulletproof but unlikely that Shffule keeps a large array anywhere the same
        var ar = TypeViz.Maths.RangeValues(1, 1000);
        ar = ar.Shuffle();
        notEqual(ar[0], 1);
        notEqual(ar[99], 100);
    });

    test("SameAs", function () {
        var ar: any[] = [4, "e", -12, null];
        console.log(ar.Pretty());
        ok(ar.SameAs([4, "e", -12, null]));
        ok(!ar.SameAs([4, "ker", -12, null]));
        ar = TypeViz.Maths.RangeValues(1, 10);
        ok(ar.SameAs([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
        ar = [1, [[3]]];
        ok(ar.Flatten().SameAs([1, 3]));
    });

    test("Zip", function () {
        var zip = [11, 12, 13].Zip([1, 2, 3]);
        equal(zip.length, 3);

        ok(zip[0].SameAs([11, 1]));
        zip = [11, 12, 13, 14].Zip([1, 2, 3]);
        equal(zip.length, 3);
        ok(zip[1].SameAs([12, 2]));
        zip = [13, 14].Zip([1]);
        equal(zip.length, 1);
        ok(zip[0].SameAs([13, 1]));
    });

    test("Filter", function () {

        var ar = TypeViz.Maths.RangeValues(1, 100);
        function isOdd(x) { return x % 2 !== 0; };
        var odd = ar.Filter(isOdd);
        equal(odd.length, 50);
        equal(odd[3], 7);
    });

    test("All", function () {
        function isOdd(x) { return x % 2 !== 0; };
        var ar = TypeViz.Maths.RangeValues(1, 100, 2);
        ok(ar.All(isOdd));
        function larger(x) { return x <= 15; };
        ok(ar.Any(larger));
        ok(!ar.All(larger));
    });

    test("Pop", function () {
        var ar = [5, 47, 108];
        var a = ar.Pop();
        equal(a, 108);
        ok(ar.length == 2);
        ar = [];
        a = ar.Pop();
        ok(a == null);
    });

    test("HasProperty", function () {
        var o = { "prop": "exists" };
        ok(o.hasOwnProperty('prop'));
        ok(!o.hasOwnProperty('toString'));
        ok(!o.hasOwnProperty('hasOwnProperty'));
    });

    test("Fold", function () {
        var sum = [2, 3, 2].Fold(function (memo, num) { return memo + num; }, 0);
        equal(sum, 7);
        var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function (a, b) {
            return a.concat(b);
        });
        ok(flattened.SameAs([0, 1, 2, 3, 4, 5]));
    });

    test("Map", function () {
        var sum = [2, "e", 3, 5, -5].Map(function (x) { return 1; }).Sum();
        equal(sum, 5);
        var mapped = [1, 2, 3].Map(function (x) { return x * x; });
        ok(mapped.SameAs([1, 4, 9]));
    });

    test("First", function () {
        var first = [11008, -21254, 33].First();
        equal(first, 11008);
        first = ["r", "try", "trip", "xul", "t"];
        var t = first.First(function (x) { return x.indexOf("t")===0; });
        equal(t, "try");

    });

    test("Insert", function () {
        var ar = [1, 3];
        ar = ar.Insert(2, 1);
        ok(ar.SameAs([1, 2, 3]));
        ar = ar.Insert(4, 13);
        ok(ar.SameAs([1, 2, 3, 4]));
        ar = ar.Insert(5, -2);
        ok(ar.SameAs([1, 2, 5, 3, 4]));
    });

    test("Prepend", function () {
        var ar = [1, 2];
        ar = ar.Prepend(0);
        ok(ar.SameAs([0, 1, 2]));
        ar = ar.Prepend(-1, -2, -3);
        ok(ar.SameAs([-3, -2, -1, 0, 1, 2]));
    });

    test("Bisort", function () {
        var a = [2, 1, 3];
        var b = ["b", "a", "c"];
        TypeViz.BiSort(a, b);
        ok(a.SameAs([1, 2, 3]));
        ok(b.SameAs(["a", "b", "c"]));
    });

    test("Reverse", function () {
        ok([1, 2, 3].Reverse().SameAs([3, 2, 1]));
    });

    test("Initialize", function () {
        var ar = [].Initialize(5, 12);
        equal(ar.length, 12);
        ok(ar.All(function (x) { return x == 5;}));
    });

    test("Merge", function () {
        var ar = [1, 2, 3].Merge([4, 5]);
        ok(ar.SameAs([1,2,3,4,5]));
    });
}
