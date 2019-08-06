<template>
    <div class="d-flex flex-column ml-1 h-100">
        <history v-if="currentHistoryId && !selectedCollection"
            :history-id="currentHistoryId">
            <template #history-top-nav>
                <history-top-nav class="pb-3" />
            </template>
        </history>
        <dataset-collection-panel
            v-if="currentHistoryId && selectedCollection"
            :history-id="currentHistoryId"
            :type-id="selectedCollection" />
    </div>
</template>


<script>

import Vue from "vue";
import { mapState, mapGetters } from "vuex";
import History from "./History";
import HistoryTopNav from "./HistoryTopNav";
import DatasetCollectionPanel from "./DatasetCollectionPanel";

// Easier to globally register some components because of recursion
import ContentItem from "./Content/ContentItem";
Vue.component('content-item', ContentItem);

export default {
    components: {
        History,
        HistoryTopNav,
        DatasetCollectionPanel
    },
    computed: {

        ...mapState("history", [
            "currentHistoryId"
        ]),

        ...mapGetters("history", [
            "currentCollection"
        ]),

        selectedCollection() {
            return this.currentCollection(this.currentHistoryId);
        }
    }
}

</script>
