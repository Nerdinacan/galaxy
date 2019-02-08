<template>
    <div class="search-input">
        <input v-model="filters.filterText" />
        <button @click.prevent="clearSearch">X</button>
    </div>
</template>

<script>

import { DatasetSearchFilter } from "./model";

export default {
    props: {
        filters: { type: DatasetSearchFilter, required: true }
    },
    clearSearch() {
        this.filters.filterText = "";
    }
}

</script>
