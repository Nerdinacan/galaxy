<template>
    <div>
        <header>
            <h5 class="m-0">
                <a href="#" @click="toggleDetails">{{ content.hid }}: {{ title }}</a>
            </h5>
            <!-- <icon-menu>
                <icon-menu-item 
                    title="Delete" 
                    icon="times"
                    @click="deleteCollection"
                    tooltip-placement="topleft" />
            </icon-menu> -->
        </header>
    </div>
</template>


<script>

import { filter, pluck, startWith } from "rxjs/operators";
import { mapState, mapMutations } from "vuex";
import { getCachedDatasetCollection } from "caching";
import { eventHub } from "components/eventHub";
import { IconMenu, IconMenuItem } from "components/IconMenu";


export default {
    components: {
        IconMenu, IconMenuItem
    },
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            showDetails: false,
            dsc: null
        }
    },
    computed: {
        title() {
            const { hid, name } = this.content;
            return `${hid}: ${name}`;
        }
    },
    methods: {

        ...mapMutations("dsc", [ "setCurrentCollectionId" ]),

        toggleDetails() {
            this.showDetails = !this.showDetails;
            const id = this.showDetails ? this.content.id : null;
            this.setCurrentCollectionId(id)
        },

        collapse() {
            this.showDetails = false;
        },
        
        deleteCollection() {
            console.log("deleteCollection");
            console.dir(this.dsc);
        }

    },
    // subscriptions() {
    //     const dsc = this.$watchAsObservable("content", { immediate: true }).pipe(
    //         pluck("newValue", "id"),
    //         getCachedDatasetCollection(),
    //         startWith(null)
    //     );
    //     return { dsc };
    // },
    created() {
        eventHub.$on('collapseAllContent', this.collapse);
        eventHub.$on('toggleContent', this.toggleDetails);
    },
    beforeDestroy() {
        eventHub.$off('collapseAllContent', this.collapse);
        eventHub.$off('toggleContent', this.toggleDetails);
    }
}

</script>
