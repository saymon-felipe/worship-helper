<template>
    <div class="warnings-wrapper">
        <div class="warnings-list">
            <div class="warning-container" v-for="(warning, index) in groupedWarnings" v-bind:key="index">
                <!-- Comentário/Aviso Pai -->
                <div class="warning">
                    <div class="user-photo">
                        <img :src="warning.criador.imagem_usuario || default_avatar" class="avatar-pp">
                    </div>
                    <div class="warning-informations">
                        <div class="user-informations">
                            <h6 class="font-size-3">{{ warning.criador.nome_usuario }}</h6>
                            <p class="warning-date">{{ returnRelativeData(warning.data_criacao) }}</p>
                        </div>
                        <p class="warning-message">{{ warning.mensagem }}</p>
                        <div class="warning-actions">
                            <button type="button" v-on:click="likeWarning(warning.id_aviso, warning.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="warning.usuario_atual_curtiu ? 'primary' : ''">
                                <span class="material-icons">thumb_up_off_alt</span>
                                <span>{{ warning.quantidade_curtidas }}</span>
                            </button>
                            <button type="button" class="btn btn-small btn-reply" v-on:click="toggleReply(warning.id_aviso)">
                                <span class="material-icons">reply</span>
                                <span>Responder</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Input de Resposta Inline -->
                <div class="reply-input-box" v-if="activeReplyId === warning.id_aviso">
                    <form @submit.prevent="createNewWarning(warning.id_aviso)">
                        <div class="reply-input-container">
                            <input type="text" v-model="replyText" placeholder="Escreva uma resposta..." maxlength="100" class="reply-input" ref="replyInput" required>
                            <div class="reply-actions-row">
                                <button type="button" class="btn btn-small btn-text" @click="activeReplyId = null">Cancelar</button>
                                <button type="submit" class="btn btn-small primary">Enviar</button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Sub-lista de Respostas (Endentada) -->
                <div class="replies-container" v-if="warning.replies && warning.replies.length > 0">
                    <div class="warning reply-item" v-for="(reply, rIndex) in warning.replies" :key="rIndex">
                        <div class="user-photo">
                            <img :src="reply.criador.imagem_usuario || default_avatar" class="avatar-pp">
                        </div>
                        <div class="warning-informations">
                            <div class="user-informations">
                                <h6 class="font-size-3">{{ reply.criador.nome_usuario }}</h6>
                                <p class="warning-date">{{ returnRelativeData(reply.data_criacao) }}</p>
                            </div>
                            <p class="warning-message">{{ reply.mensagem }}</p>
                            <div class="warning-actions">
                                <button type="button" v-on:click="likeWarning(reply.id_aviso, reply.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="reply.usuario_atual_curtiu ? 'primary' : ''">
                                    <span class="material-icons">thumb_up_off_alt</span>
                                    <span>{{ reply.quantidade_curtidas }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Criar Aviso/Comentário Principal -->
        <div class="create-warning" v-if="type === 'musica' || haveAdminPermission">
            <div class="personalized-input">
                <form action="sendWarning" @submit.prevent="createNewWarning(null)">
                    <input type="text" name="warning" :placeholder="type == 'aviso' ? 'Publique um aviso...' : type == 'musica' ? 'Publique um comentário...' : ''" id="send-warning" maxlength="100" required autocomplete="off">
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
            warnings: [],
            activeReplyId: null,
            replyText: "",
            default_avatar: api.defaults.baseURL + "/public/default-avatar.png",
            createPath: "",
            returnPath: "",
            likePath: ""
        }
    },
    computed: {
        groupedWarnings: function () {
            if (!this.warnings || !Array.isArray(this.warnings)) {
                return [];
            }
            // Separa os avisos principais (parent_id é null ou undefined)
            const parents = this.warnings.filter(w => w.parent_id === null || w.parent_id === undefined);
            
            parents.forEach(parent => {
                // Filtra as respostas vinculadas a este pai
                const replies = this.warnings.filter(w => w.parent_id === parent.id_aviso);
                // Ordena as respostas cronologicamente (da mais antiga para a mais recente)
                replies.sort((a, b) => new Date(a.data_criacao) - new Date(b.data_criacao));
                parent.replies = replies;
            });

            // Ordena os pais do mais recente para o mais antigo
            parents.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
            return parents;
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
            return this.relativeTime(data);
        },
        createNewWarning: function (parentId = null) {
            let self = this;
            let value = "";
            
            if (parentId) {
                value = self.replyText;
            } else {
                let element = $("#send-warning");
                value = element.val();
            }

            let churchId = this.getCurrentChurchId();

            if (!value || value.trim().length == 0) {
                return;
            }

            if (this.type == "aviso" && churchId == null) {
                return;
            }

            let data = {
                id_igreja: churchId,
                mensagem: value,
                id_musica: this.id_musica,
                parent_id: parentId
            }

            api.post(self.createPath, data)
                .then(function () {
                    if (parentId) {
                        self.replyText = "";
                        self.activeReplyId = null;
                    } else {
                        $("#send-warning").val("");
                    }
                    self.returnWarnings();
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        returnWarnings: function () {
            let self = this;
            let churchId = this.getCurrentChurchId();

            if (this.type == "aviso" && churchId == null) {
                return;
            }

            let data = {
                id_igreja: churchId,
                id_musica: this.id_musica
            }

            api.post(self.returnPath, data)
                .then(function (response) {
                    self.warnings = response.data.returnObj || [];
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        likeWarning: function (warning_id, usuario_atual_curtiu = false) {
            let self = this;
            let churchId = this.getCurrentChurchId();

            if (usuario_atual_curtiu) {
                return;
            }

            if (this.type == "aviso" && churchId == null) {
                return;
            }

            let data = {
                id_igreja: churchId,
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
        },
        toggleReply: function (warning_id) {
            this.activeReplyId = this.activeReplyId === warning_id ? null : warning_id;
            this.replyText = "";
            if (this.activeReplyId) {
                this.$nextTick(() => {
                    if (this.$refs.replyInput && this.$refs.replyInput[0]) {
                        this.$refs.replyInput[0].focus();
                    }
                });
            }
        }
    },
    mounted: function () {
        this.fillVariables();
        this.returnWarnings();
    }
}
</script>
<style scoped>
.warnings-wrapper {
  margin-top: 1rem;
  color: var(--neutral-white);
  padding-bottom: 7rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  padding: 1rem;
  transition: all var(--transition-normal);
}

.warning-container:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.warning {
  display: flex;
  gap: 1rem;
}

.warning-informations {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-informations {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.user-informations h6 {
  font-weight: 700;
  color: var(--secondary-blue-soft);
  margin: 0;
}

.warning-date {
  font-size: 11px;
  color: var(--neutral-gray-medium);
  margin: 0;
}

.warning-message {
  color: var(--neutral-white);
  word-break: break-word;
  font-size: var(--font-size-4);
  margin: 4px 0 8px 0;
  line-height: 1.4;
}

.warning-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.like-warning-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.like-warning-button.primary {
  background: var(--secondary-blue-soft);
  color: var(--primary-bg);
}

.btn-reply {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--neutral-gray-medium);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-reply:hover {
  background: rgba(56, 182, 255, 0.1);
  color: var(--secondary-blue-soft);
  border-color: rgba(56, 182, 255, 0.2);
}

/* --- REPLY INPUT --- */
.reply-input-box {
  margin-left: 3rem;
  background: rgba(24, 21, 56, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-sm);
  padding: 10px;
}

.reply-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input {
  width: 100%;
  height: 36px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  color: var(--neutral-white);
  padding: 0 12px;
  font-size: var(--font-size-5);
  outline: none;
  transition: border-color var(--transition-fast);
}

.reply-input:focus {
  border-color: var(--secondary-blue-soft);
}

.reply-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-text {
  background: transparent;
  color: var(--neutral-gray-medium);
  border: none;
}

.btn-text:hover {
  color: var(--neutral-white);
}

/* --- REPLIES CONTAINER (INDENTADA) --- */
.replies-container {
  margin-left: 3rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(56, 182, 255, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.reply-item {
  background: transparent;
  border: none;
  padding: 0;
}

.reply-item:hover {
  background: transparent;
}

/* --- CRIAR AVISO PRINCIPAL --- */
.create-warning {
  width: 100%;
  margin-top: 1rem;
}

.personalized-input {
  position: relative;
  width: 100%;
}

#send-warning {
  width: 100%;
  height: 48px;
  padding-right: 3.5rem;
  padding-left: 1.2rem;
  background: rgba(24, 21, 56, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  color: var(--neutral-white);
  font-size: var(--font-size-4);
  outline: none;
  transition: all var(--transition-fast);
}

#send-warning:focus {
  border-color: var(--secondary-blue-soft);
  box-shadow: var(--glow-shadow);
}

#send-warning-button {
  position: absolute;
  right: 12px;
  top: 0;
  bottom: 0;
  margin: auto;
  font-size: 20px;
  color: var(--secondary-blue-soft);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

#send-warning-button:hover {
  transform: scale(1.1);
}

@media (max-width: 480px) {
  .replies-container {
    margin-left: 1.5rem;
    padding-left: 0.75rem;
  }
  .reply-input-box {
    margin-left: 1.5rem;
  }
}
</style>
