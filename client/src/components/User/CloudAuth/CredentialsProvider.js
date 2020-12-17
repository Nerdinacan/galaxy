/**
 * Data management for a simple list of credential objects.
 */

import { saveCredential, deleteCredential, getIdentityProviders } from "./model/service";
import { ListStorage } from "utils/ListStorage";
import { fakeLoadCredentials } from "./model/fakeLoader";

export default {
    data() {
        return {
            loading: true,
            items: new ListStorage((item) => item.id),
            identityProviders: [],
        };
    },
    computed: {
        credentials() {
            return [...this.items];
        },
    },
    async created() {
        this.identityProviders = await getIdentityProviders();
        const loadedCredentials = await fakeLoadCredentials();
        this.items = this.items.bulkLoad(loadedCredentials);
        this.loading = false;
    },
    methods: {
        async saveCredential(item) {
            console.log("saveCredential", item);
            // const savedItem = await saveCredential(props);
            const savedItem = item;
            this.items = this.items.add(savedItem);
        },
        async deleteCredential(doomedItem) {
            // await deleteCredential(doomedItem);
            this.items = this.items.remove(doomedItem);
        },
    },
    render() {
        return this.$scopedSlots.default({
            loading: this.loading,
            credentials: this.credentials,
            identityProviders: this.identityProviders,
            saveCredential: this.saveCredential,
            deleteCredential: this.deleteCredential,
        });
    },
};
