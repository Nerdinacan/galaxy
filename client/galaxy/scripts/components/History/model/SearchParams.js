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
        const pageSize = SearchParams.pageSize;
        const newVal = Math.floor(val / pageSize) * pageSize;
        this._start = Math.max(0, newVal);
    }

    get end() {
        return this._end;
    }

    set end(val) {
        const pageSize = SearchParams.pageSize;
        const newVal = Math.ceil(val / pageSize) * pageSize;
        this._end = Math.max(0, newVal);
    }

    get visible() {
        return (this.hidden !== null) ? !this.hidden : null;
    }

    
    // this one came into view
    expand(hid) {
        if (this.start === null) {
            this.start = hid;
        }
        if (this.end === null) {
            this.end = hid;
        }
        this.start = Math.min(this.start, hid);
        this.end = Math.max(this.end, hid);
        // this.report(`expand: ${hid}`);
    }

    // this one ran off the top
    clipTop(hid) {
        if (this.end === null) {
            this.end = hid;
        }
        this.end = Math.min(this.end, hid - 1);
        // this.report(`clipTop: ${hid}`);
    }

    // ran off the bottom
    clipBottom(hid) {
        if (this.start === null) {
            this.start = hid;
        }
        this.start = Math.max(this.start, hid + 1);
        // this.report(`clipBottom: ${hid}`);
    }

    // debugging
    report(label = "params") {
        const { start, end, showDeleted, showHidden, filterText, historyId  } = this;
        console.groupCollapsed(label, `${start}-${end}`);
        console.log("start", start);
        console.log("end", end);
        console.log("showDeleted", showDeleted);
        console.log("showHidden", showHidden);
        console.log("filterText", filterText);
        console.log("historyId", historyId);
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

    static createForHistory(history) {
        return new SearchParams({ 
            historyId: history.id, 
            end: history.hid_counter, start: 
            history.hid_counter - SearchParams.pageSize
        });
    }
}

SearchParams.pageSize = 20;
