import { getGalaxyInstance } from "app";
import user from "mvc/user/user-model";
import Masthead from "layout/masthead";
import Modal from "mvc/ui/ui-modal";

export default {

    created() {
        this.initUser();
        this.setFrameClass();
    },

    mounted() {
        // dont bother unless we're in top window
        if (window.top === window) {

            let galaxy = getGalaxyInstance();

            // old backbone view
            galaxy.masthead = new Masthead.View(this.$props);
            let backboneDom = galaxy.masthead.render();

            // why is this initialized with the masthead?
            galaxy.modal = new Modal.View(); 

            // bolt the rendered DOM onto the vue component's element
            this.$el.appendChild(backboneDom.$el[0]);
        }
    },

    methods: {

        // why does this happen in the masthead?
        initUser() {
            let galaxy = getGalaxyInstance();
            if (!galaxy.user && this.$props.user_json) {
                galaxy.user = new user.User(this.$props.user_json);
            }
        },

        // Alternative to previous manual css manipulation. We don't
        // even need this since :empty is a valid css selector
        
        // TODO: Write style guide outlining the duty of javascript as
        // a manipulator of application state and markup, and not to
        // write CSS manually

        // Going to make this a general init in the onload queue
        setFrameClass() {
            if (window !== window.top) {
                document.body.classList.add("framed");
            }
        }

    }

}
