/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Action triggered when a project is selected using the "select project" checkboxes on the project tab, or from
 * the project detail page, and uses the project ID as a search key. There is no corresponding facet for project ID (only
 * for project, which uses the project short name - see SelectProjectAction).
 */

// Core dependencies
import { Action } from "@ngrx/store";

// App dependencies
import { FileFacetName } from "../../shared/file-facet-name.model";
import { SearchTerm } from "../../search/search-term.model";
import { SearchEntity } from "../../search/search-entity.model";
import { SelectSearchTermAction } from "./select-search-term.action";

export class SelectProjectIdAction implements Action, SelectSearchTermAction {

    public static ACTION_TYPE = "FILE.FILE_FACET_LIST.SELECT_PROJECT_ID";
    public readonly type = SelectProjectIdAction.ACTION_TYPE;
    public readonly facetName = FileFacetName.PROJECT_ID;

    /**
     * @param {string} projectId
     * @param {string} projectShortName
     * @param {boolean} selected
     */
    constructor(
        public readonly projectId: string,
        public readonly projectShortName: string,
        public readonly selected = true) {}

    /**
     * Returns selected project in search term format.
     *
     * @returns {SearchTerm}
     */
    public asSearchTerm(): SearchTerm {

        return new SearchEntity(this.facetName, this.projectId, this.projectShortName);
    }

    /**
     * There is no corresponding facet for project ID - throw error.
     */
    public getTermKey(): string {

        throw `No facet found for ${this.facetName}`;
    }
}