/// <reference path="qunit.d.ts" />
/// <reference path="common.ts" />
///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Diagramming.ts' />
///<reference path='../../src/Diagramming.Graph.ts' />
///<reference path='../../src/Diagramming.Layout.ts' />
var UnitTests;
(function (UnitTests) {
    var Range = TypeViz.Maths.Range;
    var Point = TypeViz.Point;
    var Matrix = TypeViz.SVG.Matrix;

    /*-----------Math tests------------------------------------*/
    QUnit.module("Maths tests");

    test("Factorial", function () {
        ok(TypeViz.Maths.Factorial(6) == 720);
        ok(TypeViz.Maths.Factorial(16) == 20922789888000);
        ok(TypeViz.Maths.Factorial(46) == 5502622159812088949850305428800254892961651752960000000000);
    });

    test("Sterling", function () {
        ok(TypeViz.Maths.LogFactorial(6).toPrecision(6) == 6.57925);
        ok(TypeViz.Maths.LogFactorial(16).toPrecision(6) == 30.6719);
    });

    test("Sin", function () {
        ok(TypeViz.Maths.Sin([1, 5, 7, 4, -4]).length == 5);
        ok(TypeViz.Maths.Sin(TypeViz.Maths.RangeValues(1, 5)).length == 5);
        ok(TypeViz.Maths.Sin(TypeViz.Maths.Pi / 2) == 1);
    });

    test("Range test", function () {
        var r = new Range(10, 20);
        ok(r.length == 11, "Should have length 10.");
        r = new Range(10, 20, 2);
        ok(r.length == 6, "Should have length 5.");
        r = new Range(20, 10, -2);
        ok(r.length == 6, "Should have length 5.");
        r = new Range(10, 20, .5);
        ok(r.length == 21, "Should have length 20.");
    });

    test("Is integer", function () {
        ok(TypeViz.IsInteger(4));
        ok(TypeViz.IsInteger(4854.0));
        ok(!TypeViz.IsInteger(4.70));
        ok(TypeViz.IsInteger(-88));
        ok(!TypeViz.IsInteger(-.54));
        ok(TypeViz.IsInteger(0.0));
    });

    test("Matrix calculus", function () {
        var m = Matrix.Parse("matrix(1,2,3,4,5,6)");
        ok(m != null);
        ok(m.a == 1);
        ok(m.b == 2);
        ok(m.c == 3);
        ok(m.d == 4);
        ok(m.e == 5);
        ok(m.f == 6);

        m = Matrix.Parse("matrix(1 2 3 4 5 6)");
        ok(m != null);
        ok(m.a == 1);
        ok(m.b == 2);
        ok(m.c == 3);
        ok(m.d == 4);
        ok(m.e == 5);
        ok(m.f == 6);

        m = Matrix.Parse("(1,2,3,4,5,6)");
        ok(m != null);
        ok(m.a == 1);
        ok(m.b == 2);
        ok(m.c == 3);
        ok(m.d == 4);
        ok(m.e == 5);
        ok(m.f == 6);

        m = TypeViz.SVG.Matrix.Parse("1,2,3,4,5,6");
        ok(m != null);
        ok(m.a == 1);
        ok(m.b == 2);
        ok(m.c == 3);
        ok(m.d == 4);
        ok(m.e == 5);
        ok(m.f == 6);

        m = TypeViz.SVG.Matrix.FromList([1, 2, 3, 4, 5, 6]);
        ok(m != null);
        ok(m.a == 1);
        ok(m.b == 2);
        ok(m.c == 3);
        ok(m.d == 4);
        ok(m.e == 5);
        ok(m.f == 6);

        m = TypeViz.SVG.Matrix.Translation(55, 66);
        ok(m != null);
        ok(m.a == 1);
        ok(m.b == 0);
        ok(m.c == 0);
        ok(m.d == 1);
        ok(m.e == 55);
        ok(m.f == 66);

        m = TypeViz.SVG.Matrix.Scaling(478, 2.5);
        ok(m != null);
        ok(m.a == 478);
        ok(m.b == 0);
        ok(m.c == 0);
        ok(m.d == 2.5);
        ok(m.e == 0);
        ok(m.f == 0);

        m = TypeViz.SVG.Matrix.FromMatrixVector(new TypeViz.SVG.MatrixVector(66, 55, 44, 33, 22, 11));
        ok(m != null);
        ok(m.a == 66);
        ok(m.b == 55);
        ok(m.c == 44);
        ok(m.d == 33);
        ok(m.e == 22);
        ok(m.f == 11);

        var a = TypeViz.SVG.Matrix.FromList([2.3, 4, 5, 0.6, 8.7, 7.01]);
        var b = TypeViz.SVG.Matrix.FromList([24.2, 48, 1, 0, 0, 71]);
        m = a.Times(b);
        ok(m != null);
        ok(m.a == 295.65999999999997);
        ok(m.b == 125.6);
        ok(m.c == 2.3);
        ok(m.d == 4);
        ok(m.e == 363.7);
        ok(m.f == 49.61);

        a = TypeViz.SVG.Matrix.Parse("Matrix(2.3, 4, 5, 0.6, 8.7, 7.01)");
        b = TypeViz.SVG.Matrix.Parse("matrix(24.2, 48, 1, 0, 0, 71)");
        m = a.Times(b);
        ok(m != null);
        ok(m.a == 295.65999999999997);
        ok(m.b == 125.6);
        ok(m.c == 2.3);
        ok(m.d == 4);
        ok(m.e == 363.7);
        ok(m.f == 49.61);
    });

    test("Interpolate", function () {
        var P = Point;
        var interpolate = TypeViz.SVG.Interpolate({
            Interpolator: TypeViz.SVG.Interpolators.LineStepInterpolator,
            IsClosed: true
        });
        var lineData = interpolate([new P(1, 2), new P(4, 5)]);
        ok(true);
    });

    test("Random integer array", function () {
        var ar = TypeViz.Maths.RandomIntegerArray();
        ok(ar != null);
    });

    test("Lerp", function () {
        var lerp = TypeViz.Maths.Lerp(0, 100);
        ok(lerp(0.5) == 50);

        lerp = TypeViz.Maths.Lerp([0.2, 5, 12.8], [0.8, -1.12, 0]);
        console.log(lerp(0.5));
    });
})(UnitTests || (UnitTests = {}));
//# sourceMappingURL=maths.js.map
