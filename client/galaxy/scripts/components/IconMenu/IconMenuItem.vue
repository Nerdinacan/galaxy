<template>
    <a ref="link" :class="iconClasses"
        :tabindex="tabindex"
        :title="title | localize"
        @click.prevent.stop="onClick">
        <span>{{ title }}</span>
        <b-tooltip v-if="useTooltip"
            ref="tooltip"
            :target="() => $refs['link']"
            :title="title"
            :placement="tooltipPlacement"
            :delay="100"
            boundary="window"
        />
    </a>
</template>

 
<script>

export default {
    props: {
        title: { type: String, required: false, default: "" },
        icon: { type: String, required: true, default: "cog" },
        tooltipPlacement: { type: String, required: false, default: "auto" },
        useTooltip: { type: Boolean, required: false, default: true },
        disabled: { type: Boolean, required: false, default: false },
        active: { type: Boolean, required: false, default: false },
        tabindex: { type: Number, required: false, default: 0 }
    },
    computed: {
        iconClasses() {
            const { disabled, active } = this;
            return {
                fa: true,
                [`fa-${this.icon}`]: true,
                disabled,
                active
            }
        }
    },
    methods: {
        onClick(evt) {
            if (!this.disabled) {
                if (this.useTooltip && this.$refs.tooltip) {
                    this.$refs.tooltip.$emit('close');
                }
                this.$emit('click', evt)
            }
        }
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "scss/mixins.scss";

$icon-btn-color: $btn-default-color;
$icon-btn-bg: rgba(255,255,255,0.5); /* $btn-default-bg */

a {
    /* center icon */
    position: relative;
    &:before {
        @include absCenter();
    }

    /* sizing */
    height: 1.25rem;
    width: 1.25rem;
    line-height: 1.25rem;
    font-size: 125%;

    text-decoration: none;
    cursor: pointer;
    outline: 0;

    span {
        @include forScreenReader();
    }
}

/* coloring */
a {
    color: $icon-btn-color;
    background-color: $icon-btn-bg;

    &.disabled {
        color: #bbb;
    }
    &.active {
        color: white;
        background-color: $icon-btn-color;
    }
    &:focus, &:hover {
        color: white;
        background-color: $brand-info;
    }
}

</style>
