<template>
    <ConfigProvider v-slot="config">
        <b-modal v-model="isOpen"
            title="Uploadxxorx!"
            title-tag="h4"
            centered
            scrollable
            header-class="no-separator"
            modal-class="ui-modal"
            dialog-class="upload-dialog"
            body-class="upload-dialog-body"
            no-enforce-focus
            hide-footer
        >
            <!-- <UploadData :config="config" /> -->
            <pre>{{ config }}</pre>
        </b-modal>
    </ConfigProvider>
</template>

<script>
import { BModal } from "bootstrap-vue";
import ConfigProvider from "../ConfigProvider";
import UploadData from "./UploadData";


export default {
    components: {
        BModal,
        ConfigProvider,
        UploadData
    },
    props: {
        value: { type: Boolean, required: true },
    },
    computed: {
        isOpen: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            }
        },
    },
}
</script>
