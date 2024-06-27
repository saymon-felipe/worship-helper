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
            <button type="button" class="btn primary" id="search-music">Buscar música</button>
            <div class="music-utilities">
                <div class="searching-music font-size-2" v-if="searchingMusic">Buscando música</div>
            </div>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
//import api from '../config/api';
import $ from 'jquery';

export default {
    name: "createMusicModalContent",
    props: ["igreja"],
    mixins: [globalMethods],
    data() {
        return {
            searchingMusic: false
        }
    },
    methods: {
        createMusic: function () {
            let self = this;

            let data = $("#create-music-form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = parseInt(item.value);
                return obj;
            }, {});

            console.log(data)

            /*api.post("/musicas", data)
                .then(function (response) {
                    self.functions = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })*/
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
</style>