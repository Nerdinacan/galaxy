<template>
    <b-modal v-model="dialogIsOpen" v-on="$listeners" v-bind="$attrs" dialog-class="upload-beta-dialog">
        <ConfigProvider v-slot="config">
            <ExtensionProvider v-slot="{ loading: extensionsLoading, extensions }">
                <GenomeProvider v-slot="{ loading: genomesLoading, genomes }">
                    <Uploader :config="config" :fields="extraFields" v-slot="{ uploadProps, uploadHandlers }">
                        <Loading v-if="extensionsLoading || genomesLoading || !config" />
                        <UploadDialog
                            v-else
                            v-bind="uploadProps"
                            v-on="uploadHandlers"
                            :config="config"
                            :genomes="genomes"
                            :extensions="extensions"
                        />
                    </Uploader>
                </GenomeProvider>
            </ExtensionProvider>
        </ConfigProvider>
    </b-modal>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { BModal } from "bootstrap-vue";
import ConfigProvider from "components/providers/ConfigProvider";
import { GenomeProvider, ExtensionProvider } from "./providers/OptionLists";
import Uploader from "./providers/Uploader";
import UploadDialog from "./UploadDialog";
import Loading from "./Loading";

export default {
    components: {
        BModal,
        ConfigProvider,
        GenomeProvider,
        ExtensionProvider,
        Uploader,
        UploadDialog,
        Loading,
    },
    data() {
        return {
            // todo, get from configs or props
            extraFields: {
                tool_id: "upload1",
                history_id: "153f67c9d7e0d19a",
            },
        };
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

<style lang="scss">
@import "~bootstrap/scss/_functions.scss";
@import "theme/blue.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";
@import "overrides.scss";
@import "scss/mixins.scss";

.upload-beta-dialog.modal-dialog {
    width: 80vw;
    max-width: 80vw;

    .modal-header {
        border: none;
    }

    .drop-files,
    .queue-display {
        height: 50vh;
    }

    .drop-files {
        border: 1px dotted $border-color;
        user-select: none;
        color: $border-color;
        &.drop-hover {
            border-color: transparent;
            background: $brand-info;
            color: white;
        }
    }

    .queue-display {
        table {
            background: white;
        }
        &.drop-hover {
            background: $brand-info;
        }
    }
}
</style>
