<template>
    <section class="edit-profile-section">
        <div class="profile-header">
            <h3>Editar perfil</h3>
            <p class="subtitle">Personalize suas informações de perfil</p>
        </div>

        <skeletonLoader v-if="!user || !user.nome_usuario" type="profile" style="margin-bottom: 20px;" />
        <div class="edit-profile-card" v-else>
            <div class="user-avatar-container">
                <div class="avatar-wrapper">
                    <img :src="user.imagem_usuario || default_avatar_image" alt="Foto de perfil">
                    <div class="change-photo-overlay" v-on:click="submitImage()">
                        <span class="material-icons camera-icon">photo_camera</span>
                    </div>
                </div>
                <h4>{{ user.nome_usuario }}</h4>
                <p class="user-email" v-if="user.email_usuario">{{ user.email_usuario }}</p>
            </div>
            
            <div class="user-actions">
                <button type="button" class="btn primary" v-on:click="submitImage()">
                    <span class="material-icons">cloud_upload</span>
                    <span>Mudar foto</span>
                </button>
                <button type="button" class="btn secondary" v-on:click="removePhoto()" v-if="user.imagem_usuario">
                    <span class="material-icons">delete</span>
                    <span>Remover foto</span>
                </button>
            </div>
            
            <form action="sendImage" method="post" enctype="multipart/form-data" @submit.prevent="sendImage(formData)">
                <input type="file" name="imagem_usuario" id="image-input" style="display: none;" @change="submitFormImage($event)">
                <input type="submit" value="" id="submit-image-input" style="display: none;">
            </form>
        </div>

        <div class="user-bio-card">
            <div class="bio-header">
                <span class="material-icons bio-icon">description</span>
                <h4>Sua Biografia</h4>
            </div>
            <p class="bio-desc">Escreva um pouco sobre você e seus instrumentos para os outros membros da igreja verem.</p>
            <textarea name="descricao_usuario" id="descricao-usuario" v-model="user.descricao_usuario" placeholder="Ex: Sou guitarrista e toco na igreja há 3 anos..." v-on:focus="saveUserDescription()" v-on:blur="updateBio($event)"></textarea>
            <span class="response-message">{{ response }}</span>
        </div>

        <div class="biometric-settings-card" v-if="user && user.id_usuario">
            <div class="bio-header">
                <span class="material-icons bio-icon">fingerprint</span>
                <h4>Acesso por biometria</h4>
            </div>
            <p class="bio-desc" v-if="!biometricSupported">Este dispositivo não oferece suporte a biometria para acesso.</p>
            <template v-else>
                <p class="bio-desc">{{ biometricRegistered ? "A biometria já está ativada para sua conta neste dispositivo." : "Use a biometria deste dispositivo para entrar na sua conta mais rapidamente." }}</p>
                <button v-if="!biometricRegistered" type="button" class="btn primary biometric-settings-button" :disabled="isActivatingBiometrics" @click="activateBiometrics">
                    <span class="material-icons">fingerprint</span>
                    <span>{{ isActivatingBiometrics ? "Ativando..." : "Ativar acesso por biometria" }}</span>
                </button>
                <p v-if="biometricResponse" class="biometric-response" :class="{ error: biometricError }">{{ biometricResponse }}</p>
            </template>
        </div>
        
        <Teleport to="body">
            <Transition name="modal-fade">
                <imageCropModal v-if="cropModalOpen" :imageSrc="cropImageSrc" @close="cropModalOpen = false" @confirm="onCropConfirm" />
            </Transition>
        </Teleport>
    </section>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';
import imageCropModal from "./imageCropModal.vue";
import skeletonLoader from "./skeletonLoader.vue";

const biometricDeclinedKey = (email) => `wh_biometric_prompt_declined:${String(email || "").trim().toLowerCase()}`;

export default {
    name: "editProfile",
    mixins: [globalMethods],
    components: {
        imageCropModal,
        skeletonLoader
    },
    data() {
        return {
            response: "",
            descricao_usuario: "",
            formData: null,
            default_avatar_image: api.defaults.baseURL + "/public/user-default-image.png", // Fallback seguro
            cropModalOpen: false,
            cropImageSrc: "",
            biometricSupported: false,
            biometricRegistered: false,
            isActivatingBiometrics: false,
            biometricResponse: "",
            biometricError: false
        }
    },
    methods: {
        sendImage: function (formData) {
            let self = this;

            self.removePhoto();
            
            api.patch("/usuario/update_image", formData)
            .then(function () { 
                self.requireUser(true);
                self.response = "";
            })
            .catch(function (error) {
                self.response = error.response ?error.response.data : "Erro ao enviar imagem";
                let responseElement = $(".response-message");
                responseElement.show().addClass("error").css("opacity", 1);
            })
        },
        submitFormImage: function (event) {
            let file = event.target.files.item(0);
            if (!file) return;

            if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") { 
                this.cropImageSrc = URL.createObjectURL(file);
                this.cropModalOpen = true;
                event.target.value = "";
            } else {
                this.response = "Tipo de arquivo não suportado (apenas JPG ou PNG)";
                let responseElement = $(".response-message");
                responseElement.show().addClass("error").css("opacity", 1);
            }
        },
        onCropConfirm: function (blob) {
            this.cropModalOpen = false;
            let file = new File([blob], 'cropped-user.png', { type: 'image/png' });
            
            this.formData = new FormData();
            this.formData.set("imagem_usuario", file);
            
            this.sendImage(this.formData);
        },
        removePhoto: function () {
            let self = this;
            let data = "";
            
            api.patch("/usuario/remove_image", data)
            .then(function(){
                self.requireUser(true);
            })
        },
        submitImage: function () {
            let imageInput = $("#image-input");
            imageInput.click();
        },
        saveUserDescription: function () {
            this.descricao_usuario = this.user.descricao_usuario;
        },
        updateBio: function (event) {
            let self = this;
            let value = event.target.value.trim();

            if (value === this.descricao_usuario) {
                return;
            }

            let data = {
                new_bio: value
            }

            api.post("/usuario/update_bio", data)
            .then(function (response) {
                self.descricao_usuario = value;
                self.user.descricao_usuario = value;
                let responseElement = $(".response-message");
                self.response = response.data.message;
                responseElement.addClass("success").css("opacity", 1);
                setTimeout(() => {
                    responseElement.css("opacity", 0);
                }, 5000);
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        checkBiometricSupport: async function () {
            try {
                if (!window.PublicKeyCredential || typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
                    this.biometricSupported = false;
                    return;
                }
                this.biometricSupported = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            } catch (error) {
                this.biometricSupported = false;
            }
        },
        loadBiometricStatus: async function () {
            if (!this.biometricSupported) return;
            try {
                const response = await api.get("/usuario/biometria/status");
                this.biometricRegistered = Boolean(response.data?.returnObj?.hasCredential);
            } catch (error) {
                this.biometricResponse = "Não foi possível consultar o status da biometria.";
                this.biometricError = true;
            }
        },
        activateBiometrics: async function () {
            this.isActivatingBiometrics = true;
            this.biometricResponse = "";
            this.biometricError = false;
            try {
                const { startRegistration } = await import("@simplewebauthn/browser");
                const optionsResponse = await api.post("/usuario/biometria/registro/opcoes");
                const credential = await startRegistration({ optionsJSON: optionsResponse.data.returnObj });
                await api.post("/usuario/biometria/registro/verificar", { credential });
                localStorage.setItem("wh_remembered_email", this.user.email_usuario);
                localStorage.removeItem(biometricDeclinedKey(this.user.email_usuario));
                this.biometricRegistered = true;
                this.biometricResponse = "Biometria ativada neste dispositivo.";
            } catch (error) {
                const data = error.response?.data;
                this.biometricResponse = typeof data === "string" ? data : data?.error || "Não foi possível ativar a biometria.";
                this.biometricError = true;
            } finally {
                this.isActivatingBiometrics = false;
            }
        }
    },
    mounted: async function () {
        await this.requireUser();
        await this.checkBiometricSupport();
        await this.loadBiometricStatus();
    }
}
</script>
<style scoped>
.edit-profile-section {
    padding-bottom: 7rem;
    animation: fadeIn var(--transition-normal);
}

.profile-header {
    margin-bottom: 2rem;
}

h3 {
    font-size: var(--font-size-h3);
    font-weight: 700;
    margin-bottom: 4px;
    border-left: 4px solid var(--secondary-blue-soft);
    padding-left: 10px;
}

.subtitle {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
    margin-left: 14px;
}

/* Edit profile card styling */
.edit-profile-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-bottom: 2rem;
}

.user-avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.avatar-wrapper {
    position: relative;
    width: 140px;
    height: 140px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    border: 3px solid var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
    cursor: pointer;
    background-color: var(--primary-primary-blue-high);
}

.avatar-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-normal);
}

.change-photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-fast);
}

.avatar-wrapper:hover img {
    transform: scale(1.08);
}

.avatar-wrapper:hover .change-photo-overlay {
    opacity: 1;
}

.camera-icon {
    color: var(--neutral-white);
    font-size: 32px;
}

.user-avatar-container h4 {
    font-size: var(--font-size-h4);
    font-weight: 700;
    margin-top: 4px;
}

.user-email {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
}

.user-actions {
    display: flex;
    gap: 12px;
    width: 100%;
    max-width: 400px;
}

.user-actions button {
    flex: 1;
}

/* User bio card styling */
.user-bio-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.biometric-settings-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 2rem;
}

.biometric-settings-button { width: 100%; margin-top: 8px; }
.biometric-response { text-align: center; color: var(--others-green); margin-top: 8px; }

.bio-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.bio-icon {
    font-size: 22px;
    color: var(--secondary-blue-soft);
}

.bio-header h4 {
    font-size: var(--font-size-h4);
    font-weight: 700;
}

.bio-desc {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
    margin-bottom: 6px;
}

textarea {
    width: 100%;
    min-height: 120px;
    resize: none;
    line-height: 1.5;
}

.response-message {
    text-align: center;
    font-size: var(--font-size-4);
    font-weight: 600;
    transition: opacity var(--transition-normal);
    opacity: 0;
    margin-top: 8px;
}

@media (max-width: 480px) {
    .edit-profile-card, .user-bio-card {
        padding: 16px;
    }
    
    .avatar-wrapper {
        width: 110px;
        height: 110px;
    }
    
    .user-actions {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
