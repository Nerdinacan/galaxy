export class History {

    constructor(props = {}) {
        this.id = null;
        Object.assign(this, props);
    }

    static create(props = {}) {
        return new History(props);
    }
}
