<template>
    <section v-if="history" class="history d-flex flex-column">

        <header class="flex-grow-0 px-3 pt-3 pb-2">
            <slot name="history-top-nav" :history="history"></slot>
            <history-messages class="history-messages"
                :history="history" />
            <history-details class="history-details"
                :history="history" />
            <content-selection class="history-content-selection"
                :history="history" />
        </header>

        <content-list class="history-contents flex-grow-1"
            :params="params"
            :content="content"
            @paramChange="setSearchParams" />

    </section>
</template>


<script>

import { mapGetters, mapActions } from "vuex";
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

        ...mapGetters("history", [
            "getHistory",
            "historyContent",
            "searchParams"
        ]),

        params() {
            return this.searchParams(this.historyId);
        },

        content() {
            const newContent = this.historyContent(this.historyId);
            return newContent;
        },

        history() {
            return this.getHistory(this.historyId);
        }

    },

    methods: {
        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
        ])
    },

    watch: {
        historyId: {
            handler(newId, oldId) {
                if (oldId && (newId !== oldId)) {
                    this.unsubLoader(oldId);
                }
                this.loadContent(newId);
            },
            immediate: true
        }
    },
    beforeDestroy() {
        this.unsubLoader(this.historyId);
    }
}

</script>
