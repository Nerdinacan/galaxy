/**
 * Central Vuex store
 */

import Vue from "vue";
import Vuex from "vuex";
import createCache from "vuex-cache";
import config from "config";

import { gridSearchStore } from "./gridSearchStore";
import { tagStore } from "./tagStore";
import { jobMetricsStore } from "./jobMetricsStore";
import { jobDestinationParametersStore } from "./jobDestinationParametersStore";
import { invocationStore } from "./invocationStore";
import { historyStore } from "./historyStore";
import { userStore, syncUserToGalaxy } from "./userStore";
import { configStore, syncConfigToGalaxy } from "./configStore";
import { workflowStore } from "./workflowStore";
import { datasetPathDestinationStore } from "./datasetPathDestinationStore";
import { datasetExtFilesStore } from "./datasetExtFilesStore";
import { datasetsStore } from "./datasetsStore";
import { jobStore } from "./jobStore";
import { uploadStore as upload, syncUploadToGalaxy } from "../components/Upload";

// beta features
import { historyStore as betaHistory, syncCurrentHistoryToGalaxy } from "components/History/model/historyStore";

Vue.use(Vuex);

export function createStore() {
    const storeConfig = {
        plugins: [createCache()],
        modules: {
            user: userStore,
            config: configStore,
            betaHistory,
            upload,

            // TODO: please namespace all these store modules
            // https://vuex.vuejs.org/guide/modules.html#namespacing
            gridSearch: gridSearchStore,
            histories: historyStore,
            tags: tagStore,
            jobMetrics: jobMetricsStore,
            destinationParameters: jobDestinationParametersStore,
            datasetPathDestination: datasetPathDestinationStore,
            datasetExtFiles: datasetExtFilesStore,
            invocations: invocationStore,
            workflows: workflowStore,
            datasets: datasetsStore,
            informationStore: jobStore,
        },
    };

    // Do not run auto-magic loads or set values on global Galaxy when unit-testing
    if (!config.testBuild) {
        // Initialize state
        storeConfig.plugins.push((store) => {
            store.dispatch("user/loadUser", { store });
        });

        storeConfig.plugins.push(
            syncConfigToGalaxy,
            syncUserToGalaxy,
            syncCurrentHistoryToGalaxy,
            syncCurrentHistoryToGalaxy,
            syncUploadToGalaxy
        );
    }

    return new Vuex.Store(storeConfig);
}

const store = createStore();

// Create watchers to monitor legacy galaxy instance for important values
// TODO: remove on that glorious day when we abandon Galaxy app
// syncConfigToGalaxy((cfg) => {
//     store.commit("config/setConfigs", cfg);
// });
// syncUserToGalaxy((user) => {
//     store.commit("user/setCurrentUser", user);
// });
// syncCurrentHistoryToGalaxy((id) => {
//     store.commit("betaHistory/setCurrentHistoryId", id);
// });
// syncCurrentHistoryToGalaxy((id) => {
//     store.commit("betaHistory/setCurrentHistoryId", id);
// });

export default store;
