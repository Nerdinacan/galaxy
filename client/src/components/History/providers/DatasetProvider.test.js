/**
 * The collection API for a collection does not, on its own, return enough data about a dataset
 * collection to properly render all the requested features for a nested dataset. This provder
 * allows the UI to request and cache a fresh version from the server on-demand as the user expands
 * the dataset (that is cantained in a collection).
 *
 * NOTE: this is not needed for datasets at the root level of a history. The full set of information
 * is already present in datasets there.
 *
 * Sample Usage:
 *
 * <DatasetProvider :item="collectionData" v-slot="{ dataset, load, isLoaded }">
 *     <YourCustomUI v-if="isLoaded" :dataset="dataset" />
 *     <spn v-else>Loading...</spn>
 * </DatasetProvider>
 *
 */

import { shallowMount } from "@vue/test-utils";
import { getLocalVue } from "jest/helpers";
import { waitForLifecyleEvent } from "jest/helpers";

// test me
import { datasetContentValidator, default as DatasetProvider } from "./DatasetProvider";

// mock the cache * lookup fns
import { getContentByTypeId, cacheContent, wipeDatabase } from "../caching";
import { getContentDetails } from "../model/queries";

// jest.mock("app");
jest.mock("../caching");
jest.mock("../model/queries");

beforeEach(wipeDatabase);
afterEach(wipeDatabase);

const fakeDataset = { history_id: 123, type_id: "abc" };
getContentDetails.mockImplementation(async (id) => {
    return fakeDataset;
});

cacheContent.mockImplementation(async () => {
    throw "I'm a mock!";
});

getContentByTypeId.mockImplementation(async () => {
    throw "I'm a mock!";
});

describe("DatasetProvider component", () => {
    // Test the prop validator
    describe("prop validation function", () => {
        it("should require a history_id and a type_id at a minimum", () => {
            expect(datasetContentValidator({})).toBeFalsy();
            expect(datasetContentValidator({ history_id: 123 })).toBeFalsy();
            expect(datasetContentValidator({ type_id: "abc123" })).toBeFalsy();
            expect(datasetContentValidator({ history_id: 123, type_id: "abc123" })).toBeTruthy();
        });
    });

    describe("DatasetProvider", () => {
        let wrapper;
        let slotProps;

        beforeEach(async () => {
            // jest.clearAllMocks();

            const propsData = { item: fakeDataset };
            const localVue = getLocalVue();

            wrapper = shallowMount(DatasetProvider, {
                localVue,
                propsData,
                scopedSlots: {
                    default(props) {
                        slotProps = props;
                    },
                },
            });

            await waitForLifecyleEvent(wrapper.vm, "updated");
        });

        test("initial load should have stubbed dataset object created from collection item data", () => {
            expect(slotProps.dataset).toBeDefined();
        });
        test("user requests detailed version, should lookup and return full dataset object", () => {
            expect(slotProps.dataset).toBeDefined();
        });
    });
});
