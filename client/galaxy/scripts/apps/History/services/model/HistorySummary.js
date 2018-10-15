/**
 * One item in the summary list from /api/histories
 */

export class HistorySummary {
    constructor(props = {}) {
        Object.assign(this, props);
    }
    static hydrate(stuff) {
        return new HistorySummary(stuff);
    }
}
