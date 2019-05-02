<template>
    <form>
        <input v-model="filter.filterText" />
        <button type="cancel" @click.prevent="clear()">Clear</button>
    </form>
</template>

<script>

import { HistorySearchFilter } from "./model";

export default {
    props: {
        value: { 
            type: HistorySearchFilter,
            required: true
        }
    },
    computed: {
        filter() {
            return this.value;
        }
    },
    methods: {
        clear() {
            this.filter.clear();
            this.$emit('input', this.filter);
        }
    }
}

</script>
