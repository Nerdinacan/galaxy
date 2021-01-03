/**
 * Given that almost everything in here simply passes through to Vuex, an argument can be made for
 * not even having this provider, but I'm making anyway because:
 *
 * (1) Vuex requires a component to kick off initializations through a lifecycle event handler. Vuex
 *     lacks the ability to lazy-load data because you can't do an async watch internally, thus that
 *     kind of behavior needs to be managed by a component (which has lifecyle)
 * (2) We should separate history list management from the rendering UI elements, just as a matter of
 *     good code design.
 * (2) Having this space gives us a place to house additional update logic if we start caching
 *     history objects in IndexDB or reading updates from a websocket. Even if we continue to store
 *     data in Vuex, we will need a place to subscribe and unsubscribe from sockets/observables
 */

import { mapActions, mapGetters } from "vuex";
import { History } from "../../model";

export default {
    computed: {
        ...mapGetters("betaHistory", ["currentHistoryId", "currentHistory", "histories"]),

        currentHistoryModel() {
            return new History(this.currentHistory);
        },
        historyModels() {
            return this.histories.map((h) => new History(h));
        },
    },
    methods: {
        ...mapActions("betaHistory", [
            "loadUserHistories",
            "loadHistoryById",
            "createNewHistory",
            "saveHistory",
            "deleteHistory",
            "setCurrentHistoryId",
        ]),
    },
    watch: {
        // This watch is basically the whole reason this component exists. And would not be
        // necessary if Vuex were capable of executing an asychronous response to a mutation.
        currentHistoryId: {
            immediate: true,
            handler(newId, oldId) {
                if (newId && newId !== oldId) {
                    this.loadHistoryById(newId);
                }
            },
        },
    },
    created() {
        this.loadUserHistories();
    },
    render() {
        return this.$scopedSlots.default({
            // list of available histories
            histories: this.historyModels,
            // currently selected history object, should be a full object not just a summary
            currentHistory: this.currentHistoryModel,
            // select new history, basically just needs the id
            setCurrentHistory: (h) => this.setCurrentHistoryId(h.id),
            // create new history then select it
            createHistory: this.createNewHistory,
            // save new history props to server then update the store
            saveHistory: this.saveHistory,
            // delete history then clear currentHistoryId
            deleteHistory: (history) => this.deleteHistory({ history }),
            // purge history then clearn currentHistoryId
            purgeHistory: (history) => this.deleteHistory({ history, purge: true }),
        });
    },
};
