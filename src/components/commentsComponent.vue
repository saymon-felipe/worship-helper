<template>
    <div class="warnings-wrapper">
        <!-- Criar Aviso/Comentário Principal (Moved to top) -->
        <div class="create-warning" v-if="canCreate">
            <form @submit.prevent="createNewWarning(null)" class="comment-input-card">
                <div class="comment-input-body">
                    <textarea
                        id="send-warning"
                        v-model="mainCommentText"
                        :placeholder="inputPlaceholder"
                        maxlength="500"
                        rows="2"
                        class="comment-textarea"
                        @keydown.enter.exact.prevent="createNewWarning(null)"
                    ></textarea>
                </div>

                <!-- Miniaturas Anexadas antes de enviar -->
                <div v-if="mainImages.length > 0" class="attached-thumbnails-bar">
                    <div
                        v-for="(img, imgIdx) in mainImages"
                        :key="imgIdx"
                        class="attached-thumbnail-wrapper"
                    >
                        <img :src="img.url" alt="Miniatura" class="attached-thumbnail" @click="openFullscreenViewer(mainImages, imgIdx)">
                        <button
                            type="button"
                            class="btn-remove-thumb"
                            title="Remover imagem"
                            @click.stop="removeMainImage(imgIdx)"
                        >
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>

                <!-- Toolbar de Ações -->
                <div class="comment-input-toolbar">
                    <div class="toolbar-left">
                        <label
                            v-if="supportsImages"
                            class="comment-image-picker-btn"
                            :class="{ disabled: mainImages.length >= 1 }"
                            :title="mainImages.length >= 1 ? 'Já existe uma imagem anexada' : 'Adicionar imagem'"
                        >
                            <span class="material-icons">add_photo_alternate</span>
                            <span class="picker-btn-text">Imagem</span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                :disabled="mainImages.length >= 1"
                                @change="onFileSelected($event, null)"
                                ref="mainFileInput"
                            >
                        </label>
                    </div>
                    <div class="toolbar-right">
                        <button
                            type="submit"
                            class="btn-send-comment"
                            :disabled="isSubmittingMain || (!mainCommentText.trim() && !mainImages.length)"
                            title="Enviar comentário"
                            id="send-warning-button"
                        >
                            <template v-if="isSubmittingMain">
                                <span class="btn-spinner"></span>
                                <span>Enviando...</span>
                            </template>
                            <template v-else>
                                <span>Enviar</span>
                                <span class="material-icons">send</span>
                            </template>
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div class="warnings-list">
            <div class="comments-order-control" v-if="type !== 'aviso' && groupedWarnings.length > 1">
                <span>Ordenar por:</span>
                <button type="button" @click="toggleCommentOrder">
                    <span class="material-icons">sort</span>
                    <span>{{ commentOrderLabel }}</span>
                </button>
            </div>
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
                                <div v-if="warning.imagens && warning.imagens.length" class="comment-images">
                                    <div
                                        v-for="(image, imgIndex) in warning.imagens"
                                        :key="image.key || image.url || imgIndex"
                                        class="comment-published-image-wrapper"
                                        @click.prevent="openFullscreenViewer(warning.imagens, imgIndex)"
                                    >
                                        <div v-if="!isImageLoaded(image.url)" class="published-img-skeleton">
                                            <span class="material-icons skeleton-img-icon">image</span>
                                        </div>
                                        <img
                                            :src="image.url"
                                            alt="Imagem anexada ao comentário"
                                            class="comment-published-full-img"
                                            :class="{ 'img-hidden': !isImageLoaded(image.url) }"
                                            @load="markImageLoaded(image.url)"
                                            @error="markImageLoaded(image.url)"
                                        >
                                        <div v-if="isImageLoaded(image.url)" class="image-overlay-zoom">
                                            <span class="material-icons">zoom_in</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="warning-actions">
                                    <button v-if="canLike" type="button" v-on:click="likeWarning(warning.id_aviso, warning.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="warning.usuario_atual_curtiu ? 'primary' : ''">
                                        <span class="material-icons">thumb_up_off_alt</span>
                                        <span>{{ warning.quantidade_curtidas }}</span>
                                    </button>
                                    <span v-else class="like-count-readonly">
                                        <span class="material-icons">thumb_up_off_alt</span>
                                        <span>{{ warning.quantidade_curtidas }}</span>
                                    </span>
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
                        <form @submit.prevent="createNewWarning(warning.id_aviso)" class="comment-input-card reply-card">
                            <div class="comment-input-body">
                                <textarea
                                    v-model="replyText"
                                    placeholder="Escreva uma resposta..."
                                    maxlength="500"
                                    rows="2"
                                    class="comment-textarea"
                                    ref="replyInput"
                                    @keydown.enter.exact.prevent="createNewWarning(warning.id_aviso)"
                                ></textarea>
                            </div>

                            <!-- Miniaturas Anexadas na Resposta -->
                            <div v-if="replyImages.length > 0" class="attached-thumbnails-bar">
                                <div
                                    v-for="(img, imgIdx) in replyImages"
                                    :key="imgIdx"
                                    class="attached-thumbnail-wrapper"
                                >
                                    <img :src="img.url" alt="Miniatura da resposta" class="attached-thumbnail" @click="openFullscreenViewer(replyImages, imgIdx)">
                                    <button
                                        type="button"
                                        class="btn-remove-thumb"
                                        title="Remover imagem"
                                        @click.stop="removeReplyImage(imgIdx)"
                                    >
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Toolbar da Resposta -->
                            <div class="comment-input-toolbar">
                                <div class="toolbar-left">
                                    <label
                                        v-if="supportsImages"
                                        class="comment-image-picker-btn"
                                        :class="{ disabled: replyImages.length >= 1 }"
                                        :title="replyImages.length >= 1 ? 'Já existe uma imagem anexada' : 'Adicionar imagem'"
                                    >
                                        <span class="material-icons">add_photo_alternate</span>
                                        <span class="picker-btn-text">Imagem</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            :disabled="replyImages.length >= 1"
                                            @change="onFileSelected($event, warning.id_aviso)"
                                        >
                                    </label>
                                </div>
                                <div class="toolbar-right">
                                    <button type="button" class="btn btn-small btn-text" :disabled="isSubmittingReply" @click="cancelReply()">Cancelar</button>
                                    <button
                                        type="submit"
                                        class="btn-send-comment btn-small"
                                        :disabled="isSubmittingReply || (!replyText.trim() && !replyImages.length)"
                                    >
                                        <template v-if="isSubmittingReply">
                                            <span class="btn-spinner"></span>
                                            <span>Enviando...</span>
                                        </template>
                                        <template v-else>
                                            <span>Enviar</span>
                                            <span class="material-icons">send</span>
                                        </template>
                                    </button>
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
                                <div v-if="reply.imagens && reply.imagens.length" class="comment-images">
                                    <div
                                        v-for="(image, imgIndex) in reply.imagens"
                                        :key="image.key || image.url || imgIndex"
                                        class="comment-published-image-wrapper"
                                        @click.prevent="openFullscreenViewer(reply.imagens, imgIndex)"
                                    >
                                        <div v-if="!isImageLoaded(image.url)" class="published-img-skeleton">
                                            <span class="material-icons skeleton-img-icon">image</span>
                                        </div>
                                        <img
                                            :src="image.url"
                                            alt="Imagem anexada à resposta"
                                            class="comment-published-full-img"
                                            :class="{ 'img-hidden': !isImageLoaded(image.url) }"
                                            @load="markImageLoaded(image.url)"
                                            @error="markImageLoaded(image.url)"
                                        >
                                        <div v-if="isImageLoaded(image.url)" class="image-overlay-zoom">
                                            <span class="material-icons">zoom_in</span>
                                        </div>
                                    </div>
                                </div>
                                    <div class="warning-actions">
                                        <button v-if="canLike" type="button" v-on:click="likeWarning(reply.id_aviso, reply.usuario_atual_curtiu)" class="btn primary-alt btn-small like-warning-button" :class="reply.usuario_atual_curtiu ? 'primary' : ''">
                                            <span class="material-icons">thumb_up_off_alt</span>
                                            <span>{{ reply.quantidade_curtidas }}</span>
                                        </button>
                                        <span v-else class="like-count-readonly">
                                            <span class="material-icons">thumb_up_off_alt</span>
                                            <span>{{ reply.quantidade_curtidas }}</span>
                                        </span>
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
                :loading="isDeletingWarning"
                :title="type === 'aviso' ? 'Excluir aviso' : 'Excluir comentário'"
                :message="`Tem certeza que deseja excluir este ${type === 'aviso' ? 'aviso' : 'comentário'}?`"
                subMessage="Se ele tiver respostas, elas também serão removidas."
                @confirm="deleteWarning"
                @cancel="showDeleteWarningModal = false"
            />

            <!-- Modal de Confirmação de Imagem Selecionada -->
            <Transition name="modal-fade">
                <div class="modal-wrapper image-confirm-modal-wrapper" v-if="showImageConfirmModal">
                    <div class="modal-overlay" @click="cancelImageConfirm"></div>
                    <div class="modal-container image-confirm-modal-container">
                        <div class="modal-header">
                            <span class="material-icons close-icon" @click="cancelImageConfirm">chevron_left</span>
                            <h4>Confirmar Imagem</h4>
                        </div>
                        <div class="modal-body image-confirm-body">
                            <p class="confirm-subtitle">
                                Confirme se esta é a imagem que você deseja anexar ao seu comentário:
                            </p>
                            
                            <div class="single-image-preview-container" v-if="pendingImages.length > 0">
                                <div class="pending-preview-wrapper">
                                    <img :src="pendingImages[0].url" alt="Pré-visualização da imagem" class="pending-preview-hero-img">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn image-cancel-btn" @click="cancelImageConfirm">
                                Cancelar
                            </button>
                            <button
                                type="button"
                                class="btn primary confirm-image-btn"
                                :disabled="!pendingImages.length"
                                @click="confirmSelectedImages"
                            >
                                <span class="material-icons">check</span>
                                <span>Confirmar e Anexar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>

            <!-- Modal de Visualização da Imagem em Tela Cheia (Fullscreen Viewer) -->
            <Transition name="fade-in">
                <div
                    class="fullscreen-image-modal"
                    v-if="fullscreenViewerModal.show"
                    @click.self="closeFullscreenViewer"
                >
                    <div class="fullscreen-backdrop" @click="closeFullscreenViewer"></div>
                    
                    <div class="fullscreen-topbar">
                        <span class="fullscreen-counter" v-if="fullscreenViewerModal.images.length > 1">
                            {{ fullscreenViewerModal.currentIndex + 1 }} / {{ fullscreenViewerModal.images.length }}
                        </span>
                        <div class="fullscreen-actions">
                            <a
                                :href="currentFullscreenImageUrl"
                                target="_blank"
                                rel="noopener"
                                class="fullscreen-action-btn"
                                title="Abrir em nova aba"
                            >
                                <span class="material-icons">open_in_new</span>
                            </a>
                            <button
                                type="button"
                                class="fullscreen-action-btn close-btn"
                                @click="closeFullscreenViewer"
                                title="Fechar (Esc)"
                            >
                                <span class="material-icons">close</span>
                            </button>
                        </div>
                    </div>

                    <div class="fullscreen-content" @click.self="closeFullscreenViewer">
                        <button
                            v-if="fullscreenViewerModal.images.length > 1"
                            type="button"
                            class="fullscreen-nav-btn prev"
                            @click="prevFullscreenImage"
                            title="Anterior"
                        >
                            <span class="material-icons">chevron_left</span>
                        </button>

                        <div class="fullscreen-img-wrapper">
                            <img
                                :src="currentFullscreenImageUrl"
                                alt="Visualização em tela cheia"
                                class="fullscreen-img"
                            >
                        </div>

                        <button
                            v-if="fullscreenViewerModal.images.length > 1"
                            type="button"
                            class="fullscreen-nav-btn next"
                            @click="nextFullscreenImage"
                            title="Próxima"
                        >
                            <span class="material-icons">chevron_right</span>
                        </button>
                    </div>
                </div>
            </Transition>
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
    props: ["type", "id_musica", "id_evento", "canCreateThread", "canManageThread", "canLikeThread"],
    data() {
        return {
            isLoading: true,
            warnings: [],
            activeReplyId: null,
            replyText: "",
            mainCommentText: "",
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
            activeDropdownId: null,
            commentOrder: "recent",
            newestCreatedWarningId: null,
            mainImages: [],
            replyImages: [],
            showImageConfirmModal: false,
            pendingImages: [],
            pendingParentId: null,
            isSubmittingMain: false,
            isSubmittingReply: false,
            isDeletingWarning: false,
            loadedImageMap: {},
            fullscreenViewerModal: {
                show: false,
                images: [],
                currentIndex: 0
            }
        }
    },
    computed: {
        groupedWarnings: function () {
            if (!this.warnings || !Array.isArray(this.warnings)) {
                return [];
            }
            // Separa os avisos principais (parent_id é null ou undefined)
            const parents = this.warnings.filter(w => w.parent_id === null || w.parent_id === undefined).map((warning) => ({ ...warning }));
            
            parents.forEach(parent => {
                // Filtra as respostas vinculadas a este pai
                const replies = this.warnings.filter(w => w.parent_id === parent.id_aviso);
                // Ordena as respostas cronologicamente (da mais antiga para a mais recente)
                replies.sort((a, b) => new Date(a.data_criacao) - new Date(b.data_criacao));
                parent.replies = replies;
            });

            parents.sort((first, second) => {
                if (Number(first.id_aviso) === Number(this.newestCreatedWarningId)) return -1;
                if (Number(second.id_aviso) === Number(this.newestCreatedWarningId)) return 1;

                if (this.commentOrder === "top") {
                    const likesDifference = Number(second.quantidade_curtidas || 0) - Number(first.quantidade_curtidas || 0);
                    if (likesDifference !== 0) return likesDifference;
                }

                return new Date(second.data_criacao) - new Date(first.data_criacao);
            });
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
        canLike: function () {
            if (this.type === "evento" || this.type === "musica_evento") {
                return Boolean(this.canLikeThread);
            }
            return true;
        },
        canEditWarning: function () {
            return this.type === "aviso" && this.hasChurchPermission("warnings.edit");
        },
        canDeleteWarning: function () {
            return this.type === "aviso" && this.hasChurchPermission("warnings.delete");
        },
        supportsImages: function () {
            return this.type === "aviso" || this.type === "evento";
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
        },
        commentOrderLabel: function () {
            return this.commentOrder === "recent" ? "Mais recentes" : "Principais";
        },
        currentFullscreenImageUrl: function () {
            if (!this.fullscreenViewerModal.images || !this.fullscreenViewerModal.images.length) return '';
            const img = this.fullscreenViewerModal.images[this.fullscreenViewerModal.currentIndex];
            if (!img) return '';
            return typeof img === 'string' ? img : (img.url || img.src || '');
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
                if (self.isSubmittingReply) return;
                self.isSubmittingReply = true;
                value = self.replyText;
            } else {
                if (self.isSubmittingMain) return;
                self.isSubmittingMain = true;
                value = self.mainCommentText || $("#send-warning").val() || "";
            }

            let churchId = this.getCurrentChurchId();

            const images = parentId ? self.replyImages : self.mainImages;

            if ((!value || value.trim().length === 0) && (!images || !images.length)) {
                if (parentId) self.isSubmittingReply = false;
                else self.isSubmittingMain = false;
                return;
            }

            if (!this.hasRequiredTarget()) {
                if (parentId) self.isSubmittingReply = false;
                else self.isSubmittingMain = false;
                return;
            }

            let data = {
                id_igreja: churchId,
                mensagem: value,
                id_musica: this.id_musica ? Number(this.id_musica) : undefined,
                id_evento: this.id_evento ? Number(this.id_evento) : undefined,
                parent_id: parentId
            }

            const payload = self.supportsImages ? self.buildMultipartPayload(data, images) : data;

            api.post(self.createPath, payload)
                .then(function (response) {
                    const comment = self.buildLocalWarning(response.data.returnObj, value, parentId);
                    if (parentId) {
                        self.warnings.push(comment);
                        self.replyText = "";
                        self.clearReplyImages();
                        self.activeReplyId = null;
                        self.scrollToBottom();
                    } else {
                        self.warnings.unshift(comment);
                        self.newestCreatedWarningId = comment.id_aviso;
                        self.mainCommentText = "";
                        $("#send-warning").val("");
                        self.clearMainImages();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    if (parentId) {
                        self.isSubmittingReply = false;
                    } else {
                        self.isSubmittingMain = false;
                    }
                });
        },
        buildLocalWarning: function (savedComment, message, parentId) {
            return {
                id_aviso: savedComment.id_aviso,
                mensagem: message,
                data_criacao: new Date().toISOString(),
                quantidade_curtidas: 0,
                usuario_atual_curtiu: false,
                imagens: savedComment.imagens || [],
                parent_id: parentId,
                criador: {
                    id_usuario: this.user.id_usuario,
                    nome_usuario: this.user.nome_usuario,
                    imagem_usuario: this.user.imagem_usuario
                }
            };
        },
        onFileSelected: function (event, parentId) {
            const files = Array.from(event.target.files || []);
            if (!files.length) return;

            const file = files[0];
            if (file.size > 10 * 1024 * 1024) {
                this.showResponse("A imagem deve ter no máximo 10 MB", ".response", "error");
                event.target.value = "";
                return;
            }

            const preview = {
                file: file,
                url: URL.createObjectURL(file)
            };

            this.pendingImages = [preview];
            this.pendingParentId = parentId;
            this.showImageConfirmModal = true;
            event.target.value = "";
        },
        cancelImageConfirm: function () {
            if (this.pendingImages && this.pendingImages.length) {
                this.pendingImages.forEach((item) => {
                    if (item.url) URL.revokeObjectURL(item.url);
                });
            }
            this.pendingImages = [];
            this.pendingParentId = null;
            this.showImageConfirmModal = false;
        },
        removePendingImage: function (index) {
            if (this.pendingImages[index]) {
                if (this.pendingImages[index].url) {
                    URL.revokeObjectURL(this.pendingImages[index].url);
                }
                this.pendingImages.splice(index, 1);
            }
            if (this.pendingImages.length === 0) {
                this.showImageConfirmModal = false;
            }
        },
        confirmSelectedImages: function () {
            if (!this.pendingImages.length) return;

            if (this.pendingParentId === null) {
                this.clearMainImages();
                this.mainImages = [...this.pendingImages];
            } else {
                this.clearReplyImages();
                this.replyImages = [...this.pendingImages];
            }

            this.pendingImages = [];
            this.pendingParentId = null;
            this.showImageConfirmModal = false;
        },
        removeMainImage: function (index) {
            if (this.mainImages[index]) {
                if (this.mainImages[index].url) {
                    URL.revokeObjectURL(this.mainImages[index].url);
                }
                this.mainImages.splice(index, 1);
            }
        },
        removeReplyImage: function (index) {
            if (this.replyImages[index]) {
                if (this.replyImages[index].url) {
                    URL.revokeObjectURL(this.replyImages[index].url);
                }
                this.replyImages.splice(index, 1);
            }
        },
        clearMainImages: function () {
            if (this.mainImages && this.mainImages.length) {
                this.mainImages.forEach((img) => {
                    if (img && img.url) URL.revokeObjectURL(img.url);
                });
            }
            this.mainImages = [];
        },
        clearReplyImages: function () {
            if (this.replyImages && this.replyImages.length) {
                this.replyImages.forEach((img) => {
                    if (img && img.url) URL.revokeObjectURL(img.url);
                });
            }
            this.replyImages = [];
        },
        cancelReply: function () {
            this.activeReplyId = null;
            this.replyText = "";
            this.clearReplyImages();
        },
        openFullscreenViewer: function (images, index = 0) {
            if (!images || !images.length) return;
            this.fullscreenViewerModal = {
                show: true,
                images: images,
                currentIndex: index
            };
            window.addEventListener("keydown", this.handleFullscreenKeydown);
        },
        closeFullscreenViewer: function () {
            this.fullscreenViewerModal.show = false;
            window.removeEventListener("keydown", this.handleFullscreenKeydown);
        },
        prevFullscreenImage: function () {
            if (!this.fullscreenViewerModal.images.length) return;
            const len = this.fullscreenViewerModal.images.length;
            this.fullscreenViewerModal.currentIndex = (this.fullscreenViewerModal.currentIndex - 1 + len) % len;
        },
        nextFullscreenImage: function () {
            if (!this.fullscreenViewerModal.images.length) return;
            const len = this.fullscreenViewerModal.images.length;
            this.fullscreenViewerModal.currentIndex = (this.fullscreenViewerModal.currentIndex + 1) % len;
        },
        handleFullscreenKeydown: function (e) {
            if (!this.fullscreenViewerModal.show) return;
            if (e.key === "Escape") this.closeFullscreenViewer();
            if (e.key === "ArrowLeft") this.prevFullscreenImage();
            if (e.key === "ArrowRight") this.nextFullscreenImage();
        },
        buildMultipartPayload: function (data, images) {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) formData.append(key, value);
            });
            images.forEach((image) => {
                const fileObj = image.file || image;
                if (fileObj) formData.append("imagens", fileObj);
            });
            return formData;
        },
        findWarning: function (warningId) {
            return this.warnings.find((warning) => Number(warning.id_aviso) === Number(warningId));
        },
        toggleCommentOrder: function () {
            this.commentOrder = this.commentOrder === "recent" ? "top" : "recent";
        },
        isImageLoaded: function (url) {
            if (!url) return true;
            if (window.globalImagePreloadCache && window.globalImagePreloadCache.has(url)) {
                return true;
            }
            return Boolean(this.loadedImageMap[url]);
        },
        markImageLoaded: function (url) {
            if (!url) return;
            if (!window.globalImagePreloadCache) {
                window.globalImagePreloadCache = new Set();
            }
            window.globalImagePreloadCache.add(url);
            if (this.$set) {
                this.$set(this.loadedImageMap, url, true);
            } else {
                this.loadedImageMap = { ...this.loadedImageMap, [url]: true };
            }
        },
        preloadCommentImages: function (warningsList) {
            if (!warningsList || !Array.isArray(warningsList)) return;
            if (!window.globalImagePreloadCache) {
                window.globalImagePreloadCache = new Set();
            }
            warningsList.forEach((w) => {
                if (w.imagens && Array.isArray(w.imagens)) {
                    w.imagens.forEach((img) => {
                        const url = typeof img === 'string' ? img : (img.url || img.src || '');
                        if (url) {
                            if (window.globalImagePreloadCache.has(url)) {
                                this.markImageLoaded(url);
                            } else {
                                const i = new Image();
                                i.onload = () => this.markImageLoaded(url);
                                i.onerror = () => this.markImageLoaded(url);
                                i.src = url;
                            }
                        }
                    });
                }
            });
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
                    self.preloadCommentImages(self.warnings);
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.isLoading = false;
                });
        },
        likeWarning: function (warning_id) {
            let self = this;
            let churchId = this.getCurrentChurchId();

            if (!this.canLike) {
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
                    const warning = self.findWarning(warning_id);
                    if (!warning) return;
                    warning.usuario_atual_curtiu = !warning.usuario_atual_curtiu;
                    warning.quantidade_curtidas = Math.max(0, Number(warning.quantidade_curtidas || 0) + (warning.usuario_atual_curtiu ? 1 : -1));
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
            this.clearReplyImages();
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
            if (this.type === "evento") {
                return Boolean(this.canManageThread);
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
            if (this.type === "evento") {
                return Boolean(this.canManageThread);
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
                const warning = this.findWarning(this.editingWarningId);
                if (warning) {
                    warning.mensagem = this.editingWarningText;
                }
                this.cancelEditWarning();
            }).catch((error) => {
                console.log(error);
            });
        },
        askDeleteWarning: function (warning) {
            this.warningToDelete = warning;
            this.showDeleteWarningModal = true;
        },
        deleteWarning: function () {
            if (!this.warningToDelete || this.isDeletingWarning) {
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

            this.isDeletingWarning = true;

            api.post(this.deletePath, payload).then(() => {
                const deletedId = Number(this.warningToDelete.id_aviso);
                this.warnings = this.warnings.filter((warning) => Number(warning.id_aviso) !== deletedId && Number(warning.parent_id) !== deletedId);
                this.showDeleteWarningModal = false;
                this.warningToDelete = null;
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                this.isDeletingWarning = false;
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
    },
    beforeUnmount: function () {
        this.clearMainImages();
        this.clearReplyImages();
        this.cancelImageConfirm();
        window.removeEventListener("keydown", this.handleFullscreenKeydown);
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

/* --- COMMENT INPUT CARD (MOBILE FIRST) --- */
.create-warning {
  width: 100%;
  margin-bottom: 1rem;
}

.comment-input-card {
  display: flex;
  flex-direction: column;
  background: rgba(24, 21, 56, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 12px;
  gap: 10px;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.comment-input-card:focus-within {
  border-color: rgba(56, 182, 255, 0.4);
  box-shadow: 0 0 12px rgba(56, 182, 255, 0.15);
}

.comment-input-body {
  width: 100%;
}

.comment-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--neutral-white);
  font-size: var(--font-size-4);
  line-height: 1.45;
  resize: vertical;
  min-height: 44px;
  max-height: 160px;
  font-family: inherit;
}

.comment-textarea::placeholder {
  color: var(--neutral-gray-medium);
}

/* --- ATTACHED THUMBNAILS BAR --- */
.attached-thumbnails-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 6px 0 2px 0;
  scrollbar-width: thin;
}

.attached-thumbnail-wrapper {
  position: relative;
  width: 68px;
  height: 68px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid rgba(56, 182, 255, 0.35);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.attached-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.attached-thumbnail:hover {
  transform: scale(1.05);
}

.btn-remove-thumb {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(18, 15, 42, 0.85);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.btn-remove-thumb:hover {
  background: #ff5252;
  color: white;
  border-color: #ff5252;
}

.btn-remove-thumb .material-icons {
  font-size: 14px;
}

/* --- TOOLBAR --- */
.comment-input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-image-picker-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--secondary-blue-soft);
  background: rgba(56, 182, 255, 0.08);
  border: 1px solid rgba(56, 182, 255, 0.2);
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  min-height: 36px;
  transition: all var(--transition-fast);
  user-select: none;
}

.comment-image-picker-btn:hover:not(.disabled) {
  background: rgba(56, 182, 255, 0.18);
  border-color: rgba(56, 182, 255, 0.35);
  transform: translateY(-1px);
}

.comment-image-picker-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.comment-image-picker-btn input[type="file"] {
  display: none;
}

.comment-image-picker-btn .material-icons {
  font-size: 18px;
}

.btn-send-comment {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-primary-blue-high);
  color: var(--neutral-gray-high-2);
  font-weight: 600;
  border: 1px solid transparent;
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 13px;
  min-height: 36px;
  transition: all var(--transition-fast);
}

.btn-send-comment:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 182, 255, 0.3);
}

.btn-send-comment:disabled {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: none !important;
  opacity: 1 !important;
  cursor: not-allowed;
}

.btn-send-comment:disabled .material-icons {
  color: rgba(255, 255, 255, 0.45) !important;
}

.btn-send-comment .material-icons {
  font-size: 16px;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btnSpinnerSpin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes btnSpinnerSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* --- PUBLISHED COMMENT IMAGES (FULL WIDTH & NATURAL ASPECT RATIO) --- */
.comment-images {
  width: 100%;
  margin: 10px 0 6px 0;
}

.comment-published-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color var(--transition-fast);
}

.comment-published-image-wrapper:hover {
  border-color: rgba(56, 182, 255, 0.4);
}

.comment-published-full-img {
  width: 100%;
  height: auto;
  max-height: 480px;
  object-fit: contain;
  display: block;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.comment-published-full-img.img-hidden {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.published-img-skeleton {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 100%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.skeleton-img-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.2);
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.comment-published-image-wrapper:hover .comment-published-full-img {
  transform: scale(1.02);
}

.image-overlay-zoom {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.comment-published-image-wrapper:hover .image-overlay-zoom {
  opacity: 1;
}

.image-overlay-zoom .material-icons {
  font-size: 28px;
}

.warning-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.comments-order-control {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin: 0 0 10px;
  color: var(--neutral-gray-medium);
  font-size: 12px;
}

.comments-order-control button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(56, 182, 255, 0.22);
  border-radius: var(--radius-pill);
  background: rgba(56, 182, 255, 0.08);
  color: var(--secondary-blue-soft);
  cursor: pointer;
  padding: 5px 10px;
  font-size: 12px;
}

.comments-order-control .material-icons {
  font-size: 15px;
}

.like-warning-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
}

.like-count-readonly {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  color: var(--neutral-gray-high);
  font-size: 12px;
}

.like-count-readonly .material-icons {
  font-size: 16px;
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
  margin-top: 6px;
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

/* --- IMAGE CONFIRMATION SYSTEM MODAL --- */
.image-confirm-modal-wrapper {
  z-index: 9999;
}

.image-confirm-modal-container {
  max-width: 440px;
  width: 100%;
  background: linear-gradient(135deg, rgba(23, 20, 50, 0.98) 0%, rgba(15, 12, 35, 0.99) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
}

.image-confirm-body {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.confirm-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.45;
}

.single-image-preview-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4px 0 8px 0;
}

.pending-preview-wrapper {
  position: relative;
  max-width: 100%;
  max-height: 320px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.pending-preview-hero-img {
  max-width: 100%;
  max-height: 320px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.image-confirm-modal-container .modal-footer {
  display: flex;
  width: 100%;
  gap: 12px;
  justify-content: center;
  border-top: none !important;
  padding-top: 12px !important;
}

.image-cancel-btn {
  flex: 1;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  color: #fff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.confirm-image-btn {
  flex: 1;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  background: var(--secondary-blue-soft) !important;
  color: #fff !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none !important;
}

.confirm-image-btn:hover:not(:disabled) {
  background: #4cc3ff !important;
  box-shadow: var(--glow-shadow);
}

/* --- FULLSCREEN IMAGE VIEWER MODAL --- */
.fullscreen-image-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fullscreen-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 12, 0.92);
  backdrop-filter: blur(12px);
}

.fullscreen-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.fullscreen-counter {
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 500;
}

.fullscreen-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.fullscreen-action-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.fullscreen-action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.fullscreen-action-btn .material-icons {
  font-size: 20px;
}

.fullscreen-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 16px;
  touch-action: pan-y;
}

.fullscreen-img-wrapper {
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.fullscreen-nav-btn {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.fullscreen-nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.08);
}

.fullscreen-nav-btn .material-icons {
  font-size: 28px;
}

/* --- MOBILE RESPONSIVENESS (MOBILE FIRST) --- */
@media (max-width: 480px) {
  .picker-btn-text {
    display: none;
  }
  .comment-image-picker-btn {
    padding: 6px 10px;
  }
  .reply-input-box {
    margin-left: 1rem;
    padding: 0;
    background: transparent;
    border: none;
  }
  .replies-container {
    margin-left: 1rem;
    padding-left: 0.5rem;
  }
  .comment-image-thumb-wrapper {
    width: 85px;
    height: 85px;
  }
  .fullscreen-topbar {
    padding: 12px 16px;
  }
  .fullscreen-nav-btn {
    width: 40px;
    height: 40px;
  }
  .fullscreen-nav-btn .material-icons {
    font-size: 24px;
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
