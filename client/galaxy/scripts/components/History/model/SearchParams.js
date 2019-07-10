import hash from "object-hash";
import dateStore from "./dateStore";


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
        const chunkSize = SearchParams.chunkSize;
        const newVal = Math.floor(val / chunkSize) * chunkSize;
        this._start = Math.max(0, newVal);
    }

    get end() {
        return this._end;
    }

    set end(val) {
        const chunkSize = SearchParams.chunkSize;
        const newVal = Math.ceil(val / chunkSize) * chunkSize;
        this._end = Math.max(0, newVal);
    }

    get visible() {
        return (this.hidden !== null) ? !this.hidden : null;
    }

    get contentLastUpdated() {
        const key = this.contentUpdatedKey();
        return dateStore.get(key);
    }
    
    set contentLastUpdated(d) {
        return dateStore.set(this.contentUpdatedKey(), d);
    }
    
    contentUpdatedKey() {
        const noise = hash(this);
        return `contentUpdated:${noise}`;
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
        const { start, end, showDeleted, showHidden } = this;
        console.group(label, `${start}-${end}`);
        console.log("showDeleted", showDeleted);
        console.log("showHidden", showHidden);
        console.dir(this);
        console.groupEnd();
    }

    clone() {
        return new SearchParams(this);
    }

    static equals(a, b) {
        if (!(a instanceof SearchParams)) return false;
        if (!(b instanceof SearchParams)) return false;
        return Object.getOwnPropertyNames(a).reduce((same, prop) => {
            return same && a[prop] === b[prop];
        }, true);
    }

    static different(instance, otherInstance) {
        return !SearchParams.equals(instance, otherInstance);
    }
}

SearchParams.chunkSize = 20;
