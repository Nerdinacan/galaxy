/**
 * Monitors uploa queue in Vuex, sends new files to server, records progress
 */

import { from, NEVER, merge, Subject } from "rxjs";
import { switchMap, groupBy, mergeMap, withLatestFrom, concatMap, debounceTime } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { vuexChanges } from "utils/observable/vuex";
import { prependPath } from "utils/redirect";
// import STATUS from "../status";

// prettier-ignore
export const upload = ($store) => {
    
    // imortant stuff from the store
    const config$ = vuexChanges($store, (_, getters) => getters["config/config"]);
    const queue$ = vuexChanges($store, (_, getters) => getters["upload/queue"]);
    const active$ = vuexChanges($store, state => state.upload.active);

    const items$ = queue$.pipe(
        // split queue array into individual updates
        mergeMap((list) => from(list)),
        // group by file
        // https://www.youtube.com/watch?v=hsr4ArAsOL4
        groupBy(
            (item) => item.file,
            (item) => item,
            (item$) => item$.pipe(debounceTime(2000))
        ),
        // deal with file changes individually (concatMap instead?)
        mergeMap((item$) => item$.pipe(
            withLatestFrom(config$),
            mergeMap((inputs) => createUpload$(...inputs))
        ))
    );
    
    return active$.pipe(
        switchMap((isOn) => (isOn ? items$ : NEVER))
    );
};

// Create an observable that loads the indicated item (i.e. file), emitting however many progress
// events are required, doing whatever chunking is deemed necessary.
const createUpload$ = (item, config) => {
    // NOTE, only works for small files
    // see utils/uploadbox.js

    // TODO: break file into multiple chunks
    // which load to /api/uploads and then
    // run the /api/tools thing at the end

    debugger;

    const progressSubscriber = new Subject();
    const reqConfig = unChunkedUploadConfig(item, config);
    const request$ = ajax({ ...reqConfig, progressSubscriber });

    // axios version, better multipart form support
    // const onUploadProgress = (evt) => progressSubscriber.next(evt);
    // const p = axios.post(url, body, { headers, onUploadProgress });
    // const request$ = from(p);

    return merge(progressSubscriber, request$);
};

// ajax upload config for a single unchunked file

const unChunkedUploadConfig = (item, config) => {
    const { file, options } = item;

    const method = "POST"; // put?
    const url = prependPath("/api/tools");
    const headers = { Accept: "application/json" };

    const body = new FormData();
    body.set("tool_id", options.tool_id);
    body.set("history_id", options.targetHistory.id);

    // What is up with this field format?
    const inputs = {
        file_count: 1,
        dbkey: "?",
        file_type: "auto",
        "files_0|type": "upload_dataset",
        "files_0|NAME": options.name || file.name,
        "files_0|space_to_tab": options.space_to_tab ? "Yes" : null, // WTAF?
        "files_0|to_posix_lines": options.to_posix_lines ? "Yes" : null, // WTAF?
        "files_0|dbkey": "?",
        "files_0|file_type": "auto",
    };

    body.set("inputs", JSON.stringify(inputs));
    body.set("files_0|file_data", file, file.name);

    return { method, url, headers, body };
};
