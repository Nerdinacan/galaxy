<template>
    <b-input-group v-if="params">

        <debounced-input v-model.trim="params.filterText">
            <b-form-input slot-scope="scope" size="sm"
                :value="scope.value" @input="scope.input"
                :placeholder="'Search Filter' | localize" />
        </debounced-input>

        <b-input-group-append>
            <b-button size="sm" v-if="history.contents_active.deleted"
                :variant="params.showDeleted ? 'info' : 'secondary'"
                @click="toggleDeleted">
                {{ 'Deleted' | localize }}
            </b-button>
            <b-button size="sm" v-if="history.contents_active.hidden"
                :variant="params.showHidden ? 'info' : 'secondary'"
                @click="toggleHidden">
                {{ 'Hidden' | localize }}
            </b-button>
        </b-input-group-append>

    </b-input-group>
</template>


<script>

import { SearchParams } from "./model/SearchParams";
import DebouncedInput from "components/Form/DebouncedInput";

export default {
    components: {
        DebouncedInput
    },
    props: {
        history: { type: Object, required: true },
        value: { type: SearchParams, required: true }
    },
    data() {
        return {
            params: new SearchParams()
        }
    },
    watch: {
        value: {
            handler(newValue) {
                this.params = this.value.clone();
            }, 
            immediate: true 
        },
        params: {
            handler(newVal) {
                const newParams = new SearchParams(newVal);
                if (!SearchParams.equals(newParams, this.value)) {
                    this.$emit('input', newParams);
                }
            },
            deep: true
        }
    },
    methods: {
        toggleDeleted() {
            const p = this.params.clone();
            p.showDeleted = !p.showDeleted;
            this.params = p;
        },
        toggleHidden() {
            const p = this.params.clone();
            p.showHidden = !p.showHidden;
            this.params = p;
        }
    }
}

</script>
