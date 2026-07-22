<template>
    <div class="warnings-wrapper">
        <!-- Criar Aviso/Comentário Principal (Moved to top) -->
        <div class="create-warning" v-if="canCreate">
            <div class="personalized-input">
                <form action="sendWarning" @submit.prevent="createNewWarning(null)">
                    <input type="text" name="warning" :placeholder="inputPlaceholder" id="send-warning" maxlength="100" required autocomplete="off">
                    <button type="submit" class="material-icons btn-empty" id="send-warning-button">send</button>
                </form>
            </div>
        </div>

        <div class="warnings-list">
            <skeletonLoader v-if="isLoading" type="comments" :count="3" />
            <template v-else>
                <div class="warning-container" v-for="(warning, index) in groupedWarnings" v-bind:key="index">
                    <!-- Comentário/Aviso Pai -->
                    <div class="warning">
                        <div class="user-photo">
                            <img :src="warning.criador.imagem_usuario || default_avatar" class="avatar-pp">
                        </div>
                        <div class="warning-informations">
                            <div class="warning-header-wrapper">
                                <div class="user-informations">
                                    <h6 class="font-size-3">{{ warning.criador.nome_usuario }}</h6>
                                    <p class="warning-date">{{ returnRelativeData(warning.data_criacao) }}</p>
                                </div>
                                <div class="comment-menu-container" v-if="canEdit(warning) || canDelete(warning)">
                                    <button type="button" class="btn-icon-only menu-trigger" @click="toggleDropdown(warning.id_aviso)" title="Mais ações">
                                        <span class="material-icons">more_vert</span>
                                    </button>
                                    <div class="dropdown-overlay" v-if="activeDropdownId === warning.id_aviso" @click="activeDropdownId = null"></div>
                                    <Transition name="fade-in">
                                        <div class="comment-dropdown-menu" v-if="activeDropdownId === warning.id_aviso">
                                            <button type="button" class="dropdown-item" v-if="canEdit(warning)" @click="startEditWarning(warning); activeDropdownId = null;">
                                                <span class="material-icons">edit</span>
                                                <span>Editar</span>
                                            </button>
                                            <button type="button" class="dropdown-item danger" v-if="canDelete(warning)" @click="askDeleteWarning(warning); activeDropdownId = null;">
                                                <span class="material-icons">delete</span>
                                                <span>Excluir</span>
                                            </button>
                                        </div>
                                    </Transition>
                                </div>
                            </div>
                            
                            <!-- Edição Inline do Comentário Pai -->
                            <div class="edit-comment-inline-form" v-if="editingWarningId === warning.id_aviso">
                                <form @submit.prevent="updateWarning()">
                                    <div class="reply-input-container">
                                        <input type="text" v-model="editingWarningText" placeholder="Edite seu comentário..." maxlength="100" class="reply-input" ref="editInput" required>
                                        <div class="reply-actions-row">
                                            <button type="button" class="btn btn-small btn-text" @click="cancelEditWarning()">Cancelar</button>
                                            <button type="submit" class="btn btn-small primary">Salvar</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <template v-else>
                                <p class="warning-message">{{ warning.mensagem }}</p>
                                <div class="warning-actions">
                                    <button type="button" v-on:click="likeWarning(warning.id_aviso, warning.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="warning.usuario_atual_curtiu ? 'primary' : ''">
                                        <span class="material-icons">thumb_up_off_alt</span>
                                        <span>{{ warning.quantidade_curtidas }}</span>
                                    </button>
                                    <button type="button" class="btn btn-small btn-reply" v-if="canCreate" v-on:click="toggleReply(warning.id_aviso)">
                                        <span class="material-icons">reply</span>
                                        <span>Responder</span>
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Input de Resposta Inline -->
                    <div class="reply-input-box" v-if="canCreate && activeReplyId === warning.id_aviso">
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
                                <div class="warning-header-wrapper">
                                    <div class="user-informations">
                                        <h6 class="font-size-3">{{ reply.criador.nome_usuario }}</h6>
                                        <p class="warning-date">{{ returnRelativeData(reply.data_criacao) }}</p>
                                    </div>
                                    <div class="comment-menu-container" v-if="canEdit(reply) || canDelete(reply)">
                                        <button type="button" class="btn-icon-only menu-trigger" @click="toggleDropdown(reply.id_aviso)" title="Mais ações">
                                            <span class="material-icons">more_vert</span>
                                        </button>
                                        <div class="dropdown-overlay" v-if="activeDropdownId === reply.id_aviso" @click="activeDropdownId = null"></div>
                                        <Transition name="fade-in">
                                            <div class="comment-dropdown-menu" v-if="activeDropdownId === reply.id_aviso">
                                                <button type="button" class="dropdown-item" v-if="canEdit(reply)" @click="startEditWarning(reply); activeDropdownId = null;">
                                                    <span class="material-icons">edit</span>
                                                    <span>Editar</span>
                                                </button>
                                                <button type="button" class="dropdown-item danger" v-if="canDelete(reply)" @click="askDeleteWarning(reply); activeDropdownId = null;">
                                                    <span class="material-icons">delete</span>
                                                    <span>Excluir</span>
                                                </button>
                                            </div>
                                        </Transition>
                                    </div>
                                </div>
                                
                                <!-- Edição Inline da Resposta -->
                                <div class="edit-comment-inline-form" v-if="editingWarningId === reply.id_aviso">
                                    <form @submit.prevent="updateWarning()">
                                        <div class="reply-input-container">
                                            <input type="text" v-model="editingWarningText" placeholder="Edite sua resposta..." maxlength="100" class="reply-input" ref="editInput" required>
                                            <div class="reply-actions-row">
                                                <button type="button" class="btn btn-small btn-text" @click="cancelEditWarning()">Cancelar</button>
                                                <button type="submit" class="btn btn-small primary">Salvar</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <template v-else>
                                    <p class="warning-message">{{ reply.mensagem }}</p>
                                    <div class="warning-actions">
                                        <button type="button" v-on:click="likeWarning(reply.id_aviso, reply.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="reply.usuario_atual_curtiu ? 'primary' : ''">
                                            <span class="material-icons">thumb_up_off_alt</span>
                                            <span>{{ reply.quantidade_curtidas }}</span>
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <Teleport to="body">
            <confirmDeleteModal
                :show="showDeleteWarningModal"
                :title="type === 'aviso' ? 'Excluir aviso' : 'Excluir comentário'"
                :message="`Tem certeza que deseja excluir este ${type === 'aviso' ? 'aviso' : 'comentário'}?`"
                subMessage="Se ele tiver respostas, elas também serão removidas."
                @confirm="deleteWarning"
                @cancel="showDeleteWarningModal = false"
            />
        </Teleport>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';
import api from '../config/api';
import confirmDeleteModal from "./confirmDeleteModal.vue";
import skeletonLoader from "./skeletonLoader.vue";

export default {
    name: "commentsComponent",
    mixins: [globalMethods],
    components: {
        confirmDeleteModal,
        skeletonLoader
    },
    props: ["type", "id_musica", "id_evento", "canCreateThread", "canManageThread"],
    data() {
        return {
            isLoading: true,
            warnings: [],
            activeReplyId: null,
            replyText: "",
            editingWarningId: null,
            editingWarningText: "",
            showDeleteWarningModal: false,
            warningToDelete: null,
            default_avatar: api.defaults.baseURL + "/public/default-avatar.png",
            createPath: "",
            returnPath: "",
            likePath: "",
            updatePath: "",
            deletePath: "",
            activeDropdownId: null
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
        },
        canCreate: function () {
            if (this.type === "musica") {
                return true;
            }
            if (this.type === "musica_evento") {
                return Boolean(this.canCreateThread);
            }
            if (this.type === "evento") {
                return Boolean(this.canCreateThread);
            }
            return this.haveAdminPermission || Boolean(this.canCreateThread);
        },
        canEditWarning: function () {
            return this.type === "aviso" && this.hasChurchPermission("warnings.edit");
        },
        canDeleteWarning: function () {
            return this.type === "aviso" && this.hasChurchPermission("warnings.delete");
        },
        inputPlaceholder: function () {
            if (this.type === "aviso") return "Publique um aviso...";
            if (this.type === "musica_evento") return "Comente sobre esta música neste evento...";
            if (this.type === "evento") return "Publique um comentário no evento...";
            return "Publique um comentário...";
        },
        emptyStateIcon: function () {
            if (this.type === "aviso") {
                return "campaign";
            }
            return "chat_bubble_outline";
        },
        emptyStateTitle: function () {
            if (this.type === "aviso") {
                return "Nenhum aviso publicado";
            }
            return "Nenhum comentário ainda";
        },
        emptyStateDescription: function () {
            if (this.type === "aviso") {
                return "Acompanhe os comunicados importantes por aqui.";
            }
            if (this.type === "musica" || this.type === "musica_evento") {
                return "Seja o primeiro a compartilhar dicas ou comentários sobre esta música.";
            }
            if (this.type === "evento") {
                return "Compartilhe informações ou observações sobre este evento.";
            }
            return "Seja o primeiro a comentar!";
        }
    },
    methods: {
        hasRequiredTarget: function () {
            const churchId = this.getCurrentChurchId();

            if ((this.type == "aviso" || this.type == "evento" || this.type == "musica_evento") && churchId == null) {
                return false;
            }

            if (this.type == "musica") {
                return churchId != null && Number(this.id_musica) > 0;
            }

            if (this.type == "evento") {
                return Number(this.id_evento) > 0;
            }

            if (this.type == "musica_evento") {
                return Number(this.id_musica) > 0 && Number(this.id_evento) > 0;
            }

            return true;
        },
        fillVariables: function () {
            if (this.type == "aviso") {
                this.createPath = "/igreja/publicar-aviso";
                this.returnPath = "/igreja/retorna-avisos";
                this.likePath = "/igreja/curtir-aviso";
                this.updatePath = "/igreja/editar-aviso";
                this.deletePath = "/igreja/deletar-aviso";
            } else if (this.type == "musica") {
                this.createPath = "/musicas/comentarios/criar";
                this.returnPath = "/musicas/comentarios/retorna";
                this.likePath = "/musicas/comentarios/like";
                this.updatePath = "/musicas/comentarios/editar";
                this.deletePath = "/musicas/comentarios/deletar";
            } else if (this.type == "musica_evento") {
                this.createPath = "/musicas/comentarios-evento/criar";
                this.returnPath = "/musicas/comentarios-evento/retorna";
                this.likePath = "/musicas/comentarios-evento/like";
                this.updatePath = "/musicas/comentarios-evento/editar";
                this.deletePath = "/musicas/comentarios-evento/deletar";
            } else if (this.type == "evento") {
                this.createPath = "/igreja/eventos/comentarios/criar";
                this.returnPath = "/igreja/eventos/comentarios/retorna";
                this.likePath = "/igreja/eventos/comentarios/like";
                this.updatePath = "/igreja/eventos/comentarios/editar";
                this.deletePath = "/igreja/eventos/comentarios/deletar";
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

            if (!this.hasRequiredTarget()) {
                return;
            }

            let data = {
                id_igreja: churchId,
                mensagem: value,
                id_musica: this.id_musica ? Number(this.id_musica) : undefined,
                id_evento: this.id_evento ? Number(this.id_evento) : undefined,
                parent_id: parentId
            }

            api.post(self.createPath, data)
                .then(function () {
                    if (parentId) {
                        self.replyText = "";
                        self.activeReplyId = null;
                        self.returnWarnings().then(() => {
                            self.scrollToBottom();
                        });
                    } else {
                        $("#send-warning").val("");
                        self.returnWarnings();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        returnWarnings: function () {
            let self = this;
            let churchId = this.getCurrentChurchId();

            if (!this.hasRequiredTarget()) {
                self.isLoading = false;
                return Promise.resolve();
            }

            let data = {
                id_igreja: churchId,
                id_musica: this.id_musica ? Number(this.id_musica) : undefined,
                id_evento: this.id_evento ? Number(this.id_evento) : undefined
            }

            self.isLoading = true;
            return api.post(self.returnPath, data)
                .then(function (response) {
                    self.warnings = response.data.returnObj || [];
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.isLoading = false;
                });
        },
        likeWarning: function (warning_id, usuario_atual_curtiu = false) {
            let self = this;
            let churchId = this.getCurrentChurchId();

            if (usuario_atual_curtiu) {
                return;
            }

            if (!this.hasRequiredTarget()) {
                return;
            }

            let data = {
                id_igreja: churchId,
                id_evento: this.id_evento ? Number(this.id_evento) : undefined,
                id_musica: this.id_musica ? Number(this.id_musica) : undefined,
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
            if (!this.canCreate) {
                return;
            }
            this.activeReplyId = this.activeReplyId === warning_id ? null : warning_id;
            this.replyText = "";
            if (this.activeReplyId) {
                this.$nextTick(() => {
                    if (this.$refs.replyInput && this.$refs.replyInput[0]) {
                        this.$refs.replyInput[0].focus();
                    }
                });
            }
        },
        toggleDropdown: function (id_aviso) {
            if (this.activeDropdownId === id_aviso) {
                this.activeDropdownId = null;
            } else {
                this.activeDropdownId = id_aviso;
            }
        },
        startEditWarning: function (warning) {
            this.editingWarningId = warning.id_aviso;
            this.editingWarningText = warning.mensagem;
        },
        cancelEditWarning: function () {
            this.editingWarningId = null;
            this.editingWarningText = "";
        },
        canEdit: function (warning) {
            if (!warning || !warning.criador) {
                return false;
            }
            if (this.type === "aviso") {
                return this.hasChurchPermission("warnings.edit");
            }
            const isOwner = this.user && Number(this.user.id_usuario) === Number(warning.criador.id_usuario);
            if (isOwner) {
                return true;
            }
            return false;
        },
        canDelete: function (warning) {
            if (!warning || !warning.criador) {
                return false;
            }
            if (this.type === "aviso") {
                return this.hasChurchPermission("warnings.delete");
            }
            const isOwner = this.user && Number(this.user.id_usuario) === Number(warning.criador.id_usuario);
            if (isOwner) {
                return true;
            }
            return false;
        },
        updateWarning: function () {
            if (!this.editingWarningId || !this.editingWarningText.trim()) {
                return;
            }
            const churchId = this.getCurrentChurchId();

            let payload = {};
            if (this.type === "aviso") {
                if (!this.hasRequiredTarget()) return;
                payload = {
                    id_igreja: Number(churchId),
                    id_aviso: Number(this.editingWarningId),
                    mensagem: this.editingWarningText
                };
            } else if (this.type === "evento" || this.type === "musica_evento") {
                if (!this.hasRequiredTarget()) return;
                payload = {
                    id_igreja: Number(churchId),
                    id_evento: this.id_evento ? Number(this.id_evento) : undefined,
                    id_musica: this.id_musica ? Number(this.id_musica) : undefined,
                    id_comentario: Number(this.editingWarningId),
                    mensagem: this.editingWarningText
                };
            } else if (this.type === "musica") {
                if (!this.hasRequiredTarget()) return;
                payload = {
                    id_igreja: Number(churchId),
                    id_musica: Number(this.id_musica),
                    id_comentario: Number(this.editingWarningId),
                    mensagem: this.editingWarningText
                };
            }

            api.post(this.updatePath, payload).then(() => {
                this.cancelEditWarning();
                this.returnWarnings();
            }).catch((error) => {
                console.log(error);
            });
        },
        askDeleteWarning: function (warning) {
            this.warningToDelete = warning;
            this.showDeleteWarningModal = true;
        },
        deleteWarning: function () {
            if (!this.warningToDelete) {
                return;
            }
            const churchId = this.getCurrentChurchId();

            let payload = {};
            if (this.type === "aviso") {
                if (!this.hasRequiredTarget()) return;
                payload = {
                    id_igreja: Number(churchId),
                    id_aviso: Number(this.warningToDelete.id_aviso)
                };
            } else if (this.type === "evento" || this.type === "musica_evento") {
                if (!this.hasRequiredTarget()) return;
                payload = {
                    id_igreja: Number(churchId),
                    id_evento: this.id_evento ? Number(this.id_evento) : undefined,
                    id_musica: this.id_musica ? Number(this.id_musica) : undefined,
                    id_comentario: Number(this.warningToDelete.id_aviso)
                };
            } else if (this.type === "musica") {
                if (!this.hasRequiredTarget()) return;
                payload = {
                    id_igreja: Number(churchId),
                    id_musica: Number(this.id_musica),
                    id_comentario: Number(this.warningToDelete.id_aviso)
                };
            }

            api.post(this.deletePath, payload).then(() => {
                this.showDeleteWarningModal = false;
                this.warningToDelete = null;
                this.returnWarnings();
            }).catch((error) => {
                console.log(error);
            });
        },
        scrollToBottom: function () {
            this.$nextTick(() => {
                const container = document.querySelector('.inner-container');
                if (container) {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            });
        }
    },
    watch: {
        id_evento: function () {
            this.returnWarnings();
        },
        id_musica: function () {
            this.returnWarnings();
        },
        type: function () {
            this.fillVariables();
            this.returnWarnings();
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
  padding-bottom: 1rem;
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
  background: var(--primary-primary-blue-high);
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

.btn-danger-action:hover {
  background: rgba(241, 76, 76, 0.12);
  color: var(--others-red);
  border-color: rgba(241, 76, 76, 0.2);
}

/* --- REPLY INPUT --- */
.reply-input-box {
  margin-left: 3rem;
  background: rgba(24, 21, 56, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-sm);
  padding: 10px;
}

.edit-comment-inline-form {
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.confirm-delete-box {
  text-align: center;
  padding: 1rem;
  color: var(--neutral-gray-high);
}

.confirm-delete-box .warning-text {
  color: var(--others-red);
  font-weight: 700;
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
  margin-bottom: 1.5rem;
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

/* --- DROPDOWN AÇÕES DE COMENTÁRIOS --- */
.warning-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
}

.comment-menu-container {
  position: relative;
  display: inline-block;
}

.btn-icon-only.menu-trigger {
  background: transparent;
  border: none;
  color: var(--neutral-gray-low);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.btn-icon-only.menu-trigger:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--neutral-white);
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
}

.comment-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(24, 21, 56, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 110px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--neutral-gray-high);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-5);
  text-align: left;
  cursor: pointer;
  width: 100%;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--neutral-white);
}

.dropdown-item.danger {
  color: var(--others-red);
}

.dropdown-item.danger:hover {
  background: rgba(241, 76, 76, 0.1);
  color: var(--others-red);
}

/* Transição de fade-in rápida */
.fade-in-enter-active, .fade-in-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.fade-in-enter-from, .fade-in-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.warnings-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--neutral-gray-medium);
}

.warnings-empty-state .empty-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.12);
  margin-bottom: 0.75rem;
}

.warnings-empty-state h5 {
  margin: 0 0 0.5rem;
  color: var(--neutral-white);
  font-size: var(--font-size-3);
  font-weight: 600;
}

.warnings-empty-state p {
  margin: 0;
  font-size: var(--font-size-4);
  line-height: 1.4;
  max-width: 280px;
}
</style>
