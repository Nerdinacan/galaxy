<template>
    <div class="dataset" :data-state="state">

        <nav class="content-top-menu d-flex justify-content-between"
            @click="toggle('expand')">

            <icon-menu class="status-menu">
                <!-- <icon-menu-item v-if="showSelection"
                    icon="check"
                    :active="selected"
                    @click.stop="toggleSelection" /> -->
                <icon-menu-item :active="expanded"
                    :icon="expanded ? 'chevron-up' : 'chevron-down'"
                    @click.stop="toggle('expand')" />
                <!--
                <icon-menu-item icon="clock-o" />
                <icon-menu-item icon="eye-slash" />
                <icon-menu-item icon="pause" />
                <icon-menu-item icon="exclamation" />
                -->
            </icon-menu>

            <icon-menu>
                <icon-menu-item v-if="expanded"
                    title="View Details"
                    icon="info-circle"
                    tooltip-placement="topleft" />
                <icon-menu-item v-if="expanded"
                    title="Tool Help"
                    icon="question"
                    tooltip-placement="topleft" />
                <icon-menu-item
                    title="View Data"
                    icon="eye"
                    tooltip-placement="topleft" />
                <icon-menu-item
                    title="Edit Attributes"
                    icon="pencil"
                    tooltip-placement="topleft" />
            </icon-menu>
        </nav>

        <header class="px-3 py-2">
            <h4><a href="#" @click="toggle('expand')">{{ content.element_identifier }}</a></h4>
        </header>

        <transition name="shutterfade">
            <div v-if="expanded" class="details px-3 pb-3">
                <dataset-summary :dataset="content.object" class="summary" />
            </div>
        </transition>

    </div>
</template>


<script>

import { IconMenu, IconMenuItem } from "components/IconMenu";
import Summary from "components/History/Content/Dataset/Summary";

export default {
    components: {
        IconMenu,
        IconMenuItem,
        "dataset-summary": Summary
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            expand: false
        }
    },
    computed: {
        expanded() {
            return this.expand;
        },
        state() {
            return this.content.object.state || "ok";
        }
    },
    methods: {

        toggle(paramName, forceVal) {
            if (!(paramName in this)) {
                console.warn("Missing toggle parameter", paramName);
                return;
            }
            if (forceVal === undefined) {
                this[paramName] = !this[paramName];
            } else {
                this[paramName] = forceVal;
            }
        },

    }
}

</script>
