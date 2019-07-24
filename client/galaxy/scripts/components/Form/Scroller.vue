<!-- <template>
    <div ref="scrollContainer">
        <div ref="scrollContent">
            <slot :updatePageRange="updatePageRange">
                <ol>
                    <li v-for="(c, index) in content" :key="c.type_id" 
                        class="d-flex mb-1">
                        <b-form-checkbox v-if="showSelection" class="m-1"
                            v-model="selection" :value="c" />
                        <content-item  class="flex-grow-1"
                            :type-id="c.type_id"
                            :tabindex="index"
                            v-observe-visibility="updatePageRange(c.hid)"
                            @keyup.space.stop.prevent.self="toggleContent(c)"
                            :data-state="c.state" />
                    </li>
                </ol>
            </slot>
        </div>
        <div class="sensor" v-observe-visibility="updatePageRange(nextPage)">
            <p>Sensor nextPage: {{ nextPage }}</p>
        </div> 
    </div>
</template>

<script>

export default {

}

</script> -->