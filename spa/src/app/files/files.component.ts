// Core dependencies
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";

// App dependencies
import { FileFacet } from "./shared/file-facet.model";
import { FileSummary } from "./file-summary/file-summary";

import {
    DownloadFileManifestAction,
    FetchFileManifestSummaryRequestAction
} from "./_ngrx/file-manifest-summary/file-manifest-summary.actions";
import { selectFileFacetsFileFacets, selectFileSummary } from "./_ngrx/file.selectors";
import { AppState } from "../_ngrx/app.state";
import { FetchFileFacetsRequestAction } from "./_ngrx/file-facet-list/file-facet-list.actions";

/**
 * Core files component, displays results summary as well as facets.
 */

@Component({
    selector: "bw-files",
    templateUrl: "files.component.html",
    styleUrls: ["files.component.scss"]
})
export class FilesComponent implements OnInit {

    // Locals
    private route: ActivatedRoute;
    private store: Store<AppState>;

    // Public variables
    public selectFileSummary$: Observable<FileSummary>;
    public fileFacets$: Observable<FileFacet[]>;

    /**
     * @param route {ActivatedRoute}
     * @param store {Store<AppState>}
     */
    constructor(route: ActivatedRoute,
                store: Store<AppState>) {

        this.route = route;
        this.store = store;
    }

    /**
     * Public API
     */

    /**
     * Request manifest summary
     */
    public requestManifestSummary() {

        this.store.dispatch(new FetchFileManifestSummaryRequestAction());
    }


    /**
     * Dispatch Manifest Download Request
     */
    public onDownloadManifest() {
        this.store.dispatch(new DownloadFileManifestAction());
    }

    /**
     * Life cycle hooks
     */

    /**
     * Set up selectors and request initial data set.
     */
    public ngOnInit() {

        // File Summary
        this.selectFileSummary$ = this.store.select(selectFileSummary);


        // File Facets
        this.fileFacets$ = this.store.select(selectFileFacetsFileFacets);

        // initialize the filter state from the params in the route.
        this.initQueryParams();

    }

    /**
     * PRIVATES
     */

    /**
     * Parse queryParams into file filters
     */
    private initQueryParams() {

        this.route.queryParams
            .map((params) => {

                if (params && params["filters"] && params["filters"].length) {
                    return {
                        filters: JSON.parse(decodeURIComponent(params["filters"]))
                    };
                }
                else {
                    return {};
                }
            })
            .subscribe((query) => {
                this.store.dispatch(new FetchFileFacetsRequestAction());
                // this.store.dispatch({ type: ACTIONS.INIT_FILE_FACETS, payload: query });
            });
    }
}
