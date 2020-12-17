export default {
    data() {
        return {
            toggled: new Set()
        };
    },
    methods: {
        toggle(item) {
            const newSet = new Set(this.toggled);
            this.toggled.has(item) ? newSet.delete(item) : newSet.add(item);
            this.toggled = newSet;
        },
        toggleOn(item) {
            if (!this.toggled.has(item)) {
                this.toggle(item);
            }
        },
        toggleOff(item) {
            if (this.toggled.has(item)) {
                this.toggle(item);
            }
        },
        isToggled(item) {
            return this.toggled.has(item);
        },
    },
    render() {
        return this.$scopedSlots.default({
            toggled: [ ...this.toggled ],
            toggle: this.toggle,
            toggleOn: this.toggleOn,
            toggleOff: this.toggleOff,
            isToggled: this.isToggled,
        });
    },
};
