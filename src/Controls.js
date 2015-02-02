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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TypeViz;
(function (TypeViz) {
    var Point = TypeViz.Point;
    var Group = TypeViz.SVG.Group;
    var Path = TypeViz.SVG.Path;

    var Interval = TypeViz.Maths.Interval;

    /**
    DataViz controls.
    */
    (function (Controls) {
        /* Merges the given options (or null) with the default one.*/
        function transferOptions(defaultOptions, givenOptions) {
            if (givenOptions == null)
                return defaultOptions;
            var result = {};
            for (var option in defaultOptions) {
                if (givenOptions.hasOwnProperty(option))
                    result[option] = givenOptions[option];
                else
                    result[option] = defaultOptions[option];
            }
            return result;
        }

        /* The base class for controls aka widgets.*/
        var VisualizationBase = (function (_super) {
            __extends(VisualizationBase, _super);
            function VisualizationBase(model, source) {
                _super.call(this);
                this.RootVisual = new Group();
                this.nativeElement = this.RootVisual.Native;
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
            Object.defineProperty(VisualizationBase.prototype, "Native", {
                /* Gets the nativeElement SVG element which this visual wraps.*/
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VisualizationBase.prototype, "Position", {
                get: function () {
                    return this.RootVisual.Position;
                },
                /* Sets the position of this rectangle.*/
                set: function (p) {
                    this.RootVisual.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(VisualizationBase.prototype, "Source", {
                get: function () {
                    return this.source;
                },
                /* Defines the source of data for this viz inside the Model.*/
                set: function (value) {
                    this.source = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(VisualizationBase.prototype, "Cache", {
                get: function () {
                    return this.cache;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VisualizationBase.prototype, "Data", {
                get: function () {
                    return this.data;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(VisualizationBase.prototype, "Model", {
                get: function () {
                    return this.model;
                },
                set: function (value) {
                    this.detachFromModel();
                    this.model = value;
                    this.attachToModel();
                },
                enumerable: true,
                configurable: true
            });


            VisualizationBase.prototype.onModelChanged = function () {
                this.Update();
            };

            VisualizationBase.prototype.attachToModel = function () {
                if (this.model != null && this.model.Changed) {
                    this.model.Changed(this.onModelChanged);
                }
            };

            VisualizationBase.prototype.detachFromModel = function () {
                if (this.model != null && this.model.RemoveChangedHandler) {
                    this.model.RemoveChangedHandler(this.onModelChanged);
                }
            };

            VisualizationBase.prototype.Update = function () {
                if (this.model == null) {
                    console.warn("Update on Band called without Model.");
                    return;
                }
                if (this.Source == null) {
                    console.warn("Update on Band called without Source definition.");
                    return;
                }
                this.data = this.Source(this.model);
            };

            VisualizationBase.prototype.Present = function (gluons) {
                this.cleanupOldItems(gluons);
                for (var i = 0; i < gluons.length; i++) {
                    var gluon = gluons[i];

                    if (this.Cache.Contains(gluon.Id)) {
                        this.UpdateItem(gluon);
                    } else {
                        this.AddItem(gluon);
                    }
                }
            };

            VisualizationBase.prototype.cleanupOldItems = function (gluons) {
                this.Cache.ForEach(function (key, value) {
                    for (var j = 0; j < gluons.length; j++) {
                        if (gluons[j].Node == key)
                            return;
                    }
                    this.RemoveItem(value);
                }, this);
            };

            VisualizationBase.prototype.UpdateItem = function (gluon) {
            };

            VisualizationBase.prototype.RemoveItem = function (gluon) {
            };

            VisualizationBase.prototype.AddItem = function (gluon) {
            };
            return VisualizationBase;
        })(TypeViz.SVG.Visual);
        Controls.VisualizationBase = VisualizationBase;

        /*The visualization node which glues the raw data and the visual.*/
        var IGluon = (function () {
            function IGluon() {
            }
            return IGluon;
        })();
        Controls.IGluon = IGluon;

        /*Creates a band diagram.*/
        var BandDiagram = (function (_super) {
            __extends(BandDiagram, _super);
            function BandDiagram() {
                _super.apply(this, arguments);
            }
            /**
            * Recalculates the chords from the given model.
            */
            BandDiagram.prototype.Update = function () {
                _super.prototype.Update.call(this);
                if (this.Data == null)
                    return;
                var adapter = new BandFactory();
                var gluon = adapter.Generate(this.Data);
                if (gluon != null) {
                    this.Present(gluon);
                }
            };

            BandDiagram.prototype.UpdateItem = function (gluon) {
                this.Cache.Get(gluon.Id).Data = gluon["Data"];
            };

            BandDiagram.prototype.AddItem = function (gluon) {
                this.RootVisual.Append(gluon.Visual);
                this.Cache.Set(gluon.Id, gluon.Visual);
            };
            return BandDiagram;
        })(VisualizationBase);
        Controls.BandDiagram = BandDiagram;

        var BandFactory = (function () {
            function BandFactory(options) {
                this.source = function (d) {
                    return d.Source;
                };
                this.endAngle = function (d) {
                    return d.EndAngle;
                };
                this.backgroundFunctor = function (d) {
                    return d.Background;
                };
                this.target = function (d) {
                    return d.Target;
                };
                this.radius = function (d) {
                    return d.Radius;
                };
                this.startAngle = function (d) {
                    return d.StartAngle;
                };
                this.arcOffset = -Math.PI / 2;
                this.arcMax = 2 * Math.PI - 1e-6;
                this.id = function (d) {
                    return TypeViz.Hash(d);
                };
            }
            Object.defineProperty(BandFactory.prototype, "Id", {
                get: function () {
                    return this.id;
                },
                /**
                * Defines how the id of the data node is fetched
                */
                set: function (value) {
                    this.id = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Background", {
                get: function () {
                    return this.backgroundFunctor;
                },
                set: function (value) {
                    this.backgroundFunctor = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Source", {
                get: function () {
                    return this.source;
                },
                set: function (value) {
                    this.source = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Target", {
                get: function () {
                    return this.target;
                },
                set: function (value) {
                    this.target = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "Radius", {
                get: function () {
                    return this.radius;
                },
                set: function (value) {
                    this.radius = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "StartAngle", {
                get: function () {
                    return this.startAngle;
                },
                set: function (value) {
                    this.startAngle = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(BandFactory.prototype, "EndAngle", {
                get: function () {
                    return this.endAngle;
                },
                set: function (value) {
                    this.endAngle = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            BandFactory.prototype.equals = function (a, b) {
                return a.a0 == b.a0 && a.a1 == b.a1;
            };

            BandFactory.prototype.Generate = function (data, i) {
                if (data instanceof Array) {
                    var result = [];
                    for (var j = 0; j < data.length; j++) {
                        var dataNode = data[j];
                        result.push(this.wrap(dataNode));
                    }
                    return result;
                } else {
                    return [this.wrap(data)];
                }
            };

            BandFactory.prototype.wrap = function (dataNode) {
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
                text.Anchor = 1 /* Center */;
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
            };

            BandFactory.prototype.calculate = function (data, i) {
                var startCoordinates = this.getCoordinates(this, this.source, data, i), endCoordinates = this.getCoordinates(this, this.target, data, i);
                return {
                    data: "M" + startCoordinates.p0 + this.arc(startCoordinates.r, startCoordinates.p1, startCoordinates.a1 - startCoordinates.a0) + (this.equals(startCoordinates, endCoordinates) ? this.curve(startCoordinates.r, startCoordinates.p1, startCoordinates.r, startCoordinates.p0) : this.curve(startCoordinates.r, startCoordinates.p1, endCoordinates.r, endCoordinates.p0) + this.arc(endCoordinates.r, endCoordinates.p1, endCoordinates.a1 - endCoordinates.a0) + this.curve(endCoordinates.r, endCoordinates.p1, startCoordinates.r, startCoordinates.p0)) + "Z",
                    from: startCoordinates,
                    to: endCoordinates
                };
            };

            BandFactory.prototype.arc = function (r, p, a) {
                return "A" + r + "," + r + " 0 " + +(a > Math.PI) + ",1 " + p;
            };

            BandFactory.prototype.curve = function (r0, p0, r1, p1) {
                return "Q 0,0 " + p1;
            };

            BandFactory.prototype.getCoordinates = function (self, pickFunction, d, i) {
                var endPointData = pickFunction.call(self, d, i), r = this.radius.call(self, endPointData, i), a0 = this.startAngle.call(self, endPointData, i) + this.arcOffset, a1 = this.endAngle.call(self, endPointData, i) + this.arcOffset;
                return {
                    r: r,
                    a0: a0,
                    a1: a1,
                    p0: [r * Math.cos(a0), r * Math.sin(a0)],
                    p1: [r * Math.cos(a1), r * Math.sin(a1)]
                };
            };
            return BandFactory;
        })();
        Controls.BandFactory = BandFactory;

        var WheelFactory = (function () {
            function WheelFactory() {
                this.title = function (d) {
                    return d.Name || "";
                };
                this.id = function (d) {
                    return TypeViz.Hash(d);
                };
                this.weights = [];
                this.weight = function (d) {
                    return d.Weight;
                };
                this.innerRadius = 200;
                this.outerRadius = 250;
                this.colorFunction = function (data, i) {
                    return TypeViz.Media.Colors.RandomBlue.AsHex6;
                };
            }
            Object.defineProperty(WheelFactory.prototype, "Name", {
                get: function () {
                    return this.title;
                },
                set: function (value) {
                    this.title = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelFactory.prototype, "Id", {
                get: function () {
                    return this.id;
                },
                /* Defines how the id of the data node is fetched */
                set: function (value) {
                    this.id = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(WheelFactory.prototype, "ColorFunction", {
                get: function () {
                    return this.colorFunction;
                },
                set: function (value) {
                    this.colorFunction = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(WheelFactory.prototype, "Weight", {
                get: function () {
                    return this.weight;
                },
                set: function (value) {
                    this.weight = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelFactory.prototype, "InnerRadius", {
                get: function () {
                    return this.innerRadius;
                },
                set: function (value) {
                    this.innerRadius = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelFactory.prototype, "OuterRadius", {
                get: function () {
                    return this.outerRadius;
                },
                set: function (value) {
                    this.outerRadius = value;
                },
                enumerable: true,
                configurable: true
            });


            WheelFactory.prototype.normalizeData = function (data) {
                var sum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += this.Weight(data[i]);
                }
                if (sum == 0)
                    throw "Could not find a suitable normalization.";
                for (var i = 0; i < data.length; i++) {
                    this.weights[i] = this.Weight(data[i]) / sum;
                }
            };

            WheelFactory.prototype.Generate = function (data) {
                this.normalizeData(data);
                var startAngle = 0;
                var result = [];
                for (var i = 0; i < data.length; i++) {
                    var node = data[i];
                    var title = this.Name(node);
                    var id = this.id(node);
                    var g = new TypeViz.SVG.Group();
                    var arc = new TypeViz.SVG.Arc();
                    arc.Background = this.colorFunction(node, i);
                    arc.InnerRadius = this.InnerRadius;
                    arc.OuterRadius = this.OuterRadius;
                    arc.StartAngle = startAngle;
                    arc.StrokeThickness = 0;
                    arc.EndAngle = startAngle + this.weights[i] * Math.PI * 2;
                    g.Append(arc);
                    var tb = new TypeViz.SVG.TextBlock();
                    var halfAngle = (arc.StartAngle + arc.EndAngle) / 2;
                    var halfRadius = (arc.InnerRadius + arc.OuterRadius) / 2;
                    tb.Position = new TypeViz.Point(halfRadius * Math.sin(halfAngle), -halfRadius * Math.cos(halfAngle));
                    tb.Text = Math.round(this.weights[i] * 100) + "%";
                    tb.Anchor = 1 /* Center */;
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
            };
            return WheelFactory;
        })();
        Controls.WheelFactory = WheelFactory;

        /*Like a pie chart but more generic.*/
        var WheelChart = (function (_super) {
            __extends(WheelChart, _super);
            function WheelChart(model, source) {
                _super.call(this, model, source);
            }
            Object.defineProperty(WheelChart.prototype, "InnerRadius", {
                get: function () {
                    return this.factory.InnerRadius;
                },
                set: function (value) {
                    this.factory.InnerRadius = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(WheelChart.prototype, "OuterRadius", {
                get: function () {
                    return this.factory.OuterRadius;
                },
                set: function (value) {
                    this.factory.OuterRadius = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(WheelChart.prototype, "ColorFunction", {
                get: function () {
                    return this.factory.ColorFunction;
                },
                set: function (value) {
                    this.factory.ColorFunction = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });

            WheelChart.prototype.Update = function () {
                _super.prototype.Update.call(this);
                if (this.Data == null)
                    return;

                var gluon = this.Factory.Generate(this.Data);
                if (gluon != null) {
                    this.Present(gluon);
                }
            };

            Object.defineProperty(WheelChart.prototype, "Factory", {
                get: function () {
                    if (this.factory == null)
                        this.factory = new WheelFactory();
                    return this.factory;
                },
                enumerable: true,
                configurable: true
            });

            WheelChart.prototype.UpdateItem = function (gluon) {
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
            };

            WheelChart.prototype.AddItem = function (gluon) {
                this.RootVisual.Append(gluon.Visual);
                this.Cache.Set(gluon.Id, gluon.Visual);
            };
            return WheelChart;
        })(VisualizationBase);
        Controls.WheelChart = WheelChart;

        (function (AxisDirection) {
            AxisDirection[AxisDirection["Horizontal"] = 0] = "Horizontal";
            AxisDirection[AxisDirection["Vertical"] = 1] = "Vertical";
        })(Controls.AxisDirection || (Controls.AxisDirection = {}));
        var AxisDirection = Controls.AxisDirection;

        Controls.AxisDefaultOptions = {
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
        Controls.CircularAxisDefaultOptions = {
            Interval: [0, 100],
            Radius: 200
        };

        var CircularAxis = (function (_super) {
            __extends(CircularAxis, _super);
            function CircularAxis(options) {
                _super.call(this);
                this.RootVisual = new Group();
                this.nativeElement = this.RootVisual.Native;
                this.Initialize();
                this.options = transferOptions(Controls.CircularAxisDefaultOptions, options);
                this.options["Interval"] = this.ensureExtent(this.options["Interval"]);

                this.Update();
            }
            Object.defineProperty(CircularAxis.prototype, "Position", {
                get: function () {
                    return this.RootVisual.Position;
                },
                /**
                * Sets the position of this rectangle.
                */
                set: function (p) {
                    this.RootVisual.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            CircularAxis.prototype.ensureExtent = function (value) {
                return (value instanceof Interval) ? value : new Interval(value);
            };

            CircularAxis.prototype.Update = function () {
                this.RootVisual.Clear();
                var circle = new TypeViz.SVG.Circle();
                circle.Radius = this.options.Radius;
                this.RootVisual.Append(circle);
            };
            return CircularAxis;
        })(TypeViz.SVG.Visual);
        Controls.CircularAxis = CircularAxis;

        var Axis = (function (_super) {
            __extends(Axis, _super);
            function Axis(options) {
                _super.call(this);
                this.RootVisual = new Group();
                this.nativeElement = this.RootVisual.Native;
                this.Initialize();
                this.options = transferOptions(Controls.AxisDefaultOptions, options);
                this.options["HorizontalExtent"] = this.ensureExtent(this.options["HorizontalExtent"]);
                this.options["VerticalExtent"] = this.ensureExtent(this.options["VerticalExtent"]);
                this.Stroke = "Dimgray";
                this.Update();
            }
            Object.defineProperty(Axis.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Axis.prototype, "HorizontalOffset", {
                get: function () {
                    return this.options.HorizontalOffset;
                },
                set: function (value) {
                    this.options.HorizontalOffset = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "VerticalOffset", {
                get: function () {
                    return this.options.VerticalOffset;
                },
                set: function (value) {
                    this.options.VerticalOffset = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "Position", {
                get: function () {
                    return this.RootVisual.Position;
                },
                /**
                * Sets the position of this rectangle.
                */
                set: function (p) {
                    this.RootVisual.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "Interval", {
                get: function () {
                    return this.options.HorizontalExtent;
                },
                set: function (value) {
                    this.horizontalExtent = this.ensureExtent(value);
                    this.options.HorizontalExtent = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "HorizontalTickSpace", {
                get: function () {
                    return this.options.HorizontalTickSpace;
                },
                /**
                * Sets the spacing (in pixels) between horizontal units.
                */
                set: function (value) {
                    this.options.HorizontalTickSpace = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "VerticalTickSpace", {
                get: function () {
                    return this.options.VerticalTickSpace;
                },
                /**
                * Sets the spacing (in pixels) between vertical units.
                */
                set: function (value) {
                    this.options.VerticalTickSpace = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "TickSize", {
                get: function () {
                    return this.options.TickSize;
                },
                /**
                * Sets the height/width of the ticks.
                */
                set: function (value) {
                    this.options.TickSize = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "HorizontalStep", {
                get: function () {
                    return this.options.HorizontalStep;
                },
                /**
                * How many ticks are skipped.
                */
                set: function (value) {
                    this.options.HorizontalStep = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Axis.prototype, "Stroke", {
                get: function () {
                    return this.stroke;
                },
                set: function (value) {
                    this.stroke = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Axis.prototype, "VerticalStep", {
                get: function () {
                    return this.options.VerticalStep;
                },
                set: function (value) {
                    this.options.VerticalStep = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });


            Axis.prototype.OnAppendToCanvas = function (canvas) {
                if (this.options.ShowHorizontalArrowHead)
                    canvas.AddMarker(this.horizontalMarker);
                if (this.options.ShowVerticalArrowHead)
                    canvas.AddMarker(this.verticalMarker);
            };

            Axis.prototype.OnDetachFromCanvas = function (canvas) {
                if (this.horizontalMarker != null)
                    canvas.RemoveMarker(this.horizontalMarker);
                if (this.verticalMarker != null)
                    canvas.RemoveMarker(this.verticalMarker);
            };

            Axis.prototype.ensureExtent = function (value) {
                return (value instanceof Interval) ? value : new Interval(value);
            };

            Axis.prototype.Update = function () {
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
                        this.horizontalMarker = TypeViz.SVG.Markers.ArrowEnd;
                        this.horizontalMarker.Path.Stroke = this.Stroke;
                        this.horizontalMarker.Path.Background = this.stroke;
                        horizontalLine.MarkerEnd = this.horizontalMarker;
                    }
                    for (var i = 0; i < amount; i += this.options.HorizontalStep) {
                        var tick = new TypeViz.SVG.Line(new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, 0), new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, this.options.TickSize));
                        tick.Stroke = this.Stroke;
                        this.horizontalGroup.Append(tick);
                        if (this.options.ShowHorizontalLabels) {
                            label = new TypeViz.SVG.TextBlock();
                            label.Text = i.toString();
                            label.Position = new Point(this.options.HorizontalOffset + i * this.options.HorizontalTickSpace, this.options.TickSize + 2);
                            label.dy = 1;
                            label.Background = this.Stroke;
                            label.Anchor = 1 /* Center */;
                            this.horizontalGroup.Append(label);
                        }
                    }
                    this.RootVisual.Append(this.horizontalGroup);
                }

                if (this.options.ShowVertical) {
                    amount = this.options.VerticalExtent.Size;
                    tickSize = amount * this.options.VerticalTickSpace;
                    totalSize = this.options.VerticalOffset + tickSize + 10;
                    var verticalLine = new TypeViz.SVG.Line();
                    verticalLine.From = new Point(0, totalSize);
                    verticalLine.To = new Point(0, 0);
                    verticalLine.Stroke = this.Stroke;
                    this.verticalGroup = new Group();
                    this.verticalGroup.Append(verticalLine);
                    if (this.options.ShowVerticalArrowHead) {
                        this.verticalMarker = TypeViz.SVG.Markers.ArrowEnd;
                        this.verticalMarker.Path.Stroke = this.stroke;
                        this.verticalMarker.Path.Background = this.stroke;
                        verticalLine.MarkerEnd = this.verticalMarker;
                    }

                    if (this.options.ShowHorizontal)
                        this.horizontalGroup.Position = new Point(0, totalSize);
                    for (var i = 0; i < amount; i += this.options.VerticalStep) {
                        var tick = new TypeViz.SVG.Line(new Point(0, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace)), new Point(-this.options.TickSize, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace)));
                        tick.Stroke = this.Stroke;
                        this.verticalGroup.Append(tick);
                        if (this.options.ShowVerticalLabels) {
                            label = new TypeViz.SVG.TextBlock();
                            label.Text = i.toString();
                            label.Position = new Point(-this.options.TickSize - 2, totalSize - (this.options.VerticalOffset + i * this.options.VerticalTickSpace));
                            label.dx = -10;
                            label.dy = 0.3;
                            label.Background = this.Stroke;
                            label.Anchor = 1 /* Center */;
                            this.verticalGroup.Append(label);
                        }
                    }
                    this.RootVisual.Append(this.verticalGroup);
                }
            };
            return Axis;
        })(TypeViz.SVG.Visual);
        Controls.Axis = Axis;

        var Popup = (function () {
            function Popup(content) {
                var anchors = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    anchors[_i] = arguments[_i + 1];
                }
                /* The amount of millisecs to wait before showing the content.*/
                this.Delay = 500;
                /* The amount of millisecs to stay after the mouse has left the anchor.*/
                this.Remains = 500;
                if (content)
                    this.Content = content;
                this.visualsMap = new TypeViz.Map();
                if (anchors) {
                    this.anchors = anchors;
                }
            }
            Object.defineProperty(Popup.prototype, "Position", {
                get: function () {
                    return this.position;
                },
                set: function (value) {
                    this.position = TypeViz.Functor(value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Popup.prototype, "Content", {
                get: function () {
                    return this.content;
                },
                set: function (value) {
                    if (TypeViz.IsDefined(value)) {
                        this.content = TypeViz.Functor(value);
                        this.content(null).IsVisible = false;
                    } else {
                        this.content = null;
                    }
                },
                enumerable: true,
                configurable: true
            });

            /* Adds a visual which should trigger the popup. */
            Popup.prototype.AddAnchor = function (anchor) {
                if (anchor == null)
                    throw "Cannot add a null anchor.";
                var popup = this;
                anchor.MouseOver.call(anchor, (function (e) {
                    setTimeout(function () {
                        popup.showContent(anchor, e);
                    }, popup.Delay);
                }));

                anchor.MouseOut.call(anchor, (function (e) {
                    setTimeout(function () {
                        popup.hideContent(anchor, e);
                    }, popup.Remains);
                }));
            };

            Popup.prototype.hideContent = function (anchor, e) {
                if (this.visualsMap.ContainsKey(anchor.Id)) {
                    var visual = this.visualsMap.Get(anchor.Id);
                    if (TypeViz.IsDefined(visual))
                        visual.IsVisible = false;
                }
            };

            Popup.prototype.showContent = function (anchor, e) {
                if (this.content == null)
                    return;
                var visual = this.content(anchor);
                if (TypeViz.IsDefined(visual)) {
                    visual.IsVisible = true;
                    if (TypeViz.IsDefined(this.position)) {
                        visual.Position = this.position(anchor, e);
                    } else {
                        var p = anchor.Position;
                        visual.Position = new TypeViz.Point(p.X + anchor.Width / 2, p.Y + anchor.Height + 2);
                    }
                    this.visualsMap.Set(anchor.Id, visual);
                }
            };
            return Popup;
        })();
        Controls.Popup = Popup;

        (function (TextAlign) {
            TextAlign[TextAlign["Left"] = 0] = "Left";
            TextAlign[TextAlign["Right"] = 1] = "Right";
            TextAlign[TextAlign["Center"] = 2] = "Center";
            TextAlign[TextAlign["Justify"] = 3] = "Justify";
        })(Controls.TextAlign || (Controls.TextAlign = {}));
        var TextAlign = Controls.TextAlign;
        ;

        var TextLine = (function () {
            function TextLine(parent, length, content) {
                this.parent = parent;
                this.length = length;
                this.content = content;
            }
            return TextLine;
        })();
        Controls.TextLine = TextLine;

        /* Text block with wrapping.*/
        var TextWrap = (function (_super) {
            __extends(TextWrap, _super);
            function TextWrap() {
                _super.call(this);
                this.lines = [];
                this.textBlock = new TypeViz.SVG.TextBlock();
                this.group = new TypeViz.SVG.Group();
                this.group.Append(this.textBlock);
                this.nativeElement = this.group.Native;
                this.Width = 200;
                this.Update();
            }
            Object.defineProperty(TextWrap.prototype, "Anchor", {
                get: function () {
                    return this.textBlock.Anchor;
                },
                set: function (anchor) {
                    this.textBlock.Anchor = anchor;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextWrap.prototype, "Text", {
                get: function () {
                    return this.text;
                },
                set: function (value) {
                    this.text = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });

            TextWrap.prototype.OnAppendToCanvas = function () {
                // the measuring of the text effectively only works if the element is part of the UI
                this.Update();
            };
            TextWrap.prototype.Append = function (span) {
                this.textBlock.Native.appendChild(span.Native);
            };

            Object.defineProperty(TextWrap.prototype, "Align", {
                get: function () {
                    return this.align;
                },
                set: function (value) {
                    this.align = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextWrap.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextWrap.prototype, "Position", {
                /**
                * Gets the position of this text block.
                */
                get: function () {
                    return this.group.Position;
                },
                /**
                * Sets the position of this text block.
                */
                set: function (p) {
                    this.group.Position = p;
                },
                enumerable: true,
                configurable: true
            });


            TextWrap.prototype.Update = function () {
                this.splitString();
                this.layout();
            };

            TextWrap.prototype.layout = function () {
                if (this.lines.length == 0)
                    return;
                this.clearPresentation();
                var lines = (new Array(0)).concat(this.lines);
                var anchor = 0 /* Left */;
                if (this.Align == 2 /* Center */) {
                    anchor = 1 /* Center */;
                } else if (this.Align == 1 /* Right */) {
                    anchor = 3 /* Right */;
                }
                for (var i = 0; i < lines.length; i++) {
                    var x = 0;
                    var line = lines[i];

                    var tspan = new TypeViz.SVG.TextSpan();
                    tspan.Native.appendChild(document.createTextNode(line.content.join(' ')));
                    if (this.Align == 3 /* Justify */) {
                        var space = (this.Width - line.Width) / (line.content.length - 1);
                        space = (i != lines.length - 1) ? space : 0;
                        tspan.Native.style.setProperty('word-spacing', space + 'px');
                    } else if (this.Align == 2 /* Center */) {
                        anchor = 1 /* Center */;
                        x = this.Width / 2;
                    } else if (this.Align == 1 /* Right */) {
                        anchor = 3 /* Right */;
                        x = this.Width;
                    }
                    tspan.X = x;
                    tspan.dy = 1.2;

                    this.Append(tspan);
                }
                this.textBlock.Anchor = anchor;
            };
            Object.defineProperty(TextWrap.prototype, "Foreground", {
                get: function () {
                    return this.Native.style.fill;
                },
                /**
                * Sets the fill of the circle.
                */
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            TextWrap.prototype.Clear = function () {
            };

            TextWrap.prototype.clearPresentation = function () {
                this.textBlock.Native.textContent = null;
            };

            /**
            * Splits the input in lines.
            */
            TextWrap.prototype.splitString = function () {
                var text = this.Text;
                this.clearPresentation();
                if (text == null || text.length == 0)
                    return;
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
            };
            return TextWrap;
        })(TypeViz.SVG.Visual);
        Controls.TextWrap = TextWrap;

        var SparkLine = (function (_super) {
            __extends(SparkLine, _super);
            function SparkLine(model, source) {
                _super.call(this, model, source);
                this.stroke = "Silver";
            }
            Object.defineProperty(SparkLine.prototype, "Stroke", {
                get: function () {
                    return this.stroke;
                },
                set: function (value) {
                    this.stroke = value;
                    this.Update();
                },
                enumerable: true,
                configurable: true
            });
            SparkLine.prototype.TurnElementsVisible = function (isVisible) {
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
            };
            SparkLine.prototype.getTextBlock = function () {
                var tb = new TypeViz.SVG.TextBlock();
                tb.Background = "White";
                tb.Opacity = 0.2;
                tb.FontSize = 7;
                this.RootVisual.Append(tb);
                return tb;
            };
            SparkLine.prototype.getLine = function () {
                var line = new TypeViz.SVG.Line();
                line.Stroke = "White";
                line.Opacity = 0.2;
                this.RootVisual.Prepend(line);
                return line;
            };
            SparkLine.prototype.Update = function () {
                var BACKOPACITY = 0.2;
                _super.prototype.Update.call(this);
                if (TypeViz.IsUndefined(this.Data) || !(this.Data instanceof Array) || this.Data.length === 0) {
                    this.TurnElementsVisible(false);
                    return;
                }

                if (TypeViz.IsUndefined(this.path)) {
                    this.path = new TypeViz.SVG.Path();
                    this.path.Opacity = 0.8;
                    this.RootVisual.Append(this.path);
                    this.maxDot = new TypeViz.SVG.Circle();
                    this.RootVisual.Append(this.maxDot);
                    this.minDot = new TypeViz.SVG.Circle();
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
                    if (this.Data[i] == maxValue)
                        imax = i;
                    if (this.Data[i] == minValue)
                        imin = i;
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
            };
            return SparkLine;
        })(VisualizationBase);
        Controls.SparkLine = SparkLine;
    })(TypeViz.Controls || (TypeViz.Controls = {}));
    var Controls = TypeViz.Controls;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=Controls.js.map
