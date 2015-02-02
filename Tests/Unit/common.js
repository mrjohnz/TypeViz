/// <reference path="qunit.d.ts" />
/// <reference path='../../src/Extensions.ts' />
/// <reference path='../../src/Maths.ts' />
/// <reference path='../../src/Model.ts' />
/// <reference path='../../src/Animation.ts' />
/// <reference path='../../src/SVG.ts' />
/// <reference path='../../src/Arrays.ts' />
/// <reference path='../../src/Structures.ts' />
/// <reference path='../../src/Media.ts' />
/// <reference path='../../src/Diagramming.ts' />
var UnitTests;
(function (UnitTests) {
    var SVG = TypeViz.SVG;
    var Point = TypeViz.Point;

    /**
    * Skips the test.
    */
    UnitTests.testSkip = function (a, f) {
        QUnit.test(a + ' [SKIPPED]', function () {
            var li = document.getElementById(QUnit.config.current["id"]);
            QUnit.done(function () {
                li.style.background = '#FFFF99';
            });
            ok(true);
        });
    };

    /**
    * A sample undo unit.
    */
    var Task = (function () {
        function Task(title) {
            this.Count = 0;
            this.Title = title;
        }
        Task.prototype.Undo = function () {
            this.Count--;
        };

        Task.prototype.Redo = function () {
            this.Count++;
        };

        Object.defineProperty(Task.prototype, "IsEmpty", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        return Task;
    })();
    UnitTests.Task = Task;

    /**
    * Returns a string representation of how mny elements there are.
    */
    var lexicCount = function (c, name) {
        switch (c) {
            case 0:
                return null;
            case 1:
                return "one " + name;
            default:
                return c + " " + name + "s";
        }
    };

    /*
    * Returns a summary of the found diagram objects in the given object.
    */
    var CountObjects = function (obj) {
        var items = [];
        if (obj.shapes && obj.shapes.Items)
            items.push(lexicCount(obj.shapes.Items.length, "shape"));
        if (obj.groups && obj.groups.Items)
            items.push(lexicCount(obj.groups.Items.length, "group"));
        if (obj.connections && obj.connections.Items)
            items.push(lexicCount(obj.connections.Items.length, "connection"));

        switch (items.length) {
            case 0:
                return "The XML contained an empty diagram.";
            case 1:
                return "Found " + items[0];
            case 2:
                return "Found " + items[0] + " and " + items[1];
            case 3:
                return "Found " + items[0] + ", " + items[1] + " and " + items[2];
        }
    };

    /**
    * The accuracy of the unit tests.
    */
    UnitTests.Accuracy = 1E-6;

    UnitTests.AddShape = function (diagram, p, shape, id) {
        if (typeof p === "undefined") { p = Point.Empty; }
        if (typeof shape === "undefined") { shape = TypeViz.Diagramming.Shapes.Rectangle; }
        if (typeof id === "undefined") { id = null; }
        shape.Position = p;
        shape.Width = 200;
        shape.Height = 100;
        shape.Id = id;
        shape.Background = "#778899";
        return diagram.AddShape(shape);
    };
    UnitTests.AddCircle = function (canvas, p, radius) {
        if (typeof radius === "undefined") { radius = 25; }
        var circ = new SVG.Circle();
        circ.Position = p;
        circ.Radius = radius;
        circ.Background = "Orange";
        canvas.Append(circ);
        return circ;
    };
    UnitTests.AddConnection = function (diagram, from, to) {
        return diagram.AddConnection(from, to);
    };

    /**
    * Get the root DIV and clears its contents.
    */
    UnitTests.GetRoot = function () {
        var root = document.getElementById('canvas');
        if (root == null)
            throw "The unit testing requires a DIV with name 'canvas'.";
        var children = root.childNodes;
        if (children.length > 0)
            for (var i = 0; i < children.length; i++)
                root.removeChild(children[i]);
        return root;
    };
})(UnitTests || (UnitTests = {}));
//# sourceMappingURL=common.js.map
