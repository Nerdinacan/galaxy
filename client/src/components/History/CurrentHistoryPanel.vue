<template>
    <UserHistoriesProvider
        v-slot="{
            currentHistory,
            histories,
            setCurrentHistory,
            updateHistory,
            createHistory,
            deleteHistory,
            purgeHistory,
            setHistory,
        }"
    >
        <HistoryPanel
            v-if="currentHistory"
            :history="currentHistory"
            @saveHistory="updateHistory(currentHistory)"
            @deleteHistory="deleteHistory(currentHistory)"
            @purgeHistory="purgeHistory(currentHistory)"
            @updateHistory="updateHistory"
            @setHistory="setHistory"
        >
            <template v-slot:nav>
                <div>
                    <HistorySelector
                        :current-history="currentHistory"
                        @update:currentHistory="setCurrentHistory"
                        :histories="histories"
                    />
                    <HistoriesMenu @createHistory="createHistory" />
                </div>
            </template>
        </HistoryPanel>

        <div v-else class="flex-grow-1 loadingBackground h-100">
            <span class="sr-only" v-localize>Loading History...</span>
        </div>
    </UserHistoriesProvider>
</template>

<script>
import HistoriesMenu from "./HistoriesMenu";
import HistorySelector from "./HistorySelector";
import HistoryPanel from "./HistoryPanel";
import { UserHistoriesProvider } from "./providers";

export default {
    components: {
        UserHistoriesProvider,
        HistoryPanel,
        HistorySelector,
        HistoriesMenu,
    },
};
</script>
