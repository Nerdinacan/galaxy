<template>
    <icon-menu>
        <icon-menu-item v-if="showErrorButton"
            title="View or report this error"
            icon="bug"
            @click="viewError"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showDownloads && !hasMetaData"
            title="Download"
            icon="floppy-o"
            :href="downloadUrl"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showDownloads && hasMetaData"
            id="metafileDownloadButton"
            title="Download Metafiles"
            icon="floppy-o"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showParamsButton"
            title="View Details"
            icon="info-circle"
            @click="viewDetails"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showRerunButton"
            title="Run this job again"
            icon="refresh"
            @click="rerun"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showVisualizeButton"
            id="vizButton"
            title="Visualize this data"
            icon="bar-chart"
            tooltip-placement="topright" />
        <icon-menu-item v-if="showToolHelpButton"
            title="Tool Help"
            icon="question"
            @click="$emit('toggleToolHelp')"
            tooltip-placement="topright" />

        <b-popover v-if="showDownloads && hasMetaData"
            ref="downloadMenu"
            target="metafileDownloadButton"
            placement="bottomleft"
            triggers="focus">
            <gear-menu #default="{ go }">
                <div @click="$refs.downloadMenu.$emit('close')">
                    <a class="dropdown-item" :href="downloadUrl">
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

import { mapGetters } from "vuex";
import GearMenu from "../GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { getGalaxyInstance } from "app";
import { prependPath, redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import STATES from "mvc/dataset/states";

export default {
    components: {
        GearMenu,
        IconMenu,
        IconMenuItem
    },
    props: {
        dataset: { type: Object, required: true }
    },
    computed: {
        
        ...mapGetters("user", ["hasUser"]),

        state() {
            return this.dataset.state;
        },
        isDeletedOrPurged() {
            return this.dataset.isDeleted || this.dataset.purged;
        },
        downloadUrl() {
            const params = `to_ext=${this.dataset.file_ext}`;
            const url = `/datasets/${this.dataset.id}/display?${params}`;
            return prependPath(url);
        },
        hasData() {
            return this.dataset.file_size > 0;
        },


        // Secondary menu button logic

        showErrorButton() {
            return this.state == STATES.ERROR;
        },
        showDownloads() {
            if (this.dataset.purged) return false;
            if (this.dataset.file_size == 0) return false;
            const okStates = new Set([ STATES.OK, STATES.FAILED_METADATA, STATES.ERROR ]);
            return okStates.has(this.state);
        },
        hasMetaData() {
            return this.dataset.meta_files.length > 0;
        },
        showParamsButton() {
            return this.state !== STATES.NOT_VIEWABLE;
        },
        showRerunButton() {
            const badStates = new Set([ STATES.UPLOAD, STATES.NOT_VIEWABLE ]);
            return (!badStates.has(this.state)
                && this.dataset.rerunnable
                && Boolean(this.dataset.creating_job));
        },
        showVisualizeButton() {
            const goodStates = new Set([ STATES.OK, STATES.FAILED_METADATA ]);
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
        showToolHelpButton() {
            const badStates = new Set([ STATES.UPLOAD, STATES.NOT_VIEWABLE ]);
            return (this.hasUser && !badStates.has(this.state));
        }
    },
    methods: {

        downloadDataset() {
            console.log("downloadDataset");
        },
        viewDetails() {
            const url = `/datasets/${this.dataset.id}/show_params`;
            iframeRedirect(url);
        },
        visualizeDataset() {
            console.log("visualizeDataset");
        },
        metadataDownloadUrl(metafile) {
            const params= `hda_id=${this.dataset.id}&metadata_name=${metafile.file_type}`;
            const url = `/dataset/get_metadata_file?${params}`;
            return prependPath(url);
        },
        viewError() {
            this.bbRoute("datasets/error", {
                dataset_id: this.dataset.id
            });
        },
        rerun() {
            this.bbRoute("/", {
                job_id: this.dataset.creating_job
            });
        },

        // TODO: Remove this routing function when we replace with a vue router
        bbRoute() {
            const Galaxy = getGalaxyInstance();
            if (Galaxy && Galaxy.router) {
                Galaxy.router.push.apply(Galaxy.router, arguments);
            }
        }
    }
}

</script>
