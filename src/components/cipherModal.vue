<template>
    <Teleport to="body">
        <Transition name="route">
            <div class="music-cipher-overlay" v-if="show">
                <div class="cipher-content-container">
                    <div class="cipher-loading" v-if="loading">
                        <span class="material-icons rotating">sync</span>
                        <span>Carregando cifra</span>
                    </div>
                    <cipherViewer
                        ref="cipherViewer"
                        v-else
                        :musicId="displayedMusic.id"
                        :canEdit="canEdit"
                        :cipherText="displayedMusic.cipher_text"
                        :title="displayedMusic.cipher_title || displayedMusic.name"
                        :artist="displayedMusic.artist"
                        :targetTone="displayedTone"
                        :showCloseButton="true"
                        :buttonTitle="buttonTitle"
                        :showToneHighlight="showToneBadge"
                        @close="close()"
                        @submit="submit"
                        @update-cipher="onUpdateCipher"
                    />
                    <liveWorshipAssistant
                        v-if="show && churchId && eventId"
                        :churchId="churchId"
                        :eventId="eventId"
                        :currentMusicId="music.id"
                        @candidates="showCandidates"
                        @error="handleAssistantError"
                    />
                    <Transition name="slide-up">
                        <section v-if="candidates.length" class="assistant-suggestions" aria-live="polite">
                            <div class="assistant-suggestions-header">
                                <div>
                                    <span class="material-icons">hearing</span>
                                    <strong>Possivel mudanca de musica</strong>
                                </div>
                                <button type="button" title="Ignorar sugestao" @click="dismissCandidates">
                                    <span class="material-icons">close</span>
                                </button>
                            </div>
                            <button
                                v-for="candidate in candidates"
                                :key="`${candidate.music_id || candidate.name}-${candidate.tone}`"
                                type="button"
                                class="assistant-candidate"
                                @click="selectCandidate(candidate)"
                            >
                                <span class="candidate-title">{{ candidate.name }}</span>
                                <span class="candidate-meta">{{ candidate.artist || 'Artista nao identificado' }}<template v-if="candidate.tone"> · Tom {{ candidate.tone }}</template></span>
                            </button>
                        </section>
                    </Transition>
                    <button v-if="temporaryMusic" type="button" class="return-event-music" @click="temporaryMusic = null">
                        Voltar a cifra do evento
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
import { globalMethods } from "../js/globalMethods";
import cipherViewer from "./cipherViewer.vue";
import liveWorshipAssistant from "./liveWorshipAssistant.vue";

export default {
    name: "cipherModal",
    mixins: [globalMethods],
    props: {
        show: {
            type: Boolean,
            required: true
        },
        music: {
            type: Object,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        buttonTitle: {
            type: String,
            default: ""
        },
        showToneBadge: {
            type: Boolean,
            default: false
        },
        toneName: {
            type: String,
            default: ""
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        churchId: {
            type: [Number, String],
            default: null
        },
        eventId: {
            type: [Number, String],
            default: null
        }
    },
    data() {
        return {
            hasPushState: false,
            candidates: [],
            temporaryMusic: null
        };
    },
    computed: {
        displayedMusic() {
            return this.temporaryMusic || this.music;
        },
        displayedTone() {
            return this.temporaryMusic?.tone || this.toneName;
        }
    },
    watch: {
        show: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    if (!this.hasPushState) {
                        window.history.pushState({ cipherModalOpen: true }, "");
                        this.hasPushState = true;
                    }
                    window.activeModalStack = window.activeModalStack || [];
                    window.activeModalStack.push(this);
                    window.addEventListener("popstate", this.handlePopState);
                } else {
                    this.cleanupPopState();
                }
            }
        }
    },
    methods: {
        handlePopState() {
            if (window.isPoppingForClose) {
                window.isPoppingForClose = false;
                return;
            }
            if (window.activeModalStack && window.activeModalStack[window.activeModalStack.length - 1] !== this) {
                return;
            }
            this.hasPushState = false;
            if (window.activeModalStack) {
                window.activeModalStack = window.activeModalStack.filter(item => item !== this);
            }
            window.removeEventListener("popstate", this.handlePopState);
            this.$emit("close");
        },
        close() {
            if (this.hasPushState) {
                window.history.back();
            } else {
                if (window.activeModalStack) {
                    window.activeModalStack = window.activeModalStack.filter(item => item !== this);
                }
                this.$emit("close");
            }
        },
        submit(selectedToneName) {
            this.$emit("submit", selectedToneName);
        },
        onUpdateCipher(newCipherText) {
            this.$emit("update-cipher", newCipherText);
        },
        showCandidates(candidates) {
            this.candidates = candidates.filter((candidate) => candidate.confidence >= 0.65);
        },
        handleAssistantError(error) {
            if (error) {
                console.warn("[Assistente ao vivo]", error);
            }
        },
        dismissCandidates() {
            this.candidates = [];
        },
        selectCandidate(candidate) {
            this.candidates = [];
            if (candidate.temporary) {
                this.temporaryMusic = {
                    id: null,
                    name: candidate.name,
                    artist: candidate.artist,
                    tone: candidate.tone,
                    cipher_title: candidate.cipher_title,
                    cipher_text: candidate.cipher_text
                };
                return;
            }

            this.temporaryMusic = null;
            this.$emit("select-suggestion", candidate);
        },
        cleanupPopState() {
            window.removeEventListener("popstate", this.handlePopState);
            if (window.activeModalStack) {
                window.activeModalStack = window.activeModalStack.filter(item => item !== this);
            }
            if (this.hasPushState) {
                this.hasPushState = false;
                if (window.activeModalStack && window.activeModalStack.length > 0) {
                    window.isPoppingForClose = true;
                }
                window.history.back();
            }
        }
    },
    beforeUnmount() {
        this.cleanupPopState();
    },
    components: {
        cipherViewer,
        liveWorshipAssistant
    }
}
</script>

<style scoped>
.music-cipher-overlay {
    height: 100vh;
    width: 100vw;
    background: var(--primary-bg);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 1000;
}

.cipher-content-container {
    flex-grow: 1;
    width: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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

.assistant-suggestions {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 66px;
    z-index: 1002;
    max-width: 520px;
    margin: 0 auto;
    padding: 12px;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    background: var(--card-bg);
    box-shadow: var(--card-shadow);
}

.assistant-suggestions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    color: var(--neutral-white);
    font-size: 13px;
}

.assistant-suggestions-header > div {
    display: inline-flex;
    align-items: center;
    gap: 7px;
}

.assistant-suggestions-header .material-icons {
    color: var(--secondary-blue-soft);
    font-size: 19px;
}

.assistant-suggestions-header button {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border: 0;
    border-radius: 50%;
    color: var(--neutral-gray-high);
    background: transparent;
}

.assistant-candidate {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    margin-top: 6px;
    padding: 10px;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-sm);
    color: var(--neutral-white);
    background: transparent;
    text-align: left;
}

.assistant-candidate:hover {
    border-color: var(--secondary-blue-soft);
}

.candidate-title {
    font-size: 14px;
    font-weight: 700;
}

.candidate-meta {
    color: var(--neutral-gray-medium);
    font-size: 12px;
}

.return-event-music {
    position: fixed;
    right: 16px;
    bottom: 18px;
    z-index: 1003;
    min-height: 38px;
    padding: 7px 11px;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-pill);
    color: var(--neutral-gray-high);
    background: var(--card-bg);
    font-size: 12px;
    font-weight: 700;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(16px);
}
</style>
