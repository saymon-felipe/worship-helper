<template>
    <div class="church-music">
        <div class="church-profile" v-if="igreja.id_igreja && igreja.id_igreja == getCurrentChurchId()">
            <img :src="igreja.imagem_igreja || default_church_image" class="avatar-p">
            <div class="church-informations">
                <h5>{{ igreja.nome_igreja }}</h5>
                <p v-if="igreja.quantidade_membros !== undefined && igreja.quantidade_membros !== null">
                    <span class="material-icons" style="font-size: 16px;">people</span>
                    <span>{{ returnMembersText(igreja.quantidade_membros) }}</span>
                </p>
            </div>
        </div>
        <div class="configuration-header">
            <h3>Acervo de músicas</h3>
            <button class="create-new-tag" v-on:click="createMusic()" v-if="haveAppPermission">
                <span class="material-icons">add</span>
            </button>
        </div>
        <div class="music-list">
            <musicComponent v-for="(music, index) in musics" :key="index" :music="music"></musicComponent>
        </div>
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm(); returnMusics();">
            <createMusicModalContent @success="closeModal(); returnMusics();" />
        </modal>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import musicComponent from "./musicComponent.vue";
import createMusicModalContent from "./createMusicModalContent.vue";
import modal from "./modal.vue";
import api from '../config/api';

export default {
    name: "churchMusic",
    mixins: [globalMethods],
    data() {
        return {
            musics: []
        }
    },
    methods: {
        goToLibrary: function () {
            this.$router.push("/home/music-library");
        },
        createMusic: function () {
            this.showModal = true;
            this.modalTitle = "Adicionar música";
            this.modalButtonTitle = "";
        },
        returnMusics: function () {
            let self = this;

            api.get("/musicas")
                .then(function (response) {
                    self.musics = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    },
    mounted: function () {
        this.returnMusics();
    },
    components: {
        musicComponent,
        createMusicModalContent,
        modal
    }
}
</script>
<style scoped>

</style>
