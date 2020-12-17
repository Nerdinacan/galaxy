<template>
    <expander v-slot="{ toggleOn: expand, toggleOff: collapse, isToggled: isExpanded }">
        <b-list-group>
            <template v-for="cred in credentials">

                <!-- editor -->
                <b-list-group-item v-if="isExpanded(cred)" :key="cred.id">
                    <credential-form v-if="isExpanded(cred)"
                        :credential="cred"
                        :identityProviders="identityProviders"
                        @collapse="collapse(cred)"
                        @save="$emit('save', cred)"
                        @delete="$emit('delete', cred)" />
                </b-list-group-item>

                <!-- collapsed button version -->
                <b-list-group-item v-else button @click="expand(cred)" :key="cred.id">
                    {{ cred.description }}
                </b-list-group-item>

            </template>
        </b-list-group>
    </expander>
</template>

<script>

import Expander from "components/ToggleSet";
import CredentialForm from "./CredentialForm";

export default {
    components: { Expander, CredentialForm },
    props: {
        credentials: { type: Array, required: true },
        identityProviders: { type: Array, required: true },
    },
}

</script>
