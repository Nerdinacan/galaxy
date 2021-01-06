import UploadDialog from "./UploadDialog";
import { mountVueComponent } from "utils/mountVueComponent";

// mounts UploadDialog wrapper around bmodal
const mounter = mountVueComponent(UploadDialog);

// just one instance of the uploader
let instance;

export function mount(propsData = {}) {
    if (!instance) {
        const container = document.createElement("div");
        document.body.appendChild(container);
        instance = mounter(propsData, container);
    } else {
        // subsequent calls to the mount update the props
        for (const field in propsData) {
            instance.$set(instance.$props, field, propsData[field]);
        }
    }
    return instance;
}
