
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
/// <reference path='Diagramming.Graph.ts' />
module TypeViz {

    export module Diagramming {

        import HyperTree = TypeViz.Diagramming.Graph;
        import Map = TypeViz.Map;



        /*How the children of a node are aligned with respect to the parent.*/
        export enum ChildrenLayout {

            /*The topmost child will be aligned with the parent.*/
            TopAlignedWithParent= 0,

            /*The bottom of the child is aligned with the parent.*/
            BottomAlignedWithParent= 1,

            /* If the children are at the <see cref="TreeDirection.Right"/> or <see cref="TreeDirection.Left"/> this will furthermore
             * specify that they should be placed underneath the parent rather than at the distance from the right, respectively left of the parent.
             */
            Underneath= 2,

            /* Default layout.*/
            Default= 3
        };

        /*The supported graph layout algorithms.*/
        export enum LayoutTypes {

            /* The tree layout and its various variations.
             * See also the TreeLayoutType for subtypes of this.
             */
            TreeLayout = 0,

            /* The Sugiyama aka layered layout.*/
            LayeredLayout = 1,

            /* Spring-embedder aka force-directed layout. */
            ForceDirectedLayout = 2,

            /* Unspecified layout.*/
            None = 3
        };

        /*The different ways a tree can be oriented.*/
        export enum TreeDirection {
            /* Children evolve to the left.*/
            Left= 0,

            /* Children evolve to the right.*/
            Right= 1,

            /* Children evolve upwards.*/
            Up= 2,

            /* Children evolve downwards.*/
            Down= 3,

            /* No direction specified=0, this usually means the root node and it's a mind mapping root.*/
            None= 4,

            /* Radial layout.*/
            Radial= 5,

            /* Undefine layout.*/
            Undefined= 6
        };

        /*The subtypes of tree layout.*/
        export enum TreeLayoutType {

            /* The standard mind mapping layout.*/
            MindmapHorizontal= 0,

            /* The standard mind mapping layout but with the two wings laid out vertically.*/
            MindmapVertical= 1,

            /* Standard tree layout with the children positioned at the right of the root.*/
            TreeRight= 2,

            /* Standard tree layout with the children positioned at the left of the root.*/
            TreeLeft= 3,

            /*  Standard tree layout with the children positioned on top of the root.*/
            TreeUp= 4,

            /* Standard tree layout with the children positioned below the root.*/
            TreeDown= 5,

            /* Top-down layout with the children on the second level positioned as a tree view underneath the first level.*/
            TipOverTree= 6,

            /* Experimental radial tree layout.*/
            RadialTree= 7,

            /* Unspecified layout. This is not an algorithm but just a tag for the host application to tell that the user has not specified any layout yet.*/
            Undefined= 8
        };

        /*The subtypes of the layered layout.*/
        export enum LayeredLayoutType {
            Up= 0,
            Down= 1,
            Left= 2,
            Right= 3
        };

        /*The settings when a layout is applied to a diagram.*/
        export class LayoutSettings {

            /*The main type of layout to use. The SubType can further refine the main Type.*/
            public Type: LayoutTypes = LayoutTypes.TreeLayout;

            /*If the main Type is TreeLayout then this should be a TreeLayoutType, if the main type is LayeredLayout then this should be a LayereLayoutType.*/
            public SubType: any = TreeLayoutType.TreeDown;

            /*The roots to be used. This can be an array if the graph is not connected.*/
            public Roots = null;

            /*Whether to animate the layout transition.*/
            public Animate = false;

            //-------------------------------------------------------------------

            /* Force-directed option= whether the motion of the nodes should be limited by the boundaries of the diagram surface.*/
            public LimitToView = false;

            /* Force-directed option= the amount of friction applied to the motion of the nodes.*/
            public Friction = 0.9;

            /* Force-directed option= the optimal distance between nodes (minimum energy).*/
            public NodeDistance = 50;

            /* Force-directed option= the number of time things are being calculated.*/
            public Iterations = 300;

            //-------------------------------------------------------------------
            /* Tree option= the separation in one direction (depends on the subtype what direction this is).*/
            public HorizontalSeparation = 90;

            /* Tree option= the separation in the complementary direction (depends on the subtype what direction this is).*/
            public VerticalSeparation = 50;

            //-------------------------------------------------------------------

            /* Tip-over tree option= children-to-parent vertical distance.*/
            public UnderneathVerticalTopOffset = 15;

            /* Tip-over tree option= children-to-parent horizontal distance.*/
            public UnderneathHorizontalOffset = 15;

            /* Tip-over tree option= leaf-to-next-branch vertical distance.*/
            public UnderneathVerticalSeparation = 15;

            public TipOverTreeStartLevel = 0;
            //-------------------------------------------------------------------

            /* General Grid option= the width of the grid in which components are arranged. Beyond this width a component will be on the next row.*/
            public ComponentsGridWidth = 1500;

            /* General Grid option= the margin around the total grid.*/
            public TotalMargin = new Size(50, 50);

            /* General Grid option= the padding within a cell of the grid where a single component resides.*/
            public ComponentMargin = new Size(20, 20);

            //-------------------------------------------------------------------

            /* Layered option= the separation height/width between the layers.*/
            public LayerSeparation = 50;

            /* Layered option= how many rounds of shifting and fine-tuning.*/
            public LayeredIterations = 2;

            /* Tree-radial option= the angle at which the layout starts.*/
            public StartRadialAngle = 0;

            /* Tree-radial option= the angle at which the layout starts.*/
            public EndRadialAngle = 2 * Math.PI;

            /* Tree-radial option= the separation between levels.*/
            public RadialSeparation = 150;

            /* Tree-radial option= the separation between the root and the first level.*/
            public RadialFirstLevelSeparation = 200;

            /* Tree-radial option= whether a virtual roots bing the components in one radial layout.*/
            public KeepComponentsInOneRadialLayout = false;

            //-------------------------------------------------------------------

            // TODO= ensure to change this to false when containers are around
            public ignoreContainers = true;
            public layoutContainerChildren = false;
            public ignoreInvisible = true;
            public animateTransitions = false
        }

        /*Base class for layout algorithms.*/
        export class LayoutBase {
            public options: LayoutSettings;
            constructor() { }


            /**
             * Organizes the components in a grid.
             * Returns the final set of nodes (not the Graph).
             * @param components
             */
            gridLayoutComponents(components) {
                if (!components) {
                    throw "No components supplied.";
                }

                // calculate and cache the bounds of the components
                components.ForEach(c=> { c.calcBounds(); });

                // order by decreasing width
                components.sort(function (a, b) {
                    return b.bounds.Width - a.bounds.Width;
                });

                var maxWidth = this.options.ComponentsGridWidth,
                    offsetX = this.options.ComponentMargin.Width,
                    offsetY = this.options.ComponentMargin.Height,
                    height = 0,
                    startX = this.options.TotalMargin.Width,
                    startY = this.options.TotalMargin.Height,
                    x = startX,
                    y = startY,
                    i,
                    resultLinkSet = [],
                    resultNodeSet = [];

                while (components.length > 0) {
                    if (x >= maxWidth) {
                        // start a new row
                        x = startX;
                        y += height + offsetY;
                        // reset the row height
                        height = 0;
                    }
                    var component = components.pop();
                    this.moveToOffset(component, new Point(x, y));
                    for (i = 0; i < component.nodes.length; i++) {
                        resultNodeSet.push(component.nodes[i]); // to be returned in the end
                    }
                    for (i = 0; i < component.links.length; i++) {
                        resultLinkSet.push(component.links[i]);
                    }
                    var boundingRect = component.bounds;
                    var currentHeight = boundingRect.Height;
                    if (currentHeight <= 0 || isNaN(currentHeight)) {
                        currentHeight = 0;
                    }
                    var currentWidth = boundingRect.Width;
                    if (currentWidth <= 0 || isNaN(currentWidth)) {
                        currentWidth = 0;
                    }

                    if (currentHeight >= height) {
                        height = currentHeight;
                    }
                    x += currentWidth + offsetX;
                }

                return {
                    nodes: resultNodeSet,
                    links: resultLinkSet
                };
            }

            moveToOffset(component, p) {

                var i, j,
                    bounds = component.bounds,
                    deltax = p.X - bounds.X,
                    deltay = p.Y - bounds.Y;

                for (i = 0; i < component.nodes.length; i++) {
                    var node = component.nodes[i];
                    var nodeBounds = node.Bounds;
                    if (nodeBounds.Width === 0 && nodeBounds.Height === 0 && nodeBounds.X === 0 && nodeBounds.Y === 0) {
                        nodeBounds = new Rect(0, 0, 0, 0);
                    }
                    nodeBounds.X += deltax;
                    nodeBounds.Y += deltay;
                    node.Bounds = nodeBounds;
                }
                //Swa: points
                for (i = 0; i < component.links.length; i++) {
                    var link = component.links[i];
                    if (TypeViz.IsDefined(link.points) && link.points.length > 0) {
                        var newpoints = [];
                        var points = link.points;
                        for (j = 0; j < points.length; j++) {
                            var pt = points[j];
                            pt.x += deltax;
                            pt.y += deltay;
                            newpoints.push(pt);
                        }
                        link.points = newpoints;
                    }
                }
                // this.currentHorizontalOffset += bounds.Width + this.options.totalMargin.Width;
                return new Point(deltax, deltay);
            }

            /* transferOptions(options) {

                 // Size options lead to stackoverflow and need special handling

                 this.options = this.defaultOptions;
                 if (TypeViz.IsUndefined(options)) {
                     return;
                 }
                 if (options) {
                     if (options.totalMargin) {
                         this.options.TotalMargin = options.totalMargin;
                         delete options.totalMargin;
                     }
                     if (options.componentMargin) {
                         this.options.ComponentMargin = options.componentMargin;
                         delete options.componentMargin;
                     }
                 }
                 this.options = TypeViz.deepExtend(this.options, options || {});
             }*/
        }

        /*An animation adapter to animate the layout process.*/
        export class NodePositionAdapter extends TypeViz.Animation.AdapterBase {
            private layoutState;
            private diagram;
            private froms;
            private tos;
            private subjects;
            constructor(layoutState) {
                super();
                this.layoutState = layoutState;
                this.diagram = layoutState.diagram;
            }
            initState() {
                this.froms = [];
                this.tos = [];
                this.subjects = [];
                function pusher(id, bounds) {
                    var shape = this.diagram.getId(id);
                    if (shape) {
                        this.subjects.push(shape);
                        this.froms.push(shape.Rectangle.TopLeft);
                        this.tos.push(bounds.TopLeft);
                    }
                }

                this.layoutState.nodeMap.forEach(pusher, this);
            }
            update(tick) {
                if (this.subjects.length <= 0) {
                    return;
                }
                for (var i = 0; i < this.subjects.length; i++) {
                    //todo: define a Lerp function instead
                    this.subjects[i].position(
                        new Point(this.froms[i].X + (this.tos[i].X - this.froms[i].X) * tick, this.froms[i].Y + (this.tos[i].Y - this.froms[i].Y) * tick)
                        );
                }
            }
        }

        /*The helper class to create hypertrees.*/
        export class DiagramToHyperTreeAdapter {
            private nodeMap;
            private shapeMap;
            private edgeMap;
            private nodes;
            private edges;
            private finalNodes;
            private finalLinks;
            private ignoredConnections;
            private ignoredShapes;
            private hyperTree;
            private finalGraph;
            private diagram;
            private hyperMap;
            private options;
            constructor(diagram) {

                /**
                 * The mapping to/from the original nodes.
                 * @type {Map}
                 */
                this.nodeMap = new Map();

                /**
                 * Gets the mapping of a shape to a container in case the shape sits in a collapsed container.
                 * @type {Map}
                 */
                this.shapeMap = new Map();

                /**
                 * The nodes being mapped.
                 * @type {Map}
                 */
                this.nodes = [];

                /**
                 * The connections being mapped.
                 * @type {Map}
                 */
                this.edges = [];

                // the mapping from an edge to all the connections it represents, this can be both because of multiple connections between
                // two shapes or because a container holds multiple connections to another shape or container.
                this.edgeMap = new Map();

                /**
                 * The resulting set of Nodes when the analysis has finished.
                 * @type {Array}
                 */
                this.finalNodes = [];

                /**
                 * The resulting set of Links when the analysis has finished.
                 * @type {Array}
                 */
                this.finalLinks = [];

                /**
                 * The items being omitted because of multigraph edges.
                 * @type {Array}
                 */
                this.ignoredConnections = [];

                /**
                 * The items being omitted because of containers, visibility and other factors.
                 * @type {Array}
                 */
                this.ignoredShapes = [];

                /**
                 * The map from a node to the partition/hypernode in which it sits. This hyperMap is null if 'options.layoutContainerChildren' is false.
                 * @type {Map}
                 */
                this.hyperMap = new Map();

                /**
                 * The hypertree Contains the hierarchy defined by the containers.
                 * It's in essence a Graph of Graphs with a tree structure defined by the hierarchy of containers.
                 * @type {HyperTree}
                 */
                this.hyperTree = new Graph();

                /**
                 * The resulting graph after conversion. Note that this does not supply the information contained in the
                 * ignored connection and shape collections.
                 * @type {null}
                 */
                this.finalGraph = null;

                this.diagram = diagram;
            }

            /**
             * The hyperTree is used when the 'options.layoutContainerChildren' is true. It Contains the hierarchy of containers whereby each node is a ContainerGraph.
             * This type of node has a Container reference to the container which holds the Graph items. There are three possible situations during the conversion process:
             *  - Ignore the containers: the container are non-existent and only normal shapes are mapped. If a shape has a connection to a container it will be ignored as well
             *    since there is no node mapped for the container.
             *  - Do not ignore the containers and leave the content of the containers untouched: the top-level elements are being mapped and the children within a container are not altered.
             *  - Do not ignore the containers and organize the content of the containers as well: the hypertree is constructed and there is a partitioning of all nodes and connections into the hypertree.
             *    The only reason a connection or node is not being mapped might be due to the visibility, which includes the visibility change through a collapsed parent container.
             * @param options
             */
            convert(options?) {

                if (TypeViz.IsUndefined(this.diagram)) {
                    throw "No diagram to convert.";
                }

                this.options = TypeViz.deepExtend({
                    ignoreInvisible: true,
                    ignoreContainers: true,
                    layoutContainerChildren: false
                },
                    options || {}
                    );

                this.clear();
                // create the nodes which participate effectively in the graph analysis
                this._renormalizeShapes();

                // recreate the incoming and outgoing collections of each and every node
                this._renormalizeConnections();

                // export the resulting graph
                /* this.finalNodes = new Map(this.nodes);
                 this.finalLinks = new Map(this.edges);*/

                this.finalGraph = new Graph();
                this.nodes.ForEach(function (n) {
                    this.finalGraph.addNode(n);
                }, this);
                this.edges.ForEach(function (l) {
                    this.finalGraph.addExistingLink(l);
                }, this);
                return this.finalGraph;
            }

            /**
             * Maps the specified connection to an edge of the graph deduced from the given diagram.
             * @param connection
             * @returns {*}
             */
            mapConnection(connection) {
                return this.edgeMap.first(function (edge) {
                    return this.edgeMap.Get(edge).Contains(connection);
                });
            }

            /**
             * Maps the specified shape to a node of the graph deduced from the given diagram.
             * @param shape
             * @returns {*}
             */
            mapShape(shape) {
                var keys = this.nodeMap.keys();
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    if (this.nodeMap.Get(key).Contains(shape)) {
                        return key;
                    }
                }
            }

            /**
             * Gets the edge, if any, between the given nodes.
             * @param a
             * @param b
             */
            getEdge(a, b) {
                return a.links.first(function (link) {
                    return link.getComplement(a) === b;
                });
            }

            /**
             * Clears all the collections used by the conversion process.
             */
            clear() {
                this.finalGraph = null;
                this.hyperTree = (!this.options.ignoreContainers && this.options.layoutContainerChildren) ? new HyperTree() : null;
                this.hyperMap = (!this.options.ignoreContainers && this.options.layoutContainerChildren) ? new Map() : null;
                this.nodeMap = new Map();
                this.shapeMap = new Map();
                this.nodes = [];
                this.edges = [];
                this.edgeMap = new Map();
                this.ignoredConnections = [];
                this.ignoredShapes = [];
                this.finalNodes = [];
                this.finalLinks = [];
            }

            /**
             * The path from a given ContainerGraph to the root (container).
             * @param containerGraph
             * @returns {Array}
             */
            listToRoot(containerGraph) {
                var list = [];
                var s = containerGraph.container;
                if (!s) {
                    return list;
                }
                list.Add(s);
                while (s.parentContainer) {
                    s = s.parentContainer;
                    list.Add(s);
                }
                list.reverse();
                return list;
            }

            firstNonIgnorableContainer(shape) {

                if (shape.isContainer && !this.isIgnorableItem(shape)) {
                    return shape;
                }
                return !shape.parentContainer ? null : this.firstNonIgnorableContainer(shape.parentContainer);
            }
            isContainerConnection(a, b) {
                if (a.isContainer && this.isDescendantOf(a, b)) {
                    return true;
                }
                return b.isContainer && this.isDescendantOf(b, a);
            }

            /**
             * Returns true if the given shape is a direct child or a nested container child of the given container.
             * If the given container and shape are the same this will return false since a shape cannot be its own child.
             * @param scope
             * @param a
             * @returns {boolean}
             */
            isDescendantOf(scope, a) {
                if (!scope.isContainer) {
                    throw "Expecting a container.";
                }
                if (scope === a) {
                    return false;
                }
                if (scope.children.Contains(a)) {
                    return true;
                }
                var containers = [];
                for (var i = 0, len = scope.children.length; i < len; i++) {
                    var c = scope.children[i];
                    if (c.isContainer && this.isDescendantOf(c, a)) {
                        containers.push(c);
                    }
                }

                return containers.length > 0;
            }
            isIgnorableItem(shape) {
                if (this.options.ignoreInvisible) {
                    return !this._isVisible(shape);
                }
                else {
                    return shape.isCollapsed && !this._isTop(shape);
                }
            }

            /**
             *  Determines whether the shape is or needs to be mapped to another shape. This occurs essentially when the shape sits in
             * a collapsed container hierarchy and an external connection needs a node endpoint. This node then corresponds to the mapped shape and is
             * necessarily a container in the parent hierarchy of the shape.
             * @param shape
             */
            isShapeMapped(shape) {
                return shape.isCollapsed && !this._isVisible(shape) && !this._isTop(shape);
            }

            leastCommonAncestor(a, b) {
                if (!a) {
                    throw "Parameter should not be null.";
                }
                if (!b) {
                    throw "Parameter should not be null.";
                }

                if (!this.hyperTree) {
                    throw "No hypertree available.";
                }
                var al = this.listToRoot(a);
                var bl = this.listToRoot(b);
                var found = null;
                if (al.IsEmpty() || bl.IsEmpty()) {
                    return this.hyperTree.root.data;
                }
                var xa = al[0];
                var xb = bl[0];
                var i = 0;
                while (xa === xb) {
                    found = al[i];
                    i++;
                    if (i >= al.length || i >= bl.length) {
                        break;
                    }
                    xa = al[i];
                    xb = bl[i];
                }
                if (!found) {
                    return this.hyperTree.root.data;
                }
                else {
                    return this.hyperTree.nodes.Where(n=> n.data.container === found);
                }
            }
            /**
             * Determines whether the specified item is a top-level shape or container.
             * @param item
             * @returns {boolean}
             * @private
             */
            _isTop(item) {
                return !item.parentContainer;
            }

            /**
             * Determines iteratively (by walking up the container stack) whether the specified shape is visible.
             * This does NOT tell whether the item is not visible due to an explicit Visibility change or due to a collapse state.
             * @param shape
             * @returns {*}
             * @private
             */
            _isVisible(shape) {

                if (!shape.IsVisible) {
                    return false;
                }
                return !shape.parentContainer ? shape.IsVisible : this._isVisible(shape.parentContainer);
            }

            _isCollapsed(shape) {

                if (shape.isContainer && shape.isCollapsed) {
                    return true;
                }
                return shape.parentContainer && this._isCollapsed(shape.parentContainer);
            }

            /**
             * First part of the graph creation; analyzing the shapes and containers and deciding whether they should be mapped to a Node.
             * @private
             */
            _renormalizeShapes() {
                // add the nodes, the adjacency structure will be reconstructed later on
                if (this.options.ignoreContainers) {
                    for (var i = 0, len = this.diagram.shapes.length; i < len; i++) {
                        var shape = this.diagram.shapes[i];

                        // if not visible (and ignoring the invisible ones) or a container we skip
                        if ((this.options.ignoreInvisible && !this._isVisible(shape)) || shape.isContainer) {
                            this.ignoredShapes.Add(shape);
                            continue;
                        }
                        var node = new Node(shape.Id, shape);
                        node.isVirtual = false;

                        // the mapping will always contain singletons and the hyperTree will be null
                        this.nodeMap.Add(node, [shape]);
                        this.nodes.Add(node);
                    }
                }
                else {
                    throw "Containers are not supported yet, but stay tuned.";
                }
            }

            /**
             * Second part of the graph creation; analyzing the connections and deciding whether they should be mapped to an edge.
             * @private
             */
            _renormalizeConnections() {
                if (this.diagram.connections.length === 0) {
                    return;
                }
                for (var i = 0, len = this.diagram.connections.length; i < len; i++) {
                    var conn = this.diagram.connections[i];

                    if (this.isIgnorableItem(conn)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    var source = !conn.fromConnector ? null : conn.fromConnector.parent;
                    var sink = !conn.toConnector ? null : conn.toConnector.parent;

                    // no layout for floating connections
                    if (!source || !sink) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    if (this.ignoredShapes.Contains(source) && !this.shapeMap.ContainsKey(source)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }
                    if (this.ignoredShapes.Contains(sink) && !this.shapeMap.ContainsKey(sink)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    // if the endpoint sits in a collapsed container we need the container rather than the shape itself
                    if (this.shapeMap.ContainsKey(source)) {
                        source = this.shapeMap[source];
                    }
                    if (this.shapeMap.ContainsKey(sink)) {
                        sink = this.shapeMap[sink];
                    }

                    var sourceNode = this.mapShape(source);
                    var sinkNode = this.mapShape(sink);
                    if ((sourceNode === sinkNode) || this.areConnectedAlready(sourceNode, sinkNode)) {
                        this.ignoredConnections.Add(conn);
                        continue;
                    }

                    if (sourceNode === null || sinkNode === null) {
                        throw "A shape was not mapped to a node.";
                    }
                    if (this.options.ignoreContainers) {
                        // much like a floating connection here since at least one end is attached to a container
                        if (sourceNode.isVirtual || sinkNode.isVirtual) {
                            this.ignoredConnections.Add(conn);
                            continue;
                        }
                        var newEdge = new Link(sourceNode, sinkNode, conn.Id, conn);

                        this.edgeMap.Add(newEdge, [conn]);
                        this.edges.Add(newEdge);
                    }
                    else {
                        throw "Containers are not supported yet, but stay tuned.";
                    }
                }
            }

            areConnectedAlready(n, m) {
                return this.edges.Any(l=> l.source === n && l.target === m || l.source === m && l.target === n);
            }

            /**
             * Depth-first traversal of the given container.
             * @param container
             * @param action
             * @param includeStart
             * @private
             */
            /* _visitContainer (container, action, includeStart) {

             *//*if (container == null) throw new ArgumentNullException("container");
                                                                                                                                                                                                                                 if (action == null) throw new ArgumentNullException("action");
                                                                                                                                                                                                                                 if (includeStart) action(container);
                                                                                                                                                                                                                                 if (container.children.IsEmpty) return;
                                                                                                                                                                                                                                 foreach(
                                                                                                                                                                                                                                 var item
                                                                                                                                                                                                                                 in
                                                                                                                                                                                                                                 container.children.OfType < IShape > ()
                                                                                                                                                                                                                                 )
                                                                                                                                                                                                                                 {
                                                                                                                                                                                                                                 var childContainer = item
                                                                                                                                                                                                                                 as
                                                                                                                                                                                                                                 IContainerShape;
                                                                                                                                                                                                                                 if (childContainer != null) this.VisitContainer(childContainer, action);
                                                                                                                                                                                                                                 else action(item);
                                                                                                                                                                                                                                 }*//*
                                                                                                                                                                                                                                 }*/


        }

        /**
        * The classic spring-embedder (aka force-directed, Fruchterman-Rheingold, barycentric) algorithm.
        * http://en.wikipedia.org/wiki/Force-directed_graph_drawing
        *  - Chapter 12 of Tamassia et al. "Handbook of graph drawing and visualization".
        *  - Kobourov on preprint arXiv; http://arxiv.org/pdf/1201.3011.pdf
        *  - Fruchterman and Rheingold in SOFTWARE-PRACTICE AND EXPERIENCE, VOL. 21(1 1), 1129-1164 (NOVEMBER 1991)
        * @type {*}
        */
        export class SpringLayout extends LayoutBase {
            private graph;
            private diagram;
            private temperature;
            private Width;
            private Height;
            private refineStage;
            constructor(diagram) {
                super();
                var that = this;

                if (TypeViz.IsUndefined(diagram)) {
                    throw "Diagram is not specified.";
                }
                this.diagram = diagram;
            }

            Layout(options) {

                this.options = options;
                var adapter = new DiagramToHyperTreeAdapter(this.diagram);
                var graph = adapter.convert(options);
                if (graph.IsEmpty) {
                    return;
                }
                // split into connected components
                var components = graph.getConnectedComponents();
                if (components.IsEmpty()) {
                    return;
                }
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    this.layoutGraph(component, options);
                }
                var finalNodeSet = this.gridLayoutComponents(components);
                return new LayoutState(this.diagram, finalNodeSet);
            }

            layoutGraph(graph, options) {

                this.options = options;
                this.graph = graph;

                var initialTemperature = this.options.NodeDistance * 9;
                this.temperature = initialTemperature;

                var guessBounds = this._expectedBounds();
                this.Width = guessBounds.Width;
                this.Height = guessBounds.Height;

                for (var step = 0; step < this.options.Iterations; step++) {
                    this.refineStage = step >= this.options.Iterations * 5 / 6;
                    this.tick();
                    // exponential cooldown
                    this.temperature = this.refineStage ?
                    initialTemperature / 30 :
                    initialTemperature * (1 - step / (2 * this.options.Iterations));
                }
            }

            /**
             * Single iteration of the simulation.
             */
            tick() {
                var i;
                // collect the repulsive forces on each node
                for (i = 0; i < this.graph.nodes.length; i++) {
                    this._repulsion(this.graph.nodes[i]);
                }

                // collect the attractive forces on each node
                for (i = 0; i < this.graph.links.length; i++) {
                    this._attraction(this.graph.links[i]);
                }
                // update the positions
                for (i = 0; i < this.graph.nodes.length; i++) {
                    var node = this.graph.nodes[i];
                    var offset = Math.sqrt(node.dx * node.dx + node.dy * node.dy);
                    if (offset === 0) {
                        return;
                    }
                    node.X += Math.min(offset, this.temperature) * node.dx / offset;
                    node.Y += Math.min(offset, this.temperature) * node.dy / offset;
                    if (this.options.LimitToView) {
                        node.X = Math.min(this.Width, Math.max(node.Width / 2, node.X));
                        node.Y = Math.min(this.Height, Math.max(node.Height / 2, node.Y));
                    }
                }
            }

            /**
             * Shakes the node away from its current position to escape the deadlock.
             * @param node A Node.
             * @private
             */
            _shake(node) {
                // just a simple polar neighborhood
                var rho = Math.random() * this.options.NodeDistance / 4;
                var alpha = Math.random() * 2 * Math.PI;
                node.X += rho * Math.cos(alpha);
                node.Y -= rho * Math.sin(alpha);
            }

            /**
             * The typical Coulomb-Newton force law F=k/r^2
             * @remark This only works in dimensions less than three.
             * @param d
             * @param n A Node.
             * @param m Another Node.
             * @returns {number}
             * @private
             */
            _InverseSquareForce(d, n, m) {
                var force;
                if (!this.refineStage) {
                    force = Math.pow(d, 2) / Math.pow(this.options.NodeDistance, 2);
                }
                else {
                    var deltax = n.X - m.X;
                    var deltay = n.Y - m.Y;

                    var wn = n.Width / 2;
                    var hn = n.Height / 2;
                    var wm = m.Width / 2;
                    var hm = m.Height / 2;

                    force = (Math.pow(deltax, 2) / Math.pow(wn + wm + this.options.NodeDistance, 2)) + (Math.pow(deltay, 2) / Math.pow(hn + hm + this.options.NodeDistance, 2));
                }
                return force * 4 / 3;
            }

            /**
             * The typical Hooke force law F=kr^2
             * @param d
             * @param n
             * @param m
             * @returns {number}
             * @private
             */
            _SquareForce(d, n, m) {
                return 1 / this._InverseSquareForce(d, n, m);
            }

            _repulsion(n) {
                n.dx = 0;
                n.dy = 0;
                this.graph.nodes.ForEach(function (m) {
                    if (m === n) {
                        return;
                    }
                    while (n.X === m.X && n.Y === m.Y) {
                        this._shake(m);
                    }
                    var vx = n.X - m.X;
                    var vy = n.Y - m.Y;
                    var distance = Math.sqrt(vx * vx + vy * vy);
                    var r = this._SquareForce(distance, n, m) * 2;
                    n.dx += (vx / distance) * r;
                    n.dy += (vy / distance) * r;
                }, this);
            }
            _attraction(link) {
                var t = link.target;
                var s = link.source;
                if (s === t) {
                    // loops induce endless shakes
                    return;
                }
                while (s.X === t.X && s.Y === t.Y) {
                    this._shake(t);
                }

                var vx = s.X - t.X;
                var vy = s.Y - t.Y;
                var distance = Math.sqrt(vx * vx + vy * vy);

                var a = this._InverseSquareForce(distance, s, t) * 5;
                var dx = (vx / distance) * a;
                var dy = (vy / distance) * a;
                t.dx += dx;
                t.dy += dy;
                s.dx -= dx;
                s.dy -= dy;
            }

            /**
             * Calculates the expected bounds after layout.
             * @returns {*}
             * @private
             */
            _expectedBounds() {

                var size, N = this.graph.nodes.length, /*golden ration optimal?*/ ratio = 1.5, multiplier = 4;
                if (N === 0) {
                    return size;
                }
                size = this.graph.nodes.Fold(function (s, node) {
                    var area = node.Width * node.Height;
                    if (area > 0) {
                        s += Math.sqrt(area);
                        return s;
                    }
                    return 0;
                }, 0, this);
                var av = size / N;
                var squareSize = av * Math.ceil(Math.sqrt(N));
                var width = squareSize * Math.sqrt(ratio);
                var height = squareSize / Math.sqrt(ratio);
                return { width: width * multiplier, height: height * multiplier };
            }

        }

        /*The processor performing the tree layout on a connected component.*/
        export class TreeLayoutProcessor {
            private center;
            private options: LayoutSettings;
            private previousRoot;
            private maxDepth;
            private origin;
            private graph;

            constructor(options: LayoutSettings) {
                this.center = null;
                this.options = options;
            }
            Layout(treeGraph, root) {
                this.graph = treeGraph;
                if (!this.graph.nodes || this.graph.nodes.length === 0) {
                    return;
                }

                if (!this.graph.nodes.Contains(root)) {
                    throw "The given root is not in the graph.";
                }

                this.center = root;
                this.graph.cacheRelationships();
                /* var nonull = this.graph.nodes.Where(function (n) {
                 return n.associatedShape != null;
                 });*/

                // transfer the rects
                /*nonull.ForEach(function (n) {
                 n.Location = n.associatedShape.Position;
                 n.NodeSize = n.associatedShape.ActualBounds.ToSize();
                 }

                 );*/

                // caching the children
                /* nonull.ForEach(function (n) {
                 n.children = n.getChildren();
                 });*/

                this.layoutSwitch();

                // apply the layout to the actual visuals
                // nonull.ForEach(n => n.associatedShape.Position = n.Location);
            }

            layoutLeft(left) {
                this.setChildrenDirection(this.center, "Left", false);
                this.setChildrenLayout(this.center, "Default", false);
                var h = 0, w = 0, y, i, node;
                for (i = 0; i < left.length; i++) {
                    node = left[i];
                    node.TreeDirection = "Left";
                    var s = this.measure(node, Size.Empty);
                    w = Math.max(w, s.Width);
                    h += s.Height + this.options.VerticalSeparation;
                }

                h -= this.options.VerticalSeparation;
                var x = this.center.X - this.options.HorizontalSeparation;
                y = this.center.Y + ((this.center.Height - h) / 2);
                for (i = 0; i < left.length; i++) {
                    node = left[i];
                    var p = new Point(x - node.Size.Width, y);

                    this.arrange(node, p);
                    y += node.Size.Height + this.options.VerticalSeparation;
                }
            }

            layoutRight(right) {
                this.setChildrenDirection(this.center, "Right", false);
                this.setChildrenLayout(this.center, "Default", false);
                var h = 0, w = 0, y, i, node;
                for (i = 0; i < right.length; i++) {
                    node = right[i];
                    node.TreeDirection = "Right";
                    var s = this.measure(node, Size.Empty);
                    w = Math.max(w, s.Width);
                    h += s.Height + this.options.VerticalSeparation;
                }

                h -= this.options.VerticalSeparation;
                var x = this.center.X + this.options.HorizontalSeparation + this.center.Width;
                y = this.center.Y + ((this.center.Height - h) / 2);
                for (i = 0; i < right.length; i++) {
                    node = right[i];
                    var p = new Point(x, y);
                    this.arrange(node, p);
                    y += node.Size.Height + this.options.VerticalSeparation;
                }
            }

            layoutUp(up) {
                this.setChildrenDirection(this.center, "Up", false);
                this.setChildrenLayout(this.center, "Default", false);
                var w = 0, y, node, i;
                for (i = 0; i < up.length; i++) {
                    node = up[i];
                    node.TreeDirection = "Up";
                    var s = this.measure(node, Size.Empty);
                    w += s.Width + this.options.HorizontalSeparation;
                }

                w -= this.options.HorizontalSeparation;
                var x = this.center.X + (this.center.Width / 2) - (w / 2);

                // y = this.center.Y -VerticalSeparation -this.center.Height/2 - h;
                for (i = 0; i < up.length; i++) {
                    node = up[i];
                    y = this.center.Y - this.options.VerticalSeparation - node.Size.Height;
                    var p = new Point(x, y);
                    this.arrange(node, p);
                    x += node.Size.Width + this.options.HorizontalSeparation;
                }
            }

            layoutDown(down) {
                var node, i;
                this.setChildrenDirection(this.center, "Down", false);
                this.setChildrenLayout(this.center, "Default", false);
                var w = 0, y;
                for (i = 0; i < down.length; i++) {
                    node = down[i];
                    node.treeDirection = "Down";
                    var s = this.measure(node, Size.Empty);
                    w += s.Width + this.options.HorizontalSeparation;
                }

                w -= this.options.HorizontalSeparation;
                var x = this.center.X + (this.center.Width / 2) - (w / 2);
                y = this.center.Y + this.options.VerticalSeparation + this.center.Height;
                for (i = 0; i < down.length; i++) {
                    node = down[i];
                    var p = new Point(x, y);
                    this.arrange(node, p);
                    x += node.Size.Width + this.options.HorizontalSeparation;
                }
            }

            layoutRadialTree() {
                // var rmax = children.Aggregate(0D, (current, node) => Math.max(node.SectorAngle, current));
                this.setChildrenDirection(this.center, "Radial", false);
                this.setChildrenLayout(this.center, "Default", false);
                this.previousRoot = null;
                var startAngle = this.options.StartRadialAngle;
                var endAngle = this.options.EndRadialAngle;
                if (endAngle <= startAngle) {
                    throw "Final angle should not be less than the start angle.";
                }

                this.maxDepth = 0;
                this.origin = new Point(this.center.X, this.center.Y);
                this.calculateAngularWidth(this.center, 0);

                // perform the layout
                if (this.maxDepth > 0) {
                    this.radialLayout(this.center, this.options.RadialFirstLevelSeparation, startAngle, endAngle);
                }

                // update properties of the root node
                this.center.Angle = endAngle - startAngle;
            }

            tipOverTree(down, startFromLevel) {
                if (TypeViz.IsUndefined(startFromLevel)) {
                    startFromLevel = 0;
                }

                this.setChildrenDirection(this.center, "Down", false);
                this.setChildrenLayout(this.center, "Default", false);
                this.setChildrenLayout(this.center, "Underneath", false, startFromLevel);
                var w = 0, y, node, i;
                for (i = 0; i < down.length; i++) {
                    node = down[i];

                    // if (node.IsSpecial) continue;
                    node.TreeDirection = "Down";
                    var s = this.measure(node, Size.Empty);
                    w += s.Width + this.options.HorizontalSeparation;
                }

                w -= this.options.HorizontalSeparation;

                // putting the root in the center with respect to the whole diagram is not a nice result, let's put it with respect to the first level only
                w -= down[down.length - 1].Width;
                w += down[down.length - 1].associatedShape.Rectangle.Width;

                var x = this.center.X + (this.center.Width / 2) - (w / 2);
                y = this.center.Y + this.options.VerticalSeparation + this.center.Height;
                for (i = 0; i < down.length; i++) {
                    node = down[i];
                    // if (node.IsSpecial) continue;
                    var p = new Point(x, y);
                    this.arrange(node, p);
                    x += node.Size.Width + this.options.HorizontalSeparation;
                }

                /*//let's place the special node, assuming there is only one
                 if (down.Count(n => n.IsSpecial) > 0)
                 {
                 var special = (from n in down where n.IsSpecial select n).First();
                 if (special.Children.Count > 0)
                 throw new DiagramException("The 'special' element should not have children.");
                 special.Data.Location = new Point(Center.Data.Location.X + Center.AssociatedShape.BoundingRectangle.Width + this.options.HorizontalSeparation, Center.Data.Location.Y);
                 }*/
            }

            calculateAngularWidth(n, d) {
                if (d > this.maxDepth) {
                    this.maxDepth = d;
                }

                var aw = 0, w = 1000, h = 1000, diameter = d === 0 ? 0 : Math.sqrt((w * w) + (h * h)) / d;

                if (n.children.length > 0) {
                    // eventually with n.IsExpanded
                    for (var i = 0, len = n.children.length; i < len; i++) {
                        var child = n.children[i];
                        aw += this.calculateAngularWidth(child, d + 1);
                    }
                    aw = Math.max(diameter, aw);
                }
                else {
                    aw = diameter;
                }

                n.sectorAngle = aw;
                return aw;
            }

            sortChildren(n) {
                var basevalue = 0, i;

                // update basevalue angle for node ordering
                if (n.parents.length > 1) {
                    throw "Node is not part of a tree.";
                }
                var p = n.parents[0];
                if (p) {
                    var pl = new Point(p.X, p.Y);
                    var nl = new Point(n.X, n.Y);
                    basevalue = this.normalizeAngle(Math.atan2(pl.Y - nl.Y, pl.X - nl.X));
                }

                var count = n.children.length;
                if (count === 0) {
                    return null;
                }

                var angle = [];
                var idx = [];

                for (i = 0; i < count; ++i) {
                    var c = n.children[i];
                    var l = new Point(c.X, c.Y);
                    idx[i] = i;
                    angle[i] = this.normalizeAngle(-basevalue + Math.atan2(l.Y - l.Y, l.X - l.X));
                }

                Array.prototype.BiSort(angle, idx);
                var col = []; // list of nodes
                var children = n.children;
                for (i = 0; i < count; ++i) {
                    col.Add(children[idx[i]]);
                }

                return col;
            }

            normalizeAngle(angle) {
                while (angle > Math.PI * 2) {
                    angle -= 2 * Math.PI;
                }
                while (angle < 0) {
                    angle += Math.PI * 2;
                }
                return angle;
            }

            radialLayout(node, radius, startAngle, endAngle) {
                var deltaTheta = endAngle - startAngle;
                var deltaThetaHalf = deltaTheta / 2.0;
                var parentSector = node.sectorAngle;
                var fraction = 0;
                var sorted = this.sortChildren(node);
                for (var i = 0, len = sorted.length; i < len; i++) {
                    var childNode = sorted[i];
                    var cp = childNode;
                    var childAngleFraction = cp.sectorAngle / parentSector;
                    if (childNode.children.length > 0) {
                        this.radialLayout(childNode,
                            radius + this.options.RadialSeparation,
                            startAngle + (fraction * deltaTheta),
                            startAngle + ((fraction + childAngleFraction) * deltaTheta));
                    }

                    this.setPolarLocation(childNode, radius, startAngle + (fraction * deltaTheta) + (childAngleFraction * deltaThetaHalf));
                    cp.angle = childAngleFraction * deltaTheta;
                    fraction += childAngleFraction;
                }
            }

            setPolarLocation(node, radius, angle) {
                node.X = this.origin.X + (radius * Math.cos(angle));
                node.Y = this.origin.Y + (radius * Math.sin(angle));
                node.BoundingRectangle = new Rect(node.X, node.Y, node.Width, node.Height);
            }

            /**
             * Sets the children direction recursively.
             * @param node
             * @param direction
             * @param includeStart
             */
            setChildrenDirection(node, direction, includeStart) {
                var rootDirection = node.treeDirection;
                this.graph.depthFirstTraversal(node, function (n) {
                    n.treeDirection = direction;
                });
                if (!includeStart) {
                    node.treeDirection = rootDirection;
                }
            }

            /**
             * Sets the children layout recursively.
             * @param node
             * @param layout
             * @param includeStart
             * @param startFromLevel
             */
            setChildrenLayout(node, layout, includeStart, startFromLevel?) {
                if (TypeViz.IsUndefined(startFromLevel)) {
                    startFromLevel = 0;
                }
                var rootLayout = node.childrenLayout;
                if (startFromLevel > 0) {
                    // assign levels to the Node.Level property
                    this.graph.assignLevels(node);

                    // assign the layout on the condition that the level is at least the 'startFromLevel'
                    this.graph.depthFirstTraversal(
                        node, function (s) {
                            if (s.level >= startFromLevel + 1) {
                                s.childrenLayout = layout;
                            }
                        }
                        );
                }
                else {
                    this.graph.depthFirstTraversal(node, function (s) {
                        s.childrenLayout = layout;
                    });

                    // if the start should not be affected we put the state back
                    if (!includeStart) {
                        node.childrenLayout = rootLayout;
                    }
                }
            }

            /**
             * Returns the actual size of the node. The given size is the allowed space wherein the node can lay out itself.
             * @param node
             * @param givenSize
             * @returns {Size}
             */
            measure(node, givenSize) {
                var w = 0, h = 0, s;
                var result = new Size(0, 0);
                if (!node) {
                    throw "";
                }
                var b = node.associatedShape.Rectangle;
                var shapeWidth = b.Width;
                var shapeHeight = b.Height;
                if (node.parents.length !== 1) {
                    throw "Node not in a spanning tree.";
                }

                var parent = node.parents[0];
                if (node.treeDirection === "Undefined") {
                    node.treeDirection = parent.treeDirection;
                }

                if (node.children.IsEmpty()) {
                    result = new Size(
                        Math.abs(shapeWidth) < TypeViz.Maths.Epsilon ? 50 : shapeWidth,
                        Math.abs(shapeHeight) < TypeViz.Maths.Epsilon ? 25 : shapeHeight);
                }
                else if (node.children.length === 1) {
                    switch (node.treeDirection) {
                        case "Radial":
                            s = this.measure(node.children[0], givenSize); // child size
                            w = shapeWidth + (this.options.RadialSeparation * Math.cos(node.AngleToParent)) + s.Width;
                            h = shapeHeight + Math.abs(this.options.RadialSeparation * Math.sin(node.AngleToParent)) + s.Height;
                            break;
                        case "Left":
                        case "Right":
                            switch (node.childrenLayout) {

                                case "TopAlignedWithParent":
                                    break;

                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    s = this.measure(node.children[0], givenSize);
                                    w = shapeWidth + s.Width + this.options.UnderneathHorizontalOffset;
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset + s.Height;
                                    break;

                                case "Default":
                                    s = this.measure(node.children[0], givenSize);
                                    w = shapeWidth + this.options.HorizontalSeparation + s.Width;
                                    h = Math.max(shapeHeight, s.Height);
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Radial layout measuring.";
                            }
                            break;
                        case "Up":
                        case "Down":
                            switch (node.childrenLayout) {

                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    s = this.measure(node.children[0], givenSize);
                                    w = Math.max(shapeWidth, s.Width + this.options.UnderneathHorizontalOffset);
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset + s.Height;
                                    break;

                                case "Default":
                                    s = this.measure(node.children[0], givenSize);
                                    h = shapeHeight + this.options.VerticalSeparation + s.Height;
                                    w = Math.max(shapeWidth, s.Width);
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Down layout measuring.";
                            }
                            break;
                        default:
                            throw "Unhandled TreeDirection in the layout measuring.";
                    }

                    result = new Size(w, h);
                }
                else {
                    var i, childNode;
                    switch (node.treeDirection) {
                        case "Left":
                        case "Right":
                            switch (node.childrenLayout) {

                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    w = shapeWidth;
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w = Math.max(w, s.Width + this.options.UnderneathHorizontalOffset);
                                        h += s.Height + this.options.UnderneathVerticalSeparation;
                                    }

                                    h -= this.options.UnderneathVerticalSeparation;
                                    break;

                                case "Default":
                                    w = shapeWidth;
                                    h = 0;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w = Math.max(w, shapeWidth + this.options.HorizontalSeparation + s.Width);
                                        h += s.Height + this.options.VerticalSeparation;
                                    }
                                    h -= this.options.VerticalSeparation;
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Right layout measuring.";
                            }

                            break;
                        case "Up":
                        case "Down":

                            switch (node.childrenLayout) {

                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    w = shapeWidth;
                                    h = shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w = Math.max(w, s.Width + this.options.UnderneathHorizontalOffset);
                                        h += s.Height + this.options.UnderneathVerticalSeparation;
                                    }

                                    h -= this.options.UnderneathVerticalSeparation;
                                    break;

                                case "Default":
                                    w = 0;
                                    h = 0;
                                    for (i = 0; i < node.children.length; i++) {
                                        childNode = node.children[i];
                                        s = this.measure(childNode, givenSize);
                                        w += s.Width + this.options.HorizontalSeparation;
                                        h = Math.max(h, s.Height + this.options.VerticalSeparation + shapeHeight);
                                    }

                                    w -= this.options.HorizontalSeparation;
                                    break;

                                default:
                                    throw "Unhandled TreeDirection in the Down layout measuring.";
                            }

                            break;
                        default:
                            throw "Unhandled TreeDirection in the layout measuring.";
                    }

                    result = new Size(w, h);
                }

                node.SectorAngle = Math.sqrt((w * w / 4) + (h * h / 4));
                node.Size = result;
                return result;
            }

            arrange(n, p) {
                var i, pp, child, node, childrenwidth, b = n.associatedShape.Rectangle;
                var shapeWidth = b.Width;
                var shapeHeight = b.Height;
                if (n.children.IsEmpty()) {
                    n.X = p.X;
                    n.Y = p.Y;
                    n.BoundingRectangle = new Rect(p.X, p.Y, shapeWidth, shapeHeight);
                }
                else {
                    var x, y;
                    var selfLocation;
                    switch (n.treeDirection) {
                        case "Left":
                            switch (n.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    selfLocation = p;
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                                    y = p.Y + shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < node.children.length; i++) {
                                        node = node.children[i];
                                        x = selfLocation.X - node.associatedShape.Width - this.options.UnderneathHorizontalOffset;
                                        pp = new Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.UnderneathVerticalSeparation;
                                    }
                                    break;

                                case "Default":
                                    selfLocation = new Point(p.X + n.Size.Width - shapeWidth, p.Y + ((n.Size.Height - shapeHeight) / 2));
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                                    x = selfLocation.X - this.options.HorizontalSeparation; // alignment of children
                                    y = p.Y;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new Point(x - node.Size.Width, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.VerticalSeparation;
                                    }
                                    break;

                                default:
                                    throw "Unsupported TreeDirection";
                            }

                            break;
                        case "Right":
                            switch (n.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;

                                case "Underneath":
                                    selfLocation = p;
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                                    x = p.X + shapeWidth + this.options.UnderneathHorizontalOffset;

                                    // alignment of children left-underneath the parent
                                    y = p.Y + shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.UnderneathVerticalSeparation;
                                    }

                                    break;

                                case "Default":
                                    selfLocation = new Point(p.X, p.Y + ((n.Size.Height - shapeHeight) / 2));
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                                    x = p.X + shapeWidth + this.options.HorizontalSeparation; // alignment of children
                                    y = p.Y;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.VerticalSeparation;
                                    }
                                    break;

                                default:
                                    throw "Unsupported TreeDirection";
                            }

                            break;
                        case "Up":
                            selfLocation = new Point(p.X + ((n.Size.Width - shapeWidth) / 2), p.Y + n.Size.Height - shapeHeight);
                            n.X = selfLocation.X;
                            n.Y = selfLocation.Y;
                            n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                            if (Math.abs(selfLocation.X - p.X) < TypeViz.Maths.Epsilon) {
                                childrenwidth = 0;
                                // means there is an aberration due to the oversized Element with respect to the children
                                for (i = 0; i < n.children.length; i++) {
                                    child = n.children[i];
                                    childrenwidth += child.Size.Width + this.options.HorizontalSeparation;
                                }
                                childrenwidth -= this.options.HorizontalSeparation;
                                x = p.X + ((shapeWidth - childrenwidth) / 2);
                            }
                            else {
                                x = p.X;
                            }

                            for (i = 0; i < n.children.length; i++) {
                                node = n.children[i];
                                y = selfLocation.Y - this.options.VerticalSeparation - node.Size.Height;
                                pp = new Point(x, y);
                                this.arrange(node, pp);
                                x += node.Size.Width + this.options.HorizontalSeparation;
                            }
                            break;

                        case "Down":

                            switch (n.childrenLayout) {
                                case "TopAlignedWithParent":
                                case "BottomAlignedWithParent":
                                    break;
                                case "Underneath":
                                    selfLocation = p;
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                                    x = p.X + this.options.UnderneathHorizontalOffset; // alignment of children left-underneath the parent
                                    y = p.Y + shapeHeight + this.options.UnderneathVerticalTopOffset;
                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        pp = new Point(x, y);
                                        this.arrange(node, pp);
                                        y += node.Size.Height + this.options.UnderneathVerticalSeparation;
                                    }
                                    break;

                                case "Default":
                                    selfLocation = new Point(p.X + ((n.Size.Width - shapeWidth) / 2), p.Y);
                                    n.X = selfLocation.X;
                                    n.Y = selfLocation.Y;
                                    n.BoundingRectangle = new Rect(n.X, n.Y, n.Width, n.Height);
                                    if (Math.abs(selfLocation.X - p.X) < TypeViz.Maths.Epsilon) {
                                        childrenwidth = 0;
                                        // means there is an aberration due to the oversized Element with respect to the children
                                        for (i = 0; i < n.children.length; i++) {
                                            child = n.children[i];
                                            childrenwidth += child.Size.Width + this.options.HorizontalSeparation;
                                        }

                                        childrenwidth -= this.options.HorizontalSeparation;
                                        x = p.X + ((shapeWidth - childrenwidth) / 2);
                                    }
                                    else {
                                        x = p.X;
                                    }

                                    for (i = 0; i < n.children.length; i++) {
                                        node = n.children[i];
                                        y = selfLocation.Y + this.options.VerticalSeparation + shapeHeight;
                                        pp = new Point(x, y);
                                        this.arrange(node, pp);
                                        x += node.Size.Width + this.options.HorizontalSeparation;
                                    }
                                    break;

                                default:
                                    throw "Unsupported TreeDirection";
                            }
                            break;

                        case "None":
                            break;

                        default:
                            throw "Unsupported TreeDirection";
                    }
                }
            }

            layoutSwitch() {
                if (!this.center) {
                    return;
                }

                if (this.center.children.IsEmpty()) {
                    return;
                }

                var type: TreeLayoutType = this.options.SubType;
                if (TypeViz.IsUndefined(type)) {
                    type = TreeLayoutType.TreeDown;
                }
                var single, male, female, leftcount;
                var children = this.center.children;
                switch (type) {
                    case TreeLayoutType.RadialTree:
                        this.layoutRadialTree();
                        break;

                    case TreeLayoutType.MindmapHorizontal:
                        single = this.center.children;

                        if (this.center.children.length === 1) {
                            this.layoutRight(single);
                        }
                        else {
                            // odd number will give one more at the right
                            leftcount = children.length / 2;
                            male = this.center.children.Where(function (n) {
                                return children.indexOf(n) < leftcount;
                            });
                            female = this.center.children.Where(function (n) {
                                return children.indexOf(n) >= leftcount;
                            });

                            this.layoutLeft(male);
                            this.layoutRight(female);
                        }
                        break;

                    case TreeLayoutType.MindmapVertical:
                        single = this.center.children;

                        if (this.center.children.length === 1) {
                            this.layoutDown(single);
                        }
                        else {
                            // odd number will give one more at the right
                            leftcount = children.length / 2;
                            male = this.center.children.Where(function (n) {
                                return children.indexOf(n) < leftcount;
                            });
                            female = this.center.children.Where(function (n) {
                                return children.indexOf(n) >= leftcount;
                            });
                            this.layoutUp(male);
                            this.layoutDown(female);
                        }
                        break;

                    case TreeLayoutType.TreeRight:
                        this.layoutRight(this.center.children);
                        break;

                    case TreeLayoutType.TreeLeft:
                        this.layoutLeft(this.center.children);
                        break;

                    case TreeLayoutType.TreeUp:
                        this.layoutUp(this.center.children);
                        break;

                    case TreeLayoutType.TreeDown:
                        this.layoutDown(this.center.children);
                        break;

                    case TreeLayoutType.TipOverTree:
                        if (this.options.TipOverTreeStartLevel < 0) {
                            throw "The tip-over level should be a positive integer.";
                        }
                        this.tipOverTree(this.center.children, this.options.TipOverTreeStartLevel);
                        break;

                    default:
                        break;
                }
            }
        }

        /* The various tree layout algorithms.*/
        export class TreeLayout extends LayoutBase {
            private graph;
            private diagram;
            constructor(diagram) {
                super();
                var that = this;
                if (TypeViz.IsUndefined(diagram)) {
                    throw "No diagram specified.";
                }
                this.diagram = diagram;
            }

            /**
             * Arranges the diagram in a tree-layout with the specified options and tree subtype.
             */
            Layout(options: LayoutSettings) {

                //this.transferOptions(options);
                this.options = options;
                // transform the diagram into a Graph
                var adapter = new DiagramToHyperTreeAdapter(this.diagram);

                /**
                 * The Graph reduction from the given diagram.
                 * @type {*}
                 */
                this.graph = adapter.convert();

                var finalNodeSet = this.layoutComponents();

                // note that the graph Contains the original data and
                // the components are another instance of nodes referring to the same set of shapes
                return new LayoutState(this.diagram, finalNodeSet);
            }

            layoutComponents() {
                if (this.graph.IsEmpty) {
                    return;
                }

                // split into connected components
                var components = this.graph.getConnectedComponents();
                if (components.IsEmpty()) {
                    return;
                }

                var layout = new TreeLayoutProcessor(this.options);
                var trees = [];
                // find a spanning tree for each component
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];

                    var treeGraph = this.getTree(component);
                    if (!treeGraph) {
                        throw "Failed to find a spanning tree for the component.";
                    }
                    var root = treeGraph.root;
                    var tree = treeGraph.tree;
                    layout.Layout(tree, root);

                    trees.push(tree);
                }

                return this.gridLayoutComponents(trees);

            }

            /**
             * Gets a spanning tree (and root) for the given graph.
             * Ensure that the given graph is connected!
             * @param graph
             * @returns {*} A literal object consisting of the found root and the spanning tree.
             */
            getTree(graph) {
                var root = null;
                if (this.options.Roots && this.options.Roots.length > 0) {
                    for (var i = 0, len = graph.nodes.length; i < len; i++) {
                        var node = graph.nodes[i];
                        for (var j = 0; j < this.options.Roots.length; j++) {
                            var givenRootShape = this.options.Roots[j];
                            if (givenRootShape === node.associatedShape) {
                                root = node;
                                break;
                            }
                        }
                    }
                }
                if (!root) {
                    // finds the most probable root on the basis of the longest path in the component
                    root = graph.root;
                    // should not happen really
                    if (!root) {
                        throw "Unable to find a root for the tree.";
                    }
                }
                return this.getTreeForRoot(graph, root);
            }

            getTreeForRoot(graph, root) {

                var tree = graph.getSpanningTree(root);
                if (TypeViz.IsUndefined(tree) || tree.IsEmpty) {
                    return null;
                }
                return {
                    tree: tree,
                    root: tree.root
                };
            }

        }

        /* The Sugiyama aka layered layout algorithm.*/
        export class LayeredLayout extends LayoutBase {
            private graph: TypeViz.Diagramming.Graph;
            private diagram;
            private layers;
            private linkToNodeMap;
            private nodeToLinkMap;
            private upNodes;
            private downNodes;
            private minDistances;

            constructor(diagram) {
                super();
                var that = this;
                if (TypeViz.IsUndefined(diagram)) {
                    throw "Diagram is not specified.";
                }
                this.diagram = diagram;
            }

            Layout(options) {

                this.options = options;

                var adapter = new DiagramToHyperTreeAdapter(this.diagram);
                var graph = adapter.convert(options);
                if (graph.IsEmpty) {
                    return;
                }
                // split into connected components
                var components = graph.getConnectedComponents();
                if (components.IsEmpty()) {
                    return;
                }
                for (var i = 0; i < components.length; i++) {
                    var component = components[i];
                    this.layoutGraph(component, options);
                }
                var finalNodeSet = this.gridLayoutComponents(components);
                return new LayoutState(this.diagram, finalNodeSet);

            }

            /**
             * Initializes the runtime data properties of the layout.
             * @private
             */
            _initRuntimeProperties() {
                for (var k = 0; k < this.graph.nodes.length; k++) {
                    var node = this.graph.nodes[k];
                    node.layer = -1;
                    node.downstreamLinkCount = 0;
                    node.upstreamLinkCount = 0;

                    node.isVirtual = false;

                    node.uBaryCenter = 0.0;
                    node.dBaryCenter = 0.0;

                    node.upstreamPriority = 0;
                    node.downstreamPriority = 0;

                    node.gridPosition = 0;
                }
            }

            _prepare(graph, options?) {
                var current = [], i, l, link;
                for (l = 0; l < graph.links.length; l++) {
                    // of many dummies have been inserted to make things work
                    graph.links[l].depthOfDumminess = 0;
                }

                // defines a mapping of a node to the layer index
                var layerMap = new Map();

                graph.nodes.ForEach(function (node) {
                    if (node.incoming.length === 0) {
                        layerMap.Set(node, 0);
                        current.push(node);
                    }
                });

                while (current.length > 0) {
                    var next = current.shift();
                    for (i = 0; i < next.outgoing.length; i++) {
                        link = next.outgoing[i];
                        var target = link.target;

                        if (layerMap.ContainsKey(target)) {
                            layerMap.Set(target, Math.max(layerMap.Get(next) + 1, layerMap.Get(target)));
                        } else {
                            layerMap.Set(target, layerMap.Get(next) + 1);
                        }

                        if (!current.Contains(target)) {
                            current.push(target);
                        }
                    }
                }

                // the node count in the map defines how many layers w'll need
                var layerCount = 0;
                layerMap.forEachValue(function (nodecount) {
                    layerCount = Math.max(layerCount, nodecount);
                });

                var sortedNodes = [];
                sortedNodes.AddRange(layerMap.keys());
                sortedNodes.sort(function (o1, o2) {
                    var o1layer = layerMap.Get(o1);
                    var o2layer = layerMap.Get(o2);
                    return TypeViz.Maths.Sign(o2layer - o1layer);
                });

                for (var n = 0; n < sortedNodes.length; ++n) {
                    var node = sortedNodes[n];
                    var minLayer = Number.MAX_VALUE;

                    if (node.outgoing.length === 0) {
                        continue;
                    }

                    for (l = 0; l < node.outgoing.length; ++l) {
                        link = node.outgoing[l];
                        minLayer = Math.min(minLayer, layerMap.Get(link.target));
                    }

                    if (minLayer > 1) {
                        layerMap.Set(node, minLayer - 1);
                    }
                }

                this.layers = [];
                for (i = 0; i < layerCount + 1; i++) {
                    this.layers.push([]);
                }

                layerMap.ForEach(function (node, layer) {
                    node.layer = layer;
                    this.layers[layer].push(node);
                }, this);

                // set initial grid positions
                for (l = 0; l < this.layers.length; l++) {
                    var layer = this.layers[l];
                    for (i = 0; i < layer.length; i++) {
                        layer[i].gridPosition = i;
                    }
                }
            }

            /**
             * Performs the layout of a single component.
             */
            layoutGraph(graph, options) {
                if (TypeViz.IsUndefined(graph)) {
                    throw "No graph given or graph analysis of the diagram failed.";
                }
                this.options = options;
                this.graph = graph;

                // sets unique indices on the nodes
                graph.setItemIndices();

                // ensures no cycles present for this layout
                var reversedEdges = graph.makeAcyclic();

                // define the runtime props being used by the layout algorithm
                this._initRuntimeProperties();

                this._prepare(graph, options);

                this._dummify();

                this._optimizeCrossings();

                this._swapPairs();

                this.arrangeNodes();

                this._moveThingsAround();

                this._dedummify();

                // re-reverse the links which were switched earlier
                reversedEdges.ForEach(function (e) {
                    if (e.points) {
                        e.points.reverse();
                    }
                });
            }

            setMinDist(m, n, minDist) {
                var l = m.layer;
                var i = m.layerIndex;
                this.minDistances[l][i] = minDist;
            }

            getMinDist(m, n) {
                var dist = 0,
                    i1 = m.layerIndex,
                    i2 = n.layerIndex,
                    l = m.layer,
                    min = Math.min(i1, i2),
                    max = Math.max(i1, i2);
                // use Sum()?
                for (var k = min; k < max; ++k) {
                    dist += this.minDistances[l][k];
                }
                return dist;
            }
            private nodeLeftClass;
            placeLeftToRight(leftClasses) {
                var leftPos = new Map(), n, node;
                for (var c = 0; c < this.layers.length; ++c) {
                    var classNodes = leftClasses[c];
                    if (!classNodes) {
                        continue;
                    }

                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        if (!leftPos.ContainsKey(node)) {
                            this.placeLeft(node, leftPos, c);
                        }
                    }

                    // adjust class
                    var d = Number.POSITIVE_INFINITY;
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        var rightSibling = this.rightSibling(node);
                        if (rightSibling && this.nodeLeftClass.Get(rightSibling) !== c) {
                            d = Math.min(d, leftPos.Get(rightSibling) - leftPos.Get(node) - this.getMinDist(node, rightSibling));
                        }
                    }
                    if (d === Number.POSITIVE_INFINITY) {
                        var D = [];
                        for (n = 0; n < classNodes.length; n++) {
                            node = classNodes[n];
                            var neighbors = [];
                            neighbors.AddRange(this.upNodes.Get(node));
                            neighbors.AddRange(this.downNodes.Get(node));

                            for (var e = 0; e < neighbors.length; e++) {
                                var neighbor = neighbors[e];
                                if (this.nodeLeftClass.Get(neighbor) < c) {
                                    D.push(leftPos.Get(neighbor) - leftPos.Get(node));
                                }
                            }
                        }
                        D.sort();
                        if (D.length === 0) {
                            d = 0;
                        }
                        else if (D.length % 2 === 1) {
                            d = D[this.intDiv(D.length, 2)];
                        }
                        else {
                            d = (D[this.intDiv(D.length, 2) - 1] + D[this.intDiv(D.length, 2)]) / 2;
                        }
                    }
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        leftPos.Set(node, leftPos.Get(node) + d);
                    }
                }
                return leftPos;
            }
            private nodeRightClass;

            placeRightToLeft(rightClasses) {
                var rightPos = new Map(), n, node;
                for (var c = 0; c < this.layers.length; ++c) {
                    var classNodes = rightClasses[c];
                    if (!classNodes) {
                        continue;
                    }

                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        if (!rightPos.ContainsKey(node)) {
                            this.placeRight(node, rightPos, c);
                        }
                    }

                    // adjust class
                    var d = Number.NEGATIVE_INFINITY;
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        var leftSibling = this.leftSibling(node);
                        if (leftSibling && this.nodeRightClass.Get(leftSibling) !== c) {
                            d = Math.max(d, rightPos.Get(leftSibling) - rightPos.Get(node) + this.getMinDist(leftSibling, node));
                        }
                    }
                    if (d === Number.NEGATIVE_INFINITY) {
                        var D = [];
                        for (n = 0; n < classNodes.length; n++) {
                            node = classNodes[n];
                            var neighbors = [];
                            neighbors.AddRange(this.upNodes.Get(node));
                            neighbors.AddRange(this.downNodes.Get(node));

                            for (var e = 0; e < neighbors.length; e++) {
                                var neighbor = neighbors[e];
                                if (this.nodeRightClass.Get(neighbor) < c) {
                                    D.push(rightPos.Get(node) - rightPos.Get(neighbor));
                                }
                            }
                        }
                        D.sort();
                        if (D.length === 0) {
                            d = 0;
                        }
                        else if (D.length % 2 === 1) {
                            d = D[this.intDiv(D.length, 2)];
                        }
                        else {
                            d = (D[this.intDiv(D.length, 2) - 1] + D[this.intDiv(D.length, 2)]) / 2;
                        }
                    }
                    for (n = 0; n < classNodes.length; n++) {
                        node = classNodes[n];
                        rightPos.Set(node, rightPos.Get(node) + d);
                    }
                }
                return rightPos;
            }

            _getLeftWing() {
                var leftWing = { value: null };
                var result = this.computeClasses(leftWing, 1);
                this.nodeLeftClass = leftWing.value;
                return result;
            }

            _getRightWing() {
                var rightWing = { value: null };
                var result = this.computeClasses(rightWing, -1);
                this.nodeRightClass = rightWing.value;
                return result;
            }

            computeClasses(wingPair, d) {
                var currentWing = 0,
                    wing = wingPair.value = new Map();

                for (var l = 0; l < this.layers.length; ++l) {
                    currentWing = l;

                    var layer = this.layers[l];
                    for (var n = d === 1 ? 0 : layer.length - 1; 0 <= n && n < layer.length; n += d) {
                        var node = layer[n];
                        if (!wing.ContainsKey(node)) {
                            wing.Set(node, currentWing);
                            if (node.isVirtual) {
                                var ndsinl = this._nodesInLink(node);
                                for (var kk = 0; kk < ndsinl.length; kk++) {
                                    var vnode = ndsinl[kk];
                                    wing.Set(vnode, currentWing);
                                }
                            }
                        }
                        else {
                            currentWing = wing.Get(node);
                        }
                    }
                }

                var wings = [];
                for (var i = 0; i < this.layers.length; i++) {
                    wings.push(null);
                }
                wing.ForEach(function (node, classIndex) {
                    if (wings[classIndex] === null) {
                        wings[classIndex] = [];
                    }
                    wings[classIndex].push(node);
                });

                return wings;
            }

            _isVerticalLayout() {
                return this.options.SubType === LayeredLayoutType.Up || this.options.SubType === LayeredLayoutType.Down;
            }

            _isHorizontalLayout() {
                return this.options.SubType === LayeredLayoutType.Left || this.options.SubType === LayeredLayoutType.Right;
            }

            _isIncreasingLayout() {
                // meaning that the visiting of the layers goes in the natural order of increasing layer index
                return this.options.SubType === LayeredLayoutType.Right || this.options.SubType === LayeredLayoutType.Down;
            }

            _moveThingsAround() {
                var i, l, node, layer, n, w;
                // sort the layers by their grid position
                for (l = 0; l < this.layers.length; ++l) {
                    layer = this.layers[l];
                    layer.sort(this._gridPositionComparer);
                }

                this.minDistances = [];
                for (l = 0; l < this.layers.length; ++l) {
                    layer = this.layers[l];
                    this.minDistances[l] = [];
                    for (n = 0; n < layer.length; ++n) {
                        node = layer[n];
                        node.layerIndex = n;
                        this.minDistances[l][n] = this.options.NodeDistance;
                        if (n < layer.length - 1) {
                            if (this._isVerticalLayout()) {
                                this.minDistances[l][n] += (node.Width + layer[n + 1].Width) / 2;
                            }
                            else {
                                this.minDistances[l][n] += (node.Height + layer[n + 1].Height) / 2;
                            }
                        }
                    }
                }

                this.downNodes = new Map();
                this.upNodes = new Map();
                this.graph.nodes.ForEach(function (node) {
                    this.downNodes.Set(node, []);
                    this.upNodes.Set(node, []);
                }, this);
                this.graph.links.ForEach(function (link) {
                    var origin = link.source;
                    var dest = link.target;
                    var down = null, up = null;
                    if (origin.layer > dest.layer) {
                        down = link.source;
                        up = link.target;
                    }
                    else {
                        up = link.source;
                        down = link.target;
                    }
                    this.downNodes.Get(up).push(down);
                    this.upNodes.Get(down).push(up);
                }, this);
                this.downNodes.forEachValue(function (list) {
                    list.sort(this._gridPositionComparer);
                });
                this.upNodes.forEachValue(function (list) {
                    list.sort(this._gridPositionComparer);
                });

                for (l = 0; l < this.layers.length - 1; ++l) {
                    layer = this.layers[l];
                    for (w = 0; w < layer.length - 1; w++) {
                        var currentNode = layer[w];
                        if (!currentNode.isVirtual) {
                            continue;
                        }

                        var currDown = this.downNodes.Get(currentNode)[0];
                        if (!currDown.isVirtual) {
                            continue;
                        }

                        for (n = w + 1; n < layer.length; ++n) {
                            node = layer[n];
                            if (!node.isVirtual) {
                                continue;
                            }

                            var downNode = this.downNodes.Get(node)[0];
                            if (!downNode.isVirtual) {
                                continue;
                            }

                            if (currDown.gridPosition > downNode.gridPosition) {
                                var pos = currDown.gridPosition;
                                currDown.gridPosition = downNode.gridPosition;
                                downNode.gridPosition = pos;
                                var i1 = currDown.layerIndex;
                                var i2 = downNode.layerIndex;
                                this.layers[l + 1][i1] = downNode;
                                this.layers[l + 1][i2] = currDown;
                                currDown.layerIndex = i2;
                                downNode.layerIndex = i1;
                            }
                        }
                    }
                }


                var leftClasses = this._getLeftWing();
                var rightClasses = this._getRightWing();


                var leftPos = this.placeLeftToRight(leftClasses);
                var rightPos = this.placeRightToLeft(rightClasses);
                var x = new Map();
                this.graph.nodes.ForEach(function (node) {
                    x.Set(node, (leftPos.Get(node) + rightPos.Get(node)) / 2);
                });


                var order = new Map();
                var placed = new Map();
                for (l = 0; l < this.layers.length; ++l) {
                    layer = this.layers[l];
                    var sequenceStart = -1, sequenceEnd = -1;
                    for (n = 0; n < layer.length; ++n) {
                        node = layer[n];
                        order.Set(node, 0);
                        placed.Set(node, false);
                        if (node.isVirtual) {
                            if (sequenceStart === -1) {
                                sequenceStart = n;
                            }
                            else if (sequenceStart === n - 1) {
                                sequenceStart = n;
                            }
                            else {
                                sequenceEnd = n;
                                order.Set(layer[sequenceStart], 0);
                                if (x.Get(node) - x.Get(layer[sequenceStart]) === this.getMinDist(layer[sequenceStart], node)) {
                                    placed.Set(layer[sequenceStart], true);
                                }
                                else {
                                    placed.Set(layer[sequenceStart], false);
                                }
                                sequenceStart = n;
                            }
                        }
                    }
                }
                var directions = [1, -1];
                directions.ForEach(function (d) {
                    var start = d === 1 ? 0 : this.layers.length - 1;
                    for (var l = start; 0 <= l && l < this.layers.length; l += d) {
                        var layer = this.layers[l];
                        var virtualStartIndex = this._firstVirtualNode(layer);
                        var virtualStart = null;
                        var sequence = null;
                        if (virtualStartIndex !== -1) {
                            virtualStart = layer[virtualStartIndex];
                            sequence = [];
                            for (i = 0; i < virtualStartIndex; i++) {
                                sequence.push(layer[i]);
                            }
                        }
                        else {
                            virtualStart = null;
                            sequence = layer;
                        }
                        if (sequence.length > 0) {
                            this._sequencer(x, null, virtualStart, d, sequence);
                            for (i = 0; i < sequence.length - 1; ++i) {
                                this.setMinDist(sequence[i], sequence[i + 1], x.Get(sequence[i + 1]) - x.Get(sequence[i]));
                            }
                            if (virtualStart) {
                                this.setMinDist(sequence[sequence.length - 1], virtualStart, x.Get(virtualStart) - x.Get(sequence[sequence.length - 1]));
                            }
                        }

                        while (virtualStart) {
                            var virtualEnd = this.nextVirtualNode(layer, virtualStart);
                            if (!virtualEnd) {
                                virtualStartIndex = virtualStart.layerIndex;
                                sequence = [];
                                for (i = virtualStartIndex + 1; i < layer.length; i++) {
                                    sequence.push(layer[i]);
                                }
                                if (sequence.length > 0) {
                                    this._sequencer(x, virtualStart, null, d, sequence);
                                    for (i = 0; i < sequence.length - 1; ++i) {
                                        this.setMinDist(sequence[i], sequence[i + 1], x.Get(sequence[i + 1]) - x.Get(sequence[i]));
                                    }
                                    this.setMinDist(virtualStart, sequence[0], x.Get(sequence[0]) - x.Get(virtualStart));
                                }
                            }
                            else if (order.Get(virtualStart) === d) {
                                virtualStartIndex = virtualStart.layerIndex;
                                var virtualEndIndex = virtualEnd.layerIndex;
                                sequence = [];
                                for (i = virtualStartIndex + 1; i < virtualEndIndex; i++) {
                                    sequence.push(layer[i]);
                                }
                                if (sequence.length > 0) {
                                    this._sequencer(x, virtualStart, virtualEnd, d, sequence);
                                }
                                placed.Set(virtualStart, true);
                            }
                            virtualStart = virtualEnd;
                        }
                        this.adjustDirections(l, d, order, placed);
                    }
                }, this);


                var fromLayerIndex = this._isIncreasingLayout() ? 0 : this.layers.length - 1;
                var reachedFinalLayerIndex = function (k, ctx) {
                    if (ctx._isIncreasingLayout()) {
                        return k < ctx.layers.length;
                    }
                    else {
                        return k >= 0;
                    }
                };
                var layerIncrement = this._isIncreasingLayout() ? +1 : -1, offset = 0;

                /**
                 * Calcs the max height of the given layer.
                 */
                function maximumHeight(layer, ctx) {
                    var height = Number.MIN_VALUE;
                    for (var n = 0; n < layer.length; ++n) {
                        var node = layer[n];
                        if (ctx._isVerticalLayout()) {
                            height = Math.max(height, node.Height);
                        }
                        else {
                            height = Math.max(height, node.Width);
                        }
                    }
                    return height;
                }

                for (i = fromLayerIndex; reachedFinalLayerIndex(i, this); i += layerIncrement) {
                    layer = this.layers[i];
                    var height = maximumHeight(layer, this);

                    for (n = 0; n < layer.length; ++n) {
                        node = layer[n];
                        if (this._isVerticalLayout()) {
                            node.X = x.Get(node);
                            node.Y = offset + height / 2;
                        }
                        else {
                            node.X = offset + height / 2;
                            node.Y = x.Get(node);
                        }
                    }

                    offset += this.options.LayerSeparation + height;
                }
            }

            adjustDirections(l, d, order, placed) {
                if (l + d < 0 || l + d >= this.layers.length) {
                    return;
                }

                var prevBridge = null, prevBridgeTarget = null;
                var layer = this.layers[l + d];
                for (var n = 0; n < layer.length; ++n) {
                    var nextBridge = layer[n];
                    if (nextBridge.isVirtual) {
                        var nextBridgeTarget = this.getNeighborOnLayer(nextBridge, l);
                        if (nextBridgeTarget.isVirtual) {
                            if (prevBridge) {
                                var p = placed.Get(prevBridgeTarget);
                                var clayer = this.layers[l];
                                var i1 = prevBridgeTarget.layerIndex;
                                var i2 = nextBridgeTarget.layerIndex;
                                for (var i = i1 + 1; i < i2; ++i) {
                                    if (clayer[i].isVirtual) {
                                        p = p && placed.Get(clayer[i]);
                                    }
                                }
                                if (p) {
                                    order.Set(prevBridge, d);
                                    var j1 = prevBridge.layerIndex;
                                    var j2 = nextBridge.layerIndex;
                                    for (var j = j1 + 1; j < j2; ++j) {
                                        if (layer[j].isVirtual) {
                                            order.Set(layer[j], d);
                                        }
                                    }
                                }
                            }
                            prevBridge = nextBridge;
                            prevBridgeTarget = nextBridgeTarget;
                        }
                    }
                }
            }

            getNeighborOnLayer(node, l) {
                var neighbor = this.upNodes.Get(node)[0];
                if (neighbor.layer === l) {
                    return neighbor;
                }
                neighbor = this.downNodes.Get(node)[0];
                if (neighbor.layer === l) {
                    return neighbor;
                }
                return null;
            }

            _sequencer(x, virtualStart, virtualEnd, dir, sequence) {
                if (sequence.length === 1) {
                    this._sequenceSingle(x, virtualStart, virtualEnd, dir, sequence[0]);
                }

                if (sequence.length > 1) {
                    var r = sequence.length, t = this.intDiv(r, 2);
                    this._sequencer(x, virtualStart, virtualEnd, dir, sequence.slice(0, t));
                    this._sequencer(x, virtualStart, virtualEnd, dir, sequence.slice(t));
                    this.combineSequences(x, virtualStart, virtualEnd, dir, sequence);
                }
            }

            _sequenceSingle(x, virtualStart, virtualEnd, dir, node) {
                var neighbors = dir === -1 ? this.downNodes.Get(node) : this.upNodes.Get(node);

                var n = neighbors.length;
                if (n !== 0) {
                    if (n % 2 === 1) {
                        x.Set(node, x.Get(neighbors[this.intDiv(n, 2)]));
                    }
                    else {
                        x.Set(node, (x.Get(neighbors[this.intDiv(n, 2) - 1]) + x.Get(neighbors[this.intDiv(n, 2)])) / 2);
                    }

                    if (virtualStart) {
                        x.Set(node, Math.max(x.Get(node), x.Get(virtualStart) + this.getMinDist(virtualStart, node)));
                    }
                    if (virtualEnd) {
                        x.Set(node, Math.min(x.Get(node), x.Get(virtualEnd) - this.getMinDist(node, virtualEnd)));
                    }
                }
            }

            combineSequences(x, virtualStart, virtualEnd, dir, sequence) {
                var r = sequence.length, t = this.intDiv(r, 2);

                // collect left changes
                var leftHeap = [], i, c, n, neighbors, neighbor, pair;
                for (i = 0; i < t; ++i) {
                    c = 0;
                    neighbors = dir === -1 ? this.downNodes.Get(sequence[i]) : this.upNodes.Get(sequence[i]);
                    for (n = 0; n < neighbors.length; ++n) {
                        neighbor = neighbors[n];
                        if (x.Get(neighbor) >= x.Get(sequence[i])) {
                            c++;
                        }
                        else {
                            c--;
                            leftHeap.push({ k: x.Get(neighbor) + this.getMinDist(sequence[i], sequence[t - 1]), v: 2 });
                        }
                    }
                    leftHeap.push({ k: x.Get(sequence[i]) + this.getMinDist(sequence[i], sequence[t - 1]), v: c });
                }
                if (virtualStart) {
                    leftHeap.push({ k: x.Get(virtualStart) + this.getMinDist(virtualStart, sequence[t - 1]), v: Number.MAX_VALUE });
                }
                leftHeap.sort(this._positionDescendingComparer);

                // collect right changes
                var rightHeap = [];
                for (i = t; i < r; ++i) {
                    c = 0;
                    neighbors = dir === -1 ? this.downNodes.Get(sequence[i]) : this.upNodes.Get(sequence[i]);
                    for (n = 0; n < neighbors.length; ++n) {
                        neighbor = neighbors[n];
                        if (x.Get(neighbor) <= x.Get(sequence[i])) {
                            c++;
                        }
                        else {
                            c--;
                            rightHeap.push({ k: x.Get(neighbor) - this.getMinDist(sequence[i], sequence[t]), v: 2 });
                        }
                    }
                    rightHeap.push({ k: x.Get(sequence[i]) - this.getMinDist(sequence[i], sequence[t]), v: c });
                }
                if (virtualEnd) {
                    rightHeap.push({ k: x.Get(virtualEnd) - this.getMinDist(virtualEnd, sequence[t]), v: Number.MAX_VALUE });
                }
                rightHeap.sort(this._positionAscendingComparer);

                var leftRes = 0, rightRes = 0;
                var m = this.getMinDist(sequence[t - 1], sequence[t]);
                while (x.Get(sequence[t]) - x.Get(sequence[t - 1]) < m) {
                    if (leftRes < rightRes) {
                        if (leftHeap.length === 0) {
                            x.Set(sequence[t - 1], x.Get(sequence[t]) - m);
                            break;
                        }
                        else {
                            pair = leftHeap.shift();
                            leftRes = leftRes + pair.v;
                            x.Set(sequence[t - 1], pair.k);
                            x.Set(sequence[t - 1], Math.max(x.Get(sequence[t - 1]), x.Get(sequence[t]) - m));
                        }
                    }
                    else {
                        if (rightHeap.length === 0) {
                            x.Set(sequence[t], x.Get(sequence[t - 1]) + m);
                            break;
                        }
                        else {
                            pair = rightHeap.shift();
                            rightRes = rightRes + pair.v;
                            x.Set(sequence[t], pair.k);
                            x.Set(sequence[t], Math.min(x.Get(sequence[t]), x.Get(sequence[t - 1]) + m));
                        }
                    }
                }
                for (i = t - 2; i >= 0; i--) {
                    x.Set(sequence[i], Math.min(x.Get(sequence[i]), x.Get(sequence[t - 1]) - this.getMinDist(sequence[i], sequence[t - 1])));
                }
                for (i = t + 1; i < r; i++) {
                    x.Set(sequence[i], Math.max(x.Get(sequence[i]), x.Get(sequence[t]) + this.getMinDist(sequence[i], sequence[t])));
                }
            }

            placeLeft(node, leftPos, leftClass) {
                var pos = Number.NEGATIVE_INFINITY;
                this._getComposite(node).ForEach(function (v) {
                    var leftSibling = this.leftSibling(v);
                    if (leftSibling && this.nodeLeftClass.Get(leftSibling) === this.nodeLeftClass.Get(v)) {
                        if (!leftPos.ContainsKey(leftSibling)) {
                            this.placeLeft(leftSibling, leftPos, leftClass);
                        }
                        pos = Math.max(pos, leftPos.Get(leftSibling) + this.getMinDist(leftSibling, v));
                    }
                }, this);
                if (pos === Number.NEGATIVE_INFINITY) {
                    pos = 0;
                }
                this._getComposite(node).ForEach(function (v) {
                    leftPos.Set(v, pos);
                });
            }

            placeRight(node, rightPos, rightClass) {
                var pos = Number.POSITIVE_INFINITY;
                this._getComposite(node).ForEach(function (v) {
                    var rightSibling = this.rightSibling(v);
                    if (rightSibling && this.nodeRightClass.Get(rightSibling) === this.nodeRightClass.Get(v)) {
                        if (!rightPos.ContainsKey(rightSibling)) {
                            this.placeRight(rightSibling, rightPos, rightClass);
                        }
                        pos = Math.min(pos, rightPos.Get(rightSibling) - this.getMinDist(v, rightSibling));
                    }
                }, this);
                if (pos === Number.POSITIVE_INFINITY) {
                    pos = 0;
                }
                this._getComposite(node).ForEach(function (v) {
                    rightPos.Set(v, pos);
                });
            }

            leftSibling(node) {
                var layer = this.layers[node.layer],
                    layerIndex = node.layerIndex;
                return layerIndex === 0 ? null : layer[layerIndex - 1];
            }

            rightSibling(node) {
                var layer = this.layers[node.layer];
                var layerIndex = node.layerIndex;
                return layerIndex === layer.length - 1 ? null : layer[layerIndex + 1];

            }

            _getComposite(node) {
                return node.isVirtual ? this._nodesInLink(node) : [node];
            }

            arrangeNodes() {
                var i, l, ni, layer, node;
                // Initialize node's base priority
                for (l = 0; l < this.layers.length; l++) {
                    layer = this.layers[l];

                    for (ni = 0; ni < layer.length; ni++) {
                        node = layer[ni];
                        node.upstreamPriority = node.upstreamLinkCount;
                        node.downstreamPriority = node.downstreamLinkCount;
                    }
                }

                // Layout is invoked after MinimizeCrossings
                // so we may assume node's barycenters are initially correct

                var maxLayoutIterations = 2;
                for (var it = 0; it < maxLayoutIterations; it++) {
                    for (i = this.layers.length - 1; i >= 1; i--) {
                        this.layoutLayer(false, i);
                    }

                    for (i = 0; i < this.layers.length - 1; i++) {
                        this.layoutLayer(true, i);
                    }
                }

                // Offset the whole structure so that there are no gridPositions < 0
                var gridPos = Number.MAX_VALUE;
                for (l = 0; l < this.layers.length; l++) {
                    layer = this.layers[l];

                    for (ni = 0; ni < layer.length; ni++) {
                        node = layer[ni];
                        gridPos = Math.min(gridPos, node.gridPosition);
                    }
                }

                if (gridPos < 0) {
                    for (l = 0; l < this.layers.length; l++) {
                        layer = this.layers[l];

                        for (ni = 0; ni < layer.length; ni++) {
                            node = layer[ni];
                            node.gridPosition = node.gridPosition - gridPos;
                        }
                    }
                }
            }

            /// <summary>
            /// Layout of a single layer.
            /// </summary>
            /// <param name="layerIndex">The layer to organize.</param>
            /// <param name="movingDownwards">If set to <c>true</c> we move down in the layer stack.</param>
            /// <seealso cref="OptimizeCrossings()"/>
            layoutLayer(down, layer) {
                var iconsidered;
                var considered;

                if (down) {
                    considered = this.layers[iconsidered = layer + 1];
                }
                else {
                    considered = this.layers[iconsidered = layer - 1];
                }

                // list containing the nodes in the considered layer sorted by priority
                var sorted = [];
                for (var n = 0; n < considered.length; n++) {
                    sorted.push(considered[n]);
                }
                sorted.sort(function (n1, n2) {
                    var n1Priority = (n1.upstreamPriority + n1.downstreamPriority) / 2;
                    var n2Priority = (n2.upstreamPriority + n2.downstreamPriority) / 2;

                    if (Math.abs(n1Priority - n2Priority) < 0.0001) {
                        return 0;
                    }
                    if (n1Priority < n2Priority) {
                        return 1;
                    }
                    return -1;
                });

                // each node strives for its barycenter; high priority nodes start first
                sorted.ForEach(function (node) {
                    var nodeGridPos = node.gridPosition;
                    var nodeBaryCenter = this.calcBaryCenter(node);
                    var nodePriority = (node.upstreamPriority + node.downstreamPriority) / 2;

                    if (Math.abs(nodeGridPos - nodeBaryCenter) < 0.0001) {
                        // This node is exactly at its barycenter -> perfect
                        return;
                    }

                    if (Math.abs(nodeGridPos - nodeBaryCenter) < 0.25 + 0.0001) {
                        // This node is close enough to the barycenter -> should work
                        return;
                    }

                    if (nodeGridPos < nodeBaryCenter) {
                        // Try to move the node to the right in an
                        // attempt to reach its barycenter
                        while (nodeGridPos < nodeBaryCenter) {
                            if (!this.moveRight(node, considered, nodePriority)) {
                                break;
                            }

                            nodeGridPos = node.gridPosition;
                        }
                    }
                    else {
                        // Try to move the node to the left in an
                        // attempt to reach its barycenter
                        while (nodeGridPos > nodeBaryCenter) {
                            if (!this.moveLeft(node, considered, nodePriority)) {
                                break;
                            }

                            nodeGridPos = node.gridPosition;
                        }
                    }
                }, this);

                // after the layer has been rearranged we need to recalculate the barycenters
                // of the nodes in the surrounding layers
                if (iconsidered > 0) {
                    this.calcDownData(iconsidered - 1);
                }
                if (iconsidered < this.layers.length - 1) {
                    this.calcUpData(iconsidered + 1);
                }
            }

            /// <summary>
            /// Moves the node to the right and returns <c>true</c> if this was possible.
            /// </summary>
            /// <param name="node">The node.</param>
            /// <param name="layer">The layer.</param>
            /// <returns>Returns <c>true</c> if the shift was possible, otherwise <c>false</c>.</returns>
            moveRight(node, layer, priority) {
                var index = layer.indexOf(node);
                if (index === layer.length - 1) {
                    // this is the last node in the layer, so we can move to the right without troubles
                    node.gridPosition = node.gridPosition + 0.5;
                    return true;
                }

                var rightNode = layer[index + 1];
                var rightNodePriority = (rightNode.upstreamPriority + rightNode.downstreamPriority) / 2;

                // check if there is space between the right and the current node
                if (rightNode.gridPosition > node.gridPosition + 1) {
                    node.gridPosition = node.gridPosition + 0.5;
                    return true;
                }

                // we have reached a node with higher priority; no movement is allowed
                if (rightNodePriority > priority ||
                    Math.abs(rightNodePriority - priority) < 0.0001) {
                    return false;
                }

                // the right node has lower priority - try to move it
                if (this.moveRight(rightNode, layer, priority)) {
                    node.gridPosition = node.gridPosition + 0.5;
                    return true;
                }

                return false;
            }

            /// <summary>
            /// Moves the node to the left and returns <c>true</c> if this was possible.
            /// </summary>
            /// <param name="node">The node.</param>
            /// <param name="layer">The layer.</param>
            /// <returns>Returns <c>true</c> if the shift was possible, otherwise <c>false</c>.</returns>
            moveLeft(node, layer, priority) {
                var index = layer.indexOf(node);
                if (index === 0) {
                    // this is the last node in the layer, so we can move to the left without troubles
                    node.gridPosition = node.gridPosition - 0.5;
                    return true;
                }

                var leftNode = layer[index - 1];
                var leftNodePriority = (leftNode.upstreamPriority + leftNode.downstreamPriority) / 2;

                // check if there is space between the left and the current node
                if (leftNode.gridPosition < node.gridPosition - 1) {
                    node.gridPosition = node.gridPosition - 0.5;
                    return true;
                }

                // we have reached a node with higher priority; no movement is allowed
                if (leftNodePriority > priority ||
                    Math.abs(leftNodePriority - priority) < 0.0001) {
                    return false;
                }

                // The left node has lower priority - try to move it
                if (this.moveLeft(leftNode, layer, priority)) {
                    node.gridPosition = node.gridPosition - 0.5;
                    return true;
                }

                return false;
            }

            mapVirtualNode(node, link) {
                this.nodeToLinkMap.Set(node, link);
                if (!this.linkToNodeMap.ContainsKey(link)) {
                    this.linkToNodeMap.Set(link, []);
                }
                this.linkToNodeMap.Get(link).push(node);
            }

            _nodesInLink(node) {
                return this.linkToNodeMap.Get(this.nodeToLinkMap.Get(node));
            }

            /// <summary>
            /// Inserts dummy nodes to break long links.
            /// </summary>
            _dummify() {
                this.linkToNodeMap = new Map();
                this.nodeToLinkMap = new Map();

                var layer, pos, newNode, node, r, newLink, i, l, links = this.graph.links.slice(0);
                for (l = 0; l < links.length; l++) {
                    var link = links[l];
                    var o = link.source;
                    var d = link.target;

                    var oLayer = o.layer;
                    var dLayer = d.layer;
                    var oPos = o.gridPosition;
                    var dPos = d.gridPosition;

                    var step = (dPos - oPos) / Math.abs(dLayer - oLayer);

                    var p = o;
                    if (oLayer - dLayer > 1) {
                        for (i = oLayer - 1; i > dLayer; i--) {
                            newNode = new Node();
                            newNode.X = o.X;
                            newNode.Y = o.Y;
                            newNode.Width = o.Width / 100;
                            newNode.Height = o.Height / 100;

                            layer = this.layers[i];
                            pos = (i - dLayer) * step + oPos;
                            if (pos > layer.length) {
                                pos = layer.length;
                            }

                            // check if origin and dest are both last
                            if (oPos >= this.layers[oLayer].length - 1 &&
                                dPos >= this.layers[dLayer].length - 1) {
                                pos = layer.length;
                            }

                            // check if origin and destination are both first
                            else if (oPos === 0 && dPos === 0) {
                                pos = 0;
                            }

                            newNode.layer = i;
                            newNode.uBaryCenter = 0.0;
                            newNode.dBaryCenter = 0.0;
                            newNode.upstreamLinkCount = 0;
                            newNode.downstreamLinkCount = 0;
                            newNode.gridPosition = pos;
                            newNode.isVirtual = true;

                            layer.Insert(newNode, pos);

                            // translate rightwards nodes' positions
                            for (r = pos + 1; r < layer.length; r++) {
                                node = layer[r];
                                node.gridPosition = node.gridPosition + 1;
                            }

                            newLink = new Link(p, newNode);
                            newLink.depthOfDumminess = 0;
                            p = newNode;

                            // add the new node and the new link to the graph
                            this.graph.nodes.push(newNode);
                            this.graph.addLink(newLink);

                            newNode.index = this.graph.nodes.length - 1;
                            this.mapVirtualNode(newNode, link);
                        }

                        // set the origin of the real arrow to the last dummy
                        link.changeSource(p);
                        link.depthOfDumminess = oLayer - dLayer - 1;
                    }

                    if (oLayer - dLayer < -1) {
                        for (i = oLayer + 1; i < dLayer; i++) {
                            newNode = new Node();
                            newNode.X = o.X;
                            newNode.Y = o.Y;
                            newNode.Width = o.Width / 100;
                            newNode.Height = o.Height / 100;

                            layer = this.layers[i];
                            pos = (i - oLayer) * step + oPos;
                            if (pos > layer.length) {
                                pos = layer.length;
                            }

                            // check if origin and dest are both last
                            if (oPos >= this.layers[oLayer].length - 1 &&
                                dPos >= this.layers[dLayer].length - 1) {
                                pos = layer.length;
                            }

                            // check if origin and destination are both first
                            else if (oPos === 0 && dPos === 0) {
                                pos = 0;
                            }

                            newNode.layer = i;
                            newNode.uBaryCenter = 0.0;
                            newNode.dBaryCenter = 0.0;
                            newNode.upstreamLinkCount = 0;
                            newNode.downstreamLinkCount = 0;
                            newNode.gridPosition = pos;
                            newNode.isVirtual = true;

                            pos &= pos; // truncates to int
                            layer.Insert(newNode, pos);

                            // translate rightwards nodes' positions
                            for (r = pos + 1; r < layer.length; r++) {
                                node = layer[r];
                                node.gridPosition = node.gridPosition + 1;
                            }

                            newLink = new Link(p, newNode);
                            newLink.depthOfDumminess = 0;
                            p = newNode;

                            // add the new node and the new link to the graph
                            this.graph.nodes.push(newNode);
                            this.graph.addLink(newLink);

                            newNode.index = this.graph.nodes.length - 1;
                            this.mapVirtualNode(newNode, link);
                        }

                        // Set the origin of the real arrow to the last dummy
                        link.changeSource(p);
                        link.depthOfDumminess = dLayer - oLayer - 1;
                    }
                }
            }

            /// <summary>
            /// Removes the dummy nodes inserted earlier to break long links.
            /// </summary>
            /// <remarks>The virtual nodes are effectively turned into intermediate connection points.</remarks>
            _dedummify() {
                var dedum = true;
                while (dedum) {
                    dedum = false;

                    for (var l = 0; l < this.graph.links.length; l++) {
                        var link = this.graph.links[l];
                        if (link.depthOfDumminess === 0) {
                            continue;
                        }

                        var points = [];

                        // add points in reverse order
                        points.Prepend({ x: link.target.X, y: link.target.Y });
                        points.Prepend({ x: link.source.X, y: link.source.Y });

                        // _dedummify the link
                        var temp = link;
                        var depthOfDumminess = link.depthOfDumminess;
                        for (var d = 0; d < depthOfDumminess; d++) {
                            var node = temp.source;
                            var prevLink = node.incoming[0];

                            points.Prepend({ x: prevLink.source.X, y: prevLink.source.Y });

                            temp = prevLink;
                        }

                        // restore the original link origin
                        link.changeSource(temp.source);

                        // reset dummification flag
                        link.depthOfDumminess = 0;

                        // note that we only need the intermediate points, floating links have been dropped in the analysis
                        if (points.length > 2) {
                            // first and last are the endpoints
                            points.splice(0, 1);
                            points.splice(points.length - 1);
                            link.points = points;
                        }
                        else {
                            link.points = [];
                        }

                        // we are not going to delete the dummy elements;
                        // they won't be needed anymore anyway.

                        dedum = true;
                        break;
                    }
                }
            }

            /// <summary>
            /// Optimizes/reduces the crossings between the layers by turning the crossing problem into a (combinatorial) number ordering problem.
            /// </summary>
            _optimizeCrossings() {
                var moves = -1, i;
                var maxIterations = 3;
                var iter = 0;

                while (moves !== 0) {
                    if (iter++ > maxIterations) {
                        break;
                    }

                    moves = 0;

                    for (i = this.layers.length - 1; i >= 1; i--) {
                        moves += this.optimizeLayerCrossings(false, i);
                    }

                    for (i = 0; i < this.layers.length - 1; i++) {
                        moves += this.optimizeLayerCrossings(true, i);
                    }
                }
            }

            calcUpData(layer) {
                if (layer === 0) {
                    return;
                }

                var considered = this.layers[layer], i, l, link;
                var upLayer = new TypeViz.Set();
                var temp = this.layers[layer - 1];
                for (i = 0; i < temp.length; i++) {
                    upLayer.Add(temp[i]);
                }

                for (i = 0; i < considered.length; i++) {
                    var node = considered[i];

                    // calculate barycenter
                    var sum = 0;
                    var total = 0;

                    for (l = 0; l < node.incoming.length; l++) {
                        link = node.incoming[l];
                        if (upLayer.Contains(link.source)) {
                            total++;
                            sum += link.source.gridPosition;
                        }
                    }

                    for (l = 0; l < node.outgoing.length; l++) {
                        link = node.outgoing[l];
                        if (upLayer.Contains(link.target)) {
                            total++;
                            sum += link.target.gridPosition;
                        }
                    }

                    if (total > 0) {
                        node.uBaryCenter = sum / total;
                        node.upstreamLinkCount = total;
                    }
                    else {
                        node.uBaryCenter = i;
                        node.upstreamLinkCount = 0;
                    }
                }
            }

            calcDownData(layer) {
                if (layer === this.layers.length - 1) {
                    return;
                }

                var considered = this.layers[layer], i, l, link;
                var downLayer = new Set();
                var temp = this.layers[layer + 1];
                for (i = 0; i < temp.length; i++) {
                    downLayer.Add(temp[i]);
                }

                for (i = 0; i < considered.length; i++) {
                    var node = considered[i];

                    // calculate barycenter
                    var sum = 0;
                    var total = 0;

                    for (l = 0; l < node.incoming.length; l++) {
                        link = node.incoming[l];
                        if (downLayer.Contains(link.source)) {
                            total++;
                            sum += link.source.gridPosition;
                        }
                    }

                    for (l = 0; l < node.outgoing.length; l++) {
                        link = node.outgoing[l];
                        if (downLayer.Contains(link.target)) {
                            total++;
                            sum += link.target.gridPosition;
                        }
                    }

                    if (total > 0) {
                        node.dBaryCenter = sum / total;
                        node.downstreamLinkCount = total;
                    }
                    else {
                        node.dBaryCenter = i;
                        node.downstreamLinkCount = 0;
                    }
                }
            }

            /// <summary>
            /// Optimizes the crossings.
            /// </summary>
            /// <remarks>The big trick here is the usage of weights or values attached to connected nodes which turn a problem of crossing links
            /// to an a problem of ordering numbers.</remarks>
            /// <param name="layerIndex">The layer index.</param>
            /// <param name="movingDownwards">If set to <c>true</c> we move down in the layer stack.</param>
            /// <returns>The number of nodes having moved, i.e. the number of crossings reduced.</returns>
            optimizeLayerCrossings(down, layer) {
                var iconsidered;
                var considered;

                if (down) {
                    considered = this.layers[iconsidered = layer + 1];
                }
                else {
                    considered = this.layers[iconsidered = layer - 1];
                }

                // remember what it was
                var presorted = considered.slice(0);

                // calculate barycenters for all nodes in the considered layer
                if (down) {
                    this.calcUpData(iconsidered);
                }
                else {
                    this.calcDownData(iconsidered);
                }

                // sort nodes within this layer according to the barycenters
                Array.prototype.sort.call(this, considered, function (n1, n2) {
                    var n1BaryCenter = this.calcBaryCenter(n1),
                        n2BaryCenter = this.calcBaryCenter(n2);

                    if (Math.abs(n1BaryCenter - n2BaryCenter) < 0.0001) {
                        // in case of coinciding barycenters compare by the count of in/out links
                        if (n1.degree() === n2.degree()) {
                            return this.compareByIndex(n1, n2);
                        }
                        else if (n1.degree() < n2.degree()) {
                            return 1;
                        }
                        return -1;
                    }

                    var compareValue = (n2BaryCenter - n1BaryCenter) * 1000;
                    if (compareValue > 0) {
                        return -1;
                    }
                    else if (compareValue < 0) {
                        return 1;
                    }
                    return this.compareByIndex(n1, n2);
                });

                // count relocations
                var i, moves = 0;
                for (i = 0; i < considered.length; i++) {
                    if (considered[i] !== presorted[i]) {
                        moves++;
                    }
                }

                if (moves > 0) {
                    // now that the boxes have been arranged, update their grid positions
                    var inode = 0;
                    for (i = 0; i < considered.length; i++) {
                        var node = considered[i];
                        node.gridPosition = inode++;
                    }
                }

                return moves;
            }

            /// <summary>
            /// Swaps a pair of nodes in a layer.
            /// </summary>
            /// <param name="layerIndex">Index of the layer.</param>
            /// <param name="n">The Nth node in the layer.</param>
            _swapPairs() {
                var maxIterations = this.options.LayeredIterations;
                var iter = 0;

                while (true) {
                    if (iter++ > maxIterations) {
                        break;
                    }

                    var downwards = (iter % 4 <= 1);
                    var secondPass = (iter % 4 === 1);

                    for (var l = (downwards ? 0 : this.layers.length - 1);
                        downwards ? l <= this.layers.length - 1 : l >= 0; l += (downwards ? 1 : -1)) {
                        var layer = this.layers[l];
                        var hasSwapped = false;

                        // there is no need to recalculate crossings if they were calculated
                        // on the previous step and nothing has changed
                        var calcCrossings = true;
                        var memCrossings = 0;

                        for (var n = 0; n < layer.length - 1; n++) {
                            // count crossings
                            var up = 0;
                            var down = 0;
                            var crossBefore = 0;

                            if (calcCrossings) {
                                if (l !== 0) {
                                    up = this.countLinksCrossingBetweenTwoLayers(l - 1, l);
                                }
                                if (l !== this.layers.length - 1) {
                                    down = this.countLinksCrossingBetweenTwoLayers(l, l + 1);
                                }
                                if (downwards) {
                                    up *= 2;
                                }
                                else {
                                    down *= 2;
                                }

                                crossBefore = up + down;
                            }
                            else {
                                crossBefore = memCrossings;
                            }

                            if (crossBefore === 0) {
                                continue;
                            }

                            // Swap nodes
                            var node1 = layer[n];
                            var node2 = layer[n + 1];

                            var node1GridPos = node1.gridPosition;
                            var node2GridPos = node2.gridPosition;
                            layer[n] = node2;
                            layer[n + 1] = node1;
                            node1.gridPosition = node2GridPos;
                            node2.gridPosition = node1GridPos;

                            // count crossings again and if worse than before, restore swapping
                            up = 0;
                            if (l !== 0) {
                                up = this.countLinksCrossingBetweenTwoLayers(l - 1, l);
                            }
                            down = 0;
                            if (l !== this.layers.length - 1) {
                                down = this.countLinksCrossingBetweenTwoLayers(l, l + 1);
                            }
                            if (downwards) {
                                up *= 2;
                            }
                            else {
                                down *= 2;
                            }
                            var crossAfter = up + down;

                            var revert = false;
                            if (secondPass) {
                                revert = crossAfter >= crossBefore;
                            }
                            else {
                                revert = crossAfter > crossBefore;
                            }

                            if (revert) {
                                node1 = layer[n];
                                node2 = layer[n + 1];

                                node1GridPos = node1.gridPosition;
                                node2GridPos = node2.gridPosition;
                                layer[n] = node2;
                                layer[n + 1] = node1;
                                node1.gridPosition = node2GridPos;
                                node2.gridPosition = node1GridPos;

                                // nothing has changed, remember the crossings so that
                                // they are not calculated again on the next step
                                memCrossings = crossBefore;
                                calcCrossings = false;
                            }
                            else {
                                hasSwapped = true;
                                calcCrossings = true;
                            }
                        }

                        if (hasSwapped) {
                            if (l !== this.layers.length - 1) {
                                this.calcUpData(l + 1);
                            }
                            if (l !== 0) {
                                this.calcDownData(l - 1);
                            }
                        }
                    }
                }
            }

            /// <summary>
            /// Counts the number of links crossing between two layers.
            /// </summary>
            /// <param name="layerIndex1">The layer index.</param>
            /// <param name="layerIndex2">Another layer index.</param>
            /// <returns></returns>
            countLinksCrossingBetweenTwoLayers(ulayer, dlayer) {
                var i, crossings = 0;

                var upperLayer = new TypeViz.Set();
                var temp1 = this.layers[ulayer];
                for (i = 0; i < temp1.length; i++) {
                    upperLayer.Add(temp1[i]);
                }

                var lowerLayer = new Set();
                var temp2 = this.layers[dlayer];
                for (i = 0; i < temp2.length; i++) {
                    lowerLayer.Add(temp2[i]);
                }

                // collect the links located between the layers
                var dlinks = new Set();
                var links = [];
                var temp = [];

                upperLayer.ForEach(function (node) {
                    //throw "";
                    temp.AddRange(node.incoming);
                    temp.AddRange(node.outgoing);
                });

                for (var ti = 0; ti < temp.length; ti++) {
                    var link = temp[ti];

                    if (upperLayer.Contains(link.source) &&
                        lowerLayer.Contains(link.target)) {
                        dlinks.Add(link);
                        links.push(link);
                    }
                    else if (lowerLayer.Contains(link.source) &&
                        upperLayer.Contains(link.target)) {
                        links.push(link);
                    }
                }

                for (var l1 = 0; l1 < links.length; l1++) {
                    var link1 = links[l1];
                    for (var l2 = 0; l2 < links.length; l2++) {
                        if (l1 === l2) {
                            continue;
                        }

                        var link2 = links[l2];

                        var n11, n12;
                        var n21, n22;

                        if (dlinks.Contains(link1)) {
                            n11 = link1.source;
                            n12 = link1.target;
                        }
                        else {
                            n11 = link1.target;
                            n12 = link1.source;
                        }

                        if (dlinks.Contains(link2)) {
                            n21 = link2.source;
                            n22 = link2.target;
                        }
                        else {
                            n21 = link2.target;
                            n22 = link2.source;
                        }

                        var n11gp = n11.gridPosition;
                        var n12gp = n12.gridPosition;
                        var n21gp = n21.gridPosition;
                        var n22gp = n22.gridPosition;

                        if ((n11gp - n21gp) * (n12gp - n22gp) < 0) {
                            crossings++;
                        }
                    }
                }

                return crossings / 2;
            }

            calcBaryCenter(node) {
                var upstreamLinkCount = node.upstreamLinkCount;
                var downstreamLinkCount = node.downstreamLinkCount;
                var uBaryCenter = node.uBaryCenter;
                var dBaryCenter = node.dBaryCenter;

                if (upstreamLinkCount > 0 && downstreamLinkCount > 0) {
                    return (uBaryCenter + dBaryCenter) / 2;
                }
                if (upstreamLinkCount > 0) {
                    return uBaryCenter;
                }
                if (downstreamLinkCount > 0) {
                    return dBaryCenter;
                }

                return 0;
            }

            _gridPositionComparer(x, y) {
                if (x.gridPosition < y.gridPosition) {
                    return -1;
                }
                if (x.gridPosition > y.gridPosition) {
                    return 1;
                }
                return 0;
            }

            _positionAscendingComparer(x, y) {
                return x.k < y.k ? -1 : x.k > y.k ? 1 : 0;
            }

            _positionDescendingComparer(x, y) {
                return x.k < y.k ? 1 : x.k > y.k ? -1 : 0;
            }

            _firstVirtualNode(layer) {
                for (var c = 0; c < layer.length; c++) {
                    if (layer[c].isVirtual) {
                        return c;
                    }
                }
                return -1;
            }

            compareByIndex(o1, o2) {
                var i1 = o1.index;
                var i2 = o2.index;

                if (i1 < i2) {
                    return 1;
                }

                if (i1 > i2) {
                    return -1;
                }

                return 0;
            }

            intDiv(numerator, denominator) {
                return (numerator - numerator % denominator) / denominator;
            }

            nextVirtualNode(layer, node) {
                var nodeIndex = node.layerIndex;
                for (var i = nodeIndex + 1; i < layer.length; ++i) {
                    if (layer[i].isVirtual) {
                        return layer[i];
                    }
                }
                return null;
            }

        }

        /* Captures the state of a diagram; node positions, link points and so on.*/
        export class LayoutState {
            private diagram;
            private nodeMap;
            private linkMap;
            constructor(diagram, graphOrNodes?) {
                if (TypeViz.IsUndefined(diagram)) {
                    throw "No diagram given";
                }
                this.diagram = diagram;
                this.nodeMap = new Map();
                this.linkMap = new Map();
                this.capture(graphOrNodes ? graphOrNodes : diagram);
            }

            /**
             * Will capture either
             * - the state of the shapes and the intermediate points of the connections in the diagram
             * - the bounds of the nodes contained in the Graph together with the intermediate points of the links in the Graph
             * - the bounds of the nodes in the Array<Node>
             * - the links points and node bounds in the literal object
             * @param diagramOrGraphOrNodes
             */
            capture(diagramOrGraphOrNodes) {
                var node,
                    nodes,
                    shape,
                    i,
                    conn,
                    link,
                    links;

                if (diagramOrGraphOrNodes instanceof TypeViz.Diagramming.Graph) {

                    for (i = 0; i < diagramOrGraphOrNodes.nodes.length; i++) {
                        node = diagramOrGraphOrNodes.nodes[i];
                        shape = node.associatedShape;
                        //shape.bounds(new Rect(node.X, node.Y, node.Width, node.Height));
                        this.nodeMap.Set(shape.visual.Native.id, new Rect(node.X, node.Y, node.Width, node.Height));
                    }
                    for (i = 0; i < diagramOrGraphOrNodes.links.length; i++) {
                        link = diagramOrGraphOrNodes.links[i];
                        conn = link.associatedConnection;
                        this.linkMap.Set(conn.visual.Native.id, link.points);
                    }
                }
                else if (diagramOrGraphOrNodes instanceof Array) {
                    nodes = diagramOrGraphOrNodes;
                    for (i = 0; i < nodes.length; i++) {
                        node = nodes[i];
                        shape = node.associatedShape;
                        if (shape) {
                            this.nodeMap.Set(shape.visual.Native.id, new Rect(node.X, node.Y, node.Width, node.Height));
                        }
                    }
                }
                else if (diagramOrGraphOrNodes.hasOwnProperty("links") && diagramOrGraphOrNodes.hasOwnProperty("nodes")) {
                    nodes = diagramOrGraphOrNodes.nodes;
                    links = diagramOrGraphOrNodes.links;
                    for (i = 0; i < nodes.length; i++) {
                        node = nodes[i];
                        shape = node.associatedShape;
                        if (shape) {
                            this.nodeMap.Set(shape.visual.Native.id, new Rect(node.X, node.Y, node.Width, node.Height));
                        }
                    }
                    for (i = 0; i < links.length; i++) {
                        link = links[i];
                        conn = link.associatedConnection;
                        if (conn) {
                            this.linkMap.Set(conn.visual.Native.id, link.points);
                        }
                    }
                }
                else { // capture the diagram
                    var shapes = this.diagram.shapes;
                    var connections = this.diagram.connections;
                    for (i = 0; i < shapes.length; i++) {
                        shape = shapes[i];
                        this.nodeMap.Set(shape.visual.Native.id, shape.Rectangle);
                    }
                    //Swa: connection points 
                    for (i = 0; i < connections.length; i++) {
                        conn = connections[i];
                        this.linkMap.Set(conn.visual.Native.id, conn.Points);
                    }
                }
            }
        }
    }

}