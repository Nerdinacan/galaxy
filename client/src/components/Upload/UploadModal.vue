<template>
    <b-modal
        :title="'Download from web or upload from disk' | localize"
        title-tag="h4"
        v-model="isOpen"
        centered
        scrollable
        header-class="no-separator"
        modal-class="ui-modal"
        dialog-class="upload-dialog"
        body-class="upload-dialog-body"
        no-enforce-focus
        hide-footer
    >
        <p>The modal!</p>
        <!-- <ConfigProvider v-slot="config">
            <UploadOptions v-slot="{ extensions, genomes, loading }">
                <loading-span v-if="loading" message="Loading required information from Galaxy server." />
                <UploadDataForm v-else :config="config" :genomes="genomes" :extensions="extensions" />
            </UploadOptions>
        </ConfigProvider> -->
    </b-modal>
</template>

<script>
import { BModal } from "bootstrap-vue";
import ConfigProvider from "../providers/ConfigProvider";
import UploadOptions from "./providers/UploadOptions";
import UploadDataForm from "./UploadDataForm";
import LoadingSpan from "components/LoadingSpan";

export default {
    components: {
        BModal,
        ConfigProvider,
        UploadOptions,
        UploadDataForm,
        LoadingSpan,
    },
    props: {
        // indicating whether it's open
        value: { type: Boolean, required: true },
    },
    computed: {
        // have to alias the toggle prop because bootstrap's b-modal won't pass down the props using
        // $attrs and $listeners as it supposed to
        isOpen: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit("input", val);
            },
        },
    },
};
</script>
