<template>
    <div class="loading">{{ message | localize }}</div>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            default: "Loading required information from Galaxy server.",
        },
    },
};
</script>
