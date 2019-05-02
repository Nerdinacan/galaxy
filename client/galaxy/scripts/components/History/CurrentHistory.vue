<template>
    <section class="history">
        <h1>Current History</h1>
        <pre>{{ currentHistory }}</pre>
        <history v-if="currentHistory" :history="currentHistory" />
    </section>
</template>

<script>

import { mapGetters } from "vuex";
import History from "./History";

export default {
    components: { History },
    computed: {
        ...mapGetters(['currentHistory'])
    }
}
</script>
