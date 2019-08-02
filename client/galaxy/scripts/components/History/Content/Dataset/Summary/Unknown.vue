<template>
    <div>Error: unknown dataset state "{{ dataset.state }}"</div>
</template>

<script>

export default {
    props: {
        dataset: { type: Object, required: true }
    }
}

</script>
        