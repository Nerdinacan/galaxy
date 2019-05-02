import { BehaviorSubject, of, from, defer, combineLatest } from "rxjs/index";
import { flatMap, tap, pluck, share, mergeMap, map, switchMap, filter, mapTo } from "rxjs/operators";
import { ajax } from 'rxjs/ajax';

import { histories, historyContent } from "./database";
import { conformToSchema, historySchema } from "./schema";

import { SearchParams } from "./SearchParams";
import { SearchFilter } from "./SearchFilter";


export class HistoryService {
    
    constructor(
        id, 
        params = new SearchParams(), 
        filter = new SearchFilter()
    ) {
        // pagination props go in, then observe
        // the generated observables .history and .contents
        this.id = new BehaviorSubject(id);
        this.params = new BehaviorSubject(params);
        this.filter = new BehaviorSubject(filter);
    }

    get historyId() {
        return this.id.value;
    }

    set historyId(newId) {
        this.id.next(newId);
    }

    get searchParams() {
        return this.params.value;
    }

    set searchParams(newParams) {
        this.params.next(newParams);
    }

    get searchFilter() {
        return this.filter.value;
    }

    set searchFilter(newFilter) {
        this.filter.next(newFilter);
    }


    // Output observables

    get history() {

        // start with the ID
        // load up { id, update_time } from server
        // compare with cache
        // if valid cache, use that, no further action
        // use distinct() to stop emission
        // otherwise load new history
        // cache new history
        // use new history, pagination to load contents
        // check each element with cache
        // if valid cache use that
        // otherwise load history content item
        // cache content item
        // buffer updates

        // // take the passed ID, pagination or search params and load
        // let historyContentsIndex = combineLatest(this.id, this.params).pipe(
        //     map(this.buildRequestUrl),
        //     mergeMap(ajax.getJSON),
        //     pluck('contents_url'),
        //     map(url => `${url}?v=dev&keys=id,update_time,url`),
        //     mergeMap(ajax.getJSON)
        // );
        
        // // split the content listing, compare update_time
        // // to cached versions, if cached too old, query
        // let splitItems = contentManifest.pipe(
        //     mergeMap(x => from(x))
        // )

        // let checkCache = combineLatest(histories, splitItems).pipe(
        //     mergeMap(inputs => )
        // )


        // return contentManifest;

    }

    // return cached contents
    // TODO: filter by this.filter and this.params
    // TODO: add specific content types to result
    get contents() {
        return historyContent.find().$;
    }

    // Utils

    buildRequestUrl([id, params]) {
        return `/api/histories/${id}`;
    }

}
