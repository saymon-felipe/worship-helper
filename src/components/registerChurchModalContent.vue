<template>
    <div class="register-church-content">
        <form action="register-church" id="form-informations" @submit.prevent="getFormInformations($event)">
            <div class="input-group">
                <label for="church-name">Nome</label>
                <input type="text" placeholder="Insira o nome da igreja" name="nome_igreja" id="church-name" class="input" required />
            </div>
            <div class="input-group">
                <label for="adm-id">Administrador</label>
                <input type="text" inputmode="numeric" placeholder="Insira o nome do administrador" name="usuario_administrador" id="adm-id" v-model="searchParam" class="input" />
                <selectedMember :selected_member="selected_member" @removeUser="restoreInputLabel('#adm-id', 'Insira o nome do administrador')" />
                <autoComplete :search="searchParam" v-if="searchParam != ''" @selectUser="select_user($event)"></autoComplete>
            </div>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
        <div class="input-group church-image">
            <img :src="previewPhoto == '' ? default_church_image : previewPhoto">
            <div class="image-informations">
                <form class="send-photo" method="post" enctype="multipart/form-data" @submit.prevent="uploadPhoto(formData)">
                    <div class="input-file-custom">
                        <label for="photo" id="upload-button" class="btn primary">
                            <span>Enviar foto</span>
                        </label>
                    </div>
                    <input type="file" name="photo" id="photo" @change.prevent="preSendPhoto($event)" title="Envie uma foto nos formatos PNG ou JPG">
                    <button type="submit" id="send-photo-button" class="btn primary" style="display: none;">Enviar foto</button>
                </form>
                <span v-if="previewPhoto != ''">{{ fileName }}</span>
            </div>
        </div>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import autoComplete from "./autoComplete.vue";
import { globalMethods } from '../js/globalMethods';
import $ from "jquery";
import api from '../config/api';
import selectedMember from "./selectedMember.vue";

export default {
    name: "registerChurchModalContent",
    mixins: [globalMethods],
    data() {
        return {
            searchParam: "",
            createdChurchId: null,
            formData: "",
            response: "",
            fileName: "",
            previewPhoto: "",
            selected_member: {
                id_usuario: null,
                imagem_usuario: "",
                nome_usuario: ""
            }
        }
    },
    methods: {
        getFormInformations: function (event) {
            let self = this;
            let responseElement = $(".response");

            if (self.selected_member.id_usuario == null) {
                self.response = "Usuário inválido";
                responseElement.css("opacity", 1).addClass("error");
                return;
            }

            let data = $("#" + event.target.id).serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["usuario_administrador"] = self.selected_member.id_usuario;

            let jwt = "Bearer " + self.getJwtFromLocalStorage();

            api.post("/igreja/cadastrar-igreja", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    responseElement.css("opacity", 1).addClass("success");
                    self.response = response.data.message;

                    if (self.formData == "") {
                        self.closeModal();
                    } else {
                        self.createdChurchId = response.data.igreja_cadastrada.id_igreja;
                        $("#send-photo-button").click();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        closeModal: function () {
            this.listAllChurches();
            this.$emit("success", true);
        },
        uploadPhoto: function (formData) {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();

            self.response = "";

            api.patch("/igreja/church-image/" + self.createdChurchId, formData, { 
                headers: {
                    Authorization: jwt
                }
            })
            .then(function () { 
                self.previewPhoto = "";
                self.closeModal();
            })
            .catch(function (error) {
                $(".response").addClass("error");
                self.response = error.response;
            })
            .then(function () {
                self.loading = false;
            })
        },
        preSendPhoto: function (event) {
            let filePath = $("#photo").val(); // Busca o nome o nome do arquivo e o exibe.
            let fileSplited = filePath.split('\\');
            let fileName = fileSplited[fileSplited.length - 1];
            let file = event.target.files.item(0);
            let self = this;

            self.formData = new FormData;
            self.previewPhoto = "";
            self.response = "";
            self.fileName = fileName;

            if (file.size > 2097152) {
                self.previewPhoto = "";
                $(".response").css("opacity", 1);
                self.response = "Arquivo muito grande. Max: 2 megabytes";
                return;
            }

            if (file.type !== "image/jpeg" && file.type !== "image/jpg" && file.type !== "image/png") { // Se o arquivo não tiver um desses formatos (PNG, JPG E JPEG), a imagem cancelada.
                self.previewPhoto = "";
                $(".response").css("opacity", 1);
                self.response = "Tipo de arquivo não suportado";
                return;
            }

            let adress = new FileReader();

            self.formData.set("church_image", file);
            adress.readAsDataURL(file);
            adress.onloadend = () => {
                self.previewPhoto = adress.result;
            };
        },
        validateSearchParam: function () {
            let self = this;

            if (self.searchParam.trim().length == 0 || self.searchParam.trim().length < 3) {
                return false;
            }

            return true;
        }
    },
    components: {
        autoComplete,
        selectedMember
    }
}
</script>
<style scoped>
.response {
    margin-top: 1rem;
}

.church-image {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin-top: 1.5rem;
}

 .church-image img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-right: 1rem;
    object-fit: cover;
 }

.input-file-custom {
    margin-bottom: 1rem;
}

.image-informations {
    display: flex;
    flex-direction: column;
    width: fit-content;
    align-items: center;
    text-align: center;
}

    .image-informations form {
        width: 100%;
    }

    .image-informations #upload-button {
        font-size: 20px;
        padding: 10px 2-5px;
        width: 100%;
    }

#photo {
    display: none;
}
</style>