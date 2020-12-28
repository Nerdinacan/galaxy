import { combineLatest, merge, NEVER, Subject } from "rxjs";
import {
    tap,
    map,
    mapTo,
    switchMap,
    distinctUntilChanged,
    shareReplay,
    withLatestFrom,
    debounceTime,
    share,
} from "rxjs/operators";
import { activity } from "utils/observable/activity";
import { chunk } from "../../caching/operators/chunk";
// import { tag } from "rxjs-spy/operators/tag";

import { CurveFit } from "../../model";
import { watchHistoryContents } from "./watchHistoryContents";
import { loadContents } from "./loadContents";
import { isFiniteNumber, inputsSame, scrollPosEquals } from "../utils";

/**
 * Combine the three primary input observables into severl output streams.
 * Inputs: the history, the search params and the scroll position
 * Outputs: loading flag, scrolling flag, loader subscription, cache watch results
 *
 * @param {Array} obs Array of inputs observables history, params, scrollPos
 * @param {Object} settings Configurable settings from the external component
 *
 * @return {Object} Object of observable outputs
 */
// prettier-ignore
export function buildHistoryContentProviderStreams(obs, settings) {
    const { disablePoll, debouncePeriod, pageSize } = settings;
    const [ history$, params$, userScrollPos$ ] = obs;

    // #region History Params

    // Lots of things reset when either of these 2 vals change
    const historyParams$ = combineLatest([history$, params$]).pipe(
        debounceTime(0),
        shareReplay(1),
    );

    // #endregion

    // #region Total Matches

    // when the params change get the total matches from the history object
    const initTotalMatches$ = historyParams$.pipe(
        map(([history]) => history.hidItems),
    );

    // as ajax calls come in, record the totalMatches from the server result
    const serverTotalMatches$ = new Subject();

    const totalMatches$ = merge(initTotalMatches$, serverTotalMatches$);

    // #endregion

    // #region Scrolling

    const initScrollStart$ = historyParams$.pipe(
        mapTo({ cursor: 0.0, key: null }),
    );

    const scrollPos$ = merge(initScrollStart$, userScrollPos$).pipe(
        distinctUntilChanged(scrollPosEquals),
        shareReplay(1),
    );

    //#endregion

    // #region Scrolling activity indicator

    const scrolling$ = scrollPos$.pipe(
        activity({ period: debouncePeriod }),
        shareReplay(1),
    );

    // #endregion

    // #region Curve-fit objects, used to estimate hid & topRows

    const updateCursorToHid$ = new Subject();

    const initCursorToHid$ = historyParams$.pipe(
        map(([history]) => {
            const fit = new CurveFit();
            fit.domain = [0.0, 1.0];
            fit.xPrecision = 3;
            fit.yPrecision = 2;
            fit.set(0.0, history.hidItems);
            fit.set(1.0, 1);
            return fit;
        }),
    );

    const cursorToHid$ = merge(initCursorToHid$, updateCursorToHid$).pipe(
        shareReplay(1)
    );

    const updateHidToTopRows$ = new Subject();

    const initHidToTopRows$ = historyParams$.pipe(
        map(([history]) => {
            const fit = new CurveFit();
            fit.domain = [0.0, +history.hidItems];
            fit.xPrecision = 3;
            fit.yPrecision = 3;
            fit.set(history.hidItems, 0.0);
            fit.set(0.0, history.hidItems);
            return fit;
        }),
    );

    const hidToTopRows$ = merge(initHidToTopRows$, updateHidToTopRows$).pipe(
        shareReplay(1)
    );

    //#endregion

    // #region Estimate HID from cursor + history + curveFit

    const hid$ = combineLatest([scrollPos$, cursorToHid$]).pipe(
        debounceTime(0),
        map(([pos, fit]) => {
            const hid = pos.key ? pos.key : estimateHid(pos, fit);
            return parseInt(hid);
        }),
        // tag('hid'),
        shareReplay(1),
    );

    // #endregion

    // #region Ajax loading & polling

    // don't load every single hid the user asks for
    const loadHid$ = hid$.pipe(
        chunk(pageSize, true),
    );

    const loadInputs$ = combineLatest([historyParams$, loadHid$]).pipe(
        debounceTime(0),
    );

    const loadInputsThrottled$ = scrolling$.pipe(
        switchMap(isScrolling => isScrolling ? NEVER : loadInputs$),
        distinctUntilChanged(([inputsA, hidA], [inputsB, hidB]) => {
            return hidA == hidB && inputsSame(inputsA, inputsB);
        }),
        map(([inputs, hid]) => [...inputs, hid]),
        debounceTime(debouncePeriod),
        share(),
    );

    const loadContent$ = loadInputsThrottled$.pipe(
        loadContents({ disablePoll, windowSize: 2 * pageSize }),
    );

    const loader$ = loadContent$.pipe(
        withLatestFrom(cursorToHid$, hidToTopRows$),
        tap(([result, cursorToHid, hidToTopRows]) => {
            adjustCursorToHid(result, cursorToHid);
            const newHidToTopRows = adjustHidToTopRows(result, hidToTopRows);
            const newFit = newHidToTopRows.clone();
            updateHidToTopRows$.next(newFit);
            const { totalMatches } = result;
            serverTotalMatches$.next(totalMatches);
        }),
        share(),
    );

    //#endregion

    // #region Loading activity indicator

    const loading$ = merge(loadInputsThrottled$, loader$).pipe(
        activity({ period: debouncePeriod }),
        shareReplay(1),
    );

    // #endregion

    // #region Cache observer emissions, this is the final output

    const cacheHid$ = hid$.pipe(
        debounceTime(debouncePeriod),
        shareReplay(1),
    );

    const cacheFromMonitor$ = historyParams$.pipe(
        watchHistoryContents({
            hid$: cacheHid$,
            pageSize,
            debouncePeriod
        }),
    );

    const cache$ = combineLatest([
        cacheFromMonitor$,
        hidToTopRows$,
        totalMatches$,
    ]).pipe(
        debounceTime(debouncePeriod),
        map((inputs) => buildPayload(...inputs, pageSize)),
        share(),
    );

    //#endregion

    return { loader$, cache$, scrolling$, loading$ };
}

/**
 * Calculate or estimate hid from cursor position.
 * @param {Object} scrollPos { cursor, key }
 * @param {CurveFit} fit
 */
function estimateHid(scrollPos, cursorToHid) {
    const { cursor, key } = scrollPos;
    const fit = cursorToHid;

    // do an estimate/retrieval
    const result = fit.get(cursor, { interpolate: true });
    if (isFiniteNumber(result)) {
        return result;
    }

    // give them the top of the data
    if (fit.hasData) {
        console.log("invalid curve fit", result, cursor, key, fit.domain);
        return fit.get(0);
    }

    // we're screwed
    return undefined;
}

/**
 * Update curve fit after an ajax load.
 *
 * @param {Object} result Ajax load result
 * @param {CurveFit} fit hidToTopRows
 */
function adjustHidToTopRows(result, fit) {
    const {
        // min and max of returned data
        minContentHid,
        maxContentHid,

        // endpoints for all of history, that match filters
        minHid,
        maxHid,

        // num matches up/down from request hid
        matchesUp,
        matchesDown,
        matches,

        // total matches up/down from request hid
        totalMatchesUp,
        totalMatches,
    } = result;

    if (matches > 0) {
        fit.set(maxContentHid, totalMatchesUp - matchesUp);
        fit.set(minContentHid, Math.max(0, totalMatchesUp + matchesDown - 1));
    }

    fit.set(maxHid, 0);
    if (totalMatches > 0) {
        fit.set(minHid, totalMatches - 1);
    }

    fit.domain = [minHid, maxHid];

    return fit;
}

/**
 * Calculate cursor values for edges of returned values and insert into
 * the datapoints of the curveFit object
 *
 * @param {Object} result Ajax load result
 * @param {CurveFit} cursorToHid CurveFit object for estimating hid from scroll cursor
 */
function adjustCursorToHid(result, fit) {
    const { maxHid, minHid, maxContentHid, minContentHid, matches, totalMatchesUp, totalMatches } = result;

    // set 0, 1 for min/max hids
    fit.set(0, maxHid);
    fit.set(1, minHid);

    // find cursor for top & bottom of returned content
    if (totalMatches > 0) {
        fit.set(totalMatchesUp / totalMatches, maxContentHid);
        fit.set((matches + totalMatchesUp) / totalMatches, minContentHid);
    }

    return fit;
}

/**
 * Assemble payload variables from cache result, need to calculate
 * topRows and bottomRows from the curveFit
 *
 * @param {object} result Cache obsevable emission
 * @param {CurveFit} hidToTopRows topRows(hid) curveFit
 * @param {integer} totalMatches Total number of matches in current history/params
 * @param {integer} pageSize length of delivered content slice
 */
function buildPayload(result, hidToTopRows, totalMatches, pageSize) {
    const { contents = [], startKey = null, targetKey } = result;
    const fit = hidToTopRows;

    let topRows = 0;
    let bottomRows = Math.max(0, totalMatches - contents.length);

    // missing rows above & below content
    if (fit.size && contents.length && totalMatches > pageSize) {
        const maxHid = contents[0].hid;
        const rowsAboveTop = fit.get(maxHid, { interpolate: true });
        topRows = Math.max(0, Math.round(rowsAboveTop));
        bottomRows = Math.max(0, totalMatches - topRows - contents.length);
    }

    return { contents, startKey, targetKey, topRows, bottomRows, totalMatches };
}
