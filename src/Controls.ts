
/** 
    Copyright (c) 2007-2014, Orbifold bvba.
 
    For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/
/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="Animation.ts" />
/// <reference path="Arrays.ts" />
/// <reference path='Structures.ts' />
/// <reference path='Media.ts' />
/// <reference path='SVG.ts' />

module TypeViz {

    import Visual = TypeViz.SVG.Visual;
    import Point = TypeViz.Point;
    import Group = TypeViz.SVG.Group;
    import Path = TypeViz.SVG.Path;
    import Color = TypeViz.Media.Color;
    import Colors = TypeViz.Media.Colors;
    import Interval = TypeViz.Maths.Interval;

    /**
      DataViz controls.
    */
    export module Controls {

        /* Merges the given options (or null) with the default one.*/
        function transferOptions(defaultOptions, givenOptions) {
            if (givenOptions == null) return defaultOptions;
            var result = {};
            for (var option in defaultOptions) {
                if (givenOptions.hasOwnProperty(option))
                    result[option] = givenOptions[option];
                else result[option] = defaultOptions[option];
            }
            return result;
        }

        /* The base class for controls aka widgets.*/
        export class VisualizationBase extends TypeViz.SVG.Visual {
            private data;
            private cache: Map;
            private model;
            private source: (m) => any;

            constructor(model?, source?) {
                super();
                this.RootVisual = new Group();
                this.nativeElement = <SVGGElement>this.RootVisual.Native;
                this.Initialize();
                this.source = TypeViz.Identity;
                this.cache = new TypeViz.Map();

                this.Height = 200;
                this.Width = 200;

                if (TypeViz.IsDefined(source)) {
                    this.Source = source;
                }
                if (TypeViz.IsDefined(model)) {
                    this.Model = model;
                    this.Update();
                }
            }


            /* Gets the nativeElement SVG element which this visual wraps.*/
            public get Native(): SVGGElement {
                return <SVGGElement>this.nativeElement;
            }

            public RootVisual: Group;

            get Position(): Point {
                return this.RootVisual.Position;
            }

            /* Sets the position of this rectangle.*/
            set Position(p: Point) {
                this.RootVisual.Position = p;
            }

            public get Source() {
                return this.source;
            }

            /* Defines the source of data for this viz inside the Model.*/
            public set Source(value) {
                this.source = value;
            }

            public get Cache() {
                return this.cache;
            }

            public get Data() {
                return this.data;
            }

            public get Model() {
                return this.model;
            }

            public set Model(value) {
                this.detachFromModel();
                this.model = value;
                this.attachToModel();
            }

            onModelChanged() {
                this.Update();
            }

            attachToModel() {
                if (this.model != null && this.model.Changed) {
                    this.model.Changed(this.onModelChanged);
                }
            }

            detachFromModel() {
                if (this.model != null && this.model.RemoveChangedHandler) {
                    this.model.RemoveChangedHandler(this.onModelChanged);
                }
            }

            Update() {
                if (this.model == null) {
                    console.warn("Update on Band called without Model.");
                    return;
                }
                if (this.Source == null) {
                    console.warn("Update on Band called without Source definition.");
                    return;
                }
                this.data = this.Source(this.model);
            }

            Present(gluons: Array<IGluon>) {
                this.cleanupOldItems(gluons);
                for (var i = 0; i < gluons.length; i++) {
                    var gluon = gluons[i];

                    if (this.Cache.Contains(gluon.Id)) {
                        this.UpdateItem(gluon);
                    }
                    else {
                        this.AddItem(gluon);
                    }
                }
            }

            cleanupOldItems(gluons: Array<IGluon>) {
                this.Cache.ForEach(function (key, value) {
                    for (var j = 0; j < gluons.length; j++) {
                        if (gluons[j].Node == key) return;
                    }
                    this.RemoveItem(value);

                }, this);
            }

            UpdateItem(gluon: IGluon) {
            }

            RemoveItem(gluon: IGluon) {
            }

            AddItem(gluon: IGluon) {

            }
        }

        /*The visualization node which glues the raw data and the visual.*/
        export class IGluon {
            public Id;
            public Visual;
            public Node;
        }

        /*Creates a band diagram.*/
        export class BandDiagram extends VisualizationBase {

            /**
             * Recalculates the chords from the given model.
             */
            public Update() {
                super.Update();
                if (this.Data == null) return;
                var adapter = new BandFactory();
                var gluon: Array<IGluon> = adapter.Generate(this.Data);
                if (gluon != null) {
                    this.Present(gluon);
                }
            }

            UpdateItem(gluon: IGluon) {
                this.Cache.Get(gluon.Id).Data = gluon["Data"];
            }

            AddItem(gluon: IGluon) {
                this.RootVisual.Append(gluon.Visual);
                this.Cache.Set(gluon.Id, gluon.Visual);
            }
        }

        export class BandFactory {
            private source: any = function (d) {
                return d.Source;
            };
            private endAngle: any = function (d) {
                return d.EndAngle;
            };
            private backgroundFunctor: any = d => d.Background;
            private target: any = function (d) {
                return d.Target;
            };
            private radius: any = function (d) {
                return d.Radius;
            };
            private startAngle: any = function (d) {
                return d.StartAngle;
            };
            private arcOffset = -Math.PI / 2;
            private arcMax = 2 * Math.PI - 1e-6;
            private data;

            constructor(options?) {

            }

            private id: any = function (d) {
                return TypeViz.Hash(d);
            };

            public get Id() {
                return this.id;
            }

            /**
             * Defines how the id of the data node is fetched
             */
            public set Id(value) {
                this.id = TypeViz.Functor(value);
            }


            public get Background() {
                return this.backgroundFunctor;
            }

            public set Background(value) {
                this.backgroundFunctor = TypeViz.Functor(value);
            }

            public get Source() {
                return this.source;
            }

            public set Source(value) {
                this.source = TypeViz.Functor(value);
            }

            public get Target() {
                return this.target;
            }

            public set Target(value: any) {
                this.target = TypeViz.Functor(value);
            }

            public get Radius() {
                return this.radius;
            }

            public set Radius(value) {
                this.radius = TypeViz.Functor(value);
            }

            public get StartAngle() {
                return this.startAngle;
            }

            public set StartAngle(value) {
                this.startAngle = TypeViz.Functor(value);
            }

            public get EndAngle() {
                return this.endAngle;
            }

            public set EndAngle(value) {
                this.endAngle = TypeViz.Functor(value);
            }

            equals(a, b) {
                return a.a0 == b.a0 && a.a1 == b.a1;
            }

            Generate(data, i?): Array<IGluon> {
                if (data instanceof Array) {
                    var result = [];
                    for (var j = 0; j < data.length; j++) {
                        var dataNode = data[j];
                        result.push(this.wrap(dataNode));
                    }
                    return result;
                }
                else {
                    return [this.wrap(data)];
                }
            }

            wrap(dataNode): IGluon {

                var calc = this.calculate(dataNode);
                var pathString = calc.data;
                var path = new Path();
                path.Background = this.backgroundFunctor(dataNode) || "#b0c4de";
                path.Opacity = dataNode.Opacity || 0.64;
                path.StrokeThickness = 1;
                path.Data = pathString;
                var g = new TypeViz.SVG.Group();
                g.Append(path);
                var text = new TypeViz.SVG.TextBlock();
                text.Text = dataNode.Data;
                text.Transform(new TypeViz.SVG.Translation((calc.to.p0[0] + calc.to.p1[0]) / 2, (calc.to.p0[1] + calc.to.p1[1]) / 2));
                text.Background = "White";
                text.Anchor = TypeViz.SVG.TextAnchor.Center;
                text.dx = 1;
                text.dy = 1;
                g.Append(text);
                return {
                    Data: pathString,
                    Node: dataNode,
                    Visual: g,
                    Id: this.Id(dataNode),
                    StartPosition: calc.from
                };
            }

            calculate(data, i?) {
                var startCoordinates = this.getCoordinates(this, this.source, data, i),
                    endCoordinates = this.getCoordinates(this, this.target, data, i);
                return {
                    data: "M" + startCoordinates.p0
                    + this.arc(startCoordinates.r, startCoordinates.p1, startCoordinates.a1 - startCoordinates.a0) + (this.equals(startCoordinates, endCoordinates)
                    ? this.curve(startCoordinates.r, startCoordinates.p1, startCoordinates.r, startCoordinates.p0)
                    : this.curve(startCoordinates.r, startCoordinates.p1, endCoordinates.r, endCoordinates.p0)
                    + this.arc(endCoordinates.r, endCoordinates.p1, endCoordinates.a1 - endCoordinates.a0)
                    + this.curve(endCoordinates.r, endCoordinates.p1, startCoordinates.r, startCoordinates.p0))
                    + "Z",
                    from: startCoordinates,
                    to: endCoordinates
                };
            }

            arc(r, p, a) {
                return "A" + r + "," + r + " 0 " + +(a > Math.PI) + ",1 " + p;
            }

            curve(r0, p0, r1, p1) {
                return "Q 0,0 " + p1;
            }

            getCoordinates(self, pickFunction, d, i) {
                var endPointData = pickFunction.call(self, d, i),
                    r = this.radius.call(self, endPointData, i),
                    a0 = this.startAngle.call(self, endPointData, i) + this.arcOffset,
                    a1 = this.endAngle.call(self, endPointData, i) + this.arcOffset;
                return {
                    r: r,
                    a0: a0,
                    a1: a1,
                    p0: [r * Math.cos(a0), r * Math.sin(a0)],
                    p1: [r * Math.cos(a1), r * Math.sin(a1)]
                };
            }
        }

        export class WheelFactory {
            private colorFunction;
            private title = function (d) {
                return d.Name || "";
            };

            public get Name() {
                return this.title;
            }

            public set Name(value) {
                this.title = value;
            }


            private id: any = function (d) {
                return TypeViz.Hash(d);
            };

            public get Id() {
                return this.id;
            }

            /* Defines how the id of the data node is fetched */
            public set Id(value: any) {
                this.id = TypeViz.Functor(value);
            }
            public get ColorFunction() { return this.colorFunction; }
            public set ColorFunction(value) { this.colorFunction = value; }
            constructor() {
                this.colorFunction = (data, i) => TypeViz.Media.Colors.RandomBlue.AsHex6;

            }
            private weights = [];

            private weight = function (d) {
                return d.Weight;
            };

            public get Weight() {
                return this.weight;
            }

            public set Weight(value) {
                this.weight = value;
            }

            private innerRadius = 200;

            public get InnerRadius() {
                return this.innerRadius;
            }

            public set InnerRadius(value) {
                this.innerRadius = value;
            }

            private outerRadius = 250;

            public get OuterRadius() {
                return this.outerRadius;
            }

            public set OuterRadius(value) {
                this.outerRadius = value;
            }


            normalizeData(data) {
                var sum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += this.Weight(data[i]);
                }
                if (sum == 0) throw "Could not find a suitable normalization.";
                for (var i = 0; i < data.length; i++) {
                    this.weights[i] = this.Weight(data[i]) / sum;
                }
            }

            Generate(data: any[]) {
                this.normalizeData(data);
                var startAngle = 0;
                var result = [];
                for (var i = 0; i < data.length; i++) {
                    var node = data[i];
                    var title = this.Name(node);
                    var id = this.id(node);
                    var g = new SVG.Group();
                    var arc = new SVG.Arc();
                    arc.Background = this.colorFunction(node, i);
                    arc.InnerRadius = this.InnerRadius;
                    arc.OuterRadius = this.OuterRadius;
                    arc.StartAngle = startAngle;
                    arc.StrokeThickness = 0;
                    arc.EndAngle = startAngle + this.weights[i] * Math.PI * 2;
                    g.Append(arc);
                    var tb = new SVG.TextBlock();
                    var halfAngle = (arc.StartAngle + arc.EndAngle) / 2;
                    var halfRadius = (arc.InnerRadius + arc.OuterRadius) / 2;
                    tb.Position = new TypeViz.Point(halfRadius * Math.sin(halfAngle), -halfRadius * Math.cos(halfAngle));
                    tb.Text = Math.round(this.weights[i] * 100) + "%";
                    tb.Anchor = SVG.TextAnchor.Center;
                    tb.Background = "White";
                    g.Append(tb);
                    result.push({
                        Node: node,
                        Id: id,
                        Visual: g,
                        StartAngle: arc.StartAngle,
                        EndAngle: arc.EndAngle,
                        Text: tb.Text,
                        Color: arc.Background
                    });
                    startAngle = arc.EndAngle;
                }
                return result;
            }
        }

        /*Like a pie chart but more generic.*/
        export class WheelChart extends VisualizationBase {

            public get InnerRadius() {
                return this.factory.InnerRadius;
            }

            public set InnerRadius(value) {
                this.factory.InnerRadius = value;
                this.Update();
            }

            public get OuterRadius() {
                return this.factory.OuterRadius;
            }

            public set OuterRadius(value) {
                this.factory.OuterRadius = value;
                this.Update();
            }

            public set ColorFunction(value) {
                this.factory.ColorFunction = value;
                this.Update();
            }

            public get ColorFunction() { return this.factory.ColorFunction; }

            constructor(model?, source?) {
                super(model, source);
            }

            public Update() {
                super.Update();
                if (this.Data == null) return;

                var gluon: Array<IGluon> = this.Factory.Generate(this.Data);
                if (gluon != null) {
                    this.Present(gluon);
                }
            }

            private factory: WheelFactory;

            public get Factory() {
                if (this.factory == null) this.factory = new WheelFactory();
                return this.factory;
            }

            UpdateItem(gluon: IGluon) {
                var arc = this.Cache.Get(gluon.Id).Children[0];
                var tb = this.Cache.Get(gluon.Id).Children[1];
                arc.InnerRadius = this.InnerRadius;
                arc.OuterRadius = this.OuterRadius;
                arc.StartAngle = gluon["StartAngle"];
                arc.Background = gluon["Color"];
                arc.EndAngle = gluon["EndAngle"];
                tb.Text = gluon["Text"];
                var halfAngle = (arc.StartAngle + arc.EndAngle) / 2;
                var halfRadius = (arc.InnerRadius + arc.OuterRadius) / 2;
                tb.Position = new TypeViz.Point(halfRadius * Math.sin(halfAngle), -halfRadius * Math.cos(halfAngle));
            }

            AddItem(gluon: IGluon) {
                this.RootVisual.Append(gluon.Visual);
                this.Cache.Set(gluon.Id, gluon.Visual);
            }

        }

        export enum AxisDirection {
            Horizontal = 0,
            Vertical = 1
        }


        export var AxisDefaultOptions =
            {
                ShowHorizontal: true,
                ShowVertical: true,
                ShowHorizontalArrowHead: true,
                ShowVerticalArrowHead: true,
                VerticalOffset: 0,
                HorizontalOffset: 0,
                HorizontalExtent: [0, 100],
                VerticalExtent: [0, 50],
                HorizontalStep: 5,
                VerticalStep: 5,
                ShowHorizontalLabels: true,
                ShowVerticalLabels: true,
                HorizontalTickSpace: 5,
                VerticalTickSpace: 5,
                TickSize: 5
            };
        export var CircularAxisDefaultOptions = {
            Interval: [0, 100],
            Radius: 200
        };

        export class CircularAxis extends TypeViz.SVG.Visual {
            private options;
            public RootVisual: Group;

            get Position(): Point {
                return this.RootVisual.Position;
            }

            /**
             * Sets the position of this rectangle.
             */
            set Position(p: Point) {
                this.RootVisual.Position = p;
            }

            constructor(options?) {
                super();
                this.RootVisual = new Group();
                this.nativeElement = <SVGGElement>this.RootVisual.Native;
                this.Initialize();
                this.options = transferOptions(CircularAxisDefaultOptions, options);
                this.options["Interval"] = this.ensureExtent(this.options["Interval"]);

                this.Update();
            }

            ensureExtent(value) {
                return (value instanceof Interval) ? value : new Interval(value);
            }

            Update() {
                this.RootVisual.Clear();
                var circle = new SVG.Circle();
                circle.Radius = this.options.Radius;
                this.RootVisual.Append(circle);

            }
        }

        export class Axis extends TypeViz.SVG.Visual {
            private horizontalExtent: Interval;
            private verticalExtent: Interval;
            private stroke;
            private horizontalMarker;
            private verticalMarker;
            private options;
            private horizontalGroup: Group;
            private verticalGroup: Group;
            public RootVisual: Group;

            public get Native(): SVGGElement {
                return <SVGGElement>this.nativeElement;
            }

            public get HorizontalOffset() {
                return this.options.HorizontalOffset;
            }

            public set HorizontalOffset(value) {
                this.options.HorizontalOffset = value;
                this.Update();
            }

            public get VerticalOffset() {
                return this.options.VerticalOffset;
            }

            public set VerticalOffset(value) {
                this.options.VerticalOffset = value;
                this.Update();
            }

            get Position(): Point {
                return this.RootVisual.Position;
            }

            /**
             * Sets the position of this rectangle.
             */
            set Position(p: Point) {
                this.RootVisual.Position = p;
            }

            public get Interval() {
                return this.options.HorizontalExtent;
            }

            public set Interval(value) {
                this.horizontalExtent = this.ensureExtent(value);
                this.options.HorizontalExtent = value;
                this.Update();
            }

            public get HorizontalTickSpace() {
                return this.options.HorizontalTickSpace;
            }

            /**
             * Sets the spacing (in pixels) between horizontal units.
             */
            public set HorizontalTickSpace(value) {
                this.options.HorizontalTickSpace = value;
                this.Update();
            }

            public get VerticalTickSpace() {
                return this.options.VerticalTickSpace;
            }

            /**
             * Sets the spacing (in pixels) between vertical units.
             */
            public set VerticalTickSpace(value) {
                this.options.VerticalTickSpace = value;
                this.Update();
            }

            public get TickSize() {
                return this.options.TickSize;
            }

            /**
             * Sets the height/width of the ticks.
             */
            public set TickSize(value) {
                this.options.TickSize = value;
                this.Update();
            }


            public get HorizontalStep() {
                return this.options.HorizontalStep;
            }
            public get Stroke() { return this.stroke; }
            public set Stroke(value) {
                this.stroke = value;
                this.Update();
            }
            /**
             * How many ticks are skipped.
             */
            public set HorizontalStep(value) {
                this.options.HorizontalStep = value;
                this.Update();
            }

            public get VerticalStep() {
                return this.options.VerticalStep;
            }

            public set VerticalStep(value) {
                this.options.VerticalStep = value;
                this.Update();
            }

            constructor(options?) {
                super();
                this.RootVisual = new Group();
                this.nativeElement = <SVGGElement>this.RootVisual.Native;
                this.Initialize();
                this.options = transferOptions(AxisDefaultOptions, options);
                this.options["HorizontalExtent"] = this.ensureExtent(this.options["HorizontalExtent"]);
                this.options["VerticalExtent"] = this.ensureExtent(this.options["VerticalExtent"]);
                this.Stroke = "Dimgray";
                this.Update();
            }

            public OnAppendToCanvas(canvas: SVG.Canvas) {
                if (this.options.ShowHorizontalArrowHead) canvas.AddMarker(this.horizontalMarker);
                if (this.options.ShowVerticalArrowHead) canvas.AddMarker(this.verticalMarker);
            }

            public OnDetachFromCanvas(canvas: SVG.Canvas) {
                if (this.horizontalMarker != null) canvas.RemoveMarker(this.horizontalMarker);
                if (this.verticalMarker != null) canvas.RemoveMarker(this.verticalMarker);
            }

            ensureExtent(value) {
                return (value instanceof Interval) ? value : new Interval(value);
            }

            Update() {
                this.RootVisual.Clear();
                var amount, tickSize, totalSize, label;
                if (this.options.ShowHorizontal) {
                    amount = this.options.HorizontalExtent.Size;
                    tickSize = amount * this.options.HorizontalTickSpace;
                    totalSize = this.options.HorizontalOffset + tickSize + 10;
                    var horizontalLine = new TypeViz.SVG.Line();
                    horizontalLine.From = new Point(0, 0);
                    horizontalLine.To = new Point(totalSize, 0);
                    horizontalLine.Stroke = this.Stroke;
                    this.horizontalGroup = new Group();
                    this.horizontalGroup.Append(horizontalLine);
                    if (this.options.ShowHorizontalArrowHead) {
                        this.horizontalMarker = SVG.Markers.ArrowEnd;
                        this.horizontalMarker.Path.Stroke = this.Stroke;
                        this.horizontalMarker.Path.Background = this.stroke;
                        horizontalLine.MarkerEnd = this.horizontalMarker;
                    }
                    for (var i = 0; i < amount; i += this.options.HorizontalStep) {
                        var tick = new SVG.Line(new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, 0), new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, this.options.TickSize));
                        tick.Stroke = this.Stroke;
                        this.horizontalGroup.Append(tick);
                        if (this.options.ShowHorizontalLabels) {
                            label = new SVG.TextBlock();
                            label.Text = i.toString();
                            label.Position = new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, this.options.TickSize + 2);
                            label.dy = 1;
                            label.Background = this.Stroke;
                            label.Anchor = SVG.TextAnchor.Center;
                            this.horizontalGroup.Append(label);
                        }
                    }
                    this.RootVisual.Append(this.horizontalGroup);
                }

                if (this.options.ShowVertical) {
                    amount = this.options.VerticalExtent.Size;
                    tickSize = amount * this.options.VerticalTickSpace;
                    totalSize = this.options.VerticalOffset + tickSize + 10;
                    var verticalLine = new SVG.Line();
                    verticalLine.From = new Point(0, totalSize);
                    verticalLine.To = new Point(0, 0);
                    verticalLine.Stroke = this.Stroke;
                    this.verticalGroup = new Group();
                    this.verticalGroup.Append(verticalLine);
                    if (this.options.ShowVerticalArrowHead) {
                        this.verticalMarker = SVG.Markers.ArrowEnd;
                        this.verticalMarker.Path.Stroke = this.stroke;
                        this.verticalMarker.Path.Background = this.stroke;
                        verticalLine.MarkerEnd = this.verticalMarker;
                    }

                    if (this.options.ShowHorizontal) this.horizontalGroup.Position = new Point(0, totalSize);
                    for (var i = 0; i < amount; i += this.options.VerticalStep) {
                        var tick = new SVG.Line(new Point(0, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace)), new Point(-this.options.TickSize, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace)));
                        tick.Stroke = this.Stroke;
                        this.verticalGroup.Append(tick);
                        if (this.options.ShowVerticalLabels) {
                            label = new SVG.TextBlock();
                            label.Text = i.toString();
                            label.Position = new Point(-this.options.TickSize - 2, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace));
                            label.dx = -10;
                            label.dy = 0.3;
                            label.Background = this.Stroke;
                            label.Anchor = SVG.TextAnchor.Center;
                            this.verticalGroup.Append(label);
                        }
                    }
                    this.RootVisual.Append(this.verticalGroup);
                }
            }

        }

        export class Popup {

            private anchors: Array<SVG.Visual>;
            private content: (any) => Visual;
            private visualsMap: Map;
            private position: (v: Visual, e) => Point;
            constructor(content?, ...anchors: Array<Visual>) {
                if (content) this.Content = content;
                this.visualsMap = new TypeViz.Map();
                if (anchors) {
                    this.anchors = anchors;
                }
            }

            /* The amount of millisecs to wait before showing the content.*/
            public Delay: number = 500;

            /* The amount of millisecs to stay after the mouse has left the anchor.*/
            public Remains: number = 500;

            public get Position() { return this.position; }
            public set Position(value) { this.position = TypeViz.Functor(value); }

            public set Content(value: any) {
                if (TypeViz.IsDefined(value)) {
                    this.content = TypeViz.Functor(value);
                    this.content(null).IsVisible = false;
                }
                else {
                    this.content = null;
                }

            }

            public get Content(): any {
                return this.content;
            }

            /* Adds a visual which should trigger the popup. */
            public AddAnchor(anchor: Visual) {
                if (anchor == null) throw "Cannot add a null anchor.";
                var popup = this;
                anchor.MouseOver.call(anchor, (function (e) {
                    setTimeout(
                        () => { popup.showContent(anchor, e); },
                        popup.Delay
                        );
                }));

                anchor.MouseOut.call(anchor, (function (e) {
                    setTimeout(
                        () => { popup.hideContent(anchor, e); },
                        popup.Remains);
                }));
            }

            hideContent(anchor, e) {
                if (this.visualsMap.ContainsKey(anchor.Id)) {
                    var visual = this.visualsMap.Get(anchor.Id);
                    if (TypeViz.IsDefined(visual)) visual.IsVisible = false;
                }
            }

            showContent(anchor: Visual, e) {
                if (this.content == null) return;
                var visual: Visual = this.content(anchor);
                if (TypeViz.IsDefined(visual)) {
                    visual.IsVisible = true;
                    if (TypeViz.IsDefined(this.position)) {
                        visual.Position = this.position(anchor, e);
                    }
                    else {
                        var p = anchor.Position;
                        visual.Position = new TypeViz.Point(p.X + anchor.Width / 2, p.Y + anchor.Height + 2);
                    }
                    this.visualsMap.Set(anchor.Id, visual);
                }
            }

        }

        export enum TextAlign {
            Left= 0,
            Right= 1,
            Center= 2,
            Justify= 3
        };

        export class TextLine {
            private parent;
            private length;
            private content;
            constructor(parent, length, content) {
                this.parent = parent;
                this.length = length;
                this.content = content;
            }
        }

        /* Text block with wrapping.*/
        export class TextWrap extends SVG.Visual {

            private text;
            private lines = [];
            private align;
            private textBlock: SVG.TextBlock;
            private group: SVG.Group;

            get Anchor(): SVG.TextAnchor {
                return this.textBlock.Anchor;
            }


            set Anchor(anchor: SVG.TextAnchor) {
                this.textBlock.Anchor = anchor;
            }

            public set Text(value) {
                this.text = value;
                this.Update();
            }
            public get Text() { return this.text; }

            public OnAppendToCanvas() {
                // the measuring of the text effectively only works if the element is part of the UI
                this.Update();
            }
            public Append(span: SVG.TextSpan) {
                this.textBlock.Native.appendChild(span.Native);
            }

            public get Align(): TextAlign { return this.align; }
            public set Align(value: TextAlign) {
                this.align = value;
            }

            public get Native(): SVGGElement { return <SVGGElement>this.nativeElement; }
            /**
       * Gets the position of this text block.
       */
            get Position(): Point {
                return this.group.Position;
            }

            /**
             * Sets the position of this text block.
             */
            set Position(p: Point) {
                this.group.Position = p;
            }

            constructor() {
                super();
                this.textBlock = new SVG.TextBlock();
                this.group = new SVG.Group();
                this.group.Append(this.textBlock);
                this.nativeElement = this.group.Native;
                this.Width = 200;
                this.Update();
            }

            Update() {

                this.splitString();
                this.layout();
            }

            private layout() {
                if (this.lines.length == 0) return;
                this.clearPresentation();
                var lines = (new Array(0)).concat(this.lines);
                var anchor = TypeViz.SVG.TextAnchor.Left;
                if (this.Align == TextAlign.Center) {
                    anchor = TypeViz.SVG.TextAnchor.Center;
                } else if (this.Align == TextAlign.Right) {
                    anchor = TypeViz.SVG.TextAnchor.Right;
                }
                for (var i = 0; i < lines.length; i++) {
                    var x = 0;
                    var line = lines[i];

                    var tspan = new SVG.TextSpan();
                    tspan.Native.appendChild(document.createTextNode(line.content.join(' ')));
                    if (this.Align == TextAlign.Justify) {
                        var space = (this.Width - line.Width) / (line.content.length - 1);
                        space = (i != lines.length - 1) ? space : 0;
                        tspan.Native.style.setProperty('word-spacing', space + 'px');
                    } else if (this.Align == TextAlign.Center) {
                        anchor = TypeViz.SVG.TextAnchor.Center;
                        x = this.Width / 2;
                    } else if (this.Align == TextAlign.Right) {
                        anchor = TypeViz.SVG.TextAnchor.Right;
                        x = this.Width;
                    }
                    tspan.X = x;
                    tspan.dy = 1.2;

                    this.Append(tspan);

                }
                this.textBlock.Anchor = anchor;

            }
            get Foreground() {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of the circle.
             */
            set Foreground(v: any) {
                this.Native.style.fill = this.getColorString(v);
            }

            public Clear() {

            }

            private clearPresentation() {
                this.textBlock.Native.textContent = null;
            }
            /**
                    * Splits the input in lines.
                    */
            private splitString() {
                var text = this.Text;
                this.clearPresentation();
                if (text == null || text.length == 0) return;
                var words = text.split(' ');
                var lines = [];
                var line = [];
                var length = 0;
                var prevLength = 0;
                while (words.length) {
                    var word = words[0];
                    this.textBlock.nativeElement.textContent = line.join(' ') + ' ' + word;
                    length = this.textBlock.TextLength;
                    if (length > this.Width) {
                        if (!words.length) {
                            line.push(words[0]);
                        }
                        lines.push(new TextLine(this, prevLength, line));
                        line = new Array();
                    } else {
                        line.push(words.shift());
                    }
                    prevLength = length;
                    if (words.length == 0) {
                        lines.push(new TextLine(this, 0, line));
                    }
                }
                this.lines = lines;
            }
        }

        export class SparkLine extends VisualizationBase {
            private gluons: Map;
            private stroke = "Silver";
            private midLine;
            private topLine;
            private bottomLine;
            private path;
            private maxDot;
            private minDot;
            private topText;
            private midText;
            private bottomText;
            private backRectangle;
            constructor(model?, source?) {
                super(model, source);
            }
            public get Stroke() { return this.stroke; }
            public set Stroke(value) {
                this.stroke = value;
                this.Update();
            }
            public TurnElementsVisible(isVisible: boolean) {
                if (TypeViz.IsDefined(this.topLine)) {
                    this.topLine.IsVisible = isVisible;
                    this.midLine.IsVisible = isVisible;
                    this.bottomLine.IsVisible = isVisible;

                    this.topText.IsVisible = isVisible;
                    this.midText.IsVisible = isVisible;
                    this.bottomText.IsVisible = isVisible;
                }
                if (TypeViz.IsDefined(this.path)) {
                    this.path.IsVisible = isVisible;
                    this.maxDot.IsVisible = isVisible;
                    this.minDot.IsVisible = isVisible;
                }

            }
            private getTextBlock() {
                var tb = new SVG.TextBlock();
                tb.Background = "White";
                tb.Opacity = 0.2;
                tb.FontSize = 7;
                this.RootVisual.Append(tb);
                return tb;
            }
            private getLine() {
                var line = new TypeViz.SVG.Line();
                line.Stroke = "White";
                line.Opacity = 0.2;
                this.RootVisual.Prepend(line);
                return line;
            }
            public Update() {
                var BACKOPACITY = 0.2;
                super.Update();
                if (TypeViz.IsUndefined(this.Data) || !(this.Data instanceof Array) || this.Data.length === 0) {
                    this.TurnElementsVisible(false);
                    return;
                }

                if (TypeViz.IsUndefined(this.path)) {
                    this.path = new SVG.Path();
                    this.path.Opacity = 0.8;
                    this.RootVisual.Append(this.path);
                    this.maxDot = new SVG.Circle();
                    this.RootVisual.Append(this.maxDot);
                    this.minDot = new SVG.Circle();
                    this.RootVisual.Append(this.minDot);

                    this.midLine = this.getLine();
                    this.topLine = this.getLine();
                    this.bottomLine = this.getLine();

                    this.topText = this.getTextBlock();
                    this.midText = this.getTextBlock();
                    this.bottomText = this.getTextBlock();

                    this.backRectangle = new TypeViz.SVG.Rectangle();
                    this.backRectangle.Height = this.Height;
                    this.backRectangle.Width = this.Width;
                    this.backRectangle.Background = "Transparent";
                    this.RootVisual.Append(this.backRectangle);
                }
                this.TurnElementsVisible(true);

                var imax = 0, imin = 0;
                var deltax = this.Width / this.Data.length;
                var maxValue = this.Data.Max();
                var minValue = this.Data.Min();
                var scaling = maxValue === 0 ? 1 : this.Height / maxValue;
                var points = [];
                for (var i = 0; i < this.Data.length; i++) {
                    points.push(new Point(5 + i * deltax, this.Data[i] * scaling));
                    if (this.Data[i] == maxValue) imax = i;
                    if (this.Data[i] == minValue) imin = i;
                }

                this.path.Points = points;
                this.path.Stroke = this.stroke || "Silver";
                this.maxDot.Center = new Point(5 + imax * deltax, maxValue * scaling);
                this.maxDot.Radius = 3;
                this.maxDot.Background = "LimeGreen";
                this.maxDot.Stroke = "Transparent";

                this.minDot.Center = new Point(5 + imin * deltax, minValue * scaling);
                this.minDot.Radius = 3;
                this.minDot.Background = "OrangeRed";
                this.minDot.Stroke = "Transparent";

                this.midLine.From = new Point(0, this.Height / 2);
                this.midLine.To = new Point(this.Width, this.Height / 2);

                this.topLine.From = new Point(0, 0);
                this.topLine.To = new Point(this.Width, 0);

                this.bottomLine.From = new Point(0, this.Height);
                this.bottomLine.To = new Point(this.Width, this.Height);

                this.topText.Text = Math.round(maxValue);
                this.topText.Position = new Point(-15, 0);
                this.midText.Text = Math.round((maxValue + minValue) / 2);
                this.midText.Position = new Point(-15, this.Height / 2);
                this.bottomText.Text = Math.round(minValue);
                this.bottomText.Position = new Point(-15, this.Height);
            }


        }
    }
}