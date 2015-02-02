/// <reference path="qunit.d.ts" />
/// <reference path="common.ts" />
///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Diagramming.ts' />
var UnitTests;
(function (UnitTests) {
    var Stats = TypeViz.Maths.Statistics;
    var Maths = TypeViz.Maths;
    QUnit.module("Statistics tests");

    test("Normal", function () {
        var r = TypeViz.Maths.Statistics.RandomVariable(TypeViz.Maths.Statistics.NormalDistribution(5, 0.1));
        var arr = r(8);
        ok(arr.length == 8);
    });

    test("Normal Distribution", function () {
        var rand = Stats.RandomVariable(Stats.NormalDistribution());
        var r = Maths.Range.Create(1, 100).Values.map(function (i) {
            return rand();
        });
        ok(r.length == 100);
        ok(true, "Have to think about how to unit test the normal distribution...");
    });

    test("White random", function () {
        var r = Stats.RandomVariable();
        var ar = r(20);
        ok(ar.length == 20);
    });
})(UnitTests || (UnitTests = {}));
//# sourceMappingURL=statistics.js.map
