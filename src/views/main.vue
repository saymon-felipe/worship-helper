<template>
    <siteTemplate>
        <router-view />
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
                :buttonTitle="pushButtonTitle"
                :button2Title="pushButton2Title"
                :disabled="isActivatingNotifications"
                :fitContent="true"
                @closeModal="closePushNotificationsModal"
                @cancelEvent="closePushNotificationsModal"
                @submitEvent="submitPushNotificationsModal"
            >
                <pushNotificationsModalContent :reason="pushPromptReason" :platform="pushPlatform" :message="pushNotificationsError" />
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
import {
    confirmGrantedPushPermission,
    dismissPushPrompt,
    getPushPermission,
    getPushPromptReason,
    isPushPromptDismissed,
    preparePushSubscription,
    requestPushPermission
} from '../services/pushNotifications';

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
            pushNotificationsError: "",
            pushPromptReason: "default"
        };
    },
    computed: {
        installButtonTitle() {
            if (this.showIOSInstructions) return "Entendi";
            return this.isIOS ? "Como instalar" : "Instalar app";
        },
        pushPlatform() {
            if (this.isIOS) return "ios";
            return /Android/i.test(window.navigator.userAgent) ? "android" : "other";
        },
        pushButtonTitle() {
            if (this.pushPromptReason === "denied") return "Já liberei";
            if (this.pushPromptReason === "unsupported") return "Entendi";
            return "Ativar notificações";
        },
        pushButton2Title() {
            return this.pushPromptReason === "unsupported" ? "" : "Agora não";
        }
    },
    methods: {
        isMobileBrowser() {
            const hasMobileViewport = window.matchMedia("(max-width: 768px)").matches;
            const hasTouchInput = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
            return hasMobileViewport && hasTouchInput;
        },
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
            const reason = getPushPromptReason();

            if (!reason || this.showInstallModal || isPushPromptDismissed()) {
                return;
            }

            this.pushPromptReason = reason;
            this.pushNotificationsError = "";
            if (reason === "default") {
                preparePushSubscription();
            }
            this.showPushNotificationsModal = true;
            document.addEventListener("visibilitychange", this.handlePushVisibilityChange);
        },
        hidePushNotificationsModal() {
            this.showPushNotificationsModal = false;
            this.pushNotificationsError = "";
            document.removeEventListener("visibilitychange", this.handlePushVisibilityChange);
        },
        closePushNotificationsModal() {
            // "Agora nao" vale so para esta abertura do app: na proxima (ou no proximo login) o aviso volta.
            dismissPushPrompt();
            this.hidePushNotificationsModal();
        },
        submitPushNotificationsModal() {
            if (this.pushPromptReason === "denied") {
                this.recheckPushPermission();
                return;
            }

            if (this.pushPromptReason === "unsupported") {
                this.closePushNotificationsModal();
                return;
            }

            // Precisa ser chamado direto daqui (sem await antes): o iOS so pede permissao dentro do toque.
            this.activatePushNotifications();
        },
        getPushErrorMessage(error) {
            if (error && error.response && error.response.data && error.response.data.error) {
                return error.response.data.error;
            }
            // So as mensagens do proprio app (Error comum); as do navegador (DOMException) vem em ingles.
            if (error && error.name === "Error" && error.message && !error.response) {
                return error.message;
            }
            console.error("[Push] Nao foi possivel ativar as notificacoes:", error);
            return "Nao foi possivel ativar as notificacoes agora. Tente novamente mais tarde.";
        },
        async activatePushNotifications() {
            this.isActivatingNotifications = true;
            this.pushNotificationsError = "";

            try {
                const permission = await requestPushPermission();

                if (permission === "granted") {
                    this.hidePushNotificationsModal();
                } else if (permission === "denied") {
                    this.pushPromptReason = "denied";
                } else if (permission === "unsupported") {
                    this.pushNotificationsError = "Este navegador nao oferece suporte a notificacoes.";
                } else {
                    this.pushNotificationsError = "O pedido foi fechado sem resposta. Toque em Ativar notificações para tentar de novo.";
                }
            } catch (error) {
                this.pushNotificationsError = this.getPushErrorMessage(error);
            } finally {
                this.isActivatingNotifications = false;
            }
        },
        async recheckPushPermission() {
            const permission = getPushPermission();

            if (permission === "default") {
                this.pushPromptReason = "default";
                this.pushNotificationsError = "";
                preparePushSubscription();
                return;
            }

            if (permission !== "granted") {
                this.pushNotificationsError = "As notificações continuam bloqueadas. Siga os passos acima e toque em Já liberei.";
                return;
            }

            this.isActivatingNotifications = true;
            this.pushNotificationsError = "";
            try {
                await confirmGrantedPushPermission();
                this.hidePushNotificationsModal();
            } catch (error) {
                this.pushNotificationsError = this.getPushErrorMessage(error);
            } finally {
                this.isActivatingNotifications = false;
            }
        },
        handlePushVisibilityChange() {
            // Quem foi aos Ajustes liberar volta para o app: confere sozinho, sem precisar tocar em "Ja liberei".
            if (document.visibilityState !== "visible" || !this.showPushNotificationsModal || this.isActivatingNotifications) {
                return;
            }

            if (this.pushPromptReason === "denied" && getPushPermission() !== "denied") {
                this.recheckPushPermission();
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

        if (isPwaInstalled()) {
            // App instalado: o aviso de notificacoes aparece a cada abertura (e logo apos o login) ate ser ativado.
            this.requireUser()
                .then(() => window.setTimeout(() => this.openPushNotificationsModal(), 800))
                .catch(() => {});
            return;
        }

        window.setTimeout(() => {
            if (this.isMobileBrowser()) {
                this.openInstallModal();
            }
        }, 800);
    },
    beforeUnmount() {
        document.removeEventListener("visibilitychange", this.handlePushVisibilityChange);
    }
}
</script>
<style scoped>
h1 {
    color: white;
}
</style>
