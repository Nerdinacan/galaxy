// Sync Galaxy store to legacy galaxy current history

import { getGalaxyInstance } from "app";
import { switchMap, pluck } from "rxjs/operators";
import { waitForInit } from "utils/observable/waitForInit";
import { monitorBackboneModel } from "utils/observable/monitorBackboneModel";

// prettier-ignore
export function syncCurrentHistoryToGalaxy(handler) {

    // wait for the current history panel to appear
    const currentHistoryPanel$ = waitForInit(() => {
        return getGalaxyInstance()?.currHistoryPanel?.model;
    });

    const id$ = currentHistoryPanel$.pipe(
        switchMap(model => monitorBackboneModel(model)),
        pluck("id")
    );

    return id$.subscribe(
        val => handler(val),
        err => console.log("syncCurrentHistoryToGalaxy error", err),
        () => console.log("syncCurrentHistoryToGalaxy complete")
    );
}
