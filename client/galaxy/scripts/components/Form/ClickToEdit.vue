<template>
    <div>
        <span v-if="!isEditing" @click="isEditing = true">
            <h2>{{ inputValue }}</h2>
        </span>
        <span v-if="isEditing" @blur="lookAtBlur">
            <input v-model="inputValue" @blur="isEditing = false" />
        </span>
    </div>
</template>

<script>
export default {
    props: {
        value: { required: true }
    },
    computed: {
        inputValue: {
            get() {
                return this.value;
            },
            set(newVal) {
                this.$emit('input', newVal);
            }
        }
    },
    data() {
        return {
            isEditing: false
        }
    },
    methods: {
        lookAtBlur(e) {
            console.log("lookAtBlur", e);
        }
    }
}
</script>