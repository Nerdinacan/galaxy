import {
    getHistories as histories,
    currentHistory,
    setCurrentHistoryId as selectHistory
} from "../services";

export default {
    data() {
        return {
            selectedHistoryId: null
        };
    },
    methods: {
        selectHistory
    },
    subscriptions: {
        histories,
        currentHistory
    }
};
