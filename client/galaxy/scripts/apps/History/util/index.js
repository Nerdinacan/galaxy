/**
 * Everything in this folder will more realistically exist
 * in a parent module, but since we don't have one of them
 * yet, I'm putting it all here
 */

export { config } from "./config";
export { doMeSomeAjax as ajax } from "./ajax";
export { errors, setError } from "./errors";
export { initAjaxErrorMonitor } from "./ajaxErrorMonitor";
export { getApiKey } from "./authService";
export { setAuthToken, authToken$ } from "./authToken";
