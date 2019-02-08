<template>
    <section class="history-details">

        <input v-model="history.name" />
        <div v-text="sizeDisplay"></div>

        <galaxy-tags v-if="showTags" 
            v-model="history.tags" 
            :use-toggle-link="false"
            :autocomplete-items="autocompleteItems"
            @tag-input-changed="loadAutoCompleteItems"
            @before-adding-tag="beforeAddingTag"
            @before-deleting-tag="beforeDeletingTag" />

        <textarea v-if="showAnnotation" 
            v-model="history.annotation"></textarea>

    </section>
</template>

<script>

import GalaxyTags from "components/Tags/GalaxyTags";
import { History } from "./model";

export default {
    components: {
        GalaxyTags
    },
    props: {
        history: { type: History, required: true }
    },
    data() {
        return {
            showAnnotation: true,
            showTags: true,
            autocompleteItems: []
        }
    },
    computed: {
        sizeDisplay() {
            return history.size;
        }
    },
    methods: {
        loadAutoCompleteItems() {
            console.log("loadAutoCompleteItems");
        },
        beforeAddingTag({ tag, addTag }) {
            console.log("beforeAddingTag");
            addTag(tag);
        },
        beforeDeletingTag({ tag, deleteTag }) {
            console.log("beforeDeletingTag");
            deleteTag(tag);
        }
    }
}

</script>

<style scoped lang="scss">

@import "theme/blue";
@import "scss/mixins";

input {
    font-size: 2em;
    padding: 0px;
    border: 0;

    &:focus {
        outline: none;
        padding: 2px;
        border: 1px solid #ccc;
    }
}

</style>