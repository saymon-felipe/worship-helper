<template>
    <div class="warnings">
        <div class="warning" v-for="(warning, index) in warnings" v-bind:key="index">
            <div class="user-photo">
                <img :src="warning.criador.imagem_usuario" class="avatar-pp">
            </div>
            <div class="warning-informations">
                <div class="user-informations">
                    <h6 class="font-size-3">{{ warning.criador.nome_usuario }}</h6>
                    <p>{{ returnRelativeData(warning.data_criacao) }}</p>
                </div>
                <p class="warning-message">{{ warning.mensagem }}</p>
                <button type="button" v-on:click="likeWarning(warning.id_aviso, warning.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="warning.usuario_atual_curtiu ? 'primary' : ''">
                    <span class="material-icons">thumb_up_off_alt</span>
                    <span>{{ warning.quantidade_curtidas }}</span>
                </button>
            </div>
        </div>
        <div class="create-warning" v-if="haveAdminPermission">
            <div class="personalized-input">
                <form action="sendWarning" @submit.prevent="createNewWarning()">
                    <input type="text" name="warning" class="input" :placeholder="type == 'aviso' ? 'Publique um aviso' : type == 'musica' ? 'Publique um comentário' : ''" id="send-warning" maxlength="100">
                    <button type="submit" class="material-icons btn-empty" id="send-warning-button">send</button>
                </form>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';
import api from '../config/api';

export default {
    name: "commentsComponent",
    mixins: [globalMethods],
    props: ["type", "id_musica"],
    data() {
        return {
            warnings: [
                {
                    criador: {
                        imagem_usuario: ""
                    }
                }
            ],
            createPath: "",
            returnPath: "",
            likePath: ""
        }
    },
    methods: {
        fillVariables: function () {
            if (this.type == "aviso") {
                this.createPath = "/igreja/publicar-aviso";
                this.returnPath = "/igreja/retorna-avisos";
                this.likePath = "/igreja/curtir-aviso";
            } else if (this.type == "musica") {
                this.createPath = "/musicas/comentarios/criar";
                this.returnPath = "/musicas/comentarios/retorna";
                this.likePath = "/musicas/comentarios/like";
            }
        },
        returnRelativeData: function (data) {
            const relativeTime = this.moment(data).fromNow();
            return relativeTime;
        },
        createNewWarning: function () {
            let self = this;
            let element = $("#send-warning");
            let value = element.val();

            if (value.trim().length == 0) {
                return;
            }

            let data = {
                id_igreja: this.igreja.id_igreja,
                mensagem: value,
                id_musica: this.id_musica
            }

            api.post(self.createPath, data)
                .then(function () {
                    element.val("");
                    self.returnWarnings();
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        returnWarnings: function () {
            let self = this;

            let data = {
                id_igreja: this.igreja.id_igreja,
                id_musica: this.id_musica
            }

            api.post(self.returnPath, data)
                .then(function (response) {
                    self.warnings = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        likeWarning: function (warning_id, usuario_atual_curtiu = false) {
            let self = this;

            if (usuario_atual_curtiu) {
                return;
            }

            let data = {
                id_igreja: self.igreja.id_igreja,
                id_aviso: warning_id,
                confirmacao: true
            }

            api.post(self.likePath, data)
                .then(function () {
                    self.returnWarnings();
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    },
    mounted: function () {
        this.fillVariables();
        this.returnWarnings();
    }
}
</script>
<style scoped>
.warnings {
  margin-top: 1rem;
  color: var(--neutral-white);
  padding-bottom: 6rem;
  position: relative;
}

  .warnings h6, .warnings p {
      color: var(--neutral-white);
      word-break: break-word;
  } 

  .warnings h6 {
      font-weight: 600;
  }

  .warnings h5:first-child {
      margin-bottom: 1rem;
  }

.create-warning {
  position: absolute;
  bottom: 2rem;
  width: 100%;
}

#send-warning {
  width: 100%;
  padding-right: 4rem;
}

#send-warning-button {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}

.warning {
  display: flex;
}

.warning-informations {
  margin: 0 1rem;
}

.user-informations p {
  margin-top: -7px;
}

.like-warning-button span:first-child {
  margin-right: 5px;
}
</style>