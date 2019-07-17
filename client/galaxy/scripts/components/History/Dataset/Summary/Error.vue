<template>
    <div>
        <div v-if="!dataset.purged && dataset.misc_info">
            <span>{{ dataset.misc_info }}</span>
        </div>
        <span class="help-text" v-localize>An error occurred with this dataset</span>
        <div v-if="dataset.misc_info" class="job-error-text">
            <span>{{ dataset.misc_info }}</span>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        dataset: { type: Object, required: true }
    }
}

</script>
        