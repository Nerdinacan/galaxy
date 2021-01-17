<template>
    <div>
        <b-button ref="settingsButton" size="sm" variant="info" :aria-label="'Upload Configuration' | l">
            <span class="fa fa-icon fa-gear"></span>
            <span class="sr-only" v-localize>Upload Configuration</span>
        </b-button>

        <b-popover
            ref="settingsPopover"
            :title="'Upload Configuration' | localize"
            :target="() => $refs.settingsButton"
            triggers="click blur"
            placement="auto"
        >
            <template v-slot:title>
                <b-button
                    size="sm"
                    class="p-0 m-0"
                    variant="primary"
                    :aria-label="'Close Configuration' | localize"
                    @click.prevent="() => $refs.settingsPopover.$emit('close')"
                >
                    <span v-localize>Upload Configuration (Close)</span>
                </b-button>
            </template>

            <b-form-checkbox v-model="spacesToTabs">
                <span v-localize>Convert Spaces To Tabs</span>
            </b-form-checkbox>

            <b-form-checkbox v-model="posixThing">
                <span v-localize>Use POSIX standard</span>
            </b-form-checkbox>
        </b-popover>
    </div>
</template>

<script>
import { BButton, BPopover, BFormCheckbox } from "bootstrap-vue";

export default {
    components: {
        BPopover,
        BButton,
        BFormCheckbox,
    },
    props: {
        options: { type: Object, required: true },
    },
    computed: {
        spacesToTabs: {
            get() {
                return this.options.space_to_tab;
            },
            set(val) {
                this.$emit("patch", { space_to_tab: val });
            },
        },
        posixThing: {
            get() {
                return this.options.to_posix_lines;
            },
            set(val) {
                this.$emit("patch", { to_posix_lines: val });
            },
        },
    },
};
</script>
