<template>
    <div>
        <a href="#" @click.prevent="toggle">Toggle Me</a>
        <div v-if="show">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            show: false
        }
    },
    methods: {
        toggle() {
            this.show = !this.show;
        }
    }
}
</script>