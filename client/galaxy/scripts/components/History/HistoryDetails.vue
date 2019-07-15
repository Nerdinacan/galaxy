<template>
    <section>

        <header>
            <h6>{{ niceSize | localize }}</h6>
            <slot name="menu">
                <icon-menu>
                    <icon-menu-item
                        title="Edit History Tags" 
                        icon="tags"
                        @click="toggle('showTags')"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyDownloadMenu"
                        title="Downloads"
                        icon="download"
                        tooltip-placement="topleft" />
                    <icon-menu-item
                        title="Raw History Data (Debugging)"
                        icon="eye"
                        @click="showRaw = !showRaw"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyOperationsIcon"
                        title="Current History Operations"
                        icon="cog"
                        tooltip-placement="topleft" />
                </icon-menu>
            </slot>
        </header>

        <!-- click to edit name / nameinput -->
        <div class="history-title mt-4" ref="historyNameInput">
            <h2 v-if="!editName" @click="toggle('editName', true)">
                <span class="editable"></span>
                <span>{{ historyName }}</span>
                <b-tooltip ref="nameTooltip" placement="left"
                    :target="() => $refs['historyNameInput']" 
                    :title="'Click to rename history' | localize" />
            </h2>
            <h2 v-if="editName">
                <debounced-input v-model="historyName" :delay="1000">
                    <b-form-input slot-scope="scope" 
                        :value="scope.value" 
                        @input="scope.input"
                        @blur="toggle('editName', false)" 
                        :autofocus="true"
                        :placeholder="'History Name' | localize"
                        :state="inputLengthCheck(scope.value, historyName)" />
                </debounced-input>
            </h2>
        </div>

        <!-- annotation -->
        <annotation class="history-annotation mt-1" v-model="annotation" />

        <!-- tags -->
        <transition name="shutterfade">
            <history-tags v-if="showTags" class="history-tags mt-2" 
                :history="history" />
        </transition>

        <pre v-if="showRaw">{{ history }}</pre>

        <!-- menus and modals -->
        <b-popover ref="downloadMenu"
            target="historyDownloadMenu"
            placement="bottomleft"
            triggers="focus">

            <gear-menu #default="{ go }">
                <div @click="$refs.downloadMenu.$emit('close')">
                    <a class="dropdown-item" href="#" 
                        @click="go('/histories/citations')">
                        {{ 'Export Tool Citations' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="go('/histories/exportmaybe?')">
                        {{ 'Export History to File' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>


        <b-popover ref="historyOperations"
            target="historyOperationsIcon"
            placement="bottomleft"
            triggers="focus">

            <gear-menu #default="{ backboneGo, iframeGo }">
                <div @clicked="$refs.historyOperations.$emit('close')">
                    <a class="dropdown-item" href="#" @click="openCopyModal">
                        {{ 'Copy History' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="backboneGo('/histories/sharing?id=' + history.id)">
                        {{ 'Share or Publish' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="backboneGo('/histories/show_structure')">
                        {{ 'Show Structure' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" 
                        @click="iframeGo('/workflow/build_from_current_history')">
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


        <!-- modals -->

        <copy-modal v-model="showCopyModal" :history="history" />

        <b-modal id="delete-history-modal" 
            title="Delete History?" title-tag="h2"
            @ok="deleteHistory">
            <p>{{ messages.deleteHistoryPrompt | localize }}</p>
        </b-modal>

        <b-modal id="purge-history-modal" 
            title="Permanently Delete History?" title-tag="h2"
            @ok="purgeHistory">
            <p>{{ messages.purgeHistoryPrompt | localize }}</p>
        </b-modal>

        <b-modal id="make-private-modal" 
            title="Make History Private" title-tag="h2"
            @ok="makePrivate">
            <p>{{ messages.makePrivatePrompt | localize }}</p>
        </b-modal>

    </section>
</template>


<script>

import { mapActions } from "vuex";
import HistoryTags from "./HistoryTags";
import CopyModal from "./CopyModal";
import DebouncedInput from "components/Form/DebouncedInput";
import GearMenu from "./GearMenu";
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
        DebouncedInput,
        CopyModal,
        GearMenu,
        Annotation
    },
    props: {
        history: { type: Object, required: true }
    },
    data() {
        return {
            showTags: false,
            showCopyModal: false,
            editName: false,
            editAnnotation: false,
            messages,
            showRaw: false
        }
    },
    computed: {

        annotation: {
            get() {
                return this.history.annotation || "";
            },
            set(annotation) {
                this.updateFields({ annotation });
            }
        },

        historyName: {
            get() {
                return this.history.name;
            },
            set(name) {
                if (name.length) {
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


        // Validation

        inputLengthCheck(val, origVal) {
            if (val === origVal) {
                return null;
            }
            return val.length > 0;
        },



        // Current History Operations (moved here from endless gear menu)

        // we could just put the links in the markup but
        // these function include the galaxy.root
        // into the target/url and also help with testing

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

        // need clarification about what should be difference between
        // purge and delete. requirements seem super-murky and insconsistent
        // in the implementation in the current backbone catastrophe
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

@import "~scss/mixins.scss";

/* enlarge title input text to match h2 */
.history-title h2 input {
    font-size: 1.4rem;
    font-weight: 400;
}

/* click-to-edit icons */
.history-title h2,
.history-annotation p {
    @include clickToEdit();
}

</style>