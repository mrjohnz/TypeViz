/// <reference path="qunit.d.ts" />
/// <reference path="common.ts" />
///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Media.ts' />
///<reference path='../../src/Diagramming.ts' />
///<reference path='../../src/Layout.ts' />
module UnitTests {

    import SVG = TypeViz.SVG;

    QUnit.module("TypeViz tests");

    export class MyModel extends TypeViz.ModelBase
    {
        public get StockValue() { return Math.floor(Math.random()*100);}
    }
    export class MyContext {
        private heard = false;
        public get Heard() { return this.heard; }
        public set Heard(v) { this.heard = v; }
    }

    test("IsColor", function () {

        var color = TypeViz.Media.Colors.Random;
        ok(TypeViz.IsColor(color));
        ok(!TypeViz.IsColor("#457152"));
        
    });

    test("ModelBase events", function () {
        var model = new TypeViz.ModelBase();
        var passed = false;
        var sub = function () { passed = true; };
        model.Subscribe(sub);
        model.RaiseChanged();
        ok(passed);
        passed = false;
        model.RemoveSubscriber(sub);
        model.RaiseChanged();
        ok(!passed);
        var xpass = false;
        var onlyX = function (m, name) { if (name == "X") { xpass = true; } };
        model.Subscribe(onlyX);
        model.RaiseChanged("Y");
        ok(!xpass);
        model.RaiseChanged("X");
        ok(xpass);       
    });

    test("Extended Model", function () {
        var model: TypeViz.IModel = new MyModel();
        var context = new MyContext();
        var listener = function (m, name) { if (name == "StockValue") this.Heard = true; };
        model.Subscribe(listener);
        model.RaiseChanged("StockValue", context); // different context!
        ok(context.Heard);
    });

    test("Binding", function () {

        var circle = new TypeViz.SVG.Circle();
        circle.DataContext = new TypeViz.ModelBase();
        var raised = false;
        var subscription = function (model, label) {
            raised = true;
            if (label === "special") return 144;
            return 566;
        };
        circle.Bind("Radius", subscription);
        circle.DataContext.RaiseChanged();
        ok(raised);
        equal(circle.Radius, 566);
        circle.DataContext.RaiseChanged("special");
        equal(circle.Radius, 144);
        circle.Unbind(subscription);
        circle.Radius = 100;
        circle.DataContext.RaiseChanged("special");
        circle.DataContext.RaiseChanged();
        equal(circle.Radius, 100);
    });

    test("Functor property", function () {
        var circle = new TypeViz.SVG.Circle(); 
        circle.Radius = 112;
        circle.DataContext = {
            Radius: 155
        };
        equal(circle.Radius, 112);
        circle.Radius = function (model) { return model.Radius; };
        equal(circle.Radius, 155);
    });

    test("Point", function () {
        var p = new TypeViz.Point(10, 30);
        ok(p.Plus(new TypeViz.Point(10, 0)).X == 20);
        ok(p.Minus(new TypeViz.Point(10, 10)).X == 0);
        ok(p.Times(3).X == 30);
        ok(new TypeViz.Point(10, 0).ToPolar().Angle == 0);
        ok(new TypeViz.Point(10, 10).ToPolar().Angle == Math.PI/4);
        ok(new TypeViz.Point(0, 10).ToPolar().R == 10);
    });
}