<template>
    <div>
        <h4>Dataset</h4>
        <h3>{{ dataset.id }}</h3>
    </div>
</template>

<script>

export default {
    props: {
        content: { type: Object, required: true }
    },
    computed: {
        dataset() {
            return this.content;
        }
    }
}

</script>
