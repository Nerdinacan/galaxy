<template>
    <b-table :items="items" primary-key="name" :fields="fields"></b-table>
</template>

<!--
<b-list-group>
    <b-list-group-item v-for="({ file, status }, index) in queue" :key="index">
        {{ file.name }}, {{ status }}
        <b-button @click="$emit('cancel', index)">Delete</b-button>
    </b-list-group-item>
</b-list-group>
-->

<script>
import { BTable } from "bootstrap-vue";

export default {
    components: {
        BTable,
    },
    props: {
        queue: { type: Array, default: () => [] },
        genomes: { type: Array, default: () => [] },
        extensions: { type: Array, default: () => [] },
        defaultGenome: { type: String, required: false, default: "" },
        defaultExtension: { type: String, required: false, default: "" },
    },
    computed: {
        items() {
            return this.queue.map(({ file, status }) => {
                const { name, size } = file;
                return { name, size, ...status };
            });
        },
        fields() {
            return ["name", "size", "extension", "genome"];
        },
    },
};
</script>
