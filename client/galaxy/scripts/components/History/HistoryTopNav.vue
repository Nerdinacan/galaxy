<template>

    <nav v-if="historyId" class="history-list-menu d-flex justify-content-between align-items-center">
        <history-selector v-model="historyId" />
        <icon-menu>
            <icon-menu-item
                title="Create New History" 
                icon="plus"
                @click="createNewHistory" 
                tooltip-placement="bottom" />
            <icon-menu-item
                title="Delete Local Database"
                icon="bolt"
                @click="deleteLocalDatabase"
                tooltip-placement="bottom" />
            <icon-menu-item
                title="Stop Polling"
                icon="clock-o"
                @click="stopPolling"
                tooltip-placement="bottom" />
            <icon-menu-item id="endlessMenuGear"
                title="History Options"
                icon="cog"
                :useTooltip="false" />
        </icon-menu>

        <b-popover ref="endlessMenu"
            target="endlessMenuGear"
            placement="bottomleft"
            triggers="focus">
            <gear-menu #default="{ go, backboneGo, iframeGo }">
                <div @clicked="$refs.endlessMenu.$emit('close')">
                    <a class="dropdown-item" href="#"
                        @click="createNewHistory">
                        {{ 'Create New History' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="go('/history/view_multiple')">
                        {{ 'View All Histories' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="go('/histories/list')">
                        {{ 'Saved Histories' | localize }}
                    </a>
                    <a class="dropdown-item" href="#"
                        @click="go('/histories/list_shared')">
                        {{ 'Histories Shared with Me' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>
    </nav>

</template>


<script>

import { mapState, mapActions } from "vuex";

import HistorySelector from "./HistorySelector";
import GearMenu from "./GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { HistoryTopNav } from "./HistoryTopNav";

import { eventHub } from "components/eventHub";
import { wipeDB } from "./model/db";
import { stopPolling } from "./model/observables/PollUpdate$";

export default {
    components: {
        HistorySelector,
        IconMenu,
        IconMenuItem,
        GearMenu
    },
    computed: {

        ...mapState("history", [ "currentHistoryId" ]),

        historyId: {
            get() {
                return this.currentHistoryId;
            },
            set(id) {
                this.selectCurrentHistory(id);
            }
        }
    },
    methods: {
        ...mapActions("history", [
            "selectCurrentHistory",
            "createNewHistory",
            "deleteCurrentHistory",
        ]),
        deleteLocalDatabase() {
            wipeDB().subscribe(db => console.log("Local database deleted"));
        },
        stopPolling
    }
}

</script>


<style lang="scss" scoped>

@import "~scss/theme/blue.scss";

.history-list-menu {
    background-color: $gray-300;
}

</style>
        