<template>
    <div>
        <div class="loading" v-if="$globalState.loadingApp">
            <lottie-player id="loading-system" background="transparent" speed="1" loop autoplay @rendered="onPlayerRendered"></lottie-player>
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
        onPlayerRendered: function (event) {
            if (event && event.target) {
                event.target.load(loadingJson);
            }
        },
        initSystemRequests: function () {
            let self = this;

            self.checkPermission();
            self.requireUser();
        }
    },
    mounted: function () {
        let self = this;
        
        this.checkIfUserIsAuthenticated().then(() => {
            if (self.$root.jwtLoaded) {
                self.initSystemRequests();
            }
        }).catch(() => {})
    }
}
</script>
<style scoped>
.main-container {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.inner-container {
    width: 100%;
    max-width: 900px;
    min-height: 0;
    flex: 1 1 auto;
    margin: auto;
    padding: 1.2rem;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    padding-bottom: 6rem; /* Garante que o conteúdo não fique sob o menu flutuante inferior */
    scrollbar-width: thin;
}

.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 100vh;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;
    animation: fadeIn var(--transition-normal);
}
</style>
