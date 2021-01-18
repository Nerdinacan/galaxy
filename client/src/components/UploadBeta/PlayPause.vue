<!-- TODO: probably should replace this with a sliding pill radio but bootstrap doesn't have a good
one and I don't feel like making one right now -->

<template>
    <b-button-group>
        <b-button
            v-bind="$attrs"
            :pressed="!active"
            :variant="pauseVariant"
            :aria-label="'Stop' | l"
            @click="$emit('update:active', false)"
        >
            <span v-if="active" class="fa fa-icon fa-stop"></span>
            <span v-else class="fa fa-icon fa-stop"></span>
            <span class="sr-only" v-localize>Stop</span>
        </b-button>
        <b-button
            v-bind="$attrs"
            :pressed="active"
            :variant="playVariant"
            :aria-label="'Start' | l"
            @click="$emit('update:active', true)"
        >
            <span v-if="isRunning" class="fa fa-spinner fa-spin"></span>
            <span v-else class="fa fa-icon fa-play"></span>
            <span class="sr-only" v-localize>Start</span>
        </b-button>
    </b-button-group>
</template>

<script>
import { BButton, BButtonGroup } from "bootstrap-vue";

export default {
    components: {
        BButton,
        BButtonGroup,
    },
    props: {
        active: { type: Boolean, required: true },
        running: { type: Boolean, required: false, default: undefined },
    },
    computed: {
        isRunning() {
            return this.running === undefined ? this.active : this.running;
        },
        playVariant() {
            return "secondary";
            // return this.active ? "info" : "secondary";
        },
        pauseVariant() {
            return "secondary";
            // return this.active ? "secondary" : "info";
        },
    },
};
</script>