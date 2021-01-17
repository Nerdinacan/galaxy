<template>
    <b-tr>
        <b-td class="align-middle p-1">
            <ClickToEdit size="sm" tag-name="h5" class="p-0 m-0" v-model="name" @keyup.native.enter.prevent="blurMe" />
        </b-td>
        <b-td class="text-nowrap">
            {{ file.size | bytes }}
        </b-td>
        <b-td>
            <TypeAhead :options="extensions" v-model="extension" />
        </b-td>
        <b-td>
            <TypeAhead :options="genomes" v-model="genome" />
        </b-td>
        <b-td class="text-center">
            <b-button-toolbar>
                <SettingsPopup :options="options" @patch="patchUploadOptions" />

                <b-button
                    class="ml-1"
                    size="sm"
                    variant="info"
                    :aria-label="'Cancel Upload' | l"
                    @click="$emit('remove', file)"
                >
                    <span class="fa fa-icon fa-trash"></span>
                    <span class="sr-only" v-localize>Delete</span>
                </b-button>

                <PlayPause size="sm" class="ml-1" :active="active" @toggle="$emit('toggleFile', file)"></PlayPause>
            </b-button-toolbar>
        </b-td>
    </b-tr>
</template>

<script>
import prettyBytes from "pretty-bytes";
import ClickToEdit from "components/ClickToEdit";
import TypeAhead from "../TypeAhead";
import SettingsPopup from "./SettingsPopup";
import STATUS from "../status";
import PlayPause from "../PlayPause";
import { BButton, BButtonToolbar } from "bootstrap-vue";

export default {
    components: {
        ClickToEdit,
        TypeAhead,
        SettingsPopup,
        PlayPause,
        BButton,
        BButtonToolbar,
    },
    filters: {
        bytes: prettyBytes,
    },
    props: {
        file: { type: File, required: true },
        options: { type: Object, required: true },
        status: { type: Object, required: true },
        genomes: { type: Array, required: true },
        extensions: { type: Array, required: true },
    },
    computed: {
        name: {
            get() {
                return this.options.name || this.file.name;
            },
            set(newName) {
                this.patchUploadOptions({ name: newName });
            },
        },
        genome: {
            get() {
                return this.options.genome || "";
            },
            set(option) {
                this.patchUploadOptions({ genome: option.text });
            },
        },
        extension: {
            get() {
                return this.options.extension || "";
            },
            set(option) {
                this.patchUploadOptions({ extension: option.text });
            },
        },
        active() {
            return this.status.id != STATUS.PAUSED.id;
        },
    },
    methods: {
        patchUploadOptions(patch = {}) {
            this.$emit("add", {
                file: this.file,
                options: { ...this.options, ...patch },
            });
        },
        // move into clickToEdit?
        blurMe(evt) {
            evt.srcElement.blur();
            evt.target.blur();
        },
    },
};
</script>

<style scoped>
.clickToEdit {
    max-width: 25vw;
}
</style>
