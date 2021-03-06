/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Component for displaying download citation.
 */

// Core dependencies
import { Component } from "@angular/core";

// App dependencies
import { ConfigService } from "../../../config/config.service";

@Component({
    selector: "hca-data-use-notification",
    templateUrl: "./hca-data-use-notification.component.html",
    styleUrls: ["./hca-data-use-notification.component.scss"]
})
export class HCADataUseNotificationComponent {

    // Template variables
    public portalURL: string;

    /**
     *
     * @param {ConfigService} configService
     */
    public constructor(private configService: ConfigService) {

        this.portalURL = this.configService.getPortalUrl();
    }

}
