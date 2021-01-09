<!-- container for an uploadBox -->
<template>
    <div>
        <header class="upload-top">
            <div class="upload-top-info">
                <slot name="header">
                    <p>Header Default Content</p>
                </slot>
            </div>
        </header>

        <div class="upload-box" ref="uploadBox">
            <slot name="default">
                <p>Default Slot</p>
            </slot>
        </div>

        <footer class="upload-footer">
            <div>
                <slot name="footer">
                    <p>Footer Default</p>
                </slot>
            </div>
            <div class="buttons">
                <slot name="buttons">
                    <p>Buttons Default</p>
                </slot>
            </div>
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
