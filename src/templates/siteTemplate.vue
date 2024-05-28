<template>
    <div>
        <div class="loading" v-if="loading">
            <lottie-player id="loading-system" background="transparent" speed="1" loop autoplay></lottie-player>
        </div>
        <div class="app-container" v-else>
            <headerComponent />
            <div class="main-container">
                <div class="inner-container">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import headerComponent from '../components/header.vue';
import { globalMethods } from '../js/globalMethods';
import loadingJson from "../assets/animations/loading.json";

export default {
    name: "siteTemplate",
    mixins: [globalMethods],
    components: {
        headerComponent
    },
    data() {
        return {
            loading: true
        }
    },
    methods: {
        initSystemRequests: function () {
            let self = this;

            self.requireUser().then(() => {
                self.loading = false;
            })
        }
    },
    mounted: function () {
        const player = document.querySelector("lottie-player");
        player.addEventListener("rendered", () => {
            player.load(
                loadingJson
            );
        });

        let self = this;
        
        this.checkIfUserIsAuthenticated().then(() => {
            let interval = setInterval(() => {
                if (self.$root.jwtLoaded) {
                    clearInterval(interval);

                    self.initSystemRequests();
                }
            })
        }).catch(() => {})
    }
}
</script>
<style scoped>
.main-container {
    flex-grow: 1;
}
.inner-container {
    width: 100%;
    max-width: 900px;
    height: 100%;
    margin: auto;
    padding: 1rem 1rem 5rem 1rem;
}
</style>