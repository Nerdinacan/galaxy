<template>
    <vue-tags-input
        v-model="tagText"
        :tags="tagModels"
        @before-adding-tag="() => false"
        @before-deleting-tag="() => false">
        <div slot="tag-center" 
            slot-scope="tagProps" 
            @click="$emit('tag-click', tagProps.tag)">
            {{ tagProps.tag.text }}
        </div>
    </vue-tags-input>
</template>


<script>

import VueTagsInput from "@johmun/vue-tags-input";
import { createTag } from "./model";

export default {
    components: {
        VueTagsInput
    },
    props: {
        tags: { type: Array, required: false, default: () => [] }
    },
    data() {
        return { 
            // vue-tags-input wants a v-model even
            // if we don't use it
            tagText: "" 
        }
    },
    computed: {
        tagModels() {
            return this.tags.map(createTag);
        }
    }
}

</script>
