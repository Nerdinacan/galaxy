/**
 * Mixin exposes droppable event handlers
 */
export default {
    props: {
        dropHoverClass: { type: String, default: "drop-hover" },
    },
    data() {
        return {
            classes: new Set(),
        };
    },
    computed: {
        dropContainerClasses() {
            return [...this.classes].join(" ");
        },
    },
    methods: {
        addClass(className) {
            if (!this.classes.has(className)) {
                const newSet = new Set(this.classes);
                newSet.add(className);
                this.classes = newSet;
            }
        },
        removeClass(className) {
            if (this.classes.has(className)) {
                const newSet = new Set(this.classes);
                newSet.delete(className);
                this.classes = newSet;
            }
        },
        dragenter(evt) {
            evt.preventDefault();
            this.addClass(this.dropHoverClass);
        },
        dragleave(evt) {
            evt.preventDefault();
            this.removeClass(this.dropHoverClass);
        },
        dragover(evt) {
            evt.preventDefault();
            this.addClass(this.dropHoverClass);
        },
        drop(evt) {
            evt.preventDefault();
            this.removeClass(this.dropHoverClass);
            this.$emit("drop", evt);
        },
    },
    render() {
        return this.$scopedSlots.default({
            dropContainerClasses: this.dropContainerClasses,
            handlers: {
                dragenter: this.dragenter,
                dragleave: this.dragleave,
                dragover: this.dragover,
                drop: this.drop,
            },
        });
    },
};
