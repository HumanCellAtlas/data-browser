/**
 * UCSC Genomics Institute - CGL
 * https://cgl.genomics.ucsc.edu/
 *
 * File facet list reducer, handles actions related to selecting and deselecting facet terms, and corresponding knock-on
 * actions such as requesting updated list of facets.
 */

// Core dependencies
import { Action } from "@ngrx/store";

// App dependencies
import { FileFacetListState } from "./file-facet-list.state";
import {
    ClearSelectedFileFacetsAction, ClearSelectedTermsAction,
    FetchFileFacetsSuccessAction, InitEntityStateAction,
    SelectFileFacetAction,
    SetViewStateAction
} from "./file-facet-list.actions";

/**
 * @param state {FileFacetListState}
 * @param action {Action}
 * @returns {FileFacetListState}
 */
export function reducer(state: FileFacetListState = FileFacetListState.getDefaultState(), action: Action): FileFacetListState {

    switch (action.type) {

        case InitEntityStateAction.ACTION_TYPE:
            return state.requestFileFacets();

        // Handle case where term has been selected - selected/deselected state of term must be updated, and possibly
        // the selected facet itself (if user has switched from the previously selected facet, to select a new term).
        case SelectFileFacetAction.ACTION_TYPE:
            return state.selectTerm(action as SelectFileFacetAction);

        // Handle cases where facet list has been re/requested and updated list of facets have been returned from end
        // point.
        case FetchFileFacetsSuccessAction.ACTION_TYPE:
            return state.receiveFileFacets(action as FetchFileFacetsSuccessAction);

        case ClearSelectedFileFacetsAction.ACTION_TYPE:
            return state.clearSelectedFacet();

        case ClearSelectedTermsAction.ACTION_TYPE:
            return FileFacetListState.getDefaultState();

        // Handle the case where the view state has been parsed from URL param on app init - must do this here to set
        // the initial set of selected facet terms.
        case SetViewStateAction.ACTION_TYPE:

            return state.setSelectedTermsFromViewState(action as SetViewStateAction);

        default:
            return state;
    }
}
