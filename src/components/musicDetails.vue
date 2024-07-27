<template>
    <div class="music-details">
        <div class="preview-buttons">
            <button class="btn" v-on:click="close()">Voltar</button>
            <button class="btn primary" v-on:click="submitMusic()">Selecionar música</button>
        </div>
        <div class="music-details-container">
            <div class="youtube-video">
                <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + music.video_id" frameborder="0" allowfullscreen />
            </div>
            <div class="music-tone">
                <div class="input-group">
                    <label for="tone">Tom da música</label>
                    <musicToneSelect @select="musicTone = $event" :musicid="music.id"></musicToneSelect>
                </div>
            </div>
            <button class="btn primary show-cipher" v-on:click="openCipherContainer()">Ver cifra</button>
            <div class="music-cipher" v-if="showCipherContainer">
                <button class="btn" v-on:click="closeCipherContainer()">Voltar</button>
                <iframe id="cc" width="100%" height="100%" :src="music.cipher_url" frameborder="0" allowfullscreen />
            </div>
        </div>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import musicToneSelect from "./musicToneSelect.vue";

export default {
    name: "musicDetails",
    mixins: [globalMethods],
    props: ["music"],
    data() {
        return {
            musicTone: null,
            showCipherContainer: false
        }
    },
    methods: {
        close: function () {
            this.$emit("close");
        },
        submitMusic: function () {
            if (this.musicTone == null) {
                this.showResponse("Nenhum tom de música selecionado", ".response", "error");
                return;
            }

            this.$emit("select", this.musicTone);
        },
        closeCipherContainer: function () {
            this.showCipherContainer = false;
        },
        openCipherContainer: function () {
            this.showCipherContainer = true;
        }
    },
    components: {
        musicToneSelect
    }
}
</script>
<style scoped>
.music-details {
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

.music-details-container {
    padding: 1rem;
}

.youtube-video {
    margin-top: 1rem;
    border-radius: 10px;
    overflow: hidden;
    height: 40vh;
    max-height: 250px;
}

.music-cipher {
        height: 80vh;
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

.show-cipher {
    margin-top: 1rem;
}
</style>