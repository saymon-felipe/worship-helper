<template>
    <div class="music-container">
        <musicComponent :music="music"></musicComponent>
        <div class="youtube-video">
            <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + music.video_id" frameborder="0" allowfullscreen />
        </div>
        <div class="music-votes">
            
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import musicComponent from "./musicComponent.vue";

export default {
    name: "musicEntity",
    mixins: [globalMethods],
    data() {
        return {
            music: {}
        }
    },
    components: {
        musicComponent
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
        }
    },
    mounted: function () {
        this.getMusic();
    }
}
</script>
<style scoped>
    #ytplayer {
        height: 40vh;
        max-height: 250px;
    }
</style>