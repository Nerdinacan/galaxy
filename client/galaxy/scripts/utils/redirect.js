// This file exists purely to make unit testing easier

import { getGalaxyInstance } from "app";
import { getAppRoot } from "onload/loadConfig";


// Simple redirect
export function redirectToUrl(url) {
    window.location = url;
}


// Adds site subfolder prefix to outgoing URL.
// TODO: just set a base-tag in the html template with the site root
// instead of this rube-goldberg nonsense.
export function redirectToSiteUrl(path) {
    redirectToUrl(prependPath(path));
}


// Backbone router redirect
export function backboneRedirect(path) {
    try {
        const router = getGalaxyInstance().router;
        router.navigate(path, { trigger: true });
    } catch(err) {
        console.warn("Unable to navigate to backbone route", err);
    }
}

// Disgusting iframe redirect
export function iframeRedirect(path) {
    window.frames["galaxy_main"].location = prependPath(path);
}

// Prepends approot
const slashCleanup = /(\/)+/g;
export function prependPath(path) {
    const root = getAppRoot();
    return `${root}/${path}`.replace(slashCleanup, "/");
}