<template>
    <select v-model="selectedHistoryId">
        <option v-for="h in histories" :key="h.id" :value="h.id">
            {{ h.name }}
        </option>
    </select>
</template>
    
<script>

import { mapActions } from "vuex";

export default {
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
    },
    methods: {
        ...mapActions("history", [ "loadHistories" ]),
    },
    created() {
        this.loadHistories();
    }
}

</script>
