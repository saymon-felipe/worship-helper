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
            <button class="create-new-tag" v-on:click="goToLibrary()">
                <span class="material-icons">add</span>
            </button>
        </div>
        <div class="music-list">
            <musicComponent v-for="(music, index) in musics" :key="index" :music="music"></musicComponent>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import musicComponent from "./musicComponent.vue";

export default {
    name: "churchMusic",
    mixins: [globalMethods],
    data() {
        return {
            igreja: {},
            musics: [
                {
                    id: 0,
                    image: "https://www.staccatoescolademusica.com.br/img/blog-img/upload-blog/540752-5-2-2021-16-31-36-1m.jpg",
                    name: "Eu quero conhecer Jesus",
                    artist: "Alessando vilas boas",
                    tags: [
                        {
                            id: 0,
                            name: "#worship"
                        },
                        {
                            id: 1,
                            name: "#pop"
                        }
                    ]
                },
                {
                    id: 1,
                    image: "https://i.scdn.co/image/ab67616d0000b27310fb0a45e54936b489b3bbf0",
                    name: "Dançar na chuva",
                    artist: "Fernandinho",
                    tags: [
                        {
                            id: 0,
                            name: "#jovem"
                        },
                        {
                            id: 1,
                            name: "#rock"
                        }
                    ]
                }
            ]
        }
    },
    methods: {
        goToLibrary: function () {
            this.$router.push("/home/music-library");
        }
    },
    mounted: function () {
        this.checkPermission().then(() => {
            this.igreja = this.$root.igreja;
        });
    },
    components: {
        musicComponent
    }
}
</script>
<style scoped>

</style>