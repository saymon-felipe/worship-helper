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
                        :musicId="music.id"
                        :canEdit="canEdit"
                        :cipherText="music.cipher_text"
                        :title="music.cipher_title || music.name"
                        :artist="music.artist"
                        :targetTone="toneName"
                        :showCloseButton="true"
                        :buttonTitle="buttonTitle"
                        :showToneHighlight="showToneBadge"
                        @close="close()"
                        @submit="submit"
                        @update-cipher="onUpdateCipher"
                    />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
import { globalMethods } from "../js/globalMethods";
import cipherViewer from "./cipherViewer.vue";

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
        }
    },
    data() {
        return {
            hasPushState: false
        };
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
        cipherViewer
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

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
