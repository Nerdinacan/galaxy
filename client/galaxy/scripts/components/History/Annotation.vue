<textarea>
    <textarea v-model="annotation"></textarea>
</textarea>

<script>

export default {
    props: { 
        value: { type: String, required: false, default: "" }
    },
    computed: {
        annotation() {
            return this.value;
        }
    }
}

</script>
