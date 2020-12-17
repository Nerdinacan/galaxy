<template>
    <b-list-group-item class="cloud-auth-key" :class="statusClasses" :variant="variant" :button="!expanded">

        <header>
            <hgroup>
                <h4 @click.prevent="expand()">{{ credential.title }}</h4>

                <PriorityMenu class="operations">
                    <PriorityMenuItem
                        v-if="expanded && credential.dirty"
                        key="save-key"
                        title="Save Key"
                        @click.prevent="$emit('save', credential)"
                        icon="fas fa-eye"
                    />
                    <PriorityMenuItem
                        key="delete-key"
                        title="Delete Key"
                        @click.prevent="$emit('delete', credential)"
                        icon="fas fa-eye"
                    />
                    <PriorityMenuItem
                        key="details"
                        title="Show Details"
                        @click.prevent="expand()"
                        icon="fas fa-eye"
                    />
                </PriorityMenu>

            </hgroup>
        </header>

        <!-- <credential-form
            v-if="expanded"
            class="border-top"
            v-model="credential"
            @click.self="expand()"
            @save="$emit('save', credential)"
            @delete="$emit('delete', credential)"
        /> -->
    </b-list-group-item>
</template>

<script>
import { Credential } from "./model";
import CredentialForm from "./CredentialForm";

export default {
    components: {
        CredentialForm,
    },
    props: {
        credential: { type: Credential, required: true },
    },
    computed: {
        statusClasses() {
            const { expanded, valid, dirty, loading } = this.credential;
            return { loading, expanded, valid, dirty, collapsed: !expanded };
        },
        variant() {
            if (this.expanded) {
                return "";
            }
            if (this.credential.dirty) {
                return "warning";
            }
            if (!this.credential.valid) {
                return "danger";
            }
            return "primary";
        },
        expanded() {
            return this.credential.expanded;
        },
    },
    methods: {
        expand(forceState) {
            const expanded = forceState !== undefined ? forceState : !this.expanded;
            this.$emit("expand", { expanded });
        },
    },
};
</script>
