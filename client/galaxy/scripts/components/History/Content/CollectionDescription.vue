<!-- This seems dumb, look for a way to make this a model method -->

<template>
    <p>a {{ collectionType | localize }} {{ collectionCount | localize }}</p>
</template>

<script>

export default {
    props: {
        content: { type: Object, required: true }
    },
    computed: {

        collectionType() {
            switch(this.content.collection_type) {
                case "list":
                    return "list"
                case "paired":
                    return "dataset pair"
                case "list:paired":
                    return "list of pairs";
                default:
                    return "nested list";
            }
        },

        collectionCount() {
            const count = this.content.element_count;
            return count == 1 ? "with 1 item" : `with ${count} items`;
        }

    }
}

</script>