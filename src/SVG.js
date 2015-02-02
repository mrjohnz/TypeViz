var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
Copyright (c) 2007-2014, Orbifold bvba.
For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
Documentation can be found at http://www.TypeViz.com
*/
/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="Animation.ts" />
/// <reference path="Arrays.ts" />
///<reference path='Structures.ts' />
///<reference path='Media.ts' />
var TypeViz;
(function (TypeViz) {
    var Point = TypeViz.Point;
    var Rect = TypeViz.Rect;

    

    /**
    * Holds the SVG primitives.
    */
    (function (SVG) {
        /**
        * The SVG namespace (http://www.w3.org/2000/svg).
        */
        SVG.NS = "http://www.w3.org/2000/svg";
        SVG.XLINKNS = "http://www.w3.org/1999/xlink";

        /**
        * Base class for all visuals participating in an SVG drawing.
        */
        var Visual = (function () {
            /**
            * Instanstiates a new visual.
            */
            function Visual() {
                this.mouseMoveHandlers = [];
                this.mouseUpHandlers = [];
                this.mouseOverHandlers = [];
                this.mouseOutHandlers = [];
                this.mouseDownHandlers = [];
                this.mouseClickHandlers = [];
            }

            Object.defineProperty(Visual.prototype, "Cursor", {
                get: function () {
                    var current = this.Native.style.cursor;
                    if (!current)
                        return 1 /* Default */;
                    return this.toCursorEnum(current.toString());
                },
                /**
                * Sets the cursor on this visual.
                * @param value
                * @constructor
                */
                set: function (value) {
                    this.Native.style.cursor = this.toCursorString(value);
                },
                enumerable: true,
                configurable: true
            });

            Visual.prototype.toCursorString = function (cursor) {
                switch (cursor) {
                    case 0:
                    case "CrossHair":
                        return "crosshair";
                    case 1:
                    case "Default":
                        return "default";
                    case 2:
                    case "Pointer":
                        return "pointer";
                    case 3:
                    case "Move":
                        return "move";
                    case 4:
                    case "EastResize":
                        return "e-resize";
                    case 5:
                    case "NorthEastResize":
                        return "ne-resize";
                    case 6:
                    case "NorthWestResize":
                        return "nw-resize";
                    case 7:
                    case "NorthResize":
                        return "n-resize";
                    case 8:
                    case "SouthEastResize":
                        return "se-resize";
                    case 9:
                    case "SouthWestResize":
                        return "sw-resize";
                    case 10:
                    case "SouthResize":
                        return "s-resize";
                    case 11:
                    case "WestResize":
                        return "w-resize";
                    case 12:
                    case "Text":
                        return "text";
                    case 13:
                    case "Wait":
                        return "wait";
                    case 14:
                    case "Help":
                        return "help";
                }
            };

            Visual.prototype.toCursorEnum = function (cursor) {
                switch (cursor.toLowerCase()) {
                    case "crosshair":
                        return 0 /* CrossHair */;
                    case "default":
                        return 1 /* Default */;
                    case "e-resize":
                        return 4 /* EastResize */;
                    case "help":
                        return 14 /* Help */;
                    case "move":
                        return 3 /* Move */;
                    case "ne-resize":
                        return 5 /* NorthEastResize */;
                    case "n-resize":
                        return 7 /* NorthResize */;
                    case "nw-resize":
                        return 6 /* NorthWestResize */;
                    case "pointer":
                        return 2 /* Pointer */;
                    case "se-resize":
                        return 8 /* SouthEastResize */;
                    case "s-resize":
                        return 10 /* SouthResize */;
                    case "sw-resize":
                        return 9 /* SouthWestResize */;
                    case "text":
                        return 12 /* Text */;
                    case "wait":
                        return 13 /* Wait */;
                    case "w-resize":
                        return 11 /* WestResize */;
                    default:
                        throw "Unsupported cursor type '" + cursor + "'.";
                }
                //return Cursors[cursor];
            };

            Object.defineProperty(Visual.prototype, "Clip", {
                /**
                Gets the clipping path.
                */
                get: function () {
                    return this.clip;
                },
                /**
                Sets the clipping path.
                */
                set: function (value) {
                    this.clip = value;
                    if (value.Id == null)
                        throw "The clip path needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("clip-path", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "DataContext", {
                /**
                Gets the data context of this element.
                */
                get: function () {
                    return this.dataContext ? this.dataContext : (this.Canvas ? this.Canvas.DataContext : null);
                },
                /**
                Sets the data context of this element.
                */
                set: function (value) {
                    this.dataContext = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            The given value-returning subscriber is subscribed to the DataContext and the value returned is assigned to the specified property.
            */
            Visual.prototype.Bind = function (property, f) {
                if (!(property in this))
                    throw "Property '" + property + "' does not exist on this object.";
                if (!this.DataContext)
                    throw "No DataContext to bind to. Define a DataContext on this object first or attach it to a Canvas with a DataContext.";
                if (!("Subscribe" in this.DataContext))
                    throw "Cannot bind the function; the DataContext does not have a 'Subscribe' method to subscribe to.";
                var visual = this;
                var subscription = function (model, subset) {
                    var returned = f.call(visual, model, subset);
                    if (returned)
                        visual[property] = returned;
                };
                if (!this.subscriptions)
                    this.subscriptions = new TypeViz.Map();
                this.subscriptions.Set(f, subscription);
                this.DataContext.Subscribe(subscription);
            };

            /**
            Unbinds the given subscriber from the property.
            */
            Visual.prototype.Unbind = function (f) {
                if (!this.subscriptions || !this.subscriptions.Contains(f))
                    throw "The given function is not bound to this objects.";
                if (!this.DataContext)
                    throw "No DataContext anymore; the function was bound to another DataContext.";
                var subscription = this.subscriptions.Get(f);
                if (!subscription)
                    throw "Functions was found but the corresponding subscription is null.";
                this.DataContext.RemoveSubscriber(subscription);
                this.subscriptions.remove(f);
            };

            Visual.prototype.Change = function (to, options) {
                if (this.animator == null)
                    this.animator = new TypeViz.Animation.Animator([this]);

                // todo: check the looping, the Clear disables looping probably.
                this.animator.Clear();
                return this.animator.Change(to, options);
            };

            /**
            * Occurs when the mouse is moved over this visual.
            */
            Visual.prototype.MouseMove = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseMoveHandlers.push(handler);
            };

            /**
            * Removes the given handler from the MouseMove event handlers.
            */
            Visual.prototype.RemoveMouseMoveHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseMoveHandlers.Contains(handler))
                    this.mouseMoveHandlers.Remove(handler);
            };

            /**
            * Clears the handlers of the mouse move event.
            */
            Visual.prototype.ClearMouseMoveHandlers = function () {
                this.mouseMoveHandlers.Clear();
            };

            /**
            * Occurs when the mouse is pressed over this visual.
            */
            Visual.prototype.MouseDown = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseDownHandlers.push(handler);
            };

            /**
            * Removes the given handler from the MouseDown event handlers.
            */
            Visual.prototype.RemoveMouseDownHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseDownHandlers.Contains(handler))
                    this.mouseDownHandlers.Remove(handler);
            };

            /**
            * Clears the handlers of the mouse down event.
            */
            Visual.prototype.ClearMouseDownHandlers = function () {
                this.mouseDownHandlers.Clear();
            };

            /**
            * Occurs when the mouse is released over visual.
            */
            Visual.prototype.MouseUp = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseUpHandlers.push(handler);
            };

            /**
            * Removes the given handler from the MouseMove event handlers.
            */
            Visual.prototype.RemoveMouseUpHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseUpHandlers.Contains(handler))
                    this.mouseUpHandlers.Remove(handler);
            };

            /**
            * Clears the handlers of the mouse up event.
            */
            Visual.prototype.ClearMouseUpHandlers = function () {
                this.mouseUpHandlers.Clear();
            };

            /**
            * Occurs when the mouse is over visual.
            */
            Visual.prototype.MouseOver = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseOverHandlers.push(handler);
            };

            /**
            * Removes the given handler from the MouseOver event handlers.
            */
            Visual.prototype.RemoveMouseOverHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseOverHandlers.Contains(handler))
                    this.mouseOverHandlers.Remove(handler);
            };

            /**
            * Clears the handlers of the mouse over event.
            */
            Visual.prototype.ClearMouseOverHandlers = function () {
                this.mouseOverHandlers.Clear();
            };

            /**
            * Occurs when the mouse has left the visual.
            */
            Visual.prototype.MouseOut = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseOutHandlers.push(handler);
            };

            /**
            * Removes the given handler from the MouseOut event handlers.
            */
            Visual.prototype.RemoveMouseOutHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseOutHandlers.Contains(handler))
                    this.mouseOutHandlers.Remove(handler);
            };

            /**
            * Clears the handlers of the MouseOut event.
            */
            Visual.prototype.ClearMouseOutHandlers = function () {
                this.mouseOutHandlers.Clear();
            };

            /**
            * Occurs when the mouse was clicked on the visual.
            */
            Visual.prototype.MouseClick = function (handler) {
                if (handler == null)
                    throw "Cannot add a null handler.";
                this.mouseClickHandlers.push(handler);
            };

            /**
            * Removes the given handler from the MouseClick event handlers.
            */
            Visual.prototype.RemoveMouseClickHandler = function (handler) {
                if (handler == null)
                    throw "Cannot remove a null handler.";
                if (this.mouseClickHandlers.Contains(handler))
                    this.mouseClickHandlers.Remove(handler);
            };

            /**
            * Clears the handlers of the MouseClick event.
            */
            Visual.prototype.ClearMouseClickHandlers = function () {
                this.mouseClickHandlers.Clear();
            };

            Object.defineProperty(Visual.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Position", {
                get: function () {
                    return null;
                },
                set: function (v) {
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Id", {
                /**
                * Returns the identifier.
                */
                get: function () {
                    return this.Native == null ? null : this.Native.id;
                },
                /**
                * Sets the identifier.
                */
                set: function (value) {
                    this.Native.id = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Title", {
                /**
                * Sets the title of this visual.
                */
                get: function () {
                    return this.title.textContent;
                },
                /**
                * Gets the title of this visual.
                */
                set: function (v) {
                    if (this.title == null) {
                        this.title = document.createElementNS(SVG.NS, "title");
                        this.Native.appendChild(this.title);
                    }

                    this.title.textContent = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Visual.prototype, "Class", {
                /**
                * Sets the CSS class of this visual.
                */
                get: function () {
                    if (this.Native.attributes["class"] == null)
                        return null;
                    return this.Native.attributes["class"].value;
                },
                /**
                * Gets the CSS class of this visual.
                */
                set: function (v) {
                    if (v == null)
                        this.Native.removeAttribute("class");
                    else
                        this.Native.setAttribute("class", v);
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Part of the inheritance chain, this assigns the SVG element defined by the inheriting class and the canvas to which this element belongs.
            * The 'super' has to be parameterless, hence the necessity of this Initializer.
            */
            Visual.prototype.Initialize = function () {
                this.nativeElement.id = TypeViz.RandomId();
                this.ListenToEvents();
            };

            /**
            * Rewires the nativeElement events to API events.
            */
            Visual.prototype.ListenToEvents = function () {
                var _this = this;
                this.Native.onmousedown = function (e) {
                    return _this.onMouseDown(e);
                };
                this.Native.onmousemove = function (e) {
                    return _this.onMouseMove(e);
                };
                this.Native.onmouseup = function (e) {
                    return _this.onMouseUp(e);
                };
                this.Native.onmouseover = function (e) {
                    return _this.onMouseOver(e);
                };
                this.Native.onmouseout = function (e) {
                    return _this.onMouseOut(e);
                };
            };

            /**
            * Detaches the event listeners from the nativeElement SVG element.
            */
            Visual.prototype.StopListeningToEvents = function () {
                this.Native.onmousedown = null;
                this.Native.onmousemove = null;
                this.Native.onmouseup = null;
            };

            Object.defineProperty(Visual.prototype, "IsVisible", {
                get: function () {
                    if (this.Native.attributes["visibility"] == null)
                        return true;
                    return this.Native.attributes["visibility"].value == "visible";
                },
                set: function (value) {
                    this.Native.setAttribute("visibility", (value ? "visible" : "hidden"));
                },
                enumerable: true,
                configurable: true
            });


            Visual.prototype.onMouseDown = function (e) {
                if (this.mouseDownHandlers.length > 0) {
                    for (var i = 0; i < this.mouseDownHandlers.length; i++) {
                        this.mouseDownHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseMove = function (e) {
                if (this.mouseMoveHandlers.length > 0) {
                    for (var i = 0; i < this.mouseMoveHandlers.length; i++) {
                        this.mouseMoveHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseUp = function (e) {
                if (this.mouseUpHandlers.length > 0) {
                    for (var i = 0; i < this.mouseUpHandlers.length; i++) {
                        this.mouseUpHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseOver = function (e) {
                if (this.mouseOverHandlers.length > 0) {
                    for (var i = 0; i < this.mouseOverHandlers.length; i++) {
                        this.mouseOverHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseOut = function (e) {
                if (this.mouseOutHandlers.length > 0) {
                    for (var i = 0; i < this.mouseOutHandlers.length; i++) {
                        this.mouseOutHandlers[i](e);
                    }
                }
            };

            Visual.prototype.onMouseClick = function (e) {
                if (this.mouseClickHandlers.length > 0) {
                    for (var i = 0; i < this.mouseClickHandlers.length; i++) {
                        this.mouseClickHandlers[i](e);
                    }
                }
            };

            //private onKeyDown(e: KeyboardEvent) { if (this.KeyDown) this.KeyDown(e); }
            //private onKeyPress(e: KeyboardEvent) { if (this.KeyPress) this.KeyPress(e); }
            Visual.prototype.PrePendTransform = function (transform) {
                var current = this.Native.attributes["transform"] == null ? "" : this.Native.attributes["transform"].value;
                this.Native.setAttribute("transform", transform.toString() + current);
            };

            Visual.prototype.Transform = function () {
                var transforms = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    transforms[_i] = arguments[_i + 0];
                }
                if (transforms.length == 1 && transforms[0] == null) {
                    // reset
                    this.Native.removeAttribute("transform");
                    return;
                }
                var current = this.Native.attributes["transform"] == null ? "" : this.Native.attributes["transform"].value;
                var s = current;
                for (var i = 0; i < transforms.length; i++)
                    s += transforms[i];
                this.Native.setAttribute("transform", s);
                return;
                if (current != null) {
                    //                var loc = <SVGLocatable><Object>this.Native.parentNode;
                    //                //var m = svg.Matrix.Parse(current);
                    //                if (loc != null)
                    //                {
                    //                    var mm= loc.getTransformToElement(this.Native).inverse();
                    //                    var m = Matrix.FromSVGMatrix(mm);
                    //                    for (var i = 0; i < transforms.length; i++) m = m.Times(transforms[i].ToMatrix());
                    //                    this.Native.setAttribute("transform", m.toString());
                    //                }
                    //                else
                    //                {
                    //                    throw "The current transform could not be fetched. The Native element is not SVGLocatable.";
                    //                }
                    var s = current;
                    for (var i = 0; i < transforms.length; i++)
                        s += transforms[i].toString();
                    this.Native.setAttribute("transform", s.toString());
                } else {
                    var m = Matrix.Unit;
                    for (var i = 0; i < transforms.length; i++)
                        m = m.Times(transforms[i].ToMatrix());
                    this.Native.setAttribute("transform", m.toString());
                }
            };

            /**
            * Gets the SVG color string from the given object; Color, RGB, HSL, string or Gradient.
            * If a Gradient has been supplied you need to call Canvas.AddGradient to add the gradient definition.
            */
            Visual.prototype.getColorString = function (color) {
                if (TypeViz.IsString(color))
                    return color;
                if (TypeViz.IsColor(color))
                    return color.AsHex6;
                if (color instanceof TypeViz.Media.RGB)
                    return color.AsHex6;
                if (color instanceof TypeViz.Media.HSL)
                    return color.AsHex6;
                if (TypeViz.IsLinearGradient(color)) {
                    var radialGradient = color;
                    if (radialGradient != null) {
                        if (radialGradient.Id == null)
                            throw "The radialGradientadient needs an Id.";

                        //assuming that the AddradialGradientadient method has been called on the Canvas
                        return "url(#" + radialGradient.Id + ")";
                    }
                }

                if (TypeViz.IsRadialGradient(color)) {
                    var linearGradient = color;
                    if (linearGradient != null) {
                        if (linearGradient.Id == null)
                            throw "The linearGradientadient needs an Id.";

                        //assuming that the AddlinearGradientadient method has been called on the Canvas
                        return "url(#" + linearGradient.Id + ")";
                    }
                }

                throw "Could not convert '" + color + "' to a color string.";
            };
            return Visual;
        })();
        SVG.Visual = Visual;

        /**
        * The SVG clipping path.
        * You need to add this ClipPath element to the Canvas using the AddClipPath method
        * and assign it to the Clip property of the Visual.
        */
        var ClipPath = (function () {
            function ClipPath() {
                this.nativeElement = document.createElementNS(SVG.NS, "clipPath");
                this.Id = TypeViz.RandomId();
                this.children = [];
                this.position = new TypeViz.Point(0, 0);
            }
            Object.defineProperty(ClipPath.prototype, "Id", {
                get: function () {
                    return this.id;
                },
                set: function (value) {
                    this.id = value;
                    this.nativeElement.setAttribute("id", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ClipPath.prototype, "Position", {
                /**
                * Gets the position of this group.
                */
                get: function () {
                    return this.position;
                },
                /**
                * Sets the position of this group.
                */
                set: function (p) {
                    if (p == null)
                        return;
                    this.position = p;
                    try  {
                        if (this.nativeElement.ownerSVGElement == null)
                            return;
                    } catch (err) {
                        return;
                    }

                    var tr = this.Native.ownerSVGElement.createSVGTransform();
                    tr.setTranslate(p.X, p.Y);
                    if (this.Native.transform.baseVal.numberOfItems == 0)
                        this.Native.transform.baseVal.appendItem(tr);
                    else
                        this.Native.transform.baseVal.replaceItem(tr, 0);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(ClipPath.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            ClipPath.prototype.Append = function (child) {
                if (this.children.Contains(child))
                    return;
                this.children.Append(child);
                this.nativeElement.appendChild(child.Native);
            };

            ClipPath.prototype.Remove = function (child) {
                if (this.children.Contains(child)) {
                    this.children.Remove(child);
                    this.nativeElement.removeChild(child.Native);
                }
            };
            return ClipPath;
        })();
        SVG.ClipPath = ClipPath;

        /**
        * Base class for various line-like elements.
        */
        var LineBase = (function (_super) {
            __extends(LineBase, _super);
            function LineBase(from, to) {
                if (typeof from === "undefined") { from = null; }
                if (typeof to === "undefined") { to = null; }
                _super.call(this);
            }
            Object.defineProperty(LineBase.prototype, "MarkerEnd", {
                get: function () {
                    if (this.Native.attributes["marker-end"] == null) {
                        return null;
                    }
                    var ss = this.Native.attributes["marker-end"].value.toString();
                    var id = ss.substr(5, ss.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++) {
                        if (markers[i].Id == id)
                            return markers[i];
                    }
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-end", s);
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(LineBase.prototype, "MarkerStart", {
                get: function () {
                    if (this.Native.attributes["marker-start"] == null)
                        return null;
                    var s = this.Native.attributes["marker-start"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-start", s);
                },
                enumerable: true,
                configurable: true
            });
            return LineBase;
        })(Visual);
        SVG.LineBase = LineBase;

        var Image = (function (_super) {
            __extends(Image, _super);
            function Image() {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "image");
                this.Width = 50;
                this.Height = 50;
            }
            Object.defineProperty(Image.prototype, "Position", {
                /* Gets the position of this image.*/
                get: function () {
                    return new TypeViz.Point(this.Native.x.baseVal.value, this.Native.y.baseVal.value);
                },
                /* Sets the position of this image.*/
                set: function (p) {
                    this.Native.x.baseVal.value = p.X;
                    this.Native.y.baseVal.value = p.Y;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Image.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Image.prototype, "Native", {
                /* Gets the nativeElement SVG element which this visual wraps.*/
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Image.prototype, "Height", {
                /* Gets the height of this image.*/
                get: function () {
                    return this.Native.height.baseVal.value;
                },
                /* Sets the height of this image.*/
                set: function (value) {
                    this.Native.height.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Image.prototype, "Width", {
                /* Gets the width of this image.*/
                get: function () {
                    return this.Native.width.baseVal.value;
                },
                /* Sets the width of this image.*/
                set: function (value) {
                    this.Native.width.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Image.prototype, "Url", {
                /* Gets the IRI of this image.*/
                get: function () {
                    if (this.Native.attributes["xlink:href"] == null)
                        return null;
                    return this.Native.attributes["xlink.href"].value;
                },
                /* Sets the width of this image.*/
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("xlink:href", "");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttributeNS(SVG.XLINKNS, "href", value.call(this, this.DataContext));
                        else
                            this.Native.setAttributeNS(SVG.XLINKNS, "href", value);
                    }
                },
                enumerable: true,
                configurable: true
            });

            return Image;
        })(Visual);
        SVG.Image = Image;

        /* A line visual.*/
        var Line = (function (_super) {
            __extends(Line, _super);
            /**
            * Instantiates a new Line.
            */
            function Line(from, to) {
                if (typeof from === "undefined") { from = null; }
                if (typeof to === "undefined") { to = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "line");
                this.Initialize();
                this.From = from;
                this.To = to;
                this.Stroke = "DimGray";
            }
            Object.defineProperty(Line.prototype, "From", {
                /**
                * Gets the point where the line starts.
                */
                get: function () {
                    return this.from;
                },
                /**
                * Sets the point where the line starts.
                */
                set: function (value) {
                    if (this.from != value) {
                        this.Native.setAttribute("x1", value.X.toString());
                        this.Native.setAttribute("y1", value.Y.toString());
                        this.from = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "To", {
                /**
                * Gets the point where the line ends.
                */
                get: function () {
                    return this.to;
                },
                /**
                * Sets the point where the line ends.
                */
                set: function (value) {
                    if (this.to != value) {
                        this.Native.setAttribute("x2", value.X.toString());
                        this.Native.setAttribute("y2", value.Y.toString());
                        this.to = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Opacity", {
                /**
                * Gets the opacity.
                */
                get: function () {
                    if (this.Native.attributes["opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["opacity"].value);
                },
                /**
                * Sets the opacity.
                */
                set: function (value) {
                    if (value < 0 || value > 1.0)
                        throw "The opacity should be in the [0,1] interval.";
                    this.Native.setAttribute("opacity", value.toString());
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Line.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Line.prototype, "X1", {
                get: function () {
                    return this.x1;
                },
                set: function (value) {
                    this.x1 = value;
                    this.from.X = value;
                    this.Native.setAttribute("x1", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "X2", {
                get: function () {
                    return this.x2;
                },
                set: function (value) {
                    this.x2 = value;
                    this.Native.setAttribute("x2", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Y1", {
                get: function () {
                    return this.y1;
                },
                set: function (value) {
                    this.y1 = value;
                    this.Native.setAttribute("y1", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Line.prototype, "Y2", {
                get: function () {
                    return this.y2;
                },
                set: function (value) {
                    this.y2 = value;
                    this.Native.setAttribute("y2", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            return Line;
        })(LineBase);
        SVG.Line = Line;

        

        /**
        * A scaling transformation.
        */
        var Scale = (function () {
            /**
            * Instantiates a new scaling transformation.
            * @param x The horizontal scaling.
            * @param y The vertical scaling.
            */
            function Scale(x, y) {
                if (typeof x === "undefined") { x = null; }
                if (typeof y === "undefined") { y = null; }
                if (x != null)
                    this.ScaleX = x;
                if (y != null)
                    this.ScaleY = y;
            }
            Scale.prototype.ToMatrix = function () {
                return Matrix.Scaling(this.ScaleX, this.ScaleY);
            };

            Scale.prototype.toString = function () {
                return "scale(" + this.ScaleX + ", " + this.ScaleY + ")";
            };
            return Scale;
        })();
        SVG.Scale = Scale;

        /**
        * Represent an SVG translation.
        */
        var Translation = (function () {
            function Translation(x, y) {
                if (typeof x === "undefined") { x = null; }
                if (typeof y === "undefined") { y = null; }
                if (x != null)
                    this.X = x;
                if (y != null)
                    this.Y = y;
            }
            Object.defineProperty(Translation.prototype, "X", {
                get: function () {
                    return this.x;
                },
                set: function (v) {
                    this.x = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Translation.prototype, "Y", {
                get: function () {
                    return this.y;
                },
                set: function (v) {
                    this.y = v;
                },
                enumerable: true,
                configurable: true
            });


            Translation.prototype.ToMatrixVector = function () {
                return new MatrixVector(0, 0, 0, 0, this.X, this.Y);
            };

            Translation.prototype.ToMatrix = function () {
                return Matrix.Translation(this.X, this.Y);
            };

            Translation.prototype.toString = function () {
                return "translate(" + this.X + ", " + this.Y + ")";
            };

            Translation.prototype.Plus = function (delta) {
                return new Translation(this.X + delta.X, this.Y + delta.Y);
            };

            Translation.prototype.Times = function (factor) {
                return new Translation(this.X * factor, this.Y * factor);
            };

            Object.defineProperty(Translation.prototype, "Length", {
                /**
                * Returns the size of this translation considered as a 2D vector.
                */
                get: function () {
                    return Math.sqrt(this.X * this.X + this.Y * this.Y);
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Normalizes the length of this translation to one.
            */
            Translation.prototype.Normalize = function () {
                if (this.Length == 0)
                    return new Translation();
                return new Translation(this.X / this.Length, this.Y / this.Length);
            };
            return Translation;
        })();
        SVG.Translation = Translation;

        /**
        * Represent an SVG rotation.
        */
        var Rotation = (function () {
            /**
            * Instantiates a new rotation.
            * @param angle The rotation angle in degrees.
            * @param x The rotation center's X coordinate.
            * @param y The rotation center's Y coordinate.
            */
            function Rotation(angle, x, y) {
                if (typeof angle === "undefined") { angle = null; }
                if (typeof x === "undefined") { x = null; }
                if (typeof y === "undefined") { y = null; }
                if (x != null)
                    this.X = x;
                if (y != null)
                    this.Y = y;
                if (angle != null)
                    this.Angle = angle;
            }
            Rotation.prototype.toString = function () {
                if (this.X != null || this.Y != null)
                    return "rotate(" + this.Angle + ", " + this.X + ", " + this.Y + ")";
                else
                    return "rotate(" + this.Angle + ")";
            };

            Rotation.prototype.ToMatrix = function () {
                if (this.X == 0 && this.Y == 0)
                    return Matrix.Rotation(this.Angle);
                else {
                    // T*R*T^-1
                    return Matrix.Rotation(this.Angle, this.X, this.Y);
                }
            };
            return Rotation;
        })();
        SVG.Rotation = Rotation;

        /**
        * The SVG TextSpan element.
        */
        var TextSpan = (function () {
            function TextSpan() {
                this.nativeElement = document.createElementNS(SVG.NS, "tspan");
                this.dx = 0;
                this.dy = 0;
            }
            Object.defineProperty(TextSpan.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextSpan.prototype, "dx", {
                /**
                * Gets the dx offset of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["dx"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dx"].value);
                },
                /**
                * Sets the dx offset of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("dx", v.toString() + 'em');
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextSpan.prototype, "dy", {
                /**
                * Gets the dy offset of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["dy"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dy"].value);
                },
                /**
                * Sets the dy offset of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("dy", v.toString() + "em");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextSpan.prototype, "X", {
                get: function () {
                    return parseFloat(this.Native.x.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("x", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextSpan.prototype, "Y", {
                get: function () {
                    return parseFloat(this.Native.y.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("y", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            return TextSpan;
        })();
        SVG.TextSpan = TextSpan;

        /**
        * The test anchorings.
        */
        (function (TextAnchor) {
            TextAnchor[TextAnchor["Left"] = 0] = "Left";
            TextAnchor[TextAnchor["Center"] = 1] = "Center";
            TextAnchor[TextAnchor["Right"] = 3] = "Right";
        })(SVG.TextAnchor || (SVG.TextAnchor = {}));
        var TextAnchor = SVG.TextAnchor;

        /**
        * A text block visual. See also the Controls.TextWrap element.
        */
        var TextBlock = (function (_super) {
            __extends(TextBlock, _super);
            function TextBlock(canvas) {
                if (typeof canvas === "undefined") { canvas = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "text");
                this.Initialize();
                this.dx = 0;
                this.dy = 0;
                this.FontFamily = "Verdana";
                this.FontVariant = 0 /* Normal */;
                this.Stroke = "steelblue";
                this.FontWeight = 0 /* Normal */;
                this.StrokeThickness = 0;
                this.FontSize = 10;
            }
            Object.defineProperty(TextBlock.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Background", {
                /**
                * Gets the fill of the circle.
                */
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


            Object.defineProperty(TextBlock.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(TextBlock.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextBlock.prototype, "X", {
                get: function () {
                    return parseFloat(this.Native.x.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("x", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Y", {
                get: function () {
                    return parseFloat(this.Native.y.baseVal.getItem(0).value.toString());
                },
                set: function (value) {
                    this.Native.setAttribute("y", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Position", {
                /**
                * Gets the position of this text block.
                */
                get: function () {
                    if (this.Native.x.baseVal.numberOfItems > 0)
                        return new TypeViz.Point(this.Native.x.baseVal.getItem(0).value, this.Native.y.baseVal.getItem(0).value);
                    else
                        return new TypeViz.Point(0, 0);
                },
                /**
                * Sets the position of this text block.
                */
                set: function (p) {
                    this.Native.setAttribute("x", p.X.toString());
                    this.Native.setAttribute("y", p.Y.toString());
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(TextBlock.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextBlock.prototype, "TextLength", {
                get: function () {
                    return this.Native["textLength"] ? this.Native.textLength.baseVal.value : this.Native.getComputedTextLength();
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(TextBlock.prototype, "Text", {
                /**
                * Gets the text of this text block.
                */
                get: function () {
                    return this.Native.textContent;
                },
                /**
                * Sets the text of this text block.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.textContent = "";
                    } else {
                        if (typeof value === "function")
                            this.Native.textContent = value.call(this, this.DataContext);
                        else
                            this.Native.textContent = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontFamily", {
                /**
                * Gets the font-family of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["font-family"] == null)
                        return null;
                    return this.Native.attributes["font-family"].value;
                },
                /**
                * Sets the font-family of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("font-family", v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontVariant", {
                /**
                * Gets the font-family of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["font-variant"] == null)
                        return null;
                    return TextBlock.ParseFontVariant(this.nativeElement.attributes["font-variant"].value);
                },
                /**
                * Sets the font-family of this text block.
                */
                set: function (v) {
                    var s = TextBlock.FontVariantString(v);
                    if (s != null)
                        this.Native.setAttribute("font-variant", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontSize", {
                /**
                * Gets the font-size of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["font-size"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["font-size"].value);
                },
                /**
                * Sets the font-size of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("font-size", v.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "FontWeight", {
                /**
                * Gets the font-size of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["font-weight"] == null)
                        return 14 /* NotSet */;
                    return TextBlock.ParseFontWeight(this.nativeElement.attributes["font-weight"].value);
                },
                /**
                * Sets the font-size of this text block.
                */
                set: function (v) {
                    var s = TextBlock.FontWeightString(v);
                    if (s != null)
                        this.Native.setAttribute("font-weight", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "Anchor", {
                /**
                * Gets the anchor of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["text-anchor"] == null)
                        return null;
                    return this.getTextAnchor(this.nativeElement.attributes["text-anchor"].value);
                },
                /**
                * Sets the anchor of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("text-anchor", this.getAnchorString(v));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "dx", {
                /**
                * Gets the dx offset of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["dx"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dx"].value);
                },
                /**
                * Sets the dx offset of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("dx", v.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(TextBlock.prototype, "dy", {
                /**
                * Gets the dy offset of this text block.
                */
                get: function () {
                    if (this.nativeElement.attributes["dy"] == null)
                        return null;
                    return parseFloat(this.nativeElement.attributes["dy"].value);
                },
                /**
                * Sets the dy offset of this text block.
                */
                set: function (v) {
                    this.Native.setAttribute("dy", v.toString() + "em");
                },
                enumerable: true,
                configurable: true
            });


            TextBlock.prototype.getAnchorString = function (anchor) {
                switch (anchor) {
                    case 0 /* Left */:
                        return "start";
                    case 1 /* Center */:
                        return "middle";
                    case 3 /* Right */:
                        return "end";
                    default:
                        throw "Unsupported anchor type.";
                }
            };

            TextBlock.prototype.getTextAnchor = function (anchor) {
                switch (anchor.toLowerCase()) {
                    case "start":
                        return 0 /* Left */;
                    case "middle":
                        return 1 /* Center */;
                    case "end":
                        return 3 /* Right */;
                    default:
                        throw "Unsupported anchor type.";
                }
            };

            /**
            * Parses the given string and attempts to convert it to a FontWeights member.
            * @param v A string representing a FontWeights.
            */
            TextBlock.ParseFontWeight = function (v) {
                if (v == null)
                    return 14 /* NotSet */;
                switch (v.toLowerCase()) {
                    case "normal":
                        return 0 /* Normal */;
                    case "bold":
                        return 1 /* Bold */;
                    case "bolder":
                        return 2 /* Bolder */;
                    case "lighter":
                        return 3 /* Lighter */;
                    case "100":
                        return 4 /* W100 */;
                    case "200":
                        return 5 /* W200 */;
                    case "300":
                        return 6 /* W300 */;
                    case "400":
                        return 7 /* W400 */;
                    case "500":
                        return 8 /* W500 */;
                    case "600":
                        return 9 /* W600 */;
                    case "700":
                        return 10 /* W700 */;
                    case "800":
                        return 11 /* W800 */;
                    case "900":
                        return 12 /* W900 */;
                    case "inherit":
                        return 13 /* Inherit */;
                }
                throw "String '" + v + "' could not be parsed to a FontWeights member.";
            };

            /**
            * Returns a string representation of the given FontWeights value.
            * @param value A FontWeights member.
            */
            TextBlock.FontWeightString = function (value) {
                switch (value) {
                    case 0:
                        return "normal";
                    case 1:
                        return "bold";
                    case 2:
                        return "bolder";
                    case 3:
                        return "lighter";
                    case 4:
                        return "100";
                    case 5:
                        return "200";
                    case 6:
                        return "300";
                    case 7:
                        return "400";
                    case 8:
                        return "500";
                    case 9:
                        return "600";
                    case 10:
                        return "700";
                    case 11:
                        return "800";
                    case 12:
                        return "900";
                    case 13:
                        return "inherit";
                    case 14:
                        return null;
                }
                throw "Unexpected FontWeight";
            };

            TextBlock.ParseFontVariant = function (v) {
                if (v == null)
                    return 3 /* NotSet */;
                switch (v.toLowerCase()) {
                    case "normal":
                        return 0 /* Normal */;
                    case "small-caps":
                        return 1 /* SmallCaps */;
                }
            };

            TextBlock.FontVariantString = function (value) {
                switch (value) {
                    case 0:
                        return "normal";
                    case 1:
                        return "small-caps";
                    case 2:
                        return null;
                }
            };
            return TextBlock;
        })(Visual);
        SVG.TextBlock = TextBlock;

        /**
        * The values the FontWeight accepts.
        */
        (function (FontWeights) {
            FontWeights[FontWeights["Normal"] = 0] = "Normal";
            FontWeights[FontWeights["Bold"] = 1] = "Bold";
            FontWeights[FontWeights["Bolder"] = 2] = "Bolder";
            FontWeights[FontWeights["Lighter"] = 3] = "Lighter";
            FontWeights[FontWeights["W100"] = 4] = "W100";
            FontWeights[FontWeights["W200"] = 5] = "W200";
            FontWeights[FontWeights["W300"] = 6] = "W300";
            FontWeights[FontWeights["W400"] = 7] = "W400";
            FontWeights[FontWeights["W500"] = 8] = "W500";
            FontWeights[FontWeights["W600"] = 9] = "W600";
            FontWeights[FontWeights["W700"] = 10] = "W700";
            FontWeights[FontWeights["W800"] = 11] = "W800";
            FontWeights[FontWeights["W900"] = 12] = "W900";
            FontWeights[FontWeights["Inherit"] = 13] = "Inherit";
            FontWeights[FontWeights["NotSet"] = 14] = "NotSet";
        })(SVG.FontWeights || (SVG.FontWeights = {}));
        var FontWeights = SVG.FontWeights;

        /**
        * The FontVariant values.
        */
        (function (FontVariants) {
            FontVariants[FontVariants["Normal"] = 0] = "Normal";
            FontVariants[FontVariants["SmallCaps"] = 1] = "SmallCaps";
            FontVariants[FontVariants["Inherit"] = 2] = "Inherit";
            FontVariants[FontVariants["NotSet"] = 3] = "NotSet";
        })(SVG.FontVariants || (SVG.FontVariants = {}));
        var FontVariants = SVG.FontVariants;

        /**
        * A rectangle visual.
        */
        var Rectangle = (function (_super) {
            __extends(Rectangle, _super);
            /**
            * Instantiates a new rectangle.
            */
            function Rectangle(position) {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "rect");
                this.Width = 15;
                this.Height = 15;
                this.Background = "Silver";
                if (position)
                    this.Position = position;
                this.Initialize();
            }
            Object.defineProperty(Rectangle.prototype, "Width", {
                /* Gets the width of this rectangle.*/
                get: function () {
                    return this.Native.width.baseVal.value;
                },
                /* Sets the width of this rectangle.*/
                set: function (value) {
                    this.Native.width.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Height", {
                /* Gets the height of this rectangle.*/
                get: function () {
                    return this.Native.height.baseVal.value;
                },
                /* Sets the height of this rectangle.*/
                set: function (value) {
                    this.Native.height.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Native", {
                /* Gets the nativeElement SVG element which this visual wraps.*/
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Background", {
                /**
                * Gets the fill of this rectangle.
                */
                get: function () {
                    return this.Native.style.fill;
                },
                /**
                * Sets the fill of this rectangle.
                */
                set: function (v) {
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "CornerRadius", {
                /**
                * Gets the corner radius of this rectangle.
                */
                get: function () {
                    return this.Native.rx.baseVal.value;
                },
                /**
                * Sets the corner radius of this rectangle.
                */
                set: function (v) {
                    this.Native.rx.baseVal.value = v;
                    this.Native.ry.baseVal.value = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Position", {
                /* Gets the position of this rectangle.*/
                get: function () {
                    return new TypeViz.Point(this.Native.x.baseVal.value, this.Native.y.baseVal.value);
                },
                /* Sets the position of this rectangle.*/
                set: function (p) {
                    this.Native.x.baseVal.value = p.X;
                    this.Native.y.baseVal.value = p.Y;
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Rectangle.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", this.getColorString(value));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });
            return Rectangle;
        })(Visual);
        SVG.Rectangle = Rectangle;

        /**
        * The Path class allows you to define a path by means of points and interpolators.
        This class is the simple wrapper around the SVG Path element.
        */
        var PathBase = (function (_super) {
            __extends(PathBase, _super);
            /**
            * Instantiates a new path.
            */
            function PathBase() {
                _super.call(this);
                this.xf = 1;
                this.yf = 1;
                this.nativeElement = document.createElementNS(SVG.NS, "path");
                this.Initialize();
                this.Background = "Black";
                this.Stroke = "Black";
                this.position = new TypeViz.Point(0, 0);
            }
            Object.defineProperty(PathBase.prototype, "MarkerEnd", {
                get: function () {
                    if (this.Native.attributes["marker-end"] == null) {
                        return null;
                    }
                    var ss = this.Native.attributes["marker-end"].value.toString();
                    var id = ss.substr(5, ss.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++) {
                        if (markers[i].Id == id)
                            return markers[i];
                    }
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-end", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "MarkerStart", {
                get: function () {
                    if (this.Native.attributes["marker-start"] == null)
                        return null;
                    var s = this.Native.attributes["marker-start"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-start", s);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(PathBase.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", this.getColorString(value));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(PathBase.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Position", {
                /**
                * Gets the position of this group.
                */
                get: function () {
                    return this.position;
                },
                /**
                * Sets the position of this group.
                */
                set: function (p) {
                    if (p == null)
                        return;
                    this.position = p;
                    try  {
                        if (this.nativeElement.ownerSVGElement == null)
                            throw "Add the Path first to a parent element before positioning.";
                    } catch (err) {
                        return;
                    }

                    var tr = this.Native.ownerSVGElement.createSVGTransform();
                    tr.setTranslate(p.X, p.Y);
                    if (this.Native.transform.baseVal.numberOfItems == 0)
                        this.Native.transform.baseVal.appendItem(tr);
                    else
                        this.Native.transform.baseVal.replaceItem(tr, 0);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Data", {
                get: function () {
                    if (this.Native.attributes["d"] == null)
                        return null;

                    return this.Native.attributes["d"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("d", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Background", {
                /**
                * Gets the fill of this rectangle.
                */
                get: function () {
                    return this.Native.style.fill;
                },
                /**
                * Sets the fill of this rectangle.
                */
                set: function (v) {
                    /*if (typeof (v) == "string") this.Native.style.fill = v;
                    if (typeof (v) == "object") {
                    var gr = <Media.LinearGradient><Object>v;
                    if (gr != null) {
                    if (gr.Id == null) throw "The gradient needs an Id.";
                    this.Native.style.fill = "url(#" + gr.Id + ")";
                    }
                    }*/
                    this.Native.style.fill = this.getColorString(v);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Width", {
                /**
                * Gets the width of this rectangle.
                */
                get: function () {
                    try  {
                        return this.Native.getBBox().width;
                    } catch (err) {
                        return 0;
                    }
                },
                /**
                * Sets the width of this rectangle.
                */
                set: function (value) {
                    if (this.Width == 0) {
                        //means most probably that the path is not yet added to the canvas.
                        //console.log("Warning: current path bounding box is nil, assuming that the path's geometry is scaled at 100x100.");
                        this.xf = value / 100;
                    } else
                        this.xf = value / this.Width;
                    this.Native.setAttribute("transform", "scale(" + this.xf + "," + this.yf + ")");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(PathBase.prototype, "Height", {
                /**
                * Gets the height of this rectangle.
                */
                get: function () {
                    try  {
                        return this.Native.getBBox().height;
                    } catch (err) {
                        return 0;
                    }
                },
                /**
                * Sets the height of this rectangle.
                */
                set: function (value) {
                    if (this.Height == 0) {
                        //means most probably that the path is not yet added to the canvas.
                        console.log("Warning: current path bounding box is nil, assuming that the path's geometry is scaled at 100x100.");
                        this.yf = value / 100;
                    } else
                        this.yf = value / this.Height;
                    this.Native.setAttribute("transform", "scale(" + this.xf + "," + this.yf + ")");
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Attempts to convert the given Node to a PathBase.
            * @param A Node.
            */
            PathBase.ParseNode = function (node) {
                if (node == null)
                    return null;
                if (node.localName != "path")
                    return null;
                var path = new PathBase();
                path.Data = node.attributes["d"] == null ? null : node.attributes["d"].value;
                path.StrokeThickness = node.attributes["stroke-width"] == null ? 0 : parseFloat(node.attributes["stroke-width"].value);
                path.Stroke = node.attributes["stroke"] == null ? null : node.attributes["stroke"].value;
                path.Background = node.attributes["fill"] == null ? null : node.attributes["fill"].value;
                return path;
            };
            return PathBase;
        })(LineBase);
        SVG.PathBase = PathBase;

        /**
        *  A path defined by means of points and an interpolator.
        */
        var Path = (function (_super) {
            __extends(Path, _super);
            function Path() {
                _super.call(this);
                this.interpolator = Interpolate();
                this.Background = "none";
                this.points = [];
            }
            Object.defineProperty(Path.prototype, "Interpolator", {
                get: function () {
                    return this.interpolator;
                },
                set: function (value) {
                    this.interpolator = value;
                    if (this.points != null && this.points.length > 0) {
                        this.refreshData();
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Path.prototype, "Opacity", {
                /**
                * Gets the opacity.
                */
                get: function () {
                    if (this.Native.attributes["stroke-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["stroke-opacity"].value);
                },
                /**
                * Sets the opacity.
                */
                set: function (value) {
                    if (value < 0 || value > 1.0)
                        throw "The opacity should be in the [0,1] interval.";
                    this.Native.setAttribute("stroke-opacity", value.toString());
                    this.Native.setAttribute("opacity", value.toString());
                },
                enumerable: true,
                configurable: true
            });

            Path.prototype.AddPoint = function (p) {
                this.points.push(p);
                this.refreshData();
            };

            Object.defineProperty(Path.prototype, "Points", {
                get: function () {
                    return this.points.Reverse();
                    // return (<Array<TypeViz.Point>><Object>TypeViz.Point.FromArray(this.points)).Reverse();
                },
                set: function (value) {
                    if (value == null || value.length == 0) {
                        this.Data = "";
                        return;
                    }

                    /*  if (value[0] instanceof TypeViz.Point)
                    this.points = TypeViz.Point.ToArray(value).Reverse();
                    else*/
                    this.points = value.Reverse();
                    this.refreshData();
                },
                enumerable: true,
                configurable: true
            });


            Path.prototype.refreshData = function () {
                this.Data = this.Interpolator(TypeViz.Point.ToArray(this.points));
            };

            Path.prototype.Grow = function (points, complete) {
                if (points == null || points.length == 0)
                    return;
                if (points.length == 1)
                    this.Points = points;

                var states = [];
                states.push([].Initialize(points[0], points.length));
                for (var i = 1; i < points.length; i++) {
                    var state = [];
                    for (var j = 0; j < points.length; j++) {
                        if (j >= i)
                            state[j] = points[i];
                        else
                            state[j] = states[i - 1][j];
                    }
                    states.push(state);
                }
                this.Points = states[0];
                var anim;

                for (var k = 1; k < states.length; k++) {
                    if (k == 1)
                        anim = this.Change({ Data: states[k] }, complete ? function () {
                            complete(states[1][1], 1);
                        } : null);
                    else {
                        var s = states[k];
                        anim = anim.Change({ Data: s }, complete ? (function (m) {
                            return function () {
                                complete(points[m], m);
                            };
                        })(k) : null);
                    }
                }
                if (TypeViz.IsDefined(complete))
                    complete(points[0], 0); // starting point
                anim.Play();
            };
            return Path;
        })(PathBase);
        SVG.Path = Path;

        /**
        * A marker
        */
        var Marker = (function (_super) {
            __extends(Marker, _super);
            /**
            * Instantiates a new marker.
            */
            function Marker() {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "marker");
                this.Initialize();
            }
            Object.defineProperty(Marker.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "RefX", {
                /**
                * Gets the refX of this marker.
                */
                get: function () {
                    if (this.nativeElement.attributes["refX"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["refX"].value);
                },
                /**
                * Sets the refX of this marker.
                */
                set: function (value) {
                    this.Native.refX.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "RefY", {
                /**
                * Gets the refY of this marker.
                */
                get: function () {
                    if (this.nativeElement.attributes["refY"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["refY"].value);
                },
                /**
                * Sets the refX of this marker.
                */
                set: function (value) {
                    this.Native.refY.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Ref", {
                /**
                * Gets the refX and refY of this marker.
                */
                get: function () {
                    return new Point(this.RefX, this.RefY);
                },
                /**
                * Sets the refX and refY of this marker.
                */
                set: function (value) {
                    this.RefX = value.X;
                    this.RefY = value.Y;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "MarkerWidth", {
                /**
                * Gets the width of this marker.
                */
                get: function () {
                    if (this.nativeElement.attributes["markerWidth"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["markerWidth"].value);
                },
                /**
                * Sets the width of this marker.
                */
                set: function (value) {
                    this.Native.markerWidth.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "MarkerHeight", {
                /**
                * Gets the height of this marker.
                */
                get: function () {
                    if (this.nativeElement.attributes["markerHeight"] == null)
                        return 0;
                    return parseFloat(this.nativeElement.attributes["markerHeight"].value);
                },
                /**
                * Sets the height of this marker.
                */
                set: function (value) {
                    this.Native.markerHeight.baseVal.value = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Size", {
                /**
                * Gets the size of this marker.
                */
                get: function () {
                    return new TypeViz.Size(this.MarkerWidth, this.MarkerHeight);
                },
                /**
                * Sets the size of this marker.
                */
                set: function (value) {
                    this.MarkerWidth = value.Width;
                    this.MarkerHeight = value.Height;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "ViewBox", {
                /**
                * Gets the size of this marker.
                */
                get: function () {
                    if (this.Native.viewBox == null)
                        return Rect.Empty;
                    return new Rect(this.Native.viewBox.baseVal.x, this.Native.viewBox.baseVal.y, this.Native.viewBox.baseVal.width, this.Native.viewBox.baseVal.height);
                },
                /**
                * Sets the size of this marker.
                */
                set: function (value) {
                    if (this.Native.viewBox.baseVal == null)
                        return;
                    this.Native.viewBox.baseVal.height = value.Height;
                    this.Native.viewBox.baseVal.width = value.Width;
                    this.Native.viewBox.baseVal.x = value.X;
                    this.Native.viewBox.baseVal.y = value.Y;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Orientation", {
                get: function () {
                    if (this.Native.orientType == null)
                        return 2 /* NotSet */;
                    return Marker.ParseOrientation(this.Native.orientType.baseVal.toString());
                },
                set: function (value) {
                    if (value == 2 /* NotSet */)
                        return;
                    var s = Marker.OrientationString(value);
                    if (s != null)
                        this.Native.setAttribute("orient", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Path", {
                get: function () {
                    return this.path;
                },
                set: function (value) {
                    if (value == this.path)
                        return;
                    this.path = value;
                    if (this.nativeElement.firstChild != null)
                        this.Native.removeChild(this.nativeElement.firstChild);
                    this.Native.appendChild(value.Native);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "MarkerUnits", {
                get: function () {
                    if (this.Native.orientType == null)
                        return 2 /* NotSet */;
                    return Marker.ParseMarkerUnits(this.Native.orientType.baseVal.toString());
                },
                set: function (value) {
                    if (value == 2 /* NotSet */)
                        return;
                    var s = Marker.MarkerUnitsString(value);
                    if (s != null)
                        this.Native.setAttribute("markerUnits", s);
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Parses the orientation attribute.
            * @param v The value of the 'orient' attribute.
            */
            Marker.ParseOrientation = function (v) {
                if (v == null)
                    return 2 /* NotSet */;
                if (v.toLowerCase() == "auto")
                    return 0 /* Auto */;
                if (v.toLowerCase() == "angle")
                    return 1 /* Angle */;
                throw "Unexpected value '" + v + "' cannot be converted to a MarkerOrientation.";
            };

            /**
            * Returns a string representation of the given MarkerOrientation.
            * @param value A MarkerOrientation member.
            */
            Marker.OrientationString = function (value) {
                switch (value) {
                    case 0:
                        return "auto";
                    case 1:
                        return "angle";
                    case 2:
                        return null;
                }
                throw "Unexpected MarkerOrientation value '" + value + "'.";
            };

            /**
            * Attempts to convert the given string to a MarkerUnits.
            * @param v A string to convert.
            */
            Marker.ParseMarkerUnits = function (v) {
                if (v == null)
                    return 2 /* NotSet */;
                if (v.toLowerCase() == "strokewidth")
                    return 0 /* StrokeWidth */;
                if (v.toLowerCase() == "userspaceonuse")
                    return 1 /* UserSpaceOnUse */;
                throw "Unexpected MarkerUnits value '" + v + "'.";
            };

            Marker.MarkerUnitsString = function (value) {
                switch (value) {
                    case 0:
                        return "strokewidth";
                    case 1:
                        return "userspaceonuse";
                    case 2:
                        return null;
                }
                throw "Unexpected MarkerUnits value '" + value + "'.";
            };


            Object.defineProperty(Marker.prototype, "Stroke", {
                /**
                * Gets the stroke color of the underlying path.
                */
                get: function () {
                    if (this.Path == null)
                        return null;
                    return this.Path.Stroke;
                },
                /**
                * Sets the stroke color of the underlying path.
                */
                set: function (value) {
                    if (this.Path != null)
                        this.Path.Stroke = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Marker.prototype, "Color", {
                /**
                * Sets the fill and stroke color of the underlying path in one go.
                * You can set the values separately by accessing the PathBase property of this marker if needed.
                */
                set: function (value) {
                    if (this.Path != null) {
                        this.Path.Background = value;
                        this.Path.Stroke = value;
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Marker.prototype, "Background", {
                get: function () {
                    if (this.Path == null)
                        return null;
                    return this.Path.Background;
                },
                /**
                * Sets the fill color of the underlying path.
                */
                set: function (value) {
                    if (value == null)
                        value = "none";
                    if (this.Path != null)
                        this.Path.Background = value;
                },
                enumerable: true,
                configurable: true
            });
            return Marker;
        })(Visual);
        SVG.Marker = Marker;

        /**
        * The possible marker orientation values.
        */
        (function (MarkerOrientation) {
            MarkerOrientation[MarkerOrientation["Auto"] = 0] = "Auto";
            MarkerOrientation[MarkerOrientation["Angle"] = 1] = "Angle";
            MarkerOrientation[MarkerOrientation["NotSet"] = 2] = "NotSet";
        })(SVG.MarkerOrientation || (SVG.MarkerOrientation = {}));
        var MarkerOrientation = SVG.MarkerOrientation;

        /**
        * The possible marker unit values.
        */
        (function (MarkerUnits) {
            MarkerUnits[MarkerUnits["StrokeWidth"] = 0] = "StrokeWidth";
            MarkerUnits[MarkerUnits["UserSpaceOnUse"] = 1] = "UserSpaceOnUse";
            MarkerUnits[MarkerUnits["NotSet"] = 2] = "NotSet";
        })(SVG.MarkerUnits || (SVG.MarkerUnits = {}));
        var MarkerUnits = SVG.MarkerUnits;

        /**
        * A polyline visual.
        */
        var Polyline = (function (_super) {
            __extends(Polyline, _super);
            /**
            * Instantiates a new Line.
            */
            function Polyline(points) {
                if (typeof points === "undefined") { points = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "polyline");
                this.Initialize();
                this.Initialize();
                if (points != null)
                    this.Points = points;
                else
                    this.points = [];
                this.Stroke = "Black";
                this.StrokeThickness = 2;
                this.Background = "none";
            }
            Object.defineProperty(Polyline.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Background", {
                /**
                * Gets the fill of the polyline.
                */
                get: function () {
                    return this.Native.style.fill;
                },
                /**
                * Sets the fill of the polyline.
                */
                set: function (v) {
                    if (typeof (v) == "string")
                        this.Native.style.fill = v;
                    if (typeof (v) == "object") {
                        var gr = v;
                        if (gr != null) {
                            if (gr.Id == null)
                                throw "The gradient needs an Id.";
                            this.Native.style.fill = "url(#" + gr.Id + ")";
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Points", {
                /**
                * Gets the points of the polyline.
                */
                get: function () {
                    return this.points;
                },
                /**
                * Sets the points of the polyline.
                */
                set: function (value) {
                    if (this.points != value) {
                        if (value == null || value.length == 0)
                            this.Native.setAttribute("points", null);
                        else {
                            var s = "";
                            for (var i = 0; i < value.length; i++)
                                s += " " + value[i].X + "," + value[i].Y;
                            s = s.trim();
                            this.Native.setAttribute("points", s);
                        }
                        this.points = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Opacity", {
                /**
                * Gets the opacity.
                */
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                /**
                * Sets the opacity.
                */
                set: function (value) {
                    if (value < 0 || value > 1.0)
                        throw "The opacity should be in the [0,1] interval.";
                    this.Native.setAttribute("fill-opacity", value.toString());
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(Polyline.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "Stroke", {
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "StrokeDash", {
                get: function () {
                    if (this.Native.attributes["stroke-dasharray"] == null)
                        return null;
                    return this.Native.attributes["stroke-dasharray"].value;
                },
                set: function (value) {
                    this.Native.setAttribute("stroke-dasharray", value);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "MarkerEnd", {
                get: function () {
                    if (this.Native.attributes["marker-end"] == null)
                        return null;
                    var s = this.Native.attributes["marker-end"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-end", s);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Polyline.prototype, "MarkerStart", {
                get: function () {
                    if (this.Native.attributes["marker-start"] == null)
                        return null;
                    var s = this.Native.attributes["marker-start"].value.toString();
                    var id = s.substr(5, s.length - 6);
                    var markers = this.Canvas.Markers;
                    for (var i = 0; i < markers.length; i++)
                        if (markers[i].Id == id)
                            return markers[i];
                    throw "Marker '" + id + "' could not be found in the <defs> collection.";
                },
                set: function (value) {
                    if (value.Id == null)
                        throw "The Marker needs an Id.";
                    var s = "url(#" + value.Id + ")";
                    this.Native.setAttribute("marker-start", s);
                },
                enumerable: true,
                configurable: true
            });
            return Polyline;
        })(LineBase);
        SVG.Polyline = Polyline;

        /**
        * A group visual.
        */
        var Group = (function (_super) {
            __extends(Group, _super);
            /**
            * Instantiates a new group.
            */
            function Group() {
                _super.call(this);
                this.children = [];
                this.nativeElement = document.createElementNS(SVG.NS, "g");
                this.Initialize();
                this.position = new TypeViz.Point(0, 0);
            }
            Group.prototype.Contains = function (visual) {
                return this.Children.Contains(visual);
            };

            /*Fades in the given visual. It will be appended if not already part of this canvas.*/
            Group.prototype.FadeIn = function (visual, duration, complete) {
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeIn cannot proceed, the given visual is null.";
                visual.Opacity = 0;
                if (!this.Contains(visual)) {
                    this.Append(visual);
                }
                visual.Change({ Opacity: 1, Duration: duration }, complete).Play();
            };
            Group.prototype.FadeOut = function (visual, remove, duration, complete) {
                if (typeof remove === "undefined") { remove = true; }
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeOut cannot proceed, the given visual is null.";
                var c = this;
                visual.Change({ Opacity: 0, Duration: duration }, function () {
                    if (remove) {
                        c.Remove(visual);
                    }
                    if (TypeViz.IsDefined(complete)) {
                        complete(visual);
                    }
                });
            };
            Object.defineProperty(Group.prototype, "Children", {
                get: function () {
                    return this.children;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Group.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Group.prototype, "Position", {
                /**
                * Gets the position of this group.
                */
                get: function () {
                    return this.position;
                },
                /**
                * Sets the position of this group.
                */
                set: function (p) {
                    this.position = p;
                    try  {
                        if (this.nativeElement.ownerSVGElement == null) {
                            this.Native.setAttribute("transform", "translate(" + p.X + "," + p.Y + ")");
                            return;
                        }
                    } catch (err) {
                        return;
                    }
                    var tr = this.Native.ownerSVGElement.createSVGTransform();
                    tr.setTranslate(p.X, p.Y);
                    if (this.Native.transform.baseVal.numberOfItems == 0)
                        this.Native.transform.baseVal.appendItem(tr);
                    else
                        this.Native.transform.baseVal.replaceItem(tr, 0);
                },
                enumerable: true,
                configurable: true
            });


            /* Appends a visual to this group.*/
            Group.prototype.Append = function (visual) {
                this.Native.appendChild(visual.Native);
                visual.Canvas = this.Canvas;
                if (visual["OnAppendToCanvas"])
                    visual["OnAppendToCanvas"](this.Canvas);
                visual.ParentLayer = this;
                this.children.push(visual);
            };

            /*Pushes the visual in the first position.*/
            Group.prototype.Prepend = function (visual) {
                if (this.children.length > 0) {
                    this.Native.insertBefore(visual.Native, this.children[0].Native);
                    visual.Canvas = this.Canvas;
                    if (visual["OnAppendToCanvas"])
                        visual["OnAppendToCanvas"](this.Canvas);
                    visual.ParentLayer = this;
                    this.children.push(visual);
                } else {
                    this.Append(visual);
                }
            };
            Group.prototype.Remove = function (visual) {
                this.Native.removeChild(visual.Native);
                if (visual["OnDetachFromCanvas"] != null)
                    visual["OnDetachFromCanvas"](this.Canvas);
                visual.ParentLayer = null;
                visual.Canvas = null;
                this.children.Remove(visual);
            };

            /**
            * Clears the content of this group.
            */
            Group.prototype.Clear = function () {
                while (this.Native.childNodes.length > 0) {
                    this.Native.removeChild(this.Native.childNodes[0]);
                }
                while (this.children.length > 0) {
                    var child = this.children[0];
                    if (child["OnDetachFromCanvas"] != null)
                        child["OnDetachFromCanvas"](this.Canvas);
                    child.Canvas = null;
                    this.children.Remove(child);
                }
            };
            return Group;
        })(Visual);
        SVG.Group = Group;

        /**
        * The SVG matrix related to transformations.
        */
        var Matrix = (function () {
            function Matrix(a, b, c, d, e, f) {
                if (typeof a === "undefined") { a = null; }
                if (typeof b === "undefined") { b = null; }
                if (typeof c === "undefined") { c = null; }
                if (typeof d === "undefined") { d = null; }
                if (typeof e === "undefined") { e = null; }
                if (typeof f === "undefined") { f = null; }
                if (a != null)
                    this.a = a;
                if (b != null)
                    this.b = b;
                if (c != null)
                    this.c = c;
                if (d != null)
                    this.d = d;
                if (e != null)
                    this.e = e;
                if (f != null)
                    this.f = f;
            }
            Matrix.prototype.Plus = function (m) {
                this.a += m.a;
                this.b += m.b;
                this.c += m.c;
                this.d += m.d;
                this.e += m.e;
                this.f += m.f;
            };

            Matrix.prototype.Minus = function (m) {
                this.a -= m.a;
                this.b -= m.b;
                this.c -= m.c;
                this.d -= m.d;
                this.e -= m.e;
                this.f -= m.f;
            };

            Matrix.prototype.Times = function (m) {
                return Matrix.FromList([
                    this.a * m.a + this.c * m.b,
                    this.b * m.a + this.d * m.b,
                    this.a * m.c + this.c * m.d,
                    this.b * m.c + this.d * m.d,
                    this.a * m.e + this.c * m.f + this.e,
                    this.b * m.e + this.d * m.f + this.f
                ]);
            };

            Matrix.prototype.Apply = function (p) {
                return new Point(this.a * p.X + this.c * p.Y + this.e, this.b * p.X + this.d * p.Y + this.f);
            };

            Matrix.FromSVGMatrix = function (vm) {
                var m = new Matrix();
                m.a = vm.a;
                m.b = vm.b;
                m.c = vm.c;
                m.d = vm.d;
                m.e = vm.e;
                m.f = vm.f;
                return m;
            };

            Matrix.FromMatrixVector = function (v) {
                var m = new Matrix();
                m.a = v.a;
                m.b = v.b;
                m.c = v.c;
                m.d = v.d;
                m.e = v.e;
                m.f = v.f;
                return m;
            };

            Matrix.FromList = function (v) {
                if (v.length != 6)
                    throw "The given list should consist of six elements.";
                var m = new Matrix();
                m.a = v[0];
                m.b = v[1];
                m.c = v[2];
                m.d = v[3];
                m.e = v[4];
                m.f = v[5];
                return m;
            };

            Matrix.Translation = function (x, y) {
                var m = new Matrix();
                m.a = 1;
                m.b = 0;
                m.c = 0;
                m.d = 1;
                m.e = x;
                m.f = y;
                return m;
            };

            Object.defineProperty(Matrix, "Unit", {
                get: function () {
                    return Matrix.FromList([1, 0, 0, 1, 0, 0]);
                },
                enumerable: true,
                configurable: true
            });

            Matrix.prototype.toString = function () {
                return "matrix(" + this.a + " " + this.b + " " + this.c + " " + this.d + " " + this.e + " " + this.f + ")";
            };

            /*
            * Returns the rotation matrix for the given angle.
            * @param angle The angle in radians.
            */
            Matrix.Rotation = function (angle, x, y) {
                if (typeof x === "undefined") { x = 0; }
                if (typeof y === "undefined") { y = 0; }
                var m = new Matrix();
                m.a = Math.cos(angle * Math.PI / 180);
                m.b = Math.sin(angle * Math.PI / 180);
                m.c = -m.b;
                m.d = m.a;
                m.e = x - x * m.a + y * m.b;
                m.f = y - y * m.a - x * m.b;
                return m;
            };

            /*
            * Returns the scaling matrix for the given factor.
            * @param factor The scaling factor.
            */
            Matrix.Scaling = function (scaleX, scaleY) {
                if (typeof scaleY === "undefined") { scaleY = null; }
                if (scaleY == null)
                    scaleY = scaleX;
                var m = new Matrix();
                m.a = scaleX;
                m.b = 0;
                m.c = 0;
                m.d = scaleY;
                m.e = 0;
                m.f = 0;
                return m;
            };

            Matrix.Parse = function (v) {
                if (v == null)
                    return null;
                v = v.trim();

                // of the form "matrix(...)"
                if (v.slice(0, 6).toLowerCase() == "matrix") {
                    var nums = v.slice(7, v.length - 1).trim();
                    var parts = nums.split(",");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                    parts = nums.split(" ");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                }

                // of the form "(...)"
                if (v.slice(0, 1) == "(" && v.slice(v.length - 1) == ")")
                    v = v.substr(1, v.length - 1);
                if (v.indexOf(",") > 0) {
                    var parts = v.split(",");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                }

                if (v.indexOf(" ") > 0) {
                    var parts = v.split(" ");
                    if (parts.length == 6)
                        return Matrix.FromList(parts.map(function (p) {
                            return parseFloat(p);
                        }));
                }
                return null;
            };
            return Matrix;
        })();
        SVG.Matrix = Matrix;

        /**
        * A vectorial representation of the SVG matrix transformations.
        */
        var MatrixVector = (function () {
            //constructor();
            function MatrixVector(a, b, c, d, e, f) {
                if (typeof a === "undefined") { a = null; }
                if (typeof b === "undefined") { b = null; }
                if (typeof c === "undefined") { c = null; }
                if (typeof d === "undefined") { d = null; }
                if (typeof e === "undefined") { e = null; }
                if (typeof f === "undefined") { f = null; }
                if (a != null)
                    this.a = a;
                if (b != null)
                    this.b = b;
                if (c != null)
                    this.c = c;
                if (d != null)
                    this.d = d;
                if (e != null)
                    this.e = e;
                if (f != null)
                    this.f = f;
            }
            /**
            * Returns a MatrixVector from the given Matrix values.
            * @param m A Matrix.
            */
            MatrixVector.FromMatrix = function (m) {
                var v = new MatrixVector();
                v.a = m.a;
                v.b = m.b;
                v.c = m.c;
                v.d = m.d;
                v.e = m.e;
                v.f = m.f;
                return v;
            };
            return MatrixVector;
        })();
        SVG.MatrixVector = MatrixVector;

        var EllipseBase = (function (_super) {
            __extends(EllipseBase, _super);
            function EllipseBase() {
                _super.apply(this, arguments);
            }
            Object.defineProperty(EllipseBase.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });



            Object.defineProperty(EllipseBase.prototype, "Stroke", {
                /**
                * Gets the stroke color of this circle.
                */
                get: function () {
                    if (this.Native.attributes["stroke"] == null)
                        return null;
                    return this.Native.attributes["stroke"].value;
                },
                /**
                * Sets the stroke of the visual.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("stroke", "none");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("stroke", this.getColorString(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("stroke", this.getColorString(value));
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(EllipseBase.prototype, "StrokeThickness", {
                get: function () {
                    if (this.Native.attributes["stroke-width"] == null)
                        return 0.0;
                    return parseFloat(this.Native.attributes["stroke-width"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("stroke-width", "0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("stroke-width", value.call(this, this.DataContext));
                        else
                            this.Native.setAttribute("stroke-width", value);
                    }
                },
                enumerable: true,
                configurable: true
            });

            return EllipseBase;
        })(Visual);
        SVG.EllipseBase = EllipseBase;

        var Ellipse = (function (_super) {
            __extends(Ellipse, _super);
            function Ellipse(position, width, height) {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "ellipse");
                if (width)
                    this.Width = width;
                else
                    this.Width = 15;

                if (height)
                    this.Height = height;
                else
                    this.Height = 15;

                if (position)
                    this.Position = position;
                this.Initialize();
            }
            Object.defineProperty(Ellipse.prototype, "Width", {
                get: function () {
                    return this.Native.rx.baseVal.value;
                },
                set: function (v) {
                    this.Native.rx.baseVal.value = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Height", {
                get: function () {
                    return this.Native.ry.baseVal.value;
                },
                set: function (v) {
                    this.Native.ry.baseVal.value = v;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Background", {
                /**
                * Gets the fill of the circle.
                */
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


            Object.defineProperty(Ellipse.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Ellipse.prototype, "Center", {
                /**
                * Gets the center of the circle.
                */
                get: function () {
                    return new TypeViz.Point(this.Native.cx.baseVal.value + this.Width, this.Native.cy.baseVal.value + this.Height);
                },
                /**
                * Sets the center of the circle.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = -this.Width;
                        this.Native.cy.baseVal.value = -this.Height;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X - this.Width;
                        this.Native.cy.baseVal.value = p.Y - this.Height;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Ellipse.prototype, "Position", {
                /**
                * Gets the position of the top-left of the circle.
                */
                get: function () {
                    return new TypeViz.Point(this.Center.X - this.Width, this.Center.Y - this.Height);
                },
                /**
                * Sets the position of the top-left of the circle.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = 0;
                        this.Native.cy.baseVal.value = 0;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X + this.Width;
                        this.Native.cy.baseVal.value = p.Y + this.Height;
                    }
                },
                enumerable: true,
                configurable: true
            });

            return Ellipse;
        })(EllipseBase);
        SVG.Ellipse = Ellipse;

        /**
        * A circle visual.
        */
        var Circle = (function (_super) {
            __extends(Circle, _super);
            /**
            * Instantiates a new circle.
            * @param (position) Optional. The position of the circle.
            * @param (radius) Optional. The radius of the circle.
            */
            function Circle(position, radius) {
                _super.call(this);
                this.nativeElement = document.createElementNS(SVG.NS, "circle");
                if (radius)
                    this.Radius = radius;
                else
                    this.Radius = 15;
                if (position)
                    this.Position = position;
                this.Initialize();
            }
            Object.defineProperty(Circle.prototype, "Background", {
                /**
                * Gets the fill of the circle.
                */
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

            Object.defineProperty(Circle.prototype, "Opacity", {
                get: function () {
                    if (this.Native.attributes["fill-opacity"] == null)
                        return 1.0;
                    return parseFloat(this.Native.attributes["fill-opacity"].value);
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.setAttribute("fill-opacity", "1.0");
                    } else {
                        if (typeof value === "function")
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                        else
                            this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Circle.prototype, "Radius", {
                /**
                * Gets the radius of the circle.
                */
                get: function () {
                    return this.Native.r.baseVal.value;
                },
                /**
                * Sets the radius of the circle.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.r.baseVal.value = 0;
                    } else {
                        if (typeof value === "function")
                            this.Native.r.baseVal.value = TypeViz.LimitValue(value.call(this, this.DataContext), 0, 1000);
                        else
                            this.Native.r.baseVal.value = TypeViz.LimitValue(value, 0, 1000);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Center", {
                /**
                * Gets the center of the circle.
                */
                get: function () {
                    return new TypeViz.Point(this.Native.cx.baseVal.value, this.Native.cy.baseVal.value);
                },
                /**
                * Sets the center of the circle.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = 0;
                        this.Native.cy.baseVal.value = 0;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X;
                        this.Native.cy.baseVal.value = p.Y;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Position", {
                /**
                * Gets the position of the top-left of the circle.
                */
                get: function () {
                    return new TypeViz.Point(this.Center.X - this.Radius, this.Center.Y - this.Radius);
                },
                /**
                * Sets the position of the top-left of the circle.
                */
                set: function (value) {
                    if (TypeViz.IsUndefined(value)) {
                        this.Native.cx.baseVal.value = 0;
                        this.Native.cy.baseVal.value = 0;
                    } else {
                        var p;
                        if (typeof value === "function") {
                            p = value.call(this, this.DataContext);
                            if (!p)
                                throw "The function did not return a Point.";
                        } else
                            p = value;

                        this.Native.cx.baseVal.value = p.X + this.Radius;
                        this.Native.cy.baseVal.value = p.Y + this.Radius;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Circle.prototype, "Height", {
                get: function () {
                    return 2 * this.Radius;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Circle.prototype, "Width", {
                get: function () {
                    return 2 * this.Radius;
                },
                enumerable: true,
                configurable: true
            });

            Circle.prototype.Drag = function (action) {
                var ctx = this;

                if (!this.Canvas)
                    throw "Add this visual first to the Canvas before calling this method.";
                this.Canvas.MouseDown(function (e) {
                    var r = new TypeViz.Rect(ctx.Position.X, ctx.Position.Y, 2 * ctx.Radius, 2 * ctx.Radius);
                    var p = new TypeViz.Point(e.clientX, e.clientY);
                    ctx.dragOffset = new TypeViz.Point(ctx.Position.X - e.clientX, ctx.Position.Y - e.clientY);
                    if (r.Contains(p)) {
                        ctx.Canvas.Native.setAttribute("cursor", 'move');
                        ctx.isDragging = true;
                    }
                });
                this.Canvas.MouseMove(function (e) {
                    if (!ctx.isDragging)
                        return;
                    ctx.Position = new TypeViz.Point(e.clientX + ctx.dragOffset.X, e.clientY + ctx.dragOffset.Y);
                    if (action)
                        action(ctx.Position, ctx);
                });
                this.Canvas.MouseUp(function (e) {
                    ctx.isDragging = false;
                    ctx.Canvas.Native.setAttribute("cursor", 'default');
                });
            };
            return Circle;
        })(EllipseBase);
        SVG.Circle = Circle;

        /**
        * Defines the options when instantiating a new SVG Canvas.
        */
        var CanvasOptions = (function () {
            function CanvasOptions() {
                this.Width = 1024;
                this.Height = 768;
                this.BackgroundColor = "Transparent";
            }
            return CanvasOptions;
        })();
        SVG.CanvasOptions = CanvasOptions;
        var FactoryEngine = (function () {
            function FactoryEngine(factory, dataContext, canvas) {
                this.factory = factory;
                this.dataContext = dataContext;
                this.single = !(this.factory instanceof Array);
                this.canvas = canvas;
                this.dataSets = [];
            }
            FactoryEngine.prototype.Run = function () {
                this.prepare();
                this.create();
                this.bind();
            };

            FactoryEngine.prototype.prepare = function () {
                if (this.single) {
                    this.factory = [this.factory];
                }
                for (var i = 0; i < this.factory.length; i++) {
                    this.access(i);
                }
            };

            FactoryEngine.prototype.create = function () {
                this.visuals = [];
                for (var k = 0; k < this.factory.length; k++) {
                    var factor = this.factory[k];
                    if (!factor.creator)
                        throw "No creator method found at index " + k + ".";
                    var series = this.dataSets[k];
                    if (!series)
                        throw "No data array found for factory at index " + k + ".";
                    var visualset = [];
                    for (var i = 0; i < series.length; i++) {
                        var item = series[i];
                        var visual = factor.creator.call(this, item, i, series);
                        if (!visual || !(visual instanceof Visual))
                            throw "No visual returned from creator at index " + i + ".";
                        this.canvas.Append(visual);
                        visualset.push(visual);
                    }
                    this.visuals.push(visualset);
                }
            };

            FactoryEngine.prototype.bind = function () {
                for (var k = 0; k < this.factory.length; k++) {
                    var factor = this.factory[k];
                    if (!factor.binders)
                        continue;
                    var visualset = this.visuals[k];
                    if (visualset.length == 0)
                        continue;

                    for (var i = 0; i < visualset.length; i++) {
                        var visual = visualset[i];
                        factor.binders.call(this.canvas, visual, i);
                    }
                }
            };

            FactoryEngine.prototype.access = function (index) {
                var factor = this.factory[index];
                if (!factor.accessor)
                    return;
                var data = factor.accessor(this.dataContext);
                if (!data)
                    throw "Accessor returned null dataset.";
                if (!(data instanceof Array))
                    throw "Accessor did not return an Array.";
                this.dataSets[index] = data;
            };
            return FactoryEngine;
        })();
        SVG.FactoryEngine = FactoryEngine;

        /**
        * Defines the root SVG surface inside which all visual things happen.
        */
        var Canvas = (function (_super) {
            __extends(Canvas, _super);
            function Canvas(host, options) {
                if (typeof options === "undefined") { options = new CanvasOptions(); }
                _super.call(this);
                this.markers = [];
                this.gradients = [];
                this.clipPaths = [];
                this.defsNode = document.createElementNS(SVG.NS, "defs");
                this.defsPresent = false;
                this.Visuals = [];
                this.nativeElement = document.createElementNS(SVG.NS, "svg");
                this.nativeElement.setAttributeNS(SVG.NS, 'xlink', SVG.XLINKNS);
                this.Initialize();
                this.HostElement = host;
                this.InsertSVGRootElement(options);
                this.Native.style.background = options.BackgroundColor;

                //this.ListenToEvents();
                this.Canvas = this;

                //this.HostElement.onkeydown = function (e: KeyboardEvent) { alert('there you go'); };
                //ensure tabindex so the the canvas receives key events
                this.HostElement.setAttribute("tabindex", "0");
                this.HostElement.focus();
            }
            Canvas.prototype.MousePosition = function (e) {
                //var isShiftPressed = e.shiftKey;
                var currentPosition = new TypeViz.Point(e.pageX, e.pageY);
                var node = this.HostElement;

                while (node != null) {
                    currentPosition.X -= node.offsetLeft;
                    currentPosition.Y -= node.offsetTop;
                    node = node.offsetParent;
                }
                return currentPosition;
                /*this.currentPosition.X /= this.Zoom;
                this.currentPosition.Y /= this.Zoom;*/
            };

            /**
            Defines a factory on the Canvas bound to the underlying DataContext.
            */
            Canvas.prototype.Define = function (factory) {
                if (!factory)
                    throw "No factory given";
                var engine = new FactoryEngine(factory, this.DataContext, this);
                engine.Run();
            };

            Object.defineProperty(Canvas.prototype, "DataContext", {
                get: function () {
                    return this.canvasDataContext;
                },
                set: function (value) {
                    this.canvasDataContext = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Canvas.prototype, "KeyPress", {
                /// defining this on the Visual level is somewhat problematic; SVG doesn't play well with the keyboard
                set: function (f) {
                    this.HostElement.addEventListener("keypress", f);
                    //this.HostElement.addEventListener("keypress", function (e: KeyboardEvent) { console.log("Pressed; " + e.charCode); });
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Canvas.prototype, "KeyDown", {
                set: function (f) {
                    this.HostElement.addEventListener("keydown", f);
                    //this.HostElement.addEventListener("keydown", function (e: KeyboardEvent) { console.log("Down; " + e.charCode); });
                },
                enumerable: true,
                configurable: true
            });

            Canvas.prototype.Focus = function () {
                this.HostElement.focus();
            };

            ///<summary>Inserts the actual SVG element in the HTML host.</summary>
            Canvas.prototype.InsertSVGRootElement = function (options) {
                this.HostElement.style.width = options.Width.toString();
                this.HostElement.style.height = options.Height.toString();
                this.Width = parseInt(options.Width.toString());
                this.Height = parseInt(options.Height.toString());
                this.Native.setAttribute("width", options.Width.toString());
                this.Native.setAttribute("height", options.Height.toString());
                this.Native.id = "SVGRoot";
                this.HostElement.appendChild(this.nativeElement);
            };

            Object.defineProperty(Canvas.prototype, "Width", {
                /**
                * Gets the width of this rectangle.
                */
                get: function () {
                    return this.Native.width.animVal.value;
                },
                /**
                * Sets the width of this rectangle.
                */
                set: function (value) {
                    this.Native.setAttribute("width", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Canvas.prototype, "Height", {
                /**
                * Gets the height of this rectangle.
                */
                get: function () {
                    return this.Native.height.baseVal.value;
                },
                /**
                * Sets the height of this rectangle.
                */
                set: function (value) {
                    this.Native.setAttribute("height", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Canvas.prototype, "Native", {
                /**
                * Gets the nativeElement SVG element which this visual wraps.
                */
                get: function () {
                    return this.nativeElement;
                },
                /**
                * Sets the nativeElement SVG element which this visual wraps.
                */
                set: function (value) {
                    this.nativeElement = value;
                },
                enumerable: true,
                configurable: true
            });


            /**
            * Appends the given visual to the canvas.
            Note that the Native property is used to do this.
            */
            Canvas.prototype.Append = function (shape) {
                this.Native.appendChild(shape.Native);
                shape.Canvas = this;
                if (shape["OnAppendToCanvas"] != null)
                    shape["OnAppendToCanvas"](this);
                this.Visuals.push(shape);

                // in case the shape position was assigned before the shape was appended to the canvas.
                if (shape.Position)
                    shape.Position = shape.Position;
                return this;
            };

            Canvas.prototype.Remove = function (visual) {
                if (this.Visuals.indexOf(visual) >= 0) {
                    this.Native.removeChild(visual.Native);
                    if (visual["OnAppendToCanvas"] != null)
                        visual["OnAppendToCanvas"](this);
                    visual.Canvas = null;
                    this.Visuals.Remove(visual);
                    return this;
                }
                return null;
            };

            Canvas.prototype.InsertBefore = function (visual, beforeVisual) {
                this.Native.insertBefore(visual.Native, beforeVisual.Native);
                visual.Canvas = this;
                this.Visuals.push(visual);
                return this;
            };

            Canvas.prototype.Prepend = function (visual) {
                this.Append(visual);
                this.SendToBack(visual);
            };

            Canvas.prototype.SendToBack = function (visual) {
                if (this.Visuals.indexOf(visual) < 0)
                    throw "The visual is not part of the canvas.";

                var element = visual.Native;
                if (element.previousSibling) {
                    element.parentNode.insertBefore(element, element.parentNode.firstChild);
                }
            };

            Canvas.prototype.SendToFront = function (visual) {
                if (!this.Visuals.Contains(visual))
                    throw "The visual is not part of the canvas.";
                var element = visual.Native;
                element.parentNode.appendChild(element);
            };

            Canvas.prototype.GetTransformedPoint = function (x, y) {
                var p = this.Native.createSVGPoint();
                p.x = x;
                p.y = y;
                return p.matrixTransform(this.Native.getScreenCTM().inverse());
            };

            Object.defineProperty(Canvas.prototype, "Markers", {
                /**
                * Returns the markers defined in this canvas.
                */
                get: function () {
                    return this.markers;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Canvas.prototype, "Gradients", {
                /**
                * Returns the gradients defined in this canvas.
                */
                get: function () {
                    return this.gradients;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Canvas.prototype, "ClipPaths", {
                /**
                * Returns the clip paths defined in this canvas.
                */
                get: function () {
                    return this.clipPaths;
                },
                enumerable: true,
                configurable: true
            });

            Canvas.prototype.ensureDefsNode = function () {
                if (this.defsPresent)
                    return;
                if (this.nativeElement.childNodes.length > 0)
                    this.Native.insertBefore(this.defsNode, this.Native.childNodes[0]);
                else
                    this.Native.appendChild(this.defsNode);
                this.defsPresent = true;
            };

            /* Adds a marker to the definitions. */
            Canvas.prototype.AddMarker = function (marker) {
                this.ensureDefsNode();
                this.defsNode.appendChild(marker.Native);
                this.markers.push(marker);
            };

            /**
            * Removes a marker from the definitions.
            */
            Canvas.prototype.RemoveMarker = function (marker) {
                if (marker == null)
                    throw "The given Marker is null";
                if (!this.markers.Contains(marker))
                    throw "The given Marker is not part of the Canvas";
                this.defsNode.removeChild(marker.Native);
                this.markers.Remove(marker);
            };

            /**
            * Removes a gradient from the definitions.
            */
            Canvas.prototype.RemoveGradient = function (gradient) {
                if (gradient == null)
                    throw "The given Gradient is null";
                if (!this.gradients.Contains(gradient))
                    throw "The given Gradient is not part of the Canvas";
                this.defsNode.removeChild(gradient.Native);
                this.gradients.Remove(gradient);
            };

            /**
            * Adds a gradient to the definitions.
            */
            Canvas.prototype.AddGradient = function (gradient) {
                this.ensureDefsNode();
                this.defsNode.appendChild(gradient.Native);
                this.gradients.push(gradient);
            };

            Canvas.prototype.AddClipPath = function (clipPath) {
                this.ensureDefsNode();
                this.defsNode.appendChild(clipPath.Native);
                this.clipPaths.push(clipPath);
            };

            Canvas.prototype.RemoveClipPath = function (clipPath) {
                this.ensureDefsNode();
                this.defsNode.removeChild(clipPath.Native);
                this.clipPaths.Remove(clipPath);
            };

            Canvas.prototype.ClearMarkers = function () {
                if (this.markers.length == 0)
                    return;

                for (var i = 0; i < this.markers.length; i++)
                    this.defsNode.removeChild(this.markers[i].Native);
                this.markers = [];
            };

            Canvas.prototype.ClearGradients = function () {
                if (this.gradients.length == 0)
                    return;
                for (var i = 0; i < this.gradients.length; i++)
                    this.defsNode.removeChild(this.gradients[i].Native);
                this.gradients = [];
            };

            /*Removes all the clip paths added to the canvas.*/
            Canvas.prototype.ClearClipPaths = function () {
                if (this.clipPaths.length == 0)
                    return;
                for (var i = 0; i < this.clipPaths.length; i++)
                    this.defsNode.removeChild(this.clipPaths[i].Native);
                this.clipPaths = [];
            };

            /*Removes all visuals, markers, clip paths... from this Canvas.*/
            Canvas.prototype.Clear = function () {
                this.ClearMarkers();
                this.ClearGradients();
                this.ClearClipPaths();
                while (this.Visuals.length > 0) {
                    this.Remove(this.Visuals[0]);
                }
            };

            /*Returns the child with the specified identifier.*/
            Canvas.prototype.GetId = function (id) {
                var first = Array.prototype.First;
                return first.call(this.Native.childNodes, function (c) {
                    return c.id == id;
                });
            };

            /*Returns whether the given element is part of this canvas.*/
            Canvas.prototype.Contains = function (visual) {
                return this.Visuals.Contains(visual);
            };

            /*Fades in the given visual. It will be appended if not already part of this canvas.*/
            Canvas.prototype.FadeIn = function (visual, duration, complete) {
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeIn cannot proceed, the given visual is null.";
                visual.Opacity = 0;
                if (!this.Contains(visual)) {
                    this.Append(visual);
                }
                visual.Change({ Opacity: 1, Duration: duration }, complete).Play();
            };
            Canvas.prototype.FadeOut = function (visual, remove, duration, complete) {
                if (typeof remove === "undefined") { remove = true; }
                if (typeof duration === "undefined") { duration = 1500; }
                if (TypeViz.IsUndefined(visual))
                    throw "FadeOut cannot proceed, the given visual is null.";
                var c = this;
                visual.Change({ Opacity: 0, Duration: duration }, function () {
                    if (remove) {
                        c.Remove(visual);
                    }
                    if (TypeViz.IsDefined(complete)) {
                        complete(visual);
                    }
                });
            };
            return Canvas;
        })(Visual);
        SVG.Canvas = Canvas;

        /**
        * A collection of predefined markers.
        */
        var Markers = (function () {
            function Markers() {
            }
            Object.defineProperty(Markers, "ArrowStart", {
                /**
                * Gets a standard (sharp) arrow head marker pointing to the left.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-30,-40l30,-40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Arrow" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "ArrowEnd", {
                /**
                * Gets a standard (sharp) arrow head marker pointing to the right.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m100,50l-100,40l30,-40l-30,-40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Arrow" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "FilledCircle", {
                /**
                * Gets a standard closed circle arrow head marker.
                */
                get: function () {
                    var marker = new Marker();
                    var circle = new SVG.Circle();
                    circle.Radius = 30;
                    circle.Center = new TypeViz.Point(50, 50);
                    circle.StrokeThickness = 10;
                    marker.Path = circle;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "FilledCircle" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "Circle", {
                /**
                * Gets a standard circle arrow head marker.
                */
                get: function () {
                    var marker = new Marker();
                    var circle = new SVG.Circle();
                    circle.Radius = 30;
                    circle.Center = new TypeViz.Point(50, 50);
                    circle.StrokeThickness = 10;
                    marker.Path = circle;
                    marker.Background = "none";
                    circle.Stroke = "Black";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Circle" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "OpenArrowStart", {
                /**
                * Gets an open start arrow marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-30,-40l30,-40l-100,40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.Background = "none";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "OpenArrowStart" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "OpenArrowEnd", {
                /**
                * Gets an open end arrow marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m100,50l-100,40l30,-40l-30,-40z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.Background = "none";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "OpenArrowEnd" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "FilledDiamond", {
                /**
                * Gets a filled diamond marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m20,20l0,60l60,0l0,-60l-60,0z";
                    path.Transform(new Rotation(45, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "FilledDiamond" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "Diamond", {
                /**
                * Gets a diamond marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m20,20l0,60l60,0l0,-60l-60,0z";
                    path.Transform(new Rotation(45, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.Background = "none";
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Diamond" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "WedgeStart", {
                /**
                * Gets a wedge start marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-94,-40l94,-40l-100,40z";

                    // path.Transform(new Rotation(45, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "WedgeStart" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "WedgeEnd", {
                /**
                * Gets a wedge end marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m0,50l100,40l-94,-40l94,-40l-100,40z";
                    path.Transform(new Rotation(180, 50, 50));
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "WedgeEnd" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Markers, "Square", {
                /**
                * Gets a square end marker.
                */
                get: function () {
                    var marker = new Marker();
                    var path = new PathBase();
                    path.Data = "m20,20l0,60l60,0l0,-60z";
                    path.StrokeThickness = 10;
                    marker.Path = path;
                    marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                    marker.Size = new TypeViz.Size(10, 10);
                    marker.Id = "Square" + TypeViz.RandomId();
                    marker.Ref = new TypeViz.Point(50, 50);
                    marker.Orientation = 0 /* Auto */;
                    marker.MarkerUnits = 0 /* StrokeWidth */;
                    return marker;
                },
                enumerable: true,
                configurable: true
            });
            return Markers;
        })();
        SVG.Markers = Markers;

        /**
        * The arc visual.
        */
        var Arc = (function (_super) {
            __extends(Arc, _super);
            function Arc() {
                _super.call(this);
                this.innerRadius = 30;
                this.outerRadius = 100;
                this.startAngle = 0;
                this.endAngle = Math.PI;
                this.center = new TypeViz.Point(0, 0);
                this.arcMax = 2 * Math.PI - 1e-6;
                this.arcOffset = -Math.PI / 2;
                this.updateData();
            }
            Object.defineProperty(Arc.prototype, "Center", {
                get: function () {
                    return this.center;
                },
                set: function (v) {
                    this.center = v;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "InnerRadius", {
                get: function () {
                    return this.innerRadius;
                },
                set: function (value) {
                    this.innerRadius = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "OuterRadius", {
                get: function () {
                    return this.outerRadius;
                },
                set: function (value) {
                    this.outerRadius = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "StartAngle", {
                get: function () {
                    return this.startAngle;
                },
                set: function (value) {
                    this.startAngle = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Arc.prototype, "EndAngle", {
                get: function () {
                    return this.endAngle;
                },
                set: function (value) {
                    this.endAngle = value;
                    this.updateData();
                },
                enumerable: true,
                configurable: true
            });


            Arc.prototype.updateData = function () {
                this.Position = this.Center; // due to the way the pathdata is constructed below
                var r0 = this.innerRadius, r1 = this.outerRadius, a0 = this.startAngle + this.arcOffset, a1 = this.endAngle + this.arcOffset, da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0), df = da < Math.PI ? "0" : "1", c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
                this.Data = da >= this.arcMax ? (r0 ? "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1) + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "M0," + r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + (-r0) + "A" + r0 + "," + r0 + " 0 1,0 0," + r0 + "Z" : "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1) + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "Z") : (r0 ? "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L" + r0 * c1 + "," + r0 * s1 + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0 + "Z" : "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L0,0" + "Z");
            };
            return Arc;
        })(PathBase);
        SVG.Arc = Arc;

        /**
        * Collects the path interpolators available.
        */
        (function (Interpolators) {
            /**
            * A linear interpolations between the given points.
            */
            function LinearInterpolator(points, options) {
                if (options != null && options.IsClosed)
                    return points.join("L") + "Z";
                else
                    return points.join("L");
            }
            Interpolators.LinearInterpolator = LinearInterpolator;

            /**
            * A step-rectangular interpolation.
            */
            function LineStepInterpolator(points, options) {
                var i = 0, n = points.length, p = points[0], path = [p[0], ",", p[1]];
                while (++i < n)
                    path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
                if (n > 1)
                    path.push("H", p[0]);
                return path.join("");
            }
            Interpolators.LineStepInterpolator = LineStepInterpolator;

            /**
            * A cordinal spline interpolation of the given points.
            */
            function CardinalInterpolator(points, options) {
                return points.length < 3 ? LinearInterpolator(points, null) : points[0] + HermiteSpline(points, CardinalTangents(points, options));
            }
            Interpolators.CardinalInterpolator = CardinalInterpolator;

            /**
            * A spline interpolation of the given points.
            */
            function SplineInterpolator(points, options) {
                if (points.length < 3)
                    return LinearInterpolator(points, null);
                var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [x0, x0, x0, (pi = points[1])[0]], py = [y0, y0, y0, pi[1]], path = [x0, ",", y0, "L", DotProduct(bezierVector3, px), ",", DotProduct(bezierVector3, py)];
                points.push(points[n - 1]);
                while (++i <= n) {
                    pi = points[i];
                    px.shift();
                    px.push(pi[0]);
                    py.shift();
                    py.push(pi[1]);
                    BezierBasis(path, px, py);
                }
                points.pop();
                path.push("L", pi);
                return path.join("");
            }
            Interpolators.SplineInterpolator = SplineInterpolator;

            function CardinalTangents(points, options) {
                var tangents = [], a = (1 - options.Tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
                while (++i < n) {
                    p0 = p1;
                    p1 = p2;
                    p2 = points[i];
                    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
                }
                return tangents;
            }
            ;

            function DotProduct(a, b) {
                return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
            }

            function BezierBasis(path, x, y) {
                path.push("C", DotProduct(bezierVector1, x), ",", DotProduct(bezierVector1, y), ",", DotProduct(bezierVector2, x), ",", DotProduct(bezierVector2, y), ",", DotProduct(bezierVector3, x), ",", DotProduct(bezierVector3, y));
            }

            function HermiteSpline(points, tangents) {
                if (tangents.length < 1 || (points.length != tangents.length && points.length != tangents.length + 2)) {
                    return LinearInterpolator(points, null);
                }
                var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;

                if (quad) {
                    path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
                    p0 = points[1];
                    pi = 2;
                }

                if (tangents.length > 1) {
                    t = tangents[1];
                    p = points[pi];
                    pi++;
                    path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
                    for (var i = 2; i < tangents.length; i++, pi++) {
                        p = points[pi];
                        t = tangents[i];
                        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
                    }
                }

                if (quad) {
                    var lp = points[pi];
                    path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
                }

                return path;
            }

            var bezierVector1 = [0, 2 / 3, 1 / 3, 0], bezierVector2 = [0, 1 / 3, 2 / 3, 0], bezierVector3 = [0, 1 / 6, 2 / 3, 1 / 6];
        })(SVG.Interpolators || (SVG.Interpolators = {}));
        var Interpolators = SVG.Interpolators;

        /**
        * The default interpolation options.
        */
        SVG.DefaultInterpolationOptions = {
            projection: TypeViz.Identity,
            xProjector: function (p) {
                return p[0];
            },
            yProjector: function (p) {
                return p[1];
            },
            IsClosed: false,
            Tension: 0.7,
            Interpolator: Interpolators.LinearInterpolator
        };

        /**
        * Note that this uses internally points represented as a tuple.
        */
        function Interpolate(options) {
            options = options == null ? SVG.DefaultInterpolationOptions : TypeViz.MergeOptions(SVG.DefaultInterpolationOptions, options);
            var x = options.xProjector, y = options.yProjector, projection = options.projection, defined = TypeViz.TrueFunction, interpolate = options.Interpolator;

            function line(data) {
                var segments = [], points = [], i = -1, n = data.length, d, fx = TypeViz.Functor(x), fy = TypeViz.Functor(y);

                function segment() {
                    segments.push("M", interpolate(projection(points), options));
                }

                while (++i < n) {
                    if (defined.call(this, d = data[i], i)) {
                        points.push([+fx.call(this, d, i), +fy.call(this, d, i)]);
                    } else if (points.length) {
                        segment();
                        points = [];
                    }
                }

                if (points.length)
                    segment();

                return segments.length ? segments.join("") : null;
            }

            return line;
        }
        SVG.Interpolate = Interpolate;

        /**
        * Cursors predefined in SVG.
        */
        (function (Cursors) {
            Cursors[Cursors["CrossHair"] = 0] = "CrossHair";
            Cursors[Cursors["Default"] = 1] = "Default";
            Cursors[Cursors["Pointer"] = 2] = "Pointer";
            Cursors[Cursors["Move"] = 3] = "Move";
            Cursors[Cursors["EastResize"] = 4] = "EastResize";
            Cursors[Cursors["NorthEastResize"] = 5] = "NorthEastResize";
            Cursors[Cursors["NorthWestResize"] = 6] = "NorthWestResize";
            Cursors[Cursors["NorthResize"] = 7] = "NorthResize";
            Cursors[Cursors["SouthEastResize"] = 8] = "SouthEastResize";
            Cursors[Cursors["SouthWestResize"] = 9] = "SouthWestResize";
            Cursors[Cursors["SouthResize"] = 10] = "SouthResize";
            Cursors[Cursors["WestResize"] = 11] = "WestResize";
            Cursors[Cursors["Text"] = 12] = "Text";
            Cursors[Cursors["Wait"] = 13] = "Wait";
            Cursors[Cursors["Help"] = 14] = "Help";
        })(SVG.Cursors || (SVG.Cursors = {}));
        var Cursors = SVG.Cursors;
    })(TypeViz.SVG || (TypeViz.SVG = {}));
    var SVG = TypeViz.SVG;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=SVG.js.map
