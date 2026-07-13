<template>
    <div class="invite-member-container">
        <form action="invite-member" @submit.prevent="inviteMember()">
            <div class="input-group">
                <label for="invite-member-input">Usuário ou e-mail</label>
                <input type="text" name="invite_member" id="invite-member-input" placeholder="Digite o nome ou e-mail do membro" v-model="searchParam" :disabled="sendingInvite">
                <selectedMember :selected_member="selected_member" @removeUser="clearSelectedMember()" />
                <autoComplete :search="searchParam" v-if="searchParam != '' && !sendingInvite" @selectUser="select_user($event)" @emptySearch="showAutocompleteError($event)"></autoComplete>
                <small class="invite-helper">Se a pessoa ainda não tiver conta, digite o e-mail para enviar o convite.</small>
            </div>

            <div class="invite-loading" v-if="sendingInvite">
                <span class="material-icons rotating">sync</span>
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
        getErrorMessage: function (error, fallback = "Não foi possível concluir a ação") {
            const data = error && error.response ? error.response.data : error;

            if (typeof data === "string") {
                return data;
            }

            if (data && typeof data === "object") {
                return data.error || data.message || fallback;
            }

            return fallback;
        },
        showAutocompleteError: function (message) {
            this.showResponse(message || "Nenhum usuário encontrado", ".response", "error");
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
                id_igreja: self.getCurrentChurchId()
            };

            if (self.selected_member.id_usuario != null) {
                data.id_usuario = Number(self.selected_member.id_usuario);
            } else {
                data.email_usuario = typedValue;
            }

            api.post("/igreja/envia-convite", data)
            .then(function (response) {
                self.showResponse(response.data.message, ".response", "success");
                self.$emit("success", true);
            })
            .catch(function (error) {
                const message = self.getErrorMessage(error, "Não foi possível enviar o convite");
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
    justify-content: center;
    gap: 12px;
    margin-top: 1.5rem;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    color: var(--secondary-blue-soft);
    font-size: var(--font-size-4);
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: fadeIn var(--transition-normal);
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
