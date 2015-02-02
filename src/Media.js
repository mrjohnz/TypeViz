var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
/// <reference path="SVG.ts" />
var TypeViz;
(function (TypeViz) {
    var Point = TypeViz.Point;

    (function (Media) {
        /**
        * The spreading methods of the radial gradient.
        * Pad is used by default in the RadialGradient.
        */
        (function (RadialGradientSpreadMethod) {
            RadialGradientSpreadMethod[RadialGradientSpreadMethod["Pad"] = 0] = "Pad";
            RadialGradientSpreadMethod[RadialGradientSpreadMethod["Reflect"] = 1] = "Reflect";
            RadialGradientSpreadMethod[RadialGradientSpreadMethod["Repeat"] = 2] = "Repeat";
        })(Media.RadialGradientSpreadMethod || (Media.RadialGradientSpreadMethod = {}));
        var RadialGradientSpreadMethod = Media.RadialGradientSpreadMethod;

        /**
        * Base class for the LinearGradient and RadialGradient.
        */
        var GradientBase = (function () {
            function GradientBase() {
                this.stops = [];
            }
            Object.defineProperty(GradientBase.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(GradientBase.prototype, "Id", {
                get: function () {
                    return this.Native == null ? null : this.Native.id;
                },
                set: function (value) {
                    this.Native.id = value;
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(GradientBase.prototype, "GradientStops", {
                get: function () {
                    return this.stops;
                },
                enumerable: true,
                configurable: true
            });

            GradientBase.prototype.AddGradientStop = function (stop) {
                if (stop == null)
                    throw "The given GradientStop is null.";
                this.stops.push(stop);
                this.Native.appendChild(stop.Native);
            };

            GradientBase.prototype.AddGradientStops = function () {
                var stops = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    stops[_i] = arguments[_i + 0];
                }
                if (stops == null)
                    return;
                for (var i = 0; i < stops.length; i++) {
                    this.AddGradientStop(stops[i]);
                }
            };

            GradientBase.prototype.RemoveGradientStop = function (stop) {
                if (stop == null)
                    throw "The given GradientStop is null.";
                if (!this.stops.Contains(stop))
                    return;
                this.stops.Remove(stop);
                this.Native.removeChild(stop.Native);
            };

            GradientBase.prototype.ClearStops = function () {
                this.stops.Clear();
                while (this.Native.childNodes.length > 0) {
                    this.Native.removeChild(this.Native.childNodes[0]);
                }
            };

            GradientBase.prototype.Reverse = function () {
                var mem = [];
                for (var j = 0; j < this.stops.length; j++) {
                    var stop = this.stops[this.stops.length - 1 - j];
                    stop.Offset = 1 - stop.Offset;
                    mem.push(stop);
                }
                this.ClearStops();
                for (var i = 0; i < mem.length; i++) {
                    this.AddGradientStop(mem[i]);
                }
                return this;
            };
            return GradientBase;
        })();
        Media.GradientBase = GradientBase;

        /**
        * A radial gradient.
        */
        var RadialGradient = (function (_super) {
            __extends(RadialGradient, _super);
            function RadialGradient() {
                _super.call(this);
                this.nativeElement = document.createElementNS(TypeViz.SVG.NS, "radialGradient");
                this.Id = TypeViz.RandomId();
                this.Center = new TypeViz.Point(0.5, 0.5);
            }
            Object.defineProperty(RadialGradient.prototype, "Center", {
                get: function () {
                    var cx = this.Native.getAttribute("cx") ? parseFloat(this.Native.getAttribute("cx")) : 0;
                    var cy = this.Native.getAttribute("cy") ? parseFloat(this.Native.getAttribute("cy")) : 0;
                    return new Point(cx, cy);
                },
                set: function (value) {
                    this.Native.setAttribute("cx", this.truncatedValue(value.X));
                    this.Native.setAttribute("cy", this.truncatedValue(value.Y));
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RadialGradient.prototype, "Radius", {
                get: function () {
                    return this.Native.getAttribute("r") ? parseFloat(this.Native.getAttribute("r")) : 0;
                },
                set: function (value) {
                    this.Native.setAttribute("r", value.toString());
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(RadialGradient.prototype, "SpreadMethod", {
                get: function () {
                    return this.Native.getAttribute("spreadMethod") ? this.toSpreadEnum(this.Native.getAttribute("spreadMethod")) : 0 /* Pad */;
                },
                set: function (value) {
                    this.Native.setAttribute("spreadMethod", this.toSpreadString(value));
                },
                enumerable: true,
                configurable: true
            });


            RadialGradient.prototype.truncatedValue = function (value) {
                return Math.max(0, Math.min(1, value)).toString();
            };

            RadialGradient.prototype.toSpreadEnum = function (method) {
                switch (method.toLowerCase()) {
                    case "pad":
                        return 0 /* Pad */;
                    case "reflect":
                        return 1 /* Reflect */;
                    case "repeat":
                        return 2 /* Repeat */;
                }
            };

            RadialGradient.prototype.toSpreadString = function (method) {
                switch (method) {
                    case 0 /* Pad */:
                        return "pad";
                    case 1 /* Reflect */:
                        return "reflect";
                    case 2 /* Repeat */:
                        return "repeat";
                }
            };
            return RadialGradient;
        })(GradientBase);
        Media.RadialGradient = RadialGradient;

        /**
        * A linear gradient.
        */
        var LinearGradient = (function (_super) {
            __extends(LinearGradient, _super);
            /**
            * Instantiates a new Line.
            */
            function LinearGradient(canvas, from, to) {
                if (typeof canvas === "undefined") { canvas = null; }
                if (typeof from === "undefined") { from = null; }
                if (typeof to === "undefined") { to = null; }
                _super.call(this);
                this.nativeElement = document.createElementNS(TypeViz.SVG.NS, "linearGradient");
                this.canvas = canvas;
                this.from = from;
                this.to = to;
                this.Id = TypeViz.RandomId();
            }
            Object.defineProperty(LinearGradient.prototype, "From", {
                /**
                * Gets the point where the gradient starts.
                */
                get: function () {
                    return this.from;
                },
                /**
                * Sets the point where the gradient starts. The value should be in the [0,1] interval.
                */
                set: function (value) {
                    if (this.from != value) {
                        this.Native.setAttribute("x1", (value.X * 100).toString() + "%");
                        this.Native.setAttribute("y1", (value.Y * 100).toString() + "%");
                        this.from = value;
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(LinearGradient.prototype, "To", {
                /**
                * Gets the point where the gradient ends.
                */
                get: function () {
                    return this.to;
                },
                /**
                * Sets the point where the gradient ends.The value should be in the [0,1] interval.
                */
                set: function (value) {
                    if (this.to != value) {
                        this.Native.setAttribute("x2", (value.X * 100).toString() + "%");
                        this.Native.setAttribute("y2", (value.Y * 100).toString() + "%");
                        this.to = value;
                    }
                },
                enumerable: true,
                configurable: true
            });

            return LinearGradient;
        })(GradientBase);
        Media.LinearGradient = LinearGradient;

        /**
        * Represents a gradient stop.
        */
        var GradientStop = (function () {
            /**
            * Instantiates a GradientStop.
            * @param color The color of the stop.
            * @param offset The offset should be in the [0,1] interval.
            */
            function GradientStop(color, offset) {
                if (typeof color === "undefined") { color = null; }
                if (typeof offset === "undefined") { offset = null; }
                this.nativeElement = document.createElementNS(TypeViz.SVG.NS, "stop");
                this.color = Colors.White;
                if (color == null)
                    this.Color = Colors.White;
                else
                    this.Color = color;

                if (offset == null)
                    this.Offset = 0.0;
                else
                    this.Offset = TypeViz.LimitValue(offset);
            }
            Object.defineProperty(GradientStop.prototype, "Native", {
                get: function () {
                    return this.nativeElement;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(GradientStop.prototype, "Offset", {
                /**
                * The offset is a value in the [0,1] range.
                */
                get: function () {
                    if (this.nativeElement.attributes["offset"] == null)
                        return 0.0;
                    return parseFloat(this.nativeElement.attributes["offset"].value) / 100.0;
                },
                /**
                * Sets the offset where this gradient stop starts.The value should be in the [0,1] interval.
                */
                set: function (value) {
                    if (value < 0 || value > 1)
                        throw "The Offset of the gradient stop should be in the [0,1] interval.";
                    this.Native.setAttribute("offset", (value * 100.0).toString() + "%");
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(GradientStop.prototype, "Color", {
                get: function () {
                    return this.color;
                },
                set: function (value) {
                    if (value == null)
                        throw "The color cannot be null.";
                    this.color = value;
                    this.Native.style.stopColor = value.AsCSS1Color;
                    this.Native.style.stopOpacity = value.A == null ? "1.0" : value.A.toString();
                },
                enumerable: true,
                configurable: true
            });

            return GradientStop;
        })();
        Media.GradientStop = GradientStop;

        /**
        * An RGB color definition. The values should be in the [0, 255] interval.
        */
        var RGB = (function () {
            function RGB(r, g, b) {
                this.R = r;
                this.G = g;
                this.B = b;
            }
            RGB.prototype.Darker = function (k) {
                if (!k)
                    k = 0.2;
                k = Math.pow(.7, k);
                return new RGB(~~(k * this.R), ~~(k * this.G), ~~(k * this.B));
            };

            RGB.prototype.Brighter = function (k) {
                if (!k)
                    k = 0.2;
                k = Math.pow(.7, k);
                var r = this.R, g = this.G, b = this.B, i = 30;
                if (!r && !g && !b)
                    return new RGB(i, i, i);
                if (r && r < i)
                    r = i;
                if (g && g < i)
                    g = i;
                if (b && b < i)
                    b = i;
                return new RGB(Math.min(255, ~~(r / k)), Math.min(255, ~~(g / k)), Math.min(255, ~~(b / k)));
            };

            Object.defineProperty(RGB.prototype, "AsHSL", {
                get: function () {
                    return ColorConverters.RGB2HSL(this);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(RGB.prototype, "AsHex6", {
                get: function () {
                    return (new Color(this)).AsHex6;
                },
                enumerable: true,
                configurable: true
            });

            RGB.prototype.toString = function () {
                return "rgb(" + this.R + ", " + this.G + ", " + this.B + ")";
            };
            return RGB;
        })();
        Media.RGB = RGB;

        /**
        * An HSL color definition.
        The hue sits in the [0,360] range while the saturation and lightness are in the [0,1] range.
        */
        var HSL = (function () {
            function HSL(h, s, l) {
                this.H = h;
                this.S = s;
                this.L = l;
            }
            /**
            * Returns a brighter HSL from the current one.
            * @param k The brightness factor determines the increase.
            * @returns {TypeViz.HSL}
            */
            HSL.prototype.Brighter = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new HSL(this.H, this.S, this.L / k);
            };

            /**
            * Returns a darker HSL from the current one.
            * @param k The darkness factor determines the increase.
            * @returns {TypeViz.HSL}
            */
            HSL.prototype.Darker = function (k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new HSL(this.H, this.S, k * this.L);
            };

            Object.defineProperty(HSL.prototype, "AsRGB", {
                /**
                * Returns the converted HSL to RGB.
                * @returns {RGB}
                */
                get: function () {
                    return ColorConverters.HSL2RGB(this);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(HSL.prototype, "AsHex6", {
                /**
                * Returns this HSL as a hexadecimal color string.
                * @returns {string}
                */
                get: function () {
                    return (new Color(this)).AsHex6;
                },
                enumerable: true,
                configurable: true
            });
            HSL.prototype.toString = function () {
                return "hsl(" + this.H + ", " + this.S + ", " + this.L + ")";
            };
            return HSL;
        })();
        Media.HSL = HSL;

        /**
        * Represents an SVG color.
        */
        var Color = (function () {
            function Color(r, g, b, a) {
                if (typeof r === "undefined") { r = null; }
                if (typeof g === "undefined") { g = null; }
                if (typeof b === "undefined") { b = null; }
                if (typeof a === "undefined") { a = null; }
                this.r = 0.0;
                this.g = 0.0;
                this.b = 0.0;
                this.a = 1.0;
                if (r == null)
                    return;
                if (TypeViz.IsString(r)) {
                    var s = r;
                    if (s.substring(0, 1) == "#")
                        s = s.substr(1);

                    //try predefined ones
                    var known = Colors.Parse(s.toLowerCase());
                    if (known != null) {
                        this.r = known.R;
                        this.g = known.G;
                        this.b = known.B;
                        return;
                    }
                    var c = Color.Parse(s.toUpperCase());
                    if (c != null) {
                        this.r = c.R;
                        this.g = c.G;
                        this.b = c.B;
                        return;
                    } else
                        throw "The string '" + r + "' could not be converted to a color value.";
                } else if (TypeViz.IsNumber(r)) {
                    this.r = parseFloat(r);
                    this.g = g;
                    this.b = b;
                    if (a != null)
                        this.a = a;
                    this.FixValues();
                } else if (r instanceof RGB) {
                    this.r = r.R;
                    this.g = r.G;
                    this.b = r.B;
                } else if (r instanceof HSL) {
                    var rgb = r.AsRGB;
                    this.r = rgb.R;
                    this.g = rgb.G;
                    this.b = rgb.B;
                }
            }
            Object.defineProperty(Color.prototype, "R", {
                get: function () {
                    return this.r;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "G", {
                get: function () {
                    return this.g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "B", {
                get: function () {
                    return this.b;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "A", {
                get: function () {
                    return this.a;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "RGB", {
                get: function () {
                    return new RGB(this.r, this.g, this.b);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "HSL", {
                get: function () {
                    return this.RGB.AsHSL;
                },
                enumerable: true,
                configurable: true
            });

            /**
            * Returns a brighter variation of the current color.
            */
            Color.prototype.Brighter = function (k) {
                var rgb = new RGB(this.r, this.g, this.b);
                rgb = rgb.Brighter(k);
                this.r = rgb.R;
                this.g = rgb.G;
                this.b = rgb.B;
                return this;
            };

            /**
            * Returns a darker variation of the current color.
            */
            Color.prototype.Darker = function (k) {
                var rgb = new RGB(this.r, this.g, this.b);
                rgb = rgb.Darker(k);
                this.r = rgb.R;
                this.g = rgb.G;
                this.b = rgb.B;
                return this;
            };

            Color.Parse = function (s) {
                if (s == null || s.length == 0)
                    throw "Empty string";
                s = s.trim();
                var defs = ColorConverters.All;
                for (var i = 0; i < defs.length; i++) {
                    var re = new RegExp(defs[i].RegEx);
                    var processor = defs[i].Parse;
                    var bits = re.exec(s);
                    if (bits) {
                        var channels = processor(bits);
                        return new Color(channels[0], channels[1], channels[2]);
                    }
                }
            };

            Object.defineProperty(Color.prototype, "AsCSS1", {
                get: function () {
                    return 'fill:rgb(' + this.R + ', ' + this.G + ', ' + this.B + '); fill-opacity:' + this.a + ';';
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "AsCSS1Color", {
                get: function () {
                    return 'rgb(' + this.R + ', ' + this.G + ', ' + this.B + ')';
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "AsCSS3", {
                get: function () {
                    return 'fill:rgba(' + this.R + ', ' + this.G + ', ' + this.B + ', ' + this.a + ')';
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Color.prototype, "AsHex6", {
                get: function () {
                    return ColorConverters.RgbToHex(this.r, this.g, this.b).toUpperCase();
                },
                enumerable: true,
                configurable: true
            });

            Color.prototype.FixValues = function () {
                this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
                this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
                this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
                this.a = (this.a < 0 || isNaN(this.a)) ? 0 : ((this.a > 255) ? 255 : this.a);
            };
            return Color;
        })();
        Media.Color = Color;

        /**
        * Collects Color conversion utils.
        */
        var ColorConverters = (function () {
            function ColorConverters() {
            }
            Object.defineProperty(ColorConverters, "All", {
                /**
                * Returns an array of all color conversion methods.
                */
                get: function () {
                    return [ColorConverters.HEX6, ColorConverters.HEX3, ColorConverters.RGB];
                },
                enumerable: true,
                configurable: true
            });

            ColorConverters.componentToHex = function (c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            };

            /**
            * Converts the given RGB values to an hexadecimal representation.
            */
            ColorConverters.RgbToHex = function (r, g, b) {
                return "#" + ColorConverters.componentToHex(r) + ColorConverters.componentToHex(g) + ColorConverters.componentToHex(b);
            };

            Object.defineProperty(ColorConverters, "HEX6", {
                /**
                * Returns the hexadecimal (six characters) converter.
                */
                get: function () {
                    return {
                        RegEx: "^(\\w{2})(\\w{2})(\\w{2})$",
                        Parse: function (bits) {
                            return [
                                parseInt(bits[1], 16),
                                parseInt(bits[2], 16),
                                parseInt(bits[3], 16)
                            ];
                        }
                    };
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ColorConverters, "HEX3", {
                /**
                * Returns the hexadecimal (three characters) converter.
                */
                get: function () {
                    return {
                        RegEx: "^(\\w{1})(\\w{1})(\\w{1})$",
                        Parse: function (bits) {
                            return [
                                parseInt(bits[1] + bits[1], 16),
                                parseInt(bits[2] + bits[2], 16),
                                parseInt(bits[3] + bits[3], 16)
                            ];
                        }
                    };
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ColorConverters, "RGB", {
                /**
                * Returns the RGB converter.
                */
                get: function () {
                    return {
                        RegEx: "^rgb\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\)$",
                        Parse: function (bits) {
                            return [
                                parseInt(bits[1]),
                                parseInt(bits[2]),
                                parseInt(bits[3])
                            ];
                        }
                    };
                },
                enumerable: true,
                configurable: true
            });

            ColorConverters.RGB2HSL = function (rgb) {
                var r = rgb.R, g = rgb.G, b = rgb.B;
                var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
                if (d) {
                    s = l < .5 ? d / (max + min) : d / (2 - max - min);
                    if (r == max)
                        h = (g - b) / d + (g < b ? 6 : 0);
                    else if (g == max)
                        h = (b - r) / d + 2;
                    else
                        h = (r - g) / d + 4;
                    h *= 60;
                } else {
                    h = 0;
                    s = l > 0 && l < 1 ? 0 : h;
                }
                return new HSL(h, s, l);
            };

            ColorConverters.HSL2RGB = function (hsl) {
                var h = hsl.H, s = hsl.S, l = hsl.L;
                var m1, m2;
                h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
                s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
                l = l < 0 ? 0 : l > 1 ? 1 : l;
                m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
                m1 = 2 * l - m2;
                function v(h) {
                    if (h > 360)
                        h -= 360;
                    else if (h < 0)
                        h += 360;
                    if (h < 60)
                        return m1 + (m2 - m1) * h / 60;
                    if (h < 180)
                        return m2;
                    if (h < 240)
                        return m1 + (m2 - m1) * (240 - h) / 60;
                    return m1;
                }

                function vv(h) {
                    return Math.round(v(h) * 255);
                }

                return new RGB(vv(h + 120), vv(h), vv(h - 120));
            };
            return ColorConverters;
        })();
        Media.ColorConverters = ColorConverters;

        

        /**
        * A collection of predefined colors.
        */
        var Colors = (function () {
            function Colors() {
            }
            Colors.Parse = function (name) {
                for (var key in Colors.KnownColors) {
                    if (name == key)
                        return new Color(Colors.KnownColors[key]);
                }
                return null;
            };

            Object.defineProperty(Colors, "Random", {
                /**
                * Returns a random known color.
                */
                get: function () {
                    var result;
                    var count = 0;
                    for (var prop in this.KnownColors)
                        if (Math.random() < 1 / ++count)
                            result = prop;

                    return Colors.Parse(result);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomBlue", {
                /**
                * Returns a random color in the blueish range.
                */
                get: function () {
                    return new Color(new HSL(222, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomRed", {
                /**
                * Returns a random color in the redish range.
                */
                get: function () {
                    return new Color(new HSL(2, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomGreen", {
                /**
                * Returns a random color in the greenish range.
                */
                get: function () {
                    return new Color(new HSL(115, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomPurple", {
                /**
                * Returns a random color in the purpleish range.
                */
                get: function () {
                    return new Color(new HSL(290, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RandomGray", {
                /**
                * Returns a random color in the gray range.
                */
                get: function () {
                    return new Color(new HSL(0, 0, TypeViz.Maths.RandomReal(0.3, 0.8)));
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "AliceBlue", {
                get: function () {
                    return new Color("F0F8FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "AntiqueWhite", {
                get: function () {
                    return new Color("FAEBD7");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Aqua", {
                get: function () {
                    return new Color("00FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Aquamarine", {
                get: function () {
                    return new Color("7FFFD4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Azure", {
                get: function () {
                    return new Color("F0FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Beige", {
                get: function () {
                    return new Color("F5F5DC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Bisque", {
                get: function () {
                    return new Color("FFE4C4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Black", {
                get: function () {
                    return new Color("000000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "BlanchedAlmond", {
                get: function () {
                    return new Color("	FFEBCD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Blue", {
                get: function () {
                    return new Color("0000FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "BlueViolet", {
                get: function () {
                    return new Color("8A2BE2");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Brown", {
                get: function () {
                    return new Color("A52A2A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "BurlyWood", {
                get: function () {
                    return new Color("DEB887");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "CadetBlue", {
                get: function () {
                    return new Color("5F9EA0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Chartreuse", {
                get: function () {
                    return new Color("7FFF00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Chocolate", {
                get: function () {
                    return new Color("D2691E");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Coral", {
                get: function () {
                    return new Color("FF7F50");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "CornflowerBlue", {
                get: function () {
                    return new Color("	6495ED");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Cornsilk", {
                get: function () {
                    return new Color("FFF8DC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Crimson", {
                get: function () {
                    return new Color("DC143C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Cyan", {
                get: function () {
                    return new Color("00FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkBlue", {
                get: function () {
                    return new Color("00008B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkCyan", {
                get: function () {
                    return new Color("008B8B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkGoldenRod", {
                get: function () {
                    return new Color("	B8860B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkGray", {
                get: function () {
                    return new Color("A9A9A9");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkGreen", {
                get: function () {
                    return new Color("006400");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkKhaki", {
                get: function () {
                    return new Color("BDB76B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkMagenta", {
                get: function () {
                    return new Color("8B008B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkOliveGreen", {
                get: function () {
                    return new Color("	556B2F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Darkorange", {
                get: function () {
                    return new Color("FF8C00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkOrchid", {
                get: function () {
                    return new Color("9932CC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkRed", {
                get: function () {
                    return new Color("8B0000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSalmon", {
                get: function () {
                    return new Color("E9967A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSeaGreen", {
                get: function () {
                    return new Color("8FBC8F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSlateBlue", {
                get: function () {
                    return new Color("	483D8B");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkSlateGray", {
                get: function () {
                    return new Color("	2F4F4F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkTurquoise", {
                get: function () {
                    return new Color("	00CED1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DarkViolet", {
                get: function () {
                    return new Color("9400D3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DeepPink", {
                get: function () {
                    return new Color("FF1493");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DeepSkyBlue", {
                get: function () {
                    return new Color("00BFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DimGray", {
                get: function () {
                    return new Color("696969");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DimGrey", {
                get: function () {
                    return new Color("696969");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "DodgerBlue", {
                get: function () {
                    return new Color("1E90FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "FireBrick", {
                get: function () {
                    return new Color("B22222");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "FloralWhite", {
                get: function () {
                    return new Color("FFFAF0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "ForestGreen", {
                get: function () {
                    return new Color("228B22");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Fuchsia", {
                get: function () {
                    return new Color("FF00FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Gainsboro", {
                get: function () {
                    return new Color("DCDCDC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "GhostWhite", {
                get: function () {
                    return new Color("F8F8FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Gold", {
                get: function () {
                    return new Color("FFD700");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "GoldenRod", {
                get: function () {
                    return new Color("DAA520");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Gray", {
                get: function () {
                    return new Color("808080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Green", {
                get: function () {
                    return new Color("008000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "GreenYellow", {
                get: function () {
                    return new Color("ADFF2F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "HoneyDew", {
                get: function () {
                    return new Color("F0FFF0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "HotPink", {
                get: function () {
                    return new Color("FF69B4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "IndianRed", {
                get: function () {
                    return new Color("CD5C5C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Indigo", {
                get: function () {
                    return new Color("4B0082");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Ivory", {
                get: function () {
                    return new Color("FFFFF0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Khaki", {
                get: function () {
                    return new Color("F0E68C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Lavender", {
                get: function () {
                    return new Color("E6E6FA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LavenderBlush", {
                get: function () {
                    return new Color("	FFF0F5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LawnGreen", {
                get: function () {
                    return new Color("7CFC00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LemonChiffon", {
                get: function () {
                    return new Color("FFFACD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightBlue", {
                get: function () {
                    return new Color("ADD8E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightCoral", {
                get: function () {
                    return new Color("F08080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightCyan", {
                get: function () {
                    return new Color("E0FFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightGoldenRodYellow", {
                get: function () {
                    return new Color("	FAFAD2");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightGray", {
                get: function () {
                    return new Color("D3D3D3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightGreen", {
                get: function () {
                    return new Color("90EE90");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightPink", {
                get: function () {
                    return new Color("FFB6C1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSalmon", {
                get: function () {
                    return new Color("FFA07A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSeaGreen", {
                get: function () {
                    return new Color("	20B2AA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSkyBlue", {
                get: function () {
                    return new Color("87CEFA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSlateGray", {
                get: function () {
                    return new Color("	778899");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightSteelBlue", {
                get: function () {
                    return new Color("	B0C4DE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LightYellow", {
                get: function () {
                    return new Color("FFFFE0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Lime", {
                get: function () {
                    return new Color("00FF00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "LimeGreen", {
                get: function () {
                    return new Color("32CD32");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Linen", {
                get: function () {
                    return new Color("FAF0E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Magenta", {
                get: function () {
                    return new Color("FF00FF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Maroon", {
                get: function () {
                    return new Color("800000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumAquaMarine", {
                get: function () {
                    return new Color("	66CDAA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumBlue", {
                get: function () {
                    return new Color("0000CD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumOrchid", {
                get: function () {
                    return new Color("BA55D3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumPurple", {
                get: function () {
                    return new Color("9370DB");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumSeaGreen", {
                get: function () {
                    return new Color("	3CB371");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumSlateBlue", {
                get: function () {
                    return new Color("	7B68EE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumSpringGreen", {
                get: function () {
                    return new Color("	00FA9A");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumTurquoise", {
                get: function () {
                    return new Color("	48D1CC");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MediumVioletRed", {
                get: function () {
                    return new Color("	C71585");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MidnightBlue", {
                get: function () {
                    return new Color("191970");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MintCream", {
                get: function () {
                    return new Color("F5FFFA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "MistyRose", {
                get: function () {
                    return new Color("FFE4E1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Moccasin", {
                get: function () {
                    return new Color("FFE4B5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "NavajoWhite", {
                get: function () {
                    return new Color("FFDEAD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Navy", {
                get: function () {
                    return new Color("000080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "OldLace", {
                get: function () {
                    return new Color("FDF5E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Olive", {
                get: function () {
                    return new Color("808000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "OliveDrab", {
                get: function () {
                    return new Color("6B8E23");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Orange", {
                get: function () {
                    return new Color("FFA500");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "OrangeRed", {
                get: function () {
                    return new Color("FF4500");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Orchid", {
                get: function () {
                    return new Color("DA70D6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleGoldenRod", {
                get: function () {
                    return new Color("	EEE8AA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleGreen", {
                get: function () {
                    return new Color("98FB98");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleTurquoise", {
                get: function () {
                    return new Color("	AFEEEE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PaleVioletRed", {
                get: function () {
                    return new Color("	DB7093");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PapayaWhip", {
                get: function () {
                    return new Color("FFEFD5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PeachPuff", {
                get: function () {
                    return new Color("FFDAB9");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Peru", {
                get: function () {
                    return new Color("CD853F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Pink", {
                get: function () {
                    return new Color("FFC0CB");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Plum", {
                get: function () {
                    return new Color("DDA0DD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "PowderBlue", {
                get: function () {
                    return new Color("B0E0E6");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Purple", {
                get: function () {
                    return new Color("800080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Red", {
                get: function () {
                    return new Color("FF0000");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RosyBrown", {
                get: function () {
                    return new Color("BC8F8F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "RoyalBlue", {
                get: function () {
                    return new Color("4169E1");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SaddleBrown", {
                get: function () {
                    return new Color("8B4513");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Salmon", {
                get: function () {
                    return new Color("FA8072");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SandyBrown", {
                get: function () {
                    return new Color("F4A460");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SeaGreen", {
                get: function () {
                    return new Color("2E8B57");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SeaShell", {
                get: function () {
                    return new Color("FFF5EE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Sienna", {
                get: function () {
                    return new Color("A0522D");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Silver", {
                get: function () {
                    return new Color("C0C0C0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SkyBlue", {
                get: function () {
                    return new Color("87CEEB");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SlateBlue", {
                get: function () {
                    return new Color("6A5ACD");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SlateGray", {
                get: function () {
                    return new Color("708090");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Snow", {
                get: function () {
                    return new Color("FFFAFA");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SpringGreen", {
                get: function () {
                    return new Color("0FF7F");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "SteelBlue", {
                get: function () {
                    return new Color("4682B4");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Tan", {
                get: function () {
                    return new Color("D2B48C");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Teal", {
                get: function () {
                    return new Color("008080");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Thistle", {
                get: function () {
                    return new Color("D8BFD8");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Tomato", {
                get: function () {
                    return new Color("FF6347");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Turquoise", {
                get: function () {
                    return new Color("40E0D0");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Violet", {
                get: function () {
                    return new Color("EE82EE");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Wheat", {
                get: function () {
                    return new Color("F5DEB3");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "White", {
                get: function () {
                    return new Color("FFFFFF");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "WhiteSmoke", {
                get: function () {
                    return new Color("F5F5F5");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "Yellow", {
                get: function () {
                    return new Color("FFFF00");
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Colors, "YellowGreen", {
                get: function () {
                    return new Color("9ACD32");
                },
                enumerable: true,
                configurable: true
            });
            Colors.KnownColors = {
                aliceblue: 'f0f8ff',
                antiquewhite: 'faebd7',
                aqua: '00ffff',
                aquamarine: '7fffd4',
                azure: 'f0ffff',
                beige: 'f5f5dc',
                bisque: 'ffe4c4',
                black: '000000',
                blanchedalmond: 'ffebcd',
                blue: '0000ff',
                blueviolet: '8a2be2',
                brown: 'a52a2a',
                burlywood: 'deb887',
                cadetblue: '5f9ea0',
                chartreuse: '7fff00',
                chocolate: 'd2691e',
                coral: 'ff7f50',
                cornflowerblue: '6495ed',
                cornsilk: 'fff8dc',
                crimson: 'dc143c',
                cyan: '00ffff',
                darkblue: '00008b',
                darkcyan: '008b8b',
                darkgoldenrod: 'b8860b',
                darkgray: 'a9a9a9',
                darkgreen: '006400',
                darkkhaki: 'bdb76b',
                darkmagenta: '8b008b',
                darkolivegreen: '556b2f',
                darkorange: 'ff8c00',
                darkorchid: '9932cc',
                darkred: '8b0000',
                darksalmon: 'e9967a',
                darkseagreen: '8fbc8f',
                darkslateblue: '483d8b',
                darkslategray: '2f4f4f',
                darkturquoise: '00ced1',
                darkviolet: '9400d3',
                deeppink: 'ff1493',
                deepskyblue: '00bfff',
                dimgray: '696969',
                dodgerblue: '1e90ff',
                feldspar: 'd19275',
                firebrick: 'b22222',
                floralwhite: 'fffaf0',
                forestgreen: '228b22',
                fuchsia: 'ff00ff',
                gainsboro: 'dcdcdc',
                ghostwhite: 'f8f8ff',
                gold: 'ffd700',
                goldenrod: 'daa520',
                gray: '808080',
                green: '008000',
                greenyellow: 'adff2f',
                honeydew: 'f0fff0',
                hotpink: 'ff69b4',
                indianred: 'cd5c5c',
                indigo: '4b0082',
                ivory: 'fffff0',
                khaki: 'f0e68c',
                lavender: 'e6e6fa',
                lavenderblush: 'fff0f5',
                lawngreen: '7cfc00',
                lemonchiffon: 'fffacd',
                lightblue: 'add8e6',
                lightcoral: 'f08080',
                lightcyan: 'e0ffff',
                lightgoldenrodyellow: 'fafad2',
                lightgrey: 'd3d3d3',
                lightgreen: '90ee90',
                lightpink: 'ffb6c1',
                lightsalmon: 'ffa07a',
                lightseagreen: '20b2aa',
                lightskyblue: '87cefa',
                lightslateblue: '8470ff',
                lightslategray: '778899',
                lightsteelblue: 'b0c4de',
                lightyellow: 'ffffe0',
                lime: '00ff00',
                limegreen: '32cd32',
                linen: 'faf0e6',
                magenta: 'ff00ff',
                maroon: '800000',
                mediumaquamarine: '66cdaa',
                mediumblue: '0000cd',
                mediumorchid: 'ba55d3',
                mediumpurple: '9370d8',
                mediumseagreen: '3cb371',
                mediumslateblue: '7b68ee',
                mediumspringgreen: '00fa9a',
                mediumturquoise: '48d1cc',
                mediumvioletred: 'c71585',
                midnightblue: '191970',
                mintcream: 'f5fffa',
                mistyrose: 'ffe4e1',
                moccasin: 'ffe4b5',
                navajowhite: 'ffdead',
                navy: '000080',
                oldlace: 'fdf5e6',
                olive: '808000',
                olivedrab: '6b8e23',
                orange: 'ffa500',
                orangered: 'ff4500',
                orchid: 'da70d6',
                palegoldenrod: 'eee8aa',
                palegreen: '98fb98',
                paleturquoise: 'afeeee',
                palevioletred: 'd87093',
                papayawhip: 'ffefd5',
                peachpuff: 'ffdab9',
                peru: 'cd853f',
                pink: 'ffc0cb',
                plum: 'dda0dd',
                powderblue: 'b0e0e6',
                purple: '800080',
                red: 'ff0000',
                rosybrown: 'bc8f8f',
                royalblue: '4169e1',
                saddlebrown: '8b4513',
                salmon: 'fa8072',
                sandybrown: 'f4a460',
                seagreen: '2e8b57',
                seashell: 'fff5ee',
                sienna: 'a0522d',
                silver: 'c0c0c0',
                skyblue: '87ceeb',
                slateblue: '6a5acd',
                slategray: '708090',
                snow: 'fffafa',
                springgreen: '00ff7f',
                steelblue: '4682b4',
                tan: 'd2b48c',
                teal: '008080',
                thistle: 'd8bfd8',
                tomato: 'ff6347',
                turquoise: '40e0d0',
                violet: 'ee82ee',
                violetred: 'd02090',
                wheat: 'f5deb3',
                white: 'ffffff',
                whitesmoke: 'f5f5f5',
                yellow: 'ffff00',
                yellowgreen: '9acd32'
            };
            return Colors;
        })();
        Media.Colors = Colors;

        /**
        * Picks the colors at a regular interval from a given (linear) gradient.
        */
        var GradientSampler = (function () {
            /**
            * The argument can be a LinearGradient or an array of Color.
            */
            function GradientSampler(colors) {
                this.indexStart = 0;
                this.indexEnd = 10;
                this.colors = ['ff0000', 'ffff00', '00ff00', '0000ff'];
                this.defs = [];
                /**
                @colors An array of colors or a gradient.
                */
                if (colors != null) {
                    if (colors instanceof LinearGradient) {
                        this.colors = [];
                        var lg = colors;
                        for (var i = 0; i < lg.GradientStops.length; i++) {
                            var gradstop = lg.GradientStops[i];
                            this.colors.push(gradstop.Color.AsHex6);
                        }
                    } else if (colors instanceof Array) {
                        this.colors = [];
                        for (var j = 0; j < colors.length; j++) {
                            var c = colors[j];
                            if (c instanceof Color)
                                this.colors.push(c.AsHex6);
                            else if (TypeViz.IsString(c))
                                this.colors.push(c);
                            else
                                throw "Colors in the array should be HEX strings or instance of Color.";
                        }
                    }
                }
                if (this.colors == null || this.colors.length == 0)
                    throw "No colors to sample from.";
                this.setColours(this.colors);
            }
            Object.defineProperty(GradientSampler.prototype, "IndexStart", {
                get: function () {
                    return this.indexStart;
                },
                set: function (value) {
                    this.indexStart = value;
                    this.setColours(this.colors);
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(GradientSampler.prototype, "IndexEnd", {
                get: function () {
                    return this.indexEnd;
                },
                set: function (value) {
                    this.indexEnd = value;
                    this.setColours(this.colors);
                },
                enumerable: true,
                configurable: true
            });


            GradientSampler.prototype.ColorAt = function (n) {
                if (isNaN(n)) {
                    throw new TypeError(n + ' is not a number');
                } else if (this.defs.length === 1) {
                    return this.fromPart(this.defs[0], n);
                } else {
                    var segment = (this.indexEnd - this.indexStart) / (this.defs.length);
                    var index = Math.min(Math.floor((Math.max(n, this.indexStart) - this.indexStart) / segment), this.defs.length - 1);
                    return this.fromPart(this.defs[index], n);
                }
            };

            GradientSampler.prototype.fromPart = function (part, n) {
                return this.calcHex(n, part.From.substring(1, 3), part.To.substring(1, 3)) + this.calcHex(n, part.From.substring(3, 5), part.To.substring(3, 5)) + this.calcHex(n, part.From.substring(5, 7), part.To.substring(5, 7));
            };

            GradientSampler.prototype.calcHex = function (n, channelStart_Base16, channelEnd_Base16) {
                var num = n;
                if (num < this.indexStart) {
                    num = this.indexStart;
                }
                if (num > this.indexEnd) {
                    num = this.indexEnd;
                }
                var numRange = this.indexEnd - this.indexStart;
                var cStart_Base10 = parseInt(channelStart_Base16, 16);
                var cEnd_Base10 = parseInt(channelEnd_Base16, 16);
                var cPerUnit = (cEnd_Base10 - cStart_Base10) / numRange;
                var c_Base10 = Math.round(cPerUnit * (num - this.indexStart) + cStart_Base10);
                return this.formatHex(c_Base10.toString(16));
            };

            GradientSampler.prototype.formatHex = function (hex) {
                if (hex.length === 1) {
                    return '0' + hex;
                } else {
                    return hex;
                }
            };

            GradientSampler.prototype.setColours = function (spectrum) {
                if (spectrum.length < 2) {
                    throw new Error('Rainbow must have two or more colors.');
                } else {
                    var increment = (this.indexEnd - this.indexStart) / (spectrum.length - 1);
                    this.defs = [
                        {
                            From: spectrum[0],
                            To: spectrum[1],
                            Min: this.indexStart,
                            Max: this.indexStart + increment
                        }
                    ];
                    for (var i = 1; i < spectrum.length - 1; i++) {
                        this.defs.push({
                            From: spectrum[i],
                            To: spectrum[i + 1],
                            Min: this.indexStart + increment * i,
                            Max: this.indexStart + increment * (i + 1)
                        });
                    }

                    this.colors = spectrum;
                    return this;
                }
            };
            return GradientSampler;
        })();
        Media.GradientSampler = GradientSampler;

        /**
        * A collection of predefined gradients.
        * Note that you need to use AppendGradient on the Canvas to make it accessible by elements. It's just the way SVG works.
        */
        var Gradients = (function () {
            function Gradients() {
            }
            Object.defineProperty(Gradients, "Names", {
                get: function () {
                    return Gradients.names;
                },
                enumerable: true,
                configurable: true
            });

            Gradients.FromName = function (name) {
                if (Gradients.names.Contains(name))
                    return Gradients[name];
            };

            Object.defineProperty(Gradients, "BlueWhite", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "BlueWhite";
                    var b = new GradientStop(Colors.SteelBlue, 0);
                    var w = new GradientStop(Colors.White, 1);
                    g.AddGradientStops(b, w);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Beach", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "Beach";
                    var o = new GradientStop(Colors.Orange, 0);
                    var y = new GradientStop(Colors.Yellow, 0.4);
                    var a = new GradientStop(Colors.Azure, 0.7);
                    var c = new GradientStop(Colors.CornflowerBlue, 0.9);
                    g.AddGradientStops(o, y, a, c);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Solar", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "Solar";
                    var d = new GradientStop(Colors.DarkRed, 0);
                    var r = new GradientStop(Colors.Red, 0.4);
                    var y = new GradientStop(Colors.Yellow, 0.9);
                    g.AddGradientStops(d, r, y);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Temperature", {
                get: function () {
                    var g = new LinearGradient();
                    g.Id = "Temperature";
                    var b = new GradientStop(Colors.Blue, 0);
                    var a = new GradientStop(Colors.CornflowerBlue, 0.2);
                    var w = new GradientStop(Colors.White, 0.4);
                    var y = new GradientStop(Colors.Yellow, 0.7);
                    var r = new GradientStop(Colors.Red, 0.9);
                    g.AddGradientStops(b, a, w, y, r);
                    return g;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Gradients, "Rainbow", {
                get: function () {
                    var gr = new LinearGradient();
                    gr.Id = "Rainbow";
                    var r = new GradientStop(Colors.Red, 0);
                    var o = new GradientStop(Colors.Orange, 0.15);
                    var y = new GradientStop(Colors.Yellow, 0.3);
                    var g = new GradientStop(Colors.Green, 0.45);
                    var b = new GradientStop(Colors.Blue, 0.6);
                    var i = new GradientStop(Colors.Indigo, 0.75);
                    var v = new GradientStop(Colors.BlueViolet, 0.9);
                    gr.AddGradientStops(r, o, y, g, b, i, v);
                    return gr;
                },
                enumerable: true,
                configurable: true
            });
            Gradients.names = ["Beach", "BlueWhite", "Temperature", "Solar", "Rainbow"];
            return Gradients;
        })();
        Media.Gradients = Gradients;
    })(TypeViz.Media || (TypeViz.Media = {}));
    var Media = TypeViz.Media;
})(TypeViz || (TypeViz = {}));
//# sourceMappingURL=Media.js.map
