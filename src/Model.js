/**
Copyright (c) 2007-2014, Orbifold bvba.
For the complete license agreement see http://orbifold.net/EULA or contact us at sales@orbifold.net.
*/
/// <reference path="Globals.ts" />
/// <reference path="Extensions.ts" />
/// <reference path="Animation.ts" />
/// <reference path="Maths.ts" />
/// <reference path="SVG.ts" />
/// <reference path="Arrays.ts" />
/// <reference path="Structures.ts" />
var TypeViz;
(function (TypeViz) {
    

    

    /**
    * A base class for data models with a subscriber mechanism.
    */
    var ModelBase = (function () {
        function ModelBase() {
            this.handlers = [];
        }
        /**
        * Adds a subscriber to the change event.
        */
        ModelBase.prototype.Subscribe = function (handler) {
            this.handlers.push(handler);
        };

        /**
        * Removes a subscriber from the change event.
        */
        ModelBase.prototype.RemoveSubscriber = function (handler) {
            this.handlers = this.handlers.filter(function (h) {
                return h !== handler;
            });
        };

        /**
        * Notifies the subscribers that this model has changed.
        * @subsetName The optional subset name or label identifying a partial change.
        */
        ModelBase.prototype.RaiseChanged = function (subsetName, changedRaiser) {
            var _this = this;
            if (typeof subsetName === "undefined") { subsetName = null; }
            if (typeof changedRaiser === "undefined") { changedRaiser = this; }
            if (this.handlers) {
                this.handlers.ForEach(function (h) {
                    return h.call(changedRaiser, _this, subsetName);
                });
            }
        };
        return ModelBase;
    })();
    TypeViz.ModelBase = ModelBase;
})(TypeViz || (TypeViz = {}));

if (!Array.prototype.BiSort) {
    Array.prototype.BiSort = TypeViz.BiSort;
}
//# sourceMappingURL=Model.js.map
