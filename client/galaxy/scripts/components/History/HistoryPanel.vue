<template>
    <section class="history">
        History Goes Here
        <!-- <history-details v-model="history" />
        <history-contents v-model="history" /> -->
    </section>
</template>
<!-- 

<script>

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

</script> -->

<!-- 
<style lang="scss" src="./HistoryPanel.scss"></style> -->
