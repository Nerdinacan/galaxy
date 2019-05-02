import { safeAssign } from "utils/safeAssign";

export class History {

    constructor(props = {}) {
        this.id = "";
        this.name = "";
        this.published = false;
        this.purged = false;
        this.deleted = false;
        safeAssign(this, props);
        this.update_time = (new Date(props.update_time)).getTime();
    }

    export() {
        return JSON.parse(JSON.stringify(this));
    }

    static create(props = {}) {
        return new History(props);
    }
}

export class HistoryContentItem {
    
    constructor(props = {}) {
        this.id = "";
        this.hid = 0;
        this.history_id = "";
        this.history_content_type = "dataset";
        this.url = "";
        safeAssign(this, props);
        this.update_time = (new Date(props.update_time)).getTime();
    }

    export() {
        return JSON.parse(JSON.stringify(this));
    }

    static create(props = {}) {
        return new HistoryContentItem(props);
    }
}
