<template>
    <Layout>
        <template v-slot>
            <UploadQueue v-if="queue.length" :queue="queue" v-on="$listeners" />
            <DropFiles v-else>
                <h3>
                    <i class="fa fa-files-o"></i>
                    <span v-localize>Drop files here, muthafucka!</span>
                </h3>
            </DropFiles>
        </template>

        <template v-slot:buttons>
            <b-button-toolbar>
                <FileSelectorButton class="ml-2" multiple @select="queueFile">
                    <span v-localize>Choose Local Files</span>
                </FileSelectorButton>

                <b-button class="ml-2">
                    <span v-localize>Paste/Fetch Data</span>
                </b-button>

                <!-- play/pause -->
                <b-button-group class="ml-2">
                    <b-button
                        :variant="variant"
                        :pressed="active"
                        :disabled="empty"
                        :aria-label="'Start' | l"
                        @click="$emit('start')"
                    >
                        <span v-localize>Start</span>
                    </b-button>
                    <b-button
                        :variant="variant"
                        :pressed="!active"
                        :disabled="empty"
                        :aria-label="'Pause' | l"
                        @click="$emit('pause')"
                    >
                        <span v-localize>Pause</span>
                    </b-button>
                </b-button-group>

                <b-button class="ml-2" :disabled="empty" @click="$emit('reset')">
                    <span v-localize>Reset</span>
                </b-button>

                <!-- <b-button class="mx-1">
                    <span v-localize>Select</span>
                </b-button> -->
            </b-button-toolbar>
        </template>
    </Layout>
</template>

<script>
import { BButton, BButtonGroup, BButtonToolbar } from "bootstrap-vue";
import { FileSelectorButton, DropFiles } from "../FileSelection";
import Layout from "./Layout";
import UploadQueue from "./UploadQueue";

export default {
    components: {
        Layout,
        DropFiles,
        UploadQueue,
        BButton,
        BButtonGroup,
        BButtonToolbar,
        FileSelectorButton,
    },
    props: ["queue", "active", "defaultGenome", "defaultExtension"],
    computed: {
        empty() {
            return this.queue.length == 0;
        },
        variant() {
            return this.empty ? "secondary" : "info";
        },
    },
    methods: {
        queueFile(file) {
            const { defaultExtension: extension, defaultGenome: genome } = this;
            const opts = { extension, genome };
            this.$emit("add", { file, opts });
        },
    },
};
</script>
