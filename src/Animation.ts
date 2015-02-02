/** 
    Copyright (c) 2007-2014, Orbifold bvba.
 
    For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/

/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="SVG.ts" />
/// <reference path="Arrays.ts" />
///<reference path='Structures.ts' />
///<reference path='Media.ts' />
module TypeViz {
    /*Animation mechanics.*/
    export module Animation {
        import Point = TypeViz.Point;

        export class Animator {
            private currentStory: Ticker;
            private subjects: Array<TypeViz.SVG.Visual> = [];
            private stories: Array<Ticker> = [];
            private currentStoryIndex = -1;
            private doloop = false;

            constructor(subjects: Array<TypeViz.SVG.Visual>) {
                for (var i = 0; i < subjects.length; i++) {
                    this.subjects.push(subjects[i]);
                }
            }

            public Change(to, complete?) {
                var ticker = new Ticker();
                if (to.Easing) {
                    ticker.Easing = to.Easing();
                }
                if (to.Duration) {
                    ticker.Duration = to.Duration;
                    delete to.Duration;
                }
                var adapter = new GenericAdapter(this.subjects, to, null);
                ticker.AddAdapter(adapter);
                this.stories.push(ticker);
                if (complete) {
                    ticker.onComplete(complete);
                }
                return this;
            }

            public moveTo(p) {

                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.PositionAdapter(this.subjects, "", null, p, null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            }

            public changeOpacity(v) {

                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.NumericalStyleAdapter(this.subjects, "Opacity", 1, 0, null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            }

            public changeAngle(a) {
                var ticker = new Ticker();
                var adapter = new TypeViz.Animation.NumericalStyleAdapter(this.subjects, "EndAngle", Math.PI, a, null);
                ticker.AddAdapter(adapter);
                this.stories.push(ticker);
                return this;
            }

            public changeColor(color) {

                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.ColorStyleAdapter(this.subjects, "Background", "#FF0000", "#00FF00", null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            }

            public Play() {
                if (this.subjects.length == 0 || this.stories.length == 0) return;
                this.currentStoryIndex = -1;
                this.next();
            }

            public loop() {
                this.doloop = true;
                return this;
            }

            nextHandler() {
                this.next();
            }

            next() {
                if (this.currentStory != null) {
                    this.currentStory.removeHandler(this.nextHandler);
                }
                if (this.currentStoryIndex < this.stories.length - 1) {
                    this.currentStoryIndex++;
                    this.currentStory = this.stories[this.currentStoryIndex];
                    this.currentStory.onComplete(this.nextHandler);
                    this.currentStory.init();
                    this.currentStory.play(this);
                    return;
                }
                if (this.doloop) {
                    this.Play();
                }
            }

            /**
             * Clears the list of stories accumulated .
             */
            public Clear() {
                this.currentStory = null;
                this.currentStoryIndex = -1;
                this.stories.Clear();
            }
        }

        export class AdapterBase {
            constructor() {
            }

            public Update(t) {
            }

            public init() {
            }

            private rgbRe = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
            private hexRe = /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

            makeArrayOfElements(o) {
                if (o == null) return [];
                if ("string" == typeof o) return [document.getElementById(o)];

                if (!o.length) return [o];
                var result = [];
                for (var i = 0; i < o.length; i++) {
                    if ("string" == typeof o[i]) {
                        result[i] = document.getElementById(o[i]);
                    } else {
                        result[i] = o[i];
                    }
                }
                return result;
            }



            // return a properly formatted 6-digit hex colour spec, or false
            parseColor(s) {
                var color = '#', match;
                var i;
                if (match = this.rgbRe.exec(s)) {
                    var part;
                    for (i = 1; i <= 3; i++) {
                        part = Math.max(0, Math.min(255, parseInt(match[i])));
                        color += this.toColorPart(part);
                    }
                    return color;
                }
                if (match = this.hexRe.exec(s)) {
                    if (match[1].length == 3) {
                        for (i = 0; i < 3; i++) {
                            color += match[1].charAt(i) + match[1].charAt(i);
                        }
                        return color;
                    }
                    return '#' + match[1];
                }
                return "";
            }

            // convert a number to a 2 digit hex string
            toColorPart(n) {
                if (n > 255) n = 255;
                var digits = n.toString(16);
                if (n < 16) return '0' + digits;
                return digits;
            }
        }

        export class NumericalStyleAdapter extends AdapterBase {
            private property;
            private from;
            private to;
            private subjects;
            private units;

            constructor(subjects, property, from, to, options) {
                super();
                this.subjects = this.makeArrayOfElements(subjects);
                if (property == 'opacity' && window["ActiveXObject"]) {
                    this.property = 'filter';
                } else {
                    this.property = TypeViz.Camelize(property);
                }
                this.from = parseFloat(from);
                this.to = parseFloat(to);
                this.units = options.units != null ? options.units : 'px';
            }

            Update(tick) {
                var style = this.GetPropertyValue(tick);
                var visibility = (this.property == 'opacity' && tick == 0) ? 'hidden' : '';
                for (var i = 0; i < this.subjects.length; i++) {
                    try {
                        if ((<SVG.Visual>this.subjects[i]) != null) {
                            if (this.subjects[i][this.property] !== null) {
                                this.subjects[i][this.property] = parseFloat(style.toString());
                            }
                        }
                        else {
                            if (this.subjects[i].style[this.property] !== null)
                                this.subjects[i].style[this.property] = style;
                            else if (this.subjects[i][this.property] !== null) {
                                var animl = <SVGAnimatedLength>this.subjects[i][this.property];
                                if (animl) {
                                    animl.baseVal.value = parseFloat(style.toString());
                                }
                            }
                        }
                    } catch (e) {
                        // ignore fontWeight - intermediate numerical values cause exeptions in firefox
                        if (this.property != 'fontWeight') throw e;
                    }
                }
            }

            GetPropertyValue(tick) {
                tick = this.from + ((this.to - this.from) * tick);
                if (this.property == 'filter') return "alpha(opacity=" + Math.round(tick * 100) + ")";
                if (this.property == 'Opacity') return tick;
                return tick + this.units;
            }

            inspect() {
                return "\t" + this.property + "(" + this.from + this.units + " to " + this.to + this.units + ")\n";
            }

        }

        export class ColorStyleAdapter extends AdapterBase {
            constructor(subjects, property, from, to, options) {
                super();
                this.subjects = this.makeArrayOfElements(subjects);
                this.property = TypeViz.Camelize(property);
                this.to = this.expandColor(to);
                this.from = this.expandColor(from);
                this.origFrom = from;
                this.origTo = to;
            }

            private subjects;
            private property;
            private from;
            private to;
            private origFrom;
            private origTo;


            // parse "#FFFF00" to [256, 256, 0]
            expandColor(color) {
                var hexColor, red, green, blue;
                hexColor = this.parseColor(color);
                if (hexColor) {
                    red = parseInt(hexColor.slice(1, 3), 16);
                    green = parseInt(hexColor.slice(3, 5), 16);
                    blue = parseInt(hexColor.slice(5, 7), 16);
                    return [red, green, blue];
                }
                return null;
            }

            getValueForState(color, tick) {
                return Math.round(this.from[color] + ((this.to[color] - this.from[color]) * tick));
            }

            Update(tick) {
                var color = '#'
                    + this.toColorPart(this.getValueForState(0, tick))
                    + this.toColorPart(this.getValueForState(1, tick))
                    + this.toColorPart(this.getValueForState(2, tick));
                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i][this.property] = color;
                }
            }

            inspect() {
                return "\t" + this.property + "(" + this.origFrom + " to " + this.origTo + ")\n";
            }
        }

        export class DiscreteStyleAdapter extends AdapterBase {
            private subjects;
            private property;
            private from;
            private to;
            private threshold;

            constructor(subjects, property, from, to, options) {
                super();
                this.subjects = this.makeArrayOfElements(subjects);
                this.property = TypeViz.Camelize(property);
                this.from = from;
                this.to = to;
                this.threshold = options.threshold || 0.5;
            }


            Update(tick) {

                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i].style[this.property] = tick <= this.threshold ? this.from : this.to;
                }
            }

            inspect() {
                return "\t" + this.property + "(" + this.from + " to " + this.to + " @ " + this.threshold + ")\n";
            }
        }

        export class PositionAdapter extends AdapterBase {
            private targets: Array<TypeViz.SVG.Visual> = [];
            private froms: Array<Point> = [];
            private tos: Array<Point> = [];
            private from;
            private to;
            private useCenter;
            constructor(targets, property, from, to, options?) {
                super();
                this.targets = targets;
                this.from = from;
                this.to = to;
                if (options && options["UseCenter"]) this.useCenter = options["UseCenter"];
                else this.useCenter = false;
            }

            public init() {
                this.froms = [];
                this.tos = [];

                for (var i = 0; i < this.targets.length; i++) {
                    if (this.from == null)
                        this.froms[i] = this.targets[i].Position;
                    else {
                        this.froms[i] = (this.from != null && this.from instanceof TypeViz.Point) ? this.from : this.from(this.targets[i]);
                    }
                    this.tos[i] = (this.to != null && this.to instanceof TypeViz.Point) ? this.to : this.to(this.targets[i]);
                }
            }

            public Update(t) {
                if (this.targets.length > 0) {

                    for (var i = 0; i < this.targets.length; i++) {
                        var p = new TypeViz.Point(this.froms[i].X + (this.tos[i].X - this.froms[i].X) * t, this.froms[i].Y + (this.tos[i].Y - this.froms[i].Y) * t);
                        this.useCenter ? this.targets[i]["Center"] = p : this.targets[i].Position = p;
                    }
                }
            }

        }

        export class DataAdapter extends AdapterBase {
            private targets: Array<TypeViz.SVG.Path> = [];
            private froms: Array<Array<number>> = [];
            private tos: Array<Array<number>> = [];
            private from;
            private to;
            private lerp;

            constructor(targets, property, from, to, options) {
                super();
                this.targets = targets;
                this.from = from;
                this.to = to;
            }

            public init() {
                this.froms = [];
                this.tos = [];
                this.lerp = [];
                for (var i = 0; i < this.targets.length; i++) {
                    if (this.from == null)
                        this.froms[i] = TypeViz.Point.ToArray(this.targets[i].Points);
                    else {
                        throw "Check again Swa.";
                        //this.froms[i] = (this.from != null && this.from instanceof Point) ? this.from : this.from(this.targets[i]);
                    }
                    if (TypeViz.IsFunction(this.to)) throw "Functions not handled yet";
                    this.tos[i] = TypeViz.Point.ToArray(this.to);
                    this.lerp[i] = Arrays.InterpolateArrays(this.froms[i], this.tos[i]);
                }
            }

            public Update(t) {
                if (this.targets.length > 0) {

                    for (var i = 0; i < this.targets.length; i++) {
                        this.targets[i].Points = this.lerp[i](t);
                    }
                }
            }
        }

        export class GenericAdapter extends AdapterBase {

            private PropertyValueAssignmentRegex = /^\s*([a-zA-Z\-]+)\s*:\s*(\S(.+\S)?)\s*$/; // "prop: value"
            private NumberRegex = /^-?\d+(?:\.\d+)?(%|[a-zA-Z]{2})?$/;
            private DiscreteRegex = /^\w+$/;

            private adapters = [];

            private style2;
            private fromStyle;
            private toStyle;
            private options;
            private subjects = [];

            public init() {
                var prop;

                // could set the origin style via parameter

                this.toStyle = this.style2;
                this.fromStyle = {};
                for (prop in this.toStyle) {
                    this.fromStyle[prop] = this.getStyle(this.subjects[0], prop);
                }

                for (prop in this.fromStyle) {
                    if (this.fromStyle[prop] == this.toStyle[prop]) {
                        delete this.fromStyle[prop];
                        delete this.toStyle[prop];
                    }
                }
                function formatPoints(prepoints: any) {
                    if (TypeViz.IsUndefined(prepoints)) return null;
                    var points;
                    if (TypeViz.IsArray(prepoints)) {
                        if (prepoints.length == 0) {
                            points = [];
                        } else {
                            if (prepoints[0] instanceof TypeViz.Point) {
                                points = TypeViz.Point.ToArray(prepoints);
                            } else
                                points = prepoints;
                        }
                    }
                    else if (TypeViz.IsFunction(prepoints)) {
                        throw "Not implemented yet.";
                    }
                    ;
                    return points;
                }

                // discover the type (numerical or colour) of each style
                var units, match, type, from, to;
                for (prop in this.fromStyle) {
                    var fromValue = String(this.fromStyle[prop]);
                    var toValue = String(this.toStyle[prop]);
                    if (this.toStyle[prop] == null) {
                        if (window["ANIMATOR_DEBUG"]) alert("No target property provided for '" + prop + '"');
                        continue;
                    }

                    //----------------------------------------------------------------

                    if (prop == "Data") {

                        from = formatPoints(this.fromStyle[prop]);
                        to = formatPoints(this.toStyle[prop]);
                        type = Animation.DataAdapter;
                    }
                    else if (prop == "Position") {
                        from = this.fromStyle[prop];
                        to = this.toStyle[prop];
                        type = Animation.PositionAdapter;
                    }
                    else if (prop == "Center") {
                        from = this.fromStyle[prop];
                        to = this.toStyle[prop];
                        type = Animation.PositionAdapter;
                        this.options["UseCenter"] = true;
                    }
                    else if (from = this.parseColor(fromValue)) {
                        to = this.parseColor(toValue);
                        type = Animation.ColorStyleAdapter;
                    } else if (fromValue.match(this.NumberRegex) && toValue.match(this.NumberRegex)) {
                        from = parseFloat(fromValue);
                        to = parseFloat(toValue);
                        type = Animation.NumericalStyleAdapter;
                        match = this.NumberRegex.exec(fromValue);
                        var reResult = this.NumberRegex.exec(toValue);
                        if (match[1] != null) {
                            units = match[1];
                        } else if (reResult[1] != null) {
                            units = reResult[1];
                        } else {
                            units = '';
                        }
                    } else if (fromValue.match(this.DiscreteRegex) && toValue.match(this.DiscreteRegex)) {
                        from = fromValue;
                        to = toValue;
                        type = Animation.DiscreteStyleAdapter;
                        units = 0;
                    } else {
                        if (window["ANIMATOR_DEBUG"]) alert("Unrecognised format for value of " + prop + ": '" + this.fromStyle[prop] + "'");
                        continue;
                    }

                    //----------------------------------------------------------------
                    this.options.units = units;
                    this.adapters[this.adapters.length] = new type(this.subjects, prop, from, to, this.options);
                }
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].init();
                }
            }


            Update(tick) {
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].Update(tick);
                }
            }

            // required because the style object of subjects isn't enumerable in Safari
            /*
             CSSStyleSubject.cssProperties = ['background-color','border','border-color','border-spacing',
             'border-style','border-top','border-right','border-bottom','border-left','border-top-color',
             'border-right-color','border-bottom-color','border-left-color','border-top-width','border-right-width',
             'border-bottom-width','border-left-width','border-width','bottom','color','font-size','font-size-adjust',
             'font-stretch','font-style','height','left','letter-spacing','line-height','margin','margin-top',
             'margin-right','margin-bottom','margin-left','marker-offset','max-height','max-width','min-height',
             'min-width','orphans','outline','outline-color','outline-style','outline-width','overflow','padding',
             'padding-top','padding-right','padding-bottom','padding-left','quotes','right','size','text-indent',
             'top','width','word-spacing','z-index','opacity','outline-offset'];*/

            private cssProperties = ['azimuth', 'background', 'background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat', 'border-collapse', 'border-color', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-width', 'bottom', 'clear', 'clip', 'color', 'content', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'css-float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'max-height', 'max-width', 'min-height', 'min-width', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'pause', 'position', 'right', 'size', 'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'top', 'vertical-align', 'visibility', 'white-space', 'width', 'word-spacing', 'z-index', 'opacity', 'outline-offset', 'overflow-x', 'overflow-y'];
            private defaultOptions = {
                units: '',
                Interpolator: TypeViz.SVG.Interpolators.LinearInterpolator,
                threshold: 0.5,
                Easing: TypeViz.Animation.Easing.EaseInOut
            };

            constructor(subjects, style2, options?) {
                super();
                this.options = TypeViz.MergeOptions(this.defaultOptions, options);
                this.subjects = this.makeArrayOfElements(subjects);
                this.adapters = [];
                if (this.subjects.length == 0) return;

                this.style2 = style2;

                // todo: remove unchanging properties
            }


            // parses "width: 400px; color: #FFBB2E" to {width: "400px", color: "#FFBB2E"}
            parseStyle(style, el) {
                var rtn = {};
                // if style is a rule set
                var i;
                if (style.indexOf(":") != -1) {
                    var styles = style.split(";");
                    for (i = 0; i < styles.length; i++) {
                        var parts = this.PropertyValueAssignmentRegex.exec(styles[i]);
                        if (parts.length > 0) {
                            rtn[parts[1]] = parts[2];
                        }
                    }
                }
                // else assume style is a class name
                else {
                    var prop, value, oldClass;
                    oldClass = el.className;
                    el.className = style;
                    for (i = 0; i < this.cssProperties.length; i++) {
                        prop = this.cssProperties[i];
                        value = this.getStyle(el, prop);
                        if (value != null) {
                            rtn[prop] = value;
                        }
                    }
                    el.className = oldClass;
                }
                return rtn;

            }

            inspect() {
                var str = "";
                for (var i = 0; i < this.adapters.length; i++) {
                    str += this.adapters[i].inspect();
                }
                return str;
            }

            // get the current value of a css property, 
            getStyle = (el, property) => el[property] /*var style;
                 var view = <ViewCSS><Object>document.defaultView;
                 if (view && view.getComputedStyle) {
                 style = view.getComputedStyle(el, "").getPropertyValue(property);
                 if (style) {
                 return style;
                 }
                 }
                 property = this.camelize(property);
                 if (el.currentStyle) {
                 style = el.currentStyle[property];
                 }
                 return style || el.style[property]*/;
        }

        export class Ticker {
            private adapters: Array<AdapterBase> = [];
            private target = 0;
            private tick = 0;
            private interval = 20;
            private duration = 1000;
            private lastTime = null;
            private easingFunction;
            private intervalId;
            private handlers: Array<TypeViz.IAction<void>> = [];
            private timerDelegate;
            private caller;
            private forward = true;
            private isLooping = false;
            public get Easing() { return this.easingFunction; }
            public set Easing(value) {
                if (TypeViz.IsUndefined(value)) throw "The easing function cannot be undefined.";
                this.easingFunction = value;
            }
            public get Duration() { return this.duration; }
            public set Duration(value) { this.duration = value; }

            constructor() {
                this.easingFunction = Easing.EaseInOut();
                this.timerDelegate = () => { this.onTimerEvent(); };
            }

            AddAdapter(a: AdapterBase) {
                this.adapters.push(a);
            }

            public onComplete(handler: TypeViz.IAction<void>) {
                this.handlers.push(handler);
            }

            public removeHandler(handler: TypeViz.IAction<void>) {
                this.handlers = this.handlers.filter(h => h !== handler);
            }

            public trigger() {
                if (this.handlers) {
                    this.handlers.ForEach(h => h.call(this.caller != null ? this.caller : this));
                }
            }

            onStep() {
            }


            // animate from the current tick to provided value
            seekTo(to) {
                this.forward = this.tick < to;
                this.seekFromTo(this.tick, to);
            }

            // animate from the current tick to provided value
            seekFromTo(from, to) {
                this.forward = from < to;
                this.target = Math.max(0, Math.min(1, to));
                this.tick = Math.max(0, Math.min(1, from));
                this.lastTime = new Date().getTime();
                if (!this.intervalId) {
                    this.intervalId = window.setInterval(this.timerDelegate, this.interval);
                }
            }

            stop() {
                if (this.intervalId) {
                    window.clearInterval(this.intervalId);
                    this.intervalId = null;
                    this.trigger();
                }
            }

            play(origin?) {
                this.forward = true;
                this.isLooping = false;
                if (this.adapters.length == 0) return;
                if (origin != null) this.caller = origin;
                this.seekFromTo(0, 1);
            }
            public Loop(origin?) {
                this.forward = true;
                this.isLooping = true;
                if (this.adapters.length == 0) return;
                if (origin != null) this.caller = origin;
                this.seekFromTo(0, 1);
            }
            reverse() {
                if (this.forward) this.seekFromTo(1, 0);
                else this.seekFromTo(0, 1);
            }

            init() {
                if (this.adapters.length == 0) return;
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].init();
                }
            }

            // forward the current tick to the animation adapters
            propagate() {
                var value = this.easingFunction(this.tick);
                /* if (this.adapters[this.currentAdapter].Update) {
                 this.adapters[this.currentAdapter].Update(value);
                 } else {
                 this.adapters[this.currentAdapter](value);
                 }*/
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].Update(value);
                }

            }

            // called once per frame to update the current tick
            onTimerEvent() {
                var now = new Date().getTime();
                var timePassed = now - this.lastTime;
                this.lastTime = now;
                var movement = (timePassed / this.duration) * (this.tick < this.target ? 1 : -1);
                if (Math.abs(movement) >= Math.abs(this.tick - this.target)) {
                    this.tick = this.target;
                } else {
                    this.tick += movement;
                }

                try {
                    this.propagate();
                }
                finally {
                    this.onStep.call(this);
                    if (this.target == this.tick) {
                        if (this.isLooping) this.reverse();
                        else this.stop();
                    }
                }
            }
        }

        /*Easing functions.*/
        export class Easing {

            public static EaseInOut() { return Easing.makeEaseInOut(); }

            public static Linear() { return tick => tick; }

            public static Elastic(times?) {
                if (TypeViz.IsUndefined(times)) times = 2;
                return Easing.makeElastic(times);
            }

            public static EaseIn() {
                return Easing.makeEaseIn(1.5);
            }

            public static EaseOut() {
                return Easing.makeEaseOut(1.5);
            }

            public static StrongEaseIn() {
                return Easing.makeEaseIn(2.5);
            }

            public static StrongEaseOut() {
                return Easing.makeEaseOut(2.5);
            }

            public static VeryElastic() {
                return Easing.makeElastic(3);
            }

            public static Bouncy() {
                return Easing.makeBounce(1);
            }

            public static VeryBouncy() {
                return Easing.makeBounce(3);
            }

            static makeEaseIn(a) {
                return tick=> Math.pow(tick, a * 2);
            }

            static makeEaseOut(a) {
                return tick=> 1 - Math.pow(1 - tick, a * 2);
            }

            static makeEaseInOut() {
                return tick=> ((-Math.cos(tick * Math.PI) / 2) + 0.5);
            }

            static makeElastic(bounces) {
                return tick=> {

                    tick = Easing.makeEaseInOut()(tick);
                    return ((1 - Math.cos(tick * Math.PI * bounces)) * (1 - tick)) + tick;
                };
            }

            /*Attack Decay Sustain Release  */
            makeADSR(attackEnd, decayEnd, sustainEnd, sustainLevel) {
                if (sustainLevel == null) sustainLevel = 0.5;
                return tick=> {
                    if (tick < attackEnd) {
                        return tick / attackEnd;
                    }
                    if (tick < decayEnd) {
                        return 1 - ((tick - attackEnd) / (decayEnd - attackEnd) * (1 - sustainLevel));
                    }
                    if (tick < sustainEnd) {
                        return sustainLevel;
                    }
                    return sustainLevel * (1 - ((tick - sustainEnd) / (1 - sustainEnd)));
                };
            }

            static makeBounce(bounces) {
                var fn = Easing.makeElastic(bounces);
                return tick=> {
                    tick = fn(tick);
                    return tick <= 1 ? tick : 2 - tick;
                };
            }
        }
    }
}