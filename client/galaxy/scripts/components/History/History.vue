<template>
    <section v-if="history" class="history d-flex flex-column">
        <header class="flex-grow-0">
            <slot name="history-top-nav" :history="history"></slot>
            <history-messages class="history-messages px-3 pt-3 pb-0" :history="history" />
            <history-details class="history-details p-3" :history="history" />
            <content-selection class="history-content-selection px-3 pb-2" :history="history" />
        </header>
        <content-list :history="history" class="history-contents flex-grow-1" />
    </section>
</template>


<script>

import { mapGetters } from "vuex";
import HistoryDetails from "./HistoryDetails";
import HistoryMessages from "./HistoryMessages";
import ContentSelection from "./ContentSelection";
import ContentList from "./ContentList";

export default {
    components: {
        HistoryDetails,
        HistoryMessages,
        ContentSelection,
        ContentList
    },
    props: {
        historyId: { type: String, required: true }
    },
    computed: {
        
        ...mapGetters("history", [
            "getHistory"
        ]),

        history() {
            return this.getHistory(this.historyId);
        }
    }
}

</script>


<style lang="scss">

@import "~scss/mixins.scss";

.history {
    @include resetHeaders();
}

</style>
