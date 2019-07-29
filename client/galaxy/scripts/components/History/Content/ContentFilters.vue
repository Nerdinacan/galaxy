<template>
    <b-input-group v-if="params">

        <debounced-input v-model.trim="params.filterText">
            <b-form-input slot-scope="scope" size="sm" :value="scope.value" @input="scope.input"
                :placeholder="'Search Filter' | localize" />
        </debounced-input>

        <b-input-group-append>
            <b-button size="sm" v-if="history.contents_active.deleted"
                :variant="params.showDeleted ? 'info' : 'secondary'" 
                @click="params.showDeleted = !params.showDeleted">
                {{ 'Deleted' | localize }}
            </b-button>
            <b-button size="sm" v-if="history.contents_active.hidden"
                :variant="params.showHidden ? 'info' : 'secondary'" 
                @click="params.showHidden = !params.showHidden">
                {{ 'Hidden' | localize }}
            </b-button>
        </b-input-group-append>

    </b-input-group>
</template>


<script>

import { SearchParams } from "../model/SearchParams";
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
            params: this.value.clone()
        }
    },
    watch: {
        value(newValue, oldValue) {
            if (!SearchParams.equals(newValue, oldValue)) {
                this.params = this.value.clone();
            }
        },
        params: {
            handler(newVal) {
                if (!SearchParams.equals(newVal, this.value)) {
                    this.$emit('input', newVal);
                }
            },
            deep: true
        }
    }
}

</script>