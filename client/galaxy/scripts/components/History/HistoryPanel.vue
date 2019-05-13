<template>
    <section class="history">
        <history-selector v-model="currentHistory" />
        <history :history="currentHistory" />
    </section>
</template>

<script>

import HistorySelector from "./HistorySelector";
import History from "./History";

export default {
    components: { History, HistorySelector },
    computed: {
        currentHistory: {
            get() {
                return this.$store.state.history.currentHistory;
            },
            set(newHistory) {
                this.$store.dispatch("history/updateCurrentHistory", newHistory);
            }
        }
    }
}

</script>
