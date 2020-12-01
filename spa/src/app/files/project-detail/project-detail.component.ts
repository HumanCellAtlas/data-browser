/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Wrapper component for displaying project nav, and the child component specific to the current route. For example,
 * project information, external tools, summary stats etc. 
 */

// Core dependencies
import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { AppState } from "../../_ngrx/app.state";
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";

// App dependencies
import { selectCatalog } from "../_ngrx/catalog/catalog.selectors";
import { selectSelectedProject } from "../_ngrx/file.selectors";
import {
    selectReleaseByProjectId,
    selectReleaseReferrer
} from "../_ngrx/release/release.selectors";
import { FetchIntegrationsByProjectIdRequestAction } from "../_ngrx/integration/fetch-integrations-by-project-id-request.action";
import { selectProjectIntegrations } from "../_ngrx/integration/integration.selectors";
import { selectSelectedProjectSearchTerms } from "../_ngrx/search/search.selectors";
import { SelectProjectIdAction } from "../_ngrx/search/select-project-id.action";
import { ClearSelectedProjectAction } from "../_ngrx/table/clear-selected-project.action";
import { FetchProjectRequestAction } from "../_ngrx/table/table.actions";
import { ReleaseName } from "../releases/release-name.model";
import { SearchTerm } from "../search/search-term.model";
import { EntityName } from "../shared/entity-name.model";
import EntitySpec from "../shared/entity-spec";
import { ProjectDetailComponentState } from "./project-detail.component.state";
import { ReleaseService } from "../shared/release.service";
import { GASource } from "../../shared/analytics/ga-source.model";

@Component({
    selector: "project-detail",
    templateUrl: "./project-detail.component.html",
    styleUrls: ["./project-detail.component.scss"]
})
export class ProjectDetailComponent {

    // Locals
    private releaseReferrer: boolean;
    private ngDestroy$ = new Subject();

    // Template variables
    public state$ = new BehaviorSubject<ProjectDetailComponentState>({
        loaded: false
    });

    /**
     * @param {ReleaseService} releaseService
     * @param {Store<AppState>} store
     * @param {ActivatedRoute} activatedRoute
     * @param {Router} router
     */
    public constructor(private releaseService: ReleaseService,
                       private store: Store<AppState>,
                       private activatedRoute: ActivatedRoute,
                       private router: Router) {}

    /**
     * Returns the class for the select box.
     *
     * @param {boolean} selected
     * @returns {{[p: string]: boolean}}
     */
    public getLegendClass(selected: boolean): { [className: string]: boolean } {

        return {
            "box": true,
            "selected": selected
        };
    }

    /**
     * Tab provides opportunity to return back to Project table.
     *
     * @returns {EntitySpec[]}
     */
    public getProjectDetailTabs(): EntitySpec[] {

        if ( this.releaseReferrer ) {

            return [{key: "releases/2020-mar", displayName: "2020 March Data Release"}];
        }

        return [{key: EntityName.PROJECTS, displayName: "Back"}];
    }

    /**
     * Returns true if release feature is enabled.
     * 
     * @returns {boolean}
     */
    private isReleaseFeatureEnabled(): boolean {

        return this.releaseService.isReleaseFeatureEnabled();
    }

    /**
     * Handle click on term in list of terms - update store with selected / unselected project and returns user back to project table.
     *
     * @param {boolean} projectSelected
     * @param {string} projectId
     * @param {string} projectShortname
     */
    public onProjectSelected(projectSelected: boolean, projectId: string, projectShortname: string) {

        this.store.dispatch(new SelectProjectIdAction(projectId, projectShortname, !projectSelected, GASource.PROJECT));
        this.router.navigate(["/projects"]);
    }

    /**
     * Returns true if project is a selected facet.
     *
     * @param {string[]} selectedProjectIds
     * @param {string} projectId
     * @returns {boolean}
     */
    private isProjectSelected(selectedProjectIds: string[], projectId: string): boolean {

        return selectedProjectIds.indexOf(projectId) >= 0;
    }

    /**
     * Transform selected project search term set into set of selected project IDs.
     *
     * @param {SearchTerm[]} searchTerms
     * @returns {string[]}
     */
    private mapSearchTermsToProjectIds(searchTerms: SearchTerm[]): string[] {

        return searchTerms.map((searchTerm: SearchTerm) => {
            return searchTerm.getSearchValue();
        });
    }

    /**
     * Determine where the back link should navigate to; either the release page if the user has come from there,
     * otherwise the projects tab.
     */
    private setReleaseReferrer() {

        this.store
            .pipe(
                select(selectReleaseReferrer),
                take(1)
            )
            .subscribe((releaseReferrer) => {
                this.releaseReferrer = releaseReferrer;
            });
    }

    /**
     * Clear out the selected project when the user navigates away from project detail page. Also clear the flag
     * indicating this project detail component should return the release page (if necessary).
     */
    public ngOnDestroy() {

        this.ngDestroy$.next(true);
        this.ngDestroy$.complete();

        this.store.dispatch(new ClearSelectedProjectAction());
    }

    /**
     * Update state with selected project.
     */
    public ngOnInit() {

        // Determine where the back button should navigate to
        this.setReleaseReferrer();
        
        // Add selected project to state - grab the project ID from the URL.
        const projectId = this.activatedRoute.snapshot.paramMap.get("id");
        this.store.dispatch(new FetchProjectRequestAction(projectId));

        // Grab reference to selected project
        const project$ = this.store.pipe(
            select(selectSelectedProject),
            takeUntil(this.ngDestroy$),
            filter(project => !!project),
            take(1)
        );

        // Grab the ID's of the current set of selected projects, if any
        const selectedProjectIds$ = this.store.pipe(
            select(selectSelectedProjectSearchTerms),
            takeUntil(this.ngDestroy$),
            take(1),
            map(this.mapSearchTermsToProjectIds)
        );
        
        const projectInRelease$ = this.store.pipe(
            select(selectReleaseByProjectId, {name: ReleaseName.RELEASE_2020_MAR, projectId}),
            takeUntil(this.ngDestroy$),
            take(1),
            map(release => release.projects.length > 0)
        );

        // Request and grab the integrations for the current project
        this.store.dispatch(new FetchIntegrationsByProjectIdRequestAction(projectId));
        const projectIntegrations$ = this.store.pipe(
            select(selectProjectIntegrations, {projectId: projectId}),
            takeUntil(this.ngDestroy$),
            filter(integrations => !!integrations),
            take(1)
        );
        
        // Grab the current catalog value - we need this to generate links to project detail pages
        const catalog$ = this.store.pipe(select(selectCatalog));

        // Set up component state
        combineLatest(project$, projectInRelease$, projectIntegrations$, selectedProjectIds$, catalog$)
            .pipe(
                takeUntil(this.ngDestroy$)
            )
            .subscribe(([project, projectInRelease, projectIntegrations, selectedProjectIds, catalog]) => {
    
                const projectSelected = this.isProjectSelected(selectedProjectIds, project.entryId);
                const externalResourcesExist = project.supplementaryLinks.length > 0 || projectIntegrations.length > 0;

                this.state$.next({
                    catalog,
                    externalResourcesExist,
                    loaded: true,
                    project,
                    projectInRelease,
                    projectSelected
                });
            });
    }
}
