import { parse } from "url";

export class SearchParams {

    constructor(props = {}) {
        this._start = 0;
        this._pageSize = 10;
        this.filterText = "";
        Object.assign(this, props);
    }

    set start(val) {
        let newInt = parseInt(val);
        if (!isNaN(newInt)) {
            this._start = newInt;
        }
    }

    get start() {
        return this._start;
    }

    set pageSize(val) {
        let newInt = parseInt(val);
        if (!isNaN(newInt)) {
            this._pageSize = newInt;
        }
    }

    get pageSize() {
        return this._pageSize;
    }

    static equals(instance, otherInstance) {
        return JSON.stringify(instance) == JSON.stringify(otherInstance);
    }

    static create() {
        return new SearchParams();
    }
}
