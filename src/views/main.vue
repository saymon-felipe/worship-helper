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
        <Transition name="modal-fade">
            <modal
                v-if="showPushNotificationsModal"
                title="Ative as notificações"
                buttonTitle="Ativar notificações"
                button2Title="Agora não"
                :disabled="isActivatingNotifications"
                @closeModal="closePushNotificationsModal"
                @cancelEvent="closePushNotificationsModal"
                @submitEvent="activatePushNotifications"
            >
                <pushNotificationsModalContent :message="pushNotificationsError" />
            </modal>
        </Transition>
    </Teleport>
</template>
<script>
import siteTemplate from "../templates/siteTemplate.vue";
import modal from "../components/modal.vue";
import installAppModalContent from "../components/installAppModalContent.vue";
import pushNotificationsModalContent from "../components/pushNotificationsModalContent.vue";
import { globalMethods } from '../js/globalMethods';
import { getPwaInstallUnavailableMessage, isIOSDevice, isPwaInstalled, requestPwaInstall } from '../services/pwaInstall';
import { getPushPermission, requestPushPermission } from '../services/pushNotifications';

/* eslint-disable vue/multi-word-component-names, vue/no-reserved-component-names */
export default {
    name: "main",
    mixins: [globalMethods],
    components: {
        siteTemplate,
        modal,
        installAppModalContent,
        pushNotificationsModalContent
    },
    data() {
        return {
            showInstallModal: false,
            isInstalling: false,
            isIOS: false,
            showIOSInstructions: false,
            installError: "",
            showPushNotificationsModal: false,
            isActivatingNotifications: false,
            pushNotificationsError: ""
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
        openPushNotificationsModal() {
            const dismissed = sessionStorage.getItem("push-notifications-dismissed");

            if (!this.showInstallModal && !dismissed && getPushPermission() === "default") {
                this.showPushNotificationsModal = true;
            }
        },
        closePushNotificationsModal() {
            sessionStorage.setItem("push-notifications-dismissed", "true");
            this.showPushNotificationsModal = false;
            this.pushNotificationsError = "";
        },
        async activatePushNotifications() {
            this.isActivatingNotifications = true;
            this.pushNotificationsError = "";

            try {
                const permission = await requestPushPermission();

                if (permission === "granted") {
                    this.closePushNotificationsModal();
                    return;
                }

                this.pushNotificationsError = permission === "unsupported"
                    ? "Este navegador nao oferece suporte a notificacoes."
                    : "As notificacoes foram bloqueadas. Voce pode libera-las nas configuracoes do navegador.";
            } catch (error) {
                this.pushNotificationsError = error.response && error.response.data && error.response.data.error
                    ? error.response.data.error
                    : "Nao foi possivel ativar as notificacoes agora. Tente novamente mais tarde.";
            } finally {
                this.isActivatingNotifications = false;
            }
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
        window.setTimeout(() => this.openPushNotificationsModal(), 1400);
    }
}
</script>
<style scoped>
h1 {
    color: white;
}
</style>
