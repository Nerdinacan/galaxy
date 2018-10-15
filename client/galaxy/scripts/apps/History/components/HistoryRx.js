import {
    histories,
    currentHistory,
    setCurrentHistory as selectHistory
} from "../services/streams";

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
