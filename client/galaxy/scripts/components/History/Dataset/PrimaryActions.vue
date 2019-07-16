<template>
    <icon-menu>
        <icon-menu-item v-if="showDisplayButton"
            :title="displayButtonTitle" 
            :disabled="displayButtonDisabled"
            icon="eye"
            @click="viewData"
            tooltip-placement="topleft" />
        <icon-menu-item v-if="showEditButton"
            :title="editButtonTitle" 
            :disabled="editButtonDisabled"
            icon="pencil"
            @click="editAttributes"
            tooltip-placement="topleft" />
        <icon-menu-item v-if="showDeleteButton"
            :title="deleteButtonTitle" 
            :disabled="deleteButtonDisabled"
            icon="times"
            @click="deleteDataset"
            tooltip-placement="topleft" />
        <icon-menu-item v-if="dataset.isDeleted"
            :title="messages.undeleteTitle" 
            icon="bolt"
            @click="undeleteDataset"
            tooltip-placement="topleft" />
        <slot></slot>
    </icon-menu>
</template>

<script>

import { getGalaxyInstance } from "app";
import { mapActions } from "vuex";
import { redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import STATES from "mvc/dataset/states";

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

    // restore dataset button
    undeleteTitle: "Undelete"
};


export default {
    components: {
        IconMenu, IconMenuItem
    },
    props: {
        dataset: { type: Object, required: true }
    },
    data() {
        return { messages }
    },
    computed: {

        state() {
            return this.dataset.state;
        },

        isDeletedOrPurged() {
            // handle our absurd delete-state flagging
            return this.dataset.isDeleted || this.dataset.purged;
        },


        // Display button

        showDisplayButton() {
            const unviewableStates = new Set([ STATES.NOT_VIEWABLE, STATES.DISCARDED ]);
            return (this.dataset.accessible && !unviewableStates.has(this.state));
        },
        displayButtonDisabled() {
            const unavailableStates = new Set([ STATES.UPLOAD, STATES.NEW ]);
            return (this.dataset.purged || unavailableStates.has(this.state));
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
            const badStates = new Set([ STATES.NOT_VIEWABLE, STATES.DISCARDED ]);
            return !badStates.has(this.state) && this.dataset.accessible;
        },
        editButtonDisabled() {
            // disable if purged or deleted and explain why in the tooltip
            // disable if still uploading or new
            const disabledStates = new Set([ STATES.UPLOAD, STATES.NEW ]);
            return (this.isDeleted || this.purged || disabledStates.has(this.state));
        },
        editButtonTitle() {
            const unreadyStates = new Set([ STATES.UPLOAD, STATES.NEW ]);
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
            return this.isDeletedOrPurged ? messages.deleteAlreadyDeleted : messages.deleteDefault;
        }

    },
    methods: {
        
        go: redirectToSiteUrl,
        iframeGo: iframeRedirect, 
        backboneGo: backboneRedirect,
        
        ...mapActions("history", ["deleteContent", "undeleteContent"]),

        viewData() {
            // const Galaxy = getGalaxyInstance();
            // if (Galaxy && Galaxy.frame && Galaxy.frame.active) {
            //     Galaxy.frame.addDataset(this.dataset.id);
            // }

            const url = `/datasets/${this.dataset.id}/display/?preview=True`;
            iframeRedirect(url);
        },

        editAttributes() {
            const Galaxy = getGalaxyInstance();
            if (Galaxy && Galaxy.router) {
                Galaxy.router.push("datasets/edit", {
                    dataset_id: this.dataset.id
                });
            }
        },
        
        deleteDataset() {
            this.deleteContent({ content: this.dataset });
        },
        
        undeleteDataset() {
            this.undeleteContent({ content: this.dataset });
        }
    }
};

</script>
