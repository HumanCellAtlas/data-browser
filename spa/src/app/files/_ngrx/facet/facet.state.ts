/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Model of facet state and related selected facet terms states. Facet state includes all facet types: file facets a 
 * well as age range facets. Also contains convenience maps for querying state and a boolean indicating if current
 * search terms yield any results that are matrixable.
 */

// App dependencies
import { SelectFileFacetTermAction } from "../search/select-file-facet-term.action";
import { SetViewStateAction } from "./set-view-state.action";
import { FileFacet } from "../../facet/file-facet/file-facet.model";
import { Term } from "../../shared/term.model";
import { PaginationModel } from "../../table/pagination.model";
import { FetchIsMatrixSupportedSuccessAction } from "./fetch-is-matrix-supported-success.action";
import { FetchFacetsSuccessAction } from "./fetch-facets-success-action.action";
import { Facet } from "../../facet/facet.model";
import { FacetAgeRange } from "../../facet/facet-age-range/facet-age-range.model";
import { QueryStringSearchTerm } from "../../search/url/query-string-search-term.model";
import { FacetAgeRangeName } from "../../facet/facet-age-range/facet-age-range-name.model";
import { AgeRange } from "../../facet/facet-age-range/age-range.model";
import { ClearSelectedAgeRangeAction } from "../search/clear-selected-age-range.action";
import { SelectFacetAgeRangeAction } from "../search/select-facet-age-range.action";

export class FacetState {

    public readonly facets: Facet[];
    public readonly fileFacets: FileFacet[]; // Subset of facets, containing only facets of type file facet
    public readonly selectedFacet: Facet; // Facet currently being edited.
    public readonly matrixSupported: boolean;
    public readonly paginationModel: PaginationModel;

    private readonly facetNames: string[];
    private readonly facetsByName: Map<string, Facet>;

    /**
     * @param {string[]} facetNames
     * @param {Map<string, Facet>} facetsByName
     * @param {Facet} selectedFacet
     * @param {PaginationModel} paginationModel
     * @param {matrixSupported} matrixSupported
     */
    constructor(facetNames: string[],
                facetsByName: Map<string, Facet>,
                selectedFacet: Facet,
                paginationModel: PaginationModel,
                matrixSupported: boolean) {

        this.facetNames = facetNames;
        this.facetsByName = facetsByName;
        this.selectedFacet = selectedFacet;
        
        // TODO set default pagination model if undefined
        this.paginationModel = paginationModel;

        this.facets = this.facetNames.map((facetName) => {
            return this.facetsByName.get(facetName);
        });
        
        // Set up subset of facets containing only file facets. Used mainly by matrix functionality when checking set
        // of selected terms for specific file facets (species, library construction approach etc).
        this.fileFacets = this.facets.filter(facet => facet instanceof FileFacet) as FileFacet[];

        this.matrixSupported = matrixSupported;
    }

    /**
     * Create default state of file facet list - empty list of file facets, no selected facets, no pagination state.
     *
     * @returns {FacetState}
     */
    public static getDefaultState() {
        return new FacetState(
            [],
            new Map<string, FileFacet>(),
            undefined,
            undefined,
            undefined);
    }

    /**
     * Clear the specified age range.
     * 
     * @returns {FacetState}
     */
    public clearAgeRange(action: ClearSelectedAgeRangeAction): FacetState {

        const facetName = action.facetName;

        // Get current state of facet
        const newSelectedFacet = this.facetsByName.get(facetName);

        const fileFacetsByName = new Map<string, Facet>();
        this.facetsByName.forEach((f) => {

            // Ignore facets that aren't file facets, or file facets that aren't the selected facet
            if ( f.name === facetName) {
                fileFacetsByName.set(f.name, (f as FacetAgeRange).clearAgeRange());
            }
            else {
                fileFacetsByName.set(f.name, f);
            }
        });

        // Update selected file facet - check if user has selected a term from a facet different from the previously
        // selected term and if so, update the selected facet.
        const selectedFacet = this.determineSelectedFacet(this.selectedFacet, newSelectedFacet);

        return new FacetState(
            this.facetNames, fileFacetsByName, selectedFacet, this.paginationModel, this.matrixSupported);
    }

    /**
     * Clear the matrixable search results.
     * 
     * @returns {FacetState}
     */
    public clearMatrixableSearchResults(): FacetState {

        return new FacetState(
            this.facetNames, this.facetsByName, this.selectedFacet, this.paginationModel, undefined);
    }

    /**
     * Return model of the current state of the file facet list (including pagination)
     *
     * @returns {FacetState}
     */
    public requestFileFacets(): FacetState {

        return new FacetState(
            this.facetNames, this.facetsByName, this.selectedFacet, this.paginationModel, this.matrixSupported);
    }

    /**
     * Handle updated list of fileFacets that have been returned from the server end point.
     *
     * @param {FetchFacetsSuccessAction} action
     * @returns {FacetState}
     */
    public receiveFileFacets(action: FetchFacetsSuccessAction): FacetState {

        return new FacetState(
            FacetState.createFacetNames(action.facets),
            FacetState.createFacetsMap(action.facets),
            this.selectedFacet,
            this.paginationModel,
            this.matrixSupported);
    }

    /**
     * Matrixable state of data has been returned from server.
     *
     * @param {FetchIsMatrixSupportedSuccessAction} action
     */
    public receiveMatrixSupported(action: FetchIsMatrixSupportedSuccessAction): FacetState {

        return new FacetState(
            this.facetNames,
            this.facetsByName,
            this.selectedFacet,
            this.paginationModel,
            action.matrixableSearchResults);
    }

    /**
     * Matrixable search results has been requested from server.
     */
    public requestMatrixSupported(): FacetState {

        return new FacetState(
            this.facetNames,
            this.facetsByName,
            this.selectedFacet,
            this.paginationModel,
            this.matrixSupported)
    }

    /**
     * Handle select/deselect of facet term - create new file facet list state based on selected facet (term) action.
     *
     * @param {SelectFileFacetTermAction} action
     * @returns {FacetState}
     */
    public selectTerm(action: SelectFileFacetTermAction): FacetState {

        const facetName = action.facetName;
        const termName = action.getTermKey();

        // Get current state of facet
        const newSelectedFacet = this.facetsByName.get(facetName);

        // Error case - just return the current state.
        if ( !newSelectedFacet ) {
            return this;
        }

        // Update selected indicator on selected term - find the facet with the term that was selected and update term's
        // selected flag.
        const fileFacetsByName = new Map<string, Facet>();
        this.facetsByName.forEach((f) => {
            
            // Ignore facets that aren't file facets, or file facets that aren't the selected facet
            if ( !(f instanceof FileFacet) || f.name !== facetName) {
                fileFacetsByName.set(f.name, f);
            }
            else {
                fileFacetsByName.set(f.name, f.selectTerm(termName));
            }

        });

        // Update selected file facet - check if user has selected a term from a facet different from the previously
        // selected term and if so, update the selected facet.
        const selectedFacet = this.determineSelectedFacet(this.selectedFacet, newSelectedFacet);

        // Return new state of file facet list (ie with newly selected/deselected term and potentially newly selected
        // facet).
        return new FacetState(
            this.facetNames, fileFacetsByName, selectedFacet, this.paginationModel, this.matrixSupported);
    }

    /**
     * Handle set of age range facet.
     * 
     * @param {SelectFacetAgeRangeAction} action
     * @returns {FacetState}
     */
    public setAgeRange(action: SelectFacetAgeRangeAction): FacetState {

        const facetName = action.facetName;

        // Get current state of facet
        const newSelectedFacet = this.facetsByName.get(facetName);
        
        const fileFacetsByName = new Map<string, Facet>();
        this.facetsByName.forEach((f) => {

            // Ignore facets that aren't file facets, or file facets that aren't the selected facet
            if ( f.name === facetName) {
                fileFacetsByName.set(f.name, (f as FacetAgeRange).setAgeRange(action.ageRange));
            }
            else {
                fileFacetsByName.set(f.name, f);
            }
        });

        // Update selected file facet - check if user has selected a term from a facet different from the previously
        // selected term and if so, update the selected facet.
        const selectedFacet = this.determineSelectedFacet(this.selectedFacet, newSelectedFacet);
        
        return new FacetState(
            this.facetNames, fileFacetsByName, selectedFacet, this.paginationModel, this.matrixSupported);
    }

    /**
     * Handle select of facet values on init of app. App state is pulled from URL params and we must convert this to
     * a set of selected facet terms or age ranges, if any.
     *
     * @param {SetViewStateAction} action
     * @returns {FacetState}
     */
    public setSelectedFacetTermsFromViewState(action: SetViewStateAction): FacetState {

        // Update new state with selected terms
        const selectedFacetStates = action.selectedSearchTerms;

        // Create file facet names
        const fileFacetNames = selectedFacetStates.map((selectedFacetState: QueryStringSearchTerm) => {
            return selectedFacetState.facetName;
        });

        // Create facets from query string search terms, and add to map
        const fileFacetsMap = selectedFacetStates.reduce((accum, queryStringSearchTerm: QueryStringSearchTerm) => {

            const facetName = queryStringSearchTerm.facetName;
            if ( queryStringSearchTerm.facetName === FacetAgeRangeName.ORGANISM_AGE_RANGE ) {
                accum.set(facetName, this.buildFacetAgeRangeFromQueryString(queryStringSearchTerm));
            }
            else {
                accum.set(facetName, this.buildFileFacetFromQueryString(queryStringSearchTerm));
                
            }

            return accum;
        }, new Map<string, Facet>());

        return new FacetState(fileFacetNames, fileFacetsMap, null, null, undefined);
    }
    
    /*
     * Build facet age range from query string search term.
     * 
     * @param {QueryStringSearchTerm} queryStringSearchTerm
     * @returns {FacetAgeRange}
     */
    private buildFacetAgeRangeFromQueryString(queryStringSearchTerm: QueryStringSearchTerm): FacetAgeRange {

        // We currently only support a single age range.
        return new FacetAgeRange(queryStringSearchTerm.facetName, queryStringSearchTerm.value[0] as AgeRange);
    }

    /**
     * Build file facet from query string search term.
     *
     * @param {QueryStringSearchTerm} queryStringSearchTerm
     * @returns {FileFacet}
     */
    private buildFileFacetFromQueryString(queryStringSearchTerm: QueryStringSearchTerm): FileFacet {

        // Create the terms for this file facet. Term has been specified in the URL as selected so set the selected
        // flag accordingly.
        const terms = queryStringSearchTerm.value.map((termName: string) => {
            return new Term(termName, 0, true);
        });

        // Create the file facet, set total and short list length to 0; these values will be updated on the initial
        // request of file facet data from the server.
        return new FileFacet(queryStringSearchTerm.facetName, 0, terms);
    }

    /**
     * Convert array of facets into a map of facets keyed by facet name.
     *
     * @param {Facet[]} facets
     * @returns {Map<string, Facet>}
     */
    private static createFacetsMap(facets: Facet[]): Map<string, Facet> {

        return facets.reduce((acc: Map<string, Facet>, facet: Facet): Map<string, Facet> => {
            acc.set(facet.name, facet);
            return acc;
        }, new Map<string, Facet>());
    }

    /**
     * Convert array of file fileFacets into an array of file facet names
     *
     * @param {Facet[]} facets
     * @returns {string[]}
     */
    private static createFacetNames(facets: Facet[]): string[] {

        return facets.map((facet) => {
            return facet.name;
        });
    }

    /**
     * Check if user has selected a term from a facet different from the previously selected term and if so, we'll need
     * to update the selected facet.
     * 
     * @param {Facet} currentSelectedFacet
     * @param {Facet} newSelectedFacet
     */
    private determineSelectedFacet(currentSelectedFacet: Facet, newSelectedFacet: Facet) {

        // We're working on the same selected facet
        if ( this.selectedFacet && (newSelectedFacet.name === this.selectedFacet.name) ) {
            return this.selectedFacet;
        }
        
        // We're working on a new facet
        return newSelectedFacet;
    }
}
