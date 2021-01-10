<template>
    <div class="d-flex flex-column">
        <header v-if="hasSlot('message')" class="flex-grow-0">
            <slot name="message"></slot>
        </header>
        <div class="flex-grow-1 mt-2">
            <slot name="default"></slot>
        </div>
        <footer v-if="hasSlot('footer')" class="flex-grow-0 mt-2">
            <slot name="footer"></slot>
        </footer>
        <footer v-if="hasSlot('buttons')" class="d-flex justify-content-end flex-grow-0 mt-2">
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
