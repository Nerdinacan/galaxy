<template>
    <b-modal
        v-model="dialogIsOpen"
        :title="title | localize"
        title-tag="h4"
        header-class="no-separator"
        modal-class="ui-modal"
        dialog-class="upload-dialog"
        body-class="upload-dialog-body"
        centered
        scrollable
        no-enforce-focus
        hide-footer
    >
        <ConfigProvider v-slot="config">
            <UploadOptions v-slot="{ extensions, genomes, loading }">
                <loading-span v-if="!config || loading" message="Loading required information from Galaxy server." />
                <UploadDialog v-else :config="config" :genomes="genomes" :extensions="extensions" />
            </UploadOptions>
        </ConfigProvider>
    </b-modal>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { BModal } from "bootstrap-vue";
import ConfigProvider from "components/providers/ConfigProvider";
import UploadOptions from "./providers/UploadOptions";
import UploadDialog from "./UploadDialog";
import LoadingSpan from "components/LoadingSpan";

export default {
    components: {
        BModal,
        ConfigProvider,
        UploadOptions,
        UploadDialog,
        LoadingSpan,
    },
    props: {
        title: { type: String, default: "Download from web or upload from disk" },
    },
    computed: {
        ...mapState("upload", ["isOpen"]),

        dialogIsOpen: {
            get() {
                return this.isOpen;
            },
            set(val) {
                this.setIsOpen(val);
            },
        },
    },
    methods: {
        ...mapMutations("upload", ["setIsOpen"]),
    },
};
</script>
