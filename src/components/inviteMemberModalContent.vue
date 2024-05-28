<template>
    <div class="invite-member-container">
        <form action="invite-member" @submit.prevent="inviteMember()">
            <div class="input-group">
                <label for="invite-member-input">Usuário</label>
                <input type="text" class="input" name="invite_member" id="invite-member-input" placeholder="Usuário" v-model="searchParam">
                <selectedMember :selected_member="selected_member" @removeUser="restoreInputLabel('#invite-member-input', 'Usuário')" />
                <autoComplete :search="searchParam" v-if="searchParam != ''" @selectUser="select_user($event)"></autoComplete>
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
    props: ["igreja"],
    data() {
        return {
            searchParam: "",
            selected_member: {
                id_usuario: null,
                imagem_usuario: "",
                nome_usuario: ""
            },
            response: ""
        }
    },
    methods: {
        inviteMember: function () {
            let self = this;
            let response = $(".response");
            response.removeClass("error");
            self.response = "";

            if (self.selected_member.id_usuario == null) {
                self.showResponse("Usuário inválido", ".response", "error");
                return;
            }

            let data = {
                id_usuario: self.selected_member.id_usuario,
                id_igreja: self.igreja.id_igreja

            }

            api.post("/igreja/envia-convite", data)
            .then(function (response) {
                self.showResponse(response.data.message, ".response", "success");
                self.$emit("success", true);
            })
            .catch(function (error) {
                self.showResponse(error.response.data.message, ".response", "error");
            })
        }
    },
    components: {
        autoComplete,
        selectedMember
    }
}
</script>
<style scoped>
.response {
    margin-top: 1rem;
}

.invite-member {
    position: relative;
}
</style>