<template>
    <Droppable v-slot="{ handlers, dropContainerClasses }" @drop="dropFiles">
        <div :class="dropContainerClasses" v-on="handlers">
            <slot>
                <h3>
                    <i class="fa fa-files-o"></i>
                    <span v-localize>Drop files</span>
                </h3>
            </slot>
        </div>
    </Droppable>
</template>

<script>
import Droppable from "./Droppable";
export default {
    components: {
        Droppable,
    },
    methods: {
        dropFiles(evt) {
            const fileList = evt?.dataTransfer?.files || [];
            for (const file of fileList) {
                this.$emit("fileDrop", file);
            }
        },
    },
};
</script>
