<template>
    <CredentialsProvider v-slot="{ credentials, identityProviders, saveCredential, deleteCredential }">
        <TextFilter :source="credentials" :matcher="credentialMatcher">

            <template v-slot:controls="{ filter, setFilterFromEvent }">
                <input type="text" :value="filter" @input="setFilterFromEvent" />
            </template>

            <template v-slot:default="{ matches }">
                <div>
                    <p>{{ matches.length }} matches out of {{ credentials.length}} items</p>
                    <CredentialList
                        :credentials="matches"
                        :identityProviders="identityProviders"
                        @save="saveCredential"
                        @delete="deleteCredential"
                    />
                </div>
            </template>

        </TextFilter>
    </CredentialsProvider>
</template>

<script>

import TextFilter from "components/TextFilterList";
import CredentialsProvider from "./CredentialsProvider";
import CredentialList from "./CredentialList";

export default {
    components: {
        CredentialsProvider,
        CredentialList,
        TextFilter
    },
    beforeCreate() {
        // a function that matches a credential to a text filter, return true if
        // matches. Don't set in data because this is a static value
        this.credentialMatcher = (c, textFilter) => c.description.includes(textFilter);
    }
};

</script>
