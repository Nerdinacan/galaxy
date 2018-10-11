/**
 * HistoryCollection
 */

export class HistoryCollection {
    constructor(rawListData) {
        this.activeHistory = null;
        this.histories = rawListData.map(o => new History(o));
    }
    addHistory(raw) {
        let newHistory = new History(raw);
        this.histories = [...this.histories, newHistory];
        return newHistory;
    }
    static hydrate(data) {
        return new HistoryCollection(data);
    }
}
