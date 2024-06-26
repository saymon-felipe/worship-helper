<template>
    <div class="remove-member-container">
        <h5>Tem certeza que deseja remover o membro</h5>
        <ul>
            <li>
                <h5>{{ member.nome_usuario }}</h5>
            </li>
        </ul>
        <p class="response">{{ response }}</p>
        <button class="hide" v-on:click="removeMember()" id="submit-informations-form"></button>
        <button class="hide" v-on:click="cancelRemoveMember()"></button>
    </div>    
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';

export default {
    name: "removeMemberModalContent",
    props: ["member", "igreja"],
    mixins: [globalMethods],
    data() {
        return {
            response: ""
        }
    },
    methods: {
        cancelRemoveMember: function () {
            this.$emit("success", true);
        },
        removeMember: function () {
            let self = this;
            let data = {
                id_usuario: self.member.id_usuario,
                id_igreja: self.igreja.id_igreja
            }

            api.post("/igreja/remover-membro", data)
                .then(function (response) {
                    console.log(response)
                    this.$emit("success", true);
                })
                .catch(function (error) {
                    self.showResponse(error.response.data.message, ".response", "error");
                })
        }
    }
}
</script>
<style scoped>
.remove-member-container {
    padding: 1rem;
}
</style>