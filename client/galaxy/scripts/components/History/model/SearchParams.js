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

    removeLimits() {
        this.end = null;
        this.start = null;
        return this;
    }

    validRange() {
        const result = this.end < Number.POSITIVE_INFINITY
            && this.start > Number.NEGATIVE_INFINITY
            && this.end >= this.start;
        return result;
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
        // newParams.report("NEXT");
        return newParams;
    }




    /**
     * Generates request url for a given set of request parameters.
     */
    get contentUrl() {

        const base = `/api/histories/${this.historyId}/contents?v=dev&view=summary&keys=accessible`;
        const order = "order=hid-dsc";
        
        let endClause = "";
        if (this.end && this.end < Number.POSITIVE_INFINITY) {
            endClause = `q=hid-le&qv=${this.end}`;
        }
        
        const limitClause = `limit=${SearchParams.pageSize}`;
        
        // if (this.start == null) {
        //     limitClause = `limit=${SearchParams.pageSize}`;
        // } else {
        //     startClause = `q=hid-ge&qv=${this.start}`;
        // }

        // const since = this.lastCalled;
        // const updateClause = since ? `q=update_time-gt&qv=${since.toISOString()}` : "";
        const updateClause = "";

        let deletedClause = "", purgedClause = "";
        if (!this.showDeleted) {
            // limit to non-deleted
            deletedClause = `q=deleted&qv=False`;
            purgedClause = `q=purged&qv=False`;
        }

        let visibleClause = "";
        if (!this.showHidden) {
            // limit to visible
            visibleClause = `q=visible&qv=True`;
        }

        const textFilter = this.textFilter ? `q=name-contains&qv=${textFilter}` : "";

        const parts = [ base, endClause, limitClause,
            deletedClause, purgedClause, visibleClause, textFilter, 
            updateClause, order ];

        return parts.filter(o => o.length).join("&");
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
            start: history.hid_counter - SearchParams.pageSize,
            end: history.hid_counter
        });
    }

    // gets all content for indicated history regardless of
    // endpoints or other filters, just a history id
    static entireHistory(historyId) {
        return new SearchParams({
            historyId,
            showDeleted: true,
            showHidden: true
        });
    }
}

// make this number pretty big to avoid a lot of repeated
// trips to the server
SearchParams.pageSize = 100;