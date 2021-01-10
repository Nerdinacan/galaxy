<template>
    <b-table-simple hover small>
        <b-thead>
            <b-tr>
                <b-th>Name</b-th>
                <b-th>Size</b-th>
                <b-th>Extension</b-th>
                <b-th>Genome</b-th>
                <b-th>Gear</b-th>
                <b-th>Delete</b-th>
            </b-tr>
        </b-thead>
        <b-tbody>
            <b-tr v-for="({ file, status }, idx) in queue" :key="file.name">
                <b-td>{{ file.name }}</b-td>
                <b-td>{{ file.size }}</b-td>
                <b-td>{{ status.extension }}</b-td>
                <b-td>{{ status.genome }}</b-td>
                <b-td>Gear</b-td>
                <b-td>
                    <b-button @click="$emit('cancel', idx)">
                        <span v-localize>Delete</span>
                    </b-button>
                </b-td>
            </b-tr>
        </b-tbody>
    </b-table-simple>
</template>

<script>
export default {
    props: ["queue"],
};
</script>
