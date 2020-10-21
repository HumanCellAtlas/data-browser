/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Component for displaying key value pair.
 */

// Core dependencies
import { Component, Input } from "@angular/core";

// App dependencies
import { KeyValuePair } from "./key-value-pair.model";

@Component({
    selector: "key-value-pair",
    templateUrl: "./key-value-pair.component.html",
    styleUrls: ["./key-value-pair.component.scss"]
})
export class KeyValuePairComponent {

    // Inputs
    @Input() keyValuePairs: KeyValuePair[];
    @Input() title: string;

    /**
     * Returns display text when there are no key value pairs.
     * 
     * @param {string} title
     * @returns {string}
     */
    public getEmptyDisplayText(title: string): string {

        const titleSentenceCase = title.toLowerCase();
        return `There are no ${titleSentenceCase} for this project.`;
    } 

    /**
     * Returns true if value is an array.
     *
     * @param value
     * @returns {boolean}
     */
    public isMultiValue(value: string | string[]): boolean {

        return Array.isArray(value);
    }
}
