<template>
    <BModal v-model="dialogIsOpen" content-class="uploader" :title="title | localize" v-bind="$attrs" v-on="$listeners">
        <ConfigProvider v-slot="config">
            <UploadOptions :config="config" v-slot="{ extensions, genomes, loading: optionsLoading }">
                <Uploader :config="config" v-slot="{ loading: active, queue, add, cancel, reset, start, pause }">
                    <Loading
                        v-if="optionsLoading || !config"
                        message="Loading required information from Galaxy server."
                    />
                    <UploadDialog
                        v-else
                        :config="config"
                        :active="active"
                        :queue="queue"
                        :genomes="genomes"
                        :extensions="extensions"
                        @add="add"
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
