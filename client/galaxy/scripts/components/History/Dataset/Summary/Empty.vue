<template>
    <div>
        <span v-localize>No data</span>: <i>{{ dataset.misc_blurb }}</i>
    </div>
</template>

<script>

export default {
    props: {
        dataset: { type: Object, required: true }
    }
}

</script>
        