/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Release component for displaying release table.
 */

// Core dependencies
import { Component, Input } from "@angular/core";

// App dependencies
import { Store } from "@ngrx/store";
import { AppState } from "../../../_ngrx/app.state";
import { SetReleaseReferrerAction } from "../../_ngrx/release/set-release-referrer.action";
import { ReleaseOrganView } from "../release-organ-view.model";

@Component({
    selector: "release-table",
    templateUrl: "./release-table.component.html",
    styleUrls: ["./release-table.component.scss"]
})
export class ReleaseTableComponent {

    // Inputs
    @Input() releaseOrganViews: ReleaseOrganView[];

    // Locals
    private columnsToDisplay = ["projectTitle", "developmentalStage", "technology", "releaseFiles", "annotatedExpressionMatrix", "visualize"];

    /**
     * @param {Store<AppState>} store
     */
    constructor(private store: Store<AppState>) {}

    /**
     * Returns the technology, based off libraryConstructionApproach. Any libraryConstructionApproach ending with
     * "sequencing" shall have this removed to provide a shortened name for the technology column.
     *
     * @param {string} libraryConstructionApproach
     * @returns {string}
     */
    public renderTechnologyShortName(libraryConstructionApproach: string): string {

        let techShortName = libraryConstructionApproach;

        let techShortNames = techShortName.split(",");

        if ( techShortNames.length > 0 ) {

            techShortName = techShortNames.map(shortName => {

                return shortName.replace("sequencing", "").trim();
            }).join(", ");
        }

        return techShortName;
    }

    /**
     * Update state to indicate that any project-specific release components need to return to this release page (for
     * example:
     * 
     * 1. project detail back button returns here (and not to projects tab)
     * 2. release files modal close button returns here (and not to project detail release tab)
     */
    public setReleaseReferrer() {

        this.store.dispatch(new SetReleaseReferrerAction());
    }
}
