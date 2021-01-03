<template>
    <UserHistoriesProvider
        v-slot="{
            currentHistory,
            histories,
            setCurrentHistory,
            saveHistory,
            createHistory,
            deleteHistory,
            purgeHistory,
        }"
    >
        <HistoryPanel
            v-if="currentHistory"
            :history="currentHistory"
            @saveHistory="saveHistory(currentHistory)"
            @deleteHistory="deleteHistory(currentHistory)"
            @purgeHistory="purgeHistory(currentHistory)"
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
import UserHistoriesProvider from "./providers";

export default {
    components: {
        UserHistoriesProvider,
        HistoryPanel,
        HistorySelector,
        HistoriesMenu,
    },
};
</script>
