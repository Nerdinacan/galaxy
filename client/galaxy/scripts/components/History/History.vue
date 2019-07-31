<template>
    <section v-if="history" class="history d-flex flex-column">

        <header class="flex-grow-0">
            <slot v-if="history" name="history-top-nav" :history="history"></slot>
            <history-messages v-if="history" 
                class="history-messages px-3 pt-3 pb-0"
                :history="history" />
            <history-details v-if="history" 
                class="history-details p-3"
                :history="history" />
            <content-selection class="history-content-selection px-3 pb-2"
                :history="history" />
        </header>

        <content-list class="history-contents flex-grow-1"
            :history="history" />

    </section>
</template>


<script>

import { mapGetters, mapState } from "vuex";
import HistoryDetails from "./HistoryDetails";
import HistoryMessages from "./HistoryMessages";
import ContentSelection from "./Content/ContentSelection";
import ContentList from "./Content/ContentList";


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
        ...mapGetters("history", [ "getHistory" ]),
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
