<template>
    <droppable v-slot="{ handlers, dropContainerClasses }" @drop="dropFiles">
        <div v-on="handlers" :class="dropContainerClasses">
            <b-table-simple small>
                <b-thead>
                    <b-tr>
                        <b-th v-localize class="align-middle p-1">Name</b-th>
                        <b-th v-localize>Size</b-th>
                        <b-th v-localize>Extension</b-th>
                        <b-th v-localize>Genome</b-th>
                        <b-th>&nbsp;</b-th>
                    </b-tr>
                </b-thead>
                <b-tbody>
                    <ListItem
                        v-for="(item, index) in queue"
                        :key="index"
                        :genomes="genomes"
                        :extensions="extensions"
                        :uploader-active="active"
                        v-bind="item"
                        v-on="$listeners"
                    />
                </b-tbody>
            </b-table-simple>
        </div>
    </droppable>
</template>

<script>
import { uploadProps } from "../helpers";
import { Droppable } from "components/FileSelection";
import ListItem from "./ListItem";

export default {
    components: {
        ListItem,
        Droppable,
    },
    props: uploadProps,
    methods: {
        dropFiles(evt) {
            const fileList = evt?.dataTransfer?.files || [];
            for (const file of fileList) {
                this.$emit("fileDrop", file);
            }
        },
    },
};
</script>
