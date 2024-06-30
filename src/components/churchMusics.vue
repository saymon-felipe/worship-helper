<template>
    <div class="church-music">
        <div class="church-profile">
            <img :src="igreja.imagem_igreja" class="avatar-p">
            <div class="church-informations">
                <h5>{{ igreja.nome_igreja }}</h5>
                <p class="font-size-3">{{ returnMembersText(igreja.quantidade_membros) }}</p>
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
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
            <createMusicModalContent @success="closeModal()" />
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
            igreja: {},
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
            this.modalButtonTitle = "Adicionar música";
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
        this.checkPermission().then(() => {
            this.igreja = this.$root.igreja;
        });

        this.checkAppPermission();
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