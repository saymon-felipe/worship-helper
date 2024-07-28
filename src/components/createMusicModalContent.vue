<template>
    <div class="create-music inner-modal-container">
        <form id="create-music-form" @submit.prevent="createMusic()">
            <div class="input-group">
                <label for="name">Nome</label>
                <input type="text" name="name" id="name" required>
            </div>
            <div class="input-group">
                <label for="artist">Artista</label>
                <input type="text" name="artist" id="artist" required>
            </div>
            <div class="tags-musica">
                <div class="input-group">
                    <label>Tags</label>
                    <selectMultiple :items="musicTagsList" maxlength="3" @selectedItems="selectTags($event)"></selectMultiple>
                </div>
            </div>
            <button type="button" class="btn primary" id="search-music" v-on:click="searchMusic()">Buscar música</button>
            <div class="music-utilities">
                <div class="searching-music font-size-2" v-if="searchingMusic">Buscando música</div>
                <div class="music-list" v-if="choosingMusic">
                    <div class="youtube-video" v-for="(video, index) in musicList" :key="index" v-on:click="selectVideo(video, index)" :id="'video-' + index">
                        <img :src="video.videoThumbnail">
                        <div class="youtube-video-informations">
                            <p class="font-size-3">{{ video.title }}</p>
                            <p class="font-size-4">{{ relativeTime(video.publishedAt) }}</p>
                        </div>
                    </div>
                    <div class="video-preview" v-if="selectedUrl != '' && playVideo">
                        <div class="preview-buttons">
                            <button class="btn" v-on:click="playVideo = false">Voltar</button>
                            <button class="btn primary" v-on:click="submitVideo()">Selecionar música</button>
                        </div>
                        <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + selectedId" frameborder="0" allowfullscreen />
                    </div>
                </div>
                <div class="cipher-list" v-if="choosingCipher">
                    <div class="loading-ciphers" v-if="cipherList.length == 0">
                        <p class="font-size-3">Carregando cifras</p>
                    </div>
                    <div class="cipher-topic" v-for="(cipher, index) in cipherList" :key="index" v-on:click="selectCipher(cipher.href, index)" :id="'cipher-' + index">
                        <p class="font-size-3">{{ cipher.title }}</p>
                    </div>
                    <div class="cipher-preview" v-if="selectedCipher && viewCipher">
                        <div class="preview-buttons">
                            <button class="btn" v-on:click="viewCipher = false">Voltar</button>
                            <button class="btn primary" v-on:click="submitCipher()">Selecionar cifra</button>
                        </div>
                        <iframe :src="selectedCipherHref" width="100%" height="600px"></iframe>
                    </div>
                </div>
                <div class="all-ready" v-if="!choosingCipher && !choosingMusic">
                    <p class="font-size-3">Música e cifra selecionadas, prossiga com a criação da música.</p>
                </div>
            </div>
            <p class="response">{{ response }}</p>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';
import selectMultiple from "./selectMultiple.vue";

export default {
    name: "createMusicModalContent",
    mixins: [globalMethods],
    data() {
        return {
            searchingMusic: false,
            playVideo: false,
            cipherList: [],
            musicList: [],
            selectedUrl: "",
            selectedId: "",
            choosingMusic: true,
            choosingCipher: false,
            selectedCipher: false,
            selectedCipherHref: "",
            viewCipher: false,
            selectedVideoThumbnail: "",
            musicTags: [],
            musicTagsList: []
        }
    },
    components: {
        selectMultiple
    },
    methods: {
        selectTags: function (event) {
            this.musicTags = event;
        },
        submitVideo: function () {
            this.choosingMusic = false;
            this.playVideo = false;
            this.choosingCipher = true;
            this.selectedId = "";
            
            this.searchCipher();
        },
        submitCipher: function () {
            this.choosingCipher = false;
            this.viewCipher = false;
        },
        selectCipher: function (href, index) {
            this.selectedCipher = true;
            this.viewCipher = true;
            this.selectedCipherHref = href;

            $(".cipher-topic").removeClass("selected");
            $("#cipher-" + index).addClass("selected");
        },
        selectVideo: function (video, index) {
            this.selectedUrl = video.url;
            this.selectedId = video.videoId;
            this.selectedVideoThumbnail = video.videoThumbnail;
            this.playVideo = true;

            $(".youtube-video").removeClass("selected");
            $("#video-" + index).addClass("selected");
        },
        searchCipher: function () {
            let self = this;

            let data = {
                name: $("#name").val(),
                artist: $("#artist").val()
            }

            api.post("/musicas/procurar-cifra", data)
            .then(function (response) {
                self.cipherList = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        searchMusic: function () {
            let self = this;

            let data = {
                name: $("#name").val(),
                artist: $("#artist").val()
            }

            if (!this.haveAppPermission) {
                this.searchMusicInDatabase(data);
            }

            api.post("/musicas/procurar", data)
            .then(function (response) {
                self.musicList = response.data.returnObj;
                self.searchingMusic = false
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        createMusic: function () {
            let self = this;

            let data = {
                name: $("#name").val(),
                artist: $("#artist").val()
            }

            data["video_url"] = this.selectedUrl;
            data["cipher_url"] = this.selectedCipherHref;
            data["video_image"] = this.selectedVideoThumbnail;
            data["music_tags"] = this.musicTags;

            if (this.musicTags.length == 0) {
                this.showResponse("Tags faltando", ".response", "error");
                return;
            }

            if (data.video_url == "" || data.cipher_url == "") {
                this.showResponse("Video ou cifra faltando", ".response", "error");
                return;
            }

            api.post("/musicas", data)
            .then(function () {
                self.$emit("success");
            })
            .catch(function (error) {
                self.showResponse(error.response.data, ".response", "error");
            })
        },
        returnMusicTags: function () {
            let self = this;

            api.get("/musicas/tags")
            .then(function (response) {
                self.musicTagsList = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.returnMusicTags();
    }
}
</script>
<style scoped>
#search-music {
    margin: 1rem 0;
}

.searching-music {
    text-align: center;
    margin-top: 3rem;
}

.youtube-video, .cipher-topic {
    display: flex;
    align-items: center;
    margin: 1rem 0;;
}

    .youtube-video img {
        width: 130px;
        border-radius: 8px;
        margin-right: 1rem;
    }

.music-list, .cipher-list {
    max-height: 26vh;
    overflow-y: scroll;
}

.cipher-preview, .video-preview {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100vw;
    z-index: 9999;
}

    .cipher-preview iframe {
        height: 100%;
        width: 100%;
        background: white;
    }

.video-preview, .cipher-preview {
    display: flex;
    flex-direction: column;
    align-items: center
}
</style>