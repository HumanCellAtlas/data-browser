/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Side effects related to system-related actions.
 */

// Core dependencies
import { Inject, Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action, select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";

// App dependencies
import { selectCatalog } from "../../files/_ngrx/catalog/catalog.selectors";
import { AppState } from "../../_ngrx/app.state";
import { SystemStatusResponse } from "../shared/system-status-response.model";
import { SystemService20 } from "../shared/system.2.0.service";
import { SystemStatusRequestAction } from "./system-status-request.action";
import { SystemStatusSuccessAction } from "./system-status-success.action";

@Injectable()
export class SystemEffects {

    /**
     * @param {Store<AppState>} store
     * @param {Actions} actions$
     * @param {SystemService20} systemService
     */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private systemService: SystemService20) {
    }

    /**
     * Trigger fetch of system status.
     *
     * @type {Observable<Action>}
     */
    @Effect()
    systemStatus$: Observable<Action> = this.actions$
        .pipe(
            ofType(SystemStatusRequestAction.ACTION_TYPE),
            switchMap(() => this.store.pipe(select(selectCatalog), take(1))),
            switchMap((catalog) => this.systemService.fetchSystemStatus(catalog)),
            map((response: SystemStatusResponse) => {

                return new SystemStatusSuccessAction(response.ok, response.indexing);
            })
        );
}
