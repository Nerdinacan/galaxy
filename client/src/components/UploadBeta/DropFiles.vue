<template>
    <div class="dropzone" v-bind="$attrs" v-on="$listeners" @drop="dropFiles">
        <slot></slot>
    </div>
</template>

<script>
export default {
    methods: {
        dropFiles(...args) {
            console.log("dropFiles", args);
        },
    },
};
</script>