<template>
    <Teleport to="body">
        <Transition name="route">
            <div class="music-cipher-overlay" v-if="show">
                <div class="cipher-header-bar">
                    <button class="close-cipher-btn" @click="close()">
                        <span class="material-icons">arrow_back</span>
                        <span>Voltar</span>
                    </button>
                    <div class="cipher-title-info">
                        <h4>{{ music.cipher_title || music.name }}</h4>
                        <p>{{ music.artist }}</p>
                    </div>
                    <div class="cipher-actions">
                        <div class="cipher-tone-badge" v-if="showToneBadge && toneName">
                            Tom: {{ toneName }}
                        </div>
                        <button class="btn primary" @click="submit()" v-if="buttonTitle && !loading">
                            {{ buttonTitle }}
                        </button>
                    </div>
                </div>
                
                <div class="cipher-content-container">
                    <div class="cipher-loading" v-if="loading">
                        <span class="material-icons rotating">sync</span>
                        <span>Carregando cifra</span>
                    </div>
                    <cipherViewer
                        ref="cipherViewer"
                        v-else
                        :cipherText="music.cipher_text"
                        :title="music.cipher_title || music.name"
                        :artist="music.artist"
                        :originalTone="toneName"
                    />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
import cipherViewer from "./cipherViewer.vue";

export default {
    name: "cipherModal",
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
        }
    },
    methods: {
        close: function () {
            this.$emit("close");
        },
        submit: function () {
            const selectedToneName = this.$refs.cipherViewer ? this.$refs.cipherViewer.selectedToneName : "";
            this.$emit("submit", selectedToneName);
        }
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

.cipher-header-bar {
    background: rgba(18, 16, 41, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--card-border);
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    z-index: 1002;
}

.close-cipher-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--neutral-white);
    padding: 8px 14px;
    border-radius: var(--radius-pill);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all var(--transition-fast);
}

.close-cipher-btn:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.1);
}

.cipher-title-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.cipher-title-info h4 {
    font-size: var(--font-size-3);
    font-weight: 700;
    color: var(--neutral-white);
    margin: 0;
}

.cipher-title-info p {
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
    margin: 0;
}

.cipher-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cipher-tone-badge {
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
    padding: 6px 14px;
    border-radius: var(--radius-pill);
    font-weight: 700;
    font-size: var(--font-size-4);
    white-space: nowrap;
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
