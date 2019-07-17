// TODO: boolean filter is restricting polling update, need
// nullable deleted and hidden flags that can be completely
// ommitted from the api query

import dateStore from "./dateStore";
import hash from "object-hash";


export class SearchParams {

    constructor(props = {}) {
        this.historyId = null;
        this.filterText = "";
        this.showDeleted = false;
        this.showHidden = false;

        // Maximum result length on a pagination request
        this.limit = 50;

        // Chunk-size for blocks of windowed content
        this.pageSize = 50;

        this._start = null;
        this._end = null;
        Object.assign(this, props);
    }

    get start() {
        return this._start;
    }

    set start(val) {
        if (val === null || isNaN(val)) {
            this._start = null;
            return;
        }
        const pageSize = this.pageSize;
        const newVal = Math.floor(val / pageSize) * pageSize;
        this._start = Math.max(0, newVal);
    }

    get end() {
        return this._end;
    }

    set end(val) {
        if (val === null || isNaN(val)) {
            this._end = null;
            return;
        }
        const pageSize = this.pageSize;
        const newVal = Math.ceil(val / pageSize) * pageSize;
        this._end = Math.max(0, newVal);
    }

    get showVisible() {
        return !this.showHidden;
    }

    get lastCalled() {
        return dateStore.get(this.dateStoreKey);
    }

    markLastCalled() {
        dateStore.set(this.dateStoreKey);
    }

    get dateStoreKey() {
        return `params-${hash(this)}`;
    }

    removeLimits() {
        this._end = null;
        this._start = null;
        return this;
    }

    // this one came into view
    expand(hid) {
        if (hid === null || isNaN(hid)) {
            return;
        }
        this.start = Math.min(this.start, hid - 1);
        this.end = Math.max(this.end, hid + 1);
        return this;
    }

    // this one ran off the top
    clipTop(hid) {
        if (hid === null || isNaN(hid)) {
            return;
        }
        this.end = Math.min(this.end, hid - 1);
        return this;
    }

    // ran off the bottom
    clipBottom(hid) {
        if (hid === null || isNaN(hid)) {
            return;
        }
        this.start = Math.max(this.start, hid + 1);
        return this;
    }

    // debugging
    report(label = "params") {
        const { lastCalled, start, end, showDeleted, showHidden, filterText, historyId } = this;
        console.groupCollapsed(label, `${start}-${end}`);
        console.log("historyId", historyId);
        console.log("start", start);
        console.log("end", end);
        console.log("lastCalled", lastCalled.toISOString());
        console.log("showDeleted", showDeleted);
        console.log("showHidden", showHidden);
        console.log("filterText", filterText);
        console.dir(this);
        console.groupEnd();
    }

    clone() {
        return new SearchParams(this);
    }

    static equals(a, b) {
        const result = JSON.stringify(a) == JSON.stringify(b);
        return result;
    }

    static different(instance, otherInstance) {
        return !SearchParams.equals(instance, otherInstance);
    }

    // creates a new params for a history, applies limits
    // from known quantities
    static createForHistory(history) {
        return new SearchParams({
            historyId: history.id,
            start: history.hid_counter,
            end: history.hid_counter
        });
    }

    // gets all content for indicated history regardless of
    // endpoints or other filters, just a history id
    static entireHistory(history) {
        return new SearchParams({
            historyId: history.id,
            showDeleted: true,
            showHidden: true
        });
    }
}


