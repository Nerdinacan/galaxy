<template>
    <div :data-state="content.populated_state"
        @keydown.self="onKeydown" @mouseover="focusMe">
        
        <nav class="content-top-menu d-flex justify-content-between">

            <icon-menu class="status-menu">
                <icon-menu-item v-if="showSelection"
                    :active="selected"
                    icon="check"
                    @click.stop="selected = !selected" />
            </icon-menu>
            
            <div class="hid flex-grow-1">
                <span>{{ content.hid }} {{ content.populated_state }}</span>
            </div>

            <icon-menu>
                <icon-menu-item ref="deleteButton"
                    title="Delete"
                    icon="trash"
                    tooltip-placement="topleft" />
            </icon-menu>
        </nav>

        <header class="px-3 py-2">
            <h4><a href="#" @click.stop="selectCollection">{{ content.name }}</a></h4>
        </header>


        <b-popover ref="deleteMenu"
            :target="() => $refs['deleteButton']"
            placement="bottomleft" 
            triggers="click blur">

            <gear-menu #default="{ go }">
                <div @click.stop="$refs.downloadMenu.$emit('close')">
                    <a class="dropdown-item" href="#">
                        {{ 'Delete Collection' | localize }}
                    </a>
                    <a class="dropdown-item" href="#">
                        {{ 'Delete Collection' | localize }}
                    </a>
                    <a class="dropdown-item" href="#">
                        {{ 'Delete Collection' | localize }}
                    </a>
                </div>
            </gear-menu>

        </b-popover>

    </div>
</template>


<script>

import { mapGetters, mapActions } from "vuex";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import GearMenu from "components/GearMenu";
import { eventHub } from "components/eventHub";

export default {
    components: {
        GearMenu,
        IconMenu, 
        IconMenuItem
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showSelection: false
        }
    },
    computed: {

        ...mapGetters("history", [
            "contentIsSelected"
        ]),

        selected: {
            get() {
                return this.contentIsSelected(this.content)
            },
            set(newValue) {
                const { content } = this;
                if (newValue) {
                    this.selectContentItem({ content });
                } else {
                    this.unselectContentItem({ content });
                }
            }
        },
    },
    methods: {

        ...mapActions("history", [
            "selectContentItem",
            "unselectContentItem",
            "setCurrentCollection"
        ]),

        selectCollection() {
            this.setCurrentCollection(this.content);
        },

        displaySelection(val) {
            this.showSelection = val;
        },

        onKeydown(evt) {
            switch (evt.code) {
                case "Space":
                    if (this.showSelection) {
                        this.selected = !this.selected;
                    } else {
                        this.selectCollection();
                    }
                    evt.preventDefault();
                    evt.stopPropagation();
                    break;
            }
        },

        focusMe() {
            this.$el.focus();
        }

    },

    created() {
        eventHub.$on('toggleShowSelection', this.displaySelection);
    },

    beforeDestroy() {
        eventHub.$off('toggleShowSelection', this.displaySelection);
    }
}

</script>
