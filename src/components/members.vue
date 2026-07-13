<template>
    <div class="members-page-container">
        <div class="members-header">
            <div class="header-titles">
                <h3>Membros da Igreja</h3>
                <p class="subtitle">{{ membersSubtitle }}</p>
            </div>
            <button class="add-member-btn" v-on:click="addMember()" v-if="canManageChurch" title="Convidar novo membro">
                <span class="material-icons">person_add</span>
            </button>
        </div>

        <div class="member-search-container">
            <span class="material-icons search-bar-icon">search</span>
            <input type="text" name="search_member" id="search-member" v-model="findUsers" placeholder="Buscar membros pelo nome...">
        </div>

        <section class="pending-invites-section" v-if="canManageChurch && pendingInvitesList.length > 0">
            <div class="pending-invites-header">
                <div>
                    <h4>Convites pendentes</h4>
                    <p>{{ pendingInvitesList.length }} aguardando resposta</p>
                </div>
                <span class="pending-count">{{ pendingInvitesList.length }}</span>
            </div>

            <div class="pending-invites-list">
                <article class="pending-invite-card" v-for="invite in pendingInvitesList" v-bind:key="invite.id">
                    <div class="pending-invite-avatar">
                        <img v-if="invite.imagem_usuario" :src="invite.imagem_usuario" :alt="invite.nome_usuario || invite.email_usuario">
                        <span v-else class="material-icons">mail</span>
                    </div>

                    <div class="pending-invite-content">
                        <div class="pending-invite-main">
                            <h5>{{ invite.nome_usuario || invite.email_usuario }}</h5>
                            <p>{{ invite.email_usuario || "Usuário cadastrado no app" }}</p>
                        </div>
                        <div class="pending-invite-meta">
                            <span>{{ invite.cadastrado ? "Usuário cadastrado" : "Aguardando cadastro" }}</span>
                            <span v-if="invite.data_criacao">{{ relativeTime(invite.data_criacao) }}</span>
                        </div>
                    </div>

                    <button class="delete-invite-btn" type="button" v-on:click="deleteInvite(invite)" title="Cancelar convite">
                        <span class="material-icons">delete</span>
                    </button>
                </article>
            </div>
        </section>

        <div class="members-list-grid">
            <div class="member-card" :id="'member-' + member.id_usuario" v-for="(member, index) in membersList" v-bind:key="member.id_usuario || index">
                <img :src="member.imagem_usuario || default_avatar" class="member-avatar" :alt="member.nome_usuario || 'Membro'">
                <div class="member-info-content">
                    <div class="member-details">
                        <h6 class="member-name">{{ member.nome_usuario }}</h6>
                        <p class="member-occupations" v-if="member.funcoes_usuario && member.funcoes_usuario.length > 0">
                            {{ returnOccupations(member.funcoes_usuario) }}
                        </p>
                        <div class="member-badges" v-if="member.tag_usuario && member.tag_usuario.length > 0">
                            <span class="member-tag-chip">{{ member.tag_usuario[0].nome_tag }}</span>
                        </div>
                    </div>
                    <button class="more-actions-btn" v-on:click.stop="openMemberMoreActions(member.id_usuario)" v-if="canManageChurch" title="Opções do membro">
                        <span class="material-icons">more_vert</span>
                    </button>
                </div>

                <div class="member-more-actions" v-if="canManageChurch">
                    <ul>
                        <li v-on:click="addTagFunction(member)">
                            <span class="material-icons action-icon">local_offer</span>
                            <span>Atribuir tag</span>
                        </li>
                        <li v-on:click="addOccupationFunction(member)">
                            <span class="material-icons action-icon">work_outline</span>
                            <span>Atribuir função</span>
                        </li>
                        <li v-on:click="removeMemberFunction(member)" class="danger-action">
                            <span class="material-icons action-icon danger-icon">person_remove</span>
                            <span>Remover membro</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="church-empty" v-if="!loadingMembers && membersList.length <= 0">
                <span class="material-icons empty-icon">group_off</span>
                <h5>Nenhum membro encontrado</h5>
                <p>Tente buscar por um nome diferente ou convide novos membros para a sua igreja.</p>
            </div>
        </div>

        <div class="member-more-actions-wrapper" v-if="showMemberMoreActions" v-on:click="closeMemberMoreActions()"></div>

        <Transition name="modal-fade">
            <modal v-if="showModal && canManageChurch" :title="modalTitle" @closeModal="close_modal()" class="modal" @cancelEvent="cancelChanges()" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
                <inviteMemberModalContent v-if="inviteMember" @success="handleInviteSuccess()" />
                <addTagModalContent v-if="addTag" :member="selected_member" @success="handleMembersChanged()" />
                <addFunctionModalContent v-if="addOccupation" :member="selected_member" @success="handleMembersChanged()" />
                <removeMemberModalContent v-if="removeMember" :member="selected_member" @success="handleMembersChanged()" />
                <Transition name="modal-fade">
                    <modal v-if="showConfirmDeleteInvite && canManageChurch" title="Excluir Convite" @closeModal="showConfirmDeleteInvite = false" class="modal" @cancelEvent="showConfirmDeleteInvite = false" button2Title="Não, cancelar" buttonTitle="Sim, excluir" @submitEvent="submitDeleteInvite()">
                        <div class="confirm-delete-box">
                            <p class="warning-text">Tem certeza que deseja excluir este convite?</p>
                            <p>O convite enviado para o e-mail <strong>{{ selectedInviteToDelete?.email_usuario }}</strong> será invalidado.</p>
                        </div>
                    </modal>
                </Transition>
            </modal>
        </Transition>
    </div>
</template>

<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import modal from "./modal.vue";
import inviteMemberModalContent from "./inviteMemberModalContent.vue";
import addTagModalContent from "./addTagModalContent.vue";
import removeMemberModalContent from "./removeMemberModalContent.vue";
import addFunctionModalContent from "./addFunctionModalContent.vue";

export default {
    name: "membersList",
    mixins: [globalMethods],
    data() {
        return {
            inviteMember: false,
            addTag: false,
            addOccupation: false,
            removeMember: false,
            idUsuarioInChange: null,
            selected_member: {},
            findUsers: "",
            copy_members: [],
            pendingInvites: [],
            canManageChurch: false,
            loadingMembers: false,
            default_avatar: api.defaults.baseURL + "/public/user-default-image.png",
            showConfirmDeleteInvite: false,
            selectedInviteToDelete: null
        }
    },
    computed: {
        membersList: function () {
            return Array.isArray(this.copy_members) ? this.copy_members : [];
        },
        pendingInvitesList: function () {
            return Array.isArray(this.pendingInvites) ? this.pendingInvites : [];
        },
        membersSubtitle: function () {
            const count = this.membersList.length;
            const suffix = count === 1 ? "cadastrado" : "cadastrados";
            return `${this.returnMembersText(count)} ${suffix}`;
        }
    },
    components: {
        modal,
        inviteMemberModalContent,
        addTagModalContent,
        addFunctionModalContent,
        removeMemberModalContent
    },
    methods: {
        getSourceMembers: function () {
            return this.igreja && Array.isArray(this.igreja.membros) ? this.igreja.membros : [];
        },
        filterMembers: function () {
            const members = this.getSourceMembers();
            const search = this.findUsers.trim().toLowerCase();

            if (search.length == 0) {
                this.copy_members = members;
                return;
            }

            this.copy_members = members.filter((membro) => {
                return String(membro.nome_usuario || "").toLowerCase().indexOf(search) != -1;
            });
        },
        resetVariables: function (string) {
            this.inviteMember = false;
            this.addTag = false;
            this.removeMember = false;
            this.addOccupation = false;
            switch (string) {
                case "addTag":
                    this.addTag = true;
                    break;
                case "invite":
                    this.inviteMember = true;
                    break;
                case "remove":
                    this.removeMember = true;
                    break;
                case "addOccupation":
                    this.addOccupation = true;
                    break;
            }
        },
        cancelChanges: function () {
            this.idUsuarioInChange = null;
            this.closeModal();
        },
        removeMemberFunction: function (member) {
            this.closeMemberMoreActions();
            this.idUsuarioInChange = member.id_usuario;
            this.selected_member = member;
            this.showModal = true;
            this.modalTitle = "Remover membro";
            this.modalButtonTitle = "Sim, remover";
            this.modalButton2Title = "Não, cancelar";
            this.resetVariables("remove");
        },
        addTagFunction: function (member) {
            this.closeMemberMoreActions();
            this.idUsuarioInChange = member.id_usuario;
            this.showModal = true;
            this.modalTitle = "Atribuir tag";
            this.modalButtonTitle = "Salvar";
            this.modalButton2Title = "Cancelar";
            this.selected_member = member;
            this.resetVariables("addTag");
        },
        addOccupationFunction: function (member) {
            this.closeMemberMoreActions();
            this.idUsuarioInChange = member.id_usuario;
            this.showModal = true;
            this.modalTitle = "Atribuir função";
            this.modalButtonTitle = "Salvar";
            this.modalButton2Title = "Cancelar";
            this.selected_member = member;
            this.resetVariables("addOccupation");
        },
        addMember: function () {
            this.showModal = true;
            this.modalTitle = "Convidar membro";
            this.modalButtonTitle = "Convidar";
            this.modalButton2Title = "";
            this.resetVariables("invite");
        },
        fillCopyUsers: function () {
            this.copy_members = this.getSourceMembers();
        },
        openMemberMoreActions: function (member_id) {
            this.closeMemberMoreActions();
            this.idUsuarioInChange = member_id;
            $("#member-" + member_id + " .member-more-actions").css("display", "block");
            setTimeout(() => {
                $("#member-" + member_id + " .member-more-actions").css("opacity", "1");
                this.showMemberMoreActions = true;
            }, 50);
        },
        closeMemberMoreActions: function () {
            $(".member-more-actions").css("opacity", "0");
            $(".member-more-actions").css("display", "none");
            this.showMemberMoreActions = false;
        },
        loadChurchMembers: function () {
            const churchId = this.getCurrentChurchId();

            if (!churchId) {
                this.fillCopyUsers();
                return Promise.resolve();
            }

            this.loadingMembers = true;
            this.canManageChurch = this.haveAdminPermission;

            return api.post("/igreja/retorna-membros", { id_igreja: churchId })
                .then((response) => {
                    if (response.data && response.data.returnObj) {
                        this.copy_members = response.data.returnObj;
                    }
                    return api.post("/igreja/retorna-convites-pendentes", { id_igreja: churchId })
                        .then((response) => {
                            this.pendingInvites = response.data.returnObj || [];
                        })
                        .catch(() => {
                            this.pendingInvites = [];
                        });
                })
                .catch((err) => {
                    console.error(err);
                })
                .finally(() => {
                    this.loadingMembers = false;
                });
        },
        returnPendingInvites: function () {
            const churchId = this.getCurrentChurchId();
            if (!churchId) return;
            return api.post("/igreja/retorna-convites-pendentes", { id_igreja: churchId })
                .then((response) => {
                    this.pendingInvites = response.data.returnObj || [];
                })
                .catch(() => {
                    this.pendingInvites = [];
                });
        },
        deleteInvite: function (invite) {
            this.selectedInviteToDelete = invite;
            this.showConfirmDeleteInvite = true;
        },
        submitDeleteInvite: function () {
            const churchId = this.getCurrentChurchId();
            const invite = this.selectedInviteToDelete;

            if (!churchId || !invite || !invite.id) {
                return;
            }

            api.post("/igreja/deletar-convite", {
                id_igreja: churchId,
                id_convite: invite.id
            }).then(() => {
                this.showConfirmDeleteInvite = false;
                this.selectedInviteToDelete = null;
                this.returnPendingInvites();
            });
        },
        handleInviteSuccess: function () {
            this.closeModal();
            this.returnPendingInvites();
        },
        handleMembersChanged: function () {
            this.closeModal();
            this.loadChurchMembers();
            this.returnPendingInvites();
        }
    },
    watch: {
        findUsers: function () {
            this.filterMembers();
        }
    },
    mounted: function () {
        this.fillCopyUsers();
        this.loadChurchMembers();
    }
};
</script>

<style scoped>
.members-page-container {
    padding-bottom: 7rem;
    animation: fadeIn var(--transition-normal);
}

.members-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
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

.add-member-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-pill);
    border: none;
    background: var(--primary-primary-blue-high-2);
    color: var(--neutral-white);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
    transition: transform var(--transition-fast), background var(--transition-fast);
}

.add-member-btn:hover {
    background: var(--primary-primary-blue-high);
    transform: scale(1.05);
}

.add-member-btn:active {
    transform: scale(0.95);
}

.member-search-container {
    position: relative;
    margin-bottom: 1.5rem;
}

#search-member {
    padding-left: 46px;
}

.search-bar-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    font-size: 20px;
}

.pending-invites-section {
    margin-bottom: 1.5rem;
    padding: 14px;
    border: 1px solid rgba(56, 182, 255, 0.16);
    border-radius: var(--radius-md);
    background: rgba(56, 182, 255, 0.04);
}

.pending-invites-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.pending-invites-header h4 {
    margin: 0 0 3px;
    color: var(--neutral-white);
    font-size: var(--font-size-3);
    font-weight: 700;
}

.pending-invites-header p {
    margin: 0;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-4);
}

.pending-count {
    min-width: 30px;
    height: 30px;
    padding: 0 9px;
    border-radius: var(--radius-pill);
    background: var(--secondary-blue-soft-2);
    color: var(--secondary-blue-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-4);
    font-weight: 700;
}

.pending-invites-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.pending-invite-card {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.03);
}

.pending-invite-avatar {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-pill);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: rgba(56, 182, 255, 0.12);
    color: var(--secondary-blue-soft);
}

.pending-invite-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.pending-invite-content {
    min-width: 0;
    flex: 1;
}

.pending-invite-main h5 {
    margin: 0 0 2px;
    color: var(--neutral-white);
    font-size: var(--font-size-4);
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pending-invite-main p {
    margin: 0;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pending-invite-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 11px;
    color: var(--neutral-gray-medium);
}

.delete-invite-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-sm);
    background: rgba(241, 76, 76, 0.1);
    color: var(--others-red);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-fast), transform var(--transition-fast);
}

.delete-invite-btn:hover {
    background: rgba(241, 76, 76, 0.18);
    transform: scale(1.04);
}

.members-list-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.member-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    box-shadow: var(--card-shadow);
    transition: transform var(--transition-fast), border-color var(--transition-fast);
}

.member-avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 2px solid var(--primary-primary-blue-high-2);
    flex-shrink: 0;
}

.member-info-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-width: 0;
}

.member-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.member-name {
    font-size: var(--font-size-3);
    font-weight: 600;
    color: var(--neutral-white);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-occupations {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
}

.member-tag-chip {
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
    border-radius: var(--radius-pill);
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 600;
}

.more-actions-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--neutral-gray-medium);
    width: 36px;
    height: 36px;
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background var(--transition-fast), color var(--transition-fast);
}

.more-actions-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--neutral-white);
}

.member-more-actions {
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-50%);
    background: var(--primary-bg-light);
    border: 1px solid var(--card-border);
    padding: 6px;
    border-radius: var(--radius-md);
    box-shadow: var(--card-shadow);
    transition: opacity var(--transition-fast);
    z-index: 12;
    display: none;
    opacity: 0;
    width: 170px;
}

.member-more-actions ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.member-more-actions ul li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--transition-fast);
    font-size: var(--font-size-4);
    color: var(--neutral-white);
}

.member-more-actions ul li:hover {
    background: rgba(255, 255, 255, 0.08);
}

.member-more-actions ul li.danger-action:hover {
    background: rgba(241, 76, 76, 0.15);
}

.action-icon {
    font-size: 16px;
    color: var(--secondary-blue-soft);
}

.action-icon.danger-icon {
    color: var(--others-red);
}

.member-more-actions-wrapper {
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background: transparent;
    cursor: pointer;
    z-index: 11;
}

.church-empty {
    margin-top: 1rem;
    text-align: center;
    padding: 2rem 1rem;
    border: 1.5px dashed rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.01);
}

@media (max-width: 480px) {
    .member-avatar {
        width: 40px;
        height: 40px;
    }

    .pending-invite-card {
        align-items: flex-start;
    }
}

.confirm-delete-box {
    padding: 10px 0;
    font-size: var(--font-size-4);
    line-height: 1.5;
    color: var(--neutral-white);
}

.confirm-delete-box .warning-text {
    color: var(--others-red);
    font-weight: 700;
    margin-bottom: 12px;
}

.confirm-delete-box .helper-text {
    margin-top: 10px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}
</style>
