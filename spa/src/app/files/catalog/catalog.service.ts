/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Service for coordinating catalog-related functionality.
 */

// Core dependencies
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { select, Store } from "@ngrx/store";
import { Observable, of, throwError } from "rxjs";
import { catchError, filter, retry, switchMap, take } from "rxjs/operators";

// App dependencies
import { Atlas } from "../atlas/atlas.model";
import { CatalogsAPIResponse } from "./catalogs-api-response.model";
import { ConfigService } from "../../config/config.service";
import { AppState } from "../../_ngrx/app.state";
import { selectCatalogsInit } from "../_ngrx/catalog/catalog.selectors";
import { FetchCatalogsRequestAction } from "../_ngrx/catalog/fetch-catalogs-request.action";

@Injectable()
export class CatalogService {

    /**
     * @param {ConfigService} configService
     * @param {Store<AppState>} store
     * @param {HttpClient} httpClient
     */
    constructor(private configService: ConfigService, private store: Store<AppState>, private httpClient: HttpClient) {}

    /**
     * Fetch catalogs from Azul and filter by the atlas for the current instance.
     *
     * @returns {Observable<Atlas>}
     */
    public fetchCatalogs(): Observable<Atlas> {

        return this.httpClient
            .get<CatalogsAPIResponse>(this.configService.getCatalogsUrl())
            .pipe(
                retry(2),
                catchError(this.handleCatalogsAPIResponseError.bind(this)),
                switchMap(this.bindCatalogsAPIResponse.bind(this))
            );
    }

    /**
     * Control flow of catalog init during app init. Kick of request for catalog values from Azul and wait for response
     * before allowing app init to continue.
     *
     * @returns {Promise<void>}
     */
    public initCatalogs(): Promise<void> {

        this.store.dispatch(new FetchCatalogsRequestAction());
        return new Promise((resolve) => {

            this.store.pipe(
                select(selectCatalogsInit),
                filter(catalog => catalog),
                take(1)
            ).subscribe(() => {
                resolve();
            })
        });
    }

    /**
     * Convert API response to FE format.
     *
     * @param {CatalogsAPIResponse} response
     * @returns {Observable<Atlas>}
     */
    private bindCatalogsAPIResponse(response: CatalogsAPIResponse): Observable<Atlas> {

        const atlasName = this.configService.getAtlas();
        const { catalogs: allCatalogs } = response;
        const atlasCatalogs = this.bindAtlasCatalogs(atlasName, allCatalogs);

        // Error if no catalogs are returned for the current atlas.
        if ( atlasCatalogs.length === 0 ) {
            return throwError(`No catalogs found for atlas "${atlasName}".`);
        }
        
        // Confirm the default catalog for the environment is included in the set of returned catalogs for the atlas
        const defaultCatalog = this.configService.getDefaultCatalog();
        const validCatalog = atlasCatalogs.some(atlasCatalog => atlasCatalog.catalog === defaultCatalog);
        if ( !validCatalog ) {
            return throwError(`Invalid default catalog "${defaultCatalog}" for atlas "${atlasName}".`);
        }

        return of({
            catalogs: atlasCatalogs.map(atlasCatalog => atlasCatalog.catalog),
            defaultCatalog
        });
    }

    /**
     * Remove catalogs that do not apply to the current atlas. Convert catalog API response format to string values
     * containing catalog name only.
     *
     * @param {string} atlas
     * @param {any} allCatalogs
     * @returns {any[]}
     */
    private bindAtlasCatalogs(atlas: string, allCatalogs: any): any[] {

        return Array.from(Object.keys(allCatalogs).reduce((accum, catalogKey) => {

            const catalog = allCatalogs[catalogKey];
            if ( catalog.atlas === atlas ) {
                accum.push({
                    catalog: catalogKey,
                    internal: catalog.internal
                });
            }
            return accum;
        }, []));
    }

    /**
     * An error occurred during the request for catalogs: create dummy response object with error values to indicate
     * error state.
     *
     * @returns {CatalogsAPIResponse}
     */
    private handleCatalogsAPIResponseError(): Observable<CatalogsAPIResponse> {

        return of({
            catalogs: [],
            default_catalog: ""
        });
    }
}
