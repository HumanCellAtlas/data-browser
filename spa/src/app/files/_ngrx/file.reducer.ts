/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Set of file-related reducers.
 */

// App dependencies
import * as fileFacetListReducer from "./file-facet-list/file-facet-list.reducer";
import * as fileSummaryReducer from "./file-summary/file-summary.reducer";
import * as fileManifestReducer from "./file-manifest/file-manifest.reducer";
import * as matrixReducer from "./matrix/matrix.reducer";
import * as projectReducer from "./project/project.reducer";
import * as tableReducer from "./table/table.reducer";
import * as searchReducer from "./search/search.reducer";

export const reducer = {
    fileFacetList: fileFacetListReducer.reducer,
    fileManifest: fileManifestReducer.reducer,
    fileSummary: fileSummaryReducer.reducer,
    matrix: matrixReducer.reducer,
    project: projectReducer.reducer,
    search: searchReducer.reducer,
    tableState: tableReducer.reducer
};
