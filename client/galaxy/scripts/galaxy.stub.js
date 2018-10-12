/**
 * window property that catches Galaxy references
 * until app_singleton is ready. Just needs to work
 * well enough to load libs so we can run static/teststub.html
 */

let instance = null;
let stubIsDefined = false;

if (!stubIsDefined) {
    Object.defineProperty(window, "Galaxy", {
        enumerable: true,

        // This code exists to provide a value to all the random
        // incompetent scripting that just talks to window.Galaxy

        get() {
            if (!instance) {
                console.group("Somebody is accessing window.Galaxy prior to initialization...");
                instance = {
                    root: "/",
                    config: {},
                    debug(...args) {
                        console.log("Galaxy fallback debug: ", ...args);
                    }
                };
                console.groupEnd();
            }
            return instance;
        },
        set(newValue) {
            console.warn("Attempt to write to window.Galaxy with...", newValue);
            instance = newValue;
        }
    });

    stubIsDefined = true;
}
