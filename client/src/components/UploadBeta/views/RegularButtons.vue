<template>
    <b-button-toolbar>
        <FileSelectorButton class="ml-2" multiple @select="$emit('selectFile', $event)">
            <span v-localize>Choose Local Files</span>
        </FileSelectorButton>

        <b-button class="ml-2">
            <span v-localize>Paste/Fetch Data</span>
        </b-button>

        <PlayPause class="ml-2" @toggle="$emit('toggleUploader')" :active="active" :disabled="empty"></PlayPause>

        <b-button class="ml-2" :disabled="empty" @click.prevent="$emit('reset')">
            <span v-localize>Reset</span>
        </b-button>

        <!-- <b-button class="mx-1">
            <span v-localize>Select</span>
        </b-button> -->
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
    },
};
</script>
