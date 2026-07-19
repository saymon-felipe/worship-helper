<template>
    <siteTemplate>
        <router-view v-slot="{ Component }">
            <Transition name="route" mode="out-in">
                <component :is="Component" />
            </Transition>
        </router-view>
    </siteTemplate>
    <Teleport to="body">
        <Transition name="modal-fade">
            <modal
                v-if="showInstallModal"
                title="Instale o Worship Helper"
                :buttonTitle="installButtonTitle"
                button2Title="Continuar no navegador"
                :disabled="isInstalling"
                @closeModal="closeInstallModal"
                @cancelEvent="closeInstallModal"
                @submitEvent="installApp"
            >
                <installAppModalContent
                    :isIOS="isIOS"
                    :showIOSInstructions="showIOSInstructions"
                    :errorMessage="installError"
                />
            </modal>
        </Transition>
    </Teleport>
</template>
<script>
import siteTemplate from "../templates/siteTemplate.vue";
import modal from "../components/modal.vue";
import installAppModalContent from "../components/installAppModalContent.vue";
import { globalMethods } from '../js/globalMethods';
import { getPwaInstallUnavailableMessage, isIOSDevice, isPwaInstalled, requestPwaInstall } from '../services/pwaInstall';

/* eslint-disable vue/multi-word-component-names, vue/no-reserved-component-names */
export default {
    name: "main",
    mixins: [globalMethods],
    components: {
        siteTemplate,
        modal,
        installAppModalContent
    },
    data() {
        return {
            showInstallModal: false,
            isInstalling: false,
            isIOS: false,
            showIOSInstructions: false,
            installError: ""
        };
    },
    computed: {
        installButtonTitle() {
            if (this.showIOSInstructions) return "Entendi";
            return this.isIOS ? "Como instalar" : "Instalar app";
        }
    },
    methods: {
        openInstallModal() {
            if (!isPwaInstalled() && !sessionStorage.getItem("pwa-install-dismissed")) {
                this.showInstallModal = true;
            }
        },
        closeInstallModal() {
            sessionStorage.setItem("pwa-install-dismissed", "true");
            this.showInstallModal = false;
            this.showIOSInstructions = false;
            this.installError = "";
        },
        async installApp() {
            if (this.showIOSInstructions) {
                this.closeInstallModal();
                return;
            }

            if (this.isIOS) {
                this.showIOSInstructions = true;
                return;
            }

            this.isInstalling = true;
            this.installError = "";

            const outcome = await requestPwaInstall();

            this.isInstalling = false;

            if (outcome === "accepted") {
                this.closeInstallModal();
            } else if (outcome === "dismissed") {
                this.installError = "A instalação foi cancelada. Você pode continuar no navegador e tentar novamente quando quiser.";
            } else {
                this.installError = getPwaInstallUnavailableMessage();
            }
        }
    },
    mounted() {
        this.isIOS = isIOSDevice();
        window.setTimeout(() => this.openInstallModal(), 600);
    }
}
</script>
<style scoped>
h1 {
    color: white;
}
</style>
