<template>
    <div class="members-container">
        <div class="members-header">
            <h5>{{ haveAdminPermission ? 'Gerenciar' : 'Ver' }} membros</h5>
            <span class="material-icons add-member-button" v-on:click="addMember()" v-if="haveAdminPermission">add</span>
        </div>
        <div class="member-search">
            <input type="text" name="search_member" id="search-member" class="input" v-model="findUsers" placeholder="Digite o nome da pessoa">
        </div>
        <div class="members-container">
            <div class="member" :id="'member-' + member.id_usuario" v-for="(member, index) in copy_members" v-bind:key="index">
                <img :src="member.imagem_usuario" class="avatar-pp">
                <div class="member-informations">
                    <div class="informations-container">
                        <h6 class="font-size-3">{{ member.nome_usuario }}</h6>
                        <span>{{ member.funcoes_usuario.length != 0 ? returnOccupations(member.funcoes_usuario) : '' }}</span>
                        <span class="member-tag" v-if="member.tag_usuario.length != 0">{{ member.tag_usuario[0].nome_tag }}</span>
                    </div>
                    <span class="material-icons" id="member-more-actions" v-on:click="openMemberMoreActions(member.id_usuario)" v-if="haveAdminPermission">more_vert</span>
                </div>
                <div class="member-more-actions" v-if="haveAdminPermission">
                    <ul>
                        <li v-on:click="addTagFunction(member)">
                            <span>Atribuir tag</span>
                        </li>
                        <li v-on:click="addOccupationFunction(member)">
                            <span>Atribuir função</span>
                        </li>
                        <li v-on:click="removeMemberFunction(member)">
                            <span>Remover membro</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="member-more-actions-wrapper" v-if="showMemberMoreActions" v-on:click="closeMemberMoreActions()"></div>
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
    name: "members",
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
            this.modalButtonTitle2 = "";
            this.selected_member = member;
            this.resetVariables("addTag");
        },
        addOccupationFunction: function (member) {
            this.closeMemberMoreActions();
            this.idUsuarioInChange = member.id_usuario;
            this.showModal = true;
            this.modalTitle = "Atribuir função";
            this.modalButtonTitle = "Salvar";
            this.modalButtonTitle2 = "";
            this.selected_member = member;
            this.resetVariables("addOccupation");
        },
        addMember: function () {
            this.showModal = true;
            this.modalTitle = "Convidar membro";
            this.modalButtonTitle = "Convidar";
            this.modalButtonTitle2 = "";
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
.member-search {
    position: relative;
}

#search-member {
    width: 100%;
    padding-right: 4rem;
    margin: 1rem 0;
}

#search-member-button {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
}

.members-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

#member-more-actions {
    cursor: pointer;
    font-size: var(--font-size-h2)
}

.add-member-button {
    cursor: pointer;
    font-size: var(--font-size-h2);
}

.member {
    display: flex;
    align-items: center;
    position: relative;
    margin: 1rem 0;
}

.member-informations {
    display: flex;
    justify-content: space-between;
    margin-left: 1rem;
    width: 100%;
}
</style>