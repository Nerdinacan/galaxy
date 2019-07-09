<template>
    <history v-if="currentHistoryId" class="ml-1" :historyId="currentHistoryId">
        <template v-slot:history-top-nav>

            <nav class="history-list-menu p-2">
                <history-selector v-model="currentHistoryId" />
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
    </history>
</template>


<script>

import { mapActions } from "vuex";
import { wipeDB } from "./model/db";
import History from "./History";
import HistorySelector from "./HistorySelector";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import GearMenu from "./GearMenu";
import { stopPolling } from "./model/observables/PollUpdate$";

export default {
    components: {
        History,
        HistorySelector,
        IconMenu,
        IconMenuItem,
        GearMenu
    },
    computed: {
        currentHistoryId:{
            get() {
                return this.$store.state.history.currentHistoryId;
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
@import "~scss/mixins.scss";

.history-list-menu {
    @include flexRowHeader();
    background-color: $gray-300;
}

</style>
