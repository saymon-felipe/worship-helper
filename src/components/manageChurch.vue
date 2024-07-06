<template>
    <div class="manage-church">
        <div class="manage-container">
            <div class="church-profile">
                <img :src="igreja.imagem_igreja" class="avatar-p">
                <div class="church-informations">
                    <h5>{{ igreja.nome_igreja }}</h5>
                    <p class="font-size-3">{{ returnMembersText(igreja.quantidade_membros) }}</p>
                </div>
            </div>
            <div class="church-actions-container">
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/musics'">
                        <span class="material-icons">playlist_play</span>
                        <span>Acervo de músicas</span>
                    </router-link>
                </div>
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/members'">
                        <span class="material-icons">group</span>
                        <span>{{ haveAdminPermission ? "Gerenciar" : "Ver" }} membros</span>
                    </router-link>
                </div>
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/events'">
                        <span class="material-icons">event</span>
                        <span>Calendário de cultos</span>
                    </router-link>
                </div>
                <div class="church-action" v-if="haveAdminPermission">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/config'">
                        <span class="material-icons">settings</span>
                        <span>Configurações da igreja</span>
                    </router-link>
                </div>
            </div>
            <div class="warnings">
                <h5>Avisos</h5>
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
                        <button type="button" v-on:click="likeWarning(warning.id_aviso, warning.usuario_atual_curtiu)" id="like-warning-button" class="btn primary-alt btn-small" :class="warning.usuario_atual_curtiu ? 'primary' : ''">
                            <span class="material-icons">thumb_up_off_alt</span>
                            <span>{{ warning.quantidade_curtidas }}</span>
                        </button>
                    </div>
                </div>
                <div class="create-warning" v-if="haveAdminPermission">
                    <div class="personalized-input">
                        <form action="sendWarning" @submit.prevent="createNewWarning()">
                            <input type="text" name="warning" class="input" placeholder="Publique um aviso" id="send-warning" maxlength="100">
                            <button type="submit" class="material-icons btn-empty" id="send-warning-button">send</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import moment from 'moment';
import $ from 'jquery';
import api from '../config/api';

export default {
    name: "manageChurch",
    mixins: [globalMethods],
    data() {
        return {
            warnings: [
                {
                    criador: {
                        imagem_usuario: ""
                    }
                }
            ]
        }
    },
    methods: {
        createNewWarning: function () {
            let self = this;
            let element = $("#send-warning");
            let value = element.val();

            if (value.trim().length == 0) {
                return;
            }

            let data = {
                id_igreja: this.igreja.id_igreja,
                mensagem: value
            }

            api.post("/igreja/publicar-aviso", data)
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
                id_igreja: this.igreja.id_igreja
            }

            api.post("/igreja/retorna-avisos", data)
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

            api.post("/igreja/curtir-aviso", data)
                .then(function () {
                    self.returnWarnings();
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        returnRelativeData: function (data) {
            let correctDate = moment(data).subtract(3, 'h');
            let relativeTime = correctDate.fromNow();
            return relativeTime;
        }
    },
    mounted: function () {
        this.returnWarnings();
    }
}
</script>
<style scoped>
.church-action {
    background: var(--primary-primary-blue-medium);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    border-radius: 10px;
    cursor: pointer;
    text-align: center;
    margin: 1rem;
    padding: 1rem;
}

    .church-action span:first-child {
        font-size: var(--font-size-h2);
    }

    .church-action a {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

.church-actions-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

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

#like-warning-button span:first-child {
    margin-right: 5px;
}

@media (max-width: 372px) {
    .church-action {
        width: 105px;
        height: 105px;
        margin: .5rem;
    }

        .church-action span:first-child {
            font-size: var(--font-size-h4);
        }
}
</style>