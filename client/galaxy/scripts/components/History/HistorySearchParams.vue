<template>
    <form>
        <!-- <input type="text" v-model="params.start" />
        <input type="text" v-model="params.pageSize" /> -->
        <input type="text" v-model="params.filterText" />
    </form>
</template>

<script>

import { SearchParams } from "./model";

export default {
    props: {
        value: { type: SearchParams, required: true }
    },
    data() {
        return {
            params: this.value.clone()
        }
    },
    watch: {
        params: {
            handler(newVal) {
                let newParams = new SearchParams(newVal);
                if (!SearchParams.equals(newParams, this.value)) {
                    this.$emit('input', newParams);
                }
            },
            deep: true
        }
    }
}

</script>
