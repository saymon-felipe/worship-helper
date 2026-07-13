<template>
    <div class="invite-member-container">
        <form action="invite-member" @submit.prevent="inviteMember()">
            <div class="input-group">
                <label for="invite-member-input">Usuário ou e-mail</label>
                <input type="text" name="invite_member" id="invite-member-input" placeholder="Digite o nome ou e-mail do membro" v-model="searchParam" :disabled="sendingInvite">
                <selectedMember :selected_member="selected_member" @removeUser="clearSelectedMember()" />
                <autoComplete :search="searchParam" v-if="searchParam != '' && !sendingInvite" @selectUser="select_user($event)"></autoComplete>
                <small class="invite-helper">Se a pessoa ainda não tiver conta, digite o e-mail para enviar o convite.</small>
            </div>

            <div class="invite-loading" v-if="sendingInvite">
                <span class="invite-loading-spinner"></span>
                <span>Enviando convite...</span>
            </div>

            <p class="response">{{ response }}</p>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>

<script>
import autoComplete from "./autoComplete.vue";
import { globalMethods } from '../js/globalMethods';
import selectedMember from "./selectedMember.vue";
import $ from 'jquery';
import api from '../config/api';

export default {
    name: "inviteMemberModalContent",
    mixins: [globalMethods],
    data() {
        return {
            searchParam: "",
            selected_member: {
                id_usuario: null,
                imagem_usuario: "",
                nome_usuario: ""
            },
            response: "",
            sendingInvite: false
        }
    },
    methods: {
        clearSelectedMember: function () {
            if (this.sendingInvite) {
                return;
            }

            this.resetSelectedMember();
            this.searchParam = "";
            this.restoreInputLabel('#invite-member-input', 'Digite o nome ou e-mail do membro');
        },
        isValidEmail: function (value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
        },
        select_user: function (user) {
            if (this.sendingInvite) {
                return;
            }

            this.selected_member = user;
            this.searchParam = "";
            $("#invite-member-input").attr("placeholder", "");
        },
        inviteMember: function () {
            let self = this;

            if (self.sendingInvite) {
                return;
            }

            let response = $(".response");
            response.removeClass("error");
            self.response = "";

            const typedValue = self.searchParam.trim();

            if (self.selected_member.id_usuario == null && !self.isValidEmail(typedValue)) {
                self.showResponse("Selecione um usuário ou informe um e-mail válido", ".response", "error");
                return;
            }

            self.sendingInvite = true;
            self.$emit("loading", true);

            let data = {
                id_usuario: self.selected_member.id_usuario,
                email_usuario: self.selected_member.id_usuario == null ? typedValue : "",
                id_igreja: self.getCurrentChurchId()
            }

            api.post("/igreja/envia-convite", data)
            .then(function (response) {
                self.showResponse(response.data.message, ".response", "success");
                self.$emit("success", true);
            })
            .catch(function (error) {
                const message = error.response && error.response.data ? error.response.data : "Não foi possível enviar o convite";
                self.showResponse(message, ".response", "error");
            })
            .finally(function () {
                self.sendingInvite = false;
                self.$emit("loading", false);
            })
        }
    },
    components: {
        autoComplete,
        selectedMember
    },
    mounted: function () {
        $("#invite-member-input").focus();
        setTimeout(() => {
            const input = $("#invite-member-input")[0];
            if (input) {
                input.scrollIntoView();
            }
        }, 100)
    }
}
</script>

<style scoped>
.invite-member {
    position: relative;
}

.invite-helper {
    display: block;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
    line-height: 1.4;
    margin-top: 6px;
}

.invite-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
    color: var(--secondary-blue-soft);
    font-size: var(--font-size-4);
    font-weight: 600;
}

.invite-loading-spinner {
    width: 18px;
    height: 18px;
    border-radius: var(--radius-pill);
    border: 2px solid rgba(56, 182, 255, 0.22);
    border-top-color: var(--secondary-blue-soft);
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>

