<template>
    <div class="register-church-container">
        <div class="registered-churches">
            <h3>Igrejas cadastradas</h3>
            <div v-for="(church, index) in igrejas" :key="index" class="church" v-on:click="showChurchMembers(church)">
                <img :src='church.imagem_igreja' class="avatar-p">
                <div class="church-informations">
                    <h5>{{church.nome_igreja}}</h5>
                    <p class="font-size-3">{{returnMembersText(church.quantidade_membros)}}</p>
                </div>
            </div>
            <div class="background-button">
                <button class="btn primary register-church" v-on:click="openRegisterChurchModal()">Cadastrar igreja</button>
            </div>
        </div>
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
            <registerChurchModalContent v-if="registerChurch" @success="closeModal()" />
            <viewChurchModalContent v-if="viewChurch" @church="church" />
        </modal>
    </div>
</template>
<script>
import modal from "./modal.vue";
import $ from 'jquery';
import { globalMethods } from '../js/globalMethods';
import registerChurchModalContent from "./registerChurchModalContent.vue";
import viewChurchModalContent from "./viewChurchModalContent.vue";

export default {
    name: "registerChurch",
    mixins: [globalMethods],
    data() {
        return {
            showModal: false,
            igrejas: {},
            modalTitle: "",
            modalButtonTitle: "",
            modalButton2Title: "",
            modalContent: "",
            registerChurch: false,
            viewChurch: false
        }
    },
    methods: {
        returnMembersText: function (count) {
            let membersText = "membro";
            if (count > 1) {
                membersText = "membros";
            }
            return count + " " + membersText;
        },
        openRegisterChurchModal: function () {
            let self = this;
            self.modalTitle = "Cadastrar igreja";
            self.modalButtonTitle = "Cadastrar igreja";
            self.toggleRegisterOrShowChurch("registerChurch");
            self.showModal = true;
            setTimeout(() => {
                $("#church-name").focus();
            }, 100);
        },
        showChurchMembers: function (church) {
            let self = this;
            self.modalTitle = church.nome_igreja;
            self.modalButtonTitle = "";
            self.toggleRegisterOrShowChurch("viewChurch");
            self.showModal = true;
        },
        toggleRegisterOrShowChurch: function (variable) {
            this.registerChurch = false;
            this.viewChurch = false;

            if (variable == "registerChurch") {
                this.registerChurch = true;
                return;
            }
            this.viewChurch = true;
            return;
        }
    },
    components: {
        modal,
        registerChurchModalContent,
        viewChurchModalContent
    },
    mounted: function () {
        this.listAllChurches();
    }
}
</script>
<style scoped>
.registered-churches {
    color: var(--neutral-white);
}

.register-church-container {
    margin-bottom: 5rem;
}
</style>