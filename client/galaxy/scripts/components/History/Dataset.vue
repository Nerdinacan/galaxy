<template>
    <div>
        <h3>Dataset: {{ dataset.id }}</h3>
        <pre>{{ dataset }}</pre>
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
