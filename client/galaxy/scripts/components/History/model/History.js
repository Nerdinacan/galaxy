import { safeAssign } from "utils/safeAssign";

export class History {

    constructor(props = {}) {
        this.id = null;
        this.update_time = null;
        this.name = "";
        console.log("History constructor", props);
        safeAssign(this, props);
    }

    get updateTime() {
        return new Date(this.update_time);
    }

    export() {
        return JSON.parse(JSON.stringify(this));
    }

    static create(props = {}) {
        return new History(props);
    }
}
