<template>
    <b-button v-bind="$attrs" v-on="$listeners" @click="selectLocalFiles">
        <input ref="fileSelector" type="file" @change="selectFiles" :multiple="multiple" />
        <slot>
            <span>Select Files</span>
        </slot>
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
        selectFiles(evt) {
            const fileList = evt?.target?.files || [];
            for (let idx = 0; idx < fileList.length; idx++) {
                const f = fileList.item(idx);
                this.$emit("select", f);
            }
            evt.target.value = "";
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