<!-- container for an uploadBox -->
<template>
    <div class="d-flex flex-column">
        <header v-if="hasSlot('message')" class="upload-top flex-grow-0">
            <slot name="message"></slot>
        </header>

        <div class="upload-box flex-grow-1">
            <slot name="default"></slot>
        </div>

        <footer v-if="hasSlot('footer')" class="upload-footer flex-grow-0">
            <slot name="footer"></slot>
        </footer>

        <footer v-if="hasSlot('buttons')" class="upload-buttons d-flex justify-content-end flex-grow-0">
            <slot name="buttons"></slot>
        </footer>
    </div>
</template>

<script>
export default {
    methods: {
        hasSlot(name) {
            return name in this.$slots || name in this.$scopedSlots;
        },
    },
};
</script>
