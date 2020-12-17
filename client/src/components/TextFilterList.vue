<!-- A generic text filter list. Supply a source list of items and a matching
function to filter the results and expose on a slot prop -->

<template>
    <div>
        <slot
            name="controls"
            :filter="filter"
            :matches="matches"
            :setFilter="setFilter"
            :setFilterFromEvent="setFilterFromEvent"
        >
            <input type="text" v-model="filter" />
        </slot>

        <slot :filter="filter" :matches="matches"></slot>
    </div>
</template>

<script>
export default {
    props: {
        initialFilter: { type: String, required: false, default: "" },
        source: { type: Array, required: true },
        matcher: { type: Function, required: true },
    },
    data() {
        return {
            filter: this.initialFilter,
        };
    },
    computed: {
        matches() {
            return this.source.filter((o) => this.matcher(o, this.filter));
        },
    },
    methods: {
        setFilterFromEvent(evt) {
            this.setFilter(evt.target.value);
        },
        setFilter(val) {
            this.filter = val;
        },
    },
};
</script>
