<template>
    <section class="edit-profile">
        <h3>Editar perfil</h3>
        <div class="edit-profile-container">
            <div class="user-informations">
                <div class="user-header">
                    <img :src="user.imagem_usuario" alt="">
                    <h4>{{ user.nome_usuario }}</h4>
                </div>
            </div>
            <div class="user-actions">
                <button type="button" class="btn primary" v-on:click="submitImage()">Mudar foto de perfil</button>
                <button type="button" class="btn secondary">Redefinir senha</button>
            </div>
            <form action="sendImage" method="post" enctype="multipart/form-data" @submit.prevent="sendImage(formData)">
                <input type="file" name="imagem_usuario" id="image-input" style="display: none;" @change="submitFormImage($event)">
                <input type="submit" value="" id="submit-image-input" style="display: none;">
            </form>
        </div>
        <div class="user-bio-container">
            <h4>Biografia</h4>
            <textarea name="descricao_usuario" id="descricao-usuario" v-model="user.descricao_usuario" placeholder="Insira a sua descrição" class="input" v-on:focus="saveUserDescription()" v-on:blur="updateBio($event)"></textarea>
            <span class="response">{{ response }}</span>
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
    mounted: function () {
        this.requireUser();
    },
    data() {
        return {
            response: "",
            descricao_usuario: "",
            formData: null
        }
    },
    methods: {
        sendImage: function (formData) {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();

            self.removePhoto();
            console.log(formData)
            api.patch("/usuario/update_image", formData, { 
                headers: {
                    Authorization: jwt
                }
            })
            .then(function () { 
                location.reload();
                self.response = "";
            })
            .catch(function (error) {
                self.response = error.response;
                $(".response").show();
            })
        },
        submitFormImage: function (event) {
            let self = this;
            let file = event.target.files.item(0);
            let submit = $("#submit-image-input");
            self.formData = new FormData;

            if (file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png") { // Se o arquivo tiver um desses formatos (PNG, JPG E JPEG), e permitida a requisição para o servidor, se não aparece a mensagem (arquivo não suportado).
                self.formData.set("imagem_usuario", file);
                submit.click();
            } else {
                self.previewPhoto = "";
                self.response = "Tipo de arquivo não suportado";
                $(".response").show();
            }
        },
        removePhoto: function () {
            let self = this, jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = "";
            
            api.patch("/usuario/remove_image", data, {
                headers: {
                        Authorization: jwt
                    }
            })
            .then(function(){
                location.reload();
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
            let jwt = "Bearer " + self.getJwtFromLocalStorage();

            if (value.length <= 0 || value == this.descricao_usuario) {
                return;
            }

            let data = {
                new_bio: value
            }

            api.post("/usuario/update_bio", data, {
                headers: {
                    Authorization: jwt
                }
            })
            .then(function (response) {
                self.fillUserDescription = value;
                let responseElement = $(".response");
                self.response = response.data.message;
                responseElement.css("opacity", 1);
                setTimeout(() => {
                    responseElement.css("opacity", 0);
                }, 5000);
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    }
}
</script>
<style scoped>
.edit-profile-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.edit-profile {
    padding: 0 1rem;
}

.user-actions {
    display: flex;
    flex-direction: column;
}

    .user-actions button {
        margin: 5px 0;
    }

.user-informations {
    margin-top: 2rem;
}

    .user-informations img {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        object-fit: cover;
    }

.user-header {
    display: flex;  
    width: fit-content;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.user-bio-container {
    margin-top: 2rem;
}

    .user-bio-container p {
        font-style: italic;
    }

    .user-bio-container textarea {
        width: 100%;
        min-height: 120px;
        resize: none;
    }

@media (max-width: 759px) {
    .edit-profile-container {
        flex-direction: column;
    }

    .user-informations {
        margin: 2rem 0;
    }
}
</style>