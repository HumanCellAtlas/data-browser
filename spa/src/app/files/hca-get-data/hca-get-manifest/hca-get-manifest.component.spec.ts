/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Test suite for HCAGetManifest.
 */

// Core dependencies
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { By } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { ClipboardModule } from "ngx-clipboard";
import { of } from "rxjs";

// App dependencies
import { ConfigService } from "../../../config/config.service";
import { DisplayDataLinkComponent } from "../display-data-link/display-data-link.component";
import { FileTypeSummaryListComponent } from "../../file-type-summary-list/file-type-summary-list.component";
import { HCAGetDataPanelComponent } from "../hca-get-data-panel/hca-get-data-panel.component";
import { HCAGetManifestComponent } from "./hca-get-manifest.component";
import { PipeModule } from "../../../pipe/pipe.module";
import { SearchTermHttpService } from "../../search/http/search-term-http.service";
import { SearchFacetTerm } from "../../search/search-facet-term.model";
import { GTMService } from "../../../shared/analytics/gtm.service";
import { CopyToClipboardComponent } from "../../../shared/copy-to-clipboard/copy-to-clipboard.component";
import { FileManifestService } from "../../shared/file-manifest.service";
import { DEFAULT_FILE_SUMMARY } from "../../shared/file-summary.mock";
import { ManifestStatus } from "../../shared/manifest-status.model";
import { TermSortService } from "../../sort/term-sort.service";

describe("HCAGetManifestComponent", () => {

    let component: HCAGetManifestComponent;
    let fixture: ComponentFixture<HCAGetManifestComponent>;

    const testStore = jasmine.createSpyObj("Store", ["pipe", "dispatch"]);

    // Search terms with file format selected
    const SEARCH_TERMS_WITH_FILE_FORMAT = [
        new SearchFacetTerm("fileFormat", "fastq", 123),
        new SearchFacetTerm("disease", "ESRD", 8),
        new SearchFacetTerm("genusSpecies", "Homo sapiens", 20)
    ];

    /**
     * Setup before each test.
     */
    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [
                CopyToClipboardComponent,
                DisplayDataLinkComponent,
                FileTypeSummaryListComponent,
                HCAGetDataPanelComponent,
                HCAGetManifestComponent
            ],
            imports: [
                ClipboardModule,
                MatIconModule,
                MatTooltipModule,
                PipeModule
            ],
            providers: [
                {
                    provide: ConfigService,
                    useValue: jasmine.createSpyObj("ConfigService", ["getPortalUrl"])
                },
                {
                    provide: GTMService,
                    useValue: jasmine.createSpyObj("GTMService", [
                        "trackEvent"
                    ])
                },
                {
                    provide: FileManifestService,
                    useValue: jasmine.createSpyObj("FileManifestService", [
                        "trackRequestCohortManifest",
                        "trackDownloadCohortManifest",
                        "trackCopyToClipboardCohortManifestLink",
                        "trackDownloadProjectManifest",
                        "trackCopyToClipboardProjectManifestLink"
                    ])
                },
                {
                    provide: SearchTermHttpService,
                    useValue: jasmine.createSpyObj("SearchTermHttpService", ["bindSearchTerms", "marshallSearchTerms"])
                },
                {
                    provide: Store,
                    useValue: testStore
                },
                {
                    provide: TermSortService,
                    useValue: jasmine.createSpyObj("TermSortService", ["sortTerms"])
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HCAGetManifestComponent);
        component = fixture.componentInstance;
    }));


    /**
     * Confirm "Select Manifest File Types" is displayed when download status is not started.
     */
    it(`displays "Select Manifest File Types" when download status is "NOT_STARTED"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.NOT_STARTED
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Select Manifest File Types" is displayed
        expect(isPanelHeaderDisplayed("Select Manifest File Types")).toEqual(true);
    });

    /**
     * Confirm <file-type-summary-list> is displayed when download status is not started.
     */
    it(`displays component file-type-summary-list when download status is "NOT_STARTED"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.NOT_STARTED
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm <file-type-summary-list> is displayed
        const fileTypeSummaryListEl = expect(fixture.debugElement.nativeElement.querySelector("file-type-summary-list"));
        expect(fileTypeSummaryListEl).not.toBe(null);
    });

    /**
     * Confirm "Your File Manifest is Being Prepared" is not displayed when download status is not started.
     */
    it(`hides "Your File Manifest is Being Prepared" when download status is "NOT_STARTED"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.NOT_STARTED
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Your File Manifest is Being Prepared" is not displayed
        expect(isPanelHeaderDisplayed("Your File Manifest is Being Prepared")).toEqual(false);
    });

    /**
     * Confirm "Your File Manifest is Ready" is not displayed when download status is not started.
     */
    it(`hides "Your File Manifest is Ready" when download status is "NOT_STARTED"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.NOT_STARTED
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Your File Manifest is Ready" is not displayed
        expect(isPanelHeaderDisplayed("Your File Manifest is Ready")).toEqual(false);
    });

    /**
     * Confirm "Select Manifest File Types" is not displayed when download status is in progress.
     */
    it(`hides "Select Manifest File Types" when download status is "IN_PROGRESS"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.IN_PROGRESS
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Select Manifest File Types" is not displayed
        expect(isPanelHeaderDisplayed("Select Manifest File Types")).toEqual(false);
    });

    /**
     * Confirm <file-type-summary-list> is not displayed when download status is in progress.
     */
    it(`hides component file-type-summary-list when download status is "IN_PROGRESS"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.IN_PROGRESS
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm <file-type-summary-list> is not displayed
        const fileTypeSummaryListEl = fixture.debugElement.nativeElement.querySelector("file-type-summary-list");

        expect(fileTypeSummaryListEl).toEqual(null);
    });

    /**
     * Confirm "Your File Manifest is Being Prepared" is displayed when download status is in progress.
     */
    it(`displays "Your File Manifest is Being Prepared" when download status is "IN_PROGRESS"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.IN_PROGRESS
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Your File Manifest is Being Prepared" is displayed
        expect(isPanelHeaderDisplayed("Your File Manifest is Being Prepared")).toEqual(true);
    });

    /**
     * Confirm "Your File Manifest is Ready" is not displayed when download status is in progress.
     */
    it(`hides "Your File Manifest is Ready" when download status is "IN_PROGRESS"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.IN_PROGRESS
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Your File Manifest is Ready" is not displayed
        expect(isPanelHeaderDisplayed("Your File Manifest is Ready")).toEqual(false);
    });

    /**
     * Confirm "Select Manifest File Types" is not displayed when download status is complete.
     */
    it(`hides "Select Manifest File Types" when download status is "COMPLETE"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.COMPLETE
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Select Manifest File Types" is not displayed
        expect(isPanelHeaderDisplayed("Select Manifest File Types")).toEqual(false);
    });

    /**
     * Confirm <file-type-summary-list> is not displayed when download status is complete.
     */
    it(`hides component file-type-summary-list when download status is "COMPLETE"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.COMPLETE
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm <file-type-summary-list> is not displayed
        const fileTypeSummaryListEl = fixture.debugElement.nativeElement.querySelector("file-type-summary-list");

        expect(fileTypeSummaryListEl).toEqual(null);
    });

    /**
     * Confirm "Your File Manifest is Being Prepared" is not displayed when download status is complete.
     */
    it(`hides "Your File Manifest is Being Prepared" when download status is "COMPLETE"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.COMPLETE
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Your File Manifest is Being Prepared" is not displayed
        expect(isPanelHeaderDisplayed("Your File Manifest is Being Prepared")).toEqual(false);
    });

    /**
     * Confirm "Your File Manifest is Ready" is displayed when download status is complete.
     */
    it(`displays "Your File Manifest is Ready" when download status is "COMPLETE"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.COMPLETE
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm "Your File Manifest is Ready" is displayed
        expect(isPanelHeaderDisplayed("Your File Manifest is Ready")).toEqual(true);
    });

    /**
     * Confirm <copy-to-clipboard> is displayed when download status is complete.
     */
    it(`displays component copy-to-clipboard when download status is "COMPLETE"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.COMPLETE
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm <copy-to-clipboard> is displayed
        const copyToClipboardEl = expect(fixture.debugElement.nativeElement.querySelector("copy-to-clipboard"));

        expect(copyToClipboardEl).not.toBe(null);
    });

    /**
     * Confirm link is added to href attribute when download status is complete.
     */
    it(`should add link to href when download status is "COMPLETE"`, () => {

        testStore.pipe
            .and.returnValues(
            of([]), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                fileUrl: "https://foo.com/bar",
                status: ManifestStatus.COMPLETE
            }) // manifest response
        );

        fixture.detectChanges();

        // Confirm link text is added to href attribute
        const anchorEl = fixture.debugElement.nativeElement.querySelector("display-data-link a");
        expect(anchorEl).toBeTruthy();
        expect(anchorEl.getAttribute("href")).not.toBe(null);
    });

    /**
     * Confirm confirm store dispatch is called on click of request manifest.
     */
    it("dispatches to store on click of request manifest", () => {

        testStore.pipe
            .and.returnValues(
            of(SEARCH_TERMS_WITH_FILE_FORMAT), // search terms
            of(DEFAULT_FILE_SUMMARY), // file manifest summary
            of({
                status: ManifestStatus.NOT_STARTED
            }) // manifest response
        );

        fixture.detectChanges();

        const onRequestManifest = spyOn(component, "onRequestManifest");
        const prepareManifestButton = fixture.debugElement.query(By.css("button"));

        // Execute click on request manifest
        prepareManifestButton.triggerEventHandler("click", null);
        expect(onRequestManifest).toHaveBeenCalled();
        expect(testStore.dispatch).toHaveBeenCalled();
    });

    /**
     * Returns true if panel header is displayed.
     *
     * @param {string} panelHeaderHeading
     * @returns {boolean}
     */
    function isPanelHeaderDisplayed(panelHeaderHeading: string): boolean {

        const panelHeaderEls = fixture.debugElement.queryAll(By.css("hca-get-data-panel h4"));

        return panelHeaderEls.some(panelHeader => panelHeader.nativeElement.innerHTML === panelHeaderHeading);
    }
});
