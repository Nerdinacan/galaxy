<template>
    <section>

        <!-- top menu -->
        <header class="d-flex justify-content-between">
            <h6>{{ niceSize | localize }}</h6>
            <slot name="menu">
                <icon-menu class="no-border">
                    <icon-menu-item title="Edit History Tags"
                        icon="tags"
                        :active="showTags"
                        @click="toggle('showTags')"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyDownloadMenu" title="Downloads" icon="download"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyOperationsIcon" title="Current History Operations" icon="cog"
                        tooltip-placement="topleft" />
                </icon-menu>
            </slot>
        </header>

        <!-- title -->
        <click-to-edit v-model="historyName"
            tag-name="h2" class="history-title mt-4"
            ref="historyNameInput">
            <template v-slot:tooltip>
                <b-tooltip placement="left" :target="() => $refs.historyNameInput"
                    :title="'Click to rename history' | localize" />
            </template>
        </click-to-edit>

        <!-- description -->
        <annotation class="history-annotation mt-1" v-model="annotation" />

        <!-- tags -->
        <transition name="shutterfade">
            <history-tags v-if="showTags" class="history-tags mt-2" :history="history" />
        </transition>

        <!-- #region menus and modals -->

        <b-popover ref="downloadMenu" target="historyDownloadMenu" placement="bottomleft" triggers="click blur">
            <gear-menu #default="{ go }">
                <div @click="$refs.downloadMenu.$emit('close')">
                    <a class="dropdown-item" href="#" @click="go('/histories/citations')">
                        {{ 'Export Tool Citations' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="go('/histories/exportmaybe?')">
                        {{ 'Export History to File' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <b-popover ref="historyOperations" target="historyOperationsIcon" placement="bottomleft" triggers="click blur">
            <gear-menu #default="{ backboneGo, iframeGo }">
                <div @clicked="$refs.historyOperations.$emit('close')">
                    <a class="dropdown-item" href="#" @click="openCopyModal">
                        {{ 'Copy History' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/sharing?id=' + history.id)">
                        {{ 'Share or Publish' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/show_structure')">
                        {{ 'Show Structure' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="iframeGo('/workflow/build_from_current_history')">
                        {{ 'Extract Workflow' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.delete-history-modal>
                        {{ 'Delete' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.purge-history-modal>
                        {{ 'Delete Permanently' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.make-private-modal>
                        {{ 'Make Data Private' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <copy-modal v-model="showCopyModal" :history="history" />

        <b-modal id="delete-history-modal" title="Delete History?" title-tag="h2" @ok="deleteHistory">
            <p>{{ messages.deleteHistoryPrompt | localize }}</p>
        </b-modal>

        <b-modal id="purge-history-modal" title="Permanently Delete History?" title-tag="h2" @ok="purgeHistory">
            <p>{{ messages.purgeHistoryPrompt | localize }}</p>
        </b-modal>

        <b-modal id="make-private-modal" title="Make History Private" title-tag="h2" @ok="makePrivate">
            <p>{{ messages.makePrivatePrompt | localize }}</p>
        </b-modal>

        <!-- #endregion -->

    </section>
</template>


<script>

import { mapActions } from "vuex";
import HistoryTags from "./HistoryTags";
import CopyModal from "./CopyModal";
import ClickToEdit from "components/Form/ClickToEdit";
import GearMenu from "components/GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { bytesToString } from "utils/utils"
import Annotation from "components/Form/Annotation";

const messages = {
    "deleteHistoryPrompt": "Really delete the current history?",
    "purgeHistoryPrompt": "Really delete the current history permanently? This cannot be undone.",
    "makePrivatePrompt": "This will make all the data in this history private (excluding library datasets), and will set permissions such that all new data is created as private.  Any datasets within that are currently shared will need to be re-shared or published. Are you sure you want to do this?",
};

export default {

    components: {
        HistoryTags,
        IconMenu,
        IconMenuItem,
        CopyModal,
        GearMenu,
        Annotation,
        ClickToEdit
    },

    // As always, when dealing with an inadequate observable
    // system like Vuex, we run into problems. This history
    // prop does not update from the outside
    props: {
        history: { type: Object, required: true }
    },

    data() {
        return {
            showTags: false,
            showCopyModal: false,
            editAnnotation: false,
            messages
        }
    },

    computed: {

        annotation: {
            get() {
                return this.history.annotation || "";
            },
            set(annotation) {
                if (annotation.length && annotation !== this.history.annotation) {
                    this.updateFields({ annotation });
                }
            }
        },

        historyName: {
            get() {
                return this.history.name;
            },
            set(name) {
                if (name.length && name !== this.history.name) {
                    this.updateFields({ name });
                }
            }
        },

        // formats size number into x.xxMB/GB
        niceSize() {
            const size = this.history.size;
            return size ? bytesToString(size, true, 2) : "(empty)";
        }

    },

    methods: {

        ...mapActions("history", [
            "updateHistoryFields",
            "deleteCurrentHistory",
            "makeHistoryPrivate"
        ]),

        updateFields(fields = {}) {
            this.updateHistoryFields({
                history: this.history,
                fields
            });
        },

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


        // Current History Operations (moved here from endless gear menu)

        openCopyModal() {
            this.showCopyModal = true;
        },

        deleteHistory(evt) {
            evt.preventDefault();
            this.deleteCurrentHistory()
                .then(() => evt.vueTarget.hide())
                .catch(err => {
                    console.warn("Failed to delete current history", err);
                });
        },

        purgeHistory(evt) {
            evt.preventDefault();
            this.deleteCurrentHistory({ purge: true })
                .then(() => evt.vueTarget.hide())
                .catch(err => console.warn("Failed to purge current history", err));
        },

        makePrivate(evt) {
            evt.preventDefault();
            this.makeHistoryPrivate({ history: this.history })
                .then(result => console.log(result))
                .then(() => evt.vueTarget.hide())
                .catch(err => console.warn("Failed to make history private.", err));
        }

    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "scss/transitions.scss";

.history-title /deep/ h2 input {
    font-size: $h2-font-size;
    font-weight: 500;
}

</style>
