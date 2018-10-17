/**
 * Step in a history
 */

export class HistoryContent {
    constructor(stepProps = {}) {
        Object.assign(this, stepProps);
    }
    static hydrate(stepProps) {
        return new HistoryContent(stepProps);
    }
}
