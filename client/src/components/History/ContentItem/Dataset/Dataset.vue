<template>
    <DatasetUI
        v-if="dataset"
        v-bind="$attrs"
        v-on="$listeners"
        :dataset="dataset"
        @update:dataset="onUpdate"
        @delete="onDelete"
        @undelete="onUndelete"
        @unhide="onUnhide"
    />
</template>

<script>
import DatasetUI from "./DatasetUI";
import { Dataset } from "../../model";
import { deleteContent, updateContentFields } from "../../model/queries";
import { cacheContent } from "../../caching";

export default {
    components: {
        DatasetUI,
    },
    props: {
        item: { type: Object, required: true },
    },
    computed: {
        dataset() {
            return new Dataset(this.item);
        },
    },
    methods: {
        async onDelete(opts = {}) {
            const ajaxResult = await deleteContent(this.item, opts);
            await cacheContent(ajaxResult);
        },
        async onUnhide() {
            await this.onUpdate({ visible: true });
        },
        async onUndelete() {
            await this.onUpdate({ deleted: false });
        },
        async onUpdate(changes) {
            const newContent = await updateContentFields(this.item, changes);
            await cacheContent(newContent);
        },
    },
};
</script>
