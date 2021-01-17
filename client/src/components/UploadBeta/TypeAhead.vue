<!-- wraps 3rd party type-ahdead with some formatting -->
<template>
    <TypeAhead
        size="sm"
        :min-matching-chars="1"
        :data="options"
        :serializer="pluck('text')"
        @hit="$emit('input', $event)"
    >
        <template v-slot:suggestion="{ data }">
            <div>
                <h6>{{ data.text }}</h6>
                <p v-if="data.description">{{ data.description }}</p>
            </div>
        </template>
    </TypeAhead>
</template>

<script>
import TypeAhead from "vue-typeahead-bootstrap";

export default {
    components: {
        TypeAhead,
    },
    props: {
        options: { type: Array, default: () => [] },
    },
    methods: {
        pluck(field) {
            return (o) => o[field] || "";
        },
    },
};
</script>
