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
    var Predefined = TypeViz.Diagramming.Graph.Predefined;
    var GraphUtils = TypeViz.Diagramming.Graph.Utils;

    /*
    
    var diagram = TypeViz.Diagramming;
    var Range = TypeViz.Diagramming.Range;
    var Graph = TypeViz.Diagramming.Graph;
    var Node = TypeViz.Diagramming.Node;
    var Link = TypeViz.Diagramming.Link;
    var Dictionary = TypeViz.Diagramming.Dictionary;
    var HashTable = TypeViz.Diagramming.HashTable;
    var Queue = TypeViz.Diagramming.Queue;
    var parse = TypeViz.Diagramming.Graph.Utils.parse;
    var linearize = TypeViz.Diagramming.Graph.Utils.linearize;
    var Adapter = TypeViz.Diagramming.GraphAdapter;
    var Point = TypeViz.Diagramming.Point;
    var Set = TypeViz.Diagramming.Set;
    var Utils = diagram.Utils;*/
    /*-------------Testing Utils----------------------------------*/
    function testSkip(name, test) {
        QUnit.test(name + ' [SKIPPED]', function () {
            var li = document.getElementById(QUnit.config.current["id"]);
            QUnit.done(function () {
                li.style.background = '#FFFF99';
            });
            ok(true);
        });
    }
    ;

    function lexicCount(c, name) {
        switch (c) {
            case 0:
                return null;
            case 1:
                return "one " + name;
            default:
                return c + " " + name + "s";
        }
    }
    ;

    var Accuracy = 1E-6;

    QUnit.module("Layout algorithms");

    testSkip('Simple tree layout', function () {
        var g = Predefined.Tree(4, 2);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.HorizontalSeparation = 30;
        settings.VerticalSeparation = 30;
        diagram.Layout(settings);

        //ok(diagram.shapes.length == 4 && diagram.connections.length == 3, "Four shapes and three links.");
        ok(true, "Visual check");
    });

    testSkip('Eight graph layout', function () {
        var g = Predefined.EightGraph();

        //var g = Predefined.Forest(3,2,2);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        // converting a Graph to a diagram (with internal spring layout to please the eyes)
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 2 /* ForceDirectedLayout */;
        settings.Iterations = 300;
        settings.NodeDistance = 150;
        diagram.Layout(settings);
        ok(diagram.shapes.length == 7 && diagram.connections.length == 8, "Graph of 7 shapes and 8 connections.");
    });

    testSkip('Spring layout', function () {
        var g = Predefined.Forest(3, 3, 8);

        //var g = GraphUtils.createRandomConnectedGraph(300,2,true);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        diagram.Zoom = 0.5;
        GraphUtils.createDiagramFromGraph(diagram, g);
        ok(true, "Visual check");
    });

    testSkip('Spring layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var map = [];
        for (var i = 0; i < 10; i++) {
            var shape = diagram.AddShape();
            shape.Id = i.toString();
            map[i] = shape;
        }

        for (var i = 1; i < 10; i++) {
            diagram.AddConnection(map[0], map[i]);
        }
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 2 /* ForceDirectedLayout */;
        settings.Iterations = 300;
        settings.NodeDistance = 150;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true, "Visual check");
    });

    testSkip('Spring layout', function () {
        var g = Predefined.Forest(3, 3, 3);

        //var g = GraphUtils.createRandomConnectedGraph(300,2,true);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 2 /* ForceDirectedLayout */;
        settings.Iterations = 400;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Tree layout', function () {
        var g = Predefined.Tree(3, 3);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        GraphUtils.createDiagramFromGraph(diagram, g, false);

        diagram.Layout();
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Grid layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var map = [];
        for (var i = 0; i < 100; i++) {
            var shape = diagram.AddShape();
            shape.Id = i.toString();
            map[i] = shape;
        }
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.ComponentMargin = new TypeViz.Size(10, 10);
        settings.NodeDistance = 150;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Forest layout', function () {
        var g = Predefined.Forest(3, 2, 13);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 5 /* TreeDown */;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Random diagram layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        diagram.randomDiagram(Math.round(Math.random() * 50 + 1), 3, false);
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 2 /* TreeRight */;
        diagram.Layout(settings);
        ok(true);
    });

    testSkip('Radial layout', function () {
        var g = Predefined.Forest(2, 3, 5);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        diagram.Canvas.Native.setAttribute("height", "1000");
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var roots = [];
        var components = g.getConnectedComponents();
        for (var i = 0; i < components.length; i++) {
            var rootid = components[i].nodes[0].id;
            var root = diagram.getId(rootid);
            root.mainVisual.Background = "red";
            roots.push(root);
        }
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 7 /* RadialTree */;
        settings.Roots = roots;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Radial layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        diagram.randomDiagram(20, 5, true);
        var root = diagram.getId("0");
        root.mainVisual.Background = "Orange";
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 7 /* RadialTree */;
        settings.Roots = [root];
        settings.NodeDistance = 10;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Mindmap layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        var map = [];
        for (var i = 0; i < 10; i++) {
            var shape = diagram.AddShape();
            shape.Id = i.toString();
            shape.Visual.Native.id = shape.Id;
            map[i] = shape;
        }

        for (var i = 1; i < 10; i++) {
            diagram.AddConnection(map[0], map[i]);
        }

        var root = diagram.getId("0");
        root.mainVisual.Background = "Orange";
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 0 /* MindmapHorizontal */;
        settings.Roots = [root];
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Mindmap layout', function () {
        var g = Predefined.Tree(3, 3);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var root = diagram.getId("0");
        root.mainVisual.Background = "Orange";
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 1 /* MindmapVertical */;
        settings.Roots = [root];
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Mindmap layout', function () {
        var g = Predefined.Mindmap();
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var root = diagram.getId("0");
        root.mainVisual.Background = "Orange";
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 0 /* MindmapHorizontal */;
        settings.Roots = [root];
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Mindmap layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        diagram.randomDiagram(250, 3, true);
        var root = diagram.getId("0");
        root.mainVisual.Background = "Green";
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 0 /* MindmapHorizontal */;
        settings.Roots = [root];
        settings.VerticalSeparation = 2;
        settings.HorizontalSeparation = 150;
        diagram.Layout(settings);
        diagram.Zoom = 0.5;
        ok(true);
    });

    testSkip('Tip-over tree layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        diagram.randomDiagram(50, 3, true);

        var root = diagram.getId("0");
        root.mainVisual.Background = "red";
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 6 /* TipOverTree */;
        settings.Roots = [root];
        settings.VerticalSeparation = 25;
        settings.HorizontalSeparation = 10;
        settings.UnderneathHorizontalOffset = 10;
        settings.UnderneathVerticalTopOffset = 10;
        diagram.Layout(settings);

        //diagram.zoom(0.5);
        ok(true);
    });

    testSkip('Varying shape size layout', function () {
        var g = Predefined.Tree(3, 3);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);

        GraphUtils.createDiagramFromGraph(diagram, g, false, true);
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.SubType = 4 /* TreeUp */;
        diagram.Layout(settings);

        //diagram.zoom(0.5);
        ok(true);
    });

    testSkip('Layered layout', function () {
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        diagram.randomDiagram(50, 15, false, true);

        /*  var g = Predefined.Forest(3,3,3);
        var div = GetRoot();
        var diagramElement = $("#canvas").kendoDiagram();
        var diagram = diagramElement.data("kendoDiagram");
        diagram.canvas.native.setAttribute("height", "1000");
        GraphUtils.createDiagramFromGraph(diagram, g, false);*/
        var root = diagram.getId("0");
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 1 /* LayeredLayout */;
        settings.SubType = 3 /* Right */;
        settings.LayerSeparation = 250;
        settings.NodeDistance = 50;
        diagram.Layout(settings);

        //diagram.zoom(0.5);
        ok(true);
    });

    testSkip('Layout roots', function () {
        var g = Predefined.Forest(2, 3, 5);
        var div = UnitTests.GetRoot();
        var diagram = new TypeViz.Diagramming.DiagramSurface(div);
        GraphUtils.createDiagramFromGraph(diagram, g, false);
        var roots = [];
        var components = g.getConnectedComponents();
        for (var i = 0; i < components.length; i++) {
            var rootid = components[i].nodes[3].id;
            var root = diagram.getId(rootid);
            root.mainVisual.Background = "red";
            roots.push(root);
        }
        var settings = new TypeViz.Diagramming.LayoutSettings();
        settings.Type = 0 /* TreeLayout */;
        settings.Roots = roots;
        diagram.Layout(settings);
        ok(true);
    });
})(UnitTests || (UnitTests = {}));
//# sourceMappingURL=layout.js.map
