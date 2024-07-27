<template>
    <div class="search-music">
        <div class="preview-buttons">
            <button class="btn" v-on:click="close()">Voltar</button>
        </div>
        <div class="music-search">
            <input type="text" placeholder="Pesquisar música ou artista" v-model="searchMusicString">
        </div>
        <div class="music-list">
            <musicComponent v-for="(music, index) in filteredMusics" :key="index" :music="music" clicktype="select" @select="selectedMusic = $event"></musicComponent>
        </div>
        <musicDetails v-if="selectedMusic.id != undefined && musicTone == null" :music="selectedMusic" @select="submitMusicWithTone($event)" @close="selectedMusic = {}"></musicDetails>
    </div>
</template>
<script>
import api from '../config/api';
import { globalMethods } from '../js/globalMethods';
import musicComponent from "./musicComponent.vue";
import musicDetails from "./musicDetails.vue";
import $ from 'jquery';

export default {
    name: "searchMusic",
    mixins: [globalMethods],
    data() {
        return {
            musics: [],
            searchMusicString: "",
            filteredMusics: [],
            selectedMusic: {},
            musicTone: null
        }
    },
    watch: {
        searchMusicString: function () {
            this.filteredMusics = this.musics.filter(music => music.name.toLowerCase().indexOf(this.searchMusicString.toLocaleLowerCase()) != -1 || music.artist.toLowerCase().indexOf(this.searchMusicString.toLocaleLowerCase()) != -1);
        }
    },
    methods: {
        submitMusicWithTone: function (event) {
            this.selectedMusic["tone"] = event;
            this.submitMusic();
        },
        close: function () {
            this.$emit("close");
            $(".music-component").removeClass("selected");
            this.selectedMusic = {};
        },
        submitMusic: function () {
            this.$emit("select", this.selectedMusic);
            $(".music-component").removeClass("selected");
            this.selectedMusic = {};
        },
        returnMusics: function () {
            let self = this;

            api.get("/musicas")
                .then(function (response) {
                    self.filteredMusics = response.data.returnObj;
                    self.musics = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    },
    components: {
        musicComponent,
        musicDetails
    },
    mounted: function () {
        this.returnMusics();
    }
}
</script>
<style scoped>
.search-music {
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    left: 0;
    background: var(--primary-primary-blue-low);
    z-index: 2;
    display: flex;
    flex-direction: column;
}

.music-list {
    overflow-y: scroll;
    margin: 1rem;
    padding: 0 2px;
    flex: 1;
}

.music-search {
    padding: 0 1rem;
    margin-top: 2rem;
}

.preview-buttons button {
    margin: 0;
}
</style>