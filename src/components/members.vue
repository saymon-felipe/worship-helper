<template>
    <div class="members-page-container">
        <!-- Header -->
        <div class="members-header">
            <div class="header-titles">
                <h3>Membros da Igreja</h3>
                <p class="subtitle">{{ returnMembersText(copy_members.length) }} cadastrados</p>
            </div>
            <button class="add-member-btn" v-on:click="addMember()" v-if="haveAdminPermission" title="Convidar novo membro">
                <span class="material-icons">person_add</span>
            </button>
        </div>

        <!-- Search Bar -->
        <div class="member-search-container">
            <span class="material-icons search-bar-icon">search</span>
            <input type="text" name="search_member" id="search-member" v-model="findUsers" placeholder="Buscar membros pelo nome...">
        </div>

        <!-- Members List -->
        <div class="members-list-grid">
            <div class="member-card" :id="'member-' + member.id_usuario" v-for="(member, index) in copy_members" v-bind:key="index">
                <img :src="member.imagem_usuario" class="member-avatar" :alt="member.nome_usuario">
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
                    <button class="more-actions-btn" v-on:click.stop="openMemberMoreActions(member.id_usuario)" v-if="haveAdminPermission" title="Opções do membro">
                        <span class="material-icons">more_vert</span>
                    </button>
                </div>

                <!-- Dropdown actions list -->
                <div class="member-more-actions" v-if="haveAdminPermission">
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

            <div class="church-empty" v-if="copy_members.length <= 0">
                <span class="material-icons empty-icon">group_off</span>
                <h5>Nenhum membro encontrado</h5>
                <p>Tente buscar por um nome diferente ou convide novos membros para a sua igreja.</p>
            </div>
        </div>

        <div class="member-more-actions-wrapper" v-if="showMemberMoreActions" v-on:click="closeMemberMoreActions()"></div>

        <!-- Dialog modal drawer -->
        <modal v-if="showModal && haveAdminPermission" :title="modalTitle" @closeModal="close_modal()" class="modal" @cancelEvent="cancelChanges()" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
            <inviteMemberModalContent v-if="inviteMember" @success="closeModal()" />
            <addTagModalContent v-if="addTag" :member="selected_member" @success="closeModal(); fillCopyUsers();" /> 
            <addFunctionModalContent v-if="addOccupation" :member="selected_member" @success="closeModal(); fillCopyUsers();" /> 
            <removeMemberModalContent v-if="removeMember" :member="selected_member" @success="closeModal()" />
        </modal>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
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
            copy_members: []
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
        filterMembers: function () {
            if (this.findUsers.trim().length == 0) {
                this.copy_members = this.igreja.membros;
                return;
            }

            this.copy_members = this.igreja.membros.filter((membro) => {
                if (membro.nome_usuario.toLowerCase().indexOf(this.findUsers.toLowerCase()) != -1) {
                    return membro;
                }
            })
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
            this.modalButton2Title = "";
            this.selected_member = member;
            this.resetVariables("addTag");
        },
        addOccupationFunction: function (member) {
            this.closeMemberMoreActions();
            this.idUsuarioInChange = member.id_usuario;
            this.showModal = true;
            this.modalTitle = "Atribuir função";
            this.modalButtonTitle = "Salvar";
            this.modalButton2Title = "";
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
            this.copy_members = this.igreja.membros;
        }
    },
    watch: {
        findUsers: function () {
            this.filterMembers();
        }
    },
    mounted: function () {
        this.fillCopyUsers();
    }
}
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

/* Search input styling */
.member-search-container {
    position: relative;
    margin-bottom: 1.5rem;
}

#search-member {
    padding-left: 46px; /* Abre espaço para o ícone */
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

/* Grid of members cards */
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

/* Redesign drop down menu */
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
}
</style>
