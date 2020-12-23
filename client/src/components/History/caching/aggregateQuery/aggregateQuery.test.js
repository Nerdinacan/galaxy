import { of, timer } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { ObserverSpy } from "@hirez_io/observer-spy";
import { wait } from "jest/helpers";

import { aggregateQuery } from "./aggregateQuery";
import { wipeDatabase } from "../db/pouch";
import { content$ } from "../db/observables";

import {
    cacheContent,
    getCachedContent,
    uncacheContent,
    bulkCacheContent,
    getContentByTypeId,
    bulkCacheDscContent,
} from "../db/promises";


describe("aggregateQuery", () => {

    beforeEach(wipeDatabase);
    afterAll(wipeDatabase);
    
    // Configure with a specific pouchDB collection
    // Source is a request
    // Emits complete result set by aggregating monitored changes over time

    let obs$;
    const timeoutSafeguard = 2000;

    beforeEach(async () => {

        // cache some fake content


        const fakeSelector = { history_id: 1 };
        const fakeRequest = { selector: fakeSelector };
        obs$ = of(fakeRequest).pipe(
            aggregateQuery({ db$: content$ }),
            takeUntil(timer(timeoutSafeguard)),
        );
    })

    it("should work", () => {
        expect(true).toBe(true);
    })

    
    // aggregate query against history content pouchdb instance
    xdescribe("contentQuery", () => {
    })

    // aggregate query against history content pouchdb instance
    xdescribe("dscQuery", () => {
    })

})
