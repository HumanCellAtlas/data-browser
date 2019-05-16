/**
 * Human Cell Atlas
 * https://www.humancellatlas.org/
 *
 * Table-related effects.
 */

// Core dependencies
import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action, select, Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { map, switchMap, take, withLatestFrom } from "rxjs/operators";

// App dependencies
import { AppState } from "../../../_ngrx/app.state";
import { Project } from "../../shared/project.model";
import { ProjectService } from "../../shared/project.service";
import {
    FetchPagedOrSortedTableDataRequestAction,
    FetchProjectRequestAction,
    FetchProjectSuccessAction,
} from "./table.actions";
import { FetchFileFacetsRequestAction } from "../file-facet-list/file-facet-list.actions";
import { FetchFileSummaryRequestAction } from "../file-summary/file-summary.actions";
import { FetchTableDataRequestAction } from "./fetch-table-data-request.action";
import { FetchTableDataSuccessAction } from "./fetch-table-data-success.action";
import { FetchTableModelRequestAction } from "./fetch-table-model-request.action";
import { FetchTableModelSuccessAction } from "./fetch-table-model-success.action";
import { EntityName } from "../../shared/entity-name.model";
import { SelectProjectIdAction } from "../search/select-project-id.action";
import { selectTableQueryParams } from "../file.selectors";
import { EntitySearchResults } from "../../shared/entity-search-results.model";
import { DEFAULT_TABLE_PARAMS } from "../../table/table-params.model";
import { FilesService } from "../../shared/files.service";
import { TableNextPageAction } from "./table-next-page.action";
import { TableNextPageSuccessAction } from "./table-next-page-success.action";
import { TablePreviousPageAction } from "./table-previous-page.action";
import { TablePreviousPageSuccessAction } from "./table-previous-page-success.action";

@Injectable()
export class TableEffects {

    /**
     * @param {Store<AppState>} store
     * @param {Actions} actions$
     * @param {FilesService} fileService
     * @param {ProjectService} projectService
     */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private fileService: FilesService,
                private projectService: ProjectService) {
    }

    /**
     * Grab the next page of table result set - update table model data (but not the term counts).
     */
    @Effect()
    fetchNextPagedOrSortedTableData$: Observable<Action> = this.actions$
        .pipe(
            ofType(TableNextPageAction.ACTION_TYPE),
            withLatestFrom(this.store.pipe(select(selectTableQueryParams))),
            switchMap(this.fetchPagedOrSortedTableModel.bind(this)),
            map((entitySearchResults: EntitySearchResults) =>
                new TableNextPageSuccessAction(entitySearchResults.tableModel))
        );

    /**
     * Sort order or page size of entity table has been updated, update table model data (but not the term counts).
     */
    @Effect()
    fetchPagedOrSortedTableData$: Observable<Action> = this.actions$
        .pipe(
            ofType(FetchPagedOrSortedTableDataRequestAction.ACTION_TYPE),
            switchMap((action) =>
                this.store.pipe(
                    select(selectTableQueryParams),
                    take(1),
                    map((tableQueryParams) => {
                        return {action, tableQueryParams};
                    })
                )
            ),
            switchMap(({action, tableQueryParams}) => {
                
                return this.fetchPagedOrSortedTableModel([action, tableQueryParams]).pipe(
                    map((entitySearchResults) => {
                        return {entitySearchResults, tableQueryParams};
                    })
                );
            }),
            map(({tableQueryParams, entitySearchResults}) => {

                const termCountsByFacetName = tableQueryParams.tableState.tableModels.find(tableModel => {
                    return tableModel.tableName === tableQueryParams.tableState.selectedEntity;
                }).termCountsByFacetName;
                const tableModel = entitySearchResults.tableModel;
                return new FetchTableDataSuccessAction(tableModel.data, tableModel.pagination, termCountsByFacetName);
            })
        );

    /**
     * Grab the previous page of table result set - update table model data (but not the term counts).
     */
    @Effect()
    fetchPreviousPagedOrSortedTableData$: Observable<Action> = this.actions$
        .pipe(
            ofType(TablePreviousPageAction.ACTION_TYPE),
            withLatestFrom(this.store.pipe(select(selectTableQueryParams))),
            switchMap(this.fetchPagedOrSortedTableModel.bind(this)),
            map((entitySearchResults: EntitySearchResults) =>
                new TablePreviousPageSuccessAction(entitySearchResults.tableModel))
        );

    /**
     * Trigger fetch and display of project, when selected from the project table.
     */
    @Effect()
    fetchProject: Observable<Action> = this.actions$
        .pipe(
            ofType(FetchProjectRequestAction.ACTION_TYPE),
            switchMap((action: FetchProjectRequestAction) => this.projectService.fetchProjectById(action.projectId)),
            map((project: Project) => new FetchProjectSuccessAction(project))
        );

    /**
     * Fetch table data, to update table data and corresponding pagination details. Update to term counts is not required.
     */
    @Effect()
    fetchTableData$: Observable<Action> = this.actions$
        .pipe(
            ofType(FetchTableDataRequestAction.ACTION_TYPE),
            switchMap((action) => this.store.pipe(
                select(selectTableQueryParams),
                take(1),
                map((tableQueryParams) => {
                    return {action, tableQueryParams};
                })
            )),
            switchMap(({action, tableQueryParams}) => {

                // Reset the pagination but keep the set page size if it was changed.
                let tableParams = Object.assign(
                    DEFAULT_TABLE_PARAMS,
                    {
                        size: tableQueryParams.pagination.size,
                        sort: tableQueryParams.pagination.sort,
                        order: tableQueryParams.pagination.order
                    });

                const selectedSearchTermsBySearchKey = tableQueryParams.selectedSearchTermsBySearchKey;
                const selectedEntity = tableQueryParams.tableState.selectedEntity;
                const filterableByProject = (selectedEntity !== EntityName.PROJECTS);
                return this.fileService.fetchEntitySearchResults(
                    selectedSearchTermsBySearchKey, tableParams, selectedEntity, filterableByProject)
                    .pipe(
                        map((entitySearchResults) => {
                            return {action, entitySearchResults};
                        })
                    );
            }),
            map(({action, entitySearchResults}) =>
                new FetchTableDataSuccessAction(
                    entitySearchResults.tableModel.data,
                    entitySearchResults.tableModel.pagination,
                    (action as FetchTableDataRequestAction).termCountsByFacetName))
        );

    /**
     * Fetch table model, to update table data and corresponding pagination details and term counts.
     */
    @Effect()
    fetchTableModel$: Observable<Action> = this.actions$
        .pipe(
            ofType(FetchTableModelRequestAction.ACTION_TYPE),
            switchMap(() => this.store.pipe(
                select(selectTableQueryParams),
                take(1)
            )),
            switchMap((tableQueryParams) => {

                // Reset the pagination but keep the set page size if it was changed.
                let tableParams = Object.assign(
                    DEFAULT_TABLE_PARAMS,
                    {
                        size: tableQueryParams.pagination.size,
                        sort: tableQueryParams.pagination.sort,
                        order: tableQueryParams.pagination.order
                    });

                const selectedSearchTermsBySearchKey = tableQueryParams.selectedSearchTermsBySearchKey;
                const selectedEntity = tableQueryParams.tableState.selectedEntity;
                return this.fileService.fetchEntitySearchResults(
                    selectedSearchTermsBySearchKey, tableParams, selectedEntity, (selectedEntity !== EntityName.PROJECTS));
            }),
            map((entitySearchResults: EntitySearchResults) =>
                new FetchTableModelSuccessAction(entitySearchResults.tableModel))
        );

    /**
     * Trigger fetch of facets and summary counts on select of project.
     */
    @Effect()
    selectProject$: Observable<Action> = this.actions$
        .pipe(
            ofType(SelectProjectIdAction.ACTION_TYPE),
            switchMap(() =>
                this.store.pipe(
                    select(selectTableQueryParams),
                    take(1)
                )
            ),
            switchMap((tableQueryParams) => {

                // Return an array of actions that need to be dispatched - request for file summary and file facets.
                return of(
                    // Request summary
                    new FetchFileSummaryRequestAction(),
                    // Request facets
                    new FetchFileFacetsRequestAction(tableQueryParams.tableState.selectedEntity !== EntityName.PROJECTS)
                );
            })
        );

    /**
     * Fetch the paged/sorted table data and map to appropriate format for FE.
     *
     * @param {[FetchPagedOrSortedTableDataRequestAction | TableNextPageAction | TablePreviousPageAction,
     * Map<string, FileFacet> & PaginationModel & TableState]} [action, tableQueryParams]
     * @returns {Observable<EntitySearchResults>}
     */
    private fetchPagedOrSortedTableModel([action , tableQueryParams]): Observable<EntitySearchResults> {

        const selectedSearchTermsByFacetName = tableQueryParams.selectedSearchTermsBySearchKey;
        const tableParams = action.tableParams;
        const selectedEntity = tableQueryParams.tableState.selectedEntity;
        return this.fileService.fetchEntitySearchResults(
            selectedSearchTermsByFacetName, tableParams, selectedEntity, (selectedEntity !== EntityName.PROJECTS));
    }
}