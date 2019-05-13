<template>
    <div>
        <ol v-if="listing.length">
            <li v-for="content in listing" :key="content.id">
                <content-item :content="content" />
            </li>
        </ol>
        <div v-if="!listing.length">
            <p>No content.</p>
        </div>
    </div>
</template>


<script>

import ContentItem from "./HistoryContentItem";

export default {
    components: { 
        ContentItem 
    },
    props: {
        historyContent: { type: Array, required: true }
    },
    computed: {
        listing() {
            return this.historyContent.sort((a,b) => a.hid - b.hid);
        }
    }
}

</script>
