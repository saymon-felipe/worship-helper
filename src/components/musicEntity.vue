<template>
    <div class="music-container">
        <musicComponent :music="music"></musicComponent>
        <div class="music-content">
            <button class="btn primary" v-on:click="openCipherContainer()">Ver cifra</button>
            <div class="youtube-video">
                <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + music.video_id" frameborder="0" allowfullscreen />
            </div>
        </div>
        <div class="class-music-cipher" v-if="showCipherContainer">
            <button class="btn" v-on:click="closeCipherContainer()">Voltar</button>
            <iframe id="cc" width="100%" height="100%" :src="music.cipher_url" frameborder="0" allowfullscreen />
        </div>
        
        <div class="music-votes">
            
        </div>
        <div class="music-comments" v-if="music.id != undefined">
            <commentsComponent type="musica" :id_musica="music.id"></commentsComponent>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import musicComponent from "./musicComponent.vue";
import commentsComponent from "./commentsComponent.vue";

export default {
    name: "musicEntity",
    mixins: [globalMethods],
    data() {
        return {
            music: {},
            showCipherContainer: false
        }
    },
    components: {
        musicComponent,
        commentsComponent
    },
    methods: {
        selectVideo: function () {
            this.playVideo = true;
        },
        getMusic: function () {
            let self = this;

            api.get("/musicas/" + self.$route.params.id_musica)
                .then(function (response) {
                    self.music = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        closeCipherContainer: function () {
            this.showCipherContainer = false;
        },
        openCipherContainer: function () {
            this.showCipherContainer = true;
        }
    },
    mounted: function () {
        this.getMusic();
    }
}
</script>
<style scoped>
    .youtube-video {
        margin-top: 1rem;
        border-radius: 10px;
        overflow: hidden;
        height: 40vh;
        max-height: 250px;
    }

    .class-music-cipher {
        height: 100vh;
        background: var(--primary-primary-blue-low);
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        padding-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center
    }

        .class-music-cipher iframe {
            background-color: white;
        }

        .class-music-cipher button {
            margin-bottom: 15px;
        }
</style>