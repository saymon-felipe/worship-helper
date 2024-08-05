<template>
    <div>
        <div class="loading" v-if="$globalState.loadingApp">
            <lottie-player id="loading-system" background="transparent" speed="1" loop autoplay></lottie-player>
        </div>
        <div class="app-container" v-else>
            <headerComponent />
            <div class="main-container">
                <div class="inner-container">
                    <slot />
                </div>
            </div>
            <footerComponent />
        </div>
    </div>
</template>

<script>
import footerComponent from "../components/footerComponent.vue";
import headerComponent from '../components/header.vue';
import { globalMethods } from '../js/globalMethods';
import loadingJson from "../assets/animations/loading.json";

export default {
    name: "siteTemplate",
    mixins: [globalMethods],
    components: {
        headerComponent,
        footerComponent
    },
    methods: {
        initSystemRequests: function () {
            let self = this;

            self.checkAppPermission();
            self.checkPermission();
            self.requireUser();
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
    flex: 1;
    max-height: calc(100vh - 170px);
}

.inner-container {
    width: 100%;
    max-width: 900px;
    height: 100%;
    margin: auto;
    padding: 1rem;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    padding-bottom: 5rem;
}

.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
}
</style>