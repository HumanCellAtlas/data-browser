/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * URL-related side effects.
 */

// Core dependencies
import { Injectable } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { filter, switchMap, take, tap } from "rxjs/operators";

// App dependencies
import { SelectEntityAction } from "../entity/select-entity.action";
import { SetViewStateAction } from "../facet/set-view-state.action";
import { AppState } from "../../../_ngrx/app.state";
import { ClearSelectedAgeRangeAction } from "../search/clear-selected-age-range.action";
import { SelectFacetAgeRangeAction } from "../search/select-facet-age-range.action";
import { ClearSelectedTermsAction } from "../search/clear-selected-terms.action";
import { SelectFileFacetTermAction } from "../search/select-file-facet-term.action";
import { EntityName } from "../../shared/entity-name.model";
import { SearchTermUrlService } from "../../search/url/search-term-url.service";
import { selectUrlSpecState } from "./url.selectors";

@Injectable()
export class UrlEffects {

    /**
     * @param {SearchTermUrlService} searchTermUrlService
     * @param {Store<AppState>} store
     * @param {Location} location
     * @param {Router} router
     * @param {Actions} actions$
     */
    constructor(private searchTermUrlService: SearchTermUrlService,
                private store: Store<AppState>,
                private location: Location,
                private router: Router,
                private actions$: Actions) {
    }

    /**
     * Update filter query string param if selected entity or selected search terms has changed. 
     */
    @Effect({dispatch: false})
    updateFilterQueryParam$ = this.actions$.pipe(
        ofType(
            ClearSelectedTermsAction.ACTION_TYPE,
            ClearSelectedAgeRangeAction.ACTION_TYPE,
            SelectEntityAction.ACTION_TYPE,
            SelectFileFacetTermAction.ACTION_TYPE,
            SelectFacetAgeRangeAction.ACTION_TYPE,
            SetViewStateAction.ACTION_TYPE
        ),
        filter(() => {

            // We only want to update the location if user is currently viewing /projects, /samples or /files.
            const path = this.router.url.split("?")[0];
            return path === `/${EntityName.PROJECTS}` ||
                path === `/${EntityName.SAMPLES}` ||
                path === `/${EntityName.FILES}`
        }),
        switchMap(() =>
            this.store.pipe(
                select(selectUrlSpecState),
                take(1)
            )
        ),
        tap((urlSpecState) => {

            const filterQueryString =
                this.searchTermUrlService.stringifySearchTerms(urlSpecState.selectedSearchTermsBySearchKey);

            const path = urlSpecState.selectedEntitySpec.key;
            const params = new URLSearchParams();
            if ( !!filterQueryString ) {
                params.set("filter", filterQueryString);
            }
            this.location.replaceState(path, params.toString());
        })
    );
}
