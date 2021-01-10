<template>
    <b-modal v-model="dialogIsOpen" content-class="uploader" v-on="$listeners" v-bind="$attrs">
        <ConfigProvider v-slot="config">
            <UploadOptions v-slot="{ loading, ...options }">
                <Uploader :config="config" :options="options" v-slot="{ uploadProps, uploadHandlers }">
                    <Loading v-if="loading || !config" />
                    <UploadDialog v-else v-bind="uploadProps" v-on="uploadHandlers" />
                </Uploader>
            </UploadOptions>
        </ConfigProvider>
    </b-modal>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { BModal } from "bootstrap-vue";
import ConfigProvider from "components/providers/ConfigProvider";
import UploadOptions from "./providers/UploadOptions";
import Uploader from "./providers/Uploader";
import UploadDialog from "./UploadDialog";
import Loading from "./Loading";

export default {
    components: {
        BModal,
        ConfigProvider,
        UploadOptions,
        Uploader,
        UploadDialog,
        Loading,
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
        testo(evt) {
            console.log("start event");
        },
    },
};
</script>

<style>
.uploader {
    .modal-header {
        border: none;
    }
    .dropzone,
    .table {
        height: 40vh;
    }
}
</style>
