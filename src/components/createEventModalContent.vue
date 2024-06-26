<template>
    <div class="create-event-modal-content">
        <div class="event-date">
            <h5>Dia</h5>
            <input type="date" class="input" name="event_date" id="event-date-input">
        </div>
        <div class="event-musics">
            <div class="configuration-header">
                <h5>Músicas</h5>
                <button type="button" class="create-new-tag">
                    <span class="material-icons">add</span>
                </button>
            </div>
            <div class="music-list">

            </div>
        </div>
        <div class="event-members">
            <div class="configuration-header">
                <h5>Membros</h5>
                <button type="button" class="create-new-tag" v-on:click="inviteMemberFunction()">
                    <span class="material-icons">add</span>
                </button>
            </div>
            <div class="members-list">

            </div>
            <input type="text" class="input" name="invite_member" id="invite-member-input" placeholder="Usuário" v-if="inviteMember" v-model="searchParam">
            <selectedMember :selected_member="selected_member" @removeUser="restoreInputLabel('#invite-member-input', 'Usuário')" />
            <autoComplete :search="searchParam" v-if="searchParam != ''" @selectUser="select_user($event)"></autoComplete>
            <autoComplete :search="''" v-if="addTag" :isTag="true" :igreja="$root.igreja" @selectTag="select_tag($event)"></autoComplete>
            <button type="button" v-if="submitUserButton" class="btn primary submit-user-button" v-on:click="inviteMemberToEvent()">
                <span class="material-icons">done</span>
            </button>
        </div>
    </div>
</template>
<script>
import autoComplete from "./autoComplete.vue";
import selectedMember from "./selectedMember.vue";
import { globalMethods } from '../js/globalMethods';

export default {
    name: "createEventModalContent",
    mixins: [globalMethods],
    data() {
        return {
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
            //this.resetSelectedMember();
            this.submitUserButton = false;
            this.inviteMember = false;
            this.addTag = true;
            this.showModalFunction(true, "Alterar membro", "Alterar membro", "");
        }
    },
    components: {
        autoComplete,
        selectedMember
    },
    mounted: function () {
        this.checkPermission();
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