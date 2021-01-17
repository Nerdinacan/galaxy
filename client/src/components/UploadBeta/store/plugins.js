import { upload } from "./loader";

// global subscription
let sub;

/**
 * Subscribes as plugin to store at initialization. Can't use provider mechanism because this thing
 * has to run in the background even when the dialog boxes are closed and the buttons are hidden.
 */
export const startUploader = (store) => {
    if (!sub) {
        sub = upload(store).subscribe({
            next: (result) => console.log("uploader result", result),
            error: (err) => console.warn("uploader error", err),
            complete: () => console.log("uploader completed (huh?)"),
        });
    }
};

/**
 * Might be handy for unit-testing
 */
export const stopUploader = () => {
    if (sub) sub.unsubscribe();
    sub = null;
};
