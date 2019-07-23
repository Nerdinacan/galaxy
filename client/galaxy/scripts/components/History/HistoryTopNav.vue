<template>
    <nav v-if="historyId" class="history-list-menu d-flex align-items-center">

        <history-selector class="mr-3" v-model="historyId" />

        <icon-menu class="no-border">
            <icon-menu-item title="Create New History" icon="plus" @click="createHistory" tooltip-placement="bottom" />
            <icon-menu-item title="Stop Polling (Debugging)" icon="clock-o" @click="stopPolling"
                tooltip-placement="bottom" />
            <icon-menu-item id="endlessMenuGear" title="History Options" icon="cog" tooltip-placement="bottom" />
        </icon-menu>

        <b-popover ref="endlessMenu" target="endlessMenuGear" placement="bottomleft" triggers="click blur">
            <gear-menu #default="{ go, backboneGo, iframeGo }">
                <div @clicked="$refs.endlessMenu.$emit('close')">
                    <a class="dropdown-item" href="#" @click="createHistory">
                        {{ 'Create New History' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="go('/history/view_multiple')">
                        {{ 'View All Histories' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="go('/histories/list')">
                        {{ 'Saved Histories' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="go('/histories/list_shared')">
                        {{ 'Histories Shared with Me' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="useLegacyHistoryPanel">
                        {{ 'Use legacy history panel' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

    </nav>
</template>


<script>

    import { mapState, mapActions } from "vuex";
    import HistorySelector from "./HistorySelector";
    import GearMenu from "components/GearMenu";
    import { IconMenu, IconMenuItem } from "components/IconMenu";
    import { stopPolling } from "./model/observables/ContentLoader";

    export default {
        components: {
            HistorySelector,
            IconMenu,
            IconMenuItem,
            GearMenu
        },
        data() {
            return {
                // Bootstrap Vue fails again, need to track
                // open state just to close it properly
                gearIsOpen: false
            }
        },
        computed: {

            ...mapState("history", [
                "currentHistoryId"
            ]),

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

            stopPolling,

            useLegacyHistoryPanel() {
                sessionStorage.removeItem('useBetaHistory');
                location.reload();
            },

            async createHistory() {
                const newHistory = await this.createNewHistory();
                // this.selectCurrentHistory(newHistory.id);
                this.closeMenu();
            },

            closeMenu() {
                const menu = this.$refs['endlessMenu'];
                if (menu) {
                    menu.$emit('close');
                }
            }
        }
    }

</script>