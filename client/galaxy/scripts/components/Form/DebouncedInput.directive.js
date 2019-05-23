/**
 * Debounces input events, emits as change events so v-model.lazy 
 * can see them.
 * ex: <input v-model.lazy="sample" v-debounce="500" />
 */

import { fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";

export default {
    bind: install,
    update(el, binding) {
        // binding.value is the delay, resubscribe if delay changed
        if (binding.value !== binding.oldValue) {
            install(el, binding);
        }
    },
    unbind: cleanUp
}

// emit a change event after a short debounce so the vmodel
// can detect it using the .lazy modifier
function install(el, binding) {

    cleanUp(el);

    const delay = binding.value ? parseInt(binding.value) : 500;
    if (delay <= 0) {
        return;
    }

    const change$ = fromEvent(el, 'input').pipe(
        debounceTime(delay)
    );

    const sub = change$.subscribe(() => {
        el.dispatchEvent(new Event('change'));
    });

    el._debouncedSub = sub;
}

function cleanUp(el) {
    if (el._debouncedSub) {
        el._debouncedSub.unsubscribe();
        delete el._debouncedSub;
    }
}
