<template>
    <BModal v-model="dialogIsOpen" :title="title | localize" v-bind="$attrs" v-on="$listeners">
        <ConfigProvider v-slot="config">
            <UploadOptions v-slot="{ extensions, genomes, loading: optionsLoading }">
                <Uploader v-bind="config" v-slot="{ queue, enqueue, cancel, reset, start, pause }">
                    <Loading
                        v-if="!config || optionsLoading"
                        message="Loading required information from Galaxy server."
                    />
                    <UploadDialog
                        v-else
                        :config="config"
                        :genomes="genomes"
                        :extensions="extensions"
                        :queue="queue"
                        @add="enqueue"
                        @cancel="cancel"
                        @reset="reset"
                        @start="start"
                        @pause="pause"
                    />
                </Uploader>
            </UploadOptions>
        </ConfigProvider>
    </BModal>
</template>

<script>
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import { BModal, BootstrapVueIcons } from "bootstrap-vue";
import ConfigProvider from "components/providers/ConfigProvider";
import UploadOptions from "./providers/UploadOptions";
import Uploader from "./providers/Uploader";
import UploadDialog from "./UploadDialog";
import Loading from "./Loading";

Vue.use(BootstrapVueIcons);

export default {
    components: {
        BModal,
        ConfigProvider,
        UploadOptions,
        Uploader,
        UploadDialog,
        Loading,
    },
    props: {
        title: { type: String, default: "" },
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
