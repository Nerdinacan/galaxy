<template>
    <select v-model="selectedHistoryId">
        <option v-for="h in histories" :key="h.id" :value="h.id">
            {{ h.id }}: {{ h.name }}
        </option>
    </select>
</template>
    
<script>

import History from "./History";

export default {
    components: { History },
    props: {
        value: { type: Object, required: true }
    },
    computed: {
        selectedHistoryId: {
            get() {
                return this.value.id;
            },
            set(newId) {
                let h = this.histories.find(h => h.id == newId);
                this.$emit('input', h);
            }
        },
        histories() {
            return this.$store.state.history.histories;
        }
    }
}

</script>
