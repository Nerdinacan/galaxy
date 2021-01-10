<template>
    <BModal v-model="dialogIsOpen" content-class="uploader" :title="title | localize" v-bind="$attrs" v-on="$listeners">
        <ConfigProvider v-slot="config">
            <UploadOptions v-slot="{ loading: optionsLoading, ...options }">
                <Uploader
                    :config="config"
                    :options="options"
                    v-slot="{ loading: active, queue, extensions, genomes, defaultGenome, defaultExtension, handlers }"
                >
                    <Loading
                        v-if="optionsLoading || !config"
                        message="Loading required information from Galaxy server."
                    />
                    <UploadDialog
                        v-else
                        :active="active"
                        :queue="queue"
                        :default-genome="defaultGenome"
                        :default-extension="defaultExtension"
                        :genomes="genomes"
                        :extensions="extensions"
                        v-on="handlers"
                    />
                </Uploader>
            </UploadOptions>
        </ConfigProvider>
    </BModal>
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
