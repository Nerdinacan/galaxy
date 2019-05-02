<!-- displays the history provided -->

<template>
    <section>
        History Contents Here
        <pre>{{ content$ }}</pre>
    </section>
</template>

<script>

import Vue from "vue";
import VueRx from "vue-rx";
import { map, tap } from "rxjs/operators";
import { History$ } from "./model/History";
import { HistoryContent$ } from "./model/HistoryContent";
import { Observable } from "rxjs/index";

Vue.use(VueRx);
        
export default {
    props: {
        history: { required: true }
    },
    subscriptions() {
        let h$ = History$(this.history);
        let history$ = h$.pipe(map(o => o.toJSON()));
        let content$ = HistoryContent$(h$);
        return { history$, content$ };
    }
}

</script>