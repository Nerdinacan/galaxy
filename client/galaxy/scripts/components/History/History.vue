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
import { of } from "rxjs/index";
import { startWith, tap, pluck, debounceTime } from "rxjs/operators";
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

        let param$ = this.$watchAsObservable('params', { 
            immediate: true, 
            deep: true
        }).pipe(
            pluck('newValue'),
            debounceTime(200)
        );

        let history$ = this.$watchAsObservable('history', { 
            immediate: true 
        }).pipe(
            pluck('newValue')
        );

        let historyContent$ = HistoryContent$(history$, param$);

        return { 
            param$,
            history$,
            historyContent$
        };
    }
}

</script>
