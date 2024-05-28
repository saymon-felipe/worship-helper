<template>
    <div class="create-event-modal-content">
        <div class="event-date">
            <h5>Dia</h5>
            <input type="date" class="input" name="event_date" id="event-date-input">
        </div>
        <div class="event-musics">
            <h5>Músicas</h5>
            <span class="material-icons add-music-button">add</span>
            <div class="music-list">

            </div>
        </div>
        <div class="event-members">
            <h5>Membros</h5>
            <span class="material-icons add-member-button" v-on:click="inviteMemberFunction()">add</span>
            <div class="members-list">

            </div>
            <input type="text" class="input" name="invite_member" id="invite-member-input" placeholder="Usuário" v-if="inviteMember" v-model="searchParam">
            <selectedMember :selected_member="selected_member" @removeUser="restoreInputLabel('#invite-member-input', 'Usuário')" />
            <autoComplete :search="searchParam" v-if="searchParam != ''" @selectUser="select_user($event)"></autoComplete>
            <autoComplete :search="''" v-if="addTag" :isTag="true" :igreja="church" @selectTag="select_tag($event)"></autoComplete>
            <button type="button" v-if="submitUserButton" class="btn primary submit-user-button" v-on:click="inviteMemberToEvent()">
                <span class="material-icons">done</span>
            </button>
        </div>
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
            <createEventModalContent @church="church" @success="closeModal()" />
        </modal>
    </div>
</template>
<script>
import autoComplete from "./autoComplete.vue";
import selectedMember from "./selectedMember.vue";
import { globalMethods } from '../js/globalMethods';

export default {
    name: "createEventModalContent",
    mixins: [globalMethods],
    props: ['church'],
    data() {
        return {
            showModal: false,
            modalTitle: "",
            modalButton2Title: "",
            modalButtonTitle: "",
            searchParam: "",
            inviteMember: false,
            selected_member: {
                id_usuario: null,
                imagem_usuario: "",
                nome_usuario: ""
            },
            submitUserButton: false,
            addTag: false,
            selected_tag: {}
        }
    },
    watch: {
        selected_member: function () {
            this.submitUserButton = true;
        }
    },
    methods: {
        inviteMemberFunction: function() {
            this.inviteMember = !this.inviteMember;
        },
        inviteMemberToEvent: function () {
            this.resetSelectedMember();
            this.submitUserButton = false;
            this.inviteMember = false;
            this.addTag = true;
            this.showModalFunction(true, "Alterar membro", "Alterar membro", "");
        }
    },
    components: {
        autoComplete,
        selectedMember
    }
}
</script>
<style scoped>
.auto-complete {
    top: initial;
}

.add-music-button, .add-member-button {
    font-size: var(--font-size-h2);
    font-weight: bold;
    cursor: pointer;
}

.event-musics {
    margin-top: 2rem;
}

.event-members {
    position: relative;
}

.submit-user-button {
    position: absolute;
    width: 50px;
    height: 48px;
    margin-left: 1rem;
}
</style>