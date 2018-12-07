/**
 * UCSC Genomics Institute - CGL
 * https://cgl.genomics.ucsc.edu/
 *
 * Component displaying HCA project table details.
 */

// Core dependencies
import {
    Component,
    ChangeDetectionStrategy, OnInit
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";

// App dependencies
import { AppState } from "../../_ngrx/app.state";
import { FileFacetSelectedEvent } from "../file-facets/file-facet.events";
import { selectSelectedFileFacets, selectSelectedProject } from "../_ngrx/file.selectors";
import { SelectFileFacetAction } from "../_ngrx/file-facet-list/file-facet-list.actions";
import { EntitySelectAction, FetchProjectRequestAction } from "../_ngrx/table/table.actions";
import { Contributor } from "../shared/contributor.model";
import EntitySpec from "../shared/entity-spec";
import { FileFacet } from "../shared/file-facet.model";
import { Project } from "../shared/project.model";

@Component({
    selector: "hca-project",
    templateUrl: "./hca-project.component.html",
    styleUrls: ["./hca-project.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HCAProjectComponent implements OnInit {

    // Public variables
    public selectedFileFacets$: Observable<FileFacet[]>;

    // Template variables
    public project$: Observable<Project>;

    /**
     * @param {ActivatedRoute} activatedRoute
     * @param {Router} router
     * @param {Store<AppState>} store
     */
    public constructor(private activatedRoute: ActivatedRoute,
                       private router: Router,
                       private store: Store<AppState>) {
    }

    /**
     * Public API
     */

    /**
     * Returns formatted name from "firstName,middleName,lastName" to "firstName middleName lastName"
     * @param {string} commaDelimitedName
     * @returns {string}
     */
    public formatContributor(commaDelimitedName: string): string {

        return commaDelimitedName.split(/[ ,]+/).join(" ");
    }

    /**
     * Returns null value for EntitySpec, no need for an active tab.
     *
     * @returns {EntitySpec}
     */
    public getActiveTab(): EntitySpec {

        return {key: "", displayName: ""};
    }

    /**
     * Tab provides opportunity to return back to Project table.
     *
     * @returns {EntitySpec[]}
     */
    public getProjectDetailTabs(): EntitySpec[] {

        return [{key: "projects", displayName: "Projects"}];
    }

    /**
     * Return the list of authors of the project, or N/A if not specified.
     * Will exclude corresponding contributors and any contributor with role "Human Cell Atlas wrangler".
     * @param contributors
     * @returns {string}
     */
    public listAuthors(contributors: Contributor[]): string {

        let listOfAuthors = contributors.filter((contributor) => {

            if ( contributor.correspondingContributor ) {

                return false;
            }

            if ( this.isHCAWrangler(contributor.projectRole) ) {

                return false;
            }

            return true;
        }).map(contributor => contributor.contactName);

        if ( listOfAuthors ) {
            return this.stringifyValues((listOfAuthors.map(name => this.formatContributor(name))));
        }
        else {
            return "N/A";
        }
    }

    /**
     * Return the distinct list of collaborating organizations of the project, or N/A if not specified.
     * Will exclude corresponding contributors and any contributor with role "Human Cell Atlas wrangler".
     * @param contributors
     * @returns {string}
     */
    public listCollaboratingOrganizations(contributors): string {

        let listOfCollaboratingOrganizations = contributors.filter(contributor => contributor.correspondingContributor != true && !this.isHCAWrangler(contributor.projectRole)).map(contributor => contributor.institution);

        // Find the distinct list of collaborating organisations
        let uniqueListOfCollaboratingOrganizations = listOfCollaboratingOrganizations.filter((o, i, a) => a.indexOf(o) === i);

        if ( uniqueListOfCollaboratingOrganizations ) {
            return this.stringifyValues(uniqueListOfCollaboratingOrganizations);
        }
        else {
            return "N/A";
        }
    }

    /**
     * Returns the list of contributors of the project
     * @param contributors
     * @returns {Contributor[]}
     */
    public listContributors(contributors: Contributor[]): Contributor[] {

        return contributors.filter(contributor => contributor.correspondingContributor);
    }

    /**
     * Handle click on term in list of terms - update store with selected project and return user back to project table.
     * @param {string} projectShortName
     */
    public onProjectSelected(projectShortName: string) {

        this.store.dispatch(new SelectFileFacetAction(
            new FileFacetSelectedEvent("project", projectShortName, true)));
        this.router.navigate(["/projects"]);
    }

    /**
     * Handle click on tab - update selected entity in state and return user back to project table.
     *
     * @param {EntitySpec} tab
     */
    public onTabSelected(tab: EntitySpec) {

        this.store.dispatch(new EntitySelectAction(tab.key));
        this.router.navigate(["/projects"]);
    }

    /**
     * Returns true if the projectRole is "Human Cell Atlas wrangler".
     * @param {string} projectRole
     * @returns {boolean}
     */
    public isHCAWrangler(projectRole: string): boolean {

        return projectRole && projectRole.toLowerCase() === "human cell atlas wrangler";
    }

    /**
     * Returns true if project is a selected facet.
     * @param {string} projectShortName
     * @param {FileFacet[]} selectedFacets
     * @returns {boolean}
     */
    public isProjectSelected(projectShortName: string, selectedFacets: FileFacet[]): boolean {

        let isProjectFacetSelected = selectedFacets.filter(fileFacet => fileFacet.name === "project");

        if ( isProjectFacetSelected.length ) {
            return isProjectFacetSelected[0].selectedTerms.some(term => term.name === projectShortName);
        }

        return false;
    }

    /**
     * Return string-concat'ed version of the specified array.
     *
     * @param {any[]} values
     * @returns {string}
     */
    public stringifyValues(values: any[]): string {

        return values.join(", ");
    }

    /**
     * Life cycle hooks
     */

    /**
     * Update state with selected project.
     */
    public ngOnInit() {

        // Add selected project to state - grab the project ID from the URL.
        const projectId = this.activatedRoute.snapshot.paramMap.get("id");
        this.store.dispatch(new FetchProjectRequestAction(projectId));

        // Grab reference to selected project
        this.project$ = this.store.select(selectSelectedProject);

        // Get the set of selected facet terms
        this.selectedFileFacets$ = this.store.select(selectSelectedFileFacets);
    }
}
