/*
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Model of item to be included in navigation. 
 */

export interface NavItem {
    disabled?: boolean;
    display: string;
    routerLink?: string[];
    queryParams?: any;
    queryParamsHandling?: string;
    subNavItems?: NavItem[];
    tooltip?: string;
}
