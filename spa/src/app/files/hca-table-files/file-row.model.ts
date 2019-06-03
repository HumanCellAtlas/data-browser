/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Model of a file row in data table.
 */

// App dependencies
import { EntityRow } from "../table/entity-row.model";

export interface FileRow extends EntityRow {
    fileFormat: string;
    fileName: string;
    fileSize: number;
    specimenId: string;
    url: string;
}
