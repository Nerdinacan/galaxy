<template>
    <div>
        <h2>History</h2>
        <history-search-params v-model="params" />
        <history-content v-if="historyContent$"
            :historyContent="historyContent$" />
    </div>
</template>

<script>

import Vue from "vue";
import VueRx from "vue-rx";
import { pluck, debounceTime } from "rxjs/operators";
import { log } from "./model/utils";
import { HistoryContent$, SearchParams } from "./model";
import HistoryContent from "./HistoryContent";
import HistorySearchParams from "./HistorySearchParams";

Vue.use(VueRx);

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
        }
    },
    subscriptions() {

        const watchProps = { immediate: true, deep: true };

        const param$ = this.$watchAsObservable('params', watchProps).pipe(
            pluck('newValue'),
            debounceTime(200)
        );

        return {
            historyContent$: HistoryContent$(this.history, param$)
        };
    }
}

</script>
