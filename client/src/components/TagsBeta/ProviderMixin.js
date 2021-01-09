import { debounce } from "lodash";

export default {
    props: {
        debounceTime: { type: Number, required: false, default: 500 },
    },

    data() {
        return {
            loading: false,
            items: new Set(),
        };
    },

    computed: {
        tags() {
            return Array.from(this.items);
        },
    },

    methods: {
        async saveTag(tag) {
            if (!tag) return;
            const newTags = new Set(this.items);
            newTags.add(tag);
            await this.saveTags(newTags);
        },
        async deleteTag(doomedTag) {
            if (!doomedTag) return;
            const newTags = new Set(this.items);
            newTags.delete(doomedTag);
            await this.saveTags(newTags);
        },
        async saveTags(rawTags) {
            this.loading = true;
            const tags = Array.from(rawTags);
            const newHistory = await this.saveToServer(tags);
            this.items = new Set(newHistory.tags || []);
            this.loading = false;
        },
        async saveToServer(tags) {
            throw new Error("Implement save to server");
        },
    },

    created() {
        this.saveTags = debounce(this.saveTags, this.debounceTime);
    },

    render() {
        return this.$scopedSlots.default({
            loading: this.loading,
            tags: this.tags,
            saveTag: this.saveTag,
            deleteTag: this.deleteTag,
            saveTags: this.saveTags,
        });
    },
};
