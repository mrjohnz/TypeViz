/// <reference path="qunit.d.ts" />
/// <reference path="common.ts" />
///<reference path='../../src/Extensions.ts' />
///<reference path='../../src/Maths.ts' />
///<reference path='../../src/Model.ts' />
///<reference path='../../src/Animation.ts' />
///<reference path='../../src/SVG.ts' />
///<reference path='../../src/Arrays.ts' />
///<reference path='../../src/Diagramming.ts' />
///<reference path='../../src/Diagramming.Graph.ts' />
///<reference path='../../src/Diagramming.Layout.ts' />

module UnitTests {
    import Range = TypeViz.Maths.Range;
    import Point = TypeViz.Point;
    import Matrix = TypeViz.SVG.Matrix;
    import HashTable = TypeViz.HashTable;
    import Node = TypeViz.Diagramming.Node;
    import Map = TypeViz.Map;

    /*-----------Hashtable tests------------------------------------*/
    QUnit.module("HashTable tests");

    test('Basics', function () {
        var ht = new HashTable();
        ht.Add(1);
        ok(ht.ContainsKey(1));
        ok(TypeViz.IsObject(ht.Get(1)));
        ht.Get(1).value = "Geri";
        ht.Get(1).prop = 147;
        ok(ht.Get(1).value == "Geri");
        ok(ht.Get(1).prop == 147);
        ok(ht.Get(5) == null);
        ht.Remove(1);
        ok(ht.Get(1) == null);
        ok(!ht.ContainsKey(1));

        ht = new HashTable();
        for (var i = 0; i < 10; i++) {
            ht.Add(new Node(i.toString()), i);
        }
        var vals = [];
        var acc = function (x) {
            vals.Add(x.value);
        };
        ht.ForEach(acc);
        ok(vals.length == 10, "Accumulation of ids.");

        ht = new HashTable();
        for (var i = 0; i < 10; i++) {
            ht.Add("k" + i, "v" + i);
        }
        equal(ht.length, 10);
        ht.Remove("m");
        equal(ht.length, 10);
        ht.Remove("k5");
        equal(ht.length, 9);
        ht.Set("k5", "Manifold");
        var Manifold = ht.Get("k5");
        equal(Manifold.value, "Manifold");
        var clone = ht.Clone();
        equal(clone.length, 10);
        var found = clone.Get("k3");
        ok(found != null && found.value == "v3");
        ok(clone.Get("nope") == null);
        ok(clone.Get("k5").value == "Manifold");
    });

    /*-----------Map tests------------------------------------*/
    QUnit.module("Map tests");

    test('Basics', function () {
        var dic = new Map();
        var counter = 0;
        dic.bind("changed", function (e) {
            counter++;
        });
        dic.Add(1, "Geri");
        dic.Add(3, "Miro");
        dic.Add(5, "Niko");
        dic.Add(7, { name: "Swa", shoe: 44 });
        ok(counter == 4, "Event is raised four times.");
        ok(dic.ContainsKey(3));
        var swa = dic.Get(7);
        ok(TypeViz.IsDefined(swa));
        ok(TypeViz.IsObject(swa));
        ok(swa.shoe == 44);
        dic.remove(3);
        ok(counter == 5, "Event is raised five times.");
        ok(!dic.ContainsKey(3));
        ok(dic.keys().length == 3);
        var r = [];
        dic.forEachValue(function (v) {
            if (TypeViz.IsString(v)) {
                r.push(v);
            }
            if (TypeViz.IsObject(v)) {
                r.push(v.name);
            }
        });
        var shouldbe = ["Geri", "Niko", "Swa"];
        ok(r.SameAs(shouldbe));

        dic = new Map();
        var n = new Node("1");
        dic.Add(n, 12);
        ok(dic.ContainsKey(n), "Should be there.");
        ok(dic.Get(n) == 12, "Correct value.");
        dic.Add(n, 13);
        ok(dic.Get(n) == 13, "Changed value.");
        dic.remove(n);
        ok(!dic.ContainsKey(n), "Should be gone now.");

        dic = new Map();
        for (var i = 0; i < 10; i++) {
            dic.Add(new Node(i.toString()), i);
        }
        var vals = [];
        var acc = function (k, v) {
            vals.Add(v);
        };
        dic.ForEach(acc);
        ok(vals.length == 10, "Accumulation of ids.");
        var shouldbeRange = new Range(0, 9);
        ok(shouldbeRange.Values.SameAs(vals), "Should be just a range.");

        vals = [];
        var accor = function (v) {
            vals.Add(v);
        };
        dic.forEachValue(accor);
        ok(vals.length == 10, "Accumulation of ids.");
        shouldbeRange = new Range(0, 9);
        ok(shouldbeRange.Values.SameAs(vals), "Should be just a range again.");
    });

    test('Load from existing dictionary', function () {
        var from = new Map();
        var data = new Range(0, 14);
        data.Values.ForEach(function (x) {
            from.Add(x, x.toString());
        });
        var to = new Map(from);
        ok(to.Count == 15, "Copied from the source dic.");
        ok(to.Get(10) == "10");
    });

    test("Load from literals", function () {
        var ik = {
            name: "Isaac Newton",
            business: "Gravitation"
        };

        var map = new TypeViz.Map(ik);
        equal(map.length, 2, "Only the proper properties should be present.");
        equal(map.Get("name"), "Isaac Newton");
        equal(map.Get("business"), "Gravitation");
        ok(!map.ContainsKey("length"), "Shouldn't be a length key.");
        ok(!map.ContainsKey("Get"), "Shouldn't be a Get key.");
    });

    /*-----------Map tests------------------------------------*/
    QUnit.module("Hierarchy tests");

    test("Basic hierarchy", function () {

        var stuff = {
            size: 5,
            name: "Root",
            kids: [
                {
                    size: 12,
                    name: "Kid 1"
                },
                {
                    size: 10,
                    name: "Kid 2",
                    kids: [
                        {
                            size: 15,
                            name: "Kid 2.1"
                        },
                        {
                            size: 13,
                            name: "Kid 2.2"
                        }
                    ]
                }
            ]
        };
        var tree = new TypeViz.TreeNode("Root");
        tree.Append(new TypeViz.TreeNode("First"));
        tree.Append(new TypeViz.TreeNode("Second"));
        ok(tree.Children.length == 2, "Two children expected.");
        ok(tree.Children[0].Data === "First", "First data value");
        ok(tree.Children[1].Data === "Second", "Second data value");

        var objtree = new TypeViz.TreeNode<Object>("Root");
        objtree.Append(new TypeViz.TreeNode(4));
        objtree.Append(new TypeViz.TreeNode(true));
        ok(objtree.Children.length == 2, "Two children expected.");
        ok(objtree.Children[0].Data === 4, "First data value");
        ok(objtree.Children[1].Data === true, "Second data value");


        var h = new TypeViz.Hierarchy(stuff, n=> n.kids, n=> n.size);
        ok(TypeViz.IsDefined(h), "The root should be returned.");
        ok(h.Nodes.length === 1);
        ok(h.Nodes[0].Data === 40,"Accumulation of the children.");
    });
}