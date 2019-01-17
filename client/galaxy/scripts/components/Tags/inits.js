/**
 * Initialization functions for tagging component. This is a bridge between the
 * python-rendered page and an eventual component-based architecture. These
 * functions pass in a set of python-rendered configuration variables and
 * instantiate a component. In the near future, we'll just pass props to the
 * component from the parent components and do away with this hybrid approach.
 */

import Vue from "vue";
import AutocompleteTags from "./AutocompleteTags";
import CommunityTags from "./CommunityTags.vue";
import store from "../../store"; 


export function mountTaggingComponent(propsData, container) {
    console.log("mountTaggingComponent", propsData, container);

    let component = Vue.extend(AutocompleteTags);
    
    // convert tags to array, assign to "value" because
    // this particular component is set to use v-model
    propsData.value = Object.keys(propsData.tags);

    return new component({
        store,
        propsData: propsData,
        el: container
    });
}


export function mountCommunityTagsComponent(propsData, container) {
    console.log("mountCommunityTagsComponent", propsData, container);
    
    let component = Vue.extend(CommunityTags);
    
    return new component({
        store,
        propsData: propsData,
        el: container
    });
}
