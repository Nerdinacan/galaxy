import { combineLatest, merge, NEVER, Subject } from "rxjs";
import {
    tap,
    pluck,
    map,
    mapTo,
    switchMap,
    distinctUntilChanged,
    shareReplay,
    withLatestFrom,
    debounceTime,
    share,
    filter,
    catchError,
} from "rxjs/operators";
import { activity } from "utils/observable/activity";
import { whenAny } from "utils/observable/whenAny";
import { chunk } from "../../caching/operators/chunk";

import { History, SearchParams, CurveFit } from "../../model";
import { watchHistoryContents } from "./watchHistoryContents";
import { loadContents } from "./loadContents";
import { ContentProvider, isValidNumber, scrollPosEquals, inputsSame } from "../ContentProvider";

export default {
    mixins: [ContentProvider],

    props: {
        disablePoll: { type: Boolean, default: false },
    },

    methods: {
        // prettier-ignore
        initStreams() {
            const {
                disablePoll,
                debouncePeriod,
                pageSize,
                params$,
                scrollPos$: rawScrollPos$
            } = this;

            //#region Raw Inputs

            const history$ = this.watch$("parent").pipe(
                filter(val => val instanceof History),
                distinctUntilChanged(History.equals),
            );

            const distinctParams$ = params$.pipe(
                distinctUntilChanged(SearchParams.equals),
            );

            const inputs$ = whenAny(history$, distinctParams$).pipe(
                shareReplay(1),
            );

            //#endregion

            //#region Total Matches, from history and returned ajax stats

            const serverTotalMatches$ = new Subject();

            const historyMatches$ = history$.pipe(
                pluck('hidItems')
            );

            const totalMatches$ = merge(historyMatches$, serverTotalMatches$).pipe(
                shareReplay(1)
            );

            //#endregion

            //#region Scrolling

            const scrolling$ = rawScrollPos$.pipe(
                activity({ period: debouncePeriod }),
                shareReplay(1),
            );

            const scrollStart$ = inputs$.pipe(
                mapTo({ cursor: 0.0, key: null }),
            );

            const scrollPos$ = merge(scrollStart$, rawScrollPos$).pipe(
                distinctUntilChanged(scrollPosEquals),
                shareReplay(1),
            );

            //#endregion

            //#region Curve-fit objects, used to estimate hid & topRows

            const updateCursorToHid$ = new Subject();

            const freshCursorToHid$ = inputs$.pipe(
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

            const cursorToHid$ = merge(freshCursorToHid$, updateCursorToHid$).pipe(
                shareReplay(1)
            );

            const updateHidToTopRows$ = new Subject();

            const freshHidToTopRows$ = inputs$.pipe(
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

            const hidToTopRows$ = merge(freshHidToTopRows$, updateHidToTopRows$).pipe(
                shareReplay(1)
            );

            //#endregion

            //#region Estimate HID from cursor + history + curveFit

            const hid$ = whenAny(scrollPos$, cursorToHid$).pipe(
                map(([pos, fit]) => {
                    const hid = pos.key ? pos.key : this.estimateHid(pos, fit);
                    return parseInt(hid);
                }),
                // tag('hid'),
                shareReplay(1),
            );

            //#endregion

            //#region Loading

            const loadCursor$ = hid$.pipe(
                chunk(pageSize, true),
            );

            const loadInputs$ = whenAny(inputs$, loadCursor$);

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
                    this.adjustCursorToHid(result, cursorToHid);
                    const newHidToTopRows = this.adjustHidToTopRows(result, hidToTopRows);
                    const newFit = newHidToTopRows.clone();
                    updateHidToTopRows$.next(newFit);
                    const { totalMatches } = result;
                    serverTotalMatches$.next(totalMatches);
                }),
                share(),
            );

            const loading$ = merge(loadInputsThrottled$, loader$).pipe(
                activity({ period: debouncePeriod }),
                shareReplay(1),
                // if we don't catch the error the subscription will stop
                catchError(err => {
                    console.log("Error in HCP load stream", err);
                    return null;
                })
            );

            //#endregion

            //#region Caching

            const cacheHid$ = hid$.pipe(
                debounceTime(debouncePeriod),
                shareReplay(1),
            );

            const cacheFromMonitor$ = inputs$.pipe(
                watchHistoryContents({
                    hid$: cacheHid$,
                    pageSize,
                    debouncePeriod
                }),
            );

            const cacheBuildInputs$ = combineLatest([
                cacheFromMonitor$,
                hidToTopRows$,
                totalMatches$,
            ]).pipe(
                debounceTime(2 * debouncePeriod),
            );

            const cache$ = cacheBuildInputs$.pipe(
                map((inputs) => this.buildPayload(...inputs)),
                share(),
                // if we don't catch the error the subscription will stop
                catchError(err => {
                    console.log("Error in HCP cache stream", err);
                    return null;
                })
            );

            //#endregion

            return { scrollPos$, loader$, cache$, scrolling$, loading$ };
        },

        /**
         * Calculate or estimate hid from cursor position.
         * @param {Object} scrollPos { cursor, key }
         * @param {CurveFit} fit
         */
        estimateHid(scrollPos, cursorToHid) {
            const { cursor, key } = scrollPos;
            const fit = cursorToHid;

            // do an estimate/retrieval
            const result = fit.get(cursor, { interpolate: true });
            if (isValidNumber(result)) {
                return result;
            }

            // give them the top of the data
            if (fit.hasData) {
                console.log("invalid curve fit", result, cursor, key, fit.domain);
                return fit.get(0);
            }

            // we're screwed
            return undefined;
        },

        /**
         * Assemble payload variables from cache result, need to calculate
         * topRows and bottomRows from the curveFit
         * @param {*} result Cache obsevable emission
         * @param {*} hidToTopRows topRows(hid) curveFit
         * @param {*} totalMatches Total number of matches in current history/params
         */
        buildPayload(result, hidToTopRows, totalMatches) {
            const { pageSize } = this;
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
        },

        /**
         * Update curve fit after an ajax load.
         * @param {Object} result Ajax load result
         * @param {CurveFit} fit hidToTopRows
         */
        adjustHidToTopRows(result, fit) {
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
        },

        /**
         * Calculate cursor values for edges of returned values and insert into
         * the datapoints of the curveFit object
         * @param {Object} result Ajax load result
         * @param {CurveFit} cursorToHid
         */
        adjustCursorToHid(result, fit) {
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
        },
    },
};
