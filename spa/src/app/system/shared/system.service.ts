/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Abstract base-class service for coordinating system-related functionality.
 */

// Core dependencies
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";

// App dependencies
import { ConfigService } from "../../config/config.service";
import { Catalog } from "../../files/catalog/catalog.model";
import { HttpService } from "../../files/http/http.service";
import { HealthResponse } from "./health/health-response.model";
import { HealthHttpResponse } from "./health/health-http-response.model";
import { IndexResponse } from "./index/index-response.model";
import { IndexHttpResponse } from "./index/index-http-response.model";
import { IndexRequestStatus } from "./index/index-request-status.model";
import { SystemStatusResponse } from "./system-status-response.model";
import { Injectable } from "@angular/core";

@Injectable()
export class SystemService {

    /**
     * @param {ConfigService} configService
     * @param {HttpService} httpService
     * @param {HttpClient} httpClient
     */
    constructor(
        protected configService: ConfigService,
        protected httpService: HttpService,
        protected httpClient: HttpClient) {}

    /**
     * Fetch the current system status; uses Azul API to determine overall system status as well as indexing status.
     *
     * @param {Catalog} catalog
     */
    public fetchSystemStatus(catalog: Catalog): Observable<SystemStatusResponse> {

        return this.checkIndexStatus(catalog).pipe(
            switchMap(indexResponse => {
                return of({
                    ok: indexResponse.ok,
                    indexing: indexResponse.indexing,
                    indexingStatus: indexResponse.status
                });
            })
        )
    }

    /**
     * Fetch the current Azul system status and index status.
     *
     * @param {Catalog} catalog
     * @returns {Observable<IndexResponse>}
     */
    private checkIndexStatus(catalog: Catalog): Observable<IndexResponse> {

        const url = this.configService.getIndexStatusUrl();
        const params = this.httpService.createIndexParams(catalog, {});
        return this.httpClient
            .get<IndexHttpResponse>(url, {params})
            .pipe(
                catchError(this.handleIndexError.bind(this)),
                switchMap(this.bindIndexResponse.bind(this))
            );
    }

    /**
     * Normalize download HTTP response to FE-friendly format.
     *
     * @param {HealthHttpResponse} response
     * @returns {HealthResponse}
     */
    private bindHealthResponse(response: HealthHttpResponse): Observable<HealthResponse> {

        return of({
            serviceName: response.service_name,
            ok: /*response.status === "ok" */true // Temporarily hide banner for DCP1 - see #1366.
        });
    }
    
    /**
     * Normalize download HTTP response to FE-friendly format.
     *
     * @param {IndexHttpResponse} response
     * @returns {IndexResponse}
     */
    private bindIndexResponse(response: IndexHttpResponse): Observable<IndexResponse> {

        return of({
            ok: response.up,
            indexing: this.isIndexing(response),
            status: IndexRequestStatus.COMPLETE
        });
    }

    /**
     * An error occurred during a index status check - return generalized error response (with no bundles or documents
     * currently being indexed).
     *
     * @param {HttpErrorResponse} error
     * @returns {IndexHttpResponse}
     */
    private handleIndexError(error: HttpErrorResponse): Observable<IndexHttpResponse> {

        return of({
            up: false,
            progress: {
                unindexed_bundles: 0,
                unindexed_documents: 0
            }
        });
    }

    /**
     * An error occurred during a health check - return generalized error response.
     *
     * @param {HttpErrorResponse} error
     * @returns {IndexHttpResponse}
     */
    private handleHealthError(error: HttpErrorResponse): Observable<HealthResponse> {

        return of({
            serviceName: "",
            ok: false
        });
    }

    /**
     * Convert the value of the file download status to FE-friendly value.
     *
     * @param {IndexHttpResponse} response
     * @returns {boolean}
     */
    private isIndexing(response: IndexHttpResponse): boolean {

        return response.progress.unindexed_bundles > 0 || response.progress.unindexed_documents > 0;
    }
}
