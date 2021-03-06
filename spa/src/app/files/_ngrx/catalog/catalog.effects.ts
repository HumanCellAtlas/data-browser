/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Coordination of side effects of catalog-related actions.
 */

// Core dependencies
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, map, switchMap, take, tap, withLatestFrom } from "rxjs/operators";

// App dependencies
import { Atlas } from "../../atlas/atlas.model";
import { selectCatalog } from "./catalog.selectors";
import { CatalogService } from "../../catalog/catalog.service";
import { FetchCatalogsRequestAction } from "./fetch-catalogs-request.action";
import { FetchCatalogsSuccessAction } from "./fetch-catalogs-success.action";
import { ErrorAction } from "../../../http/_ngrx/error.action";
import { GTMService } from "../../../shared/analytics/gtm.service";
import { ViewCatalogAction } from "./view-catalog.action";
import { FetchCatalogsErrorAction } from "./fetch-catalogs-error.action";
import { AppState } from "../../../_ngrx/app.state";

@Injectable()
export class CatalogEffects {

    /**
     * @param {CatalogService} catalogService
     * @param {GTMService} gtmService
     * @param {Store<AppState>} store
     * @param {Actions} actions$
     */
    constructor(private catalogService: CatalogService,
                private gtmService: GTMService,
                private store: Store<AppState>,
                private actions$: Actions) {}

    /**
     * Fetch catalogs on app init.
     */
    @Effect()
    fetchCatalogs$ = this.actions$.pipe(
        ofType(FetchCatalogsRequestAction.ACTION_TYPE),
        switchMap(() => 
            this.catalogService.fetchCatalogs().pipe(
                map((atlas: Atlas) => new FetchCatalogsSuccessAction(atlas)),
                catchError((errorMessage) => of(new FetchCatalogsErrorAction(), new ErrorAction(errorMessage)))
            )
        )
    );

    /**
     * Track view of catalog from announcement.
     */
    @Effect({dispatch: false})
    viewCatalog$ = this.actions$.pipe(
        ofType(ViewCatalogAction.ACTION_TYPE),
        concatMap(action => of(action).pipe(
            withLatestFrom(
                this.store.pipe(select(selectCatalog), take(1))
            )
        )),
        tap(([action, catalog]) => {
            this.gtmService.trackEvent((action as ViewCatalogAction).asEvent({catalog}));
        })
    );
}
