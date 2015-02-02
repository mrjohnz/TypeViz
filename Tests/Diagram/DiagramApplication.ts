
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
function OnLoaded()
{
    var App = new DiagramApplication.Application();
    App.OnLoaded();

    var undoButton = document.getElementById("UndoButton");
    undoButton.onclick = function () { App.Undo(); };

    var redoButton = document.getElementById("RedoButton");
    redoButton.onclick = function () { App.Redo(); };

    var deleteButton = document.getElementById("DeleteButton");
    deleteButton.onclick = function () { App.Delete(); };

    var selectAllButton = document.getElementById("SelectAllButton");
    selectAllButton.onclick = function () { App.SelectAll(); };

}

module DiagramApplication
{
    import SVG = TypeViz.SVG;
    import Canvas = TypeViz.SVG.Canvas;
    import CanvasOptions = TypeViz.SVG.CanvasOptions;
    import Marker = TypeViz.SVG.Marker;
    import Circle = TypeViz.SVG.Circle;
    import Group = TypeViz.SVG.Group;
    import Line = TypeViz.SVG.Line;
    import MarkerOrientation = TypeViz.SVG.MarkerOrientation;
    import Rectangle = TypeViz.SVG.Rectangle;
    import PathBase = TypeViz.SVG.PathBase;
    import Translation = TypeViz.SVG.Translation;
    import Transformation = TypeViz.SVG.Transformation;
    import Rotation = TypeViz.SVG.Rotation;
    import Markers = TypeViz.SVG.Markers;
    import Scale = TypeViz.SVG.Scale;
    import Point = TypeViz.Point;
    import Rect = TypeViz.Rect;
    import Color = TypeViz.Media.Color;
    import Colors = TypeViz.Media.Colors;
    import DiagramSurface = TypeViz.Diagramming.DiagramSurface;
    import Connector = TypeViz.Diagramming.Connector;
    import Connection = TypeViz.Diagramming.Connection;
    import Shapes = TypeViz.Diagramming.Shapes;

    export class Application
    {
        private diagram: DiagramSurface;
        public OnLoaded()
        {

            var hostdiv = <HTMLDivElement>document.getElementById('canvas');
            if (hostdiv == null) throw "The DIV with name 'canvas' is missing.";
            this.diagram = new DiagramSurface(hostdiv);

            // just a simple diagram to get you started
            Samples.SimpleDiagram(this.diagram);
        }
        public Undo()
        {
            this.diagram.Undo();
        }

        public SelectAll()
        {
            this.diagram.SelectAll();
        }

        public Delete()
        {
            this.diagram.Delete(true);
        }

        public Redo()
        {
            this.diagram.Redo();
        }

        public get Diagram()
        {
            return this.diagram;
        }
    }

    export class Samples
    {

        private static AddShape(diagram: DiagramSurface, p: Point = Point.Empty, shape: TypeViz.Diagramming.IShapeTemplate = TypeViz.Diagramming.Shapes.Rectangle, id: string = null)
        {
            shape.Position = p;
            shape.Width = 200;
            shape.Height = 100;
            shape.Id = id;
            shape.Background = "#778899";
            return diagram.AddShape(shape);

        }

        private static AddCircle(canvas: Canvas, p: Point, radius: number = 25)
        {
            var circ = new Circle();
            circ.Position = p;
            circ.Radius = radius;
            circ.Background = "Orange";
            canvas.Append(circ);
            return circ;
        }

        private static AddConnection(diagram: DiagramSurface, from: Connector, to: Connector)
        {
            return diagram.AddConnection(from, to);
        }

        /**
         * A simple diagram to demonstrate the current features.
         * @param diagram The diagram in which the sample should be generated.
         */
        public static SimpleDiagram(diagram: DiagramSurface)
        {
            var shape1 = this.AddShape(diagram, new Point(100, 100), Shapes.SequentialData);
            shape1.Width = 100;
            shape1.Height = 100;
            shape1.Title = "Sequential Data."
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
        }
    }
}