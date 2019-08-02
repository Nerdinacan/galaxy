<template>
    <div>
        <p v-localize>This job is paused. Use the "Resume Paused Jobs"
            in the history menu to resume.</p>
        <div v-if="dataset.misc_info">
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
        