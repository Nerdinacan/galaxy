<template>
    <div ref="annotationInput" class="annotation">
        <p v-if="!editAnnotation"
            @click="toggleAnnotation(true)">
            <span class="editable"></span>
            <span v-if="annotation">{{ annotation }}</span>
            <span v-if="!annotation">{{ 'Click to edit annotation' | localize }}</span>
            <b-tooltip ref="annotationTooltip" 
                :placement="tooltipPlacement"
                :target="() => $refs['annotationInput']" 
                :title="'Click to edit annotation' | localize"
                boundary="viewport" />
        </p>
        <debounced-input v-if="editAnnotation" v-model="annotation" :delay="1000">
            <b-form-textarea size="sm"
                slot-scope="scope" 
                :value="scope.value"
                @input="scope.input"
                @blur="toggleAnnotation(false)" 
                :placeholder="'Click to edit annotation' | localize"
                :state="lengthCheck(scope.value, annotation)"
                rows="1" max-rows="5"
            ></b-form-textarea>
        </debounced-input>
    </div>
</template>

<script>

import DebouncedInput from "components/Form/DebouncedInput";

export default {
    components: {
        DebouncedInput
    },
    props: {
        value: { type: String, required: false, default: "" },
        tooltipPlacement: { type: String, required: false, default: "left" }
    },
    data() {
        return {
            editAnnotation: false
        }
    },
    computed: {
        annotation: {
            get() {
                return this.value;
            },
            set(annotation) {
                this.$emit('input', annotation);
            }
        }
    },
    methods: {

        toggleAnnotation(bForce) {
            this.editAnnotation = (bForce !== undefined) ? Boolean(bForce) : !this.editAnnotation;
        },

        lengthCheck(val, origVal) {
            if (val === origVal) {
                return null;
            }
            return val.length > 0;
        }
    }
}

</script>


<style lang="scss" scoped>

@import "~scss/mixins.scss";

.annotation p {
    @include clickToEdit();
    font-style: italic;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    padding: 0;
    margin: 0;
}

</style>
