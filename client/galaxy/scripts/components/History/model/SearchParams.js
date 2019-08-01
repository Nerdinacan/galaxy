import hash from "object-hash";
import moment from "moment";


// Keeps track of last time we used these params by the parameter contents
// represented by a hash string

const lastCalled = {
    get(key) {
        const stamp = sessionStorage.getItem(key);
        return stamp ? parseInt(stamp) : 0;
    },
    set(key, stamp) {
        sessionStorage.setItem(key, stamp);
    }
}


export class SearchParams {

    constructor(props = {}) {
        this.historyId = null;
        this.filterText = "";
        this.showDeleted = false;
        this.showHidden = false;
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
        this._start = Math.max(0, val);
    }

    get end() {
        return this._end;
    }

    set end(val) {
        if (val === null || isNaN(val)) {
            this._end = null;
            return;
        }
        this._end = Math.max(0, val);
    }

    get lastCalled() {
        const stamp = lastCalled.get(this.requestStateKey) || 0;
        return moment.utc(stamp);
    }

    markLastCalled() {
        const stamp = moment.utc().valueOf();
        lastCalled.set(this.requestStateKey, stamp);
    }

    get stateKey() {
        return `params-${hash(this)}`;
    }

    // like stateKey but with no start factored into the state
    // (used in ContentLoader)
    get requestStateKey() {
        const dummyP = this.clone();
        dummyP.start = null;
        return dummyP.stateKey;
    }


    validRange() {
        const result = this.end < Number.POSITIVE_INFINITY
            && this.start > Number.NEGATIVE_INFINITY
            && this.end >= this.start;
        return result;
    }


    // These operations return a new params instance

    clone() {
        return new SearchParams(this);
    }

    removeLimits() {
        const noLimits = this.clone();
        noLimits.end = null;
        noLimits.start = null;
        return noLimits;
    }

    chunkEnd() {
        const chunked = this.clone();
        const chunkSize = SearchParams.pageSize;
        chunked.end = Math.ceil(this.end / chunkSize) * chunkSize;
        return chunked;
    }

    chunkStart() {
        const chunked = this.clone();
        const chunkSize = SearchParams.pageSize;
        chunked.start = Math.floor(this.start / chunkSize) * chunkSize;
        return chunked;
    }

    nextPage() {
        const newParams = this.clone();
        newParams.end = newParams.end - SearchParams.pageSize;
        return newParams;
    }


    // debugging

    report(label = "params") {
        const { lastCalled, start, end, showDeleted, showHidden, filterText, historyId } = this;
        console.groupCollapsed(label, `${end} -> ${start}`);
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

    static equals(a, b) {
        const result = JSON.stringify(a) == JSON.stringify(b);
        return result;
    }

    // creates a new params for a history, applies limits
    // from known quantities
    static createForHistory(history) {
        return new SearchParams({
            historyId: history.id,
            start: history.hid_counter - SearchParams.pageSize,
            end: history.hid_counter
        });
    }

}

// make this number pretty big to avoid a lot of repeated
// trips to the server
SearchParams.pageSize = 50;