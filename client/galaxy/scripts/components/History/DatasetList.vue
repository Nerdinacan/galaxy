<template>
    <section class="history-datasets">
        <h2>Datasets</h2>
        <dataset-controls :filters="filters" />
        <ol v-if="datasets.length">
            <dataset-list-item v-for="ds in datasets"
                :dataset="ds" :key="ds.id" />
        </ol>
        <div class="message info" v-if="!history.datasets.length">
            This history is empty...
        </div>
    </section>
</template>

<script>

import DatasetControls from "./DatasetControls";
import DatasetListItem from "./DatasetListItem";
import { History, createSearchFilters } from "./model";

export default {
    components: {
        DatasetControls,
        DatasetListItem
    },
    props: {
        history: { type: History, required: true }
    },
    computed: {
        datasets() {
            let fn = this.filters;
            let source = this.history.datasets;
            return source.filter(ds => fn.match(ds));
        }
    },
    data() {
        return {
            filters: createSearchFilters()   
        }
    }
}

</script>

<style lang="scss" scoped>

ol {
    list-style: none;
    padding-left: 0;
    li {
        padding-bottom: 1em;
    }
}

</style>