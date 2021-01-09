<template>
    <div class="loading" v-if="message">{{ message | localize }}</div>
</template>

<script>
export default {
    props: {
        message: { type: String, default: "" },
    },
};
</script>