<template>
    <b-button-toolbar>
        <FileSelectorButton class="ml-2" multiple @select="$emit('selectFile', $event)">
            <span v-localize>Choose Local Files</span>
        </FileSelectorButton>

        <b-button class="ml-2">
            <span v-localize>Paste/Fetch Data</span>
        </b-button>

        <PlayPause class="ml-2" :active.sync="isActive" :disabled="empty"></PlayPause>

        <b-button class="ml-2" :disabled="empty" @click.prevent="$emit('reset')">
            <span class="fa fa-icon fa-undo"></span>
            <span class="sr-only" v-localize>Reset</span>
        </b-button>
    </b-button-toolbar>
</template>

<script>
import { BButton, BButtonToolbar } from "bootstrap-vue";
import { FileSelectorButton } from "components/FileSelection";
import { uploadProps } from "../helpers";
import PlayPause from "../PlayPause";

export default {
    components: {
        BButton,
        BButtonToolbar,
        FileSelectorButton,
        PlayPause,
    },
    props: uploadProps,
    computed: {
        empty() {
            return this.queue.length == 0;
        },
        isActive: {
            get() {
                return this.active;
            },
            set(val) {
                const evt = val ? "startUploader" : "pauseUploader";
                this.$emit(evt);
            },
        },
    },
};
</script>
