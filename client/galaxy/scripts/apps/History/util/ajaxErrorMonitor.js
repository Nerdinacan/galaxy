import { errorTypes, errors } from "./errors";

/**
 * Subscribes to global error observable so we can have the router navigate to
 * the login page during an authentication error. Returns an rxjs subscription
 * object which can later be used to unsubscribe the listener.
 *
 * e.g.  let sub = initAjaxErrorMonitor();
 *       sub.unsubscribe();
 *
 * @returns Subscription
 */
export function initAjaxErrorMonitor(router) {
    return errors.subscribe(payload => {
        if (payload.type == errorTypes.AUTH) {
            router.push({ name: "login" });
        }
    });
}
