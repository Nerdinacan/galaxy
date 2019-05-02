<template>
    <div>
        <h2>History Contents</h2>
        <ul>
            <li v-for="content in listing" :key="content.id">
                <content-item :content="content" />
            </li>
        </ul>
    </div>
</template>

<script>

import ContentItem from "./HistoryContentItem";

export default {
    components: { 
        ContentItem 
    },
    props: {
        historyContent: { 
            type: Array, 
            required: true, 
            default: () => ([])
        }
    },
    computed: {
        listing() {
            return this.historyContent.sort((a,b) => (a.hid - b.hid));
        }
    }
}

</script>
