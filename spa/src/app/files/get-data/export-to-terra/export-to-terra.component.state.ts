/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * State backing Terra export component.
 */

// App dependencies
import { FileSummary } from "../../file-summary/file-summary";
import { ExportToTerraStatus } from "../../shared/export-to-terra-status.model";
import { SearchTerm } from "../../search/search-term.model";

export interface ExportToTerraComponentState {

    exportToTerraStatus: ExportToTerraStatus;
    exportToTerraUrl: string;
    manifestDownloadFileSummary: FileSummary;
    selectedSearchTerms: SearchTerm[];
    selectedSearchTermNames: string[];
}
