<template>
    <div class="history-wrapper ml-1">
        <history-top-nav class="p-2" />
        <history v-if="currentHistoryId"
            :history-id="currentHistoryId" />
        <dataset-collection-panel v-if="currentCollectionId" 
            :collection-id="currentCollectionId" />
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

<style lang="scss" scoped>

@import "~scss/theme/blue.scss";
@import "~scss/mixins.scss";

.history-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    height: 100%;
    padding-top: 36px;

    > nav {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: auto;
    }
}

</style>
