<template>
    <div>
        <h2>History</h2>
        <!-- <pre>{{ history }}</pre> -->
        <history-search-params v-model="params" />
        <history-content v-if="historyContent"
            :historyContent="historyContent" />
    </div>
</template>

<script>

import { mapActions } from "vuex";
import { SearchParams } from "./model";
import HistoryContent from "./HistoryContent";
import HistorySearchParams from "./HistorySearchParams";

export default {
    components: { 
        HistoryContent,
        HistorySearchParams
    },
    props: {
        history: { type: Object, required: true }
    },
    data() {
        return { 
            params: new SearchParams() 
        };
    },
    computed: {
        historyContent() {
            let getContent = this.$store.getters["history/historyContent"];
            return getContent(this.history.id);
        },
        requestParams() {
            let { history, params } = this;
            return { history, params };
        }
    },
    methods: {
        ...mapActions("history", [
            "loadContent", 
            "unsubLoader"
        ])
    },
    watch: {
        requestParams: {
            handler(payload) {
                this.loadContent(payload);  
            },
            immediate: true
        }
    },
    beforeDestroy() {
        this.unsubLoader(this.history);
    }
}

</script>
