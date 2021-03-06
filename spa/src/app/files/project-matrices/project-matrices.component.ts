/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Component for displaying project expression matrices associated with a project.
 */

// Core dependencies
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { AppState } from "../../_ngrx/app.state";
import { combineLatest, Observable, of } from "rxjs";
import { map, take } from "rxjs/operators";

// App dependencies
import { selectSelectedProject } from "../_ngrx/files.selectors";
import { selectProjectMatrixFileLocationsByProjectId } from "../_ngrx/project/project.selectors";
import { FetchProjectRequestAction } from "../_ngrx/table/table.actions";
import { ProjectDetailService } from "../project-detail/project-detail.service";
import { ProjectTab } from "../project-detail/project-tab.model";
import { ProjectMatricesComponentState } from "./project-matrices.component.state";
import { GAAction } from "../../shared/analytics/ga-action.model";

@Component({
    selector: "project-matrices",
    templateUrl: "./project-matrices.component.html",
    styleUrls: ["./project-matrices.component.scss"]
})
export class ProjectMatricesComponent implements OnDestroy, OnInit {

    // Template variables
    public state$: Observable<ProjectMatricesComponentState>;

    /**
     * @param {ProjectDetailService} projectDetailService
     * @param {Store<AppState>} store
     * @param {ActivatedRoute} activatedRoute
     */
    constructor(private projectDetailService: ProjectDetailService,
                private store: Store<AppState>,
                private activatedRoute: ActivatedRoute) {}

    /**
     * Clear project meta tags.
     */
    public ngOnDestroy() {

        // Set up tracking of project tab
        this.projectDetailService.removeProjectMeta();
    }

    /**
     * Set up tracking of tab. Set project meta tags.
     */
    private initTab() {

        this.state$.pipe(
            take(1)
        ).subscribe((state) => {
            const project = state.project;
            this.projectDetailService.addProjectMeta(project.projectTitle, ProjectTab.PROJECT_MATRICES);
            this.projectDetailService.trackTabView(GAAction.VIEW_MATRICES, project.entryId, project.projectShortname);
        });
    }

    /**
     * Update state with selected project.
     */
    public ngOnInit() {

        // Add selected project to state - grab the project ID from the URL.
        const projectId = this.activatedRoute.parent.snapshot.paramMap.get("id");
        this.store.dispatch(new FetchProjectRequestAction(projectId));

        // Grab reference to selected project
        const project$ = this.store.pipe(select(selectSelectedProject));

        // Get any resolved matrix file locations for the selected projects
        const projectMatrixFileLocationsByFileUrl$ = 
            this.store.pipe(select(selectProjectMatrixFileLocationsByProjectId, {projectId}));

        this.state$ = combineLatest(
            project$,
            projectMatrixFileLocationsByFileUrl$
        )
            .pipe(
                map(([project, projectMatrixFileLocationsByFileUrl]) => {

                    return {
                        project,
                        projectMatrixFileLocationsByFileUrl
                    };
                })
            );

        // Set up tracking of project tab
        this.initTab();
    }
}
