<template>
    <HistoryTagProvider :history="history" v-slot="{ tags, saveTag, saveTags }">
        <SuggestionProvider
            :query="tagInputText"
            :available="available"
            :selected="tags"
            v-slot="{ 
                options,
                activeSuggestion = { value: null },
                nextSuggestion, 
                lastSuggestion 
            }"
        >
            <Tags
                :tags="tags"
                @update:tags="saveTags"
                :suggestions="options"
                :query.sync="tagInputText"
                @keyup.native.down="nextSuggestion"
                @keyup.native.up="lastSuggestion"
                @keyup.native.enter="saveTag(activeSuggestion.value)"
                @selectSuggestion="(sugg) => saveTag(sugg.value)"
            ></Tags>
        </SuggestionProvider>
    </HistoryTagProvider>
</template>

<script>
import { Tags, SuggestionProvider, ProviderMixin } from "../TagsBeta";
import { updateHistoryFields } from "./model/queries";

export const HistoryTagProvider = {
    mixins: [ProviderMixin],
    props: {
        history: { type: Object, required: true },
    },
    created() {
        this.items = new Set(this.history?.tags || []);
    },
    methods: {
        async saveToServer(tags) {
            return await updateHistoryFields(this.history, { tags });
        },
    },
};

export default {
    components: {
        Tags,
        HistoryTagProvider,
        SuggestionProvider,
    },
    props: {
        history: { type: Object, required: true },
    },
    data() {
        return {
            tagInputText: "",
            available: [],
        };
    },
    async created() {
        this.available = ["America", "Asia", "Africa"];
    },
};
</script>
