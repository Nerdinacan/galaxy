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
        tags = [], 
        id, itemClass, 
        disabled = false, 
        context = "unspecified" 
    } = options;

    let propData = {
        storeKey: `${itemClass}-${id}`,
        tagService: buildTagService({ id, itemClass, context }),
        tagClickHandler: makoClickHandler(options),
        tags,
        disabled
    };

    let fn = mountVueComponent(Tags);
    return fn(propData, el);
}

/**
 * Generate a click handler for the tags, must return a function (not an arrow
 * function) so that it can be called in the context of the vue component.
 * (See Tags.vue, method: clickHandler)
 * 
 * @param {object} options Passed options from mount fn
 */
const makoClickHandler = (options) => function(tag) {
        
    if (!tag) {
        return;
    }
    
    // This wierd string-function passing scheme is the result of combining
    // the "magic-bullet-style" brittle grid design with the need to
    // initialize the application through python templates. The appropriate
    // way to do this is to simply assign an appropriate event handler to
    // the component at the point at which it is called from a parent
    // component's context.

    let { tagClickFn = "none", clickUrl = null } = options;
    
    switch (tagClickFn) {

        // I made this match the existing behavior, but I am not clear on
        // the reason why this link redirects to a raw json page
        case "community_tag_click":
            if (clickUrl) {
                let suffix = tag.value ? `:${tag.value}` : "";
                let href = `${clickUrl}?f-tags=${tag.text}${suffix}`;
                redirectToUrl(href);
            }
            break;
        
        // this function will be called in context of the component
        // this == vm
        case "add_tag_to_grid_filter":
            this.$store.dispatch("toggleSearchTag", tag);
            break;
    }
}


/**
 * Mount function when a backbone model is provided.
 */
export const mountModelTags = (options = {}, el) => {

    let { model, disabled = false, context = "unspecified" } = options;
    let { id, tags } = model.attributes;
    let itemClass = model.attributes.model_class;

    let propData = {
        storeKey: `${itemClass}-${id}`,
        tagService: buildTagService({ id, itemClass, context }),
        tags,
        disabled
    };

    let fn = mountVueComponent(Tags);
    return fn(propData, el);
}
