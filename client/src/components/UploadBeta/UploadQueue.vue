<template>
    <b-list-group>
        <b-list-group-item v-for="(f, index) in queue" :key="index">
            {{ f.name }}, {{ f.size }}, {{ f.type }}, {{ f.lastModified }},
            <b-button @click="$emit('cancel', index)">Delete</b-button>
        </b-list-group-item>
    </b-list-group>
</template>

<script>
import { BListGroup, BListGroupItem } from "bootstrap-vue";

export default {
    components: {
        BListGroup,
        BListGroupItem,
    },
    props: {
        queue: { type: Array, default: () => [] },
    },
};
</script>
