/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Spec for testing projects table data source.
 */

// Core dependencies
import { async, TestBed } from "@angular/core/testing";
import { Store } from "@ngrx/store";
import { of } from "rxjs";

// App components
import { EntitiesDataSource } from "../table/entities.data-source";
import { FileRowMapper } from "./file-row-mapper";
import {
    FILE_EMPTY_ARRAY_VALUES,
    FILE_MULTIPLE_VALUES_SINGLE_OBJECT,
    FILE_NULL_TOP_LEVEL_VALUES,
    FILE_NULL_VALUES,
    FILE_SINGLE_VALUES, FILE_VALUES_ACROSS_MULTIPLE_OBJECTS
} from "./file-row-mapper.mock";
import { mapMultipleValues } from "../table/entity-row-mapper.spec";

describe("FileRowMapper:", () => {

    let dataSource;
    const testStore = jasmine.createSpyObj("Store", ["pipe", "dispatch"]);

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [
            ],
            imports: [
            ],
            providers: [{
                provide: Store,
                useValue: testStore
            }]
        });
    }));

    /**
     * Smoke test
     */
    it("should create data source", () => {

        dataSource = new EntitiesDataSource<FileRowMapper>(of([FILE_SINGLE_VALUES]), FileRowMapper);
        expect(dataSource).toBeTruthy();
    });

    /**
     * Use organism age as a test to check if file mapper extends the entity mapper by confirming organism age is mapped.
     */
    it("should map organism age", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.organismAge).toEqual(fileToMap.donorOrganisms[0].organismAge[0]);
            done();
        })
    });

    /**
     * Specimen ID should be mapped
     */
    it("should map specimen ID", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.specimenId).toEqual(fileToMap.specimens[0].id[0]);
            done();
        })
    });

    /**
     * First specimen ID should be mapped if more than one is specified
     */
    it("should map first specimen ID if multiple are specified", (done: DoneFn) => {

        const fileToMap = FILE_MULTIPLE_VALUES_SINGLE_OBJECT;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.specimenId).toEqual(fileToMap.specimens[0].id[0]);
            done();
        })
    });

    /**
     * Mapper leave unspecified specimens IDs as is.
     */
    it("should not map specimen ID when specimens is null", (done: DoneFn) => {

        dataSource = new EntitiesDataSource<FileRowMapper>(of([FILE_NULL_TOP_LEVEL_VALUES]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.specimenId).toBeFalsy();
            done();
        })
    });

    /**
     * Mapper should not map null specimen ID value.
     */
    it("should not map null specimen ID ", (done: DoneFn) => {

        dataSource = new EntitiesDataSource<FileRowMapper>(of([FILE_NULL_VALUES]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.specimenId).toBeFalsy();
            done();
        })
    });
    
    /**
     * Library construction approach should be mapped.
     */
    it("should map library construction approach", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.libraryConstructionApproach).toEqual(fileToMap.protocols[0].libraryConstructionApproach[0]);
            done();
        })
    });

    /**
     * Multiple library construction approaches should be rolled up and mapped.
     */
    it("should roll up and map multiple library construction approach values", (done: DoneFn) => {

        const fileToMap = FILE_MULTIPLE_VALUES_SINGLE_OBJECT;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.libraryConstructionApproach).toEqual(
                fileToMap.protocols[0].libraryConstructionApproach.join(", "));
            done();
        })
    });

    /**
     * Multiple library construction approaches should be rolled up and mapped.
     */
    it("should roll up and map multiple library construction approach values across multiple protocols", (done: DoneFn) => {

        const fileToMap = FILE_VALUES_ACROSS_MULTIPLE_OBJECTS;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            const expectedValue = mapMultipleValues(fileToMap.protocols, "libraryConstructionApproach");
            expect(mappedFile.libraryConstructionApproach).toEqual(expectedValue);
            done();
        })
    });

    /**
     * An empty library construction approach array should be mapped to "Unspecified".
     */
    it(`should map empty array library construction approach to "Unspecified"`, (done: DoneFn) => {

        dataSource = new EntitiesDataSource<FileRowMapper>(of([FILE_EMPTY_ARRAY_VALUES]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.libraryConstructionApproach).toEqual("Unspecified");
            done();
        })
    });

    /**
     * Mapper should handle null protocols value. Use library construction approach as the check for this.
     */
    it(`should map library construction approach to "Unspecified" when protocols is null`, (done: DoneFn) => {

        dataSource = new EntitiesDataSource<FileRowMapper>(of([FILE_NULL_VALUES]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.libraryConstructionApproach).toEqual("Unspecified");
            done();
        })
    });

    /**
     * A null library construction approach array should be mapped to "Unspecified".
     */
    it(`should map null library construction approach to "Unspecified"`, (done: DoneFn) => {

        dataSource = new EntitiesDataSource<FileRowMapper>(of([FILE_NULL_VALUES]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.libraryConstructionApproach).toEqual("Unspecified");
            done();
        })
    });

    // /**
    //  * Mapper should handle null files value. Use file format as the check for this. TODO ****************************************
    //  */
    // it(`should map file format to "Unspecified" when files is null`, (done: DoneFn) => {
    //
    //     const fileToMap = FILE_NULL_TOP_LEVEL_VALUES;
    //     dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
    //     dataSource.connect().subscribe((rows) => {
    //
    //         const mappedFile = rows[0];
    //         expect(mappedFile.fileFormat).toEqual("Unspecified");
    //         done();
    //     })
    // });
    
    /**
     * File format should be included in mapping
     */
    it("should map file format", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.fileFormat).toEqual(fileToMap.files[0].format);
            done();
        })
    });

    /**
     * File name should be included in mapping
     */
    it("should map file name", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.fileName).toEqual(fileToMap.files[0].name);
            done();
        })
    });

    /**
     * File size should be included in mapping
     */
    it("should map file size", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.fileSize).toEqual(fileToMap.files[0].size);
            done();
        })
    });

    /**
     * URL should be included in mapping
     */
    it("should map file URL", (done: DoneFn) => {

        const fileToMap = FILE_SINGLE_VALUES;
        dataSource = new EntitiesDataSource<FileRowMapper>(of([fileToMap]), FileRowMapper);
        dataSource.connect().subscribe((rows) => {

            const mappedFile = rows[0];
            expect(mappedFile.url).toEqual(fileToMap.files[0].url);
            done();
        })
    });
});