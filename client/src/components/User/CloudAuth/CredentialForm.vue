<template>
    <div>
        <pre>{{ identityProviders }}</pre>
        <pre>{{ credential }}</pre>
        <button @click="$emit('collapse')">Collapse</button>
        <button @click="$emit('delete')">Delete</button>
    </div>
</template>

<script>
export default {
    props: {
        credential: { type: Object, required: true },
        identityProviders: { type: Array, required: true },
    },
}
</script>
