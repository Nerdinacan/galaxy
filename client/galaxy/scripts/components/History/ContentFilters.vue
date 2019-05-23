<template>
    <div v-if="params">
        <b-input-group>
            <debounced-input v-model.trim="params.filterText">
                <b-form-input slot-scope="scope" size="sm"
                    :value="scope.value" @input="scope.input"
                    :placeholder="'Search Filter' | localize" />
            </debounced-input>
            <b-input-group-append>
                <b-button size="sm"
                    :variant="params.showDeleted ? 'info' : 'secondary'"
                    :pressed.sync="params.showDeleted">
                    {{ 'Deleted' | localize }}
                </b-button>
                <b-button size="sm"
                    :variant="params.showHidden ? 'info' : 'secondary'"
                    :pressed.sync="params.showHidden">
                    {{ 'Hidden' | localize }}
                </b-button>
            </b-input-group-append>
        </b-input-group>
    </div>
</template>


<script>

import { SearchParams } from "./model/SearchParams";
import DebouncedInput from "components/Form/DebouncedInput";

export default {
    components: {
        DebouncedInput
    },
    props: {
        value: { type: SearchParams, required: true }
    },
    data() {
        return {
            params: this.value.clone()
        }
    },
    watch: {
        value(newValue) {
            this.params = this.value.clone();
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
    }
}

</script>
