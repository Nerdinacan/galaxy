<template>
    <icon-menu>

        <!-- _renderDisplayButton -->
        <icon-menu-item v-if="showDisplayButton"
            :title="displayButtonTitle" 
            :disabled="displayButtonDisabled"
            class="display-btn"
            icon="eye"
            @click="viewData"
            tooltip-placement="topleft" />

        <!-- _renderEditButton -->
        <icon-menu-item v-if="showEditButton"
            :title="editButtonTitle" 
            :disabled="editButtonDisabled"
            icon="pencil"
            @click="editAttributes"
            tooltip-placement="topleft" />

        
       
        <!-- _renderErrButton
        Render icon-button to report an error on this
        dataset to the galaxy admin. -->
        <icon-menu-item v-if="showErrorButton"
            title="View or report this error"
            icon="bug"
            @click="reportError"
            tooltip-placement="topright" /> 

        <!-- _renderDownloadButton -->
        <icon-menu-item v-if="showDownloads && !hasMetaData"
            title="Download"
            icon="floppy-o"
            :href="getUrl('download')"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showDownloads && hasMetaData"
            id="metafileDownloadButton"
            title="Download"
            icon="floppy-o"
            tooltip-placement="topright" />
        
        <!-- _renderShowParamsButton -->
        <!-- Render icon-button to show the input and output (stdout/err) for
        the job that created this. -->
        <icon-menu-item v-if="showJobParamsButton"
            title="View Details"
            icon="info-circle"
            @click="displayJobParams"
            tooltip-placement="topright" />

        <!-- _renderRerunButton -->
        <icon-menu-item v-if="showRerunButton"
            title="Run this job again"
            icon="refresh"
            @click="rerun"
            :href="dataset.urls.rerun"
            tooltip-placement="topright" />

        <!-- _renderVisualizationsButton -->
        <icon-menu-item v-if="showVisualizeButton"
            id="vizButton"
            title="Visualize this data"
            icon="bar-chart"
            :href="visualizeUrl"
            @click="visualize"
            tooltip-placement="topright" />

        <!-- _renderDeleteButton  -->
        <icon-menu-item v-if="showDeleteButton"
            :title="deleteButtonTitle" 
            :disabled="deleteButtonDisabled"
            icon="times"
            @click="deleteDataset"
            tooltip-placement="topleft" />

        <!-- _renderToolHelpButton -->
        <icon-menu-item v-if="showToolHelpButton"
            title="Tool Help"
            icon="question"
            href="#"
            @click="eventHub.$emit('toggleToolHelp', dataset)"
            tooltip-placement="topright" />

        <b-popover v-if="showDownloads && hasMetaData"
            ref="downloadMenu"
            target="metafileDownloadButton"
            placement="bottomleft"
            triggers="focus">
            <gear-menu #default="{ go }">
                <div @click="$refs.downloadMenu.$emit('close')">
                    <a class="dropdown-item" :href="getUrl('download')">
                        {{ 'Download Dataset' | localize }}
                    </a>
                    <a class="dropdown-item" v-for="mf in dataset.meta_files" :key="mf.download_url"
                        :href="metadataDownloadUrl(mf)">
                        {{ 'Download' | localize }} {{ mf.file_type }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <b-popover v-if="showVisualizeButton"
            ref="vizMenu"
            target="vizButton"
            placement="bottomleft"
            triggers="focus">
            <gear-menu #default="{ go }">
                <div @click="$refs.vizMenu.$emit('close')">
                    Visualizations
                </div>
            </gear-menu>
        </b-popover>

    </icon-menu>
</template>

<script>

import { mapActions, mapGetters } from "vuex";
import { prependPath, redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import { getGalaxyInstance } from "app";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import GearMenu from "../GearMenu";
import STATES from "mvc/dataset/states";
import { getToolHelpHtml } from "./queries";
import { eventHub } from "components/eventHub";

const messages = {

    // display button
    displayPurged: "Cannot display datasets removed from disk",
    displayUploading: "This dataset must finish uploading before it can be viewed",
    displayTooNew: "This dataset is not yet viewable",
    displayDefault: "View data",

    // edit attributes button
    editDeleted: "Unedit dataset to edit attributes",
    editPurged: "Cannot edit attributes of datasets removed from disk",
    editNotReady: "This dataset is not yet editable",
    editDefault: "Edit attributes",

    // delete dataset button
    deleteAlreadyDeleted: "Dataset is already deleted",
    deleteDefault: "Delete",
};


export default {
    components: {
        IconMenu, 
        IconMenuItem, 
        GearMenu
    },
    props: {
        dataset: { type: Object, required: true },
        expanded: { type: Boolean, required: false, default: false }
    },
    data() {
        return { 
            messages,
            eventHub
        }
    },
    computed: {

        state() {
            return this.dataset.state;
        },
        // handle our absurd delete-state flagging
        // because apparently you can be purged without being deleted
        isDeletedOrPurged() {
            return this.dataset.isDeleted || this.dataset.purged;
        },
        hasData() {
            return this.dataset.file_size > 0;
        },
        hasMetaData() {
            return this.dataset.meta_files.length > 0;
        },

        // Display button

        showDisplayButton() {
            const badStates = new Set([
                STATES.NOT_VIEWABLE,
                STATES.DISCARDED
            ]);
            return this.dataset.accessible 
                && !badStates.has(this.state);
        },
        displayButtonDisabled() {
            const badStates = new Set([
                STATES.UPLOAD,
                STATES.NEW
            ]);
            return this.dataset.purged
                || badStates.has(this.state);
        },
        displayButtonTitle() {
            if (this.dataset.purged) {
                return messages.displayPurged;
            }
            if (this.state == STATES.UPLOAD) {
                return messages.displayUploading;
            }
            if (this.state == STATES.NEW) {
                return messages.displayTooNew;
            }
            return messages.displayDefault;
        },


        // Edit Attributes button

        showEditButton() {
            const badStates = new Set([
                STATES.NOT_VIEWABLE,
                STATES.DISCARDED
            ]);
            return this.dataset.accessible 
                && !badStates.has(this.state);
        },
        editButtonDisabled() {
            // disable if purged or deleted and explain why in the tooltip
            // disable if still uploading or new
            const disabledStates = new Set([
                STATES.UPLOAD, 
                STATES.NEW
            ]);
            return this.isDeletedOrPurged 
                || disabledStates.has(this.state);
        },
        editButtonTitle() {
            const unreadyStates = new Set([
                STATES.UPLOAD, STATES.NEW
            ]);
            if (this.isDeleted) {
                return messages.editDeleted;
            }
            if (this.purged) {
                return messages.editPurged;
            }
            if (unreadyStates.has(this.state)) {
                return messages.editNotReady;
            }
            return messages.editDefault;
        },


        // Delete button
        
        showDeleteButton() {
            return this.dataset.accessible;
        },
        deleteButtonDisabled() {
            return this.isDeletedOrPurged;
        },
        deleteButtonTitle() {
            return this.isDeletedOrPurged 
                ? messages.deleteAlreadyDeleted 
                : messages.deleteDefault;
        },


        // report error button

        showErrorButton() {
            return this.state == STATES.ERROR;
        },


        // downloads

        showDownloads() {
            if (this.dataset.purged || !this.hasData) return false;
            const okStates = new Set([ 
                STATES.OK, 
                STATES.FAILED_METADATA, 
                STATES.ERROR
            ]);
            return okStates.has(this.state);
        },


        // Params Button

        showJobParamsButton() {
            return this.state !== STATES.NOT_VIEWABLE;
        },

        // rerun

        showRerunButton() {
            const badStates = new Set([ 
                STATES.UPLOAD, 
                STATES.NOT_VIEWABLE 
            ]);
            return (!badStates.has(this.state)
                && this.dataset.rerunnable
                && Boolean(this.dataset.creating_job));
        },


        // visualize

        showVisualizeButton() {
            const goodStates = new Set([ 
                STATES.OK, STATES.FAILED_METADATA 
            ]);
            if (!goodStates.has(this.state)
                || this.isDeletedOrPurged
                || !this.hasUser
                || !this.hasData) {
                return false;
            }

            // TODO: make "hasVisualizations" flag in the dataset response
            // var visualizations = this.dataset.visualizations;
            // if (!_.isObject(visualizations[0])) {
            //     this.warn("Visualizations have been switched off");
            //     return null;
            // }
            // return this.dataset.visualizations.length > 0;

            return true;
        },

        visualizeUrl() {
            const id = this.dataset.id;
            return `${getAppRoot()}visualizations?dataset_id=${id}`;
        },

        // tool help button

        showToolHelpButton() {
            const Galaxy = getGalaxyInstance();
            return Galaxy && Galaxy.user && Galaxy.user.id;
        }


    },
    methods: {
        
        ...mapActions("history", [
            "deleteContent",
            "undeleteContent"
        ]),

        // TODO: Remove this routing function when we replace with a vue router
        bbRoute() {
            const Galaxy = getGalaxyInstance();
            if (Galaxy && Galaxy.router) {
                Galaxy.router.push.apply(Galaxy.router, arguments);
            }
        },

        getUrl(urlType) {
            const path = this.dataset.getUrl(urlType);
            return path ? prependPath(path) : null;
        },

        metadataDownloadUrl({ file_type }) {
            return this.getUrl('meta_download') + file_type;
        },


        // Button Clicks

        viewData() {
            const Galaxy = getGalaxyInstance();
            if (Galaxy && Galaxy.frame && Galaxy.frame.active) {
                Galaxy.frame.addDataset(this.dataset.id);
            } else {
                const path = this.getUrl('display');
                iframeRedirect(path)
            }
        },

        editAttributes() {
            this.bbRoute("datasets/edit", {
                dataset_id: this.dataset.id
            });
        },
        
        deleteDataset() {
            this.deleteContent({ content: this.dataset });
        },

        reportError() {
            this.bbRoute("datasets/error", {
                dataset_id: this.dataset.id
            })
        },

        displayJobParams() {
            const Galaxy = getGalaxyInstance();
            if (Galaxy && Galaxy.frame && Galaxy.frame.active) {
                Galaxy.frame.add({
                    title: "Dataset details",
                    url: this.dataset.urls.show_params
                });
            } else {
                const path = this.getUrl('show_params');
                iframeRedirect(path);
            }
        },

        rerun() {
            this.bbRoute("/", {
                job_id: this.dataset.creating_job
            });
        },

        visualize() {
            const Galaxy = getGalaxyInstance();
            const id = this.dataset.id;
            if (Galaxy) {
                if (Galaxy.frame && Galaxy.frame.active) {
                    Galaxy.frame.add({ 
                        url, 
                        title: "Visualization"
                    });
                } else if (Galaxy.router) {
                    this.bbRoute("visualizations", {
                        dataset_id: id
                    });
                    Galaxy.trigger("activate-hda", id);
                }
            }
        }

    }
}

</script>
