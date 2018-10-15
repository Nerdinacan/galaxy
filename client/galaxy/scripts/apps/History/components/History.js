import { mapState, mapActions } from "vuex";

export default {
    data() {
        return {
            selectedHistoryId: null
        };
    },
    computed: {
        ...mapState("history", ["histories", "currentHistory"])
    },
    methods: {
        ...mapActions("history", ["loadHistories", "selectHistory"])
    },
    mounted() {
        this.loadHistories();
    }
};
