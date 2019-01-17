import sinon from "sinon";
import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import CommunityTags from "./CommunityTags";
import store from "../../store";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("Tags/CommunityTags.vue", () => {
    
    let wrapper;
    let testTags = ["abc", "def", "ghi"];
    
    function clickFirstTag() {
        let firstTag = wrapper.find(".ti-tag-center > div");
        firstTag.trigger('click');
    }
    
    let mockRedirect = sinon.stub();
    CommunityTags.__Rewire__("redirectToUrl", mockRedirect);
    
    beforeEach(function () {    
        wrapper = mount(CommunityTags, { store });
        wrapper.setProps({
            tags: testTags
        });
    })

    afterEach(function() {
        mockRedirect.reset();
    })

    it("the searchTags in the store should be a Set object", () => {
        let searchTags = store.state.gridSearch.searchTags; // this is a Set()
        assert(searchTags instanceof Set, "searchTags wrong variable type, should be Set()");
    })


    // tagClickFn=add_tag_to_grid_filter
    describe("grid tags (tagClickFn: add_tag_to_grid_filter)", () => {

        beforeEach(() => {
            wrapper.setProps({
                tagClickFn: "add_tag_to_grid_filter"
            });
        })

        afterEach(() => {
            store.dispatch("clearSearchTags");
        })

        it("clicking on a search tag should put that tag in the global store", () => {
            clickFirstTag();
            let searchTags = store.state.gridSearch.searchTags; // this is a Set()
            assert(searchTags.has(testTags[0]), "clicked tag not in store");
            // assert(searchTags.size == 1, `wrong number of searchTags in store: ${searchTags.size}`);
        })

        it("clicking the same tag twice should add and remove it from the global store", () => {
            clickFirstTag();
            clickFirstTag();
            let searchTags = store.state.gridSearch.searchTags;
            assert(!searchTags.has(testTags[0]), "clicked tag shouldn't be in store");
        })

        it("clicking any odd number of times should put the tag in the store", () => {
            let oddNumber = 2 * Math.floor(Math.random() * 10) + 1;
            for(let i=0; i < oddNumber; i++) {
                clickFirstTag();
            }
            let searchTags = store.state.gridSearch.searchTags;
            assert(searchTags.has(testTags[0]), "clicked tag not in store");
        })

        it("clicking any even number of times should remove the tag from the store", () => {
            let evenNumber = 2 * Math.floor(Math.random() * 10);
            for(let i=0; i < evenNumber; i++) {
                clickFirstTag();
            }
            let searchTags = store.state.gridSearch.searchTags;
            assert(!searchTags.has(testTags[0]), "clicked tag shouldn't be in store");
        })

    })


    describe("community tag (tagClickFn: community_tag_click)", () => {

        let tagProps = {
            tagClickFn: "community_tag_click",
            clickUrl: "foo/bar"
        };

        beforeEach(()=> wrapper.setProps(tagProps));

        // tagClickFn=community_tag_click, clickUrl=something
        it("should try to redirect when you click a 'community tag'", () => {
            clickFirstTag();
            let expectedUrl = `${tagProps.clickUrl}?f-tags=${testTags[0]}`;
            assert(mockRedirect.calledWith(expectedUrl), "requested wrong url");
        })

    })

})
