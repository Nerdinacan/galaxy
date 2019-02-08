// History

import { getCurrentHistory, getHistories } from "components/History/service";
import { createHistory } from "components/History/model";

export const historyStore = {
    state: {
        currentHistoryId: null,
        histories: new Map()
    },
    getters: {
        currentHistory(state) {
            let key = state.currentHistoryId;
            let history = (key !== null) 
                ? state.histories.get(key) 
                : createHistory();
            return history;
        }
    },
    actions: {
        loadHistoriesForUser({ commit }) {
            getHistories().then(histories => {
                histories.forEach(history => {
                    commit("setHistory", history);
                });
            });
        },
        async loadCurrentHistory({ commit }) {
            let history = await getCurrentHistory();
            commit("setHistory", history);
            commit("setCurrentHistoryId", history.id);
        }
    },
    mutations: {
        setHistory(state, history) {
            let newHistoryMap = new Map(state.histories);
            newHistoryMap.set(history.id, createHistory(history));
            state.histories = newHistoryMap;
        },
        setCurrentHistoryId(state, id) {
            state.currentHistoryId = id;
        }
    }
}

// fetch to update the quota meter adding 'current' for any anon-user's id
// let Galaxy = getGalaxyInstance();
// Galaxy.listenTo(this.historyView, "history-size-change", () => {
//     Galaxy.user.fetch({
//         url: `${Galaxy.user.urlRoot()}/${Galaxy.user.id || "current"}`
//     });
// });
