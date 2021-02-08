/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Class responsible for mapping response returned from projects end point, to model appropriate for display in samples
 * data table.
 */

// App dependencies
import { ProjectMatrixMapper } from "../project-matrix/project-matrix-mapper";
import { getUnspecifiedIfNullValue } from "../table/table-methods";
import { EntityRow } from "../entities/entity-row.model";
import { FileTypeSummariesRowMapper } from "../table/file-type-summaries-row-mapper";

export class ProjectRowMapper extends FileTypeSummariesRowMapper {

    // Locals
    private matrixMapper = new ProjectMatrixMapper();

    /**
     * @param {boolean} v2 - true if running in v2 environment
     * @param {any} row - data modelling row in current selected table.
     */
    constructor(v2: boolean, row: any) {

        super(v2, row);
    }

    /**
     * Return the version of the row, optimized for display in the data table.
     */
    public mapRow(): EntityRow {

        // Bind contributor and CDP generated matrices 
        const contributorMatrices = this.v2 ? this.matrixMapper.bindMatrices(this.projects.contributorMatrices) : [];
        const matrices = this.v2 ? this.matrixMapper.bindMatrices(this.projects.matrices) : [];
        
        return Object.assign({}, super.mapRow(), {
            contributorMatrices,
            entryId: this.row.entryId,
            matrices,
            projectShortname: getUnspecifiedIfNullValue(this.projects.projectShortname)
        });
    }
}