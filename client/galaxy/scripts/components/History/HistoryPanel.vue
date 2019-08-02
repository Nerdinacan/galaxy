<template>
    <div class="d-flex flex-column ml-1 h-100">
        <history-top-nav class="px-3 pt-3 pb-0" />
        <history v-if="currentHistoryId && !selectedCollection"
            :history-id="currentHistoryId" />
        <dataset-collection-panel
            v-if="currentHistoryId && selectedCollection"
            :history-id="currentHistoryId"
            :type-id="selectedCollection" />
    </div>
</template>


<script>

import { mapState, mapGetters } from "vuex";
import History from "./History";
import HistoryTopNav from "./HistoryTopNav";
import DatasetCollectionPanel from "./DatasetCollection/Panel";

export default {
    components: {
        History,
        HistoryTopNav,
        DatasetCollectionPanel
    },
    computed: {
        ...mapState("history", [ "currentHistoryId" ]),
        ...mapGetters("history", [ "currentCollection" ]),
        selectedCollection() {
            return this.currentCollection(this.currentHistoryId)
        }
    }
}

</script>

<style lang="scss">
@import "scss/transitions.scss";
</style>

