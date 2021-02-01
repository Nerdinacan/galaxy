<template>
    <DatasetUI
        v-if="dataset"
        v-bind="$attrs"
        v-on="$listeners"
        :dataset="dataset"
        @update:dataset="$emit('update:item', $event)"
        @copy-link="onCopyLink(dataset)"
    />
</template>

<script>
import DatasetUI from "./DatasetUI";
import { Dataset } from "../../model";
import { copy as sendToClipboard } from "utils/clipboard";
import { absPath } from "utils/redirect";

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
        onCopyLink() {
            const relPath = this.dataset.getUrl("download");
            const msg = this.localize("Link is copied to your clipboard");
            sendToClipboard(absPath(relPath), msg);
        },
    },
};
</script>
