<template>
    <div class="music-details">
        <div class="preview-buttons">
            <button class="btn" v-on:click="close()">Voltar</button>
            <button class="btn primary" v-on:click="submitMusic()">Selecionar música</button>
        </div>
        <div class="music-details-container">
            <button class="btn primary show-cipher" v-on:click="openCipherContainer()" :disabled="loadingCipher">
                {{ loadingCipher ? "Carregando cifra..." : "Ver cifra" }}
            </button>
            <div class="input-group">
                <label for="tone">Tom da música</label>
                <musicToneSelect @select="musicTone = $event" :musicid="music.id" ref="toneSelect"></musicToneSelect>
            </div>
            <div class="youtube-video" v-if="displayMusic.video_id">
                <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + displayMusic.video_id" frameborder="0" allowfullscreen />
            </div>
            <div class="music-cipher" v-if="showCipherContainer">
                <div class="preview-buttons">
                    <button class="btn" v-on:click="closeCipherContainer()">Voltar</button>
                    <button class="btn primary" v-on:click="selectTransposedTone()" v-if="!loadingCipher">Selecionar Cifra neste Tom</button>
                </div>
                <div class="cipher-loading" v-if="loadingCipher">
                    <span class="material-icons rotating">sync</span>
                    <span>Carregando cifra</span>
                </div>
                <cipherViewer ref="cipherViewer" v-else :cipherText="displayMusic.cipher_text" :title="displayMusic.cipher_title || displayMusic.name" :artist="displayMusic.artist" :originalTone="displayMusic.tom"></cipherViewer>
            </div>
        </div>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import musicToneSelect from "./musicToneSelect.vue";
import cipherViewer from "./cipherViewer.vue";
import api from "../config/api";

export default {
    name: "musicDetails",
    mixins: [globalMethods],
    props: ["music"],
    data() {
        return {
            musicTone: null,
            showCipherContainer: false,
            loadingCipher: false,
            resolvedMusic: null
        }
    },
    computed: {
        displayMusic: function () {
            return this.resolvedMusic || this.music || {};
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
        openCipherContainer: async function () {
            this.showCipherContainer = true;

            if (this.displayMusic.cipher_text || this.loadingCipher) {
                return;
            }

            this.loadingCipher = true;

            try {
                const response = await api.post("/musicas/retorna_musica/" + this.music.id, {
                    event_id: 0
                });

                this.resolvedMusic = response.data.returnObj || this.music;
            } catch (error) {
                console.log(error);
                this.showResponse("Não foi possível carregar a cifra", ".response", "error");
            } finally {
                this.loadingCipher = false;
            }
        }
    },
    components: {
        musicToneSelect,
        cipherViewer
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
        height: 100vh;
        background: var(--primary-primary-blue-low);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 1000;
    }

        .music-cipher .cipher-viewer {
            width: 100%;
            flex: 1;
            min-height: 0;
        }

        .music-cipher button {
            margin-bottom: 15px;
        }

.show-cipher {
    margin-top: 1rem;
}

.cipher-loading {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--neutral-gray-medium);
    font-weight: 700;
}

.cipher-loading .material-icons {
    color: var(--secondary-blue-soft);
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>

