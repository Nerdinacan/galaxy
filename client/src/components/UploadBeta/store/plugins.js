import { upload } from "./loader";
import { vuexChanges } from "utils/observable/vuex";

// global subscription
let sub;

/**
 * Subscribes as plugin to store at initialization. Can't use provider mechanism because this thing
 * has to run in the background even when the dialog boxes are closed and the buttons are hidden.
 */
export const startUploader = (store) => {
    if (!sub) {
        const observables = watchStore(store);
        const result$ = upload(observables);
        sub = result$.subscribe({
            next: (result) => console.log("uploader result", result),
            error: (err) => console.warn("uploader error", err),
            complete: () => console.log("uploader completed (huh?)"),
        });
    }
};

// turns vue watches into observables for the upload processor
function watchStore(store) {
    const config$ = vuexChanges(store, (_, getters) => getters["config/config"]);
    const queue$ = vuexChanges(store, (_, getters) => getters["upload/queue"]);
    const active$ = vuexChanges(store, (state) => state.upload.active);
    return { config$, queue$, active$ };
}

/**
 * Might be handy for unit-testing
 */
export const stopUploader = () => {
    if (sub) sub.unsubscribe();
    sub = null;
};
