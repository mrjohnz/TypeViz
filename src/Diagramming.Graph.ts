
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
/// <reference path='Structures.ts' />
/// <reference path='Media.ts' />
/// <reference path='SVG.ts' />
module TypeViz {

    export module Diagramming {
        /*----------------Node-------------------------------*/

        /**
         * Defines the node (vertex) of a Graph.
         */
        export class Node {
            public links;
            public outgoing;
            public incoming;
            public weight;
            public associatedShape;
            public id;
            public data;
            public type;
            public isVirtual;
            public shortForm;
            public Width;
            public Height;
            public X;
            public Y;
            public balance;
            public owner;
            constructor(id?, shape?) {

                /**
                 * Holds all the links incident with the current node.
                 * Do not use this property to manage the incoming links, use the appropriate add/remove methods instead.
                 */
                this.links = [];

                /**
                 * Holds the links from the current one to another Node .
                 * Do not use this property to manage the incoming links, use the appropriate add/remove methods instead.
                 */
                this.outgoing = [];

                /**
                 * Holds the links from another Node to the current one.
                 * Do not use this property to manage the incoming links, use the appropriate add/remove methods instead.
                 */
                this.incoming = [];

                /**
                 * Holds the weight of this Node.
                 */
                this.weight = 1;

                if (TypeViz.IsDefined(id)) {
                    this.id = id;
                }
                else {
                    this.id = TypeViz.RandomId();
                }
                if (TypeViz.IsDefined(shape)) {
                    this.associatedShape = shape;
                    // transfer the shape's bounds to the runtime props
                    var b = shape.Rectangle;
                    this.Width = b.Width;
                    this.Height = b.Height;
                    this.X = b.X;
                    this.Y = b.Y;
                }
                else {
                    this.associatedShape = null;
                }
                /**
                 * The payload of the node.
                 * @type {null}
                 */
                this.data = null;
                this.type = "Node";
                this.shortForm = "Node '" + this.id + "'";
                /**
                 * Whether this is an injected node during the analysis or layout process.
                 * @type {boolean}
                 */
                this.isVirtual = false;
            }

            /**
             * Returns whether this node has no links attached.
             */
            public get IsIsolated() {
                return this.links.IsEmpty();
            }

            /**
             * Gets the bounding rectangle of this node.
             * This should be considered as runtime data, the property is not hotlinked to a SVG item.
             */
            public get Bounds(): TypeViz.Rect {

                return new TypeViz.Rect(this.X, this.Y, this.Width, this.Height);
            }

            /**
            * Sets the bounding rectangle of this node.
            * This should be considered as runtime data, the property is not hotlinked to a SVG item.
            */
            public set Bounds(r: TypeViz.Rect) {
                this.X = r.X;
                this.Y = r.Y;
                this.Width = r.Width;
                this.Height = r.Height;
            }

            /**
             * Returns whether there is at least one link with the given (complementary) node. This can be either an
             * incoming or outgoing link.
             */
            IsLinkedTo(node) {
                var thisRef = this;
                return this.links.Any(function (link) {
                    return link.getComplement(thisRef) === node;
                });
            }

            /**
             * Gets the children of this node, defined as the adjacent nodes with a link from this node to the adjacent one.
             * @returns {Array}
             */
            getChildren() {
                if (this.outgoing.length === 0) {
                    return [];
                }
                var children = [];
                for (var i = 0, len = this.outgoing.length; i < len; i++) {
                    var link = this.outgoing[i];
                    children.Add(link.getComplement(this));
                }
                return children;
            }

            /**
             * Gets the parents of this node, defined as the adjacent nodes with a link from the adjacent node to this one.
             * @returns {Array}
             */
            getParents() {
                if (this.incoming.length === 0) {
                    return [];
                }
                var parents = [];
                for (var i = 0, len = this.incoming.length; i < len; i++) {
                    var link = this.incoming[i];
                    parents.Add(link.getComplement(this));
                }
                return parents;
            }

            /**
             * Returns a clone of the Node. Note that the identifier is not cloned since it's a different Node instance.
             * @returns {Node}
             */
            clone() {
                var copy = new TypeViz.Diagramming.Node();
                if (TypeViz.IsDefined(this.weight)) {
                    copy.weight = this.weight;
                }
                if (TypeViz.IsDefined(this.balance)) {
                    copy.balance = this.balance;
                }
                if (TypeViz.IsDefined(this.owner)) {
                    copy.owner = this.owner;
                }
                copy.associatedShape = this.associatedShape;
                copy.X = this.X;
                copy.Y = this.Y;
                copy.Width = this.Width;
                copy.Height = this.Height;
                copy.data = this.data;
                return copy;
            }

            /**
             * Returns whether there is a link from the current node to the given node.
             */
            adjacentTo(node) {
                return this.IsLinkedTo(node) !== null;
            }

            /**
             * Removes the given link from the link collection this node owns.
             * @param link
             */
            removeLink(link) {
                if (link.source === this) {
                    this.links.Remove(link);
                    this.outgoing.Remove(link);
                    link.source = null;
                }

                if (link.target === this) {
                    this.links.Remove(link);
                    this.incoming.Remove(link);
                    link.target = null;
                }
            }

            /**
             * Returns whether there is a (outgoing) link from the current node to the given one.
             */
            hasLinkTo(node) {
                return this.outgoing.Any(function (link) {
                    return link.target === node;
                });
            }

            /**
             * Returns the degree of this node, i.e. the sum of incoming and outgoing links.
             */
            degree() {
                return this.links.length;
            }

            /**
             * Returns whether this node is either the source or the target of the given link.
             */
            incidentWith(link) {
                return this.links.Contains(link);
            }

            /**
             * Returns the links between this node and the given one.
             */
            getLinksWith(node) {
                return this.links.All(function (link) {
                    return link.getComplement(this) === node;
                }, this);
            }

            /**
             * Returns the nodes (either parent or child) which are linked to the current one.
             */
            getNeighbors() {
                var neighbors = [];
                this.incoming.ForEach(function (e) {
                    neighbors.push(e.getComplement(this));
                }, this);
                this.outgoing.ForEach(function (e) {
                    neighbors.push(e.getComplement(this));
                }, this);
                return neighbors;
            }
        }

        /**
         * Defines a directed link (edge, connection) of a Graph.
         */
        export class Link {
            public index: number;
            public depthOfDumminess: number;
            public points;
            public id;
            public source;
            public target;
            public associatedConnection;
            public type;
            public shortForm;
            public balance;
            public reversed;
            public owner;
            constructor(source, target, id?, connection?) {
                if (TypeViz.IsUndefined(source)) {
                    throw "The source of the new link is not set.";
                }
                if (TypeViz.IsUndefined(target)) {
                    throw "The target of the new link is not set.";
                }
                var sourceFound, targetFound;
                if (TypeViz.IsString(source)) {
                    sourceFound = new Node(source);
                }
                else {
                    sourceFound = source;
                }
                if (TypeViz.IsString(target)) {
                    targetFound = new TypeViz.Diagramming.Node(target);
                }
                else {
                    targetFound = target;
                }
                this.points = [];
                this.source = sourceFound;
                this.target = targetFound;
                this.source.links.Add(this);
                this.target.links.Add(this);
                this.source.outgoing.Add(this);
                this.target.incoming.Add(this);
                if (TypeViz.IsDefined(id)) {
                    this.id = id;
                }
                else {
                    this.id = TypeViz.RandomId();
                }
                if (TypeViz.IsDefined(connection)) {
                    this.associatedConnection = connection;
                }
                else {
                    this.associatedConnection = null;
                }
                this.type = "Link";
                this.shortForm = "Link '" + this.source.id + "->" + this.target.id + "'";
            }

            /**
             * Returns the complementary node of the given one, if any.
             */
            getComplement(node) {
                if (this.source !== node && this.target !== node) {
                    throw "The given node is not incident with this link.";
                }
                return this.source === node ? this.target : this.source;
            }

            /**
             * Returns the overlap of the current link with the given one, if any.
             */
            getCommonNode(link) {
                if (this.source === link.source || this.source === link.target) {
                    return this.source;
                }
                if (this.target === link.source || this.target === link.target) {
                    return this.target;
                }
                return null;
            }

            /**
             * Returns whether the current link is bridging the given nodes.
             */
            isBridging(v1, v2) {
                return this.source === v1 && this.target === v2 || this.source === v2 && this.target === v1;
            }

            /**
             * Returns the source and target of this link as a tuple.
             */
            getNodes() {
                return [this.source, this.target];
            }

            /**
             * Returns whether the given node is either the source or the target of the current link.
             */
            incidentWith(node) {
                return this.source === node || this.target === node;
            }

            /**
             * Returns whether the given link is a continuation of the current one. This can be both
             * via an incoming or outgoing link.
             */
            adjacentTo(link) {
                return this.source.links.Contains(link) || this.target.links.Contains(link);
            }

            /**
             * Changes the source-node of this link.
             */
            changeSource(node) {
                this.source.links.Remove(this);
                this.source.outgoing.Remove(this);

                node.links.push(this);
                node.outgoing.push(this);

                this.source = node;
            }

            /**
             * Changes the target-node of this link.
             * @param node
             */
            changeTarget(node) {
                this.target.links.Remove(this);
                this.target.incoming.Remove(this);

                node.links.push(this);
                node.incoming.push(this);

                this.target = node;
            }

            /**
             * Changes both the source and the target nodes of this link.
             */
            changesNodes(v, w) {
                if (this.source === v) {
                    this.changeSource(w);
                }
                else if (this.target === v) {
                    this.changeTarget(w);
                }
            }

            /**
             * Reverses the direction of this link.
             */
            reverse() {
                var oldSource = this.source;
                var oldTarget = this.target;

                this.source = oldTarget;
                oldSource.outgoing.Remove(this);
                this.source.outgoing.push(this);

                this.target = oldSource;
                oldTarget.incoming.Remove(this);
                this.target.incoming.push(this);
                this.reversed = true;
                return this;
            }

            /**
             * Ensures that the given target defines the endpoint of this link.
             */
            directTo(target) {
                if (this.source !== target && this.target !== target) {
                    throw "The given node is not incident with this link.";
                }
                if (this.target !== target) {
                    this.reverse();
                }
            }

            /**
             * Returns a reversed clone of this link.
             */
            createReverseEdge() {
                var r = this.clone();
                r.reverse();
                r.reversed = true;
                return r;
            }

            /**
             * Returns a clone of this link.
             */
            clone() {
                var clone = new TypeViz.Diagramming.Link(this.source, this.target);
                return clone;
            }
        }

        /*--------------Graph structure---------------------------------*/
        /**
         * Defines a directed graph structure.
         * Note that the incidence structure resides in the nodes through the incoming and outgoing links collection, rahter than
         * inside the Graph.
         */
        export class Graph {

            public treeLevels;
            public nodeMap;
            public linkMap;
            /**
         * Graph generation and other utilities.
         */
            public static Utils = {
                /**
                 * The parsing allows a quick way to create graphs.
                 *  - ["n1->n2", "n2->n3"]: creates the three nodes and adds the links
                 *  - ["n1->n2", {id: "id177"} "n2->n3"]: same as previous but also performs a deep extend of the link between n1 and n2 with the given object.
                 */
                parse: function (graphString: Array<Object>) {

                    var previousLink, graph = new Graph(), parts = graphString;//.slice();
                    for (var i = 0, len = parts.length; i < len; i++) {
                        var part = parts[i];
                        if (TypeViz.IsString(part)) // link spec
                        {
                            if ((<string>part).indexOf("->") < 0) {
                                throw "The link should be specified as 'a->b'.";
                            }
                            var p = (<string>part).split("->");
                            if (p.length != 2) {
                                throw "The link should be specified as 'a->b'.";
                            }
                            previousLink = new Link(p[0], p[1]);
                            graph.addLink(previousLink);
                        }
                        if (TypeViz.IsObject(part)) {
                            if (!previousLink) {
                                throw "Specification found before Link definition.";
                            }
                            TypeViz.deepExtend(previousLink, part);
                        }
                    }
                    return graph;
                },

                /**
                 * Returns a linearized representation of the given Graph.
                 * See also the Graph.Utils.parse method for the inverse operation.
                 */
                linearize: function (graph, addIds?) {
                    if (TypeViz.IsUndefined(graph)) {
                        throw "Expected an instance of a Graph object in slot one.";
                    }
                    if (TypeViz.IsUndefined(addIds)) {
                        addIds = false;
                    }
                    var lin = [];
                    for (var i = 0, len = graph.links.length; i < len; i++) {
                        var link = graph.links[i];
                        lin.Add(link.source.id + "->" + link.target.id);
                        if (addIds) {
                            lin.Add({ id: link.id });
                        }
                    }
                    return lin;
                },

                /**
                 * The method used by the diagram creation to instantiate a shape.
                 * @param kendoDiagram The Kendo diagram where the diagram will be created.
                 * @param p The position at which to place the shape.
                 * @param shapeOptions Optional Shape options.
                 * @param id Optional identifier of the shape.
                 * @returns {*}
                 * @private
                 */
                _addShape: function (diagram, p, id, shapeOptions) {
                    if (TypeViz.IsUndefined(p)) {
                        p = new TypeViz.Point(0, 0);
                    }
                    if (TypeViz.IsUndefined(id)) {
                        id = TypeViz.RandomId();
                    }
                    shapeOptions = TypeViz.deepExtend({
                        Width: 20,
                        Height: 20,
                        Id: id,
                        Radius: 10,
                        CornerRadius: 3,
                        Opacity: 0.5,
                        Background: "#0000FF",
                        Stroke: "Transparent",
                        StrokeThickness: 0,
                        Geometry: "rectangle",
                        undoable: false
                    }, shapeOptions);

                    return diagram.AddShape(p, shapeOptions);
                },
                /**
                 * The method used by the diagram creation to instantiate a connection.
                 * @param diagram he Kendo diagram where the diagram will be created.
                 * @param from The source shape.
                 * @param to The target shape.
                 * @param options Optional Connection options.
                 * @returns {*}
                 * @private
                 */
                _addConnection: function (diagram, from, to, options) {
                    var connection = new Connection(from, to, options);
                    connection.Stroke = "WhiteSmoke";
                    connection.Opacity = 0.853;
                    return diagram.AddConnection(connection);
                },

                /**
                 * Creates a diagram from the given Graph.
                 * @param diagram The Kendo diagram where the diagram will be created.
                 * @param graph The graph structure defining the diagram.
                 */
                createDiagramFromGraph: function (diagram, graph, doLayout?, randomSize?) {

                    if (TypeViz.IsUndefined(diagram)) {
                        throw "The diagram surface is undefined.";
                    }
                    if (TypeViz.IsUndefined(graph)) {
                        throw "No graph specification defined.";
                    }
                    if (TypeViz.IsUndefined(doLayout)) {
                        doLayout = true;
                    }
                    if (TypeViz.IsUndefined(randomSize)) {
                        randomSize = false;
                    }

                    var width = diagram.Element.clientWidth || 200;
                    var height = diagram.Element.clientHeight || 200;
                    var map = [], node, shape;
                    for (var i = 0, len = graph.nodes.length; i < len; i++) {
                        node = graph.nodes[i];
                        var p = node.position;
                        if (TypeViz.IsUndefined(p)) {
                            if (TypeViz.IsDefined(node.X) && TypeViz.IsDefined(node.Y)) {
                                p = new Point(node.X, node.Y);
                            }
                            else {
                                p = new Point(TypeViz.Maths.RandomInteger(10, width - 20), TypeViz.Maths.RandomInteger(10, height - 20));
                            }
                        }
                        var opt = {};

                        if (node.id === "0") {
                            /* TypeViz.deepExtend(opt,
                             {
                             background: "Orange",
                             data: 'circle',
                             width: 100,
                             height: 100,
                             center: new Point(50, 50)
                             });*/
                        }
                        else if (randomSize) {
                            TypeViz.deepExtend(opt, {
                                width: Math.random() * 150 + 20,
                                height: Math.random() * 80 + 50,
                                data: 'rectangle',
                                background: "#778899"
                            });
                        }

                        shape = this._addShape(diagram, p, node.id, opt);
                        //shape.content(node.id);

                        var bounds = shape.Rectangle;
                        if (TypeViz.IsDefined(bounds)) {
                            node.X = bounds.X;
                            node.Y = bounds.Y;
                            node.Width = bounds.Width;
                            node.Height = bounds.Height;
                        }
                        map[node.id] = shape;
                    }
                    for (var gli = 0; gli < graph.links.length; gli++) {
                        var link = graph.links[gli];
                        var sourceShape = map[link.source.id];
                        if (TypeViz.IsUndefined(sourceShape)) {
                            continue;
                        }
                        var targetShape = map[link.target.id];
                        if (TypeViz.IsUndefined(targetShape)) {
                            continue;
                        }
                        this._addConnection(diagram, sourceShape.Connectors[2], targetShape.Connectors[0], { id: link.id });

                    }
                    if (doLayout) {
                        var l = new TypeViz.Diagramming.SpringLayout(diagram);
                        var settings = new TypeViz.Diagramming.LayoutSettings();
                        settings.LimitToView = false;
                        l.layoutGraph(graph, settings);
                        for (var shi = 0; shi < graph.nodes.length; shi++) {
                            node = graph.nodes[shi];
                            shape = map[node.id];
                            shape.Rectangle = new Rect(node.X, node.Y, node.Width, node.Height);
                        }
                    }
                },

                /**
                 * Creates a balanced tree with the specified number of levels and siblings count.
                 * Note that for a balanced tree of level N and sibling count s, counting the root as level zero:
                 *  - NodeCount = (1-s^(N+1))/(1-s)]
                 *  - LinkCount = s.(1-s^N)/(1-s)
                 * @param levels How many levels the tree should have.
                 * @param siblingsCount How many siblings each level should have.
                 * @returns {diagram.Graph}
                 */
                createBalancedTree: function (levels?, siblingsCount?) {
                    if (TypeViz.IsUndefined(levels)) {
                        levels = 3;
                    }
                    if (TypeViz.IsUndefined(siblingsCount)) {
                        siblingsCount = 3;
                    }

                    var g = new Graph(), counter = -1, lastAdded = [], news;
                    if (levels <= 0 || siblingsCount <= 0) {
                        return g;
                    }
                    var root = new Node((++counter).toString());
                    g.addNode(root);
                    g.root = root;
                    lastAdded.Add(root);
                    for (var i = 0; i < levels; i++) {
                        news = [];
                        for (var j = 0; j < lastAdded.length; j++) {
                            var parent = lastAdded[j];
                            for (var k = 0; k < siblingsCount; k++) {
                                var item = new Node((++counter).toString());
                                g.addLink(parent, item);
                                news.Add(item);
                            }
                        }
                        lastAdded = news;
                    }
                    return g;
                },

                /**
                 * Creates a balanced tree with the specified number of levels and siblings count.
                 * Note that for a balanced forest of level N, sibling count s and tree count t, counting the root as level zero:
                 *  - NodeCount = t.(1-s^(N+1))/(1-s)]
                 *  - LinkCount = t.s.(1-s^N)/(1-s)
                 * @param levels How many levels the tree should have.
                 * @param siblingsCount How many siblings each level should have.
                 * @returns {diagram.Graph}
                 * @param treeCount The number of trees the forest should have.
                 */
                createBalancedForest: function (levels?, siblingsCount?, treeCount?) {
                    if (TypeViz.IsUndefined(levels)) {
                        levels = 3;
                    }
                    if (TypeViz.IsUndefined(siblingsCount)) {
                        siblingsCount = 3;
                    }
                    if (TypeViz.IsUndefined(treeCount)) {
                        treeCount = 5;
                    }
                    var g = new TypeViz.Diagramming.Graph(), counter = -1, lastAdded = [], news;
                    if (levels <= 0 || siblingsCount <= 0 || treeCount <= 0) {
                        return g;
                    }

                    for (var t = 0; t < treeCount; t++) {
                        var root = new TypeViz.Diagramming.Node((++counter).toString());
                        g.addNode(root);
                        lastAdded = [root];
                        for (var i = 0; i < levels; i++) {
                            news = [];
                            for (var j = 0; j < lastAdded.length; j++) {
                                var parent = lastAdded[j];
                                for (var k = 0; k < siblingsCount; k++) {
                                    var item = new TypeViz.Diagramming.Node((++counter).toString());
                                    g.addLink(parent, item);
                                    news.Add(item);
                                }
                            }
                            lastAdded = news;
                        }
                    }
                    return g;
                },

                /**
                 * Creates a random graph (uniform distribution) with the specified amount of nodes.
                 * @param nodeCount The amount of nodes the random graph should have.
                 * @param maxIncidence The maximum allowed degree of the nodes.
                 * @param isTree Whether the return graph should be a tree (default: false).
                 * @returns {diagram.Graph}
                 */
                createRandomConnectedGraph: function (nodeCount?, maxIncidence?, isTree?) {

                    /* Swa's Mathematica export of random Bernoulli graphs
                     gr[n_,p_]:=Module[{g=RandomGraph[BernoulliGraphDistribution[n,p],VertexLabels->"Name",DirectedEdges->True]}
                     While[Not[ConnectedGraphQ[g]],g=RandomGraph[BernoulliGraphDistribution[n,p],VertexLabels->"Name",DirectedEdges->True]];g];
                     project[a_]:=("\""<>ToString[Part[#,1]]<>"->"<>ToString[Part[#,2]]<>"\"")&     @ a;
                     export[g_]:=project/@ EdgeList[g]
                     g = gr[12,.1]
                     export [g]
                     */

                    if (TypeViz.IsUndefined(nodeCount)) {
                        nodeCount = 40;
                    }
                    if (TypeViz.IsUndefined(maxIncidence)) {
                        maxIncidence = 4;
                    }
                    if (TypeViz.IsUndefined(isTree)) {
                        isTree = false;
                    }

                    var g = new Graph(), counter = -1;
                    if (nodeCount <= 0) {
                        return g;
                    }

                    var root = new Node((++counter).toString());
                    g.addNode(root);
                    if (nodeCount === 1) {
                        return g;
                    }
                    if (nodeCount > 1) {
                        // random tree
                        for (var i = 1; i < nodeCount; i++) {
                            var poolNode = g.takeRandomNode([], maxIncidence);
                            if (!poolNode) {
                                //failed to find one so the graph will have less nodes than specified
                                break;
                            }
                            var newNode = g.addNode(i.toString());
                            g.addLink(poolNode, newNode);
                        }
                        if (!isTree && nodeCount > 1) {
                            var randomAdditions = TypeViz.Maths.RandomInteger(1, nodeCount);
                            for (var ri = 0; ri < randomAdditions; ri++) {
                                var n1 = g.takeRandomNode([], maxIncidence);
                                var n2 = g.takeRandomNode([], maxIncidence);
                                if (n1 && n2 && !g.areConnected(n1, n2)) {
                                    g.addLink(n1, n2);
                                }
                            }
                        }
                        return g;
                    }
                }
            };
            /**
        * A collection of predefined graphs for demo and testing purposes.
        */
            public static Predefined = {
                /**
                 * Eight-shapes graph all connected in a cycle.
                 * @returns {*}
                 * @constructor
                 */
                EightGraph: function () {
                    return Graph.Utils.parse(["1->2", "2->3", "3->4", "4->1", "3->5", "5->6", "6->7", "7->3"]);
                },

                /**
                 * Creates a typical mindmap diagram.
                 * @returns {*}
                 * @constructor
                 */
                Mindmap: function () {
                    return Graph.Utils.parse(["0->1", "0->2", "0->3", "0->4", "0->5", "1->6", "1->7", "7->8", "2->9", "9->10", "9->11", "3->12",
                        "12->13", "13->14", "4->15", "4->16", "15->17", "15->18", "18->19", "18->20", "14->21", "14->22", "5->23", "23->24", "23->25", "6->26"]);
                },

                /**
                 * Three nodes connected in a cycle.
                 * @returns {*}
                 * @constructor
                 */
                ThreeGraph: function () {
                    return Graph.Utils.parse(["1->2", "2->3", "3->1"]);
                },

                /**
                 * A tree with each node having two children.
                 * @param levels How many levels the binary tree should have.
                 * @returns {diagram.Graph}
                 * @constructor
                 */
                BinaryTree: function (levels) {
                    if (TypeViz.IsUndefined(levels)) {
                        levels = 5;
                    }
                    return Graph.Utils.createBalancedTree(levels, 2);
                },

                /**
                 * A linear graph (discrete line segment).
                 * @param length How many segments (the node count is hence (length+1)).
                 * @returns {diagram.Graph}
                 * @constructor
                 */
                Linear: function (length) {
                    if (TypeViz.IsUndefined(length)) {
                        length = 10;
                    }
                    return Graph.Utils.createBalancedTree(length, 1);
                },

                /**
                 * A standard tree-graph with the specified levels and children (siblings) count.
                 * Note that for a balanced tree of level N and sibling count s, counting the root as level zero:
                 *  - NodeCount = (1-s^(N+1))/(1-s)]
                 *  - LinkCount = s.(1-s^N)/(1-s)
                 * @param levels How many levels the tree should have.
                 * @param siblingsCount How many siblings each level should have.
                 * @returns {diagram.Graph}
                 * @constructor
                 */
                Tree: function (levels, siblingsCount) {
                    return Graph.Utils.createBalancedTree(levels, siblingsCount);
                },

                /**
                 * Creates a forest.
                 * Note that for a balanced forest of level N, sibling count s and tree count t, counting the root as level zero:
                 *  - NodeCount = t.(1-s^(N+1))/(1-s)]
                 *  - LinkCount = t.s.(1-s^N)/(1-s)
                 * @param levels How many levels the tree should have.
                 * @param siblingsCount How many siblings each level should have.
                 * @param trees The amount of trees the forest should have.
                 * @returns {diagram.Graph}
                 * @constructor
                 */
                Forest: function (levels, siblingsCount, trees) {
                    return Graph.Utils.createBalancedForest(levels, siblingsCount, trees);
                },

                /**
                 * A workflow-like graph with cycles.
                 * @returns {*}
                 * @constructor
                 */
                Workflow: function () {
                    return Graph.Utils.parse(
                        ["0->1", "1->2", "2->3", "1->4", "4->3", "3->5", "5->6", "6->3", "6->7", "5->4"]
                        );
                },

                /**
                 * A grid graph with the direction of the links avoiding cycles.
                 * Node count: (n+1).(m+1)
                 * Link count: n.(m+1) + m.(n+1)
                 * @param n Horizontal count of grid cells. If zero this will result in a linear graph.
                 * @param m Vertical count of grid cells. If zero this will result in a linear graph.
                 * @constructor
                 */
                Grid: function (n, m) {
                    var g = new Graph();
                    if (n <= 0 && m <= 0) {
                        return g;
                    }

                    for (var i = 0; i < n + 1; i++) {
                        var previous = null;
                        for (var j = 0; j < m + 1; j++) {
                            // using x-y coordinates to name the nodes
                            var node = new Node(i.toString() + "." + j.toString());
                            g.addNode(node);
                            if (previous) {
                                g.addLink(previous, node);
                            }
                            if (i > 0) {
                                var left = g.getNode((i - 1).toString() + "." + j.toString());
                                g.addLink(left, node);
                            }
                            previous = node;
                        }
                    }
                    return g;
                }

            };
            public bounds;
            public id;
            public nodes;
            public links: Array<Link>;
            public diagram;
            public type;
            private _hasCachedRelationships;
            private _root;
            constructor(idOrDiagram?) {
                /**
                 * The links or edge collection of this Graph.
                 * @type {Array}
                 */
                this.links = [];
                /**
                 * The node or vertex collection of this Graph.
                 * @type {Array}
                 */
                this.nodes = [];
                /**
                 * The optional reference to the Diagram on which this Graph is based.
                 * @type {null}
                 */
                this.diagram = null;

                /**
                 * The root of this Graph. If not set explicitly the first Node with zero incoming links will be taken.
                 * @type {null}
                 * @private
                 */
                this._root = null;
                if (TypeViz.IsDefined(idOrDiagram)) {
                    if (TypeViz.IsString(idOrDiagram)) {
                        this.id = idOrDiagram;
                    }
                    else {
                        this.diagram = idOrDiagram;
                        this.id = idOrDiagram.id;
                    }
                }
                else {
                    this.id = TypeViz.RandomId();
                }

                /**
                 * The bounds of this graph if the nodes have spatial extension defined.
                 * @type {Rect}
                 */
                this.bounds = new Rect();
                // keeps track whether the children & parents have been created
                this._hasCachedRelationships = false;
                this.type = "Graph";
            }
            /**
             * Caches the relational information of parents and children in the 'parents' and 'children'
             * properties.
             * @param forceRebuild If set to true the relational info will be rebuild even if already present.
             */
            cacheRelationships(forceRebuild?) {
                if (TypeViz.IsUndefined(forceRebuild)) {
                    forceRebuild = false;
                }
                if (this._hasCachedRelationships && !forceRebuild) {
                    return;
                }
                for (var i = 0, len = this.nodes.length; i < len; i++) {
                    var node = this.nodes[i];
                    node.children = this.getChildren(node);
                    node.parents = this.getParents(node);
                }
                this._hasCachedRelationships = true;
            }

            /**
             * Assigns tree-levels to the nodes assuming this is a tree graph.
             * If not connected or not a tree the process will succeed but
             * will have little meaning.
             * @param startNode The node from where the level numbering starts, usually the root of the tree.
             * @param visited The collection of visited nodes.
             * @param offset The offset or starting counter of the level info.
             */
            public assignLevels(startNode, offset?, visited?) {
                if (!startNode) {
                    throw "Start node not specified.";
                }
                if (TypeViz.IsUndefined(offset)) {
                    offset = 0;
                }
                // if not done before, cache the parents and children
                this.cacheRelationships();
                if (TypeViz.IsUndefined(visited)) {
                    visited = new Map();
                    this.nodes.ForEach(function (n) {
                        visited.Add(n, false);
                    });
                }
                visited.Set(startNode, true);
                startNode.level = offset;
                var children = startNode.children;
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (!child || visited.Get(child)) {
                        continue;
                    }
                    this.assignLevels(child, offset + 1, visited);
                }
            }
            public get root() {
                if (!this._root) {
                    // TODO: better to use the longest path for the most probable root?
                    var found = this.nodes.First(function (n) {
                        return n.incoming.length === 0;
                    });
                    if (found) {
                        return found;
                    }
                    return this.nodes.First();
                }
                else {
                    return this._root;
                }
            }
            /**
             * Gets or set the root of this graph.
             * If not set explicitly the first Node with zero incoming links will be taken.
             * @param value
             * @returns {*}
             */
            public set root(value) {
                this._root = value;
            }

            /**
             * Returns the connected components of this graph.
             * Note that the returned graphs are made up of the nodes and links of this graph, i.e. a pointer to the items of this graph.
             * If you alter the items of the components you'll alter the original graph and vice versa.
             * @returns {Array}
             */
            getConnectedComponents() {
                this.componentIndex = 0;
                this.setItemIndices();
                var componentId = [].Initialize(-1, this.nodes.length);

                for (var v = 0; v < this.nodes.length; v++) {
                    if (componentId[v] === -1) {
                        this._collectConnectedNodes(componentId, v);
                        this.componentIndex++;
                    }
                }

                var components = [], i;
                for (i = 0; i < this.componentIndex; ++i) {
                    components[i] = new Graph();
                }
                for (i = 0; i < componentId.length; ++i) {
                    var graph = components[componentId[i]];
                    graph.addNodeAndOutgoings(this.nodes[i]);
                }
                // sorting the components in decreasing order of node count
                components.sort(function (a, b) {
                    return b.nodes.length - a.nodes.length;
                });
                return components;
            }
            private componentIndex;
            _collectConnectedNodes(setIds, nodeIndex) {
                setIds[nodeIndex] = this.componentIndex; // part of the current component
                var node = this.nodes[nodeIndex];
                node.links.ForEach(
                    function (link) {
                        var next = link.getComplement(node);
                        var nextId = next.index;
                        if (setIds[nextId] === -1) {
                            this._collectConnectedNodes(setIds, nextId);
                        }
                    }, this);
            }

            /**
             * Calculates the bounds of this Graph if the Nodes have spatial dimensions defined.
             * @returns {Rect}
             */
            calcBounds() {
                if (this.IsEmpty) {
                    this.bounds = new Rect();
                    return this.bounds;
                }
                var b = null;
                for (var i = 0, len = this.nodes.length; i < len; i++) {
                    var node = this.nodes[i];
                    if (!b) {
                        b = node.Bounds;
                    }
                    else {
                        b = b.Union(node.Bounds);
                    }
                }
                this.bounds = b;
                return this.bounds;
            }

            /**
             * Creates a spanning tree for the current graph.
             * Important: this will not return a spanning forest if the graph is disconnected.
             * Prim's algorithm  finds a minimum-cost spanning tree of an edge-weighted, connected, undirected graph;
             * see http://en.wikipedia.org/wiki/Prim%27s_algorithm .
             * @param root The root of the spanning tree.
             * @returns {Graph}
             */
            getSpanningTree(root) {
                var tree = new Graph();
                var map = new Map(), source, target;
                tree.root = root.clone();
                tree.root.level = 0;
                tree.root.id = root.id;
                map.Add(root, tree.root);
                root.level = 0;

                var visited = [];
                var remaining = [];
                tree.nodes.Add(tree.root);
                visited.Add(root);
                remaining.Add(root);

                var levelCount = 1;
                while (remaining.length > 0) {
                    var next = remaining.pop();
                    for (var ni = 0; ni < next.links.length; ni++) {
                        var link = next.links[ni];
                        var cn = link.getComplement(next);
                        if (visited.Contains(cn)) {
                            continue;
                        }

                        cn.level = next.level + 1;
                        if (levelCount < cn.level + 1) {
                            levelCount = cn.level + 1;
                        }
                        if (!remaining.Contains(cn)) {
                            remaining.Add(cn);
                        }
                        if (!visited.Contains(cn)) {
                            visited.Add(cn);
                        }
                        if (map.ContainsKey(next)) {
                            source = map.Get(next);
                        }
                        else {
                            source = next.clone();
                            source.level = next.level;
                            source.id = next.id;
                            map.Add(next, source);
                        }
                        if (map.ContainsKey(cn)) {
                            target = map.Get(cn);
                        }
                        else {
                            target = cn.clone();
                            target.level = cn.level;
                            target.id = cn.id;
                            map.Add(cn, target);
                        }
                        var newLink = new TypeViz.Diagramming.Link(source, target);
                        tree.addLink(newLink);
                    }

                }

                var treeLevels = [];
                for (var i = 0; i < levelCount; i++) {
                    treeLevels.Add([]);
                }

                tree.nodes.ForEach(function (node) {
                    treeLevels[node.level].Add(node);
                });

                tree.treeLevels = treeLevels;
                tree.cacheRelationships();
                return tree;
            }

            /**
             * Returns a random node in this graph.
             * @param excludedNodes The collection of nodes which should not be considered.
             * @param incidenceLessThan The maximum degree or incidence the random node should have.
             * @returns {*}
             */
            takeRandomNode(excludedNodes, incidenceLessThan) {
                if (TypeViz.IsUndefined(excludedNodes)) {
                    excludedNodes = [];
                }
                if (TypeViz.IsUndefined(incidenceLessThan)) {
                    incidenceLessThan = 4;
                }
                if (this.nodes.length === 0) {
                    return null;
                }
                if (this.nodes.length === 1) {
                    return excludedNodes.Contains(this.nodes[0]) ? null : this.nodes[0];
                }
                var pool = this.nodes.Where(function (node) {
                    return !excludedNodes.Contains(node) && node.degree() <= incidenceLessThan;
                });
                if (pool.IsEmpty()) {
                    return null;
                }
                return pool[TypeViz.Maths.RandomInteger(0, pool.length)];
            }

            /**
             * Returns whether this is an empty graph.
             */
            public get IsEmpty() {
                return this.nodes.IsEmpty();
            }

            /**
             * Checks whether the endpoints of the links are all in the nodes collection.
             */
            isHealthy() {
                return this.links.All(function (link) {
                    return this.nodes.Contains(link.source) && this.nodes.Contains(link.target);
                }, this);
            }

            /**
             * Gets the parents of this node, defined as the adjacent nodes with a link from the adjacent node to this one.
             * @returns {Array}
             */
            getParents(n) {
                if (!this.hasNode(n)) {
                    throw "The given node is not part of this graph.";
                }
                return n.getParents();
            }

            /**
             * Gets the children of this node, defined as the adjacent nodes with a link from this node to the adjacent one.
             * @returns {Array}
             */
            getChildren(n) {
                if (!this.hasNode(n)) {
                    throw "The given node is not part of this graph.";
                }
                return n.getChildren();
            }

            /**
             * Adds a new link to the graph between the given nodes.
             */
            addLink(sourceOrLink, target?, owner?) {

                if (TypeViz.IsUndefined(sourceOrLink)) {
                    throw "The source of the link is not defined.";
                }
                if (TypeViz.IsUndefined(target)) {
                    // can only be undefined if the first one is a Link
                    if (TypeViz.IsDefined(sourceOrLink.type) && sourceOrLink.type === "Link") {
                        this.addExistingLink(sourceOrLink);
                        return;
                    }
                    else {
                        throw "The target of the link is not defined.";
                    }
                }

                var foundSource = this.getNode(sourceOrLink);
                if (TypeViz.IsUndefined(foundSource)) {
                    foundSource = this.addNode(sourceOrLink);
                }
                var foundTarget = this.getNode(target);
                if (TypeViz.IsUndefined(foundTarget)) {
                    foundTarget = this.addNode(target);
                }

                var newLink = new Link(foundSource, foundTarget);

                if (TypeViz.IsDefined(owner)) {
                    newLink.owner = owner;
                }

                /*newLink.source.outgoing.push(newLink);
                 newLink.source.links.push(newLink);
                 newLink.target.incoming.push(newLink);
                 newLink.target.links.push(newLink);*/

                this.links.push(newLink);

                return newLink;
            }

            /**
             * Removes all the links in this graph.
             */
            removeAllLinks() {
                while (this.links.length > 0) {
                    var link = this.links[0];
                    this.removeLink(link);
                }
            }

            /**
             * Adds the given link to the current graph.
             */
            addExistingLink(link) {

                if (this.hasLink(link)) {
                    return;
                }
                this.links.push(link);
                if (this.hasNode(link.source.id)) {
                    // priority to the existing node with the id even if other props are different
                    var s = this.getNode(link.source.id);
                    link.changeSource(s);
                }
                else {
                    this.addNode(link.source);
                }

                if (this.hasNode(link.target.id)) {
                    var t = this.getNode(link.target.id);
                    link.changeTarget(t);
                }
                else {
                    this.addNode(link.target);
                }

                /*  if (!link.source.outgoing.Contains(link)) {
                 link.source.outgoing.push(link);
                 }
                 if (!link.source.links.Contains(link)) {
                 link.source.links.push(link);
                 }
                 if (!link.target.incoming.Contains(link)) {
                 link.target.incoming.push(link);
                 }
                 if (!link.target.links.Contains(link)) {
                 link.target.links.push(link);
                 }*/
            }

            /**
             * Returns whether the given identifier or Link is part of this graph.
             * @param linkOrId An identifier or a Link object.
             * @returns {*}
             */
            hasLink(linkOrId) {
                if (TypeViz.IsString(linkOrId)) {
                    return this.links.Any(function (link) {
                        return link.id === linkOrId;
                    });
                }
                if (linkOrId.type === "Link") {
                    return this.links.Contains(linkOrId);
                }
                throw "The given object is neither an identifier nor a Link.";
            }
            /**
             * Gets the node with the specified Id or null if not part of this graph.
             */
            getNode(nodeOrId) {
                if (TypeViz.IsUndefined(nodeOrId)) {
                    throw "No identifier or Node specified.";
                }
                if (TypeViz.IsString(nodeOrId)) {
                    var ar = this.nodes.Find(function (n) {
                        return n.id == nodeOrId;
                    });
                    if (ar.length == 0) return null;
                    return ar[0];
                }
                else {
                    if (this.hasNode(nodeOrId)) {
                        return nodeOrId;
                    }
                    else {
                        return null;
                    }
                }
            }

            /**
             * Returns whether the given node or node Id is part of this graph.
             */
            hasNode(nodeOrId) {
                if (TypeViz.IsString(nodeOrId)) {
                    return this.nodes.Any(function (n) {
                        return n.id === nodeOrId;
                    });
                }
                if (TypeViz.IsObject(nodeOrId)) {
                    return this.nodes.Any(function (n) {
                        return n === nodeOrId;
                    });
                }
                throw "The identifier should be a Node or the Id (string) of a node.";
            }

            /**
             * Removes the given node from this graph.
             * The node can be specified as an object or as an identifier (string).
             */
            removeNode(nodeOrId) {
                var n = nodeOrId;
                if (TypeViz.IsString(nodeOrId)) {
                    n = this.getNode(nodeOrId);
                }

                if (TypeViz.IsDefined(n)) {
                    var links = n.links;
                    n.links = [];
                    for (var i = 0, len = links.length; i < len; i++) {
                        var link = links[i];
                        this.removeLink(link);
                    }
                    this.nodes.Remove(n);
                }
                else {
                    throw "The identifier should be a Node or the Id (string) of a node.";
                }
            }

            /**
             * Returns whether the given nodes are connected with a least one link independently of the direction.
             */
            areConnected(n1, n2) {
                return this.links.Any(function (link) {
                    return link.source == n1 && link.target == n2 || link.source == n2 && link.target == n1;
                });
            }

            /**
             * Removes the given link from this graph.
             */
            removeLink(link) {
                /*    if (!this.links.Contains(link)) {
                 throw "The given link is not part of the Graph.";
                 }
                 */
                this.links.Remove(link);

                link.source.outgoing.Remove(link);
                link.source.links.Remove(link);
                link.target.incoming.Remove(link);
                link.target.links.Remove(link);
            }

            /**
             * Adds a new node to this graph, if not already present.
             * The node can be an existing Node or the identifier of a new node.
             * No error is thrown if the node is already there and the existing one is returned.
             */
            addNode(nodeOrId, layoutRect?, owner?) {

                var newNode = null;

                if (!TypeViz.IsDefined(nodeOrId)) {
                    throw "No Node or identifier for a new Node is given.";
                }

                if (TypeViz.IsString(nodeOrId)) {
                    if (this.hasNode(nodeOrId)) {
                        return this.getNode(nodeOrId);
                    }
                    newNode = new Node(nodeOrId);
                }
                else {
                    if (this.hasNode(nodeOrId)) {
                        return this.getNode(nodeOrId);
                    }
                    // todo: ensure that the param is a Node?
                    newNode = nodeOrId;
                }

                if (TypeViz.IsDefined(layoutRect)) {
                    newNode.bounds(layoutRect);
                }

                if (TypeViz.IsDefined(owner)) {
                    newNode.owner = owner;
                }
                this.nodes.Add(newNode);
                return newNode;
            }

            /**
             * Adds the given Node and its outgoing links.
             */
            addNodeAndOutgoings(node) {

                if (!this.nodes.Contains(node)) {
                    this.nodes.push(node);
                }

                var newLinks = node.outgoing;
                node.outgoing = [];
                newLinks.ForEach(function (link) {
                    this.addExistingLink(link);
                }, this);
            }

            /**
             * Sets the 'index' property on the links and nodes of this graph.
             */
            setItemIndices() {
                var i;
                for (i = 0; i < this.nodes.length; ++i) {
                    this.nodes[i].index = i;
                }

                for (i = 0; i < this.links.length; ++i) {
                    this.links[i].index = i;
                }
            }

            /**
             * Returns a clone of this graph.
             */
            clone(saveMapping) {
                var copy = new Graph();
                var save = TypeViz.IsDefined(saveMapping) && saveMapping === true;
                if (save) {
                    copy.nodeMap = new Map();
                    copy.linkMap = new Map();
                }
                // we need a map even if the saveMapping is not set
                var map = new Map();
                this.nodes.ForEach(function (nOriginal) {
                    var nCopy = nOriginal.clone();
                    map.Set(nOriginal, nCopy);
                    copy.nodes.push(nCopy);

                    if (save) {
                        copy.nodeMap.Set(nCopy, nOriginal);
                    }
                });

                this.links.ForEach(function (linkOriginal) {
                    if (map.ContainsKey(linkOriginal.source) && map.ContainsKey(linkOriginal.target)) {
                        var linkCopy = copy.addLink(map.Get(linkOriginal.source), map.Get(linkOriginal.target));
                        if (save) {
                            copy.linkMap.Set(linkCopy, linkOriginal);
                        }
                    }
                });

                return copy;
            }

            /**
             * The parsing allows a quick way to create graphs.
             *  - ["n1->n2", "n2->n3"]: creates the three nodes and adds the links
             *  - ["n1->n2", {id: "QSDF"} "n2->n3"]: same as previous but also performs a deep extend of the link between n1 and n2 with the given object.
             */
            linearize(addIds?) {
                return Graph.Utils.linearize(this, addIds);
            }

            /**
             * Performs a depth-first traversal starting at the given node.
             * @param startNode a node or id of a node in this graph
             * @param action
             */
            depthFirstTraversal(startNode, action) {
                if (TypeViz.IsUndefined(startNode)) {
                    throw "You need to supply a starting node.";
                }
                if (TypeViz.IsUndefined(action)) {
                    throw "You need to supply an action.";
                }
                if (!this.hasNode(startNode)) {
                    throw "The given start-node is not part of this graph";
                }
                var foundNode = this.getNode(startNode);// case the given one is an Id
                var visited = [];
                this._dftIterator(foundNode, action, visited, null);
            }

            _dftIterator(node, action, visited, parent?) {

                action(node, parent);
                visited.Add(node);
                var children = node.getChildren();
                for (var i = 0, len = children.length; i < len; i++) {
                    var child = children[i];
                    if (visited.Contains(child)) {
                        continue;
                    }
                    this._dftIterator(child, action, visited, node);
                }
            }

            /**
             * Performs a breadth-first traversal starting at the given node.
             * @param startNode a node or id of a node in this graph
             * @param action
             */
            breadthFirstTraversal(startNode, action) {

                if (TypeViz.IsUndefined(startNode)) {
                    throw "You need to supply a starting node.";
                }
                if (TypeViz.IsUndefined(action)) {
                    throw "You need to supply an action.";
                }

                if (!this.hasNode(startNode)) {
                    throw "The given start-node is not part of this graph";
                }
                var foundNode = this.getNode(startNode);// case the given one is an Id
                var queue = new TypeViz.Queue();
                var visited = [];
                queue.enqueue(foundNode);

                while (queue.length > 0) {
                    var node = queue.dequeue();
                    action(node);
                    visited.Add(node);
                    var children = node.getChildren();
                    for (var i = 0, len = children.length; i < len; i++) {
                        var child = children[i];
                        if (visited.Contains(child) || queue.Contains(child)) {
                            continue;
                        }
                        queue.enqueue(child);
                    }
                }
            }

            /**
             * This is the classic Tarjan algorithm for strongly connected components.
             * See e.g. http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
             * @param excludeSingleItems Whether isolated nodes should be excluded from the analysis.
             * @param node The start node from which the analysis starts.
             * @param indices  Numbers the nodes consecutively in the order in which they are discovered.
             * @param lowLinks The smallest index of any node known to be reachable from the node, including the node itself
             * @param connected The current component.
             * @param stack The bookkeeping stack of things to visit.
             * @param index The counter of visited nodes used to assign the indices.
             * @private
             */
            _stronglyConnectedComponents(excludeSingleItems, node, indices, lowLinks, connected, stack, index) {
                indices.Add(node, index);
                lowLinks.Add(node, index);
                index++;

                stack.push(node);

                var children = node.getChildren(), next;
                for (var i = 0, len = children.length; i < len; i++) {
                    next = children[i];
                    if (!indices.ContainsKey(next)) {
                        this._stronglyConnectedComponents(excludeSingleItems, next, indices, lowLinks, connected, stack, index);
                        lowLinks.Add(node, Math.min(lowLinks.Get(node), lowLinks.Get(next)));
                    }
                    else if (stack.Contains(next)) {
                        lowLinks.Add(node, Math.min(lowLinks.Get(node), indices.Get(next)));
                    }
                }
                // If v is a root node, pop the stack and generate a strong component
                if (lowLinks.Get(node) === indices.Get(node)) {
                    var component = [];
                    do {
                        next = stack.pop();
                        component.Add(next);
                    }
                    while (next !== node);
                    if (!excludeSingleItems || (component.length > 1)) {
                        connected.Add(component);
                    }
                }
            }

            /**
             * Returns the cycles found in this graph.
             * The returned arrays consist of the nodes which are strongly coupled.
             * @param excludeSingleItems Whether isolated nodes should be excluded.
             * @returns {Array} The array of cycles found.
             */
            findCycles(excludeSingleItems?) {
                if (TypeViz.IsUndefined(excludeSingleItems)) {
                    excludeSingleItems = true;
                }
                var indices = new Map();
                var lowLinks = new Map();
                var connected = [];
                var stack = [];
                for (var i = 0, len = this.nodes.length; i < len; i++) {
                    var node = this.nodes[i];
                    if (indices.ContainsKey(node)) {
                        continue;
                    }
                    this._stronglyConnectedComponents(excludeSingleItems, node, indices, lowLinks, connected, stack, 0);
                }
                return connected;
            }

            /**
             * Returns whether this graph is acyclic.
             * @returns {*}
             */
            isAcyclic() {
                return this.findCycles().IsEmpty();
            }

            /**
             * Returns whether the given graph is a subgraph of this one.
             * @param other Another graph instance.
             */
            isSubGraph(other) {
                var otherArray = other.linearize();
                var thisArray = this.linearize();
                return otherArray.All(function (s) {
                    return thisArray.Contains(s);
                });
            }

            /**
             *  Makes an acyclic graph from the current (connected) one.
             * * @returns {Array} The reversed links.
             */
            makeAcyclic() {
                // if empty or almost empty
                if (this.IsEmpty || this.nodes.length <= 1 || this.links.length <= 1) {
                    return [];
                }
                // singular case of just two nodes
                if (this.nodes.length == 2) {
                    var result = [];
                    if (this.links.length > 1) {
                        var oneLink = this.links[0];
                        var oneNode = oneLink.source;
                        for (var i = 0, len = this.links.length; i < len; i++) {
                            var link = this.links[i];
                            if (link.source == oneNode) {
                                continue;
                            }
                            var rev = link.reverse();
                            result.Add(rev);
                        }
                    }
                    return result;
                }

                var copy = this.clone(true); // copy.nodeMap tells you the mapping
                var N = this.nodes.length;

                var intensityCatalog = new Map();

                /**
                 * If there are both incoming and outgoing links this will return the flow intensity (out-in).
                 * Otherwise the node acts as a flow source with N specifying the (equal) intensity.
                 * @param node
                 * @returns {number}
                 */
                var flowIntensity = function (node) {
                    if (node.outgoing.length === 0) {
                        return (2 - N);
                    }
                    else if (node.incoming.length === 0) {
                        return (N - 2);
                    }
                    else {
                        return node.outgoing.length - node.incoming.length;
                    }
                };

                /**
                 * Collects the nodes with the same intensity.
                 * @param node
                 * @param intensityCatalog
                 */
                var catalogEqualIntensity = function (node, intensityCatalog) {
                    var intensity = flowIntensity(node);
                    if (!intensityCatalog.ContainsKey(intensity)) {
                        intensityCatalog.Set(intensity, []);
                    }
                    intensityCatalog.Get(intensity).push(node);
                };

                copy.nodes.ForEach(function (v) {
                    catalogEqualIntensity(v, intensityCatalog);
                });

                var sourceStack = [];
                var targetStack = [];

                while (copy.nodes.length > 0) {
                    var source, target, intensity;
                    if (intensityCatalog.ContainsKey(2 - N)) {
                        var targets = intensityCatalog.Get(2 - N); // nodes without outgoings
                        while (targets.length > 0) {
                            target = targets.pop();
                            for (var li = 0; li < target.links.length; li++) {
                                var targetLink = target.links[li];
                                source = targetLink.getComplement(target);
                                intensity = flowIntensity(source);
                                intensityCatalog.Get(intensity).Remove(source);
                                source.removeLink(targetLink);
                                catalogEqualIntensity(source, intensityCatalog);
                            }
                            copy.nodes.Remove(target);
                            targetStack.unshift(target);
                        }
                    }

                    // move sources to sourceStack
                    if (intensityCatalog.ContainsKey(N - 2)) {
                        var sources = intensityCatalog.Get(N - 2); // nodes without incomings
                        while (sources.length > 0) {
                            source = sources.pop();
                            for (var si = 0; si < source.links.length; si++) {
                                var sourceLink = source.links[si];
                                target = sourceLink.getComplement(source);
                                intensity = flowIntensity(target);
                                intensityCatalog.Get(intensity).Remove(target);
                                target.removeLink(sourceLink);
                                catalogEqualIntensity(target, intensityCatalog);
                            }
                            sourceStack.push(source);
                            copy.nodes.Remove(source);
                        }
                    }

                    if (copy.nodes.length > 0) {
                        for (var k = N - 3; k > 2 - N; k--) {
                            if (intensityCatalog.ContainsKey(k) &&
                                intensityCatalog.Get(k).length > 0) {
                                var maxdiff = intensityCatalog.Get(k);
                                var v = maxdiff.pop();
                                for (var ri = 0; ri < v.links.length; ri++) {
                                    var ril = v.links[ri];
                                    var u = ril.getComplement(v);
                                    intensity = flowIntensity(u);
                                    intensityCatalog.Get(intensity).Remove(u);
                                    u.removeLink(ril);
                                    catalogEqualIntensity(u, intensityCatalog);
                                }
                                sourceStack.push(v);
                                copy.nodes.Remove(v);
                                break;
                            }
                        }
                    }
                }

                sourceStack = sourceStack.concat(targetStack);

                var vertexOrder = new Map();
                for (var kk = 0; kk < this.nodes.length; kk++) {
                    vertexOrder.Set(copy.nodeMap.Get(sourceStack[kk]), kk);
                }

                var reversedEdges = [];
                this.links.ForEach(function (link) {
                    if (vertexOrder.Get(link.source) > vertexOrder.Get(link.target)) {
                        link.reverse();
                        reversedEdges.push(link);
                    }
                });
                return reversedEdges;
            }
        }

    }
}