<template>
    <div>
        <h4>Collection</h4>
        <h3>{{ dsc.id }}</h3>
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
