// Sync Galaxy store to legacy galaxy config variable

import { getGalaxyInstance } from "app";
import { waitForInit } from "utils/observable/waitForInit";

// prettier-ignore
export function syncConfigToGalaxy(handler) {

    // wait for galaxy.config to appear, only needs to run once
    const cfg$ = waitForInit(() => {
        return getGalaxyInstance()?.config;
    });

    return cfg$.subscribe(
        val => handler(val),
        err => console.log("syncConfigToGalaxy error", err),
        () => console.log("syncConfigToGalaxy complete")
    );
}
