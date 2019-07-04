/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Class responsible for mapping response returned from files end point, to a model appropriate for display in
 * files data table.
 */

// App dependencies
import { EntityRow } from "../table/entity-row.model";
import { EntityRowMapper } from "../table/entity-row-mapper";
import { getSelfOrFirst, getUnspecifiedIfNullValue } from "../table/table-methods";

export class FileRowMapper extends EntityRowMapper {
    
    private file;

    /**
     * @param {any} row - data modelling row in current selected table.
     */
    constructor(row: any) {

        super(row);

        // Always take the first value in the files array. This is a summary value and there should only ever be 
        // single value here. Also protect against null and empty array values.
        this.file = (row.files || [])[0] || {};
    }

    /**
     * Return the version of the row, optimized for display in the data table.
     */
    public mapRow(): EntityRow {
        return Object.assign({}, super.mapRow(), {
            libraryConstructionApproach: getUnspecifiedIfNullValue(this.protocols.libraryConstructionApproach),
            specimenId: getSelfOrFirst(this.specimens.id),
            fileFormat: this.file.format,
            fileName: this.file.name,
            fileSize: getUnspecifiedIfNullValue(this.file.size),
            url: this.file.url
        });
    }
}