<template>
    <div class="history" v-if="history">
        <history-details :history="history" />
        <dataset-list :history="history" />
    </div>
</template>

<script>

import HistoryDetails from "./HistoryDetails";
import DatasetList from "./DatasetList";
import { getHistories } from "./service";

export default {
    components: {
        HistoryDetails,
        DatasetList
    },
    computed: {
        history() {
            return this.$store.getters.currentHistory;
        }
    },
    created() {
        this.$store.dispatch("loadCurrentHistory");
    }
}

</script>

<style lang="scss" src="./styles.scss"></style>
