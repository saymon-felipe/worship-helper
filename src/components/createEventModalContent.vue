<template>
    <div class="create-event-modal-content inner-modal-container">
        <form id="new-event-form" @submit.prevent="createEvent()">
            <div class="event-date">
                <h5>Dia</h5>
                <input type="datetime-local" class="input" name="event_date" id="event-date-input" required>
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
                <div class="member-input-group">
                    <input type="text" class="input" name="invite_member" id="invite-member-input" placeholder="Usuário" v-if="inviteMember" v-model="searchParam">
                    <selectedMember :selected_member="selected_member" @removeUser="restoreInputLabel('#invite-member-input', 'Usuário')" />
                    <autoComplete :search="searchParam" v-if="searchParam != ''" @selectUser="select_user($event); submitUserButton = true;"></autoComplete>
                    <autoComplete :search="''" v-if="addTag" :isFunction="true" :igreja="igreja" @selectFunction="select_function($event); pushToObjectAndReset();"></autoComplete>
                    <button type="button" v-if="submitUserButton" class="btn primary submit-user-button" v-on:click="inviteMemberToEvent()">
                        <span class="material-icons">done</span>
                    </button>
                </div>
                <div class="members-list">
                    <selectedEventMember :member="member" v-for="(member, index) in event_selected_members" :key="index" @removeUser="removeMember($event)" />
                </div>
            </div>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import autoComplete from "./autoComplete.vue";
import selectedEventMember from "./selectedEventMember.vue";
import selectedMember from "./selectedMember.vue";
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';

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
            selected_tag: {},
            event_selected_members: [],
            igreja: {}
        }
    },
    methods: {
        createEvent: function () {
            if (this.event_selected_members.length == 0) {
                this.showResponse("Nenhum membro selecionado", ".response", "error");
                return;
            }

            let data = $("#new-event-form").serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["event_members"] = this.event_selected_members;

            console.log(data)
        },
        removeMember: function (member_id) {
            this.event_selected_members = this.event_selected_members.filter(member => member.id_usuario != member_id);
        },
        pushToObjectAndReset: function () {
            this.submitUserButton = false;
            this.inviteMember = false;

            let member = {...this.selected_member, ...this.selected_function};

            if (this.event_selected_members.length == 0) {
                this.event_selected_members.push(member);
            }

            for (let i = 0; i < this.event_selected_members.length; i++) {
                if (this.event_selected_members[i].id_usuario != member.id_usuario) {
                    this.event_selected_members.push(member);
                }
            }

            this.selected_member = {
                id_usuario: null,
                imagem_usuario: "",
                nome_usuario: ""
            }

            this.selected_function = {};
            this.addTag = false;
        },
        inviteMemberFunction: function() {
            this.inviteMember = !this.inviteMember;
        },
        inviteMemberToEvent: function () {
            this.submitUserButton = false;
            this.addTag = true;
        }
    },
    components: {
        autoComplete,
        selectedEventMember,
        selectedMember
    },
    mounted: function () {
        this.checkPermission().then(() => {
            this.igreja = this.$root.igreja;
        });
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
    margin-top: 1rem;
}

.submit-user-button {
    position: absolute;
    width: 50px;
    height: 48px;
    margin-left: 1rem;
}

.member-input-group {
    position: relative;
}
</style>