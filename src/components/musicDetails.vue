<template>
    <div class="music-details">
        <div class="preview-buttons">
            <button class="btn" v-on:click="close()">Voltar</button>
        </div>
        <div class="music-details-container">
            <button type="button" class="btn primary show-cipher" v-on:click="openCipherContainer()" :disabled="loadingCipher">
                {{ loadingCipher ? "Carregando cifra..." : "Escolher cifra" }}
            </button>
            
            <div class="original-tone-badge" v-if="originalTone">
                <span class="material-icons">music_note</span>
                <span>Tom original: <strong>{{ originalTone }}</strong></span>
            </div>

            <button type="button" class="youtube-video" v-if="displayMusic.video_id" v-on:click="openVideoFullscreen()">
                <div class="video-placeholder" v-if="iframeLoading">
                    <span class="material-icons rotating">sync</span>
                    <span>Carregando vídeo...</span>
                </div>
                <iframe
                    id="ytplayer"
                    class="youtube-iframe"
                    width="100%"
                    height="100%"
                    :src="'https://www.youtube.com/embed/' + displayMusic.video_id + '?playsinline=1'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                    @load="iframeLoading = false"
                />
                <span class="video-open-layer">
                    <span class="material-icons">open_in_full</span>
                    <span>Abrir vídeo</span>
                </span>
            </button>

            <div class="video-fullscreen" v-if="showVideoFullscreen" ref="videoFullscreen">
                <button type="button" class="video-fullscreen-close" v-on:click="closeVideoFullscreen()">
                    <span class="material-icons">close</span>
                    <span>Sair</span>
                </button>
                <iframe
                    class="video-fullscreen-iframe"
                    :src="'https://www.youtube.com/embed/' + displayMusic.video_id + '?autoplay=1&playsinline=1'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin"
                />
            </div>
            
            <Transition name="route">
                <div class="music-cipher" v-if="showCipherContainer">
                    <div class="preview-buttons">
                        <button class="btn" v-on:click="closeCipherContainer()">Voltar</button>
                        <button class="btn primary" v-on:click="selectTransposedTone()" v-if="!loadingCipher">Salvar cifra</button>
                    </div>
                    <div class="cipher-loading" v-if="loadingCipher">
                        <span class="material-icons rotating">sync</span>
                        <span>Carregando cifra</span>
                    </div>
                    <cipherViewer ref="cipherViewer" v-else :cipherText="displayMusic.cipher_text" :title="displayMusic.cipher_title || displayMusic.name" :artist="displayMusic.artist"></cipherViewer>
                </div>
            </Transition>
        </div>
        <p class="response">{{ response }}</p>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import cipherViewer from "./cipherViewer.vue";
import api from "../config/api";

const FLAT_TO_SHARP = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
};

const SHARP_TO_FLAT = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb"
};

const CHORD_PATTERN = /^([A-G](?:#|b)?)((?:m|maj|min|dim|aug|sus|add|º|°|[#b0-9()+-])*)(?:\/([A-G](?:#|b)?))?$/;

function isChordToken(token) {
    return CHORD_PATTERN.test(token.replace(/[()[\],]/g, ""));
}

function isChordLine(line) {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) {
        return false;
    }
    const chordTokens = tokens.filter(isChordToken).length;
    return chordTokens > 0 && chordTokens / tokens.length >= 0.65;
}

function detectOriginalTone(text) {
    if (!text) return "";
    const lines = String(text).split("\n");
    for (const line of lines) {
        if (isChordLine(line)) {
            const tokens = line.trim().split(/\s+/).filter(Boolean);
            if (tokens.length > 0) {
                const cleanChord = tokens[0].replace(/[()[\],]/g, "");
                const match = cleanChord.match(/^([A-G](?:#|b)?m?)/);
                if (match) {
                    return match[1];
                }
            }
        }
    }
    return "";
}

export default {
    name: "musicDetails",
    mixins: [globalMethods],
    props: ["music"],
    data() {
        return {
            musicTone: null,
            showCipherContainer: false,
            loadingCipher: false,
            resolvedMusic: null,
            allTones: [],
            iframeLoading: true,
            showVideoFullscreen: false
        }
    },
    computed: {
        displayMusic: function () {
            return this.resolvedMusic || this.music || {};
        },
        originalTone: function () {
            if (!this.displayMusic.cipher_text) return "";
            return detectOriginalTone(this.displayMusic.cipher_text);
        }
    },
    methods: {
        close: function () {
            this.$emit("close");
        },
        openVideoFullscreen: function () {
            this.showVideoFullscreen = true;
            this.$nextTick(() => {
                const fullscreenElement = this.$refs.videoFullscreen;
                if (fullscreenElement && fullscreenElement.requestFullscreen) {
                    fullscreenElement.requestFullscreen().catch(() => {});
                }
            });
        },
        closeVideoFullscreen: function () {
            this.showVideoFullscreen = false;
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        },
        closeCipherContainer: function () {
            this.showCipherContainer = false;
        },
        loadMusicDetails: async function () {
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
            } finally {
                this.loadingCipher = false;
            }
        },
        openCipherContainer: async function () {
            this.showCipherContainer = true;
            this.loadTones().catch((error) => {
                console.log(error);
            });
            await this.loadMusicDetails();
        },
        loadTones: async function () {
            if (this.allTones.length > 0) {
                return;
            }

            const churchId = this.getCurrentChurchId();
            if (!churchId || !this.music.id) {
                return;
            }

            let response;

            try {
                response = await api.post("/igreja/tons_de_musica/" + this.music.id, {
                    id_igreja: churchId
                });
            } catch (error) {
                console.log(error);
                this.showResponse("Não foi possível carregar os tons da música", ".response", "error");
                return;
            }

            this.allTones = response.data.returnObj.allTones || [];
        },
        toneCandidates: function (toneName) {
            const cleanTone = String(toneName || "").trim();
            const match = cleanTone.match(/^([A-G](?:#|b)?)(.*)$/);

            if (!match) {
                return [cleanTone.toLowerCase()];
            }

            const root = match[1];
            const suffix = match[2] || "";
            const normalizedRoot = FLAT_TO_SHARP[root] || root;
            const flatRoot = SHARP_TO_FLAT[normalizedRoot];
            const candidates = [`${root}${suffix}`, `${normalizedRoot}${suffix}`];

            if (flatRoot) {
                candidates.push(`${flatRoot}${suffix}`);
            }

            return [...new Set(candidates.map(candidate => candidate.toLowerCase()))];
        },
        findToneByName: function (toneName) {
            const candidates = this.toneCandidates(toneName);
            return this.allTones.find(tone => candidates.includes(String(tone.nome || "").toLowerCase()));
        },
        selectTransposedTone: async function () {
            if (!this.displayMusic.cipher_text) {
                this.showResponse("Cifra não disponível para esta música", ".response", "error");
                return;
            }

            await this.loadTones();

            const selectedToneName = this.$refs.cipherViewer ? this.$refs.cipherViewer.selectedToneName : "";
            const selectedTone = this.findToneByName(selectedToneName);

            if (!selectedTone) {
                this.showResponse("Não foi possível identificar o tom da cifra", ".response", "error");
                return;
            }

            this.musicTone = selectedTone;
            this.$emit("select", selectedTone);
        }
    },
    components: {
        cipherViewer
    },
    mounted: function () {
        this.loadMusicDetails();
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
}

.original-tone-badge {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-3);
    color: var(--neutral-gray-medium);
}

.original-tone-badge strong {
    color: var(--secondary-blue-soft);
}

.youtube-video {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    height: 40vh;
    max-height: 250px;
    background: rgba(0, 0, 0, 0.2);
    isolation: isolate;
    touch-action: manipulation;
    border: 0;
    padding: 0;
    cursor: pointer;
    width: 100%;
    color: var(--neutral-white);
    font: inherit;
}

.youtube-iframe {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: 0;
    display: block;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.2);
}

.video-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.02);
    border: 1.5px dashed rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--neutral-gray-low);
    font-size: var(--font-size-3);
    z-index: 2;
    pointer-events: none;
}

.video-placeholder span.material-icons {
    font-size: 32px;
    color: var(--secondary-blue-soft);
}

.video-open-layer {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.28));
    color: var(--neutral-white);
    font-weight: 800;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.65);
}

.video-open-layer .material-icons {
    font-size: 28px;
}

.video-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 3000;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.video-fullscreen-iframe {
    width: 100vw;
    height: 100dvh;
    border: 0;
    display: block;
    background: #000;
}

.video-fullscreen-close {
    position: fixed;
    top: max(12px, env(safe-area-inset-top));
    right: max(12px, env(safe-area-inset-right));
    z-index: 3001;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius-pill);
    background: rgba(12, 10, 28, 0.82);
    color: var(--neutral-white);
    padding: 8px 12px;
    font-weight: 800;
    backdrop-filter: blur(10px);
    cursor: pointer;
}

.video-fullscreen-close .material-icons {
    font-size: 20px;
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
    align-self: flex-start;
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
