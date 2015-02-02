/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Maths.ts" />
///<reference path='Model.ts' />
///<reference path='Animation.ts' />
///<reference path='SVG.ts' />
///<reference path='Arrays.ts' />
///<reference path='Structures.ts' />
var TypeViz;
(function (TypeViz) {
    /*A whole universe of diagramming and graph layout.*/
    (function (Diagramming) {
        var SVG = TypeViz.SVG;
        var Group = TypeViz.SVG.Group;

        var Point = TypeViz.Point;
        var Rect = TypeViz.Rect;

        var PathBase = TypeViz.SVG.PathBase;

        /*Graph layout undoredo unit */
        var LayoutUndoUnit = (function () {
            function LayoutUndoUnit(initialState, finalState, animate) {
                if (TypeViz.IsUndefined(animate)) {
                    this.animate = false;
                } else {
                    this.animate = animate;
                }
                this.initialState = initialState;
                this._finalState = finalState;
                this.Title = "Diagram layout";
            }
            LayoutUndoUnit.prototype.Undo = function () {
                this.setState(this.initialState);
            };
            LayoutUndoUnit.prototype.Redo = function () {
                this.setState(this._finalState);
            };
            LayoutUndoUnit.prototype.setState = function (state) {
                var diagram = state.diagram;
                if (this.animate) {
                    //todo: have a look at connection points
                    state.linkMap.ForEach(function (id, points) {
                        var conn = diagram.getId(id);
                        conn.visible(false);
                        if (conn) {
                            conn.Points = points;
                        }
                    });
                    var ticker = new TypeViz.Animation.Ticker();
                    ticker.AddAdapter(new TypeViz.Diagramming.NodePositionAdapter(state));
                    ticker.onComplete(function () {
                        state.linkMap.ForEach(function (id) {
                            var conn = diagram.getId(id);
                            conn.IsVisible = true;
                        });
                    });
                    ticker.play();
                } else {
                    state.nodeMap.ForEach(function (id, bounds) {
                        var shape = diagram.getId(id);
                        if (shape) {
                            shape.Rectangle = bounds;
                        }
                    });

                    /*
                    todo: connection points  */
                    state.linkMap.ForEach(function (id, points) {
                        var conn = diagram.getId(id);
                        if (conn) {
                            var ps = [];

                            for (var i = 0; i < points.length; i++) {
                                ps.push(new Point(points[i].x, points[i].y));
                            }
                            conn.Points = ps;
                        }
                    });
                }
                /*for (var i = 0; i < graph.links.length; i++) {
                var link = graph.links[i];
                var p = []
                if (link.points != null) {
                p.addRange(link.points);
                }
                */
                /* var sb = link.source.associatedShape.bounds();
                p.prepend(new diagram.Point(sb.x, sb.y));
                var eb = link.target.associatedShape.bounds();
                p.append(new diagram.Point(eb.x, eb.y));*/
                /*
                
                link.associatedConnection.points(p);
                }*/
            };
            return LayoutUndoUnit;
        })();
        Diagramming.LayoutUndoUnit = LayoutUndoUnit;

        /**
        * The actual diagramming surface.
        */
        var DiagramSurface = (function () {
            function DiagramSurface(div) {
                var _this = this;
                this.currentPosition = new TypeViz.Point(0, 0);
                this.isShiftPressed = false;
                this.pan = Point.Empty;
                this.isPanning = false;
                this.zoomRate = 1.1;
                this.undoRedoService = new UndoRedoService();
                /**
                * The collection of items contained within this diagram.
                */
                this.shapes = [];
                this.connections = [];
                this.lastUsedShapeTemplate = null;
                this.hoveredItem = null;
                this.newItem = null;
                this.newConnection = null;
                this.selector = null;
                this.isManipulating = false;
                this.currentZoom = 1.0;
                this.isLayouting = false;
                // the hosting div element
                this.div = div;

                // the root SVG Canvas
                this.canvas = new SVG.Canvas(div);
                this.canvas.Width = div.clientWidth;
                this.canvas.Height = div.clientHeight;

                // the main layer
                this.mainLayer = new SVG.Group();
                this.mainLayer.Id = "mainLayer";

                this.canvas.Append(this.mainLayer);

                // the default theme
                this.theme = {
                    background: "#fff",
                    connection: "#000",
                    selection: "#ff8822",
                    connector: "#31456b",
                    connectorBorder: "#fff",
                    connectorHoverBorder: "#000",
                    connectorHover: "#0c0"
                };

                // some switches
                this.isSafari = typeof navigator.userAgent.split("WebKit/")[1] != "undefined";
                this.isFirefox = navigator.appVersion.indexOf('Gecko/') >= 0 || ((navigator.userAgent.indexOf("Gecko") >= 0) && !this.isSafari && (typeof navigator.appVersion != "undefined"));

                this.MouseDownHandler = function (e) {
                    _this.MouseDown(e);
                };
                this.MouseUpHandler = function (e) {
                    _this.MouseUp(e);
                };
                this.MouseMoveHandler = function (e) {
                    _this.MouseMove(e);
                };
                this._doubleClickHandler = function (e) {
                    _this.doubleClick(e);
                };
                this._touchStartHandler = function (e) {
                    _this.touchStart(e);
                };
                this._touchEndHandler = function (e) {
                    _this.touchEnd(e);
                };
                this._touchMoveHandler = function (e) {
                    _this.touchMove(e);
                };
                this.KeyDownHandler = function (e) {
                    _this.KeyDown(e);
                };
                this.KeyPressHandler = function (e) {
                    _this.KeyPress(e);
                };
                this.KeyUpHandler = function (e) {
                    _this.keyUp(e);
                };

                this.canvas.MouseMove(this.MouseMoveHandler);
                this.canvas.MouseDown(this.MouseDownHandler);
                this.canvas.MouseUp(this.MouseUpHandler);
                this.canvas.KeyDown = this.KeyDownHandler;
                this.canvas.KeyPress = this.KeyPressHandler;

                //this.todelete.addEventListener("touchstart", this._touchStartHandler, false);
                //this.todelete.addEventListener("touchend", this._touchEndHandler, false);
                //this.todelete.addEventListener("touchmove", this._touchMoveHandler, false);
                //this.todelete.addEventListener("dblclick", this._doubleClickHandler, false);
                //this.todelete.addEventListener("keydown", this.KeyDownHandler, false);
                //this.todelete.addEventListener("KeyPress", this.KeyPressHandler, false);
                //this.todelete.addEventListener("keyup", this.KeyUpHandler, false);
                this.selector = new Selector(this);
                this.listToWheel(this);
            }
            /*Applies a graph layout algorithm to organize it.*/
            DiagramSurface.prototype.Layout = function (settings) {
                if (typeof settings === "undefined") { settings = null; }
                this.isLayouting = true;

                // TODO: raise layout event?
                if (TypeViz.IsUndefined(settings)) {
                    settings = new Diagramming.LayoutSettings();
                }
                if (TypeViz.IsUndefined(settings.Type)) {
                    settings.Type = 2 /* ForceDirectedLayout */;
                }
                var l;
                switch (settings.Type) {
                    case 0 /* TreeLayout */:
                        l = new TypeViz.Diagramming.TreeLayout(this);
                        break;

                    case 1 /* LayeredLayout */:
                        l = new TypeViz.Diagramming.LayeredLayout(this);
                        break;

                    case 2 /* ForceDirectedLayout */:
                        l = new TypeViz.Diagramming.SpringLayout(this);
                        break;
                    default:
                        throw "Layout algorithm '" + settings.Type + "' is not supported.";
                }
                var initialState = new TypeViz.Diagramming.LayoutState(this);
                var finalState = l.Layout(settings);
                if (finalState) {
                    var unit = new TypeViz.Diagramming.LayoutUndoUnit(initialState, finalState, settings.Animate ? settings.Animate : null);
                    this.undoRedoService.Add(unit);
                }
                this.isLayouting = false;
            };

            /**
            * Generates a random diagram.
            * @param shapeCount The number of shapes the random diagram should contain.
            * @param maxIncidence The maximum degree the shapes can have.
            * @param isTree Whether the generated diagram should be a tree
            * @param layoutType The optional layout type to apply after the diagram is generated.
            */
            DiagramSurface.prototype.randomDiagram = function (shapeCount, maxIncidence, isTree, randomSize) {
                var g = TypeViz.Diagramming.Graph.Utils.createRandomConnectedGraph(shapeCount, maxIncidence, isTree);
                TypeViz.Diagramming.Graph.Utils.createDiagramFromGraph(this, g, false, randomSize);
            };

            Object.defineProperty(DiagramSurface.prototype, "Shapes", {
                /**
                * The collection of items contained within this diagram.
                */
                get: function () {
                    return this.shapes;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DiagramSurface.prototype, "Connections", {
                get: function () {
                    return this.connections;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DiagramSurface.prototype, "Canvas", {
                //TODO: note to Swa: ensure you delete this after the importer is working!!
                get: function () {
                    return this.canvas;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(DiagramSurface.prototype, "Zoom", {
                get: function () {
                    return this.currentZoom;
                },
                set: function (v) {
                    if (this.mainLayer == null)
                        throw "The 'mainLayer' is not present.";

                    //around 0.5 something exponential happens...!?
                    this.currentZoom = Math.min(Math.max(v, 0.55), 2.0);

                    this.mainLayer.Native.setAttribute("transform", "translate(" + this.pan.X + "," + this.pan.Y + ")scale(" + this.currentZoom + "," + this.currentZoom + ")");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DiagramSurface.prototype, "Pan", {
                get: function () {
                    return this.pan;
                },
                set: function (v) {
                    this.pan = v;
                    this.mainLayer.Native.setAttribute("transform", "translate(" + this.pan.X + "," + this.pan.Y + ")scale(" + this.currentZoom + "," + this.currentZoom + ")");
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DiagramSurface.prototype, "MainLayer", {
                get: function () {
                    return this.mainLayer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DiagramSurface.prototype, "Element", {
                get: function () {
                    return this.div;
                },
                enumerable: true,
                configurable: true
            });

            DiagramSurface.prototype.listToWheel = function (self) {
                var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
                var handler = function (e) {
                    var evt = window.event || e;
                    if (evt.preventDefault)
                        evt.preventDefault();
                    else
                        evt.returnValue = false;

                    self.zoomViaMouseWheel(evt, self);
                    return;
                };
                if (self.div.attachEvent)
                    self.div.attachEvent("on" + mousewheelevt, handler);
                else if (self.div.addEventListener)
                    self.div.addEventListener(mousewheelevt, handler, false);
            };
            DiagramSurface.prototype.zoomViaMouseWheel = function (mouseWheelEvent, diagram) {
                var evt = window.event || mouseWheelEvent;
                var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta;
                var z = diagram.Zoom;
                ;
                if (delta > 0)
                    z *= this.zoomRate;
                else
                    z /= this.zoomRate;

                diagram.Zoom = z;

                /* When the mouse is over the webpage, don't let the mouse wheel scroll the entire webpage: */
                mouseWheelEvent.cancelBubble = true;
                return false;
            };

            DiagramSurface.prototype.Focus = function () {
                this.canvas.Focus();
            };

            Object.defineProperty(DiagramSurface.prototype, "Theme", {
                get: function () {
                    return this.theme;
                },
                set: function (value) {
                    this.theme = value;
                },
                enumerable: true,
                configurable: true
            });

            DiagramSurface.prototype.Delete = function (undoable) {
                if (typeof undoable === "undefined") { undoable = false; }
                this.DeleteCurrentSelection(undoable);
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            Object.defineProperty(DiagramSurface.prototype, "Selection", {
                get: function () {
                    return this.getCurrentSelection();
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Clears the current diagram and the undo-redo stack.
            */
            DiagramSurface.prototype.Clear = function () {
                this.currentZoom = 1.0;
                this.pan = Point.Empty;
                this.shapes = [];
                this.connections = [];
                this.canvas.Clear();
                this.mainLayer = new SVG.Group();
                this.mainLayer.Id = "mainLayer";
                this.canvas.Append(this.mainLayer);
                this.undoRedoService = new UndoRedoService();
            };

            DiagramSurface.prototype.getCurrentSelection = function () {
                var selection = [];
                for (var i = 0; i < this.shapes.length; i++) {
                    var shape = this.shapes[i];
                    if (shape.IsSelected)
                        selection.push(shape);

                    for (var j = 0; j < shape.Connectors.length; j++) {
                        var connector = shape.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if (connection.IsSelected)
                                selection.push(connection);
                        }
                    }
                }
                return selection;
            };


            Object.defineProperty(DiagramSurface.prototype, "elements", {
                get: function () {
                    return this.shapes;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Creates a connection between the given connectors.
            */
            DiagramSurface.prototype.AddConnection = function (item, sink) {
                var connection = null;
                var source = null;

                if (item instanceof Connection) {
                    if (sink != null)
                        throw "Connection and sink cannot be specified simultaneously.";
                    connection = item;
                    source = connection.From;
                    sink = connection.To;
                } else {
                    if (item instanceof Connector) {
                        source = item;
                        connection = new Connection(source, sink);
                    } else if (item instanceof Shape && TypeViz.IsDefined(sink) && sink instanceof Shape) {
                        source = item.Connectors[0];
                        sink = sink.Connectors[0];
                        connection = new Connection(source, sink);
                    } else
                        throw "AddConnection with unsupported parameter combination.";
                }

                source.Connections.push(connection);

                if (sink != null) {
                    sink.Connections.push(connection);
                }
                this.mainLayer.Prepend(connection.Visual);
                connection.Diagram = this;
                connection.Invalidate();
                this.connections.push(connection);
                return connection;
            };
            DiagramSurface.prototype.getId = function (id) {
                var found;
                found = this.shapes.First(function (s) {
                    return s.Visual.Native.id === id;
                });
                if (found) {
                    return found;
                }
                found = this.connections.First(function (c) {
                    return c.Visual.Native.id === id;
                });
                return found;
            };

            DiagramSurface.prototype.AddShape = function (input1, input2) {
                var template, position;
                if (TypeViz.IsUndefined(input1)) {
                    input1 = new TypeViz.Point(0, 0);
                }
                if (input1 instanceof TypeViz.Point) {
                    if (TypeViz.IsDefined(input2)) {
                        template = input2;
                        position = template.hasOwnProperty("position") ? template["position"] : new Point(0, 0);
                    } else {
                        template = TypeViz.Diagramming.Shapes.Rectangle;
                        position = input1;
                    }
                    this.lastUsedShapeTemplate = template;
                    var item = new Shape(template, position);
                    var options = input2 || {};
                    if (options.id)
                        item.Visual.Native.id = options.id;
                    return this.AddItem(item);
                } else {
                    template = input1;
                    if (!template)
                        throw "Expecting a Point or IShapeTemplate";
                    this.lastUsedShapeTemplate = template;
                    var item = new Shape(template, template.Position);
                    this.AddItem(item);
                    return item;
                }
            };

            DiagramSurface.prototype.AddItem = function (shape) {
                this.shapes.push(shape);
                shape.Diagram = this;
                this.mainLayer.Append(shape.Visual);

                return shape;
            };
            DiagramSurface.prototype.AddMarker = function (marker) {
                this.canvas.AddMarker(marker);
            };

            DiagramSurface.prototype.Undo = function () {
                this.undoRedoService.Undo();
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            DiagramSurface.prototype.SelectAll = function () {
                this.undoRedoService.begin();
                var selectionUndoUnit = new SelectionUndoUnit();
                this.selectAll(selectionUndoUnit, null);
                this.undoRedoService.Add(selectionUndoUnit);
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            DiagramSurface.prototype.Redo = function () {
                this.undoRedoService.Redo();
                this.Refresh();
                this.UpdateHoveredItem(this.currentPosition);
                this.UpdateCursor();
            };

            DiagramSurface.prototype.RecreateLastUsedShape = function () {
                var shape = new Shape(this.lastUsedShapeTemplate, this.currentPosition);
                var unit = new AddShapeUnit(shape, this);
                this.undoRedoService.Add(unit);
            };

            /**
            * Removes the given connection from the diagram.
            */
            DiagramSurface.prototype.RemoveConnection = function (con) {
                con.IsSelected = false;
                con.From.Connections.Remove(con);
                if (con.To != null)
                    con.To.Connections.Remove(con);
                con.Diagram = null;
                this.Connections.Remove(con);
                this.mainLayer.Remove(con.Visual);
            };

            DiagramSurface.prototype.RemoveShape = function (shape) {
                shape.Diagram = null;
                shape.IsSelected = false;
                this.shapes.Remove(shape);
                this.mainLayer.Remove(shape.Visual);
            };

            DiagramSurface.prototype.setElementContent = function (element, content) {
                this.undoRedoService.Add(new ContentChangedUndoUnit(element, content));
                this.Refresh();
            };

            DiagramSurface.prototype.DeleteCurrentSelection = function (undoable) {
                if (typeof undoable === "undefined") { undoable = true; }
                if (undoable)
                    this.undoRedoService.begin();

                var deletedConnections = [];
                for (var i = 0; i < this.shapes.length; i++) {
                    var shape = this.shapes[i];
                    for (var j = 0; j < shape.Connectors.length; j++) {
                        var connector = shape.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if ((shape.IsSelected || connection.IsSelected) && (!deletedConnections.Contains(connection))) {
                                if (undoable)
                                    this.undoRedoService.AddCompositeItem(new DeleteConnectionUnit(connection));
                                deletedConnections.push(connection);
                            }
                        }
                    }
                }

                //if not undoable; cannot alter the collection or the loop will be biased
                if (!undoable && deletedConnections.length > 0) {
                    for (var i = 0; i < deletedConnections.length; i++) {
                        var connection = deletedConnections[i];
                        this.RemoveConnection(connection);
                    }
                }

                for (var i = 0; i < this.shapes.length; i++) {
                    var shape = this.shapes[i];
                    if (shape.IsSelected) {
                        if (undoable)
                            this.undoRedoService.AddCompositeItem(new DeleteShapeUnit(shape));
                        else
                            this.RemoveShape(shape);
                    }
                }
                if (undoable)
                    this.undoRedoService.commit();
            };

            /**
            * The mouse down logic.
            */
            DiagramSurface.prototype.MouseDown = function (e) {
                this.Focus();
                e.preventDefault();
                this.UpdateCurrentPosition(e);
                if (e.button === 0) {
                    // alt+click allows fast creation of element using the active template
                    if ((this.newItem === null) && (e.altKey))
                        this.RecreateLastUsedShape();
                    else
                        this.Down(e);
                }
            };

            /**
            * The mouse up logic.
            */
            DiagramSurface.prototype.MouseUp = function (e) {
                e.preventDefault();
                this.UpdateCurrentPosition(e);
                if (e.button === 0)
                    this.Up();
            };

            /**
            * The mouse MoveTo logic.
            */
            DiagramSurface.prototype.MouseMove = function (e) {
                e.preventDefault();
                this.UpdateCurrentPosition(e);
                this.Move();
            };

            DiagramSurface.prototype.doubleClick = function (e) {
                e.preventDefault();
                this.UpdateCurrentPosition(e);

                if (e.button === 0) {
                    var point = this.currentPosition;

                    this.UpdateHoveredItem(point);
                    if ((this.hoveredItem != null) && (this.hoveredItem instanceof Shape)) {
                        var item = this.hoveredItem;
                        if ((item.Template != null) && ("edit" in item.Template)) {
                            item.Template.Edit(item, this.canvas, point);
                            this.Refresh();
                        }
                    }
                }
            };

            DiagramSurface.prototype.touchStart = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault();
                    this.UpdateCurrentTouchPosition(e);
                    this.Down(e);
                }
            };

            DiagramSurface.prototype.touchEnd = function (e) {
                e.preventDefault();
                this.Up();
            };

            DiagramSurface.prototype.touchMove = function (e) {
                if (e.touches.length == 1) {
                    e.preventDefault();
                    this.UpdateCurrentTouchPosition(e);
                    this.Move();
                }
            };

            /**
            * The actual mouse down logic.
            */
            DiagramSurface.prototype.Down = function (e) {
                var p = this.currentPosition;

                if (this.newItem != null) {
                    this.undoRedoService.begin();

                    this.newItem.Rectangle = new Rect(p.X, p.Y, this.newItem.Rectangle.Width, this.newItem.Rectangle.Height);
                    this.newItem.Invalidate();
                    this.undoRedoService.AddCompositeItem(new AddShapeUnit(this.newItem, this));
                    this.undoRedoService.commit();
                    this.newItem = null;
                } else {
                    this.selector.End();
                    this.UpdateHoveredItem(p);
                    if (this.hoveredItem === null) {
                        var ev = window.event || e;
                        if (ev.ctrlKey == true) {
                            //pan
                            this.isPanning = true;
                            this.panStart = this.Pan;
                            this.panOffset = p; // new Point(p.X - this.panStart.X, p.Y + this.panStart.Y);
                            this.panDelta = Point.Empty; //relative to root
                        } else {
                            // Start selection
                            this.selector.Start(p);
                        }
                    } else {
                        // Start connection
                        if ((this.hoveredItem instanceof Connector) && (!this.isShiftPressed)) {
                            var connector = this.hoveredItem;

                            //console.log("Starting a new connection from " + connector.Template.Name);
                            if (connector.CanConnectTo(null)) {
                                this.newConnection = this.AddConnection(connector, null);
                                this.newConnection.UpdateEndPoint(p);
                            }
                        } else {
                            // select object
                            var item = this.hoveredItem;
                            if (!item.IsSelected) {
                                this.undoRedoService.begin();
                                var selectionUndoUnit = new SelectionUndoUnit();
                                if (!this.isShiftPressed)
                                    this.DeselectAll(selectionUndoUnit);
                                selectionUndoUnit.select(item);
                                this.undoRedoService.AddCompositeItem(selectionUndoUnit);
                                this.undoRedoService.commit();
                            } else if (this.isShiftPressed) {
                                this.undoRedoService.begin();
                                var deselectUndoUnit = new SelectionUndoUnit();
                                deselectUndoUnit.deselect(item);
                                this.undoRedoService.AddCompositeItem(deselectUndoUnit);
                                this.undoRedoService.commit();
                            }

                            // seems we are transforming things
                            var hit = new Point(0, 0);
                            if (this.hoveredItem instanceof Shape) {
                                var element = this.hoveredItem;
                                hit = element.Adorner.HitTest(p);
                            }
                            for (var i = 0; i < this.shapes.length; i++) {
                                var shape = this.shapes[i];
                                if (shape.Adorner != null)
                                    shape.Adorner.Start(p, hit);
                            }
                            this.isManipulating = true;
                        }
                    }
                }

                this.Refresh();
                this.UpdateCursor();
            };

            /**
            * The actual mouse MoveTo logic.
            */
            DiagramSurface.prototype.Move = function () {
                var p = this.currentPosition;

                if (this.newItem != null) {
                    // placing new element
                    this.newItem.Rectangle = new Rect(p.X, p.Y, this.newItem.Rectangle.Width, this.newItem.Rectangle.Height);
                    this.newItem.Invalidate();
                }
                if (this.isPanning) {
                    this.panDelta = new Point(this.panDelta.X + p.X - this.panOffset.X, this.panDelta.Y + p.Y - this.panOffset.Y);
                    this.Pan = new Point(this.panStart.X + this.panDelta.X, this.panStart.Y + this.panDelta.Y);

                    //this.Canvas.Cursor = Cursors.MoveTo;
                    return;
                }
                if (this.isManipulating) {
                    for (var i = 0; i < this.shapes.length; i++) {
                        var shape = this.shapes[i];
                        if (shape.Adorner != null) {
                            shape.Adorner.MoveTo(p);

                            // this will also repaint the visual
                            shape.Rectangle = shape.Adorner.Rectangle;
                        }
                    }
                }

                if (this.newConnection != null) {
                    // connecting two connectors
                    this.newConnection.UpdateEndPoint(p);
                    this.newConnection.Invalidate();
                }

                if (this.selector != null)
                    this.selector.updateCurrentPoint(p);

                this.UpdateHoveredItem(p);
                this.Refresh();
                this.UpdateCursor();
            };

            /**
            * The actual mouse up logic.
            */
            DiagramSurface.prototype.Up = function () {
                var point = this.currentPosition;
                if (this.isPanning) {
                    this.isPanning = false;

                    //this.Canvas.Cursor = Cursors.arrow;
                    var unit = new PanUndoUnit(this.panStart, this.Pan, this);
                    this.undoRedoService.Add(unit);
                    return;
                }
                if (this.newConnection != null) {
                    this.UpdateHoveredItem(point);
                    this.newConnection.Invalidate();
                    if ((this.hoveredItem != null) && (this.hoveredItem instanceof Connector)) {
                        var connector = this.hoveredItem;
                        if ((connector != this.newConnection.From) && (connector.CanConnectTo(this.newConnection.From))) {
                            this.newConnection.To = connector;
                            this.undoRedoService.Add(new AddConnectionUnit(this.newConnection, this.newConnection.From, connector));
                            console.log("Connection established.");
                        } else
                            this.RemoveConnection(this.newConnection); //remove temp connection
                    } else
                        this.RemoveConnection(this.newConnection);
                    this.newConnection = null;
                }

                if (this.selector.IsActive) {
                    this.undoRedoService.begin();
                    var selectionUndoUnit = new SelectionUndoUnit();
                    var rectangle = this.selector.Rectangle;
                    var selectable = this.hoveredItem;
                    if (((this.hoveredItem === null) || (!selectable.IsSelected)) && !this.isShiftPressed)
                        this.DeselectAll(selectionUndoUnit);
                    if ((rectangle.Width != 0) || (rectangle.Height != 0))
                        this.selectAll(selectionUndoUnit, rectangle);
                    this.undoRedoService.AddCompositeItem(selectionUndoUnit);
                    this.undoRedoService.commit();
                    this.selector.End();
                }

                if (this.isManipulating) {
                    this.undoRedoService.begin();
                    for (var i = 0; i < this.shapes.length; i++) {
                        var shape = this.shapes[i];
                        if (shape.Adorner != null) {
                            shape.Adorner.Stop();
                            shape.Invalidate();
                            var r1 = shape.Adorner.InitialState;
                            var r2 = shape.Adorner.FinalState;
                            if ((r1.X != r2.X) || (r1.Y != r2.Y) || (r1.Width != r2.Width) || (r1.Height != r2.Height))
                                this.undoRedoService.AddCompositeItem(new TransformUnit(shape, r1, r2));
                        }
                    }

                    this.undoRedoService.commit();
                    this.isManipulating = false;
                    this.UpdateHoveredItem(point);
                }

                this.Refresh();
                this.UpdateCursor();
            };

            DiagramSurface.prototype.KeyDown = function (e) {
                if (!this.isFirefox)
                    this.ProcessKey(e, e.keyCode);
            };

            DiagramSurface.prototype.KeyPress = function (e) {
                 {
                    if (typeof this.keyCodeTable === "undefined") {
                        this.keyCodeTable = [];
                        var charCodeTable = {
                            32: ' ',
                            48: '0',
                            49: '1',
                            50: '2',
                            51: '3',
                            52: '4',
                            53: '5',
                            54: '6',
                            55: '7',
                            56: '8',
                            57: '9',
                            59: ';',
                            61: '=',
                            65: 'a',
                            66: 'b',
                            67: 'c',
                            68: 'd',
                            69: 'e',
                            70: 'f',
                            71: 'g',
                            72: 'h',
                            73: 'i',
                            74: 'j',
                            75: 'k',
                            76: 'l',
                            77: 'm',
                            78: 'n',
                            79: 'o',
                            80: 'p',
                            81: 'q',
                            82: 'r',
                            83: 's',
                            84: 't',
                            85: 'u',
                            86: 'v',
                            87: 'w',
                            88: 'x',
                            89: 'y',
                            90: 'z',
                            107: '+',
                            109: '-',
                            110: '.',
                            188: ',',
                            190: '.',
                            191: '/',
                            192: '`',
                            219: '[',
                            220: '\\',
                            221: ']',
                            222: '\"'
                        };

                        for (var keyCode in charCodeTable) {
                            var key = charCodeTable[keyCode];
                            this.keyCodeTable[key.charCodeAt(0)] = keyCode;
                            if (key.toUpperCase() != key)
                                this.keyCodeTable[key.toUpperCase().charCodeAt(0)] = keyCode;
                        }
                    }

                    this.ProcessKey(e, (this.keyCodeTable[e.charCode] != null) ? this.keyCodeTable[e.charCode] : e.keyCode);
                }
            };

            DiagramSurface.prototype.keyUp = function (e) {
                this.UpdateCursor();
            };

            DiagramSurface.prototype.ProcessKey = function (e, keyCode) {
                if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                    if (keyCode == 65) {
                        this.SelectAll();
                        this.stopEvent(e);
                    }

                    if ((keyCode == 90) && (!e.shiftKey)) {
                        this.Undo();
                        this.stopEvent(e);
                    }

                    if (((keyCode == 90) && (e.shiftKey)) || (keyCode == 89)) {
                        this.Redo();
                        this.stopEvent(e);
                    }
                }

                if ((keyCode == 46) || (keyCode == 8)) {
                    this.Delete(true);
                    this.stopEvent(e);
                }

                if (keyCode == 27) {
                    this.newItem = null;
                    if (this.newConnection != null) {
                        this.RemoveConnection(this.newConnection);
                        this.newConnection = null;
                    }
                    this.isManipulating = false;
                    for (var i = 0; i < this.shapes.length; i++) {
                        var element = this.shapes[i];
                        if (element.Adorner != null)
                            element.Adorner.Stop();
                    }

                    this.Refresh();
                    this.UpdateHoveredItem(this.currentPosition);
                    this.UpdateCursor();
                    this.stopEvent(e);
                }
            };

            DiagramSurface.prototype.stopEvent = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };

            /**
            * Selects all items of the diagram.
            */
            DiagramSurface.prototype.selectAll = function (selectionUndoUnit, r) {
                for (var i = 0; i < this.shapes.length; i++) {
                    var element = this.shapes[i];
                    if ((r === null) || (element.HitTest(r)))
                        selectionUndoUnit.select(element);
                    for (var j = 0; j < element.Connectors.length; j++) {
                        var connector = element.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if ((r === null) || (connection.HitTest(r)))
                                selectionUndoUnit.select(connection);
                        }
                    }
                }
            };

            /**
            * Unselects all items.
            */
            DiagramSurface.prototype.DeselectAll = function (selectionUndoUnit) {
                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    selectionUndoUnit.deselect(item);

                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++)
                            selectionUndoUnit.deselect(connector.Connections[k]);
                    }
                }
            };

            /**
            * Refreshed the current hovered item given the current location of the cursor.
            */
            DiagramSurface.prototype.UpdateHoveredItem = function (p) {
                var hitObject = this.HitTest(p);
                if (hitObject != this.hoveredItem) {
                    if (this.hoveredItem != null)
                        this.hoveredItem.IsHovered = false;
                    this.hoveredItem = hitObject;
                    if (this.hoveredItem != null)
                        this.hoveredItem.IsHovered = true;
                }
                //if (this.hoveredItem != null)
                //    console.log("hoveredItem:" + this.hoveredItem.toString());
            };

            /**
            * Detects the item underneath the given location.
            */
            DiagramSurface.prototype.HitTest = function (point) {
                var rectangle = new Rect(point.X, point.Y, 0, 0);

                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        if (connector.HitTest(rectangle))
                            return connector;
                    }
                }

                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    if (item.HitTest(rectangle))
                        return item;
                }

                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if (connection.HitTest(rectangle))
                                return connection;
                        }
                    }
                }
                return null;
            };

            /**
            * Sets the cursors in function of the currently hovered item.
            */
            DiagramSurface.prototype.UpdateCursor = function () {
                /*  if (this.newConnection != null) {
                this.canvas.Cursor = ((this.hoveredItem != null) && (this.hoveredItem instanceof Connector)) ? this.hoveredItem.GetCursor(this.currentPosition) : Cursors.cross;
                }
                else {
                this.canvas.Cursor = (this.hoveredItem != null) ? this.hoveredItem.GetCursor(this.currentPosition) : Cursors.arrow;
                }*/
            };

            /*
            * Update the current position of the mouse to the local coordinate system.
            */
            DiagramSurface.prototype.UpdateCurrentPosition = function (e) {
                this.isShiftPressed = e.shiftKey;
                this.currentPosition = new Point(e.pageX - this.pan.X, e.pageY - this.pan.Y);
                var node = this.div;

                while (node != null) {
                    this.currentPosition.X -= node.offsetLeft;
                    this.currentPosition.Y -= node.offsetTop;
                    node = node.offsetParent;
                }
                this.currentPosition.X /= this.Zoom;
                this.currentPosition.Y /= this.Zoom;
                //console.log(this.currentPosition.toString());
            };

            DiagramSurface.prototype.UpdateCurrentTouchPosition = function (e) {
                this.isShiftPressed = false;
                this.currentPosition = new Point(e.touches[0].pageX, e.touches[0].pageY);
                var node = this.div;
                while (node != null) {
                    this.currentPosition.X -= node.offsetLeft;
                    this.currentPosition.Y -= node.offsetTop;
                    node = node.offsetParent;
                }
            };

            DiagramSurface.prototype.Refresh = function () {
                var connections = [];
                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        for (var k = 0; k < connector.Connections.length; k++) {
                            var connection = connector.Connections[k];
                            if (!connections.Contains(connection)) {
                                connection.paint(this.canvas);
                                connections.push(connection);
                            }
                        }
                    }
                }
                for (var i = 0; i < this.shapes.length; i++)
                    this.shapes[i].paint(this.canvas);
                for (var i = 0; i < this.shapes.length; i++) {
                    var item = this.shapes[i];
                    for (var j = 0; j < item.Connectors.length; j++) {
                        var connector = item.Connectors[j];
                        var IsHovered = false;
                        for (var k = 0; k < connector.Connections.length; k++)
                            if (connector.Connections[k].IsHovered)
                                IsHovered = true;
                        if ((item.IsHovered) || (connector.IsHovered) || IsHovered)
                            connector.Invalidate((this.newConnection != null) ? this.newConnection.From : null);
                        else if ((this.newConnection != null) && (connector.CanConnectTo(this.newConnection.From)))
                            connector.Invalidate(this.newConnection.From);
                    }
                }

                if (this.newItem != null)
                    this.newItem.paint(this.canvas);
                if (this.newConnection != null)
                    this.newConnection.paintAdorner(this.canvas);
                if (this.selector.IsActive)
                    this.selector.paint(this.canvas);
            };
            return DiagramSurface;
        })();
        Diagramming.DiagramSurface = DiagramSurface;

        /**
        * Mapping of logical cursors to actual cursors.
        */
        var Cursors = (function () {
            function Cursors() {
            }
            Cursors.arrow = "default";
            Cursors.grip = "pointer";
            Cursors.cross = "pointer";
            Cursors.add = "pointer";
            Cursors.MoveTo = "move";
            Cursors.select = "pointer";
            return Cursors;
        })();
        Diagramming.Cursors = Cursors;

        

        

        

        

        

        /**
        * The diagramming connection.
        */
        var Connection = (function () {
            function Connection(from, to, options) {
                this.toPoint = null;
                if (from instanceof Shape) {
                    from = from.Connectors[0];
                }
                if (to instanceof Shape) {
                    to = to.Connectors[0];
                }
                options = options || {};
                this.fromConnector = from;
                this.toConnector = to;
                this.createVisual();
                if (options.id)
                    this.Id = options.id;
                this.points = [];
            }
            Object.defineProperty(Connection.prototype, "Visual", {
                get: function () {
                    return this.visual;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connection.prototype, "Points", {
                get: function () {
                    return this.points;
                },
                /*Sets the intermediate points in global coordinates.*/
                set: function (ps) {
                    this.points = ps;
                    this.updateVisual();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Connection.prototype, "Content", {
                set: function (v) {
                    if (v == null)
                        this.removeContent();
                    var tb = new SVG.TextBlock();
                    tb.dy = -5;
                    tb.Text = v.toString();
                    this.contentVisual = tb;
                    this.visual.Append(this.contentVisual);
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });

            Connection.prototype.removeContent = function () {
                if (this.contentVisual == null)
                    return;
                this.visual.Remove(this.contentVisual);
                this.contentVisual = null;
            };

            Object.defineProperty(Connection.prototype, "IsVisible", {
                /*
                * Gets whether this shape is visible.
                */
                get: function () {
                    return (this.Visual.Native.attributes["visibility"] == null) ? true : this.Visual.Native.attributes["visibility"].value == "visible";
                },
                /*
                * Sets whether this shape is visible.
                */
                set: function (value) {
                    if (value)
                        this.Visual.Native.setAttribute("visibility", "visible");
                    else
                        this.Visual.Native.setAttribute("visibility", "hidden");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connection.prototype, "Id", {
                get: function () {
                    return this.Visual.Native.id;
                },
                set: function (id) {
                    this.Visual.Native.id = id;
                },
                enumerable: true,
                configurable: true
            });
            Connection.prototype.createVisual = function () {
                var g = new Group;
                this.path = new SVG.Path();
                var interpolator = TypeViz.SVG.Interpolate({
                    /* xProjector: w=> w.X,
                    yProjector: w=> w.Y,*/
                    Interpolator: TypeViz.SVG.Interpolators.SplineInterpolator,
                    IsClosed: false
                });
                this.path.Interpolator = interpolator;
                this.path.Stroke = "Green";
                g.Append(this.path);
                this.visual = g;
                this.updateCoordinates();
                this.unselectedColor = this.path.Stroke;
                this.path.StrokeThickness = 1;
            };

            Connection.prototype.updateCoordinates = function () {
                if (this.toConnector == null) {
                    var merged;

                    // means we are dragging a new connection
                    if (this.toPoint == null || isNaN(this.toPoint.X) || isNaN(this.toPoint.Y))
                        return;
                    var globalSourcePoint = this.fromConnector.Parent.GetConnectorPosition(this.fromConnector);
                    var globalSinkPoint = this.toPoint;
                    var bounds = Rect.FromPoints(globalSourcePoint, globalSinkPoint);
                    var localSourcePoint = globalSourcePoint.Minus(bounds.TopLeft);
                    var localSinkPoint = globalSinkPoint.Minus(bounds.TopLeft);

                    if (TypeViz.IsDefined(this.points) && this.points.length > 0) {
                        merged = [localSourcePoint];
                        for (var i = 0; i < this.points.length; i++) {
                            merged.push(this.points[i].Minus(bounds.TopLeft));
                        }
                        merged.push(localSinkPoint);
                        this.path.Points = merged;
                    } else {
                        this.path.Points = [localSourcePoint, localSinkPoint]; // [globalSourcePoint, globalSinkPoint];
                    }

                    this.visual.Position = bounds.TopLeft; //global coordinates!
                    return;
                }
                var globalSourcePoint = this.fromConnector.Parent.GetConnectorPosition(this.fromConnector);
                var globalSinkPoint = this.toConnector.Parent.GetConnectorPosition(this.toConnector);
                var bounds = Rect.FromPoints(globalSourcePoint, globalSinkPoint);
                var localSourcePoint = globalSourcePoint.Minus(bounds.TopLeft);
                var localSinkPoint = globalSinkPoint.Minus(bounds.TopLeft);

                if (TypeViz.IsDefined(this.points) && this.points.length > 0) {
                    merged = [localSourcePoint];
                    for (var i = 0; i < this.points.length; i++) {
                        merged.push(this.points[i].Minus(bounds.TopLeft));
                    }
                    merged.push(localSinkPoint);
                    this.path.Points = merged;
                } else {
                    this.path.Points = [localSourcePoint, localSinkPoint]; // [globalSourcePoint, globalSinkPoint];
                }
                this.visual.Position = bounds.TopLeft; //global coordinates!

                if (this.contentVisual != null) {
                    var m = Point.MiddleOf(localSourcePoint, localSinkPoint);
                    this.contentVisual.Position = m;
                    var p = localSinkPoint.Minus(localSourcePoint);
                    var tr = this.contentVisual.Native.ownerSVGElement.createSVGTransform();
                    tr.setRotate(p.ToPolar(true).Angle, m.X, m.Y);
                    var tb = this.contentVisual.Native;
                    if (tb.transform.baseVal.numberOfItems == 0)
                        tb.transform.baseVal.appendItem(tr);
                    else
                        tb.transform.baseVal.replaceItem(tr, 0);
                }
            };

            Connection.prototype.updateVisual = function () {
                this.updateCoordinates();
                if (this.isSelected) {
                    this.path.Stroke = "Orange";
                    this.path.StrokeThickness = 2;
                    if (this.EndCap != null)
                        this.EndCap.Color = "Orange";
                    if (this.StartCap != null)
                        this.StartCap.Color = "Orange";
                } else {
                    this.path.Stroke = this.unselectedColor;
                    this.path.StrokeThickness = 1;
                    if (this.EndCap != null)
                        this.EndCap.Color = this.unselectedColor;
                    if (this.StartCap != null)
                        this.StartCap.Color = this.unselectedColor;
                }
            };

            Connection.prototype.updateContent = function () {
            };


            Object.defineProperty(Connection.prototype, "EndCap", {
                get: function () {
                    return this.endCap;
                },
                set: function (marker) {
                    if (marker == null)
                        throw "Given Marker is null.";
                    if (marker.Id == null)
                        throw "Given Marker has no Id.";
                    marker.Color = this.Stroke;
                    this.Diagram.AddMarker(marker);
                    this.path.MarkerEnd = marker;
                    this.endCap = marker;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "StartCap", {
                get: function () {
                    return this.startCap;
                },
                set: function (marker) {
                    if (marker == null)
                        throw "Given Marker is null.";
                    if (marker.Id == null)
                        throw "Given Marker has no Id.";
                    marker.Color = this.Stroke;
                    this.Diagram.AddMarker(marker);
                    this.path.MarkerStart = marker;
                    this.startCap = marker;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "Stroke", {
                get: function () {
                    return this.path.Stroke;
                },
                set: function (value) {
                    this.path.Stroke = value;
                    this.unselectedColor = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "Opacity", {
                get: function () {
                    return this.path.Opacity;
                },
                set: function (value) {
                    this.path.Opacity = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "StrokeDash", {
                get: function () {
                    return this.path.StrokeDash;
                },
                set: function (value) {
                    this.path.StrokeDash = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connection.prototype, "From", {
                /**
                *  Gets the source connector.
                */
                get: function () {
                    return this.fromConnector;
                },
                /**
                * Sets the source connector.
                */
                set: function (v) {
                    this.fromConnector = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "To", {
                /**
                *  Gets the sink connector.
                */
                get: function () {
                    return this.toConnector;
                },
                /**
                * Sets the target connector.
                */
                set: function (v) {
                    this.toConnector = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "IsSelected", {
                /**
                *  Gets whether this connection is selected.
                */
                get: function () {
                    return this.isSelected;
                },
                /**
                *  Sets whether this connection is selected.
                */
                set: function (value) {
                    this.isSelected = value;
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Connection.prototype, "IsHovered", {
                /**
                *  Gets whether this connection is hovered.
                */
                get: function () {
                    return this.isHovered;
                },
                /**
                *  Sets whether this connection is hovered.
                */
                set: function (value) {
                    this.isHovered = value;
                },
                enumerable: true,
                configurable: true
            });


            Connection.prototype.UpdateEndPoint = function (toPoint) {
                this.toPoint = toPoint;
                this.updateCoordinates();
            };

            Connection.prototype.GetCursor = function (point) {
                return Cursors.select;
            };

            Connection.prototype.HitTest = function (rectangle) {
                if ((this.From != null) && (this.To != null)) {
                    var p1 = this.From.Parent.GetConnectorPosition(this.From);
                    var p2 = this.To.Parent.GetConnectorPosition(this.To);
                    if ((rectangle.Width != 0) || (rectangle.Width != 0))
                        return (rectangle.Contains(p1) && rectangle.Contains(p2));

                    var p = rectangle.TopLeft;

                    // p1 must be the leftmost point
                    if (p1.X > p2.X) {
                        var temp = p2;
                        p2 = p1;
                        p1 = temp;
                    }

                    var r1 = new Rect(p1.X, p1.Y, 0, 0);
                    var r2 = new Rect(p2.X, p2.Y, 0, 0);
                    r1.Inflate(3, 3);
                    r2.Inflate(3, 3);

                    if (r1.Union(r2).Contains(p)) {
                        if ((p1.X == p2.X) || (p1.Y == p2.Y))
                            return true;
                        else if (p1.Y < p2.Y) {
                            var o1 = r1.X + (((r2.X - r1.X) * (p.Y - (r1.Y + r1.Height))) / ((r2.Y + r2.Height) - (r1.Y + r1.Height)));
                            var u1 = (r1.X + r1.Width) + ((((r2.X + r2.Width) - (r1.X + r1.Width)) * (p.Y - r1.Y)) / (r2.Y - r1.Y));
                            return ((p.X > o1) && (p.X < u1));
                        } else {
                            var o2 = r1.X + (((r2.X - r1.X) * (p.Y - r1.Y)) / (r2.Y - r1.Y));
                            var u2 = (r1.X + r1.Width) + ((((r2.X + r2.Width) - (r1.X + r1.Width)) * (p.Y - (r1.Y + r1.Height))) / ((r2.Y + r2.Height) - (r1.Y + r1.Height)));
                            return ((p.X > o2) && (p.X < u2));
                        }
                    }
                }
                return false;
            };

            Connection.prototype.Invalidate = function () {
                this.updateVisual();
            };

            Connection.prototype.paint = function (context) {
                //context.strokeStyle = this.From.Parent.graph.theme.connection;
                //context.lineWidth = (this.isHovered) ? 2 : 1;
                //this.paintLine(context, this.isSelected);
            };

            Connection.prototype.paintAdorner = function (context) {
                //context.strokeStyle = this.From.Parent.graph.theme.connection;
                //context.lineWidth = 1;
                this.paintLine(context, true);
            };

            Connection.prototype.paintLine = function (context, dashed) {
                if (this.From != null) {
                    var Start = this.From.Parent.GetConnectorPosition(this.From);
                    var end = (this.To != null) ? this.To.Parent.GetConnectorPosition(this.To) : this.toPoint;
                    //if ((Start.X != end.X) || (Start.Y != end.Y))
                    //{
                    //    context.beginPath();
                    //    if (dashed)
                    //    {
                    //        LineHelper.dashedLine(context, Start.X, Start.Y, end.X, end.Y);
                    //    }
                    //    else
                    //    {
                    //        context.moveTo(Start.X - 0.5, Start.Y - 0.5);
                    //        context.lineTo(end.X - 0.5, end.Y - 0.5);
                    //    }
                    //    context.closePath();
                    //    context.stroke();
                    //}
                }
            };
            return Connection;
        })();
        Diagramming.Connection = Connection;

        /**
        * The intermediate between a shape and a connection, aka port.
        */
        var Connector = (function () {
            function Connector(parent, template) {
                this.connections = [];
                this.isHovered = false;
                this.parent = parent;
                this.template = template;
            }
            Object.defineProperty(Connector.prototype, "Parent", {
                get: function () {
                    return this.parent;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "Template", {
                /*
                * Gets the template of this connector
                */
                get: function () {
                    return this.template;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "Connections", {
                get: function () {
                    return this.connections;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "Background", {
                set: function (value) {
                    this.Visual.Native.setAttribute("fill", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Connector.prototype, "IsHovered", {
                get: function () {
                    return this.isHovered;
                },
                set: function (value) {
                    this.isHovered = value;
                    this.IsVisible = value;
                    this.Background = value ? "Green" : "Black";
                },
                enumerable: true,
                configurable: true
            });


            Connector.prototype.GetCursor = function (point) {
                return Cursors.grip;
            };

            Connector.prototype.HitTest = function (r) {
                if ((r.Width === 0) && (r.Height === 0))
                    return this.Rectangle.Contains(r.TopLeft);
                return r.Contains(this.Rectangle.TopLeft);
            };

            Object.defineProperty(Connector.prototype, "IsVisible", {
                get: function () {
                    return (this.Visual.Native.attributes["visibility"] == null) ? true : this.Visual.Native.attributes["visibility"].value == "visible";
                },
                set: function (value) {
                    if (value)
                        this.Visual.Native.setAttribute("visibility", "visible");
                    else
                        this.Visual.Native.setAttribute("visibility", "hidden");
                },
                enumerable: true,
                configurable: true
            });


            Connector.prototype.Invalidate = function (other) {
                var r = this.Rectangle;
                var strokeStyle = this.parent.Diagram.Theme.connectorBorder;
                var fillStyle = this.parent.Diagram.Theme.connector;
                if (this.isHovered) {
                    strokeStyle = this.parent.Diagram.Theme.connectorHoverBorder;
                    fillStyle = this.parent.Diagram.Theme.connectorHover;
                    if (other != null && !this.CanConnectTo(other))
                        fillStyle = "#f00";
                }
                this.Visual.Native.setAttribute("fill", fillStyle);
            };

            Connector.prototype.CanConnectTo = function (other) {
                if (other === this)
                    return false;
                if (other == null)
                    return true;
                return this.Template.CanConnectTo(other);
                //var t1: string[] = this.template.Type.split(' ');
                //if (!t1.Contains("[array]") && (this.connections.length == 1)) return false;
                //if (connector instanceof Connector)
                //{
                //    var t2: string[] = connector.template.Type.split(' ');
                //    if ((t1[0] != t2[0]) ||
                //        (this.parent == connector.parent) ||
                //        (t1.Contains("[in]") && !t2.Contains("[out]")) ||
                //        (t1.Contains("[out]") && !t2.Contains("[in]")) ||
                //        (!t2.Contains("[array]") && (connector.connections.length == 1)))
                //    {
                //        return false;
                //    }
                //}
            };

            Connector.prototype.toString = function () {
                return "Connector";
            };

            Object.defineProperty(Connector.prototype, "Rectangle", {
                get: function () {
                    var point = this.parent.GetConnectorPosition(this);
                    var rectangle = new Rect(point.X, point.Y, 0, 0);
                    rectangle.Inflate(3, 3);
                    return rectangle;
                },
                enumerable: true,
                configurable: true
            });
            return Connector;
        })();
        Diagramming.Connector = Connector;

        var CompositeUnit = (function () {
            function CompositeUnit(unit) {
                if (typeof unit === "undefined") { unit = null; }
                this.units = [];
                if (unit != null)
                    this.units.push(unit);
            }
            CompositeUnit.prototype.Add = function (undoUnit) {
                this.units.push(undoUnit);
            };

            CompositeUnit.prototype.Undo = function () {
                for (var i = 0; i < this.units.length; i++)
                    this.units[i].Undo();
            };

            CompositeUnit.prototype.Redo = function () {
                for (var i = 0; i < this.units.length; i++)
                    this.units[i].Redo();
            };

            Object.defineProperty(CompositeUnit.prototype, "Title", {
                get: function () {
                    return "Composite unit";
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CompositeUnit.prototype, "IsEmpty", {
                get: function () {
                    if (this.units.length > 0) {
                        for (var i = 0; i < this.units.length; i++) {
                            if (!this.units[i].IsEmpty) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            return CompositeUnit;
        })();
        Diagramming.CompositeUnit = CompositeUnit;

        ;

        var ContentChangedUndoUnit = (function () {
            function ContentChangedUndoUnit(element, content) {
                this.item = element;
                this._undoContent = element.Content;
                this._redoContent = content;
            }
            Object.defineProperty(ContentChangedUndoUnit.prototype, "Title", {
                get: function () {
                    return "Content Editing";
                },
                enumerable: true,
                configurable: true
            });

            ContentChangedUndoUnit.prototype.Undo = function () {
                this.item.Content = this._undoContent;
            };

            ContentChangedUndoUnit.prototype.Redo = function () {
                this.item.Content = this._redoContent;
            };

            Object.defineProperty(ContentChangedUndoUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return ContentChangedUndoUnit;
        })();
        Diagramming.ContentChangedUndoUnit = ContentChangedUndoUnit;

        /**
        * An undo-redo unit handling the deletion of a connection.
        */
        var DeleteConnectionUnit = (function () {
            function DeleteConnectionUnit(connection) {
                this.connection = connection;
                this.diagram = connection.Diagram;
                this.from = connection.From;
                this.to = connection.To;
            }
            Object.defineProperty(DeleteConnectionUnit.prototype, "Title", {
                get: function () {
                    return "Delete connection";
                },
                enumerable: true,
                configurable: true
            });

            DeleteConnectionUnit.prototype.Undo = function () {
                this.diagram.AddConnection(this.connection);
            };

            DeleteConnectionUnit.prototype.Redo = function () {
                this.diagram.RemoveConnection(this.connection);
            };

            Object.defineProperty(DeleteConnectionUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return DeleteConnectionUnit;
        })();
        Diagramming.DeleteConnectionUnit = DeleteConnectionUnit;

        /**
        * An undo-redo unit handling the deletion of a diagram element.
        */
        var DeleteShapeUnit = (function () {
            function DeleteShapeUnit(shape) {
                this.shape = shape;
                this.diagram = shape.Diagram;
            }
            Object.defineProperty(DeleteShapeUnit.prototype, "Title", {
                get: function () {
                    return "Deletion";
                },
                enumerable: true,
                configurable: true
            });

            DeleteShapeUnit.prototype.Undo = function () {
                this.diagram.AddItem(this.shape);
                this.shape.IsSelected = false;
            };

            DeleteShapeUnit.prototype.Redo = function () {
                this.shape.IsSelected = false;
                this.diagram.RemoveShape(this.shape);
            };

            Object.defineProperty(DeleteShapeUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return DeleteShapeUnit;
        })();
        Diagramming.DeleteShapeUnit = DeleteShapeUnit;

        /**
        * An undo-redo unit handling the transformation of a diagram element.
        */
        var TransformUnit = (function () {
            function TransformUnit(shape, undoRectangle, redoRectangle) {
                this.shape = shape;
                this.undoRectangle = undoRectangle.Clone();
                this.redoRectangle = redoRectangle.Clone();
            }
            Object.defineProperty(TransformUnit.prototype, "Title", {
                get: function () {
                    return "Transformation";
                },
                enumerable: true,
                configurable: true
            });

            TransformUnit.prototype.Undo = function () {
                // if (this.shape.IsSelected) this.shape.Adorner.Rectangle = this.undoRectangle;
                this.shape.Rectangle = this.undoRectangle;
                this.shape.Invalidate();
            };

            TransformUnit.prototype.Redo = function () {
                //if (this.shape.IsSelected)
                //{
                //    this.shape.Adorner.Rectangle = this.redoRectangle;
                //    this.shape.Adorner.paint
                //}
                this.shape.Rectangle = this.redoRectangle;
                this.shape.Invalidate();
            };

            Object.defineProperty(TransformUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return TransformUnit;
        })();
        Diagramming.TransformUnit = TransformUnit;

        /**
        * An undo-redo unit handling the addition of a connection.
        */
        var AddConnectionUnit = (function () {
            function AddConnectionUnit(connection, from, to) {
                this.connection = connection;
                this.diagram = connection.Diagram;
                this.from = from;
                this.to = to;
            }
            Object.defineProperty(AddConnectionUnit.prototype, "Title", {
                get: function () {
                    return "New connection";
                },
                enumerable: true,
                configurable: true
            });

            AddConnectionUnit.prototype.Undo = function () {
                this.diagram.RemoveConnection(this.connection);
            };

            AddConnectionUnit.prototype.Redo = function () {
                this.diagram.AddConnection(this.connection);
            };

            Object.defineProperty(AddConnectionUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return AddConnectionUnit;
        })();
        Diagramming.AddConnectionUnit = AddConnectionUnit;

        /**
        * An undo-redo unit handling the addition of diagram item.
        */
        var AddShapeUnit = (function () {
            function AddShapeUnit(shape, diagram) {
                this.shape = shape;
                this.diagram = diagram;
            }
            Object.defineProperty(AddShapeUnit.prototype, "Title", {
                get: function () {
                    return "Insert";
                },
                enumerable: true,
                configurable: true
            });

            AddShapeUnit.prototype.Undo = function () {
                this.diagram.RemoveShape(this.shape);
            };

            AddShapeUnit.prototype.Redo = function () {
                this.diagram.AddItem(this.shape);
            };

            Object.defineProperty(AddShapeUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return AddShapeUnit;
        })();
        Diagramming.AddShapeUnit = AddShapeUnit;

        /**
        * An undo-redo unit handling the selection of items.
        */
        var SelectionUndoUnit = (function () {
            function SelectionUndoUnit() {
                this.shapeStates = [];
            }
            Object.defineProperty(SelectionUndoUnit.prototype, "Title", {
                get: function () {
                    return "Selection Unit";
                },
                enumerable: true,
                configurable: true
            });

            SelectionUndoUnit.prototype.Undo = function () {
                for (var i = 0; i < this.shapeStates.length; i++)
                    this.shapeStates[i].Item.IsSelected = this.shapeStates[i].undo;
            };

            SelectionUndoUnit.prototype.Redo = function () {
                for (var i = 0; i < this.shapeStates.length; i++)
                    this.shapeStates[i].Item.IsSelected = this.shapeStates[i].redo;
            };

            Object.defineProperty(SelectionUndoUnit.prototype, "IsEmpty", {
                get: function () {
                    for (var i = 0; i < this.shapeStates.length; i++)
                        if (this.shapeStates[i].undo != this.shapeStates[i].redo)
                            return false;
                    return true;
                },
                enumerable: true,
                configurable: true
            });

            SelectionUndoUnit.prototype.select = function (item) {
                this.Refresh(item, item.IsSelected, true);
            };

            SelectionUndoUnit.prototype.deselect = function (Item) {
                this.Refresh(Item, Item.IsSelected, false);
            };

            SelectionUndoUnit.prototype.Refresh = function (item, undo, redo) {
                for (var i = 0; i < this.shapeStates.length; i++) {
                    if (this.shapeStates[i].Item == item) {
                        this.shapeStates[i].redo = redo;
                        return;
                    }
                }
                this.shapeStates.push({ Item: item, undo: undo, redo: redo });
            };
            return SelectionUndoUnit;
        })();
        Diagramming.SelectionUndoUnit = SelectionUndoUnit;

        /**
        * An undo-redo unit handling the selection of items.
        */
        var PanUndoUnit = (function () {
            function PanUndoUnit(initial, final, diagram) {
                this.initial = initial;
                this.final = final;
                this.diagram = diagram;
            }
            Object.defineProperty(PanUndoUnit.prototype, "Title", {
                get: function () {
                    return "Pan Unit";
                },
                enumerable: true,
                configurable: true
            });

            PanUndoUnit.prototype.Undo = function () {
                this.diagram.Pan = this.initial;
            };

            PanUndoUnit.prototype.Redo = function () {
                this.diagram.Pan = this.final;
            };

            Object.defineProperty(PanUndoUnit.prototype, "IsEmpty", {
                get: function () {
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            return PanUndoUnit;
        })();
        Diagramming.PanUndoUnit = PanUndoUnit;

        /*
        * The node or shape.
        */
        var Shape = (function () {
            /*
            * Instantiates a new Shape.
            */
            function Shape(template, point) {
                this.isHovered = false;
                this.isSelected = false;
                this.adorner = null;
                this.connectors = [];
                this.rotation = new SVG.Rotation(0);
                this.translation = new SVG.Translation(0, 0);
                this.template = template;
                this._content = template.DefaultContent;
                this.rectangle = Rect.Create(point.X, point.Y, Math.floor(template.Width), Math.floor(template.Height));
                this.createVisual();
            }
            Object.defineProperty(Shape.prototype, "Id", {
                get: function () {
                    return this.Visual.Native.id;
                },
                set: function (id) {
                    this.Visual.Native.id = id;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shape.prototype, "bounds", {
                get: function () {
                    return new TypeViz.Rect(this.Position.X, this.Position.Y, this.Width, this.Height);
                },
                set: function (r) {
                    this.Position = r.TopLeft;
                    this.Width = r.Width;
                    this.Height = r.Height;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "IsVisible", {
                /*
                * Gets whether this shape is visible.
                */
                get: function () {
                    return (this.Visual.Native.attributes["visibility"] == null) ? true : this.Visual.Native.attributes["visibility"].value == "visible";
                },
                /*
                * Sets whether this shape is visible.
                */
                set: function (value) {
                    if (value)
                        this.Visual.Native.setAttribute("visibility", "visible");
                    else
                        this.Visual.Native.setAttribute("visibility", "hidden");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Visual", {
                /*
                * Gets SVG visual this shape represents.
                */
                get: function () {
                    return this.visual;
                    ;
                },
                enumerable: true,
                configurable: true
            });

            Shape.prototype.getTemplateVisual = function () {
                if (this.template == null)
                    throw "Template is not set.";
                if (this.template.Geometry == null)
                    throw "Geometry is not set in the template.";
                var v = null;
                if (this.template.Geometry.toLowerCase() == "rectangle") {
                    v = new SVG.Rectangle();
                } else if (this.template.Geometry.toLowerCase() == "circle") {
                    v = new SVG.Circle();
                } else {
                    var path = new PathBase();
                    path.Data = this.template.Geometry;
                    v = path;
                }
                v.Stroke = this.template.Stroke;
                v.StrokeThickness = this.template.StrokeThickness;
                v.Background = this.template.Background;
                v.Width = this.template.Width;
                v.Height = this.template.Height;
                v.Opacity = this.Template.Opacity;

                if (v instanceof SVG.Rectangle) {
                    v.CornerRadius = this.Template.CornerRadius;
                }
                if (this.template.Rotation != 0) {
                    var r = this.template.Rotation;
                    //                if(r == 90 || r == 270 || r == 83)
                    //                {
                    //                   v.Height = v.Width;
                    //                   v.Width = v.Height;
                    //                   console.log(v.Id);
                    //                }
                }
                return v;
            };

            Object.defineProperty(Shape.prototype, "Width", {
                get: function () {
                    return this.Rectangle.Width;
                },
                set: function (v) {
                    this.Rectangle.Width = v;
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Height", {
                get: function () {
                    return this.Rectangle.Height;
                },
                set: function (v) {
                    this.Rectangle.Height = v;
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Shape.prototype, "Class", {
                /**
                * Sets the CSS class of this shape.
                */
                get: function () {
                    return this.visual.Class;
                },
                /**
                * Gets the CSS class of this shape.
                */
                set: function (v) {
                    this.visual.Class = v;
                },
                enumerable: true,
                configurable: true
            });

            /*
            * Creates the underlying SVG hierarchy for this shape on the basis of the set IShapeTemplate.
            */
            Shape.prototype.createVisual = function () {
                var g = new Group();
                g.Id = this.template.Id;
                g.Position = this.rectangle.TopLeft;

                var vis = this.getTemplateVisual();
                vis.Position = Point.Empty;
                g.Append(vis);
                this.mainVisual = vis; //in order to update
                g.Title = (g.Id == null || g.Id.length == 0) ? "Shape" : g.Id;
                if (this.template.hasOwnProperty("ConnectorTemplates")) {
                    if (this.template.ConnectorTemplates != null && this.template.ConnectorTemplates.length > 0) {
                        this.createConnectors(g);
                    }
                } else {
                    this.template.ConnectorTemplates = ShapeTemplateBase.DefaultConnectorTemplates;
                    this.createConnectors(g);
                }

                //if (this.template.Rotation != 0)
                //{
                //    var rot = new SVG.Rotation(this.template.Rotation);
                //    g.PrePendTransform(rot);
                //}
                var tb = new SVG.TextBlock();
                tb.Text = this.Content;
                tb.Background = "White";
                tb.FontFamily = "Segoe UI";
                tb.FontSize = 15;
                tb.X = 10;
                tb.Y = 20;
                g.Append(tb);
                this.visual = g;
            };

            Shape.prototype.createConnectors = function (g) {
                for (var i = 0; i < this.template.ConnectorTemplates.length; i++) {
                    var ct = this.template.ConnectorTemplates[i];
                    var connector = new Connector(this, ct);
                    var c = new SVG.Rectangle();
                    c.Width = 7;
                    c.Height = 7;
                    var relative = ct.GetConnectorPosition(this);
                    c.Position = new Point(relative.X - 3, relative.Y - 3);
                    connector.Visual = c;
                    connector.IsVisible = false;
                    connector.Parent = this;
                    var text = (ct.Description == null || ct.Description.length == 0) ? ct.Name : ct.Description;
                    c.Title = text;
                    g.Append(c);
                    this.Connectors.push(connector);
                }
            };

            Object.defineProperty(Shape.prototype, "Title", {
                /**
                * Sets the title of this visual.
                */
                get: function () {
                    return this.visual.Title;
                },
                /**
                * Gets the title of this visual.
                */
                set: function (v) {
                    this.visual.Title = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Rectangle", {
                /*
                * Gets the bounding rectangle of this shape.
                */
                get: function () {
                    return ((this.adorner != null)) ? this.adorner.Rectangle : this.rectangle;
                },
                /*
                * Sets the bounding rectangle of this shape.
                */
                set: function (r) {
                    this.rectangle = r;
                    if (this.adorner != null)
                        this.adorner.UpdateRectangle(r);
                    this.Invalidate();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "Template", {
                /*
                * Gets the shape template.
                */
                get: function () {
                    return this.template;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "Connectors", {
                /*
                * Gets the connectors of this shape.
                */
                get: function () {
                    return this.connectors;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "Adorner", {
                /*
                * Gets the resizing adorner of this shape.
                */
                get: function () {
                    return this.adorner;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shape.prototype, "IsSelected", {
                /*
                * Gets whether this shape is selected.
                */
                get: function () {
                    return this.isSelected;
                },
                /*
                * Sets whether this shape is selected.
                */
                set: function (value) {
                    if (this.isSelected != value) {
                        this.isSelected = value;

                        if (this.isSelected) {
                            this.adorner = new ResizingAdorner(this.Rectangle, this.template.IsResizable);
                            this.Diagram.MainLayer.Append(this.adorner.Visual);
                            this.Invalidate();
                        } else {
                            this.Invalidate();
                            this.Diagram.MainLayer.Remove(this.adorner.Visual);
                            this.adorner = null;
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Shape.prototype, "IsHovered", {
                /*
                * Gets whether the mouse pointer is currently over this shape.
                */
                get: function () {
                    return this.isHovered;
                },
                /*
                * Sets whether the mouse pointer is currently over this shape.
                */
                set: function (value) {
                    this.isHovered = value;
                    if (this.Connectors.length > 0)
                        for (var i = 0; i < this.Connectors.length; i++)
                            this.Connectors[i].IsVisible = value;
                },
                enumerable: true,
                configurable: true
            });


            Shape.prototype.paint = function (context) {
                //this.template.paint(this, context);
                if (this.isSelected)
                    this.adorner.paint(context);
            };
            Object.defineProperty(Shape.prototype, "Position", {
                set: function (value) {
                    this.translation.X = value.X;
                    this.translation.Y = value.Y;
                    this.visual.Native.setAttribute("transform", this.translation.toString() + this.rotation.toString());
                },
                enumerable: true,
                configurable: true
            });
            Shape.prototype.Invalidate = function () {
                this.Position = this.Rectangle.TopLeft;
                this.mainVisual.Width = this.Rectangle.Width;
                this.mainVisual.Height = this.Rectangle.Height;
                if (this.Connectors.length > 0) {
                    var cons = [];
                    for (var i = 0; i < this.Connectors.length; i++) {
                        var c = this.Connectors[i];
                        var ct = this.Template.ConnectorTemplates[i];
                        var relative = ct.GetConnectorPosition(this);
                        c.Visual.Position = new Point(relative.X - 3, relative.Y - 3);
                        if (c.Connections.length > 0) {
                            for (var j = 0; j < c.Connections.length; j++)
                                if (!cons.Contains(c.Connections[j]))
                                    cons.push(c.Connections[j]);
                        }
                    }
                    cons.ForEach(function (con) {
                        return con.Invalidate();
                    });
                }
            };

            Shape.prototype.toString = function () {
                return (this.Template == null) ? "Shape" : ("Shape '" + this.Template.Id) + "'";
            };

            /**
            * Hit testing of this item with respect to the given rectangle.
            * @param r The rectangle to test.
            */
            Shape.prototype.HitTest = function (r) {
                if ((r.Width === 0) && (r.Height === 0)) {
                    if (this.Rectangle.Contains(r.TopLeft))
                        return true;
                    if ((this.adorner != null)) {
                        var h = this.adorner.HitTest(r.TopLeft);
                        if ((h.X >= -1) && (h.X <= +1) && (h.Y >= -1) && (h.Y <= +1))
                            return true;
                    }
                    for (var i = 0; i < this.connectors.length; i++)
                        if (this.connectors[i].HitTest(r))
                            return true;

                    return false;
                }
                return r.Contains(this.Rectangle.TopLeft);
            };

            Shape.prototype.GetCursor = function (point) {
                if (this.adorner != null) {
                    var cursor = this.adorner.GetCursor(point);
                    if (cursor != null)
                        return cursor;
                }
                if (window.event.shiftKey)
                    return Cursors.add;
                return Cursors.select;
            };

            Shape.prototype.GetConnector = function (name) {
                for (var i = 0; i < this.connectors.length; i++) {
                    var connector = this.connectors[i];
                    if (connector.Template.Name == name)
                        return connector;
                }
                return null;
            };

            Shape.prototype.GetConnectorPosition = function (connector) {
                var r = this.Rectangle;
                var point = connector.Template.GetConnectorPosition(this);
                point.X += r.X;
                point.Y += r.Y;
                return point;
            };

            Shape.prototype.setContent = function (content) {
                this.Diagram.setElementContent(this, content);
            };

            Object.defineProperty(Shape.prototype, "Content", {
                get: function () {
                    return this._content;
                },
                set: function (value) {
                    this._content = value;
                },
                enumerable: true,
                configurable: true
            });

            return Shape;
        })();
        Diagramming.Shape = Shape;

        /**
        * The service handling the undo-redo stack.
        */
        var UndoRedoService = (function () {
            function UndoRedoService() {
                this.composite = null;
                this.stack = [];
                this.index = 0;
            }
            /**
            * Starts a new composite unit which can be either cancelled or committed.
            */
            UndoRedoService.prototype.begin = function () {
                this.composite = new CompositeUnit();
            };

            UndoRedoService.prototype.Cancel = function () {
                this.composite = null;
            };

            UndoRedoService.prototype.commit = function () {
                if (!this.composite.IsEmpty) {
                    // throw away anything beyond this point if this is a new branch
                    this.stack.splice(this.index, this.stack.length - this.index);
                    this.stack.push(this.composite);
                    this.Redo();
                }
                this.composite = null;
            };

            /**
            * Adds the given undoable unit to the current composite. Use the simple add() method if you wish to do things in one swing.
            * @param undoUnit The undoable unit to add.
            */
            UndoRedoService.prototype.AddCompositeItem = function (undoUnit) {
                if (this.composite == null)
                    throw "Use begin() to initiate and then add an undoable unit.";
                this.composite.Add(undoUnit);
            };

            /**
            * Adds the given undoable unit to the stack and executes it.
            * @param undoUnit The undoable unit to add.
            */
            UndoRedoService.prototype.Add = function (undoUnit) {
                if (undoUnit == null)
                    throw "No undoable unit supplied.";

                // throw away anything beyond this point if this is a new branch
                this.stack.splice(this.index, this.stack.length - this.index);
                this.stack.push(new CompositeUnit(undoUnit));
                this.Redo();
            };

            /**
            * Returns the number of composite units in this undo-redo stack.
            */
            UndoRedoService.prototype.count = function () {
                return this.stack.length;
            };

            UndoRedoService.prototype.Undo = function () {
                if (this.index != 0) {
                    this.index--;
                    this.stack[this.index].Undo();
                }
            };

            UndoRedoService.prototype.Redo = function () {
                if ((this.stack.length != 0) && (this.index < this.stack.length)) {
                    this.stack[this.index].Redo();
                    this.index++;
                } else {
                    throw "Reached the end of the undo-redo stack.";
                }
            };
            return UndoRedoService;
        })();
        Diagramming.UndoRedoService = UndoRedoService;

        /**
        * The adorner supporting the scaling of items.
        */
        var ResizingAdorner = (function () {
            function ResizingAdorner(rectangle, resizable) {
                this.isManipulating = false;
                this.map = {};
                this.initialState = null;
                this.finalState = null;
                this.rectangle = rectangle.Clone();
                this.isresizable = resizable;
                this.createVisuals();
            }
            Object.defineProperty(ResizingAdorner.prototype, "Visual", {
                get: function () {
                    return this.visual;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ResizingAdorner.prototype, "InitialState", {
                get: function () {
                    return this.initialState;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ResizingAdorner.prototype, "FinalState", {
                get: function () {
                    return this.finalState;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ResizingAdorner.prototype, "Rectangle", {
                get: function () {
                    return this.rectangle;
                },
                enumerable: true,
                configurable: true
            });

            ResizingAdorner.prototype.createVisuals = function () {
                var g = new Group();
                for (var x = -1; x <= +1; x++) {
                    for (var y = -1; y <= +1; y++) {
                        if ((x != 0) || (y != 0)) {
                            var r = this.GetHandleBounds(new Point(x, y));
                            var visual = new SVG.Rectangle();
                            visual.Position = r.TopLeft;
                            visual.Width = 7;
                            visual.Height = 7;
                            visual.Background = "DimGray";

                            this.map[x.toString() + y.toString()] = visual;
                            g.Append(visual);
                        }
                    }
                }
                g.Position = this.rectangle.TopLeft;
                g.IsVisible = true;
                this.text = new SVG.TextBlock();
                this.text.FontSize = 10;
                this.text.Position = new Point(0, this.rectangle.Height + 20);
                this.text.Text = "Width: " + this.rectangle.Width + ", Height: " + this.rectangle.Height;
                g.Append(this.text);
                this.visual = g;
            };

            ResizingAdorner.prototype.updateVisual = function () {
                for (var x = -1; x <= +1; x++) {
                    for (var y = -1; y <= +1; y++) {
                        if ((x != 0) || (y != 0)) {
                            var v = this.map[x.toString() + y.toString()];
                            var r = this.GetHandleBounds(new Point(x, y));
                            v.Position = r.TopLeft;
                        }
                    }
                }
                this.text.Position = new Point(0, this.rectangle.Height + 20);
                this.text.Text = "Width: " + this.rectangle.Width + ", Height: " + this.rectangle.Height;
                this.visual.Position = this.rectangle.TopLeft;
            };

            ResizingAdorner.prototype.HitTest = function (point) {
                // (0, 0) element, (-1, -1) top-left, (+1, +1) bottom-right
                if (this.isresizable) {
                    for (var x = -1; x <= +1; x++) {
                        for (var y = -1; y <= +1; y++) {
                            if ((x != 0) || (y != 0)) {
                                var hit = new Point(x, y);
                                var r = this.GetHandleBounds(hit);
                                r.Offset(this.rectangle.X, this.rectangle.Y);
                                if (r.Contains(point))
                                    return hit;
                            }
                        }
                    }
                }

                if (this.rectangle.Contains(point))
                    return new Point(0, 0);
                return new Point(-2, -2);
            };

            ResizingAdorner.prototype.GetHandleBounds = function (p) {
                var r = new Rect(0, 0, 7, 7);
                if (p.X < 0) {
                    r.X = -7;
                }
                if (p.X === 0) {
                    r.X = Math.floor(this.rectangle.Width / 2) - 3;
                }
                if (p.X > 0) {
                    r.X = this.rectangle.Width + 1.0;
                }
                if (p.Y < 0) {
                    r.Y = -7;
                }
                if (p.Y === 0) {
                    r.Y = Math.floor(this.rectangle.Height / 2) - 3;
                }
                if (p.Y > 0) {
                    r.Y = this.rectangle.Height + 1.0;
                }
                return r;
            };

            ResizingAdorner.prototype.GetCursor = function (point) {
                var hit = this.HitTest(point);
                if ((hit.X === 0) && (hit.Y === 0))
                    return (this.isManipulating) ? Cursors.MoveTo : Cursors.select;
                if ((hit.X >= -1) && (hit.X <= +1) && (hit.Y >= -1) && (hit.Y <= +1) && this.isresizable) {
                    if (hit.X === -1 && hit.Y === -1) {
                        return "nw-resize";
                    }
                    if (hit.X === +1 && hit.Y === +1) {
                        return "se-resize";
                    }
                    if (hit.X === -1 && hit.Y === +1) {
                        return "sw-resize";
                    }
                    if (hit.X === +1 && hit.Y === -1) {
                        return "ne-resize";
                    }
                    if (hit.X === 0 && hit.Y === -1) {
                        return "n-resize";
                    }
                    if (hit.X === 0 && hit.Y === +1) {
                        return "s-resize";
                    }
                    if (hit.X === +1 && hit.Y === 0) {
                        return "e-resize";
                    }
                    if (hit.X === -1 && hit.Y === 0) {
                        return "w-resize";
                    }
                }
                return null;
            };

            ResizingAdorner.prototype.Start = function (point, handle) {
                if ((handle.X >= -1) && (handle.X <= +1) && (handle.Y >= -1) && (handle.Y <= +1)) {
                    this.currentHandle = handle;
                    this.initialState = this.rectangle;
                    this.finalState = null;
                    this.currentPoint = point;
                    this.isManipulating = true;
                }
            };

            ResizingAdorner.prototype.Stop = function () {
                this.finalState = this.rectangle;
                this.isManipulating = false;
            };

            Object.defineProperty(ResizingAdorner.prototype, "IsManipulation", {
                get: function () {
                    return this.isManipulating;
                },
                enumerable: true,
                configurable: true
            });

            ResizingAdorner.prototype.MoveTo = function (p) {
                var h = this.currentHandle;
                var a = Point.Empty;
                var b = Point.Empty;
                if ((h.X == -1) || ((h.X === 0) && (h.Y === 0))) {
                    a.X = p.X - this.currentPoint.X;
                }
                if ((h.Y == -1) || ((h.X === 0) && (h.Y === 0))) {
                    a.Y = p.Y - this.currentPoint.Y;
                }
                if ((h.X == +1) || ((h.X === 0) && (h.Y === 0))) {
                    b.X = p.X - this.currentPoint.X;
                }
                if ((h.Y == +1) || ((h.X === 0) && (h.Y === 0))) {
                    b.Y = p.Y - this.currentPoint.Y;
                }
                var tl = this.rectangle.TopLeft;
                var br = new Point(this.rectangle.X + this.rectangle.Width, this.rectangle.Y + this.rectangle.Height);
                tl.X += a.X;
                tl.Y += a.Y;
                br.X += b.X;
                br.Y += b.Y;

                //if (a.X != 0 || a.Y != 0) console.log("a: (" + a.X + "," + a.Y + ")");
                //if (b.X != 0 || b.Y != 0) console.log("b: (" + b.X + "," + b.Y + ")");
                //cut-off
                if (Math.abs(br.X - tl.X) <= 4 || Math.abs(br.Y - tl.Y) <= 4)
                    return;
                this.rectangle.X = tl.X;
                this.rectangle.Y = tl.Y;
                this.rectangle.Width = Math.floor(br.X - tl.X);
                this.rectangle.Height = Math.floor(br.Y - tl.Y);
                this.currentPoint = p;
                this.updateVisual();
            };

            ResizingAdorner.prototype.UpdateRectangle = function (r) {
                this.rectangle = r.Clone();
                this.updateVisual();
            };

            ResizingAdorner.prototype.paint = function (context) {
            };
            return ResizingAdorner;
        })();
        Diagramming.ResizingAdorner = ResizingAdorner;

        /**
        * The service handling the undo-redo stack.
        */
        var Selector = (function () {
            function Selector(diagram) {
                this.IsActive = false;
                this.visual = new SVG.Rectangle();

                //this.visual.Background = "#778899";
                this.visual.Stroke = "#778899";
                this.visual.StrokeThickness = 1;
                this.visual.StrokeDash = "2,2";
                this.visual.Opacity = 0.0;
                this.diagram = diagram;
                //this.visual.IsVisible = false;
            }
            Object.defineProperty(Selector.prototype, "Visual", {
                get: function () {
                    return this.visual;
                },
                enumerable: true,
                configurable: true
            });

            Selector.prototype.Start = function (startPoint) {
                this.startPoint = startPoint;
                this.currentPoint = startPoint;
                this.visual.IsVisible = true;
                this.visual.Position = startPoint;
                this.diagram.MainLayer.Append(this.visual);
                this.IsActive = true;
                //console.log(this.startPoint.toString());
            };

            Selector.prototype.End = function () {
                if (!this.IsActive)
                    return;

                //console.log(this.currentPoint.toString());
                this.startPoint = null;
                this.currentPoint = null;
                this.visual.IsVisible = false;
                this.diagram.MainLayer.Remove(this.visual);
                this.IsActive = false;
            };

            Object.defineProperty(Selector.prototype, "Rectangle", {
                get: function () {
                    var r = new Rect((this.startPoint.X <= this.currentPoint.X) ? this.startPoint.X : this.currentPoint.X, (this.startPoint.Y <= this.currentPoint.Y) ? this.startPoint.Y : this.currentPoint.Y, this.currentPoint.X - this.startPoint.X, this.currentPoint.Y - this.startPoint.Y);
                    if (r.Width < 0)
                        r.Width *= -1;
                    if (r.Height < 0)
                        r.Height *= -1;
                    return r;
                },
                enumerable: true,
                configurable: true
            });

            Selector.prototype.updateCurrentPoint = function (p) {
                this.currentPoint = p;
            };

            Selector.prototype.paint = function (context) {
                var r = this.Rectangle;
                this.visual.Position = r.TopLeft;
                this.visual.Width = r.Width + 1;
                this.visual.Height = r.Height + 1;
            };
            return Selector;
        })();
        Diagramming.Selector = Selector;

        /**
        * Defines a standard shape template with four connectors.
        */
        var ShapeTemplateBase = (function () {
            function ShapeTemplateBase(id) {
                if (typeof id === "undefined") { id = null; }
                this.IsResizable = true;
                this.DefaultContent = "";
                this.ConnectorTemplates = ShapeTemplateBase.DefaultConnectorTemplates;
                this.Id = id;
                this.Width = 150;
                this.Height = 80;
                this.Position = Point.Empty;
                this.Stroke = "Silver";
                this.StrokeThickness = 0;
                this.Background = "#1e90ff";
            }
            ShapeTemplateBase.prototype.Edit = function (element, canvas, point) {
                // will do later on
            };

            ShapeTemplateBase.prototype.Clone = function () {
                var clone = new ShapeTemplateBase();
                clone.Id = this.Id;
                clone.Width = this.Width;
                clone.Height = this.Height;
                clone.Position = this.Position;
                clone.Background = this.Background;
                return clone;
            };
            ShapeTemplateBase.DefaultConnectorTemplates = [
                {
                    Name: "Top",
                    Type: "Data [in]",
                    Description: "Top Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(Math.floor(parent.Rectangle.Width / 2), 0);
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Top";
                    }
                },
                {
                    Name: "Right",
                    Type: "Data [in]",
                    Description: "Right Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(Math.floor(parent.Rectangle.Width), Math.floor(parent.Rectangle.Height / 2));
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Left";
                    }
                },
                {
                    Name: "Bottom",
                    Type: "Data [out] [array]",
                    Description: "Bottom Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(Math.floor(parent.Rectangle.Width / 2), parent.Rectangle.Height);
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Bottom";
                    }
                },
                {
                    Name: "Left",
                    Type: "Data [in]",
                    Description: "Left Connector",
                    GetConnectorPosition: function (parent) {
                        return new Point(0, Math.floor(parent.Rectangle.Height / 2));
                    },
                    CanConnectTo: function (other) {
                        return other.Template.Name == "Right";
                    }
                }
            ];
            return ShapeTemplateBase;
        })();
        Diagramming.ShapeTemplateBase = ShapeTemplateBase;

        /**
        * A collection of pre-defined shapes.
        */
        var Shapes = (function () {
            function Shapes() {
            }
            Object.defineProperty(Shapes, "Rectangle", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "Rectangle";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "Triangle", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m2.5,109.24985l61,-106.74985l61,106.74985l-122,0z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "SequentialData", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m50.21875,97.4375l0,0c-26.35457,0 -47.71875,-21.25185 -47.71875,-47.46875l0,0c0,-26.21678 21.36418,-47.46875 47.71875,-47.46875l0,0c12.65584,0 24.79359,5.00155 33.74218,13.90339c8.94862,8.90154 13.97657,20.97617 13.97657,33.56536l0,0c0,12.58895 -5.02795,24.66367 -13.97657,33.56542l13.97657,0l0,13.90333l-47.71875,0z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "Data", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m2.5,97.70305l19.07013,-95.20305l76.27361,0l-19.0702,95.20305l-76.27354,0z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Shapes, "Wave", {
                get: function () {
                    var shape = new ShapeTemplateBase();
                    shape.Geometry = "m2.5,15.5967c31.68356,-45.3672 63.37309,45.3642 95.05661,0l0,81.65914c-31.68353,45.36404 -63.37305,-45.36732 -95.05661,0l0,-81.65914z";
                    return shape;
                },
                enumerable: true,
                configurable: true
            });
            return Shapes;
        })();
        Diagramming.Shapes = Shapes;

        /**
        * Node types used when parsing XML.
        */
        (function (NodeTypes) {
            NodeTypes[NodeTypes["ElementNode"] = 1] = "ElementNode";
            NodeTypes[NodeTypes["AttributeNode"] = 2] = "AttributeNode";
            NodeTypes[NodeTypes["TextNode"] = 3] = "TextNode";
            NodeTypes[NodeTypes["CDataNode"] = 4] = "CDataNode";
            NodeTypes[NodeTypes["EntityReferenceNode"] = 5] = "EntityReferenceNode";
            NodeTypes[NodeTypes["EntityNode"] = 6] = "EntityNode";
            NodeTypes[NodeTypes["ProcessingInstructionNode"] = 7] = "ProcessingInstructionNode";
            NodeTypes[NodeTypes["CommentNode"] = 8] = "CommentNode";
            NodeTypes[NodeTypes["DocumentNode"] = 9] = "DocumentNode";
            NodeTypes[NodeTypes["DocumentTypeNode"] = 10] = "DocumentTypeNode";
            NodeTypes[NodeTypes["DocumentFragmentNode"] = 11] = "DocumentFragmentNode";
            NodeTypes[NodeTypes["NotationNode"] = 12] = "NotationNode";
        })(Diagramming.NodeTypes || (Diagramming.NodeTypes = {}));
        var NodeTypes = Diagramming.NodeTypes;
    })(TypeViz.Diagramming || (TypeViz.Diagramming = {}));
    var Diagramming = TypeViz.Diagramming;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=Diagramming.js.map
