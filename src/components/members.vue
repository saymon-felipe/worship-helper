<template>
    <div class="members-container">
        <div class="members-header">
            <h5>{{ havePermission ? 'Gerenciar' : 'Ver' }} membros</h5>
            <span class="material-icons add-member-button" v-on:click="addMember()" v-if="havePermission">add</span>
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
                    <span class="material-icons" id="member-more-actions" v-on:click="openMemberMoreActions(member.id_usuario)" v-if="havePermission">more_vert</span>
                </div>
                <div class="member-more-actions" v-if="havePermission">
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
        <modal v-if="showModal && havePermission" :title="modalTitle" @closeModal="close_modal()" class="modal" @cancelEvent="cancelChanges()" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
            <inviteMemberModalContent v-if="inviteMember" :igreja="$root.igreja" @success="closeModal()" />
            <addTagModalContent v-if="addTag" :igreja="$root.igreja" :member="selected_member" @success="closeModal(); fillCopyUsers();" /> 
            <addFunctionModalContent v-if="addOccupation" :igreja="$root.igreja" :member="selected_member" @success="closeModal(); fillCopyUsers();" /> 
            <removeMemberModalContent v-if="removeMember" :igreja="$root.igreja" :member="selected_member" @success="closeModal()" />
        </modal>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';
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
            showMemberMoreActions: false,
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
                this.copy_members = this.$root.igreja.membros;
                return;
            }
            
            this.copy_members = this.$root.igreja.membros.filter((membro) => {
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
        closeMemberMoreActions: function () {
            let elements = $(".member-more-actions");
            this.showMemberMoreActions = false;
            elements.each(function (index, element) {
                element.style.opacity = 0;
                setTimeout(() => {
                    element.style.display = "none";
                }, 400);
            })
        },
        openMemberMoreActions: function (element_id) {
            let element = $("#member-" + element_id + " .member-more-actions");
            this.showMemberMoreActions = true;
            element.show();
            setTimeout(() => {
                element.css("opacity", 1);
            }, 10);
        },
        returnOccupations: function (funcoes_usuario) {
            let occupations = "";
            for (let i = 0; i < funcoes_usuario.length; i++) {
                occupations += funcoes_usuario[i].nome_funcao;
                if (funcoes_usuario.length > 1 && i == funcoes_usuario.length - 2) {
                    occupations += " e ";
                } else if (i < funcoes_usuario.length - 1) {
                    occupations += ", ";
                }
            }
            return occupations;
        },
        fillCopyUsers: function () {
            let self = this;

            this.checkPermission().then(() => {
                self.copy_members = self.$root.igreja.membros;
            });
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

.member-more-actions-wrapper {
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    background: transparent;
    cursor: pointer;
}

.member-informations {
    display: flex;
    justify-content: space-between;
    margin-left: 1rem;
    width: 100%;
}

.member-more-actions {
    position: absolute;
    right: 3rem;
    background: var(--primary-primary-blue-high-2);
    padding: .5rem;
    border-radius: 10px;
    transition: all 0.4s;
    opacity: 0;
    display: none;
    z-index: 2;
}

    .member-more-actions ul {
        display: flex;
        flex-direction: column;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
    }

        .member-more-actions ul li {
            cursor: pointer;
            margin: 2px 0;
            width: 100%;
            text-align: center;
            padding: 4px 10px;
            transition: all 0.4s;
        }

            .member-more-actions ul li:hover {
                background: var(--primary-primary-blue-medium);
            }
</style>