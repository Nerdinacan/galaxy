<template>
    <div class="d-flex flex-column ml-1">
        <history-top-nav class="p-2" />
        <div class="d-flex h-100">
            <history v-if="currentHistoryId"
                :history-id="currentHistoryId" />
            <dataset-collection-panel v-if="currentCollectionId" 
                :collection-id="currentCollectionId" />
        </div>
    </div>
</template>

<script>

import { mapState } from "vuex";
import History from "./History";
import HistoryTopNav from "./HistoryTopNav";
import { DatasetCollectionPanel } from "./DatasetCollection";

export default {
    components: {
        History,
        DatasetCollectionPanel,
        HistoryTopNav
    },
    computed: {
        ...mapState("history", [ "currentHistoryId" ]),
        ...mapState("dsc", [ "currentCollectionId" ])
    }
}

</script>
