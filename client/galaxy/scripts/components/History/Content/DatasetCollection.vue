<template>
    <div :data-state="content.populated_state"
        @keydown.self="onKeydown"
        @click.stop="drillDown">

        <nav class="content-top-menu d-flex justify-content-between">
            <icon-menu class="status-menu">
                <icon-menu-item v-if="showSelection"
                    :active="selected"
                    icon="check"
                    @click.stop="selected = !selected" />
            </icon-menu>

            <div class="hid flex-grow-1" v-if="content.hid">
                <span>{{ content.hid }}</span>
            </div>

            <icon-menu>
                <icon-menu-item ref="deleteButton"
                    title="Delete Collection"
                    icon="trash"
                    tooltip-placement="topleft" />
            </icon-menu>
        </nav>

        <header class="px-3 py-2" v-if="content">
            <h4><a href="#">{{ content.name }}</a></h4>
            <p class="m-0">
                a {{ collectionType | localize }}
                {{ collectionCount | localize }}
            </p>
            <a target="_new" :href="content.url">{{ content.id }}</a>
        </header>

        <b-popover ref="deleteMenu"
            :target="() => $refs['deleteButton']"
            placement="bottomleft"
            triggers="click blur">

            <gear-menu #default="{ go }">
                <div @click.stop="$refs.downloadMenu.$emit('close')">
                    <a href="#" class="dropdown-item" @click="deleteCollection">
                        {{ 'Collection Only' | localize }}
                    </a>
                    <a href="#" class="dropdown-item" @click="deleteDatasets" >
                        {{ 'Delete Datasets' | localize }}
                    </a>
                    <a href="#" class="dropdown-item" @click="deletePermanently">
                        {{ 'Permanently Delete Datasets' | localize }}
                    </a>
                </div>
            </gear-menu>

        </b-popover>

    </div>
</template>


<script>

import { mapGetters, mapActions } from "vuex";
import { tap, pluck } from "rxjs/operators";
import { getCachedContent } from "caching";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import GearMenu from "components/GearMenu";

export default {
    components: {
        GearMenu,
        IconMenu,
        IconMenuItem
    },
    props: {
        content: { type: Object, required: true },
        selected: { type: Boolean, required: false, default: false },
        showSelection: { type: Boolean, required: false, default: false }
    },
    computed: {

        collectionType() {
            switch(this.content.collection_type) {
                case "list":
                    return "list"
                case "paired":
                    return "dataset pair"
                case "list:paired":
                    return "list of pairs";
                default:
                    return "nested list";
            }
        },

        collectionCount() {
            const count = this.content.element_count;
            return count == 1 ? "with 1 item" : `with ${count} items`;
        }

    },
    methods: {

        ...mapActions("history", [
            "selectCollection"
        ]),

        toggleSelection() {
            this.$emit("update:selected", !this.selected);
        },

        drillDown() {
            const { history_id, type_id } = this.content;
            this.selectCollection({ history_id, type_id });
        },

        deleteCollection() {
            console.log("deleteCollection")
        },

        deleteDatasets() {
            console.log("deleteDatsets");
        },

        deletePermanently() {
            console.log("deletePermanently");
        },

        onKeydown(evt) {
            switch (evt.code) {
                case "Space":
                    if (this.showSelection) {
                        this.toggleSelection();
                    } else {
                        this.drillDown();
                    }
                    evt.preventDefault();
                    evt.stopPropagation();
                    break;
            }
        }
    }
}

</script>


<style lang="scss" scoped>

header, header * {
    cursor: pointer;
}

</style>
