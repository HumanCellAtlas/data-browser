/**
 * UCSC Genomics Institute - CGL
 * https://cgl.genomics.ucsc.edu/
 *
 * Interceptor handling HTTP error responses.
 */

// Core dependencies
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from "@angular/common/http";
import { Router } from "@angular/router";
import { EMPTY, Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

// App dependencies
import { HCAHttpParameterCodec } from "./hca-http-parameter-codec";

export class HCAHttpResponseErrorInterceptor implements HttpInterceptor {

    // Constants
    private ERROR_CODE_URLS = new Map<number, string>([
        [404, "/not-found"],
        [500, "/error"]
    ]);

    /**
     * @param {Router} router
     */
    constructor(private router:  Router) {}

    /**
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error) => {

                if ( error instanceof HttpErrorResponse && this.ERROR_CODE_URLS.has(error.status) ) {
                    this.router.navigateByUrl(this.ERROR_CODE_URLS.get(error.status), {replaceUrl: true});
                    return EMPTY;
                }

                return throwError(error);
            })
        );
    }
}
