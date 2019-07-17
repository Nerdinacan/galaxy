<template>
    <component v-if="content" 
        :class="contentClassName"
        :is="contentItemComponent" 
        :content="content" />
</template>


<script>

import { of } from "rxjs";
import { DatasetItem } from "./Dataset";
import { DatasetCollectionItem } from "./DatasetCollection";
import dasherize from "underscore.string/dasherize";
import { getCachedContent } from "caching";

export default {
    props: {
        typeId: { type: String, required: true }
    },
    components: {
        "dataset": DatasetItem,
        "dataset_collection": DatasetCollectionItem
    },
    subscriptions() {
        return {
            content: of(this.typeId).pipe(getCachedContent())
        }
    },
    computed: {
        contentItemComponent() {
            return this.content.history_content_type;
        },
        contentClassName() {
            return dasherize(this.content.history_content_type);
        }
    }
}

</script>


<style>

.dataset, .dataset-collection {
    outline: none;
    border: none;
}

</style>
