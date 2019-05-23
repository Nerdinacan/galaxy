<template>
    <div v-if="hasMessages">
        <b-alert :show="history.isDeleted" variant="warning">
            {{ messages.deletedHistory | localize }}
        </b-alert>
        <b-alert :show="userOverQuota" variant="warning">
            {{ messages.quotaWarning | localize }}
        </b-alert>
    </div>
</template>

<script>

const messages = {
    deletedHistory: "This history has been deleted",
    quotaWarning: "You are over your disk quota. Tool execution is on hold until your disk usage drops below your allocated quota."
};

export default {
    props: {
        history: { type: Object, required: true }
    },
    computed: {
        hasMessages() {
            return this.userOverQuota || history.isDeleted;
        }
    },
    data() {
        return {
            userOverQuota: false,
            messages
        }
    }
}

</script>
