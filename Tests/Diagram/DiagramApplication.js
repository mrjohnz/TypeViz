///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Structures.ts' />
///<reference path='../../src/Media.ts' />
///<reference path='../../src/Diagramming.ts' />
/**
* Disclaimer:
* The TypeScript and SVG libraries allow a fully interactive diagramming
* experience, but are not released or supported as such yet.
* The only part supported for now is the export/import to/from XAML/XML.
* See the "Importer.html" file.
*/
/**
* Called when the body of the page is loaded.
*/
function OnLoaded() {
    var App = new DiagramApplication.Application();
    App.OnLoaded();

    var undoButton = document.getElementById("UndoButton");
    undoButton.onclick = function () {
        App.Undo();
    };

    var redoButton = document.getElementById("RedoButton");
    redoButton.onclick = function () {
        App.Redo();
    };

    var deleteButton = document.getElementById("DeleteButton");
    deleteButton.onclick = function () {
        App.Delete();
    };

    var selectAllButton = document.getElementById("SelectAllButton");
    selectAllButton.onclick = function () {
        App.SelectAll();
    };
}

var DiagramApplication;
(function (DiagramApplication) {
    var Circle = TypeViz.SVG.Circle;

    var Markers = TypeViz.SVG.Markers;

    var Point = TypeViz.Point;

    var DiagramSurface = TypeViz.Diagramming.DiagramSurface;

    var Shapes = TypeViz.Diagramming.Shapes;

    var Application = (function () {
        function Application() {
        }
        Application.prototype.OnLoaded = function () {
            var hostdiv = document.getElementById('canvas');
            if (hostdiv == null)
                throw "The DIV with name 'canvas' is missing.";
            this.diagram = new DiagramSurface(hostdiv);

            // just a simple diagram to get you started
            Samples.SimpleDiagram(this.diagram);
        };
        Application.prototype.Undo = function () {
            this.diagram.Undo();
        };

        Application.prototype.SelectAll = function () {
            this.diagram.SelectAll();
        };

        Application.prototype.Delete = function () {
            this.diagram.Delete(true);
        };

        Application.prototype.Redo = function () {
            this.diagram.Redo();
        };

        Object.defineProperty(Application.prototype, "Diagram", {
            get: function () {
                return this.diagram;
            },
            enumerable: true,
            configurable: true
        });
        return Application;
    })();
    DiagramApplication.Application = Application;

    var Samples = (function () {
        function Samples() {
        }
        Samples.AddShape = function (diagram, p, shape, id) {
            if (typeof p === "undefined") { p = Point.Empty; }
            if (typeof shape === "undefined") { shape = TypeViz.Diagramming.Shapes.Rectangle; }
            if (typeof id === "undefined") { id = null; }
            shape.Position = p;
            shape.Width = 200;
            shape.Height = 100;
            shape.Id = id;
            shape.Background = "#778899";
            return diagram.AddShape(shape);
        };

        Samples.AddCircle = function (canvas, p, radius) {
            if (typeof radius === "undefined") { radius = 25; }
            var circ = new Circle();
            circ.Position = p;
            circ.Radius = radius;
            circ.Background = "Orange";
            canvas.Append(circ);
            return circ;
        };

        Samples.AddConnection = function (diagram, from, to) {
            return diagram.AddConnection(from, to);
        };

        /**
        * A simple diagram to demonstrate the current features.
        * @param diagram The diagram in which the sample should be generated.
        */
        Samples.SimpleDiagram = function (diagram) {
            var shape1 = this.AddShape(diagram, new Point(100, 100), Shapes.SequentialData);
            shape1.Width = 100;
            shape1.Height = 100;
            shape1.Title = "Sequential Data.";
            var shape2 = this.AddShape(diagram, new Point(100, 400));
            var shape3 = this.AddShape(diagram, new Point(370, 400), Shapes.Wave);
            var shape4 = this.AddShape(diagram, new Point(250, 600));
            var topCor = shape2.GetConnector("Top");
            var topCor2 = shape3.GetConnector("Top");
            var bottomCor = shape1.GetConnector("Bottom");
            var con = this.AddConnection(diagram, bottomCor, topCor);
            con.EndCap = Markers.ArrowEnd;
            con.StartCap = Markers.FilledCircle;
            var con2 = this.AddConnection(diagram, bottomCor, topCor2);
            con2.Content = "Connection Label";
        };
        return Samples;
    })();
    DiagramApplication.Samples = Samples;
})(DiagramApplication || (DiagramApplication = {}));
//# sourceMappingURL=DiagramApplication.js.map
