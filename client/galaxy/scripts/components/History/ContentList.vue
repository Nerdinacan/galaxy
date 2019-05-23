<template>
    <div class="scrollContainer">
        <div class="scrollContent" ref="scrollContainer" @wheel="onScroll" v-scroll="onScroll">

            <transition name="fade">
                <ol v-if="content.length">
                    <li v-for="c in content" :key="c.type_id"
                        class="d-flex p-2 mb-1"
                        :data-state="itemState(c)">
                        <b-form-checkbox v-if="showSelection"
                            v-model="selection"
                            :value="c.toJSON()" />
                        <content-item :content="c" class="flex-grow-1" />
                    </li>
                </ol>
            </transition>

            <transition name="fade">
                <div v-if="!(loading || content.length)">
                    <p>No content, man.</p>
                </div>
            </transition>

            <transition name="fade">
                <div v-if="loading" class="">
                    <b-spinner label="Loading..."></b-spinner>
                </div>
            </transition>

        </div>
    </div>
</template>

<script>

import Vue from "vue";
import { mapGetters, mapActions } from "vuex";
import vuescroll from "vue-scroll";
import { BehaviorSubject } from "rxjs";
import { tap, map, debounceTime, distinctUntilChanged } from "rxjs/operators";
import ContentItem from "./ContentItem";
import { debounce } from "debounce";
import { eventHub } from "./eventHub";

Vue.use(vuescroll);


export default {
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
            scrollSubject: new BehaviorSubject(0)
        }
    },
    computed: {
        ...mapGetters("history", [
            "searchParams",
            "historyContent",
            "contentSelection"
        ]),
        historyId() {
            return this.history.id;
        },
        params: {
            get() {
                return this.searchParams(this.historyId);
            },
            set(newParams) {
                this.setSearchParams({
                    history: this.history,
                    params: newParams
                });
            }
        },
        content() {
            return this.historyContent(this.historyId);
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
        },
        listStateClasses() {
            const { loading } = this;
            return { loading };
        },
        contentParameters() {
            const { history, params } = this;
            return { history, params };
        }
    },
    methods: {

        ...mapActions("history", [
            "loadContent",
            "unsubLoader",
            "setSearchParams",
            "setContentSelection"
        ]),

        onScroll(evt) {
            const container = this.$refs['scrollContainer'];
            const newTop = container.scrollTop;
            this.scrollSubject.next(newTop);
        },

        itemClasses(c) {
            const stateClass = this.itemStateClass(c);
            const classConfig = {};
            if (stateClass) {
                classConfig[stateClass] = true;
            }
            return classConfig;
        },

        itemState(c) {
            return c.state || "ok";
        },


        // list pagination, just extend page size

        paginate(numRows) {
            const newParams = this.params.clone();
            newParams.pageSize = newParams.minPageSize + numRows;
            this.params = newParams;
        },

        // show/hide checkboxes

        displaySelection(show) {
            this.showSelection = show;
        }

    },
    watch: {
        historyId:{
            handler(newId, oldId) {
                if (newId !== oldId) {
                    this.unsubLoader(oldId);
                }
            },
            immediate: true
        },
        contentParameters: {
            handler(newVals, oldVals) {
                this.loading = true;
                this.loadContent(newVals);
            },
            immediate: true,
            deep: true
        },
        content() {
            this.loading = false;
        }
    },
    mounted() {

        // prop? calculate?
        const heightGuess = 36;

        const scroll$ = this.scrollSubject.pipe(
            tap(scrollTop => console.log("scrollTop", scrollTop)),
            map(scrollTop => Math.round(scrollTop / heightGuess)),
            debounceTime(100),
            tap(numRows => console.log("numRows", numRows)),
            distinctUntilChanged()
        );

        this.$subscribeTo(scroll$, numRows => {
            console.log("subscription", numRows);
            // this.paginate(numRows);
            // this.loading = true;
        });

        // show/hide selection from event bus
        eventHub.$on('toggleShowSelection', this.displaySelection);

    },
    beforeDestroy() {
        this.unsubLoader(this.historyId);
        eventHub.$off('toggleShowSelection', this.displaySelection);
    }
}

</script>



<style lang="scss" scoped>

@import "~scss/mixins.scss";

.scrollContainer {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
}

.scrollContent {
    @include absfill();
}

ol {
    @include list_reset();
}

</style>
