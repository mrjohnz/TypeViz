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
            if (typeof subsetName === "undefined") { subsetName = null; }
            if (typeof changedRaiser === "undefined") { changedRaiser = this; }
            var _this = this;
            if (this.handlers) {
                this.handlers.ForEach(function (h) {
                    return h.call(changedRaiser, _this, subsetName);
                });
            }
        };
        return ModelBase;
    })();
    TypeViz.ModelBase = ModelBase;

    /**
    * Merges the default options with the given one and returns the result.
    */
    function MergeOptions(defaultOptions, givenOptions) {
        if (givenOptions == null)
            return defaultOptions;
        var r = {};
        for (var n in defaultOptions) {
            r[n] = givenOptions[n] != null ? givenOptions[n] : defaultOptions[n];
        }
        return r;
    }
    TypeViz.MergeOptions = MergeOptions;

    function GetSVGRoot() {
        return document.getElementsByTagName('svg')[0];
    }
    TypeViz.GetSVGRoot = GetSVGRoot;
})(TypeViz || (TypeViz = {}));

if (!Array.prototype.BiSort) {
    Array.prototype.BiSort = TypeViz.BiSort;
}
//# sourceMappingURL=TypeViz.js.map
