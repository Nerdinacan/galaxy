<template>
    <b-form-select v-if="activeHistories.length" size="sm" v-model="selectedId">
        <option v-for="h in activeHistories" :key="h.id"
            :value="h.id">{{ h.name }}</option>
    </b-form-select>
</template>


<script>

import { mapGetters } from "vuex";

export default {
    props: {
        value: { type: String, required: true }
    },
    computed: {

        ...mapGetters("history", [
            "histories"
        ]),

        activeHistories() {
            return this.histories.filter(h => {
                return !(h.isDeleted || h.purged);
            })
        },

        selectedId: {
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


<style scoped>

select {
    background: none;
}

</style>
