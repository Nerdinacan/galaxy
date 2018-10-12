/**
 * Step in a history
 */

export class HistoryStep {
    constructor(args) {
        Object.assign(this, ...args);
    }
    static hydrate(data) {
        return new HistoryStep(data);
    }
}
