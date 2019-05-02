<template>
    <div>
        <h3>Params</h3>
        <input type="text" v-model="params.start" />
        <input type="text" v-model="params.pageSize" />
        <input type="text" v-model="params.filterText" />
    </div>
</template>

<script>

import { SearchParams } from "./model";

export default {
    props: {
        value: { type: SearchParams, required: true }
    },
    computed: {
        params() {
            return this.value;
        }
    }
}

</script>
