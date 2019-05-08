<template>
    <section class="history">
        <h1>Current History</h1>
        <pre>{{ currentHistory }}</pre>

        <select v-model="currentHistoryId">
            <option v-for="h in histories" :key="h.id" :value="h.id">
                {{ h.id }}: {{ h.name }}
            </option>
        </select>

        <history :history="currentHistory" />
        
    </section>
</template>

<script>

import History from "./History";

export default {
    components: { History },
    data() {
        return {
            selectedHistory: null
        }
    },
    computed: {
        currentHistory: {
            get() {
                return this.$store.state.history.currentHistory;
            },
            set(newHistory) {
                this.$store.dispatch("history/updateCurrentHistory", newHistory);
            }
        },
        currentHistoryId: {
            get() {
                return this.currentHistory.id;
            },
            set(newId) {
                let h = this.histories.find(h => h.id == newId);
                if (h) {
                    this.currentHistory = h;
                }
            }
        },
        histories() {
            return this.$store.state.history.histories;
        }
    }
}
</script>
