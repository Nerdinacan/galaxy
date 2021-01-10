<template>
    <div class="dropzone" v-bind="$attrs" v-on="$listeners" @drop="dropFiles">
        <slot></slot>
    </div>
</template>

<script>
export default {
    methods: {
        dropFiles(...args) {
            console.log("dropFiles", ...args);
        },
    },
};
</script>

<style lang="scss">
/* load color variables */
@import "~bootstrap/scss/_functions.scss";
@import "theme/blue.scss";
@import "~bootstrap/scss/bootstrap.scss";
@import "~bootstrap-vue/src/index.scss";
@import "overrides.scss";

.dropzone {
    border: 1px dotted $border-color;
    height: 20rem;
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
}
</style>
