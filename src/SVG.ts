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
module TypeViz {

    import Point = TypeViz.Point;
    import Rect = TypeViz.Rect;

    /**
     * Defines a mouse handler delegate.
     */
    export interface MouseHandler {
        (e: MouseEvent): any;
    }

    /**
     * Holds the SVG primitives.
     */
    export module SVG {

        /**
         * The SVG namespace (http://www.w3.org/2000/svg).
         */
        export var NS = "http://www.w3.org/2000/svg";
        export var XLINKNS = "http://www.w3.org/1999/xlink";

        /**
         * Base class for all visuals participating in an SVG drawing.
         */
        export class Visual {
            private title: SVGTitleElement;
            nativeElement: SVGElement;
            private animator;
            private subscriptions;
            private dataContext;

            private mouseMoveHandlers: Array<MouseHandler> = [];
            private mouseUpHandlers: Array<MouseHandler> = [];
            private mouseOverHandlers: Array<MouseHandler> = [];
            private mouseOutHandlers: Array<MouseHandler> = [];
            private mouseDownHandlers: Array<MouseHandler> = [];
            private mouseClickHandlers: Array<MouseHandler> = [];
            private clip;

            /**
             * Sets the cursor on this visual.
             * @param value
             * @constructor
             */
            public set Cursor(value: Cursors) {
                (<SVGSVGElement> this.Native).style.cursor = this.toCursorString(value);
            }

            public get Cursor(): Cursors {
                var current = (<SVGSVGElement> this.Native).style.cursor;
                if (!current) return Cursors.Default;
                return this.toCursorEnum(current.toString());
            }

            private toCursorString(cursor): string {
                switch (cursor) {
                    case 0: case "CrossHair":
                        return "crosshair";
                    case 1: case "Default":
                        return "default";
                    case 2: case "Pointer":
                        return "pointer";
                    case 3: case "Move":
                        return "move";
                    case 4: case "EastResize":
                        return "e-resize";
                    case 5: case "NorthEastResize":
                        return "ne-resize";
                    case 6: case "NorthWestResize":
                        return "nw-resize";
                    case 7: case "NorthResize":
                        return "n-resize";
                    case 8: case "SouthEastResize":
                        return "se-resize";
                    case 9: case "SouthWestResize":
                        return "sw-resize";
                    case 10: case "SouthResize":
                        return "s-resize";
                    case 11: case "WestResize":
                        return "w-resize";
                    case 12: case "Text":
                        return "text";
                    case 13: case "Wait":
                        return "wait";
                    case 14: case "Help":
                        return "help";
                }

            }

            private toCursorEnum(cursor: string): Cursors {
                switch (cursor.toLowerCase()) {

                    case "crosshair":
                        return Cursors.CrossHair;
                    case "default":
                        return Cursors.Default;
                    case "e-resize":
                        return Cursors.EastResize;
                    case "help":
                        return Cursors.Help;
                    case "move":
                        return Cursors.Move;
                    case "ne-resize":
                        return Cursors.NorthEastResize;
                    case "n-resize":
                        return Cursors.NorthResize;
                    case "nw-resize":
                        return Cursors.NorthWestResize;
                    case "pointer":
                        return Cursors.Pointer;
                    case "se-resize":
                        return Cursors.SouthEastResize;
                    case "s-resize":
                        return Cursors.SouthResize;
                    case "sw-resize":
                        return Cursors.SouthWestResize;
                    case "text":
                        return Cursors.Text;
                    case "wait":
                        return Cursors.Wait;
                    case "w-resize":
                        return Cursors.WestResize;
                    default:
                        throw "Unsupported cursor type '" + cursor + "'.";
                }
                //return Cursors[cursor];
            }

            public ParentLayer: Group;

            /**
            Gets the clipping path.
            */
            public get Clip(): ClipPath {
                return this.clip;
            }

            /**
            Sets the clipping path.
            */
            public set Clip(value: ClipPath) {
                this.clip = value;
                if (value.Id == null) throw "The clip path needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("clip-path", s);
            }

            /**
            Gets the data context of this element.
            */
            public get DataContext() {
                return this.dataContext ? this.dataContext : (this.Canvas ? this.Canvas.DataContext : null);
            }

            /**
            Sets the data context of this element.
            */
            public set DataContext(value) {
                this.dataContext = value;
            }

            /**
            The given value-returning subscriber is subscribed to the DataContext and the value returned is assigned to the specified property.
            */
            public Bind(property: string, f) {
                if (!(property in this))
                    throw "Property '" + property + "' does not exist on this object.";
                if (!this.DataContext) throw "No DataContext to bind to. Define a DataContext on this object first or attach it to a Canvas with a DataContext.";
                if (!("Subscribe" in this.DataContext)) throw "Cannot bind the function; the DataContext does not have a 'Subscribe' method to subscribe to.";
                var visual = this;
                var subscription = function (model, subset) {
                    var returned = f.call(visual, model, subset);
                    if (returned) //allows for changes without setting a value, like transitions.
                        visual[property] = returned;
                };
                if (!this.subscriptions) this.subscriptions = new TypeViz.Map();
                this.subscriptions.Set(f, subscription);
                this.DataContext.Subscribe(subscription);
            }

            /**
            Unbinds the given subscriber from the property.
            */
            public Unbind(f) {
                if (!this.subscriptions || !this.subscriptions.Contains(f)) throw "The given function is not bound to this objects.";
                if (!this.DataContext) throw "No DataContext anymore; the function was bound to another DataContext.";
                var subscription = this.subscriptions.Get(f);
                if (!subscription) throw "Functions was found but the corresponding subscription is null.";
                this.DataContext.RemoveSubscriber(subscription);
                this.subscriptions.remove(f);
            }

            public Change(to, options?) {
                if (this.animator == null)
                    this.animator = new Animation.Animator([this]);
                // todo: check the looping, the Clear disables looping probably.
                this.animator.Clear();
                return this.animator.Change(to, options);
            }

            /**
             * Occurs when the mouse is moved over this visual.
             */
            public MouseMove(handler: MouseHandler) {
                if (handler == null) throw "Cannot add a null handler.";
                this.mouseMoveHandlers.push(handler);
            }

            /**
             * Removes the given handler from the MouseMove event handlers.
             */
            public RemoveMouseMoveHandler(handler: MouseHandler) {
                if (handler == null) throw "Cannot remove a null handler.";
                if (this.mouseMoveHandlers.Contains(handler)) this.mouseMoveHandlers.Remove(handler);
            }

            /**
             * Clears the handlers of the mouse move event.
             */
            public ClearMouseMoveHandlers() {
                this.mouseMoveHandlers.Clear();
            }

            /**
             * Occurs when the mouse is pressed over this visual.
             */
            public MouseDown(handler: MouseHandler) {
                if (handler == null) throw "Cannot add a null handler.";
                this.mouseDownHandlers.push(handler);
            }

            /**
             * Removes the given handler from the MouseDown event handlers.
             */
            public RemoveMouseDownHandler(handler: MouseHandler) {
                if (handler == null) throw "Cannot remove a null handler.";
                if (this.mouseDownHandlers.Contains(handler)) this.mouseDownHandlers.Remove(handler);
            }

            /**
             * Clears the handlers of the mouse down event.
             */
            public ClearMouseDownHandlers() {
                this.mouseDownHandlers.Clear();
            }

            /**
             * Occurs when the mouse is released over visual.
             */
            public MouseUp(handler: MouseHandler) {
                if (handler == null) throw "Cannot add a null handler.";
                this.mouseUpHandlers.push(handler);
            }

            /**
             * Removes the given handler from the MouseMove event handlers.
             */
            public RemoveMouseUpHandler(handler: MouseHandler) {
                if (handler == null) throw "Cannot remove a null handler.";
                if (this.mouseUpHandlers.Contains(handler)) this.mouseUpHandlers.Remove(handler);
            }

            /**
             * Clears the handlers of the mouse up event.
             */
            public ClearMouseUpHandlers() {
                this.mouseUpHandlers.Clear();
            }


            /**
             * Occurs when the mouse is over visual.
             */
            public MouseOver(handler: MouseHandler) {
                if (handler == null) throw "Cannot add a null handler.";
                this.mouseOverHandlers.push(handler);
            }

            /**
             * Removes the given handler from the MouseOver event handlers.
             */
            public RemoveMouseOverHandler(handler: MouseHandler) {
                if (handler == null) throw "Cannot remove a null handler.";
                if (this.mouseOverHandlers.Contains(handler)) this.mouseOverHandlers.Remove(handler);
            }

            /**
             * Clears the handlers of the mouse over event.
             */
            public ClearMouseOverHandlers() {
                this.mouseOverHandlers.Clear();
            }

            /**
             * Occurs when the mouse has left the visual.
             */
            public MouseOut(handler: MouseHandler) {
                if (handler == null) throw "Cannot add a null handler.";
                this.mouseOutHandlers.push(handler);
            }

            /**
             * Removes the given handler from the MouseOut event handlers.
             */
            public RemoveMouseOutHandler(handler: MouseHandler) {
                if (handler == null) throw "Cannot remove a null handler.";
                if (this.mouseOutHandlers.Contains(handler)) this.mouseOutHandlers.Remove(handler);
            }

            /**
             * Clears the handlers of the MouseOut event.
             */
            public ClearMouseOutHandlers() {
                this.mouseOutHandlers.Clear();
            }


            /**
             * Occurs when the mouse was clicked on the visual.
             */
            public MouseClick(handler: MouseHandler) {
                if (handler == null) throw "Cannot add a null handler.";
                this.mouseClickHandlers.push(handler);
            }

            /**
             * Removes the given handler from the MouseClick event handlers.
             */
            public RemoveMouseClickHandler(handler: MouseHandler) {
                if (handler == null) throw "Cannot remove a null handler.";
                if (this.mouseClickHandlers.Contains(handler)) this.mouseClickHandlers.Remove(handler);
            }

            /**
             * Clears the handlers of the MouseClick event.
             */
            public ClearMouseClickHandlers() {
                this.mouseClickHandlers.Clear();
            }

            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGElement {
                return this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGElement) {
                this.nativeElement = value;
            }

            /**
             * Gets the Canvas to which this visual belongs.
             */
            public Canvas: Canvas;

            /**
             * Gets or sets the position of this visual.
             */
            public Width: number;
            public Height: number;
            public StrokeThickness: any;

            public get Position(): any {
                return null;
            }

            public set Position(v: any) {
            }
            public Opacity: any;
            public Stroke: any;
            public Background: any;

            /**
             * Returns the identifier.
             */
            public get Id(): string {
                return this.Native == null ? null : this.Native.id;
            }

            /**
             * Sets the identifier.
             */
            public set Id(value: string) {
                this.Native.id = value;
            }

            /**
             * Sets the title of this visual.
             */
            public get Title(): string {
                return this.title.textContent;
            }

            /**
             * Gets the title of this visual.
             */
            public set Title(v: string) {
                if (this.title == null) {
                    this.title = <SVGTitleElement>document.createElementNS(NS, "title");
                    this.Native.appendChild(this.title);
                }

                this.title.textContent = v;
            }

            /**
             * Sets the CSS class of this visual.
             */
            public get Class(): string {
                if (this.Native.attributes["class"] == null) return null;
                return this.Native.attributes["class"].value;
            }

            /**
             * Gets the CSS class of this visual.
             */
            public set Class(v: string) {
                if (v == null) this.Native.removeAttribute("class");
                else this.Native.setAttribute("class", v);
            }

            /**
             * Instanstiates a new visual.
             */
            constructor() {
            }

            /**
             * Part of the inheritance chain, this assigns the SVG element defined by the inheriting class and the canvas to which this element belongs.
             * The 'super' has to be parameterless, hence the necessity of this Initializer.
             */
            Initialize() {
                this.nativeElement.id = RandomId();
                this.ListenToEvents();
            }

            /**
             * Rewires the nativeElement events to API events.
             */
            private ListenToEvents() {
                this.Native.onmousedown = e => this.onMouseDown(e);
                this.Native.onmousemove = e => this.onMouseMove(e);
                this.Native.onmouseup = e => this.onMouseUp(e);
                this.Native.onmouseover = e => this.onMouseOver(e);
                this.Native.onmouseout = e => this.onMouseOut(e);
            }

            /**
             * Detaches the event listeners from the nativeElement SVG element.
             */
            public StopListeningToEvents() {
                this.Native.onmousedown = null;
                this.Native.onmousemove = null;
                this.Native.onmouseup = null;
            }

            public get IsVisible(): boolean {
                if (this.Native.attributes["visibility"] == null) return true;
                return this.Native.attributes["visibility"].value == "visible";
            }

            public set IsVisible(value: boolean) {
                this.Native.setAttribute("visibility", (value ? "visible" : "hidden"));
            }


            private onMouseDown(e: MouseEvent) {
                if (this.mouseDownHandlers.length > 0) {
                    for (var i = 0; i < this.mouseDownHandlers.length; i++) {
                        this.mouseDownHandlers[i](e);
                    }
                }
            }

            private onMouseMove(e: MouseEvent) {
                if (this.mouseMoveHandlers.length > 0) {
                    for (var i = 0; i < this.mouseMoveHandlers.length; i++) {
                        this.mouseMoveHandlers[i](e);
                    }
                }
            }

            private onMouseUp(e: MouseEvent) {
                if (this.mouseUpHandlers.length > 0) {
                    for (var i = 0; i < this.mouseUpHandlers.length; i++) {
                        this.mouseUpHandlers[i](e);
                    }
                }
            }

            private onMouseOver(e: MouseEvent) {
                if (this.mouseOverHandlers.length > 0) {
                    for (var i = 0; i < this.mouseOverHandlers.length; i++) {
                        this.mouseOverHandlers[i](e);
                    }
                }
            }

            private onMouseOut(e: MouseEvent) {
                if (this.mouseOutHandlers.length > 0) {
                    for (var i = 0; i < this.mouseOutHandlers.length; i++) {
                        this.mouseOutHandlers[i](e);
                    }
                }
            }

            private onMouseClick(e: MouseEvent) {
                if (this.mouseClickHandlers.length > 0) {
                    for (var i = 0; i < this.mouseClickHandlers.length; i++) {
                        this.mouseClickHandlers[i](e);
                    }
                }
            }

            //private onKeyDown(e: KeyboardEvent) { if (this.KeyDown) this.KeyDown(e); }
            //private onKeyPress(e: KeyboardEvent) { if (this.KeyPress) this.KeyPress(e); }
            public PrePendTransform(transform: Transformation) {
                var current = this.Native.attributes["transform"] == null ? "" : <string>this.Native.attributes["transform"].value;
                this.Native.setAttribute("transform", transform.toString() + current);
            }

            public Transform(...transforms: Transformation[]) {
                if (transforms.length == 1 && transforms[0] == null) {
                    // reset
                    this.Native.removeAttribute("transform");
                    return;
                }
                var current = this.Native.attributes["transform"] == null ? "" : <string>this.Native.attributes["transform"].value;
                var s = current;
                for (var i = 0; i < transforms.length; i++) s += transforms[i];
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
                    for (var i = 0; i < transforms.length; i++) s += transforms[i].toString();
                    this.Native.setAttribute("transform", s.toString());
                }
                else {
                    var m = Matrix.Unit;
                    for (var i = 0; i < transforms.length; i++) m = m.Times(transforms[i].ToMatrix());
                    this.Native.setAttribute("transform", m.toString());
                }

            }

            /**
             * Gets the SVG color string from the given object; Color, RGB, HSL, string or Gradient.
             * If a Gradient has been supplied you need to call Canvas.AddGradient to add the gradient definition.
             */
            getColorString(color: any): string {
                if (IsString(color)) return <string>color;
                if (IsColor(color)) return (<Media.Color>color).AsHex6;
                if (color instanceof Media.RGB) return (<Media.RGB>color).AsHex6;
                if (color instanceof Media.HSL) return (<Media.HSL>color).AsHex6;
                if (IsLinearGradient(color)) {
                    var radialGradient = <Media.LinearGradient><Object>color;
                    if (radialGradient != null) {
                        if (radialGradient.Id == null) throw "The radialGradientadient needs an Id.";
                        //assuming that the AddradialGradientadient method has been called on the Canvas
                        return "url(#" + radialGradient.Id + ")";
                    }
                }

                if (IsRadialGradient(color)) {
                    var linearGradient = <Media.RadialGradient><Object>color;
                    if (linearGradient != null) {
                        if (linearGradient.Id == null) throw "The linearGradientadient needs an Id.";
                        //assuming that the AddlinearGradientadient method has been called on the Canvas
                        return "url(#" + linearGradient.Id + ")";
                    }
                }

                throw "Could not convert '" + color + "' to a color string.";
            }
        }

        /**
         * The SVG clipping path.
         * You need to add this ClipPath element to the Canvas using the AddClipPath method
         * and assign it to the Clip property of the Visual.
         */
        export class ClipPath {
            private nativeElement: SVGClipPathElement;
            private id;
            private position;
            private children: Array<Visual>;

            public get Id() {
                return this.id;
            }

            public set Id(value) {
                this.id = value;
                this.nativeElement.setAttribute("id", value);
            }

            constructor() {
                this.nativeElement = <SVGClipPathElement>document.createElementNS(NS, "clipPath");
                this.Id = TypeViz.RandomId();
                this.children = [];
                this.position = new TypeViz.Point(0, 0);
            }

            /**
             * Gets the position of this group.
             */
            get Position(): Point {
                return this.position;
            }

            /**
             * Sets the position of this group.
             */
            set Position(p: Point) {
                if (p == null) return;
                this.position = p;
                try {
                    if (this.nativeElement.ownerSVGElement == null) return;
                } catch (err) {
                    return;
                }

                var tr = this.Native.ownerSVGElement.createSVGTransform();
                tr.setTranslate(p.X, p.Y);
                if (this.Native.transform.baseVal.numberOfItems == 0)
                    this.Native.transform.baseVal.appendItem(tr);
                else
                    this.Native.transform.baseVal.replaceItem(tr, 0);
            }

            public get Native(): SVGClipPathElement {
                return this.nativeElement;
            }

            public Append(child: Visual) {
                if (this.children.Contains(child)) return;
                this.children.Append(child);
                this.nativeElement.appendChild(child.Native);
            }

            public Remove(child: Visual) {
                if (this.children.Contains(child)) {
                    this.children.Remove(child);
                    this.nativeElement.removeChild(child.Native);
                }
            }
        }

        /**
         * Base class for various line-like elements.
         */
        export class LineBase extends Visual {
            constructor(from: Point = null, to: Point = null) {
                super();
            }

            public get MarkerEnd(): Marker {
                if (this.Native.attributes["marker-end"] == null) {
                    return null;
                }
                var ss: String = this.Native.attributes["marker-end"].value.toString();
                var id = ss.substr(5, ss.length - 6);
                var markers = this.Canvas.Markers;
                for (var i = 0; i < markers.length; i++) {
                    if (markers[i].Id == id) return markers[i];
                }
                throw "Marker '" + id + "' could not be found in the <defs> collection.";
            }

            public set MarkerEnd(value: Marker) {
                if (value.Id == null) throw "The Marker needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("marker-end", s);
            }

            public set MarkerStart(value: Marker) {
                if (value.Id == null) throw "The Marker needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("marker-start", s);
            }

            public get MarkerStart(): Marker {
                if (this.Native.attributes["marker-start"] == null) return null;
                var s = <string>this.Native.attributes["marker-start"].value.toString();
                var id = s.substr(5, s.length - 6);
                var markers = this.Canvas.Markers;
                for (var i = 0; i < markers.length; i++)
                    if (markers[i].Id == id) return markers[i];
                throw "Marker '" + id + "' could not be found in the <defs> collection.";
            }
        }

        export class Image extends Visual {
            constructor() {
                super();
                this.nativeElement = <SVGImageElement>document.createElementNS(NS, "image");
                this.Width = 50;
                this.Height = 50;
            }
            /* Gets the position of this image.*/
            get Position(): any {
                return new TypeViz.Point(this.Native.x.baseVal.value, this.Native.y.baseVal.value);
            }

            /* Sets the position of this image.*/
            set Position(p: any) {
                this.Native.x.baseVal.value = p.X;
                this.Native.y.baseVal.value = p.Y;
            }
            public get Opacity(): any {
                if (this.Native.attributes["opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["opacity"].value);
            }

            public set Opacity(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("opacity", "1.0");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                    else this.Native.setAttribute("opacity", TypeViz.LimitValue(value));
                }
            }

            /* Gets the nativeElement SVG element which this visual wraps.*/
            public get Native(): SVGImageElement {
                return <SVGImageElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGImageElement) {
                this.nativeElement = value;
            }

            /* Sets the height of this image.*/
            set Height(value: number) {
                this.Native.height.baseVal.value = value;
            }

            /* Gets the height of this image.*/
            get Height(): number {
                return this.Native.height.baseVal.value;
            }

            /* Gets the width of this image.*/
            get Width(): number {
                return this.Native.width.baseVal.value;
            }

            /* Sets the width of this image.*/
            set Width(value: number) {
                this.Native.width.baseVal.value = value;
            }
            /* Gets the IRI of this image.*/
            get Url(): any {
                if (this.Native.attributes["xlink:href"] == null) return null;
                return this.Native.attributes["xlink.href"].value;
            }

            /* Sets the width of this image.*/
            set Url(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("xlink:href", "");
                }
                else {
                    if (typeof value === "function") this.Native.setAttributeNS(XLINKNS, "href", value.call(this, this.DataContext));
                    else this.Native.setAttributeNS(XLINKNS, "href", value);
                }
            }


        }

        /* A line visual.*/
        export class Line extends LineBase {

            private from: Point;
            private to: Point;
            private x1;
            private x2;
            private y1;
            private y2;

            /**
             * Instantiates a new Line.
             */
            constructor(from: Point = null, to: Point = null) {
                super();
                this.nativeElement = <SVGLineElement>document.createElementNS(NS, "line");
                this.Initialize();
                this.From = from;
                this.To = to;
                this.Stroke = "DimGray";
            }

            /**
             * Gets the point where the line starts.
             */
            public get From() {
                return this.from;
            }

            /**
             * Sets the point where the line starts.
             */
            public set From(value) {
                if (this.from != value) {
                    this.Native.setAttribute("x1", value.X.toString());
                    this.Native.setAttribute("y1", value.Y.toString());
                    this.from = value;
                }
            }

            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGLineElement {
                return <SVGLineElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGLineElement) {
                this.nativeElement = value;
            }

            /**
             * Gets the point where the line ends.
             */
            public get To() {
                return this.to;
            }

            /**
             * Sets the point where the line ends.
             */
            public set To(value) {
                if (this.to != value) {
                    this.Native.setAttribute("x2", value.X.toString());
                    this.Native.setAttribute("y2", value.Y.toString());
                    this.to = value;
                }
            }

            /**
             * Gets the opacity.
             */
            public get Opacity(): number {
                if (this.Native.attributes["opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["opacity"].value);
            }

            /**
             * Sets the opacity.
             */
            public set Opacity(value: number) {
                if (value < 0 || value > 1.0) throw "The opacity should be in the [0,1] interval.";
                this.Native.setAttribute("opacity", value.toString());
            }

            public set StrokeThickness(value: number) {
                this.Native.setAttribute("stroke-width", value.toString());
            }

            public get StrokeThickness(): number {
                if (this.Native.attributes["stroke-width"] == null) return 0.0;
                return parseFloat(this.Native.attributes["stroke-width"].value);
            }

            public set Stroke(value: string) {
                this.Native.setAttribute("stroke", value);
            }

            public get Stroke(): string {
                if (this.Native.attributes["stroke"] == null) return null;
                return this.Native.attributes["stroke"].value;
            }

            public set StrokeDash(value: string) {
                this.Native.setAttribute("stroke-dasharray", value);
            }

            public get StrokeDash(): string {
                if (this.Native.attributes["stroke-dasharray"] == null) return null;
                return this.Native.attributes["stroke-dasharray"].value;
            }

            public get X1() {
                return this.x1;
            }

            public set X1(value) {
                this.x1 = value;
                this.from.X = value;
                this.Native.setAttribute("x1", value.toString());
            }

            public get X2() {
                return this.x2;
            }

            public set X2(value) {
                this.x2 = value;
                this.Native.setAttribute("x2", value.toString());
            }

            public get Y1() {
                return this.y1;
            }

            public set Y1(value) {
                this.y1 = value;
                this.Native.setAttribute("y1", value.toString());
            }

            public get Y2() {
                return this.y2;
            }

            public set Y2(value) {
                this.y2 = value;
                this.Native.setAttribute("y2", value.toString());
            }
        }

        /**
         * Defines an SVG transformation.
         */
        export interface Transformation {

            /**
             *
             * Returns the Matrix of this transformation.
             */
            ToMatrix(): Matrix;
        }

        /**
         * A scaling transformation.
         */
        export class Scale implements Transformation {

            public ScaleX: number;
            public ScaleY: number;

            /**
             * Instantiates a new scaling transformation.
             * @param x The horizontal scaling.
             * @param y The vertical scaling.
             */
            constructor(x: number = null, y: number = null) {
                if (x != null) this.ScaleX = x;
                if (y != null) this.ScaleY = y;
            }

            public ToMatrix() {
                return Matrix.Scaling(this.ScaleX, this.ScaleY);
            }

            public toString() {
                return "scale(" + this.ScaleX + ", " + this.ScaleY + ")";
            }
        }

        /**
         * Represent an SVG translation.
         */
        export class Translation implements Transformation {

            private x: number;
            private y: number;

            public get X(): number {
                return this.x;
            }

            public set X(v: number) {
                this.x = v;
            }

            public get Y(): number {
                return this.y;
            }

            public set Y(v: number) {
                this.y = v;
            }

            constructor(x: number = null, y: number = null) {
                if (x != null) this.X = x;
                if (y != null) this.Y = y;
            }

            public ToMatrixVector(): MatrixVector {
                return new MatrixVector(0, 0, 0, 0, this.X, this.Y);
            }

            public ToMatrix() {
                return Matrix.Translation(this.X, this.Y);
            }

            public toString() {
                return "translate(" + this.X + ", " + this.Y + ")";
            }

            public Plus(delta: Translation) {
                return new Translation(this.X + delta.X, this.Y + delta.Y);
            }

            public Times(factor: number) {
                return new Translation(this.X * factor, this.Y * factor);
            }

            /**
             * Returns the size of this translation considered as a 2D vector.
             */
            public get Length(): number {
                return Math.sqrt(this.X * this.X + this.Y * this.Y);
            }

            /**
             * Normalizes the length of this translation to one.
             */
            public Normalize() {
                if (this.Length == 0) return new Translation();
                return new Translation(this.X / this.Length, this.Y / this.Length);
            }
        }

        /**
         * Represent an SVG rotation.
         */
        export class Rotation implements Transformation {
            public X: number;
            public Y: number;
            public Angle: number;

            /**
             * Instantiates a new rotation.
             * @param angle The rotation angle in degrees.
             * @param x The rotation center's X coordinate.
             * @param y The rotation center's Y coordinate.
             */
            constructor(angle: number = null, x: number = null, y: number = null) {
                if (x != null) this.X = x;
                if (y != null) this.Y = y;
                if (angle != null) this.Angle = angle;
            }

            public toString() {
                if (this.X != null || this.Y != null)
                    return "rotate(" + this.Angle + ", " + this.X + ", " + this.Y + ")";
                else
                    return "rotate(" + this.Angle + ")";
            }


            public ToMatrix() {
                if (this.X == 0 && this.Y == 0) return Matrix.Rotation(this.Angle);
                else {
                    // T*R*T^-1
                    return Matrix.Rotation(this.Angle, this.X, this.Y);
                }
            }
        }

        /**
         * The SVG TextSpan element.
         */
        export class TextSpan {

            private nativeElement;

            constructor() {
                this.nativeElement = <SVGTSpanElement>document.createElementNS(NS, "tspan");
                this.dx = 0;
                this.dy = 0;
            }

            public get Native(): SVGTSpanElement {
                return this.nativeElement;
            }

            /**
             * Gets the dx offset of this text block.
             */
            get dx(): number {
                if (this.nativeElement.attributes["dx"] == null) return null;
                return parseFloat(this.nativeElement.attributes["dx"].value);
            }

            /**
             * Sets the dx offset of this text block.
             */
            set dx(v: number) {
                this.Native.setAttribute("dx", v.toString() + 'em');
            }

            /**
             * Gets the dy offset of this text block.
             */
            get dy(): number {
                if (this.nativeElement.attributes["dy"] == null) return null;
                return parseFloat(this.nativeElement.attributes["dy"].value);
            }

            /**
             * Sets the dy offset of this text block.
             */
            set dy(v: number) {
                this.Native.setAttribute("dy", v.toString() + "em");
            }

            public get X(): number {
                return parseFloat(this.Native.x.baseVal.getItem(0).value.toString());
            }

            public set X(value: number) {
                this.Native.setAttribute("x", value.toString());
            }

            public get Y(): number {
                return parseFloat(this.Native.y.baseVal.getItem(0).value.toString());
            }

            public set Y(value: number) {
                this.Native.setAttribute("y", value.toString());
            }
        }

        /**
         * The test anchorings.
         */
        export enum TextAnchor {
            Left = 0,
            Center = 1,
            Right = 3
        }

        /**
         * A text block visual. See also the Controls.TextWrap element.
         */
        export class TextBlock extends Visual {

            constructor(canvas: Canvas = null) {
                super();
                this.nativeElement = <SVGTextElement>document.createElementNS(NS, "text");
                this.Initialize();
                this.dx = 0;
                this.dy = 0;
                this.FontFamily = "Verdana";
                this.FontVariant = FontVariants.Normal;
                this.Stroke = "steelblue";
                this.FontWeight = FontWeights.Normal;
                this.StrokeThickness = 0;
                this.FontSize = 10;

            }
            public get Opacity(): any {
                if (this.Native.attributes["fill-opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["fill-opacity"].value);
            }

            public set Opacity(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("fill-opacity", "1.0");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                    else this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                }
            }
            /**
             * Gets the fill of the circle.
             */
            get Background() {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of the circle.
             */
            set Background(v: any) {
                this.Native.style.fill = this.getColorString(v);
            }

            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGTextElement {
                return <SVGTextElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGTextElement) {
                this.nativeElement = value;
            }

            public set StrokeThickness(value: number) {
                this.Native.setAttribute("stroke-width", value.toString());
            }

            public get StrokeThickness(): number {
                if (this.Native.attributes["stroke-width"] == null) return 0.0;
                return parseFloat(this.Native.attributes["stroke-width"].value.toString());
            }

            public get X(): number {
                return parseFloat(this.Native.x.baseVal.getItem(0).value.toString());
            }

            public set X(value: number) {
                this.Native.setAttribute("x", value.toString());
            }

            public get Y(): number {
                return parseFloat(this.Native.y.baseVal.getItem(0).value.toString());
            }

            public set Y(value: number) {
                this.Native.setAttribute("y", value.toString());
            }

            /**
             * Gets the position of this text block.
             */
            get Position(): Point {
                if (this.Native.x.baseVal.numberOfItems > 0)
                    return new TypeViz.Point(this.Native.x.baseVal.getItem(0).value, this.Native.y.baseVal.getItem(0).value);
                else
                    return new TypeViz.Point(0, 0);
            }

            /**
             * Sets the position of this text block.
             */
            set Position(p: Point) {
                this.Native.setAttribute("x", p.X.toString());
                this.Native.setAttribute("y", p.Y.toString());
            }

            public set Stroke(value: string) {
                this.Native.setAttribute("stroke", value);
            }

            public get Stroke(): string {
                if (this.Native.attributes["stroke"] == null) return null;
                return this.Native.attributes["stroke"].value;
            }

            public get TextLength() {
                return this.Native["textLength"] ? this.Native.textLength.baseVal.value : this.Native.getComputedTextLength();
            }

            /**
             * Gets the text of this text block.
             */
            get Text(): any {
                return this.Native.textContent;
            }

            /**
             * Sets the text of this text block.
             */
            set Text(value: any) {

                if (TypeViz.IsUndefined(value)) {
                    this.Native.textContent = "";
                }
                else {
                    if (typeof value === "function") this.Native.textContent = value.call(this, this.DataContext);
                    else this.Native.textContent = value;
                }
            }

            /**
             * Gets the font-family of this text block.
             */
            get FontFamily(): string {
                if (this.nativeElement.attributes["font-family"] == null) return null;
                return this.Native.attributes["font-family"].value;
            }

            /**
             * Sets the font-family of this text block.
             */
            set FontFamily(v: string) {
                this.Native.setAttribute("font-family", v);
            }

            /**
             * Gets the font-family of this text block.
             */
            get FontVariant(): FontVariants {
                if (this.nativeElement.attributes["font-variant"] == null) return null;
                return TextBlock.ParseFontVariant(this.nativeElement.attributes["font-variant"].value);
            }

            /**
             * Sets the font-family of this text block.
             */
            set FontVariant(v: FontVariants) {
                var s = TextBlock.FontVariantString(v);
                if (s != null) this.Native.setAttribute("font-variant", s);
            }

            /**
             * Gets the font-size of this text block.
             */
            get FontSize(): number {
                if (this.nativeElement.attributes["font-size"] == null) return null;
                return parseFloat(this.nativeElement.attributes["font-size"].value);
            }

            /**
             * Sets the font-size of this text block.
             */
            set FontSize(v: number) {
                this.Native.setAttribute("font-size", v.toString());
            }

            /**
             * Gets the font-size of this text block.
             */
            get FontWeight(): FontWeights {
                if (this.nativeElement.attributes["font-weight"] == null) return FontWeights.NotSet;
                return TextBlock.ParseFontWeight(this.nativeElement.attributes["font-weight"].value);
            }

            /**
             * Sets the font-size of this text block.
             */
            set FontWeight(v: FontWeights) {
                var s = TextBlock.FontWeightString(v);
                if (s != null) this.Native.setAttribute("font-weight", s);
            }

            /**
             * Gets the anchor of this text block.
             */
            get Anchor(): TextAnchor {
                if (this.nativeElement.attributes["text-anchor"] == null) return null;
                return this.getTextAnchor(this.nativeElement.attributes["text-anchor"].value);
            }

            /**
             * Sets the anchor of this text block.
             */
            set Anchor(v: TextAnchor) {
                this.Native.setAttribute("text-anchor", this.getAnchorString(v));
            }

            /**
             * Gets the dx offset of this text block.
             */
            get dx(): number {
                if (this.nativeElement.attributes["dx"] == null) return null;
                return parseFloat(this.nativeElement.attributes["dx"].value);
            }

            /**
             * Sets the dx offset of this text block.
             */
            set dx(v: number) {
                this.Native.setAttribute("dx", v.toString());
            }

            /**
             * Gets the dy offset of this text block.
             */
            get dy(): number {
                if (this.nativeElement.attributes["dy"] == null) return null;
                return parseFloat(this.nativeElement.attributes["dy"].value);
            }

            /**
             * Sets the dy offset of this text block.
             */
            set dy(v: number) {
                this.Native.setAttribute("dy", v.toString() + "em");
            }

            private getAnchorString(anchor: TextAnchor): string {
                switch (anchor) {
                    case TextAnchor.Left:
                        return "start";
                    case TextAnchor.Center:
                        return "middle";
                    case TextAnchor.Right:
                        return "end";
                    default:
                        throw "Unsupported anchor type.";
                }
            }

            private getTextAnchor(anchor: string): TextAnchor {
                switch (anchor.toLowerCase()) {
                    case "start":
                        return TextAnchor.Left;
                    case "middle":
                        return TextAnchor.Center;
                    case "end":
                        return TextAnchor.Right;
                    default:
                        throw "Unsupported anchor type.";
                }
            }

            /**
             * Parses the given string and attempts to convert it to a FontWeights member.
             * @param v A string representing a FontWeights.
             */
            static ParseFontWeight(v: string): FontWeights {
                if (v == null) return FontWeights.NotSet;
                switch (v.toLowerCase()) {
                    case "normal":
                        return FontWeights.Normal;
                    case "bold":
                        return FontWeights.Bold;
                    case "bolder":
                        return FontWeights.Bolder;
                    case "lighter":
                        return FontWeights.Lighter;
                    case "100":
                        return FontWeights.W100;
                    case "200":
                        return FontWeights.W200;
                    case "300":
                        return FontWeights.W300;
                    case "400":
                        return FontWeights.W400;
                    case "500":
                        return FontWeights.W500;
                    case "600":
                        return FontWeights.W600;
                    case "700":
                        return FontWeights.W700;
                    case "800":
                        return FontWeights.W800;
                    case "900":
                        return FontWeights.W900;
                    case "inherit":
                        return FontWeights.Inherit;
                }
                throw "String '" + v + "' could not be parsed to a FontWeights member.";
            }

            /**
             * Returns a string representation of the given FontWeights value.
             * @param value A FontWeights member.
             */
            static FontWeightString(value: FontWeights): string {
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
            }

            static ParseFontVariant(v: string) {
                if (v == null) return FontVariants.NotSet;
                switch (v.toLowerCase()) {
                    case "normal":
                        return FontVariants.Normal;
                    case "small-caps":
                        return FontVariants.SmallCaps;
                }

            }

            static FontVariantString(value: FontVariants) {
                switch (value) {
                    case 0:
                        return "normal";
                    case 1:
                        return "small-caps";
                    case 2:
                        return null;
                }
            }
        }

        /**
         * The values the FontWeight accepts.
         */
        export enum FontWeights {
            Normal = 0,
            Bold = 1,
            Bolder = 2,
            Lighter = 3,
            W100 = 4,
            W200 = 5,
            W300 = 6,
            W400 = 7,
            W500 = 8,
            W600 = 9,
            W700 = 10,
            W800 = 11,
            W900 = 12,
            Inherit = 13,
            NotSet = 14
        }

        /**
         * The FontVariant values.
         */
        export enum FontVariants {
            Normal = 0,
            SmallCaps = 1,
            Inherit = 2,
            NotSet = 3
        }

        /**
         * A rectangle visual.
         */
        export class Rectangle extends Visual {

            /**
             * Instantiates a new rectangle.
             */
            constructor(position?) {
                super();
                this.nativeElement = <SVGRectElement>document.createElementNS(NS, "rect");
                this.Width = 15;
                this.Height = 15;
                this.Background = "Silver";
                if (position)
                    this.Position = position;
                this.Initialize();
            }

            /* Gets the width of this rectangle.*/
            get Width(): number {
                return this.Native.width.baseVal.value;
            }

            /* Sets the width of this rectangle.*/
            set Width(value: number) {
                this.Native.width.baseVal.value = value;
            }

            /* Gets the height of this rectangle.*/
            get Height(): number {
                return this.Native.height.baseVal.value;
            }

            /* Sets the height of this rectangle.*/
            set Height(value: number) {
                this.Native.height.baseVal.value = value;
            }

            /* Gets the nativeElement SVG element which this visual wraps.*/
            public get Native(): SVGRectElement {
                return <SVGRectElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGRectElement) {
                this.nativeElement = value;
            }

            public get Opacity(): any {
                if (this.Native.attributes["fill-opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["fill-opacity"].value);
            }

            public set Opacity(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("fill-opacity", "1.0");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                    else this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                }
            }
            /**
             * Gets the fill of this rectangle.
             */
            public get Background() {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of this rectangle.
             */
            public set Background(v: any) {
                this.Native.style.fill = this.getColorString(v);
            }

            /**
             * Gets the corner radius of this rectangle.
             */
            get CornerRadius(): number {
                return this.Native.rx.baseVal.value;
            }

            /**
             * Sets the corner radius of this rectangle.
             */
            set CornerRadius(v: number) {
                this.Native.rx.baseVal.value = v;
                this.Native.ry.baseVal.value = v;
            }



            /* Gets the position of this rectangle.*/
            get Position(): any {
                return new TypeViz.Point(this.Native.x.baseVal.value, this.Native.y.baseVal.value);
            }

            /* Sets the position of this rectangle.*/
            set Position(p: any) {
                this.Native.x.baseVal.value = p.X;
                this.Native.y.baseVal.value = p.Y;
            }

            public set StrokeThickness(value: number) {
                this.Native.setAttribute("stroke-width", value.toString());
            }

            public get StrokeThickness(): number {
                if (this.Native.attributes["stroke-width"] == null) return 0.0;
                return parseFloat(this.Native.attributes["stroke-width"].value);
            }

            public set Stroke(value: string) {
                this.Native.setAttribute("stroke", this.getColorString(value));
            }

            public get Stroke(): string {
                if (this.Native.attributes["stroke"] == null) return null;
                return this.Native.attributes["stroke"].value;
            }

            public set StrokeDash(value: string) {
                this.Native.setAttribute("stroke-dasharray", value);
            }

            public get StrokeDash(): string {
                if (this.Native.attributes["stroke-dasharray"] == null) return null;
                return this.Native.attributes["stroke-dasharray"].value;
            }


        }


        /**
         * The Path class allows you to define a path by means of points and interpolators.
         This class is the simple wrapper around the SVG Path element.
         */
        export class PathBase extends LineBase {
            private xf = 1;
            private yf = 1;
            private position: Point;

            /**
             * Instantiates a new path.
             */
            constructor() {
                super();
                this.nativeElement = <SVGPathElement>document.createElementNS(NS, "path");
                this.Initialize();
                this.Background = "Black";
                this.Stroke = "Black";
                this.position = new TypeViz.Point(0, 0);
            }
            public get MarkerEnd(): Marker {
                if (this.Native.attributes["marker-end"] == null) {
                    return null;
                }
                var ss: String = this.Native.attributes["marker-end"].value.toString();
                var id = ss.substr(5, ss.length - 6);
                var markers = this.Canvas.Markers;
                for (var i = 0; i < markers.length; i++) {
                    if (markers[i].Id == id) return markers[i];
                }
                throw "Marker '" + id + "' could not be found in the <defs> collection.";
            }

            public set MarkerEnd(value: Marker) {
                if (value.Id == null) throw "The Marker needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("marker-end", s);
            }
            public set MarkerStart(value: Marker) {
                if (value.Id == null) throw "The Marker needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("marker-start", s);
            }

            public get MarkerStart(): Marker {
                if (this.Native.attributes["marker-start"] == null) return null;
                var s = <string>this.Native.attributes["marker-start"].value.toString();
                var id = s.substr(5, s.length - 6);
                var markers = this.Canvas.Markers;
                for (var i = 0; i < markers.length; i++)
                    if (markers[i].Id == id) return markers[i];
                throw "Marker '" + id + "' could not be found in the <defs> collection.";
            }
            public set StrokeThickness(value: number) {
                this.Native.setAttribute("stroke-width", value.toString());
            }

            public get StrokeThickness(): number {
                if (this.Native.attributes["stroke-width"] == null) return 0.0;
                return parseFloat(this.Native.attributes["stroke-width"].value);
            }

            public set Stroke(value: string) {
                this.Native.setAttribute("stroke", this.getColorString(value));
            }

            public get Stroke(): string {
                if (this.Native.attributes["stroke"] == null) return null;
                return this.Native.attributes["stroke"].value;
            }

            public set StrokeDash(value: string) {
                this.Native.setAttribute("stroke-dasharray", value);
            }

            public get StrokeDash(): string {
                if (this.Native.attributes["stroke-dasharray"] == null) return null;
                return this.Native.attributes["stroke-dasharray"].value;
            }


            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGPathElement {
                return <SVGPathElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGPathElement) {
                this.nativeElement = value;
            }

            /**
             * Gets the position of this group.
             */
            get Position(): Point {
                return this.position;
            }

            /**
             * Sets the position of this group.
             */
            set Position(p: Point) {
                if (p == null) return;
                this.position = p;
                try {
                    if (this.nativeElement.ownerSVGElement == null) throw "Add the Path first to a parent element before positioning.";
                } catch (err) {
                    return;
                }

                var tr = this.Native.ownerSVGElement.createSVGTransform();
                tr.setTranslate(p.X, p.Y);
                if (this.Native.transform.baseVal.numberOfItems == 0)
                    this.Native.transform.baseVal.appendItem(tr);
                else
                    this.Native.transform.baseVal.replaceItem(tr, 0);
            }

            public get Data(): string {
                if (this.Native.attributes["d"] == null) return null;

                return this.Native.attributes["d"].value;
            }

            public set Data(value: string) {
                this.Native.setAttribute("d", value);
            }

            /**
             * Gets the fill of this rectangle.
             */
            get Background(): any {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of this rectangle.
             */
            set Background(v: any) {
                /*if (typeof (v) == "string") this.Native.style.fill = v;
                if (typeof (v) == "object") {
                    var gr = <Media.LinearGradient><Object>v;
                    if (gr != null) {
                        if (gr.Id == null) throw "The gradient needs an Id.";
                        this.Native.style.fill = "url(#" + gr.Id + ")";
                    }
                }*/
                this.Native.style.fill = this.getColorString(v);
            }

            /**
             * Gets the width of this rectangle.
             */
            get Width(): number {
                try {
                    return this.Native.getBBox().width;
                } catch (err) {
                    return 0;
                }
            }

            /**
             * Sets the width of this rectangle.
             */
            set Width(value: number) {
                if (this.Width == 0) {
                    //means most probably that the path is not yet added to the canvas.
                    //console.log("Warning: current path bounding box is nil, assuming that the path's geometry is scaled at 100x100.");
                    this.xf = value / 100;
                }
                else
                    this.xf = value / this.Width;
                this.Native.setAttribute("transform", "scale(" + this.xf + "," + this.yf + ")");
            }

            /**
             * Gets the height of this rectangle.
             */
            get Height(): number {
                try {
                    return this.Native.getBBox().height;
                } catch (err) {
                    return 0;
                }
            }

            /**
             * Sets the height of this rectangle.
             */
            set Height(value: number) {
                if (this.Height == 0) {
                    //means most probably that the path is not yet added to the canvas.
                    console.log("Warning: current path bounding box is nil, assuming that the path's geometry is scaled at 100x100.");
                    this.yf = value / 100;
                }
                else
                    this.yf = value / this.Height;
                this.Native.setAttribute("transform", "scale(" + this.xf + "," + this.yf + ")");
            }

            /**
             * Attempts to convert the given Node to a PathBase.
             * @param A Node.
             */
            static ParseNode(node: Node): PathBase {
                if (node == null) return null;
                if (node.localName != "path") return null;
                var path = new PathBase();
                path.Data = node.attributes["d"] == null ? null : node.attributes["d"].value;
                path.StrokeThickness = node.attributes["stroke-width"] == null ? 0 : parseFloat(node.attributes["stroke-width"].value);
                path.Stroke = node.attributes["stroke"] == null ? null : node.attributes["stroke"].value;
                path.Background = node.attributes["fill"] == null ? null : node.attributes["fill"].value;
                return path;
            }


        }

        /**
         *  A path defined by means of points and an interpolator.
         */
        export class Path extends PathBase {
            private points: Array<Point>;
            private interpolator = Interpolate();

            constructor() {
                super();
                this.Background = "none";
                this.points = [];
            }

            public get Interpolator() {
                return this.interpolator;
            }

            public set Interpolator(value) {
                this.interpolator = value;
                if (this.points != null && this.points.length > 0) {
                    this.refreshData();
                }
            }

            /**
             * Gets the opacity.
             */
            public get Opacity(): number {
                if (this.Native.attributes["stroke-opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["stroke-opacity"].value);
            }

            /**
             * Sets the opacity.
             */
            public set Opacity(value: number) {
                if (value < 0 || value > 1.0) throw "The opacity should be in the [0,1] interval.";
                this.Native.setAttribute("stroke-opacity", value.toString());
                this.Native.setAttribute("opacity", value.toString());
            }
            public AddPoint(p: Point) {
                this.points.push(p);
                this.refreshData();
            }

            public get Points(): Array<Point> {
                return this.points.Reverse();
                // return (<Array<TypeViz.Point>><Object>TypeViz.Point.FromArray(this.points)).Reverse();
            }

            public set Points(value: Array<Point>) {
                if (value == null || value.length == 0) {
                    this.Data = "";
                    return;
                }
                /*  if (value[0] instanceof TypeViz.Point)
                      this.points = TypeViz.Point.ToArray(value).Reverse();
                  else*/
                this.points = value.Reverse();
                this.refreshData();
            }

            refreshData() {
                this.Data = this.Interpolator(TypeViz.Point.ToArray(this.points));
            }

            public Grow(points: Array<Point>, complete?) {
                if (points == null || points.length == 0) return;
                if (points.length == 1) this.Points = points;

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
                var anim: TypeViz.Animation.Animator;


                for (var k = 1; k < states.length; k++) {
                    if (k == 1) anim = this.Change({ Data: states[k] }, complete ? () => { complete(states[1][1], 1); } : null);
                    else {
                        var s = states[k];
                        anim = anim.Change({ Data: s }, complete ?
                            (function (m) {
                                return () => { complete(points[m], m); }
                            })(k)
                            : null);
                    }
                }
                if (TypeViz.IsDefined(complete)) complete(points[0], 0); // starting point
                anim.Play();
            }
        }

        /**
         * A marker
         */
        export class Marker extends Visual {
            private path: Visual;

            /**
             * Instantiates a new marker.
             */
            constructor() {
                super();
                this.nativeElement = <SVGMarkerElement>document.createElementNS(NS, "marker");
                this.Initialize();
            }

            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGMarkerElement {
                return <SVGMarkerElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGMarkerElement) {
                this.nativeElement = value;
            }

            /**
             * Gets the refX of this marker.
             */
            get RefX(): number {
                if (this.nativeElement.attributes["refX"] == null) return 0;
                return parseFloat(this.nativeElement.attributes["refX"].value);
            }

            /**
             * Sets the refX of this marker.
             */
            set RefX(value: number) {
                this.Native.refX.baseVal.value = value;
            }

            /**
             * Gets the refY of this marker.
             */
            get RefY(): number {
                if (this.nativeElement.attributes["refY"] == null) return 0;
                return parseFloat(this.nativeElement.attributes["refY"].value);
            }

            /**
             * Sets the refX of this marker.
             */
            set RefY(value: number) {
                this.Native.refY.baseVal.value = value;
            }


            /**
             * Gets the refX and refY of this marker.
             */
            get Ref(): Point {
                return new Point(this.RefX, this.RefY);
            }

            /**
             * Sets the refX and refY of this marker.
             */
            set Ref(value: Point) {
                this.RefX = value.X;
                this.RefY = value.Y;
            }

            /**
             * Gets the width of this marker.
             */
            get MarkerWidth(): number {
                if (this.nativeElement.attributes["markerWidth"] == null) return 0;
                return parseFloat(this.nativeElement.attributes["markerWidth"].value);
            }

            /**
             * Sets the width of this marker.
             */
            set MarkerWidth(value: number) {
                this.Native.markerWidth.baseVal.value = value;
            }

            /**
             * Gets the height of this marker.
             */
            get MarkerHeight(): number {
                if (this.nativeElement.attributes["markerHeight"] == null) return 0;
                return parseFloat(this.nativeElement.attributes["markerHeight"].value);
            }

            /**
             * Sets the height of this marker.
             */
            set MarkerHeight(value: number) {
                this.Native.markerHeight.baseVal.value = value;
            }

            /**
             * Gets the size of this marker.
             */
            get Size(): TypeViz.Size {
                return new TypeViz.Size(this.MarkerWidth, this.MarkerHeight);
            }

            /**
             * Sets the size of this marker.
             */
            set Size(value: TypeViz.Size) {
                this.MarkerWidth = value.Width;
                this.MarkerHeight = value.Height;
            }

            /**
             * Gets the size of this marker.
             */
            get ViewBox(): Rect {
                if (this.Native.viewBox == null) return Rect.Empty;
                return new Rect(this.Native.viewBox.baseVal.x, this.Native.viewBox.baseVal.y, this.Native.viewBox.baseVal.width, this.Native.viewBox.baseVal.height);
            }

            /**
             * Sets the size of this marker.
             */
            set ViewBox(value: Rect) {
                if (this.Native.viewBox.baseVal == null) return;
                this.Native.viewBox.baseVal.height = value.Height;
                this.Native.viewBox.baseVal.width = value.Width;
                this.Native.viewBox.baseVal.x = value.X;
                this.Native.viewBox.baseVal.y = value.Y;
            }

            get Orientation(): MarkerOrientation {
                if (this.Native.orientType == null) return MarkerOrientation.NotSet;
                return Marker.ParseOrientation(this.Native.orientType.baseVal.toString());
            }

            set Orientation(value: MarkerOrientation) //value is actually an int
            {
                if (value == MarkerOrientation.NotSet) return; // not so sure about this one
                var s = Marker.OrientationString(value);
                if (s != null) this.Native.setAttribute("orient", s);
            }

            get Path(): Visual {
                return this.path;
            }

            set Path(value: Visual) {
                if (value == this.path) return;
                this.path = value;
                if (this.nativeElement.firstChild != null) this.Native.removeChild(this.nativeElement.firstChild);
                this.Native.appendChild(value.Native);
            }

            get MarkerUnits(): MarkerUnits {
                if (this.Native.orientType == null) return MarkerUnits.NotSet;
                return Marker.ParseMarkerUnits(this.Native.orientType.baseVal.toString());
            }

            set MarkerUnits(value: MarkerUnits) {
                if (value == MarkerUnits.NotSet) return; // not so sure about this one
                var s = Marker.MarkerUnitsString(value);
                if (s != null) this.Native.setAttribute("markerUnits", s);
            }

            /**
             * Parses the orientation attribute.
             * @param v The value of the 'orient' attribute.
             */
            static ParseOrientation(v: string): MarkerOrientation {
                if (v == null) return MarkerOrientation.NotSet;
                if (v.toLowerCase() == "auto") return MarkerOrientation.Auto;
                if (v.toLowerCase() == "angle") return MarkerOrientation.Angle;
                throw "Unexpected value '" + v + "' cannot be converted to a MarkerOrientation.";
            }

            /**
             * Returns a string representation of the given MarkerOrientation.
             * @param value A MarkerOrientation member.
             */
            static OrientationString(value: MarkerOrientation): string {
                switch (value) {
                    case 0:
                        return "auto";
                    case 1:
                        return "angle";
                    case 2:
                        return null;
                }
                throw "Unexpected MarkerOrientation value '" + value + "'.";
            }

            /**
             * Attempts to convert the given string to a MarkerUnits.
             * @param v A string to convert.
             */
            static ParseMarkerUnits(v: string): MarkerUnits {
                if (v == null) return MarkerUnits.NotSet;
                if (v.toLowerCase() == "strokewidth") return MarkerUnits.StrokeWidth;
                if (v.toLowerCase() == "userspaceonuse") return MarkerUnits.UserSpaceOnUse;
                throw "Unexpected MarkerUnits value '" + v + "'.";
            }

            static MarkerUnitsString(value: MarkerUnits) {
                switch (value) {
                    case 0:
                        return "strokewidth";
                    case 1:
                        return "userspaceonuse";
                    case 2:
                        return null;
                }
                throw "Unexpected MarkerUnits value '" + value + "'.";
            }

            /**
             * Sets the stroke color of the underlying path.
             */
            public set Stroke(value: string) {
                if (this.Path != null) this.Path.Stroke = value;
            }

            /**
             * Gets the stroke color of the underlying path.
             */
            public get Stroke(): string {
                if (this.Path == null) return null;
                return this.Path.Stroke;
            }

            /**
             * Sets the fill color of the underlying path.
             */
            public set Background(value: string) {
                if (value == null) value = "none";
                if (this.Path != null) this.Path.Background = value;
            }

            /**
             * Sets the fill and stroke color of the underlying path in one go.
             * You can set the values separately by accessing the PathBase property of this marker if needed.
             */
            public set Color(value: string) {
                if (this.Path != null) {
                    this.Path.Background = value;
                    this.Path.Stroke = value;
                }
            }

            public get Background(): string {
                if (this.Path == null) return null;
                return this.Path.Background;
            }


        }

        /**
         * The possible marker orientation values.
         */
        export enum MarkerOrientation {
            Auto = 0,
            Angle = 1,
            NotSet = 2
        }

        /**
         * The possible marker unit values.
         */
        export enum MarkerUnits {
            StrokeWidth = 0,
            UserSpaceOnUse = 1,
            NotSet = 2
        }

        /**
         * A polyline visual.
         */
        export class Polyline extends LineBase {
            private points: Point[];

            /**
             * Instantiates a new Line.
             */
            constructor(points: Point[]= null) {
                super();
                this.nativeElement = <SVGPolylineElement>document.createElementNS(NS, "polyline");
                this.Initialize();
                this.Initialize();
                if (points != null) this.Points = points;
                else this.points = [];
                this.Stroke = "Black";
                this.StrokeThickness = 2;
                this.Background = "none";
            }

            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGPolylineElement {
                return <SVGPolylineElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGPolylineElement) {
                this.nativeElement = value;
            }

            /**
             * Gets the fill of the polyline.
             */
            get Background() {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of the polyline.
             */
            set Background(v) {
                if (typeof (v) == "string") this.Native.style.fill = v;
                if (typeof (v) == "object") {
                    var gr = <Media.LinearGradient><Object>v;
                    if (gr != null) {
                        if (gr.Id == null) throw "The gradient needs an Id.";
                        this.Native.style.fill = "url(#" + gr.Id + ")";
                    }
                }
            }

            /**
             * Gets the points of the polyline.
             */
            public get Points(): Point[] {
                return this.points;
            }

            /**
             * Sets the points of the polyline.
             */
            public set Points(value: Point[]) {
                if (this.points != value) {
                    if (value == null || value.length == 0) this.Native.setAttribute("points", null);
                    else {
                        var s = "";
                        for (var i = 0; i < value.length; i++) s += " " + value[i].X + "," + value[i].Y;
                        s = s.trim();
                        this.Native.setAttribute("points", s);
                    }
                    this.points = value;
                }
            }

            /**
             * Gets the opacity.
             */
            public get Opacity(): number {
                if (this.Native.attributes["fill-opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["fill-opacity"].value);
            }

            /**
             * Sets the opacity.
             */
            public set Opacity(value: number) {
                if (value < 0 || value > 1.0) throw "The opacity should be in the [0,1] interval.";
                this.Native.setAttribute("fill-opacity", value.toString());
            }

            public set StrokeThickness(value: number) {
                this.Native.setAttribute("stroke-width", value.toString());
            }

            public get StrokeThickness(): number {
                if (this.Native.attributes["stroke-width"] == null) return 0.0;
                return parseFloat(this.Native.attributes["stroke-width"].value);
            }

            public set Stroke(value: string) {
                this.Native.setAttribute("stroke", value);
            }

            public get Stroke(): string {
                if (this.Native.attributes["stroke"] == null) return null;
                return this.Native.attributes["stroke"].value;
            }

            public set StrokeDash(value: string) {
                this.Native.setAttribute("stroke-dasharray", value);
            }

            public get StrokeDash(): string {
                if (this.Native.attributes["stroke-dasharray"] == null) return null;
                return this.Native.attributes["stroke-dasharray"].value;
            }

            public set MarkerEnd(value: Marker) {
                if (value.Id == null) throw "The Marker needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("marker-end", s);
            }

            public get MarkerEnd(): Marker {
                if (this.Native.attributes["marker-end"] == null) return null;
                var s = <string>this.Native.attributes["marker-end"].value.toString();
                var id = s.substr(5, s.length - 6);
                var markers = this.Canvas.Markers;
                for (var i = 0; i < markers.length; i++)
                    if (markers[i].Id == id) return markers[i];
                throw "Marker '" + id + "' could not be found in the <defs> collection.";
            }

            public set MarkerStart(value: Marker) {
                if (value.Id == null) throw "The Marker needs an Id.";
                var s = "url(#" + value.Id + ")";
                this.Native.setAttribute("marker-start", s);
            }

            public get MarkerStart(): Marker {
                if (this.Native.attributes["marker-start"] == null) return null;
                var s = <string>this.Native.attributes["marker-start"].value.toString();
                var id = s.substr(5, s.length - 6);
                var markers = this.Canvas.Markers;
                for (var i = 0; i < markers.length; i++)
                    if (markers[i].Id == id) return markers[i];
                throw "Marker '" + id + "' could not be found in the <defs> collection.";
            }

        }

        /**
         * A group visual.
         */
        export class Group extends Visual {

            private position: Point;

            /**
             * Instantiates a new group.
             */
            constructor() {
                super();
                this.nativeElement = <SVGGElement>document.createElementNS(SVG.NS, "g");
                this.Initialize();
                this.position = new TypeViz.Point(0, 0);
            }
            public Contains(visual: Visual) { return this.Children.Contains(visual); }

            /*Fades in the given visual. It will be appended if not already part of this canvas.*/
            public FadeIn(visual: Visual, duration= 1500, complete?) {
                if (TypeViz.IsUndefined(visual)) throw "FadeIn cannot proceed, the given visual is null.";
                visual.Opacity = 0;
                if (!this.Contains(visual)) {
                    this.Append(visual);
                }
                visual.Change({ Opacity: 1, Duration: duration }, complete).Play();
            }
            public FadeOut(visual: Visual, remove= true, duration= 1500, complete?) {
                if (TypeViz.IsUndefined(visual)) throw "FadeOut cannot proceed, the given visual is null.";
                var c = this;
                visual.Change({ Opacity: 0, Duration: duration },
                    () => {
                        if (remove) {
                            c.Remove(visual);
                        }
                        if (TypeViz.IsDefined(complete)) {
                            complete(visual);
                        }
                    });
            }
            public get Children() {
                return this.children;
            }
            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGGElement {
                return <SVGGElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGGElement) {
                this.nativeElement = value;
            }

            /**
             * Gets the position of this group.
             */
            get Position(): Point {
                return this.position;
            }

            /**
             * Sets the position of this group.
             */
            set Position(p: Point) {
                this.position = p;
                try {
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
            }

            private children = [];

            /* Appends a visual to this group.*/
            public Append(visual: Visual) {
                this.Native.appendChild(visual.Native);
                visual.Canvas = this.Canvas;
                if (visual["OnAppendToCanvas"]) visual["OnAppendToCanvas"](this.Canvas);
                visual.ParentLayer = this;
                this.children.push(visual);
            }

            /*Pushes the visual in the first position.*/
            public Prepend(visual: Visual) {
                if (this.children.length > 0) {
                    this.Native.insertBefore(visual.Native, this.children[0].Native);
                    visual.Canvas = this.Canvas;
                    if (visual["OnAppendToCanvas"]) visual["OnAppendToCanvas"](this.Canvas);
                    visual.ParentLayer = this;
                    this.children.push(visual);
                }
                else {
                    this.Append(visual);
                }

            }
            public Remove(visual: Visual) {
                this.Native.removeChild(visual.Native);
                if (visual["OnDetachFromCanvas"] != null) visual["OnDetachFromCanvas"](this.Canvas);
                visual.ParentLayer = null;
                visual.Canvas = null;
                this.children.Remove(visual);
            }

            /**
             * Clears the content of this group.
             */
            public Clear() {
                //var nodes = this.Native.childNodes;
                while (this.Native.childNodes.length > 0) {
                    this.Native.removeChild(this.Native.childNodes[0]);
                }
                while (this.children.length > 0) {
                    var child = this.children[0];
                    if (child["OnDetachFromCanvas"] != null) child["OnDetachFromCanvas"](this.Canvas);
                    child.Canvas = null;
                    this.children.Remove(child);
                }
            }
        }

        /**
         * The SVG matrix related to transformations.
         */
        export class Matrix {
            /*
             Schema is as follows

             | a  c  e |
             |b  d  f  |
             |0  0  1 |

             and elements are thus (a, b, c, d, e, f).
             */
            public a: number;
            public b: number;
            public c: number;
            public d: number;
            public e: number;
            public f: number;

            constructor(a: number = null, b: number = null, c: number = null, d: number = null, e: number = null, f: number = null) {
                if (a != null) this.a = a;
                if (b != null) this.b = b;
                if (c != null) this.c = c;
                if (d != null) this.d = d;
                if (e != null) this.e = e;
                if (f != null) this.f = f;
            }

            public Plus(m: Matrix) {
                this.a += m.a;
                this.b += m.b;
                this.c += m.c;
                this.d += m.d;
                this.e += m.e;
                this.f += m.f;
            }

            public Minus(m: Matrix) {
                this.a -= m.a;
                this.b -= m.b;
                this.c -= m.c;
                this.d -= m.d;
                this.e -= m.e;
                this.f -= m.f;
            }

            public Times(m: Matrix) {
                return Matrix.FromList([
                    this.a * m.a + this.c * m.b,
                    this.b * m.a + this.d * m.b,
                    this.a * m.c + this.c * m.d,
                    this.b * m.c + this.d * m.d,
                    this.a * m.e + this.c * m.f + this.e,
                    this.b * m.e + this.d * m.f + this.f
                ]);

            }

            public Apply(p: Point) {
                return new Point(
                    this.a * p.X + this.c * p.Y + this.e,
                    this.b * p.X + this.d * p.Y + this.f
                    );
            }

            static FromSVGMatrix(vm: SVGMatrix): Matrix {
                var m = new Matrix();
                m.a = vm.a;
                m.b = vm.b;
                m.c = vm.c;
                m.d = vm.d;
                m.e = vm.e;
                m.f = vm.f;
                return m;
            }

            static FromMatrixVector(v: MatrixVector): Matrix {
                var m = new Matrix();
                m.a = v.a;
                m.b = v.b;
                m.c = v.c;
                m.d = v.d;
                m.e = v.e;
                m.f = v.f;
                return m;
            }

            static FromList(v: any[]): Matrix {
                if (v.length != 6) throw "The given list should consist of six elements.";
                var m = new Matrix();
                m.a = v[0];
                m.b = v[1];
                m.c = v[2];
                m.d = v[3];
                m.e = v[4];
                m.f = v[5];
                return m;
            }

            static Translation(x: number, y: number) {
                var m = new Matrix();
                m.a = 1;
                m.b = 0;
                m.c = 0;
                m.d = 1;
                m.e = x;
                m.f = y;
                return m;
            }

            static get Unit() {
                return Matrix.FromList([1, 0, 0, 1, 0, 0]);
            }

            public toString() {
                return "matrix(" + this.a + " " + this.b + " " + this.c + " " + this.d + " " + this.e + " " + this.f + ")";
            }

            /*
             * Returns the rotation matrix for the given angle.
             * @param angle The angle in radians.
             */
            static Rotation(angle: number, x: number = 0, y: number = 0): Matrix {
                var m = new Matrix();
                m.a = Math.cos(angle * Math.PI / 180);
                m.b = Math.sin(angle * Math.PI / 180);
                m.c = -m.b;
                m.d = m.a;
                m.e = x - x * m.a + y * m.b;
                m.f = y - y * m.a - x * m.b;
                return m;
            }

            /*
             * Returns the scaling matrix for the given factor.
             * @param factor The scaling factor.
             */
            static Scaling(scaleX: number, scaleY: number = null) {
                if (scaleY == null) scaleY = scaleX;
                var m = new Matrix();
                m.a = scaleX;
                m.b = 0;
                m.c = 0;
                m.d = scaleY;
                m.e = 0;
                m.f = 0;
                return m;
            }

            static Parse(v: string): Matrix {
                if (v == null) return null;
                v = v.trim();
                // of the form "matrix(...)"
                if (v.slice(0, 6).toLowerCase() == "matrix") {
                    var nums = v.slice(7, v.length - 1).trim();
                    var parts = nums.split(",");
                    if (parts.length == 6) return Matrix.FromList(parts.map(p => parseFloat(p)));
                    parts = nums.split(" ");
                    if (parts.length == 6) return Matrix.FromList(parts.map(p => parseFloat(p)));
                }
                // of the form "(...)"
                if (v.slice(0, 1) == "(" && v.slice(v.length - 1) == ")") v = v.substr(1, v.length - 1);
                if (v.indexOf(",") > 0) {
                    var parts = v.split(",");
                    if (parts.length == 6) return Matrix.FromList(parts.map(p => parseFloat(p)));
                }

                if (v.indexOf(" ") > 0) {
                    var parts = v.split(" ");
                    if (parts.length == 6) return Matrix.FromList(parts.map(p => parseFloat(p)));
                }
                return null;
            }
        }

        /**
         * A vectorial representation of the SVG matrix transformations.
         */
        export class MatrixVector {
            public a: number;
            public b: number;
            public c: number;
            public d: number;
            public e: number;
            public f: number;

            //constructor();
            constructor(a: number = null, b: number = null, c: number = null, d: number = null, e: number = null, f: number = null) {
                if (a != null) this.a = a;
                if (b != null) this.b = b;
                if (c != null) this.c = c;
                if (d != null) this.d = d;
                if (e != null) this.e = e;
                if (f != null) this.f = f;
            }

            /**
             * Returns a MatrixVector from the given Matrix values.
             * @param m A Matrix.
             */
            static FromMatrix(m: Matrix) {
                var v = new MatrixVector();
                v.a = m.a;
                v.b = m.b;
                v.c = m.c;
                v.d = m.d;
                v.e = m.e;
                v.f = m.f;
                return v;
            }
        }

        export class EllipseBase extends Visual {

            public get Opacity(): any {
                if (this.Native.attributes["fill-opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["fill-opacity"].value);
            }

            public set Opacity(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("fill-opacity", "1.0");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                    else this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                }
            }


            /**
             * Sets the stroke of the visual.
             */
            public set Stroke(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("stroke", "none");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("stroke", this.getColorString(value.call(this, this.DataContext)));
                    else this.Native.setAttribute("stroke", this.getColorString(value));
                }
            }

            /**
             * Gets the stroke color of this circle.
             */
            public get Stroke(): any {
                if (this.Native.attributes["stroke"] == null) return null;
                return this.Native.attributes["stroke"].value;
            }

            public get StrokeThickness(): any {
                if (this.Native.attributes["stroke-width"] == null) return 0.0;
                return parseFloat(this.Native.attributes["stroke-width"].value);
            }

            public set StrokeThickness(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("stroke-width", "0");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("stroke-width", value.call(this, this.DataContext));
                    else this.Native.setAttribute("stroke-width", value);
                }
            }

        }

        export class Ellipse extends EllipseBase {

            constructor(position?, width?, height?) {
                super();
                this.nativeElement = <SVGEllipseElement>document.createElementNS(NS, "ellipse");
                if (width)
                    this.Width = width;
                else
                    this.Width = 15;

                if (height)
                    this.Height = height;
                else
                    this.Height = 15;

                if (position) this.Position = position;
                this.Initialize();
            }
            public get Width() {
                return this.Native.rx.baseVal.value;
            }

            public set Width(v) {
                this.Native.rx.baseVal.value = v;
            }

            public get Height() {
                return this.Native.ry.baseVal.value;
            }

            public set Height(v) {
                this.Native.ry.baseVal.value = v;
            }

            /**
          * Gets the fill of the circle.
          */
            get Background() {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of the circle.
             */
            public set Background(v: any) {
                this.Native.style.fill = this.getColorString(v);
            }
            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGEllipseElement {
                return <SVGEllipseElement>this.nativeElement;
            }

            /**
           * Gets the center of the circle.
           */
            get Center(): any {
                return new TypeViz.Point(this.Native.cx.baseVal.value + this.Width, this.Native.cy.baseVal.value + this.Height);
            }

            /**
             * Sets the center of the circle.
             */
            set Center(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.cx.baseVal.value = -this.Width;
                    this.Native.cy.baseVal.value = -this.Height;
                }
                else {
                    var p;
                    if (typeof value === "function") {
                        p = value.call(this, this.DataContext);
                        if (!p) throw "The function did not return a Point.";
                    }
                    else p = value;

                    this.Native.cx.baseVal.value = p.X - this.Width;
                    this.Native.cy.baseVal.value = p.Y - this.Height;
                }
            }

            /**
            * Gets the position of the top-left of the circle.
            */
            get Position(): any {
                return new TypeViz.Point(this.Center.X - this.Width, this.Center.Y - this.Height);
            }

            /**
             * Sets the position of the top-left of the circle.
             */
            set Position(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.cx.baseVal.value = 0;
                    this.Native.cy.baseVal.value = 0;
                }
                else {
                    var p;
                    if (typeof value === "function") {
                        p = value.call(this, this.DataContext);
                        if (!p) throw "The function did not return a Point.";
                    }
                    else p = value;

                    this.Native.cx.baseVal.value = p.X + this.Width;
                    this.Native.cy.baseVal.value = p.Y + this.Height;
                }
            }
        }
        /**
       * A circle visual.
       */
        export class Circle extends EllipseBase {

            /**
             * Instantiates a new circle.
             * @param (position) Optional. The position of the circle.
             * @param (radius) Optional. The radius of the circle.
             */
            constructor(position?, radius?) {
                super();
                this.nativeElement = <SVGCircleElement>document.createElementNS(NS, "circle");
                if (radius)
                    this.Radius = radius;
                else
                    this.Radius = 15;
                if (position)
                    this.Position = position;
                this.Initialize();
            }

            /**
            * Gets the fill of the circle.
            */
            get Background() {
                return this.Native.style.fill;
            }

            /**
             * Sets the fill of the circle.
             */
            public set Background(v: any) {
                this.Native.style.fill = this.getColorString(v);
            }
            public get Opacity(): any {
                if (this.Native.attributes["fill-opacity"] == null) return 1.0;
                return parseFloat(this.Native.attributes["fill-opacity"].value);
            }

            public set Opacity(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.setAttribute("fill-opacity", "1.0");
                }
                else {
                    if (typeof value === "function") this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value.call(this, this.DataContext)));
                    else this.Native.setAttribute("fill-opacity", TypeViz.LimitValue(value));
                }
            }
            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGCircleElement {
                return <SVGCircleElement>this.nativeElement;
            }

            /**
             * Gets the radius of the circle.
             */
            get Radius(): any {
                return this.Native.r.baseVal.value;
            }

            /**
             * Sets the radius of the circle.
             */
            set Radius(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.r.baseVal.value = 0;
                }
                else {
                    if (typeof value === "function") this.Native.r.baseVal.value = TypeViz.LimitValue(value.call(this, this.DataContext), 0, 1000);
                    else this.Native.r.baseVal.value = TypeViz.LimitValue(value, 0, 1000);
                }
            }

            /**
             * Gets the center of the circle.
             */
            get Center(): any {
                return new TypeViz.Point(this.Native.cx.baseVal.value, this.Native.cy.baseVal.value);
            }

            /**
             * Sets the center of the circle.
             */
            set Center(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.cx.baseVal.value = 0;
                    this.Native.cy.baseVal.value = 0;
                }
                else {
                    var p;
                    if (typeof value === "function") {
                        p = value.call(this, this.DataContext);
                        if (!p) throw "The function did not return a Point.";
                    }
                    else p = value;

                    this.Native.cx.baseVal.value = p.X;
                    this.Native.cy.baseVal.value = p.Y;
                }
            }

            /**
             * Gets the position of the top-left of the circle.
             */
            get Position(): any {
                return new TypeViz.Point(this.Center.X - this.Radius, this.Center.Y - this.Radius);
            }

            /**
             * Sets the position of the top-left of the circle.
             */
            set Position(value: any) {
                if (TypeViz.IsUndefined(value)) {
                    this.Native.cx.baseVal.value = 0;
                    this.Native.cy.baseVal.value = 0;
                }
                else {
                    var p;
                    if (typeof value === "function") {
                        p = value.call(this, this.DataContext);
                        if (!p) throw "The function did not return a Point.";
                    }
                    else p = value;

                    this.Native.cx.baseVal.value = p.X + this.Radius;
                    this.Native.cy.baseVal.value = p.Y + this.Radius;
                }
            }

            get Height() {
                return 2 * this.Radius;
            }

            get Width() {
                return 2 * this.Radius;
            }

            private isDragging;
            private dragOffset;
            public Drag(action?: (p: Point, context) => void) {
                var ctx = this;

                if (!this.Canvas) throw "Add this visual first to the Canvas before calling this method.";
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
                    if (!ctx.isDragging) return;
                    ctx.Position = new TypeViz.Point(e.clientX + ctx.dragOffset.X, e.clientY + ctx.dragOffset.Y);
                    if (action) action(ctx.Position, ctx);
                });
                this.Canvas.MouseUp(function (e) {
                    ctx.isDragging = false;
                    ctx.Canvas.Native.setAttribute("cursor", 'default');
                });
            }


        }

        /**
         * Defines the options when instantiating a new SVG Canvas.
         */
        export class CanvasOptions {
            public Width = 1024;
            public Height = 768;
            public BackgroundColor = "Transparent";
        }
        export class FactoryEngine {
            private factory;
            private dataContext;
            private single;
            private dataSets: any[];
            private visuals: Array<Array<Visual>>;
            private canvas: TypeViz.SVG.Canvas;

            constructor(factory, dataContext, canvas) {
                this.factory = factory;
                this.dataContext = dataContext;
                this.single = !(this.factory instanceof Array);
                this.canvas = canvas;
                this.dataSets = [];
            }

            public Run() {
                this.prepare();
                this.create();
                this.bind();
            }

            private prepare() {
                if (this.single) {
                    this.factory = [this.factory];
                }
                for (var i = 0; i < this.factory.length; i++) {
                    this.access(i);
                }
            }

            private create() {
                this.visuals = [];
                for (var k = 0; k < this.factory.length; k++) {
                    var factor = this.factory[k];
                    if (!factor.creator) throw "No creator method found at index " + k + ".";
                    var series = <Array<Object>><Object>this.dataSets[k];
                    if (!series) throw "No data array found for factory at index " + k + ".";
                    var visualset = [];
                    for (var i = 0; i < series.length; i++) {
                        var item = series[i];
                        var visual = factor.creator.call(this, item, i, series);
                        if (!visual || !(visual instanceof Visual)) throw "No visual returned from creator at index " + i + ".";
                        this.canvas.Append(visual);
                        visualset.push(visual);
                    }
                    this.visuals.push(visualset);
                }
            }

            private bind() {
                for (var k = 0; k < this.factory.length; k++) {
                    var factor = this.factory[k];
                    if (!factor.binders) continue;
                    var visualset = this.visuals[k];
                    if (visualset.length == 0) continue;

                    for (var i = 0; i < visualset.length; i++) {
                        var visual = visualset[i];
                        factor.binders.call(this.canvas, visual, i);
                    }

                }
            }

            private access(index) {
                var factor = this.factory[index];
                if (!factor.accessor) return;
                var data = factor.accessor(this.dataContext);
                if (!data) throw "Accessor returned null dataset.";
                if (!(data instanceof Array)) throw "Accessor did not return an Array.";
                this.dataSets[index] = data;
            }

        }
        /**
         * Defines the root SVG surface inside which all visual things happen.
         */
        export class Canvas extends Visual {

            private HostElement: HTMLDivElement;
            public Position: Point;
            private markers: Array<Marker> = [];
            private gradients: Array<Media.LinearGradient> = [];
            private clipPaths: Array<ClipPath> = [];
            private defsNode = <SVGDefsElement>document.createElementNS(NS, "defs");
            private defsPresent: boolean = false;
            public Visuals: Array<Visual> = [];
            private canvasDataContext;
            public MousePosition(e: MouseEvent) {
                //var isShiftPressed = e.shiftKey;
                var currentPosition = new TypeViz.Point(e.pageX /*- this.pan.X*/, e.pageY /*- this.pan.Y*/);
                var node: HTMLElement = this.HostElement;
                // wished there was an easier way to do this
                while (node != null) {
                    currentPosition.X -= node.offsetLeft;
                    currentPosition.Y -= node.offsetTop;
                    node = <HTMLElement> node.offsetParent;
                }
                return currentPosition;
                /*this.currentPosition.X /= this.Zoom;
                this.currentPosition.Y /= this.Zoom;*/
            }
            /**
            Defines a factory on the Canvas bound to the underlying DataContext.
            */
            public Define(factory) {
                if (!factory) throw "No factory given";
                var engine = new FactoryEngine(factory, this.DataContext, this);
                engine.Run();
            }

            public get DataContext() {
                return this.canvasDataContext;
            }

            public set DataContext(value) {
                this.canvasDataContext = value;
            }


            /// defining this on the Visual level is somewhat problematic; SVG doesn't play well with the keyboard
            public set KeyPress(f: (ev: KeyboardEvent) => any) {
                this.HostElement.addEventListener("keypress", f);
                //this.HostElement.addEventListener("keypress", function (e: KeyboardEvent) { console.log("Pressed; " + e.charCode); });

            }

            public set KeyDown(f: (ev: KeyboardEvent) => any) {
                this.HostElement.addEventListener("keydown", f);
                //this.HostElement.addEventListener("keydown", function (e: KeyboardEvent) { console.log("Down; " + e.charCode); });
            }

            constructor(host: HTMLDivElement, options: CanvasOptions = new CanvasOptions()) {
                super();
                this.nativeElement = <SVGSVGElement>document.createElementNS(NS, "svg");
                this.nativeElement.setAttributeNS(NS, 'xlink', XLINKNS);
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

            public Focus() {
                this.HostElement.focus();
            }

            ///<summary>Inserts the actual SVG element in the HTML host.</summary>
            private InsertSVGRootElement(options: CanvasOptions) {
                this.HostElement.style.width = options.Width.toString();
                this.HostElement.style.height = options.Height.toString();
                this.Width = parseInt(options.Width.toString());
                this.Height = parseInt(options.Height.toString());
                this.Native.setAttribute("width", options.Width.toString());
                this.Native.setAttribute("height", options.Height.toString());
                this.Native.id = "SVGRoot";
                this.HostElement.appendChild(this.nativeElement);
            }
            /**
           * Gets the width of this rectangle.
           */
            get Width(): number {
                return this.Native.width.animVal.value;
            }

            /**
             * Sets the width of this rectangle.
             */
            set Width(value: number) {
                this.Native.setAttribute("width", value.toString());
            }

            /**
             * Gets the height of this rectangle.
             */
            get Height(): number {
                return this.Native.height.baseVal.value;
            }

            /**
             * Sets the height of this rectangle.
             */
            set Height(value: number) {
                this.Native.setAttribute("height", value.toString());
            }

            /**
             * Gets the nativeElement SVG element which this visual wraps.
             */
            public get Native(): SVGSVGElement {
                return <SVGSVGElement>this.nativeElement;
            }

            /**
             * Sets the nativeElement SVG element which this visual wraps.
             */
            public set Native(value: SVGSVGElement) {
                this.nativeElement = value;
            }

            /**
             * Appends the given visual to the canvas.
             Note that the Native property is used to do this.
             */
            public Append(shape: Visual) {
                this.Native.appendChild(shape.Native);
                shape.Canvas = <Canvas>this;
                if (shape["OnAppendToCanvas"] != null) shape["OnAppendToCanvas"](this);
                this.Visuals.push(shape);
                // in case the shape position was assigned before the shape was appended to the canvas.
                if (shape.Position) shape.Position = shape.Position;
                return <SVG.Canvas>this;
            }

            Remove(visual: Visual): Canvas {
                if (this.Visuals.indexOf(visual) >= 0) {
                    this.Native.removeChild(visual.Native);
                    if (visual["OnAppendToCanvas"] != null) visual["OnAppendToCanvas"](this);
                    visual.Canvas = null;
                    this.Visuals.Remove(visual);
                    return this;
                }
                return null;
            }

            InsertBefore(visual: Visual, beforeVisual: Visual) {
                this.Native.insertBefore(visual.Native, beforeVisual.Native);
                visual.Canvas = this;
                this.Visuals.push(visual);
                return this;
            }

            Prepend(visual: Visual) {

                this.Append(visual);
                this.SendToBack(visual);
            }

            SendToBack(visual: Visual) {
                if (this.Visuals.indexOf(visual) < 0) throw "The visual is not part of the canvas.";

                var element = visual.Native;
                if (element.previousSibling) {
                    element.parentNode.insertBefore(element, element.parentNode.firstChild);
                }
            }

            SendToFront(visual: Visual) {
                if (!this.Visuals.Contains(visual)) throw "The visual is not part of the canvas.";
                var element = visual.Native;
                element.parentNode.appendChild(element);
            }

            GetTransformedPoint(x: number, y: number) {
                var p = this.Native.createSVGPoint();
                p.x = x;
                p.y = y;
                return p.matrixTransform(this.Native.getScreenCTM().inverse());
            }

            /**
             * Returns the markers defined in this canvas.
             */
            public get Markers() {
                return this.markers;
            }

            /**
             * Returns the gradients defined in this canvas.
             */
            public get Gradients() {
                return this.gradients;
            }

            /**
             * Returns the clip paths defined in this canvas.
             */
            public get ClipPaths() {
                return this.clipPaths;
            }

            private ensureDefsNode() {
                if (this.defsPresent) return;
                if (this.nativeElement.childNodes.length > 0) this.Native.insertBefore(this.defsNode, this.Native.childNodes[0]);
                else this.Native.appendChild(this.defsNode);
                this.defsPresent = true;
            }

            /* Adds a marker to the definitions. */
            public AddMarker(marker: Marker) {
                this.ensureDefsNode();
                this.defsNode.appendChild(<SVGMarkerElement>marker.Native);
                this.markers.push(marker);
            }

            /**
             * Removes a marker from the definitions.
             */
            public RemoveMarker(marker: Marker) {
                if (marker == null) throw "The given Marker is null";
                if (!this.markers.Contains(marker)) throw "The given Marker is not part of the Canvas";
                this.defsNode.removeChild(<SVGMarkerElement>marker.Native);
                this.markers.Remove(marker);
            }

            /**
             * Removes a gradient from the definitions.
             */
            public RemoveGradient(gradient: Media.LinearGradient) {
                if (gradient == null) throw "The given Gradient is null";
                if (!this.gradients.Contains(gradient)) throw "The given Gradient is not part of the Canvas";
                this.defsNode.removeChild(<SVGLinearGradientElement>gradient.Native);
                this.gradients.Remove(gradient);
            }

            /**
             * Adds a gradient to the definitions.
             */
            public AddGradient(gradient: Media.LinearGradient) {
                this.ensureDefsNode();
                this.defsNode.appendChild(<SVGLinearGradientElement>gradient.Native);
                this.gradients.push(gradient);
            }

            public AddClipPath(clipPath: ClipPath) {
                this.ensureDefsNode();
                this.defsNode.appendChild(<SVGClipPathElement>clipPath.Native);
                this.clipPaths.push(clipPath);
            }

            public RemoveClipPath(clipPath: ClipPath) {
                this.ensureDefsNode();
                this.defsNode.removeChild(<SVGClipPathElement>clipPath.Native);
                this.clipPaths.Remove(clipPath);
            }

            public ClearMarkers() {
                if (this.markers.length == 0) return;
                //var toremove = [];
                //for (var i = 0; i < this.defsNode.childNodes.length; i++)
                //{
                //    var item = this.defsNode.childNodes[i];
                //    if (item.nodeName.toLowerCase() == "marker") toremove.push(item);
                //}
                //for (var i = 0; i < toremove.length; i++) this.defsNode.removeChild(toremove[i]);

                for (var i = 0; i < this.markers.length; i++)this.defsNode.removeChild(this.markers[i].Native);
                this.markers = [];
            }

            public ClearGradients() {
                if (this.gradients.length == 0) return;
                for (var i = 0; i < this.gradients.length; i++)this.defsNode.removeChild(this.gradients[i].Native);
                this.gradients = [];
            }

            /*Removes all the clip paths added to the canvas.*/
            public ClearClipPaths() {
                if (this.clipPaths.length == 0) return;
                for (var i = 0; i < this.clipPaths.length; i++)this.defsNode.removeChild(this.clipPaths[i].Native);
                this.clipPaths = [];
            }

            /*Removes all visuals, markers, clip paths... from this Canvas.*/
            public Clear() {
                this.ClearMarkers();
                this.ClearGradients();
                this.ClearClipPaths();
                while (this.Visuals.length > 0) {
                    this.Remove(this.Visuals[0]);
                }
            }

            /*Returns the child with the specified identifier.*/
            public GetId(id: string) {
                var first = Array.prototype.First;
                return first.call(this.Native.childNodes, function (c) { return c.id == id; });
            }

            /*Returns whether the given element is part of this canvas.*/
            public Contains(visual: Visual) { return this.Visuals.Contains(visual); }

            /*Fades in the given visual. It will be appended if not already part of this canvas.*/
            public FadeIn(visual: Visual, duration= 1500, complete?) {
                if (TypeViz.IsUndefined(visual)) throw "FadeIn cannot proceed, the given visual is null.";
                visual.Opacity = 0;
                if (!this.Contains(visual)) {
                    this.Append(visual);
                }
                visual.Change({ Opacity: 1, Duration: duration }, complete).Play();
            }
            public FadeOut(visual: Visual, remove= true, duration= 1500, complete?) {
                if (TypeViz.IsUndefined(visual)) throw "FadeOut cannot proceed, the given visual is null.";
                var c = this;
                visual.Change({ Opacity: 0, Duration: duration },
                    () => {
                        if (remove) {
                            c.Remove(visual);
                        }
                        if (TypeViz.IsDefined(complete)) {
                            complete(visual);
                        }
                    });
            }
        }

        /**
         * A collection of predefined markers.
         */
        export class Markers {
            /**
             * Gets a standard (sharp) arrow head marker pointing to the left.
             */
            public static get ArrowStart(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m0,50l100,40l-30,-40l30,-40z";
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "Arrow" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a standard (sharp) arrow head marker pointing to the right.
             */
            public static get ArrowEnd(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m100,50l-100,40l30,-40l-30,-40z";
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "Arrow" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a standard closed circle arrow head marker.
             */
            public static get FilledCircle(): Marker {
                var marker = new Marker();
                var circle = new SVG.Circle();
                circle.Radius = 30;
                circle.Center = new TypeViz.Point(50, 50);
                circle.StrokeThickness = 10;
                marker.Path = circle;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "FilledCircle" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a standard circle arrow head marker.
             */
            public static get Circle(): Marker {
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
                marker.Id = "Circle" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets an open start arrow marker.
             */
            public static get OpenArrowStart(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m0,50l100,40l-30,-40l30,-40l-100,40z";
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.Background = "none";
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "OpenArrowStart" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets an open end arrow marker.
             */
            public static get OpenArrowEnd(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m100,50l-100,40l30,-40l-30,-40z";
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.Background = "none";
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "OpenArrowEnd" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a filled diamond marker.
             */
            public static get FilledDiamond(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m20,20l0,60l60,0l0,-60l-60,0z";
                path.Transform(new Rotation(45, 50, 50));
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new Size(10, 10);
                marker.Id = "FilledDiamond" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a diamond marker.
             */
            public static get Diamond(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m20,20l0,60l60,0l0,-60l-60,0z";
                path.Transform(new Rotation(45, 50, 50));
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.Background = "none";
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "Diamond" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a wedge start marker.
             */
            public static get WedgeStart(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m0,50l100,40l-94,-40l94,-40l-100,40z";
                // path.Transform(new Rotation(45, 50, 50));
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new Size(10, 10);
                marker.Id = "WedgeStart" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a wedge end marker.
             */
            public static get WedgeEnd(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m0,50l100,40l-94,-40l94,-40l-100,40z";
                path.Transform(new Rotation(180, 50, 50));
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new TypeViz.Size(10, 10);
                marker.Id = "WedgeEnd" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

            /**
             * Gets a square end marker.
             */
            public static get Square(): Marker {
                var marker = new Marker();
                var path = new PathBase();
                path.Data = "m20,20l0,60l60,0l0,-60z";
                path.StrokeThickness = 10;
                marker.Path = path;
                marker.ViewBox = new TypeViz.Rect(0, 0, 100, 100);
                marker.Size = new Size(10, 10);
                marker.Id = "Square" + RandomId();
                marker.Ref = new TypeViz.Point(50, 50);
                marker.Orientation = MarkerOrientation.Auto;
                marker.MarkerUnits = MarkerUnits.StrokeWidth;
                return marker;
            }

        }

        /**
         * The arc visual.
         */
        export class Arc extends PathBase {
            private innerRadius = 30;
            private outerRadius = 100;
            private startAngle = 0;
            private endAngle = Math.PI;
            private center = new TypeViz.Point(0, 0);
            private arcMax = 2 * Math.PI - 1e-6;
            private arcOffset = -Math.PI / 2;

            constructor() {
                super();
                this.updateData();
            }

            public get Center() {
                return this.center;
            }

            public set Center(v) {
                this.center = v;
                this.updateData();
            }

            public get InnerRadius(): number {
                return this.innerRadius;
            }

            public set InnerRadius(value: number) {
                this.innerRadius = value;
                this.updateData();
            }

            public get OuterRadius(): number {
                return this.outerRadius;
            }

            public set OuterRadius(value: number) {
                this.outerRadius = value;
                this.updateData();
            }

            public get StartAngle(): number {
                return this.startAngle;
            }

            public set StartAngle(value: number) {
                this.startAngle = value;
                this.updateData();
            }

            public get EndAngle(): number {
                return this.endAngle;
            }

            public set EndAngle(value: number) {
                this.endAngle = value;
                this.updateData();
            }

            private updateData() {
                this.Position = this.Center; // due to the way the pathdata is constructed below
                var r0 = this.innerRadius,
                    r1 = this.outerRadius,
                    a0 = this.startAngle + this.arcOffset,
                    a1 = this.endAngle + this.arcOffset,
                    da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0),
                    df = da < Math.PI ? "0" : "1",
                    c0 = Math.cos(a0),
                    s0 = Math.sin(a0),
                    c1 = Math.cos(a1),
                    s1 = Math.sin(a1);
                this.Data = da >= this.arcMax
                ? (r0
                ? "M0," + r1
                + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1)
                + "A" + r1 + "," + r1 + " 0 1,1 0," + r1
                + "M0," + r0
                + "A" + r0 + "," + r0 + " 0 1,0 0," + (-r0)
                + "A" + r0 + "," + r0 + " 0 1,0 0," + r0
                + "Z"
                : "M0," + r1
                + "A" + r1 + "," + r1 + " 0 1,1 0," + (-r1)
                + "A" + r1 + "," + r1 + " 0 1,1 0," + r1
                + "Z")
                : (r0
                ? "M" + r1 * c0 + "," + r1 * s0
                + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1
                + "L" + r0 * c1 + "," + r0 * s1
                + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0
                + "Z"
                : "M" + r1 * c0 + "," + r1 * s0
                + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1
                + "L0,0"
                + "Z");
            }


        }

        /**
         * Collects the path interpolators available.
         */
        export module Interpolators {

            /**
            * A linear interpolations between the given points.
            */
            export function LinearInterpolator(points, options) {
                if (options != null && options.IsClosed)
                    return points.join("L") + "Z";
                else
                    return points.join("L");
            }

            /**
            * A step-rectangular interpolation.
            */
            export function LineStepInterpolator(points, options) {
                var i = 0,
                    n = points.length,
                    p = points[0],
                    path = [p[0], ",", p[1]];
                while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
                if (n > 1) path.push("H", p[0]);
                return path.join("");
            }

            /**
            * A cordinal spline interpolation of the given points.
            */
            export function CardinalInterpolator(points, options) {

                return points.length < 3
                    ? LinearInterpolator(points, null)
                    : points[0] + HermiteSpline(points,
                        CardinalTangents(points, options));
            }

            /**
            * A spline interpolation of the given points.
            */
            export function SplineInterpolator(points, options) {
                if (points.length < 3) return LinearInterpolator(points, null);
                var i = 1,
                    n = points.length,
                    pi = points[0],
                    x0 = pi[0],
                    y0 = pi[1],
                    px = [x0, x0, x0, (pi = points[1])[0]],
                    py = [y0, y0, y0, pi[1]],
                    path = [x0, ",", y0, "L", DotProduct(bezierVector3, px), ",", DotProduct(bezierVector3, py)];
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

            function CardinalTangents(points, options) {

                var tangents = [],
                    a = (1 - options.Tension) / 2,
                    p0,
                    p1 = points[0],
                    p2 = points[1],
                    i = 1,
                    n = points.length;
                while (++i < n) {
                    p0 = p1;
                    p1 = p2;
                    p2 = points[i];
                    tangents.push([a * (p2[0] - p0[0]), a * (p2[1] - p0[1])]);
                }
                return tangents;
            };

            function DotProduct(a, b) {
                return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
            }

            function BezierBasis(path, x, y) {
                path.push(
                    "C", DotProduct(bezierVector1, x),
                    ",", DotProduct(bezierVector1, y),
                    ",", DotProduct(bezierVector2, x),
                    ",", DotProduct(bezierVector2, y),
                    ",", DotProduct(bezierVector3, x),
                    ",", DotProduct(bezierVector3, y));
            }

            function HermiteSpline(points, tangents) {
                if (tangents.length < 1 || (points.length != tangents.length && points.length != tangents.length + 2)) {
                    return LinearInterpolator(points, null);
                }
                var quad = points.length != tangents.length,
                    path = "",
                    p0 = points[0],
                    p = points[1],
                    t0 = tangents[0],
                    t = t0,
                    pi = 1;

                if (quad) {
                    path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3)
                    + "," + p[0] + "," + p[1];
                    p0 = points[1];
                    pi = 2;
                }

                if (tangents.length > 1) {
                    t = tangents[1];
                    p = points[pi];
                    pi++;
                    path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1])
                    + "," + (p[0] - t[0]) + "," + (p[1] - t[1])
                    + "," + p[0] + "," + p[1];
                    for (var i = 2; i < tangents.length; i++, pi++) {
                        p = points[pi];
                        t = tangents[i];
                        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1])
                        + "," + p[0] + "," + p[1];
                    }
                }

                if (quad) {
                    var lp = points[pi];
                    path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3)
                    + "," + lp[0] + "," + lp[1];
                }

                return path;
            }

            var bezierVector1 = [0, 2 / 3, 1 / 3, 0],
                bezierVector2 = [0, 1 / 3, 2 / 3, 0],
                bezierVector3 = [0, 1 / 6, 2 / 3, 1 / 6];
        }

        /**
         * The default interpolation options.
         */
        export var DefaultInterpolationOptions = {
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
        export function Interpolate(options?) {

            options = options == null ? DefaultInterpolationOptions : MergeOptions(DefaultInterpolationOptions, options);
            var x = options.xProjector,
                y = options.yProjector,
                projection = options.projection,
                defined = TypeViz.TrueFunction,
                interpolate = options.Interpolator;


            function line(data: any[]): string {
                var segments = [],
                    points = [],
                    i = -1,
                    n = data.length,
                    d,
                    fx = Functor(x),
                    fy = Functor(y);

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

                if (points.length) segment();

                return segments.length ? segments.join("") : null;
            }

            return line;
        }

        /**
         * Cursors predefined in SVG.
         */
        export enum Cursors {
            CrossHair = 0,
            Default = 1,
            Pointer = 2,
            Move = 3,
            EastResize = 4,
            NorthEastResize = 5,
            NorthWestResize = 6,
            NorthResize = 7,
            SouthEastResize = 8,
            SouthWestResize = 9,
            SouthResize = 10,
            WestResize = 11,
            Text = 12,
            Wait = 13,
            Help = 14
        }
    }
}