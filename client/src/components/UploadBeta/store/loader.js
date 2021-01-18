/**
 * Monitors uploa queue in Vuex, sends new files to server, records progress
 */

import { pipe, of, from, NEVER, merge, Subject, partition } from "rxjs";
import {
    tap,
    switchMap,
    groupBy,
    mergeMap,
    withLatestFrom,
    expand,
    debounceTime,
    map,
    finalize,
    distinctUntilChanged,
    filter,
    takeUntil,
} from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { prependPath } from "utils/redirect";
import STATUS from "../status";

const itemStatusMatch = (a, b) => a.status.id == b.status.id;
const inStatus = (item, status) => item.status.id == status.id;

// prettier-ignore
export const upload = (inputs) => {
    
    // config$: application configuration
    // queue$: list of stuff from the store
    // active$: pause/play, overall
    const { config$, queue$, active$ } = inputs;

    // split queue into individual queue items
    const items$ = queue$.pipe(mergeMap((list) => from(list)));

    // deal with events for each file individually
    // https://www.youtube.com/watch?v=hsr4ArAsOL4
    const itemByFile$ = items$.pipe(
        groupBy((item) => item.file),
        mergeMap((fileItem$) => {
            console.log("new fileItem subgroup", fileItem$.key);

            // only care when the status changes
            const statusChange$ = fileItem$.pipe(
                distinctUntilChanged(itemStatusMatch)
            );

            // start/stop events, others kind of don't matter here
            const start$ = statusChange$.pipe(
                filter(item => inStatus(item, STATUS.INIT))
            );
            const pause$ = statusChange$.pipe(
                filter(item => inStatus(item, STATUS.PAUSED))
            );

            return start$.pipe(
                withLatestFrom(config$),
                startUpload(),
                takeUntil(pause$)
            );
        })
    );

    return active$.pipe(
        switchMap((isOn) => (isOn ? itemByFile$ : NEVER))
    );
};

const startUpload = () => {
    return pipe(
        map((inputs) => {
            const [item, config] = inputs;
            console.log("starting upload!", item.file.name);
            return of(inputs);
        }),
        finalize(() => {
            console.log("cancelled upload");
        })
    );
};

// create ajax config for uploading a chunk of one file
// gets called recursively until the file is done

const createChunkRequest = (item, config) => {
    const { file } = item;
    const { session, chunk_size } = config;
    const session_id = `${session.id}-${new Date().valueOf()}-${file.size}`;
    const method = "POST";
    const url = prependPath("/api/uploads");
    const headers = {
        "Cache-Control": "no-cache",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    };

    return (start) => {
        const end = Math.min(start + chunk_size, file.size);

        const body = new FormData();
        body.append("session_id", session_id);
        body.append("session_start", start);
        body.append("session_chunk", file.slice(start, end));

        return { method, url, headers, body };
    };
};

// Build upload config for a single file

function createSingleRequest(item, config) {
    const { file, options } = item;

    const method = "POST"; // put?
    const url = prependPath("/api/tools");
    const headers = { Accept: "application/json" };

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

    const body = new FormData();
    body.set("tool_id", options.tool_id);
    body.set("history_id", options.targetHistory.id);
    body.set("inputs", JSON.stringify(inputs));
    body.set("files_0|file_data", file, file.name);

    return { method, url, headers, body };
}

// const progressSubscriber = new Subject();
// const reqConfig = unChunkedUploadConfig(item, config);
// const request$ = doUpload(requestConfig);
// const request$ = ajax({ ...reqConfig, progressSubscriber });
// // axios version, better multipart form support
// // const onUploadProgress = (evt) => progressSubscriber.next(evt);
// // const p = axios.post(url, body, { headers, onUploadProgress });
// // const request$ = from(p);
// return merge(progressSubscriber, request$);
