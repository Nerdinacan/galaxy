<template>
    <div>
        <h4>
            <i class="fa fa-info-circle"></i>
            <span v-localize>This history is empty</span>.
        </h4>
        <p class="m-0">
            <span v-localize>You can</span>
            <a href="#" @click.prevent="openUploader" v-localize>load your own data</a>
            <span v-localize>or</span>
            <a href="#" @click.prevent="getDataLink" v-localize>get data from an external source</a>.
        </p>
    </div>
</template>

<script>

import { getGalaxyInstance } from "app";
import $ from "jquery";

export default {
    methods: {
        openUploader(evt) {
            const Galaxy = getGalaxyInstance();
            if (Galaxy) {
                Galaxy.upload.show(evt);
            }
        },
        getDataLink(evt) {
            // TODO: remove this jquery when the toolmenu container is a component
            const $toolMenu = $(".toolMenuContainer");
            $toolMenu.parent().scrollTop(0);
            $toolMenu.find('span:contains("Get Data")').click();
        }
    }
}

</script>
