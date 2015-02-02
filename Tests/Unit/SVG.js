/// <reference path="qunit.d.ts" />
/// <reference path="common.ts" />
///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Structures.ts' />
///<reference path='../../src/Media.ts' />
///<reference path='../../src/Diagramming.ts' />
var UnitTests;
(function (UnitTests) {
    var SVG = TypeViz.SVG;
    var Canvas = TypeViz.SVG.Canvas;
    var CanvasOptions = TypeViz.SVG.CanvasOptions;
    var Marker = TypeViz.SVG.Marker;

    var Group = TypeViz.SVG.Group;
    var Line = TypeViz.SVG.Line;
    var MarkerOrientation = TypeViz.SVG.MarkerOrientation;
    var Rectangle = TypeViz.SVG.Rectangle;
    var PathBase = TypeViz.SVG.PathBase;
    var Translation = TypeViz.SVG.Translation;

    var Rotation = TypeViz.SVG.Rotation;
    var Markers = TypeViz.SVG.Markers;
    var Scale = TypeViz.SVG.Scale;
    var Point = TypeViz.Point;
    var Rect = TypeViz.Rect;
    var Color = TypeViz.Media.Color;
    var Colors = TypeViz.Media.Colors;

    QUnit.module("SVG tests");

    test("Add Circle", function () {
        var root = UnitTests.GetRoot();
        var canvas = new SVG.Canvas(root);

        var circ = new SVG.Circle();
        circ.Position = new Point(100, 121);
        circ.Radius = 150;
        circ.Background = "#345656";
        circ.Id = "MyCirc";
        circ.Position = new Point(200, 200);
        canvas.Append(circ);

        var found = document.getElementById("MyCirc");
        ok(found != null, "A SVG circle with name 'MyCirc' should be in the HTML tree.");
        ok(found.attributes["r"].value == 150, "The radius should be 150.");
        ok(found.attributes["cx"].value == 350, "The center X value should be 200+150.");
        ok(found.style.fill == "#345656");
    });

    test("Add Text", function () {
        var root = UnitTests.GetRoot();
        var canvas = new SVG.Canvas(root);

        var text = new SVG.TextBlock(canvas);
        text.Position = new Point(100, 121);
        text.Text = "<<|Manifold|>>";
        text.Id = "MyText";
        text.Position = new Point(234, 256);
        canvas.Append(text);

        var found = document.getElementById("MyText");
        ok(found != null, "A SVG text with name 'MyText' should be in the HTML tree.");
        ok(found.textContent == "<<|Manifold|>>", "The text should be '<< | Manifold | >>'.");
        ok(found.attributes["x"].value == 234, "The x should be 234.");
        ok(found.attributes["y"].value == 256, "The y should be 256.");
        text.Text = "changed";
        ok(found.textContent == "changed", "Text has changed :)");
    });

    test("Add group", function () {
        var root = UnitTests.GetRoot();
        var canvas = new SVG.Canvas(root);

        var g = new SVG.Group();
        g.Position = new Point(100, 100);
        g.Id = "G1";
        canvas.Append(g);

        var found = document.getElementById("G1");
        ok(found != null, "A SVG group with name 'G1' should be in the HTML tree.");
        /*   var rec = new SVG.Rectangle(canvas);
        rec.Width = 50;
        rec.Height = 50;
        rec.Background = "Red";
        rec.Id = "MyRectangle";
        g.Append(rec);*/
    });

    test("Clear group", function () {
        var root = UnitTests.GetRoot();
        var canvas = new SVG.Canvas(root);

        var g = new SVG.Group();
        for (var i = 0; i < 10; i++) {
            g.Append(new SVG.Rectangle());
        }
        equal(g.Native.childNodes.length, 10);
        g.Clear();
        equal(g.Native.childNodes.length, 0);
    });

    test("Add Canvas", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);
        var found = document.getElementById('SVGRoot');
        ok(found != null, "The Canvas should add an <SVG/> element with name 'SVGRoot'.");

        root = UnitTests.GetRoot();
        var options = new CanvasOptions();
        options.Width = 865;
        options.Height = 287;
        options.BackgroundColor = "#121217";
        canvas = new Canvas(root, options);
        var found = document.getElementById('SVGRoot');
        var svg = found;
        ok(parseFloat(svg.getAttribute("width")) == 865, "The width should be 865.");
        ok(parseFloat(svg.getAttribute("height")) == 287, "The height should be 287.");
        ok(found.style.backgroundColor == "rgb(18, 18, 23)");
    });

    test("Add Circle", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);

        var rec = new Rectangle(canvas);
        rec.Position = new Point(100, 121);
        rec.Width = 150;
        rec.Height = 88;
        rec.Background = "Red";
        rec.Id = "MyRectangle";

        canvas.Append(rec);

        var found = document.getElementById("MyRectangle");
        ok(found != null, "A SVG rectangle with name 'MyRectangle' should be in the HTML tree.");
        ok(found.attributes["width"].value == 150, "The width should be 150.");
        ok(found.attributes["height"].value == 88, "The height should be 287.");
        ok(found.style.fill == "#ff0000");
    });

    test("Add/Remove/Clear Marker", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);

        // add a dummy to check the defs tag is added as the first child
        UnitTests.AddCircle(canvas, new Point(100, 120));
        var marker = new Marker();
        marker.MarkerHeight = 21;
        marker.MarkerWidth = 44;
        marker.ViewBox = new Rect(10, 20, 33, 55);
        marker.Id = "ArrowHead";
        marker.Orientation = 0 /* Auto */;
        canvas.AddMarker(marker);
        var found = document.getElementById("ArrowHead");
        ok(found != null, "Marker element should be there.");
        ok(found.attributes["viewBox"] != null, "The viewBox should be there");
        ok(found.attributes["orient"] != null && found.attributes["orient"].value == "auto", "The orientation should be there");
        var path = new PathBase();
        path.Id = "SimpleDiagram";
        marker.Path = path;
        found = document.getElementById("SimpleDiagram");
        ok(found != null, "The path should be there.");
        path = new PathBase();
        path.Id = "Second";
        marker.Path = path;
        found = document.getElementById("Second");
        ok(found != null, "The second path should be there.");
        var m = document.getElementById("ArrowHead");
        ok(m.childNodes.length == 1, "The path should have been replaced.");
        var line = new Line();
        line.Id = "Line1";
        canvas.Append(line);
        line.MarkerEnd = marker;
        found = document.getElementById("Line1");
        ok(found.attributes["marker-end"] != null && found.attributes["marker-end"].value == "url(#ArrowHead)", "The end marker should be present.");
        var returnedMarker = line.MarkerEnd;
        ok(returnedMarker != null, "The marker was not found");
        ok(returnedMarker.Id == "ArrowHead", "Not the correct Id.");

        canvas.ClearMarkers();
        var defs = document.getElementsByTagName("defs");
        ok(defs != null && defs.length == 1, "Defs tag should still be there.");
        ok(defs[0].childNodes.length == 0, "All markers should be gone now.");

        canvas.Clear();
        var arrow = Markers.ArrowEnd;
        arrow.Id = "Arrow1";
        canvas.AddMarker(arrow);
        found = document.getElementById("Arrow1");
        ok(found != null, "Marker element should be there.");
        canvas.RemoveMarker(arrow);
        found = document.getElementById("Arrow1");
        ok(found == null, "Marker element should not be there.");
        canvas.AddMarker(arrow);
        var line = new Line();
        line.Id = "Line1";
        line.Stroke = "Red";
        arrow.Color = "Red";
        line.From = new Point(100, 100);
        line.To = new Point(300, 100);
        canvas.Append(line);
        line.MarkerEnd = arrow;
        canvas.ClearMarkers();
        ok(canvas.Markers.length == 0, "All markers gone now.");
    });

    test("Translation", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);

        var rec = new Rectangle(canvas);
        rec.Width = 50;
        rec.Height = 50;
        rec.Background = "Red";
        rec.Id = "MyRectangle";
        canvas.Append(rec);
        var trans = new Translation(20, 25);
        rec.Transform(trans);

        var found = document.getElementById("MyRectangle");
        ok(found != null, "A rectangle with name 'MyRectangle' should be in the HTML tree.");
        var matrix = found.getCTM();
        ok(matrix.e == 20);
        ok(matrix.f == 25);
        trans = trans.Normalize();
        ok(Math.round(trans.Length) == 1);
        var trans2 = new Translation(20, 25);
        rec.Transform(trans2);
        matrix = found.getCTM();
        ok(matrix.e == 40);
        ok(matrix.f == 50);

        rec = new Rectangle(canvas);
        rec.Id = "123";
        canvas.Append(rec);
        found = document.getElementById("123");
        found.setAttribute("transform", "translate(0 10) translate(20 30)");
        matrix = found.getCTM();
        ok(matrix.e == 20);
        ok(matrix.f == 40);
    });

    test("Scaling", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);

        var rec = new Rectangle(canvas);
        rec.Width = 50;
        rec.Height = 50;
        rec.Background = "Red";
        rec.Id = "MyRectangle";
        canvas.Append(rec);
        var scaling = new Scale(20, 25);
        rec.Transform(scaling);

        var found = document.getElementById("MyRectangle");
        ok(found != null, "A rectangle with name 'MyRectangle' should be in the HTML tree.");
        var matrix = found.getCTM();
        ok(matrix.a == 20);
        ok(matrix.d == 25);

        rec = new Rectangle(canvas);
        rec.Id = "123";
        canvas.Append(rec);
        found = document.getElementById("123");
        found.setAttribute("transform", "scale(1 10) scale(20 3)");
        matrix = found.getCTM();
        ok(matrix.a == 20);
        ok(matrix.d == 30);
    });

    test("Rotation", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);

        var rec = new Rectangle(canvas);
        rec.Width = 50;
        rec.Height = 50;
        rec.Background = "Red";
        rec.Id = "MyRectangle";
        canvas.Append(rec);
        var rot = new Rotation(20);
        rec.Transform(rot);

        var found = document.getElementById("MyRectangle");
        ok(found != null, "A rectangle with name 'MyRectangle' should be in the HTML tree.");
        var matrix = found.getCTM();
        ok(Math.abs(matrix.a - Math.cos(20 * Math.PI / 180)) < UnitTests.Accuracy);
        ok(Math.abs(matrix.b - Math.sin(20 * Math.PI / 180)) < UnitTests.Accuracy);

        rec = new Rectangle(canvas);
        rec.Id = "123";
        canvas.Append(rec);
        found = document.getElementById("123");
        found.setAttribute("transform", "rotate(10) rotate(20)");
        matrix = found.getCTM();
        ok(Math.abs(matrix.a - Math.cos(30 * Math.PI / 180)) < UnitTests.Accuracy);
        ok(Math.abs(matrix.b - Math.sin(30 * Math.PI / 180)) < UnitTests.Accuracy);
    });

    test("Basic tests", function () {
        var r = new Rect(122, 155);
        ok(isNaN(r.Width), "Undefine width should be OK");
        r.Width = 120;
        r.Height = 150;
        ok(r.Contains(new Point(150, 160)), "Specifying the dimensions renders the result.");
        ok(!r.Contains(new Point(550, 160)), "Points outside should not be contained, obviously.");
        r = new Rect(100, 100, 150, 150);
        r.Inflate(5);
        ok(r.Width == 161);
        var rr = r.Clone();
        ok(rr.X == r.X && rr.Y == r.Y && rr.Width == r.Width && rr.Height == r.Height, "Clones should be identical.");
    });

    test("Predefined", function () {
        var someColors = ["Violet", "Wheat", "Sienna", "Brown"];
        for (var i = 0; i < someColors.length; i++) {
            var c = new Color(someColors[i]);
            var known = Colors[someColors[i]];
            equal(c.AsHex6, known.AsHex6);
            equal(c.R, known.R, "R:" + someColors[i]);
            equal(c.G, known.G, "G:" + someColors[i]);
            equal(c.B, known.B, "B:" + someColors[i]);
        }

        var c = new Color("Pink");
        var hex = "#" + Colors.KnownColors["pink"].toUpperCase();
        equal(c.AsHex6, hex);
        c = new Color("#666633");
        equal(c.R, 102);
        equal(c.G, 102);
        equal(c.B, 51);

        c = new Color("99FF66");
        equal(c.R, 153);
        equal(c.G, 255);
        equal(c.B, 102);

        c = new Color(10, 255, 14, 0.44);
        equal(c.R, 10);
        equal(c.G, 255);
        equal(c.B, 14);
        equal(c.A, 0.44);
        equal(c.AsHex6, "#0AFF0E");
    });

    test("Cursor", function () {
        var root = UnitTests.GetRoot();
        var canvas = new SVG.Canvas(root);

        var circ = new SVG.Circle();
        circ.Radius = 150;
        circ.Background = "#CCCCCC";
        circ.Id = "MyCirc";
        circ.Position = new Point(200, 200);
        circ.Cursor = 13 /* Wait */;
        canvas.Append(circ);
        equal(circ.Cursor, 13 /* Wait */);
    });

    test("Scaling", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);
        var group = new Group();

        var refRec = new Rectangle(canvas);
        refRec.Width = 50;
        refRec.Height = 50;
        refRec.Stroke = "Green";
        refRec.StrokeThickness = 1;
        refRec.Background = "Transparent";
        refRec.Position = new Point(0, 0);
        refRec.Id = "TheReference";
        group.Append(refRec);

        var rec = new Rectangle(canvas);
        rec.Width = 50;
        rec.Height = 50;
        rec.Background = "Red";
        rec.Position = new Point(0, 0);
        rec.Id = "TheRec";
        group.Append(rec);

        canvas.Append(group);
        group.Position = new Point(100, 100);

        //    var found = <SVGGElement><Object>document.getElementById("Second");
        //    ok(found != null, "A rectangle with name 'TheRec' should be in the HTML tree.");
        //found.setAttribute("transform"," matrix(0,0,0,0,10,10) rotate(15) translate(10,10)");
        var trans = new Translation(25, 25);
        equal(trans.toString(), "translate(25, 25)");
        var scale = new Scale(2.0, 1.0);
        equal(scale.toString(), "scale(2, 1)");
        var rot = new Rotation(5);
        equal(rot.toString(), "rotate(5)");
        rec.Transform(trans);
        rec.Transform(rot);
        rec.Transform(scale);

        equal(rec.Native.attributes["transform"].value, "translate(25, 25)rotate(5)scale(2, 1)");
        rec.Transform(null);
        ok(rec.Native.attributes["transform"] == undefined);
    });

    test("Path", function () {
        var root = UnitTests.GetRoot();
        var canvas = new Canvas(root);

        var path = new TypeViz.SVG.Path();
        path.Points = [new Point(100, 100), new Point(200, 200), new Point(300, 100)];
        canvas.Append(path);

        ok(true);
    });

    test("Color", function () {
        var rgb = new TypeViz.Media.RGB(255, 0, 0);
        equal(rgb.AsHex6, "#FF0000");
        rgb.G = 255;
        equal(rgb.AsHex6, "#FFFF00");
        rgb.B = 255;
        equal(rgb.AsHex6, "#FFFFFF");
        var hsl = rgb.AsHSL;
        equal(hsl.L, 1);
        equal(hsl.S, 0);
        equal(hsl.H, 0);
        equal(hsl.AsHex6, "#FFFFFF");
        /* hsl.H = 360;
        hsl.S = .38;
        hsl.L = .43;
        equal(hsl.AsHex6, "#8C9643");*/
    });
})(UnitTests || (UnitTests = {}));
//# sourceMappingURL=SVG.js.map
