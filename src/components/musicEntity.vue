<template>
    <div class="music-container">
        <div class="music-header">
            <musicComponent :music="music"></musicComponent>
            <div class="music-tone" v-if="event_id != 0">
                {{ music.tom }}
            </div>
        </div>
        <div class="music-content">
            <button class="btn primary" v-on:click="openCipherContainer()">Ver cifra</button>
            <div class="youtube-video">
                <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + music.video_id" frameborder="0" allowfullscreen />
            </div>
        </div>
        <div class="music-cipher" v-if="showCipherContainer">
            <button class="btn" v-on:click="closeCipherContainer()">Voltar</button>
            <div class="music-tone" v-if="event_id != 0">
                Tom: {{ music.tom }}
            </div>
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
            showCipherContainer: false,
            event_id: 0
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

            let data = {
                event_id: this.event_id
            }

            api.post("/musicas/retorna_musica/" + self.$route.params.id_musica, data)
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
        },
        getParams: function () {
            let url = new URLSearchParams(window.location.search);
            let event = url.get("event");

            if (event != null && event != "") {
                this.event_id = event;
            }
        }
    },
    mounted: function () {
        this.getParams();
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

    .music-cipher {
        height: 100vh;
        background: var(--primary-primary-blue-low);
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        padding-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 2;
    }

        .music-cipher iframe {
            background-color: white;
        }

        .music-cipher button {
            margin-bottom: 15px;
        }

        .music-cipher .music-tone {
            position: fixed;
            right: 1rem;
            top: 5rem;
            width: 115px;
            border-radius: 20px;
        }

.music-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>