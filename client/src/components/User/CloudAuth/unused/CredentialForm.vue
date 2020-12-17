<template>
    <div>
        <div>{{ credential }}</div>
        <div>{{ identityProviders }}</div>
    </div>
    <!-- <b-form :validated="credential.isValid">
        <b-form-group label="Description" label-for="credentialDescription" label-cols-lg="3">
            <b-form-input
                id="credentialDescription"
                v-model="credential.description"
                :state="credential.fieldValid('description')"
                placeholder="Description (optional)"
                trim
            />
        </b-form-group>

        <b-form-group
            label="Identity Provider"
            label-for="identityProvider"
            label-cols-lg="3"
            v-if="identityProviders.length > 1"
        >
            <b-form-select
                id="identityProvider"
                v-model="credential.authn_id"
                :state="credential.fieldValid('authn_id')"
                :options="identityProviders"
            />
        </b-form-group>

        <b-form-group label="Resource Provider" label-for="resourceProvider" label-cols-lg="3">
            <b-form-select
                id="resourceProvider"
                v-model="credential.resourceProvider"
                :state="credential.fieldValid('provider')"
                :options="resourceProviderOptions"
            />
        </b-form-group>

        <credential-config v-model="credential.config" />

        <footer class="border-top">
            <b-button variant="secondary" @click.prevent="$emit('delete', credential)">
                Delete Key
            </b-button>
            <b-button
                aria-label="Save Key"
                :variant="saveButtonVariant"
                :disabled="saveButtonDisabled"
                @click.prevent="$emit('save', credential)"
            >
                {{ saveButtonTitle }}
            </b-button>
        </footer>

    </b-form> -->
</template>

<script>
import { Credential, ResourceProviders } from "./model";
import { getIdentityProviders } from "./model/service";
import CredentialConfig from "./CredentialConfig";

export default {
    components: {
        CredentialConfig,
    },
    props: {
        value: { type: Credential, required: true },
    },
    data() {
        return {
            identityProviders: [],
        };
    },
    computed: {
        credential() {
            return this.value;
        },
        // transformed for bootstrap component
        resourceProviderOptions() {
            return Array.from(ResourceProviders.entries()).map(([value, o]) => ({ value, text: o.label }));
        },
        config() {
            return this.credential.config;
        },
        loading() {
            return this.credential.loading;
        },
        saveButtonDisabled() {
            return !(this.credential.valid && this.credential.dirty);
        },
        saveButtonVariant() {
            return this.saveButtonDisabled ? "secondary" : "primary";
        },
        saveButtonTitle() {
            return this.loading ? "Saving Key..." : "Save Key";
        },
    },
    async created() {
        const result = await getIdentityProviders();
        this.identityProviders = result;

        if (!this.credential.authn_id && result.length == 1) {
            this.credential.authn_id = result[0].authn_id;
            this.credential.updateState();
        }
    },
};
</script>
