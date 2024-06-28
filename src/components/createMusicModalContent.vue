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
            <button type="button" class="btn primary" id="search-music" v-on:click="searchMusic()">Buscar música</button>
            <div class="music-utilities">
                <div class="searching-music font-size-2" v-if="searchingMusic">Buscando música</div>
                <div class="music-list">
                    <div class="youtube-video" v-for="(video, index) in musicList" :key="index" v-on:click="selectVideo(video.url, index)" :id="'video-' + index">
                        <img :src="video.videoThumbnail">
                        <div class="youtube-video-informations">
                            <p class="font-size-3">{{ video.title }}</p>
                            <p class="font-size-4">{{ relativeTime(video.publishedAt) }}</p>
                        </div>
                    </div>
                </div>
                <div class="cipher">
                    <iframe src="https://www.cifraclub.com.br/michael-jackson/smooth-criminal/" width="100%" height="600px"></iframe>
                </div>
            </div>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';

export default {
    name: "createMusicModalContent",
    props: ["igreja"],
    mixins: [globalMethods],
    data() {
        return {
            searchingMusic: false,
            musicList: [
                {
                    title: "Smooth Criminal - Michael Jackson",
                    videoId: "cy42sn8-Wc",
                    publishedAt: "2010-11-19T11:39:43Z",
                    url: "https://www.youtube.com/watch?v=cy42sn8-Wcs",
                    videoThumbnail: "https://i.ytimg.com/vi/cy42sn8-Wcs/hqdefault.jpg?sqp=-oaymwEjCOADEI4CSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDJihl8llORfES27985AmSc4WjBQw"
                },
                {
                    title: "Smooth Criminal - Michael Jackson",
                    videoId: "cy42sn8-Wc",
                    publishedAt: "2010-11-19T11:39:43Z",
                    url: "https://www.youtube.com/watch?v=cy42sn8-Wcs",
                    videoThumbnail: "https://i.ytimg.com/vi/cy42sn8-Wcs/hqdefault.jpg?sqp=-oaymwEjCOADEI4CSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDJihl8llORfES27985AmSc4WjBQw"
                },
                {
                    title: "Smooth Criminal - Michael Jackson",
                    videoId: "cy42sn8-Wc",
                    publishedAt: "2010-11-19T11:39:43Z",
                    url: "https://www.youtube.com/watch?v=cy42sn8-Wcs",
                    videoThumbnail: "https://i.ytimg.com/vi/cy42sn8-Wcs/hqdefault.jpg?sqp=-oaymwEjCOADEI4CSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDJihl8llORfES27985AmSc4WjBQw"
                },
                {
                    title: "Smooth Criminal - Michael Jackson",
                    videoId: "cy42sn8-Wc",
                    publishedAt: "2010-11-19T11:39:43Z",
                    url: "https://www.youtube.com/watch?v=cy42sn8-Wcs",
                    videoThumbnail: "https://i.ytimg.com/vi/cy42sn8-Wcs/hqdefault.jpg?sqp=-oaymwEjCOADEI4CSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDJihl8llORfES27985AmSc4WjBQw"
                },
                {
                    title: "Smooth Criminal - Michael Jackson",
                    videoId: "cy42sn8-Wc",
                    publishedAt: "2010-11-19T11:39:43Z",
                    url: "https://www.youtube.com/watch?v=cy42sn8-Wcs",
                    videoThumbnail: "https://i.ytimg.com/vi/cy42sn8-Wcs/hqdefault.jpg?sqp=-oaymwEjCOADEI4CSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDJihl8llORfES27985AmSc4WjBQw"
                }
            ],
            selectedUrl: ""
        }
    },
    methods: {
        selectVideo: function (url, index) {
            this.selectedUrl = url;
            $(".youtube-video").removeClass("selected");
            $("#video-" + index).addClass("selected");
        },
        searchMusic: function () {
            let self = this;

            let data = {
                name: $("#name").val(),
                artist: $("#artist").val()
            }

            return

            api.post("/musicas/procurar", data)
            .then(function (response) {
                self.musicList = response.data.returnObj;
                console.log(self.musicList)
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        createMusic: function () {
            let self = this;

            let data = $("#create-music-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = parseInt(item.value);
                return obj;
            }, {});

            data["video_url"] = this.selectVideo;

            api.post("/musicas", data)
            .then(function (response) {
                self.functions = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    },
    mounted: function () {
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

.youtube-video {
    display: flex;
    align-items: center;
    margin: 1rem 0;;
}

    .youtube-video img {
        width: 130px;
        border-radius: 8px;
        margin-right: 1rem;
    }

.music-list {
    max-height: 36vh;
    overflow-y: scroll;
}

.selected {
    outline: 2px solid var(--primary-primary-blue-high);
    border-radius: 8px;
    padding: 5px 0;
}

.cipher {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 9999;
}

    .cipher iframe {
        height: 100vh;
        width: 100vw;
        background: white;
    }
</style>