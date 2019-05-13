<template>
    <history :history="currentHistory">
        <template v-slot:nav>
            <nav class="historyMenu">
                <history-selector v-model="currentHistory" />
                <!-- little dummy buttons -->
            </nav>
        </template>
    </history>
</template>

<script>

import History from "./History";
import HistorySelector from "./HistorySelector";

export default {
    components: { History, HistorySelector },
    computed: {
        currentHistory: {
            get() {
                return this.$store.state.history.currentHistory;
            },
            set(h) {
                this.$store.dispatch("history/updateCurrentHistory", h);
            }
        }
    }
}

</script>