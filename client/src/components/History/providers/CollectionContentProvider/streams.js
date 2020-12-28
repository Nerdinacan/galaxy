import { NEVER, merge, combineLatest } from "rxjs";
import { map, pluck, switchMap, distinctUntilChanged, share, shareReplay, mapTo, debounceTime } from "rxjs/operators";
import { tag } from "rxjs-spy/operators/tag";
import { activity } from "utils/observable/activity";
import { chunk } from "../../caching/operators/chunk";

import { watchCollectionCache } from "./watchCollectionCache";
import { loadCollectionContents } from "./loadCollectionContents";
import { inputsSame, scrollPosEquals } from "../utils";

// prettier-ignore
export function buildCollectionStreams(obs, settings) {
    const { debouncePeriod, pageSize } = settings;
    const [ dsc$, params$, userScrollPos$ ] = obs;

    //#region Pre-process input streams

    const dscParams$ = combineLatest([dsc$, params$]).pipe(
        debounceTime(0),
        shareReplay(1)
    );

    const totalMatches$ = dsc$.pipe(
        pluck("totalElements"),
    );

    //#endregion

    //#region Scrolling

    const initScrollPos$ = dscParams$.pipe(
        mapTo({ cursor: 0.0, key: null })
    );

    const scrollPos$ = merge(initScrollPos$, userScrollPos$).pipe(
        distinctUntilChanged(scrollPosEquals),
        shareReplay(1)
    );

    //#endregion

    //#region Scrolling activity indicator

    const scrolling$ = scrollPos$.pipe(
        activity({ period: debouncePeriod }),
        shareReplay(1)
    );

    //#endregion

    //#region Estimate element index from cursor + dsc

    const calculatedIndex$ = combineLatest([scrollPos$, totalMatches$]).pipe(
        debounceTime(0),
        map(([pos, totalMatches]) => getIndexFromPos(pos, totalMatches)),
        tag("CollectionContentProvider-calculatedIndex")
    );

    const cursor$ = scrolling$.pipe(
        switchMap((isScrolling) => (isScrolling ? NEVER : calculatedIndex$)),
        tag("CollectionContentProvider-cursor")
    );

    //#endregion

    //#region Loading

    const loadCursor$ = cursor$.pipe(
        chunk(pageSize),
    );

    const loadInputs$ = combineLatest([dscParams$, loadCursor$]).pipe(
        debounceTime(0),
        shareReplay(1)
    );

    const loadInputsThrottled$ = scrolling$.pipe(
        switchMap((isScrolling) => (isScrolling ? NEVER : loadInputs$)),
        distinctUntilChanged(([inputsA, idxA], [inputsB, idxB]) => {
            return idxA == idxB && inputsSame(inputsA, inputsB);
        }),
        map(([inputs, idx]) => [...inputs, idx]),
        share()
    );

    const loader$ = loadInputsThrottled$.pipe(
        loadCollectionContents({ windowSize: 2 * pageSize }),
        share()
    );

    //#endregion

    //#region Loading activity indicator

    const loading$ = merge(loadInputsThrottled$, loader$).pipe(
        activity({ period: debouncePeriod }),
        shareReplay(1)
    );

    //#endregion

    //#region Cache watcher

    const cacheFromMonitor$ = dscParams$.pipe(
        watchCollectionCache({
            cursor$: cursor$,
            pageSize,
            debouncePeriod,
        }),
    );

    const cache$ = combineLatest([cacheFromMonitor$, totalMatches$]).pipe(
        debounceTime(0),
        map((inputs) => buildPayload(...inputs)),
    );

    //#endregion

    return { loader$, cache$, scrolling$, loading$ };
}

function getIndexFromPos(pos, totalMatches) {
    const { cursor = null, key = null } = pos;
    if (key !== null) {
        return key;
    }
    if (cursor !== null) {
        return Math.round(Number(cursor) * totalMatches);
    }
    return 0;
}

function buildPayload(result, totalMatches) {
    const { contents } = result;
    const topRows = contents.length ? contents[0].element_index : 0;
    const bottomRows = Math.max(0, totalMatches - contents.length - topRows);
    return { ...result, topRows, bottomRows, totalMatches };
}
