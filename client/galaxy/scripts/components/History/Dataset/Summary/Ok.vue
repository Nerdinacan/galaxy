<template>
    <div>
        <div v-if="dataset.misc_blurb" class="blurb">
            <span class="value">{{ dataset.misc_blurb }}</span>
        </div>
        <div v-if="dataset.file_ext" class="datatype">
            <label class="prompt">{{ 'format' | localize }}</label>
            <span class="value">{{ dataset.file_ext }}</span>
        </div>
        <div v-if="dataset.metadata_dbkey" class="dbkey">
            <label class="prompt">{{ 'database' | localize }}</label>
            <span class="value">{{ dataset.metadata_dbkey }}</span>
        </div>
        <div v-if="dataset.misc_info">
            <span>{{ dataset.misc_info }}</span>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        dataset: { type: Object, required: true }
    }
}

</script>
