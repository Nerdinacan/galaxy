/**
 * These functions are for mounting the tag display/editor in non-Vue
 * environments such as the existing python scripts and Backbone views.
 */

import Tags from "./Tags";
import { mountVueComponent } from "utils/mountVueComponent";
import { redirectToUrl } from "utils/redirect";
import { buildTagService } from "./tagService";


/**
 * General mount function for the tags that were previously rendered
 * by the tagging_common.mako file
 */
export const mountMakoTags = (options = {}, el) => {

    let { 
        id,
        itemClass, 
        tags = [], 
        disabled = false, 
        context = "unspecified" 
    } = options;

    let propData = {
        storeKey: `${itemClass}-${id}`,
        tagService: buildTagService({ id, itemClass, context }),
        tags,
        disabled
    };

    let fn = mountVueComponent(Tags);
    let vm = fn(propData, el);
    vm.$on("tag-click", makoClickHandler(options, vm));

    return vm;
}

/**
 * Generate a click handler for the tags, must return a function (not an arrow
 * function) so that it can be called in the context of the vue component.
 * (See Tags.vue, method: clickHandler)
 * 
 * @param {object} options Passed options from mount fn
 */
const makoClickHandler = (options, vm) => function(tag) {
        
    if (!tag) {
        return;
    }

    let { tagClickFn = "none", clickUrl } = options;
    
    
    // The horribly-conceived tagClickFn variable is still here to work with the
    // existing server-driven rendering. It won't be necessary once we actually
    // have separate component environtments explicitly containing community
    // tags or grid contexts. This is functionality that should have been
    // defined in-context and not through configuration.

    switch (tagClickFn) {

        // I made this match the existing behavior, but I am not clear on
        // the reason why this link redirects to a raw json page
        case "community_tag_click":
            if (undefined !== clickUrl) {
                let suffix = tag.value ? `:${tag.value}` : "";
                let href = `${clickUrl}?f-tags=${tag.text}${suffix}`;
                redirectToUrl(href);
            }
            break;
        
        // this function will be called in context of the component
        // this == vm
        case "add_tag_to_grid_filter":
            vm.$store.dispatch("toggleSearchTag", tag);
            break;
    }
}


/**
 * Mount function when a backbone model is provided.
 */
export const mountModelTags = (options = {}, el) => {

    let { 
        model, 
        disabled = false, 
        context = "unspecified" 
    } = options;
    
    if (!model) {
        console.warn("Missing model in mountModelTags");
        return;
    }

    let { 
        id, 
        model_class: itemClass,
        tags = []
    } = model.attributes;

    let propData = {
        storeKey: `${itemClass}-${id}`,
        tagService: buildTagService({ id, itemClass, context }),
        tags,
        disabled
    };

    let fn = mountVueComponent(Tags);
    return fn(propData, el);
}
