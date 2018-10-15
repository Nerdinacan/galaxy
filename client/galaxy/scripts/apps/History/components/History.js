import { mapState, mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            loadHistoryId: null,
            selectedHistoryId: null
        };
    },
    computed: {
        ...mapState("history", ["histories", "currentHistory"])
        // ...mapGetters("history", ["currentHistory"])
    },
    methods: {
        ...mapActions("history", ["loadHistories", "selectHistory"])
    },
    mounted() {
        this.loadHistories();
    }
};
