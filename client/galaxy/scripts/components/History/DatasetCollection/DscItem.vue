<template>
    <div :class="{ expanded, collapsed: !expanded }">
        
        <!-- <nav class="dataset-top-menu d-flex justify-content-between" 
                @click="toggleDetails"></nav> -->
        
        <header>
            <h4><a href="#" @click="toggleDetails">{{ title }}</a></h4>
        </header>

        <transition name="shutterfade">
            <div v-if="expanded" class="details px-3 pb-3">
                {{ dsc }}
            </div>
        </transition>

    </div>
</template>


<script>

import { mapState, mapMutations } from "vuex";
import { DatasetCollection$ } from "../Dataset/model/Dataset$";
import { eventHub } from "components/eventHub";

export default {
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            dsc: null,
            expand: false
        }
    },
    computed: {
        title() {
            const { hid, name } = this.content;
            return `${hid}: ${name}`;
        },
        expanded() {
            return this.dsc && this.expand;
        }
    },
    methods: {

        // ...mapMutations("dsc", [ "setCurrentCollectionId" ]),
        
        toggle(paramName, forceVal) {
            if (!(paramName in this)) {
                console.warn("Missing toggle parameter", paramName);
                return;
            }
            if (forceVal === undefined) {
                this[paramName] = !this[paramName];
            } else {
                this[paramName] = forceVal;
            }
        },

        toggleDetails() {
            this.toggle('expand');
        },

        collapse() {
            this.toggle('expand', false);
        },

        load() {
            if (!this.dscSub) {
                console.log("subscribing to live dataset observable");
                const sub = this.$subscribeTo(
                    DatasetCollection$(this.content),
                    dsc => this.dsc = dsc,
                    err => console.warn("DatasetCollection observable err", err),
                    () => console.log("DatasetCollection observable complete")
                );
                this.dscSub = sub;
            }
        },

    },
    watch: {
        expand(newVal) {
            if (newVal) {
                this.load();
            }
        }
    },
    created() {
        eventHub.$on('collapseAllContent', this.collapse);
    },
    beforeDestroy() {
        eventHub.$off('collapseAllContent', this.collapse);
    }
}

</script>
