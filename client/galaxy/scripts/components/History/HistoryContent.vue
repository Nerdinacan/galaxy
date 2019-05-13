<template>
    <div class="scrollContainer" ref="scrollContainer" 
        @wheel="onScroll" v-scroll="onScroll">

        <!-- content list -->
        <transition-group name="fade" ref="listing" v-if="listing.length" tag="ol">
            <li v-for="content in listing" :key="content.type_id">
                <b-form-checkbox v-model="selection" 
                    :value="content.type_id"></b-form-checkbox>
                <content-item :content="content" />
            </li>
            <li class="loading" :class="{ active: loading }" :key="'loading'">
                Loading Graphic
            </li>
        </transition-group>

        <!-- message block -->
        <div v-if="!listing.length">
            <p>No content, man.</p>
        </div>

    </div>
</template>

<script>

import Vue from "vue";
import VueRx from "vue-rx";
import vuescroll from "vue-scroll";
import { mapState } from "vuex";

import { Subject } from "rxjs";
import { map, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { log } from "./model/observables/utils";
import ContentItem from "./HistoryContentItem";

Vue.use(VueRx);
Vue.use(vuescroll);


export default {
    components: { 
        ContentItem 
    },
    props: {
        historyContent: { type: Array, required: true }
    },
    data() {
        return {
            loading: false,
            lastScrollTop: 0,
            scrollSubject: new Subject()
        }
    },
    computed: {
        container() {
            return this.$refs['scrollContainer'];
        },
        /*
        containerStyles() {
            return {
                paddingTop: `${this.lastScrollTop}px`
            }
        },
        */
        selection: {
            get() {
                return this.$store.state.history.contentSelection;
            },
            set(newVal) {
                this.$store.commit("history/setContentSelection", newVal);
            }
        },
        listing() {
            return this.historyContent;
        }
    },
    methods: {
        onScroll(evt) {
            let newTop = this.container.scrollTop;
            // console.log("onScroll", newTop);
            // this.lastScrollTop -= newTop;
            this.scrollSubject.next(newTop);
        }
    },
    watch: {
        listing() {
            // this.$refs["listing"].styles.paddingTop = "100px";
            // this.container.scrollTop = 100;
            this.loading = false;
        }
    },
    mounted() {

        const heightGuess = 36;

        const scroll$ = this.scrollSubject.pipe(
            map(scrollTop => Math.round(scrollTop / heightGuess)),
            debounceTime(100),
            distinctUntilChanged()
        );
        
        this.$subscribeTo(scroll$, numRows => {
            this.$emit('paginate', numRows);
            this.loading = true;
        });
    }
}

</script>
