<template>
    <div class="d-flex flex-column ml-1 h-100">
        <history v-if="currentHistoryId && !selectedCollection"
            :historyId="currentHistoryId">
            <template #history-top-nav>
                <history-top-nav class="pb-3" />
            </template>
        </history>
        <dataset-collection-panel
            v-if="currentHistoryId && selectedCollection"
            :historyId="currentHistoryId"
            :selectedTypeId="selectedCollection" />
    </div>
</template>


<script>

import { mapState, mapGetters } from "vuex";
import History from "./History";
import HistoryTopNav from "./HistoryTopNav";
import DatasetCollectionPanel from "./DatasetCollectionPanel";

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
            return this.currentCollection(this.currentHistoryId);
        }
    }
}

</script>
