<!-- TODO: I need to rewrite this whole module because it has some truly amazing structural problems
but for now, this will guarantee that the configs have been loaded prior to trying to run the 
upload modal -->

<template>
    <ConfigProvider
        v-slot="{
            nginx_upload_path,
            chunk_upload_size,
            file_sources_configured,
            ftp_upload_site,
            default_genome,
            default_extension,
        }"
    >
        <UploadModal
            v-model="showModal"
            v-bind="$attrs"
            v-on="$listeners"
            :upload-path="nginx_upload_path || toolPath"
            :chunk-upload-size="chunk_upload_size"
            :file-sources-configured="file_sources_configured"
            :ftp-upload-site="ftp_upload_site"
            :default-genome="default_genome"
            :default-extension="default_extension"
        />
    </ConfigProvider>
</template>

<script>
import { getAppRoot } from "onload";
import ConfigProvider from "../providers/ConfigProvider";
import UploadModal from "./UploadModal";

export default {
    components: {
        ConfigProvider,
        UploadModal,
    },
    props: {
        value: { type: Boolean, required: false, default: false },
    },
    computed: {
        toolPath() {
            const appRoot = getAppRoot();
            return `${appRoot}api/tools`;
        },
        showModal: {
            get() {
                return this.value;
            },
            set(newVal) {
                this.$emit("input", newVal);
            },
        },
    },
};
</script>
