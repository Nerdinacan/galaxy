/**
 * This is a collection of miscellaneous javascripts that that were previously
 * printed to the page by python templates or just floating around the onload.js
 * file. Add more by using addInitialization either from a python template, or
 * from anywhere else in the code if you import the loadConfig file.
 *
 * In a python template:
 *    config.addInitialiation(function (galaxyInstance, config) { // your init } )
 * In any webpack script:
 *    import { addInitialization } from "onload";
 *    addInitialization((galaxyInstance, config) => { // do things });
 * 
 * One day soon, these will all disappear because any functionality they provide
 * will more properly be run inside a lifecycle handler inside of a component.
 */

import { prependInitialization } from "../initQueue";

// specific initialization functions functions
import { monitorInit } from "utils/installMonitor";
import { initSentry } from "./initSentry";
// import { initFormInputAutoFocus } from "./initFormInputAutoFocus";
import { initTooltips } from "./initTooltips";
import { adjustIframeLinks, addIframeClass } from "./iframesAreTerrible";
import { init_refresh_on_change } from "./init_refresh_on_change";
import { onloadWebhooks } from "./onloadWebhooks";
import { replace_big_select_inputs } from "./replace_big_select_inputs";
import { make_popup_menus } from "ui/popupmenu";
import { initTours } from "./initTours";

export function globalInits() {
    prependInitialization(
        monitorInit,
        initSentry,
        addIframeClass,
        adjustIframeLinks,
        // initFormInputAutoFocus,
        initTooltips,
        init_refresh_on_change,
        () => replace_big_select_inputs(20, 1500),
        make_popup_menus,
        initTours,
        onloadWebhooks
    );
}