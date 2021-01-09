<template>
    <layout>
        <div>
            <UploadQueue :queue="queue" v-on="$listeners" />
            <!-- <drop-area v-else /> -->
        </div>

        <template v-slot:buttons>
            <b-button-toolbar>
                <FileSelectorButton multiple @select="$emit('add', $event)">
                    <span v-localize>Select Stuff</span>
                </FileSelectorButton>

                <b-button class="mx-1">
                    <span v-localize>Paste/Fetch Data</span>
                </b-button>

                <b-button-group class="mx-1">
                    <b-button @click="$emit('start')">
                        <span v-localize>Start</span>
                    </b-button>
                    <b-button @click="$emit('pause')">
                        <span v-localize>Pause</span>
                    </b-button>
                    <b-button @click="$emit('reset')">
                        <span v-localize>Reset</span>
                    </b-button>
                </b-button-group>

                <b-button class="mx-1">
                    <span v-localize>Select</span>
                </b-button>
            </b-button-toolbar>
        </template>
    </layout>
</template>

<script>
import { BButton, BButtonGroup, BButtonToolbar } from "bootstrap-vue";
import Layout from "./Layout";
import UploadQueue from "./UploadQueue";
// import DropArea from "./DropArea";
import FileSelectorButton from "./FileSelectorButton";

export default {
    components: {
        Layout,
        // DropArea,
        UploadQueue,
        BButton,
        BButtonGroup,
        BButtonToolbar,
        FileSelectorButton,
    },
    props: {
        queue: { type: Array, default: () => [] },
    },
    methods: {
        addFiles(fileList) {
            for (let idx = 0; idx < fileList.length; idx++) {
                const f = fileList.item(idx);
                console.log("add file", f);
            }
        },
        selectLocalFiles() {
            debugger;
            this.$refs.selectorInput.click();
        },
        // async selectLocalFiles() {
        //     const selection = await window.showOpenFilePicker(this.filePickerOpts);
        //     const filePromises = selection.filter((fh) => fh.kind == "file").map((fh) => fh.getFile());
        //     console.log(filePromises);

        //     // .map((fh) => fh.getFile())
        //     // const files = await Promise.all(filePromises);
        //     // files.forEach((f) => this.$emit("add", f));
        // },
    },
};
</script>
