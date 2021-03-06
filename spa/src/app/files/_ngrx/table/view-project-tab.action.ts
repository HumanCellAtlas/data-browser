/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Action triggered when any project detail tab is viewed. 
 */

// Core dependencies
import { Action } from "@ngrx/store";

// App dependencies
import { TrackingAction } from "../analytics/tracking.action";
import { GAAction } from "../../../shared/analytics/ga-action.model";
import { GACategory } from "../../../shared/analytics/ga-category.model";
import { GADimension } from "../../../shared/analytics/ga-dimension.model";
import { GAEvent } from "../../../shared/analytics/ga-event.model";

export class ViewProjectTabAction implements Action, TrackingAction {
    
    public static ACTION_TYPE = "PROJECT.VIEW";
    public readonly type = ViewProjectTabAction.ACTION_TYPE;

    /**
     * @param {GAAction} tabName
     * @param {string} projectId
     * @param {string} projectShortname
     * @param {string} projectUrl
     */
    constructor(public tabName: GAAction,
                public projectId: string,
                public projectShortname: string,
                public projectUrl: string) {}

    /**
     * Return the cleared age range action as a GA event.
     *
     * @param {{[key: string]: any}} dimensions
     * @returns {GAEvent}
     */
    public asEvent({catalog, currentQuery}): GAEvent {

        return {
            category: GACategory.PROJECT,
            action: this.tabName,
            label: this.projectShortname,
            dimensions: {
                [GADimension.CATALOG]: catalog,
                [GADimension.CURRENT_QUERY]: currentQuery,
                [GADimension.ENTITY_ID]: this.projectId,
                [GADimension.ENTITY_URL]: this.projectUrl
            }
        };
    }
}
