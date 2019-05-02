<template>
    <section class="history-datasets">

        <history-filter v-model="filter" />

        <div class="dataset-content">
            <ol v-if="filteredDatasets.length">
                <li :key="ds.id" v-for="(ds,i) in filteredDatasets">
                    <history-item v-model="filteredDatasets[i]"
                        :selected="isSelected(ds)" 
                        @click="toggleSelect" />
                </li>
            </ol>
        </div>

        <div class="message info" v-if="!datasets.length">
            This history is empty...
        </div>

    </section>
</template>

<script>

import HistoryFilter from "./HistoryFilter";
import HistoryItem from "./HistoryItem";
import { History } from "./model/History";
import { SearchFilter } from "./model/SearchFilter";

export default {
    components: {
        DatasetListItem,
        HistoryFilter
    },
    props: {
        value: { type: History, required: true }
    },
    data() {
        return {
            selection: new Set(),
            filter: SearchFilter.create()
        }
    },
    computed: {
        history() {
            return this.value;
        },
        datasets() {
            return this.$store.getters.datasetsForHistory(this.history);
        },
        filteredDatasets() {
            return this.datasets.filter(ds => this.filters.match(ds));
        },
        deletedHistories() {
            return this.datasets.filter(ds => ds.deleted);
        }
    },
    methods: {
        toggleSelect(ds) {
            let newList = new Set(this.selection);
            newList.has(ds) ? newList.delete(ds) : newList.add(ds);
            this.selection = newList;
        },
        isSelected(ds) {
            return this.selection.has(ds);
        },
        loadContents(history) {
            this.$store.dispatch("loadDatasetsForHistory", history);
        }
    },
    watch: {
        history(newHistory) {
            this.loadContents(newHistory);
        }
    },
    mounted() {
        this.loadContents(this.history);
    }
}

</script>
