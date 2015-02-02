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
module TypeViz {

    /**
     * Defines the interface of a data model.
     */
    export interface IModel {
        /**
         * Adds a subscriber to the change event.
         */
        Subscribe(handler: IModelAction);

        /**
         * Removes a subscriber from the change event.
         */
        RemoveSubscriber(handler: IModelAction);

        /**
         * Notifies the subscribers that this model has changed.
         */
        RaiseChanged(labelName?: string, changedRaiser?);
    }

    export interface IModelSubscriber {
        (dataContext: IModel, subsetName: string): void;
    }

    /**
     * Defines a method with no return;
     */
    export interface IAction<T> {
        (d: T): void;
    }

    export interface IModelAction {
        (d: IModel, name: string): void;
    }

    /**
     * A base class for data models with a subscriber mechanism.
     */
    export class ModelBase implements IModel {

        handlers: Array<IModelAction> = [];

        constructor() {
        }

        /**
         * Adds a subscriber to the change event.
         */
        public Subscribe(handler: IModelAction) {
            this.handlers.push(handler);
        }

        /**
         * Removes a subscriber from the change event.
         */
        public RemoveSubscriber(handler: IModelAction) {
            this.handlers = this.handlers.filter(h => h !== handler);
        }

        /**
         * Notifies the subscribers that this model has changed.
         * @subsetName The optional subset name or label identifying a partial change.
         */
        public RaiseChanged(subsetName: string = null, changedRaiser = this) {
            if (this.handlers) {
                this.handlers.ForEach(h => h.call(changedRaiser, this, subsetName));
            }
        }
    }


}


if (!Array.prototype.BiSort) {
    Array.prototype.BiSort = TypeViz.BiSort;
}