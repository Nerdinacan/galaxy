<template>
    <section class="history">

        <h1>Current "history"</h1>
        <pre>{{ history }}</pre>
<!-- 
        <h1>Actual History Object</h1>
        <h2>Which is mysteriously not the same as the current history object</h2>
        <pre>{{ historyObj }}</pre> -->

        <!-- 
        <h1>History Contents (need id, update_time, create_time, basic props)</h1>
        <pre>{{ contents }}</pre>
        -->

        <!--
        <history-details v-model="history" />
        <history-contents v-model="history" />
        -->
    </section>
</template>

<script>

import Vue from "vue";
import VueRx from "vue-rx";
// import { mapActions } from "vuex";
// import { ContentPagination } from "./model";
import { 
    CurrentHistory
} from "./model/observables";

Vue.use(VueRx);

export default {
    /*
    computed: {
        history: {
            get() {
                return this.$store.state.history.current;
            },
            set(newHistory) {
                console.log("setter", newHistory);
                this.$store.commit('setCurrentHistory', newHistory);
            }
        },
        name: {
            get() {
                return this.history.name;
            },
            set(newName) {
                this.history.name = newName;
            }
        }
    },
    */
    subscriptions() {
        return {
            history: CurrentHistory,
            // historyObj: CurrentHistoryObject,
            // contents: CurrentHistoryContents
        }
    }
}

/*
import Vue from "vue";
import VueRx from "vue-rx";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import HistoryDetails from "./HistoryDetails";
import HistoryContents from "./HistoryContents";

Vue.use(VueRx);

export default {
    components: {
        HistoryDetails,
        HistoryContents
    },
    props: {
        debounceDelay: { type: Number, required: false, default: 500 }
    },
    data() {
        return {
            updateBuffer: new Subject()
        }
    },
    computed: {
        history: {
            get() {
                return this.$store.getters.currentHistory;
            },
            set(newHistory) {
                this.updateBuffer.next(newHistory);
            }
        }
    },
    beforeCreate() {
        this.$store.dispatch("loadCurrentHistory");
    },
    created() {
        // debouncing
        const historyUpdates = this.updateBuffer.pipe(
            debounceTime(this.debounceDelay)
        );
        this.$subscribeTo(historyUpdates, newHistory => {
            this.$store.dispatch("saveHistory", newHistory);
        });
    }
}
*/

</script>

<!-- 
<style lang="scss" src="./HistoryPanel.scss"></style> -->
