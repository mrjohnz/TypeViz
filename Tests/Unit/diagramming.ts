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

    import Point = TypeViz.Point;
    import Markers = TypeViz.SVG.Markers; 

    QUnit.module("Diagramming tests");

    test("UndoRedoService basic", function () {
        // trying out a composite
        var ur = new TypeViz.Diagramming.UndoRedoService();
        var unit = new Task("Counting unit.");
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
        unit = new Task("Counting unit.");
        ur.Add(unit);
        ok(unit.Count == 1, "Unit was executed");
    });

    test("Basic tests", function () {
        var div = GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var found = document.getElementById('SVGRoot');
        ok(found != null, "The Diagram should add an <SVG/> element with name 'SVGRoot'.");
    });

    test("Adding shape tests", function () {
        var div = GetRoot();
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
        var div = GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var shape1 = AddShape(diagram, new Point(100, 120), TypeViz.Diagramming.Shapes.SequentialData);
        shape1.Width = 80;
        shape1.Height = 80;
        shape1.Title = "Sequential Data.";
        var shape2 = AddShape(diagram, new TypeViz.Point(100, 400));
        var shape3 = AddShape(diagram, new TypeViz.Point(370, 400), TypeViz.Diagramming.Shapes.Wave);
        var topCor = shape2.GetConnector("Top");
        var topCor2 = shape3.GetConnector("Top");
        var bottomCor = shape1.GetConnector("Bottom");
        var con = AddConnection(diagram, bottomCor, topCor);
        con.EndCap = TypeViz.SVG.Markers.ArrowStart;
        con.StartCap = TypeViz.SVG.Markers.FilledCircle;
        var con2 = AddConnection(diagram, bottomCor, topCor2);
        con2.Content = "Connection Label";
        ok(topCor.Connections.length == 1, "Shape2#Top should have one connection.");
        ok(bottomCor.Connections.length == 2, "Shape1#Bottom should have two connections.");
    });

    
    //asyncTest("Checking shape properties", function ()
    //{
    //    var div = GetRoot();
    //    var diagram = new Diagram.Diagram(div);
    //    var loader = new Diagram.RDImporter(diagram);
    //    var url = "/SampleDiagrams/TwoShapes.xml";
    //    loader.LoadURL(url, null, p => {

    //        ok(p.ShapeProperties.length == 2);

    //        var props1 = p.ShapeProperties[0];
    //        equal(props1.id, "10df2022-7bf2-4ed1-a066-df0f86f07721");
    //        equal(props1.stroke, "#AB6200");
    //        equal(props1.fill, "#F19720");
    //        equal(props1.height, 100);
    //        equal(props1.geometry, "M14.248657,39.417725C14.248657,39.417725 14,29.667244 21.3302,24.000578 28.663574,18.333912 39.328003,20.250563 39.328003,20.250563 39.328003,20.250563 43.494385,0.5 63.741943,0.5 82.739746,0.5 87.655762,19.750601 87.655762,19.750601 87.655762,19.750601 100.32007,16.000544 108.31909,24.750582 114.66797,31.695599 112.90283,40.4174 112.90283,40.4174 112.90283,40.4174 123.16272,45.471794 120.81873,58.500729 117.81824,75.179268 98.904663,74.25106 98.904663,74.25106L18.581177,74.25106C18.581177,74.25106 0.5,73.084129 0.5,57.750725 0.5,42.417324 14.248657,39.417725 14.248657,39.417725z");
    //        equal(props1.position.x, 456.166564941406);
    //        equal(props1.position.y, 133.286482493083);

    //        var props2 = p.ShapeProperties[1];
    //        equal(props2.id, "b814191b-82ab-4d3b-9cef-fbed99077fa8");
    //        equal(props2.stroke, "#517464");
    //        equal(props2.fill, "#84BAA2");
    //        equal(props2.height, 135);
    //        equal(props2.width, 260);
    //        equal(props2.geometry, "M40,0.5L51.13,17.24 71.7,15.15 64.99,33.92 79.5,48.08 60.02,54.78 57.59,74.5 40,64.07 22.41,74.5 19.98,54.78 0.5,48.08 15.01,33.92 8.3,15.15 28.87,17.24z");
    //        equal(props2.position.x, 427);
    //        equal(props2.position.y, 260.166666666667);
    //        start();
    //    });
    //});
    //asyncTest("Checking connection properties", function ()
    //{
    //    var div = GetRoot();
    //    var diagram = new Diagram.Diagram(div);
    //    var loader = new Diagram.RDImporter(diagram);
    //    var url = "/SampleDiagrams/SomeConnections.xml";
    //    loader.LoadURL(url, null, p => {

    //        ok(p.ConnectionProperties.length == 2);

    //        var props1 = p.ConnectionProperties[0];
    //        equal(props1.id, "39eae3c9-98b3-4437-868c-86bd4586d0df");
    //        equal(props1.stroke, "#005011");
    //        //equal(props1.source, "c3c55cfb-80c8-4c61-bf86-0e5c3af41b17");
    //        //equal(props1.target, "90767bed-685e-4083-9e82-bd682a789488");

    //        var props2 = p.ConnectionProperties[1];
    //        equal(props2.id, "acf6bb8a-315a-4eac-87a9-12ec71ba2b2f");
    //        equal(props2.stroke, "#888888");

    //        start();
    //    });
    //});

}
