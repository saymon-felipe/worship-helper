<template>
    <section class="edit-profile-section">
        <div class="profile-header">
            <h3>Editar perfil</h3>
            <p class="subtitle">Personalize suas informações de perfil</p>
        </div>

        <div class="edit-profile-card">
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
    </section>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';

export default {
    name: "editProfile",
    mixins: [globalMethods],
    data() {
        return {
            response: "",
            descricao_usuario: "",
            formData: null,
            default_avatar_image: api.defaults.baseURL + "/public/user-default-image.png" // Fallback seguro
        }
    },
    methods: {
        sendImage: function (formData) {
            let self = this;

            self.removePhoto();
            
            api.patch("/usuario/update_image", formData)
            .then(function () { 
                self.requireUser();
                self.response = "";
            })
            .catch(function (error) {
                self.response = error.response ?error.response.data : "Erro ao enviar imagem";
                let responseElement = $(".response-message");
                responseElement.show().addClass("error").css("opacity", 1);
            })
        },
        submitFormImage: function (event) {
            let self = this;
            let file = event.target.files.item(0);
            let submit = $("#submit-image-input");
            self.formData = new FormData;

            if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") { 
                self.formData.set("imagem_usuario", file);
                submit.click();
            } else {
                self.response = "Tipo de arquivo não suportado (apenas JPG ou PNG)";
                let responseElement = $(".response-message");
                responseElement.show().addClass("error").css("opacity", 1);
            }
        },
        removePhoto: function () {
            let self = this;
            let data = "";
            
            api.patch("/usuario/remove_image", data)
            .then(function(){
                self.requireUser();
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
        }
    },
    mounted: function () {
        this.requireUser();
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
