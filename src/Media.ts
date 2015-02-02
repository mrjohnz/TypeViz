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
module TypeViz {

    import Point = TypeViz.Point;
   

    export module Media {
        /**
         * The spreading methods of the radial gradient.
         * Pad is used by default in the RadialGradient.
         */
        export enum RadialGradientSpreadMethod {
            Pad = 0,
            Reflect = 1,
            Repeat = 2
        }

        /**
         * Base class for the LinearGradient and RadialGradient.
         */
        export class GradientBase {
            private stops: GradientStop[] = [];
            public nativeElement;

            constructor() {
            }

            public get Native() {
                return this.nativeElement;
            }

            public get Id() {
                return this.Native == null ? null : this.Native.id;
            }

            public set Id(value) {
                this.Native.id = value;
            }

            public get GradientStops() {
                return this.stops;
            }

            public AddGradientStop(stop: GradientStop) {
                if (stop == null) throw "The given GradientStop is null.";
                this.stops.push(stop);
                this.Native.appendChild(stop.Native);
            }

            public AddGradientStops(...stops: Array<GradientStop>) {
                if (stops == null) return;
                for (var i = 0; i < stops.length; i++) {
                    this.AddGradientStop(stops[i]);
                }
            }

            public RemoveGradientStop(stop: GradientStop) {
                if (stop == null) throw "The given GradientStop is null.";
                if (!this.stops.Contains(stop)) return;
                this.stops.Remove(stop);
                this.Native.removeChild(stop.Native);
            }

            public ClearStops() {
                this.stops.Clear();
                while (this.Native.childNodes.length > 0) {
                    this.Native.removeChild(this.Native.childNodes[0]);
                }
            }

            public Reverse() {
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
            }
        }

        /**
         * A radial gradient.
         */
        export class RadialGradient extends GradientBase {


            constructor() {
                super();
                this.nativeElement = <SVGRadialGradientElement>document.createElementNS(TypeViz.SVG.NS, "radialGradient");
                this.Id = TypeViz.RandomId();
                this.Center = new TypeViz.Point(0.5, 0.5);
            }


            public get Center(): Point {
                var cx = this.Native.getAttribute("cx") ? parseFloat(this.Native.getAttribute("cx")) : 0;
                var cy = this.Native.getAttribute("cy") ? parseFloat(this.Native.getAttribute("cy")) : 0;
                return new Point(cx, cy);
            }

            public set Center(value: Point) {
                this.Native.setAttribute("cx", this.truncatedValue(value.X));
                this.Native.setAttribute("cy", this.truncatedValue(value.Y));
            }


            public get Radius() {
                return this.Native.getAttribute("r") ? parseFloat(this.Native.getAttribute("r")) : 0;
            }

            public set Radius(value) {
                this.Native.setAttribute("r", value.toString());
            }

            public get SpreadMethod(): RadialGradientSpreadMethod {
                return this.Native.getAttribute("spreadMethod") ? this.toSpreadEnum(this.Native.getAttribute("spreadMethod")) : RadialGradientSpreadMethod.Pad;
            }

            public set SpreadMethod(value: RadialGradientSpreadMethod) {
                this.Native.setAttribute("spreadMethod", this.toSpreadString(value));
            }

            private truncatedValue(value: number) {
                return Math.max(0, Math.min(1, value)).toString();
            }

            private toSpreadEnum(method: string) {
                switch (method.toLowerCase()) {
                    case "pad":
                        return RadialGradientSpreadMethod.Pad;
                    case "reflect":
                        return RadialGradientSpreadMethod.Reflect;
                    case "repeat":
                        return RadialGradientSpreadMethod.Repeat;
                }
            }

            private toSpreadString(method: RadialGradientSpreadMethod) {
                switch (method) {
                    case RadialGradientSpreadMethod.Pad:
                        return "pad";
                    case RadialGradientSpreadMethod.Reflect:
                        return "reflect";
                    case RadialGradientSpreadMethod.Repeat:
                        return "repeat";
                }
            }
        }

        /**
         * A linear gradient.
         */
        export class LinearGradient extends GradientBase {
            private from: Point;
            private to: Point;

            private canvas: TypeViz.SVG.Canvas;

            /**
             * Instantiates a new Line.
             */
            constructor(canvas: TypeViz.SVG.Canvas = null, from: Point = null, to: Point = null) {
                super();
                this.nativeElement = <SVGLinearGradientElement>document.createElementNS(TypeViz.SVG.NS, "linearGradient");
                this.canvas = canvas;
                this.from = from;
                this.to = to;
                this.Id = TypeViz.RandomId();
            }


            /**
             * Gets the point where the gradient starts.
             */
            public get From() {
                return this.from;
            }

            /**
             * Sets the point where the gradient starts. The value should be in the [0,1] interval.
             */
            public set From(value) {
                if (this.from != value) {
                    this.Native.setAttribute("x1", (value.X * 100).toString() + "%");
                    this.Native.setAttribute("y1", (value.Y * 100).toString() + "%");
                    this.from = value;
                }
            }

            /**
             * Gets the point where the gradient ends.
             */
            public get To() {
                return this.to;
            }

            /**
             * Sets the point where the gradient ends.The value should be in the [0,1] interval.
             */
            public set To(value) {
                if (this.to != value) {
                    this.Native.setAttribute("x2", (value.X * 100).toString() + "%");
                    this.Native.setAttribute("y2", (value.Y * 100).toString() + "%");
                    this.to = value;
                }
            }


        }

        /**
         * Represents a gradient stop.
         */
        export class GradientStop {
            private nativeElement = <SVGStopElement>document.createElementNS(TypeViz.SVG.NS, "stop");
            private color: Color = Colors.White;

            /**
             * Instantiates a GradientStop.
             * @param color The color of the stop.
             * @param offset The offset should be in the [0,1] interval.
             */
            constructor(color: Color = null, offset: number = null) {
                if (color == null) this.Color = Colors.White;
                else this.Color = color;

                if (offset == null) this.Offset = 0.0;
                else this.Offset = TypeViz.LimitValue(offset);
            }

            public get Native() {
                return this.nativeElement;
            }

            /**
             * The offset is a value in the [0,1] range.
             */
            public get Offset(): number {
                if (this.nativeElement.attributes["offset"] == null) return 0.0;
                return parseFloat(this.nativeElement.attributes["offset"].value) / 100.0;
            }

            /**
             * Sets the offset where this gradient stop starts.The value should be in the [0,1] interval.
             */
            public set Offset(value: number) {
                if (value < 0 || value > 1) throw "The Offset of the gradient stop should be in the [0,1] interval.";
                this.Native.setAttribute("offset", (value * 100.0).toString() + "%");
            }

            public get Color(): Color {
                return this.color;
            }

            public set Color(value: Color) {
                if (value == null) throw "The color cannot be null.";
                this.color = value;
                this.Native.style.stopColor = value.AsCSS1Color;
                this.Native.style.stopOpacity = value.A == null ? "1.0" : value.A.toString();
            }


        }

        /**
         * An RGB color definition. The values should be in the [0, 255] interval.
         */
        export class RGB {
            public R;
            public G;
            public B;

            constructor(r, g, b) {
                this.R = r;
                this.G = g;
                this.B = b;
            }

            public Darker(k?) {
                if (!k) k = 0.2;
                k = Math.pow(.7, k);
                return new RGB(~~(k * this.R), ~~(k * this.G), ~~(k * this.B));
            }

            public Brighter(k?) {
                if (!k) k = 0.2;
                k = Math.pow(.7, k);
                var r = this.R, g = this.G, b = this.B, i = 30;
                if (!r && !g && !b) return new RGB(i, i, i);
                if (r && r < i) r = i;
                if (g && g < i) g = i;
                if (b && b < i) b = i;
                return new RGB(Math.min(255, ~~(r / k)), Math.min(255, ~~(g / k)), Math.min(255, ~~(b / k)));
            }

            public get AsHSL(): HSL {
                return ColorConverters.RGB2HSL(this);
            }

            public get AsHex6() {
                return (new Color(this)).AsHex6;
            }

            public toString() { return "rgb(" + this.R + ", " + this.G + ", " + this.B + ")"; }
        }

        /**
         * An HSL color definition.
         The hue sits in the [0,360] range while the saturation and lightness are in the [0,1] range.
         */
        export class HSL {
            public H;
            public S;
            public L;

            constructor(h, s, l) {
                this.H = h;
                this.S = s;
                this.L = l;
            }

            /**
             * Returns a brighter HSL from the current one.
             * @param k The brightness factor determines the increase.
             * @returns {TypeViz.HSL}
             */
            public Brighter(k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new HSL(this.H, this.S, this.L / k);
            }

            /**
             * Returns a darker HSL from the current one.
             * @param k The darkness factor determines the increase.
             * @returns {TypeViz.HSL}
             */
            public Darker(k) {
                k = Math.pow(.7, arguments.length ? k : 1);
                return new HSL(this.H, this.S, k * this.L);
            }

            /**
             * Returns the converted HSL to RGB.
             * @returns {RGB}
             */
            public get AsRGB(): RGB {
                return ColorConverters.HSL2RGB(this);
            }

            /**
             * Returns this HSL as a hexadecimal color string.
             * @returns {string}
             */
            public get AsHex6() {
                return (new Color(this)).AsHex6;
            }
            public toString() { return "hsl(" + this.H + ", " + this.S + ", " + this.L + ")"; }

        }

        /**
         * Represents an SVG color.
         */
        export class Color {
            private r: number = 0.0;
            private g: number = 0.0;
            private b: number = 0.0;
            private a: number = 1.0;

            public get R(): number {
                return this.r;
            }

            public get G(): number {
                return this.g;
            }

            public get B(): number {
                return this.b;
            }

            public get A(): number {
                return this.a;
            }

            public get RGB(): RGB {
                return new RGB(this.r, this.g, this.b);
            }

            public get HSL(): HSL {
                return this.RGB.AsHSL;
            }

            /**
             * Returns a brighter variation of the current color.
             */
            public Brighter(k?) {
                var rgb = new RGB(this.r, this.g, this.b);
                rgb = rgb.Brighter(k);
                this.r = rgb.R;
                this.g = rgb.G;
                this.b = rgb.B;
                return this;
            }

            /**
             * Returns a darker variation of the current color.
             */
            public Darker(k?) {
                var rgb = new RGB(this.r, this.g, this.b);
                rgb = rgb.Darker(k);
                this.r = rgb.R;
                this.g = rgb.G;
                this.b = rgb.B;
                return this;
            }

            constructor();

            constructor(hexvalue: string);

            constructor(hsl: HSL);

            constructor(rgb: RGB);

            constructor(r: number, g: number, b: number);

            constructor(r: number, g: number, b: number, a: number);

            constructor(r: any = null, g: number = null, b: number = null, a: number = null) {
                if (r == null) return;
                if (IsString(r)) {
                    var s = <string>r;
                    if (s.substring(0, 1) == "#") s = s.substr(1);
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
                    }
                    else throw "The string '" + r + "' could not be converted to a color value.";
                }
                else if (IsNumber(r)) {
                    this.r = parseFloat(r);
                    this.g = g;
                    this.b = b;
                    if (a != null) this.a = a;
                    this.FixValues();
                }
                else if (r instanceof RGB) {
                    this.r = r.R;
                    this.g = r.G;
                    this.b = r.B;
                }
                else if (r instanceof HSL) {
                    var rgb = (<HSL>r).AsRGB;
                    this.r = rgb.R;
                    this.g = rgb.G;
                    this.b = rgb.B;
                }

            }

            static Parse(s: string): Color {
                if (s == null || s.length == 0) throw "Empty string";
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
            }

            public get AsCSS1() {
                return 'fill:rgb(' + this.R + ', ' + this.G + ', ' + this.B + '); fill-opacity:' + this.a + ';';
            }

            public get AsCSS1Color() {
                return 'rgb(' + this.R + ', ' + this.G + ', ' + this.B + ')';
            }

            public get AsCSS3() {
                return 'fill:rgba(' + this.R + ', ' + this.G + ', ' + this.B + ', ' + this.a + ')';
            }

            public get AsHex6(): string {
                return ColorConverters.RgbToHex(this.r, this.g, this.b).toUpperCase();
            }

            private FixValues() {
                this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
                this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
                this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
                this.a = (this.a < 0 || isNaN(this.a)) ? 0 : ((this.a > 255) ? 255 : this.a);
            }

        }

        /**
         * Collects Color conversion utils.
         */
        export class ColorConverters {

            /**
             * Returns an array of all color conversion methods.
             */
            public static get All() {
                return [ColorConverters.HEX6, ColorConverters.HEX3, ColorConverters.RGB];
            }

            private static componentToHex(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }

            /**
             * Converts the given RGB values to an hexadecimal representation.
             */
            public static RgbToHex(r, g, b): string {
                return "#" + ColorConverters.componentToHex(r) + ColorConverters.componentToHex(g) + ColorConverters.componentToHex(b);
            }

            /**
             * Returns the hexadecimal (six characters) converter.
             */
            public static get HEX6(): IColorConverter {
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
            }

            /**
             * Returns the hexadecimal (three characters) converter.
             */
            static get HEX3(): IColorConverter {
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
            }

            /**
             * Returns the RGB converter.
             */
            static get RGB(): IColorConverter {
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
            }

            public static RGB2HSL(rgb: RGB): HSL {
                var r = rgb.R, g = rgb.G, b = rgb.B;
                var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
                if (d) {
                    s = l < .5 ? d / (max + min) : d / (2 - max - min);
                    if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
                    h *= 60;
                } else {
                    h = 0;
                    s = l > 0 && l < 1 ? 0 : h;
                }
                return new HSL(h, s, l);
            }

            public static HSL2RGB(hsl: HSL) {
                var h = hsl.H, s = hsl.S, l = hsl.L;
                var m1, m2;
                h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
                s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
                l = l < 0 ? 0 : l > 1 ? 1 : l;
                m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
                m1 = 2 * l - m2;
                function v(h) {
                    if (h > 360) h -= 360; else if (h < 0) h += 360;
                    if (h < 60) return m1 + (m2 - m1) * h / 60;
                    if (h < 180) return m2;
                    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
                    return m1;
                }

                function vv(h) {
                    return Math.round(v(h) * 255);
                }

                return new RGB(vv(h + 120), vv(h), vv(h - 120));
            }
        }

        /**
         * Defines the color conversion interface.
         */
        export interface IColorConverter {
            RegEx: string;
            Parse(bits: RegExpExecArray): number[];
        }

        /**
         * A collection of predefined colors.
         */
        export class Colors {

            public static KnownColors = {
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

            static Parse(name: string): Color {
                for (var key in Colors.KnownColors) {
                    if (name == key) return new Color(Colors.KnownColors[key]);
                }
                return null;
            }

            /**
             * Returns a random known color.
             */
            static get Random() {
                var result;
                var count = 0;
                for (var prop in this.KnownColors)
                    if (Math.random() < 1 / ++count)
                        result = prop;

                return Colors.Parse(result);
            }

            /**
             * Returns a random color in the blueish range.
             */
            static get RandomBlue() {
                return new Color(new HSL(222, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
            }

            /**
             * Returns a random color in the redish range.
             */
            static get RandomRed() {
                return new Color(new HSL(2, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
            }

            /**
             * Returns a random color in the greenish range.
             */
            static get RandomGreen() {
                return new Color(new HSL(115, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
            }

            /**
             * Returns a random color in the purpleish range.
             */
            static get RandomPurple() {
                return new Color(new HSL(290, TypeViz.Maths.RandomReal(0.2, 0.9), TypeViz.Maths.RandomReal(0.3, 0.8)));
            }

            /**
             * Returns a random color in the gray range.
             */
            static get RandomGray() {
                return new Color(new HSL(0, 0, TypeViz.Maths.RandomReal(0.3, 0.8)));
            }


            static get AliceBlue() {
                return new Color("F0F8FF");
            }

            static get AntiqueWhite() {
                return new Color("FAEBD7");
            }

            static get Aqua() {
                return new Color("00FFFF");
            }

            static get Aquamarine() {
                return new Color("7FFFD4");
            }

            static get Azure() {
                return new Color("F0FFFF");
            }

            static get Beige() {
                return new Color("F5F5DC");
            }

            static get Bisque() {
                return new Color("FFE4C4");
            }

            static get Black() {
                return new Color("000000");
            }

            static get BlanchedAlmond() {
                return new Color("	FFEBCD");
            }

            static get Blue() {
                return new Color("0000FF");
            }

            static get BlueViolet() {
                return new Color("8A2BE2");
            }

            static get Brown() {
                return new Color("A52A2A");
            }

            static get BurlyWood() {
                return new Color("DEB887");
            }

            static get CadetBlue() {
                return new Color("5F9EA0");
            }

            static get Chartreuse() {
                return new Color("7FFF00");
            }

            static get Chocolate() {
                return new Color("D2691E");
            }

            static get Coral() {
                return new Color("FF7F50");
            }

            static get CornflowerBlue() {
                return new Color("	6495ED");
            }

            static get Cornsilk() {
                return new Color("FFF8DC");
            }

            static get Crimson() {
                return new Color("DC143C");
            }

            static get Cyan() {
                return new Color("00FFFF");
            }

            static get DarkBlue() {
                return new Color("00008B");
            }

            static get DarkCyan() {
                return new Color("008B8B");
            }

            static get DarkGoldenRod() {
                return new Color("	B8860B");
            }

            static get DarkGray() {
                return new Color("A9A9A9");
            }

            static get DarkGreen() {
                return new Color("006400");
            }

            static get DarkKhaki() {
                return new Color("BDB76B");
            }

            static get DarkMagenta() {
                return new Color("8B008B");
            }

            static get DarkOliveGreen() {
                return new Color("	556B2F");
            }

            static get Darkorange() {
                return new Color("FF8C00");
            }

            static get DarkOrchid() {
                return new Color("9932CC");
            }

            static get DarkRed() {
                return new Color("8B0000");
            }

            static get DarkSalmon() {
                return new Color("E9967A");
            }

            static get DarkSeaGreen() {
                return new Color("8FBC8F");
            }

            static get DarkSlateBlue() {
                return new Color("	483D8B");
            }

            static get DarkSlateGray() {
                return new Color("	2F4F4F");
            }

            static get DarkTurquoise() {
                return new Color("	00CED1");
            }

            static get DarkViolet() {
                return new Color("9400D3");
            }

            static get DeepPink() {
                return new Color("FF1493");
            }

            static get DeepSkyBlue() {
                return new Color("00BFFF");
            }

            static get DimGray() {
                return new Color("696969");
            }

            static get DimGrey() {
                return new Color("696969");
            }

            static get DodgerBlue() {
                return new Color("1E90FF");
            }

            static get FireBrick() {
                return new Color("B22222");
            }

            static get FloralWhite() {
                return new Color("FFFAF0");
            }

            static get ForestGreen() {
                return new Color("228B22");
            }

            static get Fuchsia() {
                return new Color("FF00FF");
            }

            static get Gainsboro() {
                return new Color("DCDCDC");
            }

            static get GhostWhite() {
                return new Color("F8F8FF");
            }

            static get Gold() {
                return new Color("FFD700");
            }

            static get GoldenRod() {
                return new Color("DAA520");
            }

            static get Gray() {
                return new Color("808080");
            }

            static get Green() {
                return new Color("008000");
            }

            static get GreenYellow() {
                return new Color("ADFF2F");
            }

            static get HoneyDew() {
                return new Color("F0FFF0");
            }

            static get HotPink() {
                return new Color("FF69B4");
            }

            static get IndianRed() {
                return new Color("CD5C5C");
            }

            static get Indigo() {
                return new Color("4B0082");
            }

            static get Ivory() {
                return new Color("FFFFF0");
            }

            static get Khaki() {
                return new Color("F0E68C");
            }

            static get Lavender() {
                return new Color("E6E6FA");
            }

            static get LavenderBlush() {
                return new Color("	FFF0F5");
            }

            static get LawnGreen() {
                return new Color("7CFC00");
            }

            static get LemonChiffon() {
                return new Color("FFFACD");
            }

            static get LightBlue() {
                return new Color("ADD8E6");
            }

            static get LightCoral() {
                return new Color("F08080");
            }

            static get LightCyan() {
                return new Color("E0FFFF");
            }

            static get LightGoldenRodYellow() {
                return new Color("	FAFAD2");
            }

            static get LightGray() {
                return new Color("D3D3D3");
            }

            static get LightGreen() {
                return new Color("90EE90");
            }

            static get LightPink() {
                return new Color("FFB6C1");
            }

            static get LightSalmon() {
                return new Color("FFA07A");
            }

            static get LightSeaGreen() {
                return new Color("	20B2AA");
            }

            static get LightSkyBlue() {
                return new Color("87CEFA");
            }

            static get LightSlateGray() {
                return new Color("	778899");
            }

            static get LightSteelBlue() {
                return new Color("	B0C4DE");
            }

            static get LightYellow() {
                return new Color("FFFFE0");
            }

            static get Lime() {
                return new Color("00FF00");
            }

            static get LimeGreen() {
                return new Color("32CD32");
            }

            static get Linen() {
                return new Color("FAF0E6");
            }

            static get Magenta() {
                return new Color("FF00FF");
            }

            static get Maroon() {
                return new Color("800000");
            }

            static get MediumAquaMarine() {
                return new Color("	66CDAA");
            }

            static get MediumBlue() {
                return new Color("0000CD");
            }

            static get MediumOrchid() {
                return new Color("BA55D3");
            }

            static get MediumPurple() {
                return new Color("9370DB");
            }

            static get MediumSeaGreen() {
                return new Color("	3CB371");
            }

            static get MediumSlateBlue() {
                return new Color("	7B68EE");
            }

            static get MediumSpringGreen() {
                return new Color("	00FA9A");
            }

            static get MediumTurquoise() {
                return new Color("	48D1CC");
            }

            static get MediumVioletRed() {
                return new Color("	C71585");
            }

            static get MidnightBlue() {
                return new Color("191970");
            }

            static get MintCream() {
                return new Color("F5FFFA");
            }

            static get MistyRose() {
                return new Color("FFE4E1");
            }

            static get Moccasin() {
                return new Color("FFE4B5");
            }

            static get NavajoWhite() {
                return new Color("FFDEAD");
            }

            static get Navy() {
                return new Color("000080");
            }

            static get OldLace() {
                return new Color("FDF5E6");
            }

            static get Olive() {
                return new Color("808000");
            }

            static get OliveDrab() {
                return new Color("6B8E23");
            }

            static get Orange() {
                return new Color("FFA500");
            }

            static get OrangeRed() {
                return new Color("FF4500");
            }

            static get Orchid() {
                return new Color("DA70D6");
            }

            static get PaleGoldenRod() {
                return new Color("	EEE8AA");
            }

            static get PaleGreen() {
                return new Color("98FB98");
            }

            static get PaleTurquoise() {
                return new Color("	AFEEEE");
            }

            static get PaleVioletRed() {
                return new Color("	DB7093");
            }

            static get PapayaWhip() {
                return new Color("FFEFD5");
            }

            static get PeachPuff() {
                return new Color("FFDAB9");
            }

            static get Peru() {
                return new Color("CD853F");
            }

            static get Pink() {
                return new Color("FFC0CB");
            }

            static get Plum() {
                return new Color("DDA0DD");
            }

            static get PowderBlue() {
                return new Color("B0E0E6");
            }

            static get Purple() {
                return new Color("800080");
            }

            static get Red() {
                return new Color("FF0000");
            }

            static get RosyBrown() {
                return new Color("BC8F8F");
            }

            static get RoyalBlue() {
                return new Color("4169E1");
            }

            static get SaddleBrown() {
                return new Color("8B4513");
            }

            static get Salmon() {
                return new Color("FA8072");
            }

            static get SandyBrown() {
                return new Color("F4A460");
            }

            static get SeaGreen() {
                return new Color("2E8B57");
            }

            static get SeaShell() {
                return new Color("FFF5EE");
            }

            static get Sienna() {
                return new Color("A0522D");
            }

            static get Silver() {
                return new Color("C0C0C0");
            }

            static get SkyBlue() {
                return new Color("87CEEB");
            }

            static get SlateBlue() {
                return new Color("6A5ACD");
            }

            static get SlateGray() {
                return new Color("708090");
            }

            static get Snow() {
                return new Color("FFFAFA");
            }

            static get SpringGreen() {
                return new Color("0FF7F");
            }

            static get SteelBlue() {
                return new Color("4682B4");
            }

            static get Tan() {
                return new Color("D2B48C");
            }

            static get Teal() {
                return new Color("008080");
            }

            static get Thistle() {
                return new Color("D8BFD8");
            }

            static get Tomato() {
                return new Color("FF6347");
            }

            static get Turquoise() {
                return new Color("40E0D0");
            }

            static get Violet() {
                return new Color("EE82EE");
            }

            static get Wheat() {
                return new Color("F5DEB3");
            }

            static get White() {
                return new Color("FFFFFF");
            }

            static get WhiteSmoke() {
                return new Color("F5F5F5");
            }

            static get Yellow() {
                return new Color("FFFF00");
            }

            static get YellowGreen() {
                return new Color("9ACD32");
            }


        }

        /**
         * Picks the colors at a regular interval from a given (linear) gradient.
         */
        export class GradientSampler {


            private indexStart = 0;
            private indexEnd = 10;
            private colors = ['ff0000', 'ffff00', '00ff00', '0000ff'];
            private defs = [];

            public get IndexStart() {
                return this.indexStart;
            }

            public set IndexStart(value) {
                this.indexStart = value;
                this.setColours(this.colors);
            }


            public get IndexEnd() {
                return this.indexEnd;
            }

            public set IndexEnd(value) {
                this.indexEnd = value;
                this.setColours(this.colors);
            }

            /**
             * The argument can be a LinearGradient or an array of Color.
             */
            constructor(colors?) {
                /**
                @colors An array of colors or a gradient.
                */
                if (colors != null) {
                    if (colors instanceof LinearGradient) {
                        this.colors = [];
                        var lg = <LinearGradient>colors;
                        for (var i = 0; i < lg.GradientStops.length; i++) {
                            var gradstop = lg.GradientStops[i];
                            this.colors.push(gradstop.Color.AsHex6);
                        }
                    }
                    else if (colors instanceof Array) {
                        this.colors = [];
                        for (var j = 0; j < colors.length; j++) {
                            var c = colors[j];
                            if (c instanceof Color) this.colors.push((<Color>c).AsHex6);
                            else if (IsString(c)) this.colors.push(c);
                            else throw "Colors in the array should be HEX strings or instance of Color.";
                        }
                    }
                }
                if (this.colors == null || this.colors.length == 0)
                    throw "No colors to sample from.";
                this.setColours(this.colors);
            }

            ColorAt(n) {

                if (isNaN(n)) {
                    throw new TypeError(n + ' is not a number');
                } else if (this.defs.length === 1) {
                    return this.fromPart(this.defs[0], n);
                } else {
                    var segment = (this.indexEnd - this.indexStart) / (this.defs.length);
                    var index = Math.min(Math.floor((Math.max(n, this.indexStart) - this.indexStart) / segment), this.defs.length - 1);
                    return this.fromPart(this.defs[index], n);
                }
            }

            fromPart(part, n) {
                return this.calcHex(n, part.From.substring(1, 3), part.To.substring(1, 3))
                    + this.calcHex(n, part.From.substring(3, 5), part.To.substring(3, 5))
                    + this.calcHex(n, part.From.substring(5, 7), part.To.substring(5, 7));
            }

            calcHex(n, channelStart_Base16, channelEnd_Base16) {
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
            }

            formatHex(hex) {
                if (hex.length === 1) {
                    return '0' + hex;
                } else {
                    return hex;
                }
            }

            setColours(spectrum) {
                if (spectrum.length < 2) {
                    throw new Error('Rainbow must have two or more colors.');
                } else {
                    var increment = (this.indexEnd - this.indexStart) / (spectrum.length - 1);
                    this.defs = [
                        {
                            From: spectrum[0],
                            To: spectrum[1],
                            Min: this.indexStart,
                            Max: this.indexStart + increment,
                        }
                    ];
                    for (var i = 1; i < spectrum.length - 1; i++) {
                        this.defs.push({
                            From: spectrum[i],
                            To: spectrum[i + 1],
                            Min: this.indexStart + increment * i,
                            Max: this.indexStart + increment * (i + 1),
                        });
                    }

                    this.colors = spectrum;
                    return this;
                }
            }
        }

        /**
         * A collection of predefined gradients.
         * Note that you need to use AppendGradient on the Canvas to make it accessible by elements. It's just the way SVG works.
         */
        export class Gradients {
            private static names = ["Beach", "BlueWhite", "Temperature", "Solar", "Rainbow"];

            public static get Names() {
                return Gradients.names;
            }

            public static FromName(name) {
                if (Gradients.names.Contains(name))
                    return Gradients[name];
            }

            public static get BlueWhite() {
                var g = new LinearGradient();
                g.Id = "BlueWhite";
                var b = new GradientStop(Colors.SteelBlue, 0);
                var w = new GradientStop(Colors.White, 1);
                g.AddGradientStops(b, w);
                return g;
            }

            public static get Beach() {
                var g = new LinearGradient();
                g.Id = "Beach";
                var o = new GradientStop(Colors.Orange, 0);
                var y = new GradientStop(Colors.Yellow, 0.4);
                var a = new GradientStop(Colors.Azure, 0.7);
                var c = new GradientStop(Colors.CornflowerBlue, 0.9);
                g.AddGradientStops(o, y, a, c);
                return g;
            }

            public static get Solar() {
                var g = new LinearGradient();
                g.Id = "Solar";
                var d = new GradientStop(Colors.DarkRed, 0);
                var r = new GradientStop(Colors.Red, 0.4);
                var y = new GradientStop(Colors.Yellow, 0.9);
                g.AddGradientStops(d, r, y);
                return g;
            }

            public static get Temperature() {
                var g = new LinearGradient();
                g.Id = "Temperature";
                var b = new GradientStop(Colors.Blue, 0);
                var a = new GradientStop(Colors.CornflowerBlue, 0.2);
                var w = new GradientStop(Colors.White, 0.4);
                var y = new GradientStop(Colors.Yellow, 0.7);
                var r = new GradientStop(Colors.Red, 0.9);
                g.AddGradientStops(b, a, w, y, r);
                return g;
            }

            public static get Rainbow() {
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
            }

        }
    }
}