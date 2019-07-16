<template>
    <a ref="link" class="fa" :class="iconClass" @click="onClick"
        :title="title | localize"
        tabindex="0">
        <span>{{ title }}</span>
        <b-tooltip v-if="useTooltip"
            ref="tooltip"
            :target="() => $refs['link']"
            :title="title"
            :placement="tooltipPlacement"
            :delay="100"
            boundary="window" />
    </a>
</template>


<script>

export default {
    props: {
        title: { type: String, required: false, default: "" },
        icon: { type: String, required: true, default: "cog" },
        tooltipPlacement: { type: String, required: false, default: "auto" },
        useTooltip: { type: Boolean, required: false, default: true }
    },
    computed: {
        iconClass() {
            return this.icon ? `fa-${this.icon}` : "";
        }
    },
    methods: {
        onClick(evt) {
            this.$refs.tooltip.$emit('close');
            this.$emit('click', evt)
        }
    }
}

</script>


<style lang="scss" scoped>

@import "scss/theme/blue.scss";
@import "scss/mixins.scss";

a {
    font-size: 1rem;
    cursor: pointer;
    &:hover {
        // have to do this because base.scss is so restrictive
        color: $brand-info!important;
    }
    span {
        @include forScreenReader();
    }
}

</style>
