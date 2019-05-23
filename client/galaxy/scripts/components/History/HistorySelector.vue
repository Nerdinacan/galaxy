<template>
    <select v-model="selectedHistoryId">
        <option>Swith to history...</option>
        <option v-for="h in activeHistories" :key="h.id" :value="h.id">
            {{ h.name }}
        </option>
    </select>
</template>
    
<script>

import { mapGetters } from "vuex";

export default {
    props: {
        value: { type: String, required: true }
    },
    computed: {
        ...mapGetters("history", [ "histories" ]),
        activeHistories() {
            return this.histories.filter(h => { 
                return !(h.isDeleted || h.purged);
            })
        },
        selectedHistoryId: {
            get() {
                return this.value;
            },
            set(id) {
                if (id) {
                    this.$emit('input', id);
                }
            }
        }
    }
}

</script>
