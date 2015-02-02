/**
Copyright (c) 2007-2014, Orbifold bvba.
For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Model.ts" />
/// <reference path="Maths.ts" />
/// <reference path="SVG.ts" />
/// <reference path="Arrays.ts" />
///<reference path='Structures.ts' />
///<reference path='Media.ts' />
var TypeViz;
(function (TypeViz) {
    /*Animation mechanics.*/
    (function (Animation) {
        var Animator = (function () {
            function Animator(subjects) {
                this.subjects = [];
                this.stories = [];
                this.currentStoryIndex = -1;
                this.doloop = false;
                for (var i = 0; i < subjects.length; i++) {
                    this.subjects.push(subjects[i]);
                }
            }
            Animator.prototype.Change = function (to, complete) {
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
            };

            Animator.prototype.moveTo = function (p) {
                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.PositionAdapter(this.subjects, "", null, p, null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            };

            Animator.prototype.changeOpacity = function (v) {
                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.NumericalStyleAdapter(this.subjects, "Opacity", 1, 0, null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            };

            Animator.prototype.changeAngle = function (a) {
                var ticker = new Ticker();
                var adapter = new TypeViz.Animation.NumericalStyleAdapter(this.subjects, "EndAngle", Math.PI, a, null);
                ticker.AddAdapter(adapter);
                this.stories.push(ticker);
                return this;
            };

            Animator.prototype.changeColor = function (color) {
                var ticker = new Ticker();

                var adapter = new TypeViz.Animation.ColorStyleAdapter(this.subjects, "Background", "#FF0000", "#00FF00", null);

                ticker.AddAdapter(adapter);
                this.stories.push(ticker);

                return this;
            };

            Animator.prototype.Play = function () {
                if (this.subjects.length == 0 || this.stories.length == 0)
                    return;
                this.currentStoryIndex = -1;
                this.next();
            };

            Animator.prototype.loop = function () {
                this.doloop = true;
                return this;
            };

            Animator.prototype.nextHandler = function () {
                this.next();
            };

            Animator.prototype.next = function () {
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
            };

            /**
            * Clears the list of stories accumulated .
            */
            Animator.prototype.Clear = function () {
                this.currentStory = null;
                this.currentStoryIndex = -1;
                this.stories.Clear();
            };
            return Animator;
        })();
        Animation.Animator = Animator;

        var AdapterBase = (function () {
            function AdapterBase() {
                this.rgbRe = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
                this.hexRe = /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
            }
            AdapterBase.prototype.Update = function (t) {
            };

            AdapterBase.prototype.init = function () {
            };

            AdapterBase.prototype.makeArrayOfElements = function (o) {
                if (o == null)
                    return [];
                if ("string" == typeof o)
                    return [document.getElementById(o)];

                if (!o.length)
                    return [o];
                var result = [];
                for (var i = 0; i < o.length; i++) {
                    if ("string" == typeof o[i]) {
                        result[i] = document.getElementById(o[i]);
                    } else {
                        result[i] = o[i];
                    }
                }
                return result;
            };

            // return a properly formatted 6-digit hex colour spec, or false
            AdapterBase.prototype.parseColor = function (s) {
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
            };

            // convert a number to a 2 digit hex string
            AdapterBase.prototype.toColorPart = function (n) {
                if (n > 255)
                    n = 255;
                var digits = n.toString(16);
                if (n < 16)
                    return '0' + digits;
                return digits;
            };
            return AdapterBase;
        })();
        Animation.AdapterBase = AdapterBase;

        var NumericalStyleAdapter = (function (_super) {
            __extends(NumericalStyleAdapter, _super);
            function NumericalStyleAdapter(subjects, property, from, to, options) {
                _super.call(this);
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
            NumericalStyleAdapter.prototype.Update = function (tick) {
                var style = this.GetPropertyValue(tick);
                var visibility = (this.property == 'opacity' && tick == 0) ? 'hidden' : '';
                for (var i = 0; i < this.subjects.length; i++) {
                    try  {
                        if (this.subjects[i] != null) {
                            if (this.subjects[i][this.property] !== null) {
                                this.subjects[i][this.property] = parseFloat(style.toString());
                            }
                        } else {
                            if (this.subjects[i].style[this.property] !== null)
                                this.subjects[i].style[this.property] = style;
                            else if (this.subjects[i][this.property] !== null) {
                                var animl = this.subjects[i][this.property];
                                if (animl) {
                                    animl.baseVal.value = parseFloat(style.toString());
                                }
                            }
                        }
                    } catch (e) {
                        // ignore fontWeight - intermediate numerical values cause exeptions in firefox
                        if (this.property != 'fontWeight')
                            throw e;
                    }
                }
            };

            NumericalStyleAdapter.prototype.GetPropertyValue = function (tick) {
                tick = this.from + ((this.to - this.from) * tick);
                if (this.property == 'filter')
                    return "alpha(opacity=" + Math.round(tick * 100) + ")";
                if (this.property == 'Opacity')
                    return tick;
                return tick + this.units;
            };

            NumericalStyleAdapter.prototype.inspect = function () {
                return "\t" + this.property + "(" + this.from + this.units + " to " + this.to + this.units + ")\n";
            };
            return NumericalStyleAdapter;
        })(AdapterBase);
        Animation.NumericalStyleAdapter = NumericalStyleAdapter;

        var ColorStyleAdapter = (function (_super) {
            __extends(ColorStyleAdapter, _super);
            function ColorStyleAdapter(subjects, property, from, to, options) {
                _super.call(this);
                this.subjects = this.makeArrayOfElements(subjects);
                this.property = TypeViz.Camelize(property);
                this.to = this.expandColor(to);
                this.from = this.expandColor(from);
                this.origFrom = from;
                this.origTo = to;
            }
            // parse "#FFFF00" to [256, 256, 0]
            ColorStyleAdapter.prototype.expandColor = function (color) {
                var hexColor, red, green, blue;
                hexColor = this.parseColor(color);
                if (hexColor) {
                    red = parseInt(hexColor.slice(1, 3), 16);
                    green = parseInt(hexColor.slice(3, 5), 16);
                    blue = parseInt(hexColor.slice(5, 7), 16);
                    return [red, green, blue];
                }
                return null;
            };

            ColorStyleAdapter.prototype.getValueForState = function (color, tick) {
                return Math.round(this.from[color] + ((this.to[color] - this.from[color]) * tick));
            };

            ColorStyleAdapter.prototype.Update = function (tick) {
                var color = '#' + this.toColorPart(this.getValueForState(0, tick)) + this.toColorPart(this.getValueForState(1, tick)) + this.toColorPart(this.getValueForState(2, tick));
                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i][this.property] = color;
                }
            };

            ColorStyleAdapter.prototype.inspect = function () {
                return "\t" + this.property + "(" + this.origFrom + " to " + this.origTo + ")\n";
            };
            return ColorStyleAdapter;
        })(AdapterBase);
        Animation.ColorStyleAdapter = ColorStyleAdapter;

        var DiscreteStyleAdapter = (function (_super) {
            __extends(DiscreteStyleAdapter, _super);
            function DiscreteStyleAdapter(subjects, property, from, to, options) {
                _super.call(this);
                this.subjects = this.makeArrayOfElements(subjects);
                this.property = TypeViz.Camelize(property);
                this.from = from;
                this.to = to;
                this.threshold = options.threshold || 0.5;
            }
            DiscreteStyleAdapter.prototype.Update = function (tick) {
                for (var i = 0; i < this.subjects.length; i++) {
                    this.subjects[i].style[this.property] = tick <= this.threshold ? this.from : this.to;
                }
            };

            DiscreteStyleAdapter.prototype.inspect = function () {
                return "\t" + this.property + "(" + this.from + " to " + this.to + " @ " + this.threshold + ")\n";
            };
            return DiscreteStyleAdapter;
        })(AdapterBase);
        Animation.DiscreteStyleAdapter = DiscreteStyleAdapter;

        var PositionAdapter = (function (_super) {
            __extends(PositionAdapter, _super);
            function PositionAdapter(targets, property, from, to, options) {
                _super.call(this);
                this.targets = [];
                this.froms = [];
                this.tos = [];
                this.targets = targets;
                this.from = from;
                this.to = to;
                if (options && options["UseCenter"])
                    this.useCenter = options["UseCenter"];
                else
                    this.useCenter = false;
            }
            PositionAdapter.prototype.init = function () {
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
            };

            PositionAdapter.prototype.Update = function (t) {
                if (this.targets.length > 0) {
                    for (var i = 0; i < this.targets.length; i++) {
                        var p = new TypeViz.Point(this.froms[i].X + (this.tos[i].X - this.froms[i].X) * t, this.froms[i].Y + (this.tos[i].Y - this.froms[i].Y) * t);
                        this.useCenter ? this.targets[i]["Center"] = p : this.targets[i].Position = p;
                    }
                }
            };
            return PositionAdapter;
        })(AdapterBase);
        Animation.PositionAdapter = PositionAdapter;

        var DataAdapter = (function (_super) {
            __extends(DataAdapter, _super);
            function DataAdapter(targets, property, from, to, options) {
                _super.call(this);
                this.targets = [];
                this.froms = [];
                this.tos = [];
                this.targets = targets;
                this.from = from;
                this.to = to;
            }
            DataAdapter.prototype.init = function () {
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
                    if (TypeViz.IsFunction(this.to))
                        throw "Functions not handled yet";
                    this.tos[i] = TypeViz.Point.ToArray(this.to);
                    this.lerp[i] = TypeViz.Arrays.InterpolateArrays(this.froms[i], this.tos[i]);
                }
            };

            DataAdapter.prototype.Update = function (t) {
                if (this.targets.length > 0) {
                    for (var i = 0; i < this.targets.length; i++) {
                        this.targets[i].Points = this.lerp[i](t);
                    }
                }
            };
            return DataAdapter;
        })(AdapterBase);
        Animation.DataAdapter = DataAdapter;

        var GenericAdapter = (function (_super) {
            __extends(GenericAdapter, _super);
            function GenericAdapter(subjects, style2, options) {
                _super.call(this);
                this.PropertyValueAssignmentRegex = /^\s*([a-zA-Z\-]+)\s*:\s*(\S(.+\S)?)\s*$/;
                this.NumberRegex = /^-?\d+(?:\.\d+)?(%|[a-zA-Z]{2})?$/;
                this.DiscreteRegex = /^\w+$/;
                this.adapters = [];
                this.subjects = [];
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
                this.cssProperties = ['azimuth', 'background', 'background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat', 'border-collapse', 'border-color', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-width', 'bottom', 'clear', 'clip', 'color', 'content', 'cursor', 'direction', 'display', 'elevation', 'empty-cells', 'css-float', 'font', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'height', 'left', 'letter-spacing', 'line-height', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'max-height', 'max-width', 'min-height', 'min-width', 'orphans', 'outline', 'outline-color', 'outline-style', 'outline-width', 'overflow', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'pause', 'position', 'right', 'size', 'table-layout', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'top', 'vertical-align', 'visibility', 'white-space', 'width', 'word-spacing', 'z-index', 'opacity', 'outline-offset', 'overflow-x', 'overflow-y'];
                this.defaultOptions = {
                    units: '',
                    Interpolator: TypeViz.SVG.Interpolators.LinearInterpolator,
                    threshold: 0.5,
                    Easing: TypeViz.Animation.Easing.EaseInOut
                };
                // get the current value of a css property,
                this.getStyle = function (el, property) {
                    return el[property];
                } /*var style;
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
                return style || el.style[property]*/
;
                this.options = TypeViz.MergeOptions(this.defaultOptions, options);
                this.subjects = this.makeArrayOfElements(subjects);
                this.adapters = [];
                if (this.subjects.length == 0)
                    return;

                this.style2 = style2;
                // todo: remove unchanging properties
            }
            GenericAdapter.prototype.init = function () {
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
                function formatPoints(prepoints) {
                    if (TypeViz.IsUndefined(prepoints))
                        return null;
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
                    } else if (TypeViz.IsFunction(prepoints)) {
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
                        if (window["ANIMATOR_DEBUG"])
                            alert("No target property provided for '" + prop + '"');
                        continue;
                    }

                    //----------------------------------------------------------------
                    if (prop == "Data") {
                        from = formatPoints(this.fromStyle[prop]);
                        to = formatPoints(this.toStyle[prop]);
                        type = Animation.DataAdapter;
                    } else if (prop == "Position") {
                        from = this.fromStyle[prop];
                        to = this.toStyle[prop];
                        type = Animation.PositionAdapter;
                    } else if (prop == "Center") {
                        from = this.fromStyle[prop];
                        to = this.toStyle[prop];
                        type = Animation.PositionAdapter;
                        this.options["UseCenter"] = true;
                    } else if (from = this.parseColor(fromValue)) {
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
                        if (window["ANIMATOR_DEBUG"])
                            alert("Unrecognised format for value of " + prop + ": '" + this.fromStyle[prop] + "'");
                        continue;
                    }

                    //----------------------------------------------------------------
                    this.options.units = units;
                    this.adapters[this.adapters.length] = new type(this.subjects, prop, from, to, this.options);
                }
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].init();
                }
            };

            GenericAdapter.prototype.Update = function (tick) {
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].Update(tick);
                }
            };

            // parses "width: 400px; color: #FFBB2E" to {width: "400px", color: "#FFBB2E"}
            GenericAdapter.prototype.parseStyle = function (style, el) {
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
                } else {
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
            };

            GenericAdapter.prototype.inspect = function () {
                var str = "";
                for (var i = 0; i < this.adapters.length; i++) {
                    str += this.adapters[i].inspect();
                }
                return str;
            };
            return GenericAdapter;
        })(AdapterBase);
        Animation.GenericAdapter = GenericAdapter;

        var Ticker = (function () {
            function Ticker() {
                var _this = this;
                this.adapters = [];
                this.target = 0;
                this.tick = 0;
                this.interval = 20;
                this.duration = 1000;
                this.lastTime = null;
                this.handlers = [];
                this.forward = true;
                this.isLooping = false;
                this.easingFunction = Easing.EaseInOut();
                this.timerDelegate = function () {
                    _this.onTimerEvent();
                };
            }
            Object.defineProperty(Ticker.prototype, "Easing", {
                get: function () {
                    return this.easingFunction;
                },
                set: function (value) {
                    if (TypeViz.IsUndefined(value))
                        throw "The easing function cannot be undefined.";
                    this.easingFunction = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Ticker.prototype, "Duration", {
                get: function () {
                    return this.duration;
                },
                set: function (value) {
                    this.duration = value;
                },
                enumerable: true,
                configurable: true
            });

            Ticker.prototype.AddAdapter = function (a) {
                this.adapters.push(a);
            };

            Ticker.prototype.onComplete = function (handler) {
                this.handlers.push(handler);
            };

            Ticker.prototype.removeHandler = function (handler) {
                this.handlers = this.handlers.filter(function (h) {
                    return h !== handler;
                });
            };

            Ticker.prototype.trigger = function () {
                var _this = this;
                if (this.handlers) {
                    this.handlers.ForEach(function (h) {
                        return h.call(_this.caller != null ? _this.caller : _this);
                    });
                }
            };

            Ticker.prototype.onStep = function () {
            };

            // animate from the current tick to provided value
            Ticker.prototype.seekTo = function (to) {
                this.forward = this.tick < to;
                this.seekFromTo(this.tick, to);
            };

            // animate from the current tick to provided value
            Ticker.prototype.seekFromTo = function (from, to) {
                this.forward = from < to;
                this.target = Math.max(0, Math.min(1, to));
                this.tick = Math.max(0, Math.min(1, from));
                this.lastTime = new Date().getTime();
                if (!this.intervalId) {
                    this.intervalId = window.setInterval(this.timerDelegate, this.interval);
                }
            };

            Ticker.prototype.stop = function () {
                if (this.intervalId) {
                    window.clearInterval(this.intervalId);
                    this.intervalId = null;
                    this.trigger();
                }
            };

            Ticker.prototype.play = function (origin) {
                this.forward = true;
                this.isLooping = false;
                if (this.adapters.length == 0)
                    return;
                if (origin != null)
                    this.caller = origin;
                this.seekFromTo(0, 1);
            };
            Ticker.prototype.Loop = function (origin) {
                this.forward = true;
                this.isLooping = true;
                if (this.adapters.length == 0)
                    return;
                if (origin != null)
                    this.caller = origin;
                this.seekFromTo(0, 1);
            };
            Ticker.prototype.reverse = function () {
                if (this.forward)
                    this.seekFromTo(1, 0);
                else
                    this.seekFromTo(0, 1);
            };

            Ticker.prototype.init = function () {
                if (this.adapters.length == 0)
                    return;
                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].init();
                }
            };

            // forward the current tick to the animation adapters
            Ticker.prototype.propagate = function () {
                var value = this.easingFunction(this.tick);

                for (var i = 0; i < this.adapters.length; i++) {
                    this.adapters[i].Update(value);
                }
            };

            // called once per frame to update the current tick
            Ticker.prototype.onTimerEvent = function () {
                var now = new Date().getTime();
                var timePassed = now - this.lastTime;
                this.lastTime = now;
                var movement = (timePassed / this.duration) * (this.tick < this.target ? 1 : -1);
                if (Math.abs(movement) >= Math.abs(this.tick - this.target)) {
                    this.tick = this.target;
                } else {
                    this.tick += movement;
                }

                try  {
                    this.propagate();
                } finally {
                    this.onStep.call(this);
                    if (this.target == this.tick) {
                        if (this.isLooping)
                            this.reverse();
                        else
                            this.stop();
                    }
                }
            };
            return Ticker;
        })();
        Animation.Ticker = Ticker;

        /*Easing functions.*/
        var Easing = (function () {
            function Easing() {
            }
            Easing.EaseInOut = function () {
                return Easing.makeEaseInOut();
            };

            Easing.Linear = function () {
                return function (tick) {
                    return tick;
                };
            };

            Easing.Elastic = function (times) {
                if (TypeViz.IsUndefined(times))
                    times = 2;
                return Easing.makeElastic(times);
            };

            Easing.EaseIn = function () {
                return Easing.makeEaseIn(1.5);
            };

            Easing.EaseOut = function () {
                return Easing.makeEaseOut(1.5);
            };

            Easing.StrongEaseIn = function () {
                return Easing.makeEaseIn(2.5);
            };

            Easing.StrongEaseOut = function () {
                return Easing.makeEaseOut(2.5);
            };

            Easing.VeryElastic = function () {
                return Easing.makeElastic(3);
            };

            Easing.Bouncy = function () {
                return Easing.makeBounce(1);
            };

            Easing.VeryBouncy = function () {
                return Easing.makeBounce(3);
            };

            Easing.makeEaseIn = function (a) {
                return function (tick) {
                    return Math.pow(tick, a * 2);
                };
            };

            Easing.makeEaseOut = function (a) {
                return function (tick) {
                    return 1 - Math.pow(1 - tick, a * 2);
                };
            };

            Easing.makeEaseInOut = function () {
                return function (tick) {
                    return ((-Math.cos(tick * Math.PI) / 2) + 0.5);
                };
            };

            Easing.makeElastic = function (bounces) {
                return function (tick) {
                    tick = Easing.makeEaseInOut()(tick);
                    return ((1 - Math.cos(tick * Math.PI * bounces)) * (1 - tick)) + tick;
                };
            };

            /*Attack Decay Sustain Release  */
            Easing.prototype.makeADSR = function (attackEnd, decayEnd, sustainEnd, sustainLevel) {
                if (sustainLevel == null)
                    sustainLevel = 0.5;
                return function (tick) {
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
            };

            Easing.makeBounce = function (bounces) {
                var fn = Easing.makeElastic(bounces);
                return function (tick) {
                    tick = fn(tick);
                    return tick <= 1 ? tick : 2 - tick;
                };
            };
            return Easing;
        })();
        Animation.Easing = Easing;
    })(TypeViz.Animation || (TypeViz.Animation = {}));
    var Animation = TypeViz.Animation;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=Animation.js.map
