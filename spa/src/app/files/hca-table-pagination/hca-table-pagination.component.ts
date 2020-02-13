/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Table pagination component.
 */


// Core dependencies
import { Component, Input, OnInit } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";

// App dependencies
import { AppState } from "../../_ngrx/app.state";
import { selectPagination } from "../_ngrx/file.selectors";
import {
    FetchPagedOrSortedTableDataRequestAction
} from "../_ngrx/table/table.actions";
import { TableNextPageAction } from "../_ngrx/table/table-next-page.action";
import { TablePreviousPageAction } from "../_ngrx/table/table-previous-page.action";
import { PaginationModel } from "../table/pagination.model";
import { TableParamsModel } from "../table/table-params.model";

@Component({
    selector: "hca-table-pagination",
    templateUrl: "./hca-table-pagination.component.html",
    styleUrls: ["./hca-table-pagination.component.scss"]
})

export class HCATablePaginationComponent implements OnInit {

    // Template variables
    pagination$: Observable<PaginationModel>;

    // Inputs
    @Input() tableData: any[];

    /**
     * @param {Store<AppState>} store
     */
    constructor(private store: Store<AppState>) {
    }

    /**
     * Public API
     */

    /**
     * Called when table next page selected.
     *
     * @param {PaginationModel} pm
     */
    public nextPageSelected(pm: PaginationModel) {

        if ( !this.hasNext(pm) ) {
            return;
        }

        let tableParamsModel = {

            search_after: pm.search_after,
            search_after_uid: pm.search_after_uid,
            size: pm.size,
            sort: pm.sort,
            order: pm.order
        };

        this.store.dispatch(new TableNextPageAction(tableParamsModel));
    }

    /**
     * Called when table previous page selected.
     *
     * @param {PaginationModel} pm
     */
    public previousPageSelected(pm: PaginationModel) {


        if ( !this.hasPrevious(pm) ) {
            return;
        }

        let tableParamsModel = {

            search_before: pm.search_before,
            search_before_uid: pm.search_before_uid,
            size: pm.size,
            sort: pm.sort,
            order: pm.order
        };

        this.store.dispatch(new TablePreviousPageAction(tableParamsModel));
    }

    /**
     * Sort the table given the sort param and the order.
     *
     * @param {PaginationModel} pm
     * @param {Sort} sort
     */
    public sortTable(pm: PaginationModel, sort: Sort) {

        let tableParamsModel: TableParamsModel = {
            size: pm.size,
            sort: sort.active,
            order: sort.direction
        };

        this.store.dispatch(new FetchPagedOrSortedTableDataRequestAction(tableParamsModel));
    }

    /**
     * Check if there is a next page. Use search_after_uid and not search_after as null is a valid value for
     * search_after.
     *
     * @param {PaginationModel} pm
     * @returns {boolean}
     */
    public hasNext(pm: PaginationModel): boolean {
        return pm.search_after_uid !== null;
    }

    /**
     * Check if there is a previous page. Use search_before_uid and not search_before as null is a valid value for
     * search_before.
     *
     * @param {PaginationModel} pm
     * @returns {boolean}
     */
    public hasPrevious(pm: PaginationModel): boolean {
        return pm.search_before_uid !== null;
    }

    /**
     * Return the total number of pages.
     *
     * @param {PaginationModel} pm
     * @returns {number}
     */
    getPageCount(pm: PaginationModel) {
        return Math.ceil(pm.total / pm.size);
    }

    getPages(pm: PaginationModel): number[] {

        let pages = [];
        let pageCount = this.getPageCount(pm);

        for ( let i = 1; i <= pageCount; i++ ) {
            pages.push(i);
        }

        return pages;
    }

    /**
     * Sets the number of rows per page.
     *
     * @param {PaginationModel} pm
     * @returns {number} pageSize
     */
    public setPageSize(pm: PaginationModel, pageSize: number) {

        let tableParamsModel: TableParamsModel = {
            size: pageSize,
            sort: pm.sort,
            order: pm.order
        };

        this.store.dispatch(new FetchPagedOrSortedTableDataRequestAction(tableParamsModel));
    }

    /**
     * Lifecycle hooks
     */

    /**
     *  Set up pagination
     */
    ngOnInit() {

        // Get an observable of the pagination model
        this.pagination$ = this.store.pipe(select(selectPagination));
    }
}
