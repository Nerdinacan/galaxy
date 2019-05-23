// import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import { mount, createLocalVue } from "@vue/test-utils";
import SecondaryActions, { __RewireAPI__ as rewire } from "./SecondaryActions";
import STATES from "mvc/dataset/states";
import _l from "utils/localization";

// Mock getGalaxyInstance
const user = { id: "abc" };
const mockGetGalaxyInstance = () => ({ user });

// Sample data for button testing
const testDataset = {
    state: STATES.OK,
    meta_files: [
        {
            download_url: "abc",
            file_type: "def"
        }
    ],
    creating_job: "123",
    purged: false
}

function deepCopy(o) {
    let json = JSON.stringify(o);
    return JSON.parse(json);
}

function buildVue()  {
    const localVue = createLocalVue();
    localVue.use(BootstrapVue);
    localVue.filter("localize", value => _l(value));
    return localVue;
}

describe("History/Dataset/SecondaryActions.vue", () => {

    const localVue = buildVue();
    let wrapper;

    beforeEach(async () => {
        rewire.__Rewire__("getGalaxyInstance", mockGetGalaxyInstance);
        rewire.__Rewire__("prependPath", path => path);

        wrapper = mount(SecondaryActions, { 
            localVue,
            propsData: { dataset },
            methods: {
                go() {
                    console.log("go");
                },
                iframeGo() {
                    console.log("iframeGo");
                },
                backboneGo() {
                    console.log("backboneGo");
                }
            }
        });
    });

    it("should render something", () => {
        assert(wrapper.html());
    })

    it("should show the error button", async () => {
        const dataset = deepCopy(testDataset);
        dataset.state = STATES.ERROR;
        wrapper.setProps({ dataset });
        await localVue.nextTick();        
        assert(wrapper.vm.showErrorButton, "showError should be true for error dataset");
    });

});
