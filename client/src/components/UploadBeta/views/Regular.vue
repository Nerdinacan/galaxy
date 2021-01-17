<template>
    <Layout>
        <template v-slot>
            <UploadFileList
                v-if="queue.length"
                class="queue-display"
                v-bind="$props"
                v-on="$listeners"
                @fileDrop="addFile"
            />
            <DropFiles v-else class="drop-files d-flex justify-content-center align-items-center" @fileDrop="addFile" />
        </template>
        <template v-slot:buttons>
            <RegularButtons
                v-bind="$props"
                v-on="$listeners"
                :extensions="sortedExtensions"
                :genomes="sortedGenomes"
                @selectFile="addFile"
            />
        </template>
    </Layout>
</template>

<script>
import { uploadProps, genomeSort, textSort } from "../helpers";
import { DropFiles } from "components/FileSelection";
import Layout from "../Layout";
import UploadFileList from "../UploadFileList";
import RegularButtons from "./RegularButtons";

export default {
    components: {
        Layout,
        DropFiles,
        UploadFileList,
        RegularButtons,
    },

    props: uploadProps,

    data() {
        const { default_extension = "auto", default_genome = "?" } = this.config;

        // selected default vals
        return {
            genome: default_extension,
            extension: default_genome,
        };
    },

    computed: {
        sortedGenomes() {
            const list = Array.from(this.genomes);
            const sortFn = genomeSort(this.genome);
            list.sort(sortFn);
            return list;
        },
        sortedExtensions() {
            const list = Array.from(this.extensions);
            list.sort(textSort);
            return list;
        },
    },

    methods: {
        // Add some configuration from the local default vars
        addFile(file) {
            this.$emit("add", { file, options: this.$data });
        },
    },
};
</script>
