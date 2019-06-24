<template>
    <div>

        <transition name="fade">
            <div v-if="content.length" class="scrollContainer"
                ref="scrollContainer">

                <ol ref="scrollContent">
                    <li v-for="(c, index) in content" :key="c.type_id"
                        class="d-flex p-2 mb-1" 
                        :data-state="c.state"
                        v-observe-visibility="updatePageRange(index)">
                        <b-form-checkbox v-if="showSelection"
                            v-model="selection" :value="c" />
                        <content-item class="flex-grow-1"
                            :content="c" 
                            :index="index" />
                    </li>
                </ol>

            </div>
        </transition>

        <transition name="fade">
            <div v-if="!(loading || content.length)">
                <p>No content, man.</p>
            </div>
        </transition>

        <transition name="fade">
            <div v-if="loading" class="d-flex justify-content-center mt-3">
                <b-spinner label="Loading..."></b-spinner>
            </div>
        </transition>

    </div>
</template>


<script>

import { mapGetters, mapActions } from "vuex";
import { debounce } from "debounce";
import { eventHub } from "./eventHub";
import { ObserveVisibility } from "vue-observe-visibility";
import ContentItem from "./ContentItem";
import { SearchParams } from "./model/SearchParams";

export default {

    directives: {
        ObserveVisibility
    },
    components: {
        ContentItem
    },
    props: {
        history: { type: Object, required: true }
    },

    data() {
        return {
            loading: false,
            showSelection: false,
            localParams: new SearchParams()
        }
    },

    computed: {

        ...mapGetters("history", [
            "searchParams",
            "historyContent",
            "contentSelection"
        ]),

        params() {
            return this.searchParams(this.history.id).clone();
        },

        content() {
            return this.historyContent(this.history.id);
        },

        selection: {
            get() {
                const selectionSet = this.contentSelection(this.history);
                return Array.from(selectionSet);
            },
            // bootstrap's stupid component fires this multiple times, one
            // for each checkbox, so debounce this function
            set: debounce(function(newList = []) {
                this.setContentSelection({
                    history: this.history,
                    selection: new Set(newList)
                });
            }, 100, true)
        }

    },

    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
            "setContentSelection"
        ]),

        itemClasses(c) {
            const stateClass = this.itemStateClass(c);
            const classConfig = {};
            if (stateClass) {
                classConfig[stateClass] = true;
            }
            return classConfig;
        },

        displaySelection(show) {
            this.showSelection = show;
        },

        updateParams(newParams) {
            if (!SearchParams.equals(newParams, this.params)) {
                // console.log("sending new params", newParams);
                this.setSearchParams({
                    history: this.history,
                    params: newParams
                })
            }
        },


        // Scrolling

        updatePageRange(index) {
            return (isVisible, entry) => {
                if (this.suppressVizEvents) {
                    return;
                }
                if (isVisible) {
                    this.localParams.expand(index);
                } else {
                    if (this.isAboveWindow(entry)) {
                        this.localParams.clipTop(index);
                    }
                }
            }
        },

        getContainerRect() {
            return this.$refs.scrollContainer.getBoundingClientRect();
        },

        isAboveWindow(entry, index) {
            const { boundingClientRect } = entry;
            const containerRect = this.getContainerRect();
            return boundingClientRect.bottom < containerRect.top;
        },

        isBelowWindow({ boundingClientRect }) {
            return boundingClientRect.top > this.getContainerRect().bottom;
        }

    },

    watch: {
        history:{
            handler(history, oldHistory) {
                if (oldHistory && (history.id !== oldHistory.id)) {
                    this.unsubLoader(oldHistory.id);
                }
                if (history && history.id) {
                    this.loadContent({ history });
                }
            },
            immediate: true
        },
        params: {
            handler(newParams) {
                if (!SearchParams.equals(newParams, this.localParams)) {
                    // console.log("updating localParams from params", newParams);
                    this.localParams = newParams.clone();               
                }
            },
            immediate: true
        },
        localParams: {
            handler: debounce(function(newParams) {
                // newParams.report("LOCALPARAMS WATCH", this);
                
            }, 200),
            deep: true
        }
    },

    mounted() {
        eventHub.$on('toggleShowSelection', this.displaySelection);
    },
    beforeDestroy() {
        this.unsubLoader(this.history.id);
        eventHub.$off('toggleShowSelection', this.displaySelection);
    },
    beforeUpdate() {
        // Visibility directive clumsily uses nextTick so we can't just
        // use that or updated() because it's still too soon
        this.suppressVizEvents = true;
        setTimeout(() => {
            this.suppressVizEvents = false;
        }, 1000);
    }
}

</script>

<style lang="scss" scoped>

@import "~scss/mixins.scss";

.scrollContainer {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
}

ol {
    @include list_reset();
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding-bottom: 1000px;
}

li {
    position: relative;
}

.sensor {
    background-color: red;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 2px;
}

</style>
