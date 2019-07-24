<template>
    <div class="d-flex flex-column ml-1 h-100">
        <history-top-nav class="px-3 pt-3 pb-0" />
        <history v-if="currentHistoryId"
            :historyId="currentHistoryId" />
    </div>
</template>


<script>

import { mapState } from "vuex";
import History from "./History";
import HistoryTopNav from "./HistoryTopNav";

export default {
    components: {
        History,
        HistoryTopNav
    },
    computed: {
        ...mapState("history", [ "currentHistoryId" ])
    }
}

</script>
