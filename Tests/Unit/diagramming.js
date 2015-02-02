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
    var Point = TypeViz.Point;

    QUnit.module("Diagramming tests");

    test("UndoRedoService basic", function () {
        // trying out a composite
        var ur = new TypeViz.Diagramming.UndoRedoService();
        var unit = new UnitTests.Task("Counting unit.");
        ur.begin();
        ur.AddCompositeItem(unit);
        ur.commit();
        ok(unit.Count == 1, "Unit was executed");
        ur.Undo();
        ok(ur.count() > 0, "The units are still there.");
        QUnit.equal(unit.Count, 0, "Unit undo was executed");
        ur.Redo();
        ok(unit.Count == 1, "Unit was executed");
        QUnit.raises(function () {
            ur.Redo();
        }, "Supposed to raise an exception since we are passed the length of the stack.");
        ur.Undo();
        ok(unit.Count == 0, "Unit was executed");

        // immediate addition
        ur = new TypeViz.Diagramming.UndoRedoService();
        unit = new UnitTests.Task("Counting unit.");
        ur.Add(unit);
        ok(unit.Count == 1, "Unit was executed");
    });

    test("Basic tests", function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var found = document.getElementById('SVGRoot');
        ok(found != null, "The Diagram should add an <SVG/> element with name 'SVGRoot'.");
    });

    test("Adding shape tests", function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var shape = TypeViz.Diagramming.Shapes.Rectangle;
        shape.Position = new Point(100, 120);
        shape.Width = 200;
        shape.Height = 100;
        shape.Id = "TestShape";
        shape.Background = "#778899";
        diagram.AddShape(shape);
        var found = document.getElementById("TestShape");
        ok(found != null, "A SVG shape with name 'TestShape' should be in the HTML tree.");

        //ok(found.attributes["x"].value == 100 && found.attributes["y"].value == 120, "Should be located at (100,120).");
        //ok(found.attributes["width"].value == 155 && found.attributes["height"].value == 233, "Should have size (155,233).");
        //ok(found.style.fill == "#ed54ff", "Should have fill '#ED54FF'.");
        ok(diagram.Shapes.length == 1, "Items count should be incremented.");
        var item = diagram.Shapes[0];
        ok(item.Connectors.length == 4, "Item should have two connectors.");
        ok(item.Id == "TestShape", "The Id should be passed across the hierarchy.");
        item.IsVisible = false;
        ok(found.attributes["visibility"].value == "hidden", "The visibility should be 'collapsed' now.");
        item.IsVisible = true;
        ok(found.attributes["visibility"].value == "visible", "The visibility should be 'visible' now.");
        item.IsSelected = true;

        var shape2 = TypeViz.Diagramming.Shapes.Rectangle;
        shape2.Position = new Point(350, 120);
        shape2.Width = 200;
        shape2.Height = 100;
        shape2.Id = "TestShape";
        shape2.Background = "#778899";
        diagram.AddShape(shape2);
        diagram.Shapes[1].IsSelected = true;
    });

    test("Adding connections", function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var shape1 = UnitTests.AddShape(diagram, new Point(100, 120), TypeViz.Diagramming.Shapes.SequentialData);
        shape1.Width = 80;
        shape1.Height = 80;
        shape1.Title = "Sequential Data.";
        var shape2 = UnitTests.AddShape(diagram, new TypeViz.Point(100, 400));
        var shape3 = UnitTests.AddShape(diagram, new TypeViz.Point(370, 400), TypeViz.Diagramming.Shapes.Wave);
        var topCor = shape2.GetConnector("Top");
        var topCor2 = shape3.GetConnector("Top");
        var bottomCor = shape1.GetConnector("Bottom");
        var con = UnitTests.AddConnection(diagram, bottomCor, topCor);
        con.EndCap = TypeViz.SVG.Markers.ArrowStart;
        con.StartCap = TypeViz.SVG.Markers.FilledCircle;
        var con2 = UnitTests.AddConnection(diagram, bottomCor, topCor2);
        con2.Content = "Connection Label";
        ok(topCor.Connections.length == 1, "Shape2#Top should have one connection.");
        ok(bottomCor.Connections.length == 2, "Shape1#Bottom should have two connections.");
    });
})(UnitTests || (UnitTests = {}));
//# sourceMappingURL=diagramming.js.map
