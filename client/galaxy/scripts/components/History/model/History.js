export class History {

    constructor(props = {}) {
        this.id = null;
        this.name = "";
        Object.assign(this, props);
    }

    static create(props = {}) {
        return new History(props);
    }
}
