/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Component responsible for displaying and handling export to Terra functionality.
 */

// Core dependencies
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { combineLatest, Observable, Subject } from "rxjs";
import { filter, map, takeUntil } from "rxjs/operators";

// App dependencies
import { ConfigService } from "../../../config/config.service";
import { FacetTermSelectedEvent } from "../../facet/file-facet/facet-term-selected.event";
import { FileSummary } from "../../file-summary/file-summary";
import { FileTypeSummary } from "../../file-summary/file-type-summary";
import { ExportToTerraComponentState } from "./export-to-terra.component.state";
import { AppState } from "../../../_ngrx/app.state";
import { FetchManifestDownloadFileSummaryRequestAction } from "../../_ngrx/file-manifest/fetch-manifest-download-file-summary-request.action";
import { selectFileManifestFileSummary } from "../../_ngrx/file-manifest/file-manifest.selectors";
import { LaunchTerraAction } from "../../_ngrx/terra/launch-terra.action";
import { selectSelectedSearchTerms } from "../../_ngrx/search/search.selectors";
import { SelectFileFacetTermAction } from "../../_ngrx/search/select-file-facet-term.action";
import { CopyToClipboardTerraUrlAction } from "../../_ngrx/terra/copy-to-clipboard-terra-url.action";
import { ExportToTerraRequestAction } from "../../_ngrx/terra/export-to-terra-request.action";
import { ResetExportToTerraStatusAction } from "../../_ngrx/terra/reset-export-to-terra-status.action";
import { selectExportToTerra } from "../../_ngrx/terra/terra.selectors";
import { SearchTerm } from "../../search/search-term.model";
import { GASource } from "../../../shared/analytics/ga-source.model";
import EntitySpec from "../../shared/entity-spec";
import { ExportToTerraStatus } from "../../shared/export-to-terra-status.model";
import { TerraService } from "../../shared/terra.service";

@Component({
    selector: "export-to-terra",
    templateUrl: "./export-to-terra.component.html",
    styleUrls: ["./export-to-terra.component.scss"]
})
export class ExportToTerraComponent implements OnDestroy, OnInit {

    // Privates
    private ngDestroy$ = new Subject();

    // Template variables
    public portalURL: string;
    public state$: Observable<ExportToTerraComponentState>;

    /**
     *
     * @param {ConfigService} configService
     * @param {TerraService} terraService
     * @param {Store<AppState>} store
     * @param {Router} router
     * @param {Window} window
     */
    constructor(private configService: ConfigService,
                private terraService: TerraService,
                private store: Store<AppState>,
                private router: Router,
                @Inject("Window") window: Window) {

        this.store = store;
        this.portalURL = this.configService.getPortalUrl();
    }

    /**
     * Return the file type summary of the specified file summaries.
     *
     * @param {FileSummary} fileSummary
     * @returns {FileTypeSummary[]}
     */
    public getFileTypeSummaries(fileSummary: FileSummary): FileTypeSummary[] {

        if ( fileSummary ) {
            return fileSummary.fileTypeSummaries;
        }

        return [];
    }

    /**
     * Return user to species selection
     */
    public getBackButtonTab(): EntitySpec[] {

        const key = "Species Selection";
        return [{
            key,
            displayName: key
        }];
    }
    
    /**
     * Returns the terra workspace URL.
     *
     * @param exportToTerraUrl
     * @returns {string}
     */
    public getTerraServiceUrl(exportToTerraUrl): string {

        return this.terraService.buildExportToTerraWorkspaceUrl(exportToTerraUrl);
    }

    /**
     * Returns true if any "fileFormat" facet terms are selected.
     *
     * @param {SearchTerm[]} selectedSearchTerms
     * @returns {boolean}
     */
    public isAnyFileFormatSelected(selectedSearchTerms: SearchTerm[]): boolean {

        return selectedSearchTerms.some(selectedSearchTerm => selectedSearchTerm.getSearchKey() === "fileFormat");
    }

    /**
     * Returns true if export to Terra request has been completed.
     *
     * @param {ExportToTerraStatus} status
     * @returns {boolean}
     */
    public isRequestComplete(status: ExportToTerraStatus): boolean {

        return this.terraService.isExportToTerraRequestComplete(status);
    }

    /**
     * Returns true if an error occurred during the export to Terra request.
     *
     * @param {ExportToTerraStatus} status
     * @returns {boolean}
     */
    public isRequestFailed(status: ExportToTerraStatus): boolean {

        return this.terraService.isExportToTerraRequestFailed(status);
    }

    /**
     * Returns true if export to Terra request is in progress.
     *
     * @param {ExportToTerraStatus} status
     * @returns {boolean}
     */
    public isRequestInProgress(status: ExportToTerraStatus): boolean {

        return (this.terraService.isExportToTerraRequestInitiated(status) ||
            this.terraService.isExportToTerraRequestInProgress(status));
    }

    /**
     * Returns true if export to Terra request has not yet been started.
     *
     * @param {ExportToTerraStatus} status
     * @returns {boolean}
     */
    public isRequestNotStarted(status: ExportToTerraStatus): boolean {

        return this.terraService.isExportToTerraRequestNotStarted(status);
    }

    /**
     * Track click on Terra data link.
     *
     * @param {string} exportToTerraUrl
     */
    public onDataLinkClicked(exportToTerraUrl: string) {

        this.store.dispatch(new LaunchTerraAction(exportToTerraUrl));
    }

    /**
     * Track click on copy of Terra data link.
     *
     * @param {string} exportToTerraUrl
     */
    public onDataLinkCopied(exportToTerraUrl: string) {

        this.store.dispatch(new CopyToClipboardTerraUrlAction(exportToTerraUrl));
    }

    /**
     * Dispatch action to export to Terra.
     */
    public onExportToTerra() {

        this.store.dispatch(new ExportToTerraRequestAction());
    }

    /**
     * Handle click on term in list of terms - update store to toggle selected value of term.
     *
     * @param facetTermSelectedEvent {FacetTermSelectedEvent}
     */
    public onFacetTermSelected(facetTermSelectedEvent: FacetTermSelectedEvent) {

        const action = new SelectFileFacetTermAction(
            facetTermSelectedEvent.facetName,
            facetTermSelectedEvent.termName,
            facetTermSelectedEvent.selected,
            GASource.COHORT_EXPORT);
        this.store.dispatch(action);
    }

    /**
     * Handle click on back button.
     */
    public onTabSelected(): void {

        this.router.navigate(["/export", "export-to-terra", "select-species"], {
            queryParamsHandling: "preserve"
        });
    }
    
    /**
     * Open new window on completion of export to Terra request.
     */
    private initRequestCompleteSubscriber() {

        this.state$
            .pipe(
                takeUntil(this.ngDestroy$),
                filter(({exportToTerraStatus}) => this.isRequestComplete(exportToTerraStatus))
            )
            .subscribe((state) => {

                window.open(this.terraService.buildExportToTerraWorkspaceUrl(state.exportToTerraUrl));
            });
    }

    /**
     * Reset export to Terra request status and kill subscriptions.
     */
    public ngOnDestroy() {

        // Reset export to Terra request status
        this.store.dispatch(new ResetExportToTerraStatusAction());

        // Kill subscriptions
        this.ngDestroy$.next(true);
        this.ngDestroy$.complete();
    }

    /**
     * Set up selectors and request initial data set.
     */
    public ngOnInit() {

        // Kick off request for file summaries, ignoring any currently selected file types
        this.store.dispatch(new FetchManifestDownloadFileSummaryRequestAction());

        // Grab the current set of selected search terms
        const selectedSearchTerms$ = this.store.pipe(select(selectSelectedSearchTerms));

        // Grab file summary for populating file type counts on export to Terra modal
        const selectManifestDownloadFileSummary$ = this.store.pipe(select(selectFileManifestFileSummary));

        // Update the UI with any changes in the export to Terra request status and URL
        const selectExportToTerraStatus$ = this.store.pipe(select(selectExportToTerra));
        
        this.state$ = combineLatest(
            selectedSearchTerms$,
            selectManifestDownloadFileSummary$,
            selectExportToTerraStatus$
        )
            .pipe(
                map(([selectedSearchTerms, manifestDownloadFileSummary, exportToTerra]) => {

                    const selectedSearchTermNames = selectedSearchTerms
                        .map(searchTerm => searchTerm.getDisplayValue());

                    return {
                        selectedSearchTerms,
                        selectedSearchTermNames,
                        manifestDownloadFileSummary,
                        ...exportToTerra
                    };
                })
            );

        this.initRequestCompleteSubscriber();
    }
}
