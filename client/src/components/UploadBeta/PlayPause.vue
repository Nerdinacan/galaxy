<template>
    <b-button-group>
        <b-button
            v-bind="$attrs"
            :variant="active ? 'info' : 'secondary'"
            :pressed="!active"
            :aria-label="'Pause' | l"
            @click="$emit('toggle')"
        >
            <span class="fa fa-icon fa-pause"></span>
            <span class="sr-only" v-localize>Pause</span>
        </b-button>
        <b-button
            v-bind="$attrs"
            :variant="!active ? 'info' : 'secondary'"
            :pressed="active"
            :aria-label="'Start' | l"
            @click="$emit('toggle')"
        >
            <span class="fa fa-icon fa-play"></span>
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
        // play state is active
        active: { type: Boolean, required: true },
    },
};
</script>