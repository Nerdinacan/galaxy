<template>
    <b-button v-bind="$attrs" @click="selectLocalFiles">
        <input ref="fileSelector" type="file" @change="selectFiles($event.target.files)" :multiple="multiple" />
        <slot>Select Files</slot>
    </b-button>
</template>

<script>
import { BButton } from "bootstrap-vue";

export default {
    components: {
        BButton,
    },
    props: {
        multiple: { type: Boolean, default: false },
    },
    methods: {
        selectLocalFiles() {
            this.$refs.fileSelector.click();
        },
        selectFiles(fileList) {
            for (let idx = 0; idx < fileList.length; idx++) {
                const f = fileList.item(idx);
                this.$emit("select", f);
            }
        },
    },
};
</script>

<style lang="css" scoped>
input[type="file"] {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}
</style>