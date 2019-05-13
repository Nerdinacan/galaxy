<template>
    <div>
        <header>
            <h2>{{ history.name }}</h2>
        </header>
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
        history: { 
            type: Object,
            required: true
        }
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
        },
        history(newValue, oldValue) {
            console.log("history changed", newValue.id, oldValue.id);
            if (oldValue) {
                this.unsubLoader(oldValue.id);
            }
        }
    },
    beforeDestroy() {
        this.unsubLoader(this.history.id);
    }
}

</script>
