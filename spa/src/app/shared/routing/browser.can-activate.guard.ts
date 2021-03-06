/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Determines if current browser is supported and if so, allows navigation to continue. If browser is not supported,
 * exits out of Angular and loads BNS page by updating the address bar.
 */

// Core dependencies
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { DeviceDetectorService } from "ngx-device-detector";

@Injectable()
export class BrowserCanActivateGuard implements CanActivate {

    /**
     * @param {DeviceDetectorService} deviceService
     */
    constructor(private deviceService: DeviceDetectorService) {}

    /**
     * @param {ActivatedRouteSnapshot} activatedRouteSnapshot
     * @param {RouterStateSnapshot} routerStateSnapshot
     * @returns {boolean}
     */
    canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot): boolean {

        return this.isBrowserSupported();
    }

    /**
     * Returns true if browser is supported.
     *
     * @returns {boolean}
     */
    private isBrowserSupported(): boolean {

        // Display browser not supported for Internet Explorer.
        if ( this.deviceService.browser === "IE" ) {

            window.location.href = "/static/browser-not-supported.html";
            return false;
        }

        return true;
    }
}
