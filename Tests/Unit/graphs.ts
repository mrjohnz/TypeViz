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
    import Link = TypeViz.Diagramming.Link;
    import Map = TypeViz.Map;
    import Graph = TypeViz.Diagramming.Graph;
    

    /*-----------Graph structure tests------------------------------------*/
    QUnit.module("Graph structure tests");

    test('Node basics', function () {

        var n = new Node();
        n.id = "GR";
        ok(n.id == "GR");
        n.Bounds=new TypeViz.Rect(0, 0, 120, 150);
        ok(n.Bounds.X == 0 && n.Bounds.Y == 0 && n.Bounds.Width == 120 && n.Bounds.Height == 150, "Correct dimensions.");

        var g = new Graph();
        g.id = "Def";
        ok(g.id == "Def");
        var a11 = g.addNode("A11");
        ok(g.hasNode("A11"));
        ok(g.hasNode(a11));
        ok(a11 == g.getNode("A11"), "Getting a node in the Graph.");
        ok(null == g.getNode("A141"), "Getting a node not in the Graph.");
        g.removeNode(a11);
        ok(null == g.getNode("A11"), "Getting a removed node.");
        ok(!g.hasNode("A11"));

        var b7 = g.addNode("B7");
        throws(function () {
            g.getNode(77);
        },
            'Should throw an error since it is neither a Node nor an identifier.'
            );
        ok(b7.links.IsEmpty(), "No links defined yet.");
        ok(b7.outgoing.IsEmpty(), "No links defined yet.");
        ok(b7.incoming.IsEmpty(), "No links defined yet.");
        ok(b7.weight == 1, "No weight set by default.");

        var ori = new Node();
        var clone = ori.clone();
        ok(ori.id != clone.id, "The clone should not have the same identifier.");
        ok(ori.links.SameAs(clone.links));
        ok(ori.outgoing.SameAs(clone.outgoing));
        ok(ori.incoming.SameAs(clone.incoming));
    });

    test('Parents and children', function () {
        var g = TypeViz.Diagramming.Graph.Utils.parse(["1->2", "0->2", "2->3", "3->4", "3->5", "3->6"]);

        var n0 = g.getNode("0");
        var n1 = g.getNode("1");
        var n2 = g.getNode("2");
        var n3 = g.getNode("3");
        var n4 = g.getNode("4");
        var n5 = g.getNode("5");

        var n2Parents = n2.getParents();
        ok(n2Parents.length == 2 && n2Parents.Contains(n0) && n2Parents.Contains(n1), "Parents of n2.");
        var n2Children = n2.getChildren();
        ok(n2Children.length == 1 && n2Children.Contains(n3), "Children of n2.");
        var n3Children = n3.getChildren();
        ok(n3Children.length == 3, "Children of n3.");
        ok(n5.getParents().length == 1, "Parent of n5.");
    });

    test('Depth-first traversal', function () {
        var g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "0->2", "1->3", "1->4", "2->5", "2->6", "3->7"]);
        var path = [];
        var acc = function (node) {
            path.Add(node.id);
        };
    var n0 = g.getNode("0");
        g.depthFirstTraversal(n0, acc);
        var shouldbe = [0, 1, 3, 7, 4, 2, 5, 6];
        ok(path.SameAs(shouldbe), "Should be unique in this case.");
        g = TypeViz.Diagramming.Graph.Utils.parse(["0->7", "0->1", "0->2", "1->3", "1->4", "2->5", "2->6", "3->7"]);
        shouldbe = [0, 7, 1, 3, 4, 2, 5, 6];
        path = [];
        n0 = g.getNode("0");
        g.depthFirstTraversal(n0, acc);
        ok(path.SameAs(shouldbe), "No revisit please.");
    });

    test('Subgraphs', function () {
        var g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "1->2", "1->3", "3->4", "2->4", "4->5", "5->6", "6->7", "6->8", "8->9", "7->9", "9->10"]);
        var h = TypeViz.Diagramming.Graph.Utils.parse(["3->4", "2->4", "4->5", "5->6", "6->7", "6->8"]);
        ok(g.isSubGraph(h), "Should be a subgraph.");
        h = TypeViz.Diagramming.Graph.Utils.parse(["3->4", "2->4", "4->5", "5->6", "6->7", "6->8", "14->5"]);
        ok(!g.isSubGraph(h), "Shouldn't be a subgraph.");
    });

    test('Breadth-first traversal', function () {
        var g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "0->2", "1->3", "1->4", "2->5", "2->6", "3->7"]);
        var path = [];
        var acc = function (node) {
            path.Add(node.id);
        };
    var n0 = g.getNode("0");
        g.breadthFirstTraversal(n0, acc);
        var shouldbe = new Range(0, 7);
        ok(path.SameAs(shouldbe.Values), "Should be unique in this case.");
        g = TypeViz.Diagramming.Graph.Utils.parse(["0->7", "0->1", "0->2", "1->3", "1->4", "2->5", "2->6", "3->7"]);
        path = [];
        n0 = g.getNode("0");
        g.breadthFirstTraversal(n0, acc);
        ok(path.SameAs([0, 7, 1, 2, 3, 4, 5, 6]), "No revisit please.");
    });

    test('Link basics', function () {
        var from = new Node("from");
        var to = new Node("to");
        var l = new Link(from, to);
        ok(l.source == from && l.target == to, "Source and Target define the link.");

        l.reverse();
        ok(l.target == from && l.source == to, "Source and Target reversed.");
        l.reverse();

        ok(l.incidentWith(to), "Incidence with the target.");
        ok(l.incidentWith(from), "Incidence with the source.");
        ok(from.adjacentTo(to), "Adjacency with the source.");
        ok(to.adjacentTo(from), "Adjacency with the target.");

        var clone = l.clone();
        ok(clone.id != l.id, "The cloned link should not have the same identifier.");
        ok(clone.source == l.source);
        ok(clone.target == l.target);

        var otherTo = new Node("to2");
        var otherLink = new Link(from, otherTo);
        var common = l.getCommonNode(otherLink);
        ok(common != null);
        ok(common.id == from.id);

        ok(otherLink.isBridging(from, otherTo));
        ok(l.isBridging(from, to));

        ok(l.incidentWith(from));
        ok(!l.incidentWith(otherTo));
        ok(otherLink.incidentWith(otherTo));

        ok(l.adjacentTo(otherLink));

        l.changeTarget(otherTo);
        ok(l.target.id == otherTo.id);
        ok(l.isBridging(from, otherTo));
    });

    test('Graph basics', function () {

        var g = new Graph("D1");
        ok(g.id == "D1", "Id check.");
        ok(true, Object.getPrototypeOf(new Node()));

        var n1 = g.addNode("n1");
        ok(g.hasNode("n1"), "Contains the node");

        var l12 = g.addLink(n1, "n2");
        var n2 = g.getNode("n2");
        ok(TypeViz.IsDefined(n2), "The link target should be added automatically.");
        ok(g.links.Contains(l12), "The link should be in the links.");
        ok(l12.source.id == "n1" && l12.target.id == "n2", "Check of the identifiers.");
        ok(g.isHealthy(), "The graph is healthy.");
        g.removeLink(l12);
        ok(g.nodes.length == 2, "Should still have the nodes.");
        ok(n1.IsIsolated, "Should have no links.");
        ok(n2.IsIsolated, "Should have no links.");
        ok(g.links.IsEmpty(), "No links.");
        var n3 = new Node("n3");
        var link = new Link(n1, n3);
        g.addLink(link);
        ok(g.hasNode(n3), "The node should be added through the link.");
        ok(g.areConnected(n1, n3), "Adding the link connects nodes. Duh.");
        var l23 = new Link(n2, n3);
        g.addLink(l23);
        g.removeNode("n3"); //should also remove the two links
        ok(g.nodes.length == 2 && g.hasNode("n2") && g.hasNode("n1"), "Two nodes remaining.");
        ok(g.links.length == 0, "No links anymore.");

        //using addNodeAndOutgoings to rebuild the graph
        var n4 = new Node("n4");
        var l41 = new Link(n4, n1);
        var l42 = new Link(n4, n2);
        var l45 = new Link(n4, "n5");
        g.addNodeAndOutgoings(n4); // adds three nodes and three links
        ok(g.links.length == 3);
        ok(g.nodes.length == 4);
        var n5 = g.getNode("n5");
        ok(n5 != null);
        ok(g.areConnected(n1, n4));
        ok(g.areConnected(n2, n4));
        ok(g.areConnected(n5, n4));
        ok(!g.areConnected(n5, n2));
        ok(!g.areConnected(n1, n2));
        ok(g.isHealthy());
        g.removeAllLinks();
        ok(g.links.length == 0);
        ok(g.nodes.length == 4);
    });

    test('Parsing', function () {
        var graphString = ["n1->n2", { id: "QSDF13" }, "n2->n3"];
        var g = TypeViz.Diagramming.Graph.Utils.parse(graphString);
        ok(g.nodes.length == 3 && g.nodes[0].id == "n1" && g.nodes[1].id == "n2" && g.nodes[2].id == "n3");
        ok(g.links.length == 2 && g.links[0].id == "QSDF13");

        g = new Graph();
        var firstLink = g.addLink("n12", "n13");
        firstLink.id = "33";
        var secondLink = g.addLink("n17", "n22");
        secondLink.id = "44";
        var s = g.linearize();
        var shouldbe = ["n12->n13", "n17->n22"];
        ok(s.SameAs(shouldbe));

        s = g.linearize(true);
        var shouldb = ["n12->n13", { id: "33" }, "n17->n22", { id: "44" }];
        ok(s[0] == shouldb[0]);
        ok(s[1].id == "33");
        ok(s[2] == shouldb[2]);
        ok(s[3].id == "44");
    });

    test('Components', function () {
        // two simple components
        var simple = TypeViz.Diagramming.Graph.Utils.parse(["1->2", "3->4"]);
        var components = simple.getConnectedComponents();
        ok(components.length == 2, "Should be two components.");
        var g1 = components[0];
        ok(g1.nodes.Contains(simple.getNode("1")));
        ok(g1.nodes.Contains(simple.getNode("2")));
        var g2 = components[1];
        ok(g2.nodes.Contains(simple.getNode("3")));
        ok(g2.nodes.Contains(simple.getNode("4")));

        simple = TypeViz.Diagramming.Graph.Utils.parse(["1->2", "2->3", "3->4", "5->6", "6->5", "9->12"]);
        components = simple.getConnectedComponents();
        ok(components.length == 3, "Should be three components.");
    });

    test('Spanning tree', function () {
        var g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "1->2", "1->3", "3->4", "2->4"]);
        var n0 = g.getNode("0");
        var tree = g.getSpanningTree(n0);
        ok(tree.nodes.length == 5, "Should visit all nodes.");
        ok(tree.links.length == 4, "Should not bifurcate.");
        ok(true, "Results in: " + tree.linearize());
        ok(tree.isAcyclic(), "A tree should not have cycles.");

        g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "1->2", "1->3", "3->4", "2->4", "4->5"]);
        n0 = g.getNode("0");
        tree = g.getSpanningTree(n0);
        ok(tree.isAcyclic(), "A tree should not have cycles.");

        ok(tree.nodes.length == 6, "Should visit all nodes.");
        ok(tree.links.length == 5, "Should not bifurcate.");
        ok(true, "Results in: " + tree.linearize());

        g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "1->2", "1->3", "3->4", "2->4", "4->5", "5->6", "6->7", "6->8", "8->9", "7->9", "9->10"]);
        n0 = g.getNode("0");
        tree = g.getSpanningTree(n0);
        ok(tree.nodes.length == 11, "Should visit all nodes.");
        ok(tree.links.length == 10, "Should not bifurcate.");
        ok(true, "Results in: " + tree.linearize());
        ok(tree.isAcyclic(), "A tree should not have cycles.");
        ok(g.isSubGraph(tree), "The spanning tree should be a subgraph of the graph.");

    });

    test('Make acyclic', function () {
        var g = Graph.Predefined.Grid(2, 2);
        ok(g.nodes.length == 9);
        ok(g.links.length == 12);

        g = Graph.Predefined.Workflow(); // is cyclic
        var reversed = g.makeAcyclic();
        ok(g.isAcyclic(), "Should be acyclic now");
    });

    test('Balance trees and forests', function () {
        var g = Graph.Utils.createBalancedTree(1, 2);
        ok(g.nodes.length == 3);
        ok(g.links.length == 2);

        g = Graph.Utils.createBalancedTree(2, 2);
        ok(g.nodes.length == 7);
        ok(g.links.length == 6);

        g = Graph.Utils.createBalancedForest(3, 4, 8);
        var components = g.getConnectedComponents();
        ok(components.length == 8, "Should have eight components.");
        ok(components[0].nodes.length == 85); // (1-4^4)/(1-4)
        ok(components[0].links.length == 84); // (4-4^4)/(1-4)
    });

    test('Acyclicity', function () {
        var g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "1->2", "2->3", "3->4", "4->1"]);
        var cycles = g.findCycles();
        ok(cycles.length == 1, "Should have a cycle.");

        g = Graph.Utils.createRandomConnectedGraph(20, 3, true); // a random tree of 20 nodes and incidence<=3
        cycles = g.findCycles();
        ok(cycles.length == 0, "Trees don't have cycles.");

        g = Graph.Utils.createRandomConnectedGraph(250, 14, false); // a random non-tree of 20 nodes and incidence<=14
        cycles = g.findCycles();
        // Breaks the build. We should test someting sure. :)
        //ok(cycles.length > 0, "No panic if falsey. Since the graph is random this one has probability of not having cycles...but with 250 nodes and incidence up to 14 this should not happen (i.e. statistically very low).");

        g = TypeViz.Diagramming.Graph.Utils.parse(["0->1", "1->2", "2->3", "3->4", "4->1", "3->5", "5->6", "6->7", "7->3"]);
        cycles = g.findCycles();
        ok(cycles.length == 1, "Should have a cycle.");

        g = TypeViz.Diagramming.Graph.Utils.createBalancedTree();
        cycles = g.findCycles();
        ok(cycles.length == 0, "A balanced should not have any cycles.");

        g = TypeViz.Diagramming.Graph.Utils.createBalancedForest();
        cycles = g.findCycles();
        ok(cycles.length == 0, "A balanced forest should not have any cycles.");
    });

    test('Assign levels', function () {
        var tree = TypeViz.Diagramming.Graph.Predefined.Tree(3, 2);
        var root = tree.root;
        tree.assignLevels(root);

        ok(root != null, "There should be a root.");
        ok(root.id == "0");
        ok(root.level == 0);
        ok(TypeViz.IsDefined(root.children) && root.children.length == 2);
        ok(root.children[0].level == 1 && root.children[1].level == 1);
        ok(root.children[0].children[0].level == 2); // and so on

        tree.assignLevels(root, 7);
        ok(root.level == 7);
        ok(root.children[0].level == 8 && root.children[1].level == 8);
        ok(root.children[0].children[0].level == 9); // and so on
    });
}