<template>
    <div>
        <h3>Dataset Collection: {{ dsc.id }}</h3>
        <pre>{{ dsc }}</pre>
    </div>
</template>

<script>

export default {
    props: {
        content: { type: Object, required: true }
    },
    computed: {
        dsc() {
            return this.content;
        }
    }
}

</script>