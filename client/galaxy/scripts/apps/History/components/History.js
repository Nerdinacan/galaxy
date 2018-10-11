import { mapState, mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            selectedHistoryId: null
        };
    },
    computed: {
        ...mapState("history", ["histories"]),
        ...mapGetters("history", ["currentHistory"])
    },
    methods: {
        ...mapActions("history", ["loadHistories", "selectHistory"])
    },
    mounted() {
        this.loadHistories();
    }
};
