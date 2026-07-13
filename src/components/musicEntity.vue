<template>
    <div class="music-detail-container">
        <!-- Header -->
        <div class="music-detail-header-card">
            <musicComponent :music="music" clicktype="none" class="embedded-music-component"></musicComponent>
            <div class="tone-info-box" v-if="event_id != 0 && music.tom">
                <span class="tone-label">Tom Escaldado</span>
                <div class="music-tone">{{ music.tom }}</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="music-detail-content">
            <div class="music-action-buttons">
                <button class="btn primary btn-2 cipher-btn" v-on:click="openCipherContainer()">
                    <span class="material-icons">menu_book</span>
                    <span>Visualizar Cifra</span>
                </button>
                <button class="btn secondary danger-btn btn-2 delete-btn" v-on:click="confirmDeleteMusic()" v-if="haveAppPermission">
                    <span class="material-icons">delete</span>
                    <span>Excluir Música</span>
                </button>
            </div>

            <!-- Video Section -->
            <div class="video-section-card" v-if="music.video_id">
                <div class="section-title">
                    <span class="material-icons video-icon">play_circle</span>
                    <h5>Vídeo de Apoio</h5>
                </div>
                <div class="youtube-video-wrapper">
                    <iframe id="ytplayer" width="100%" height="100%" :src="'https://www.youtube.com/embed/' + music.video_id" frameborder="0" allowfullscreen />
                </div>
            </div>
        </div>

        <!-- Cipher Fullscreen Viewer Overlay -->
        <cipherModal
            :show="showCipherContainer"
            :music="music"
            :showToneBadge="event_id != 0 && music.tom != null"
            :toneName="music.tom"
            @close="closeCipherContainer()"
        />
        
        <!-- Comments Section -->
        <div class="music-comments-section" v-if="music.id != undefined">
            <h3>Comentários e Dicas</h3>
            <commentsComponent type="musica" :id_musica="music.id"></commentsComponent>
        </div>

        <!-- Modal de Confirmação de Exclusão -->
        <Transition name="modal-fade">
            <modal v-if="showDeleteModal" title="Excluir Música" @closeModal="showDeleteModal = false" class="modal" @cancelEvent="showDeleteModal = false" button2Title="Não, cancelar" buttonTitle="Sim, excluir" @submitEvent="deleteMusic()">
                <div class="confirm-delete-box">
                    <p class="warning-text">Tem certeza que deseja excluir esta música permanentemente?</p>
                    <p>Todos os comentários, cifras e dados vinculados a <strong>{{ music.name }}</strong> serão excluídos e não poderão ser recuperados.</p>
                </div>
            </modal>
        </Transition>
    </div>
</template>

<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import musicComponent from "./musicComponent.vue";
import commentsComponent from "./commentsComponent.vue";
import cipherModal from "./cipherModal.vue";
import modal from "./modal.vue";

export default {
    name: "musicEntityDetail",
    mixins: [globalMethods],
    data() {
        return {
            music: {},
            showCipherContainer: false,
            event_id: 0,
            showDeleteModal: false
        }
    },
    components: {
        musicComponent,
        commentsComponent,
        cipherModal,
        modal
    },
    methods: {
        getMusic: function () {
            let self = this;
            let data = {
                event_id: this.event_id
            }

            api.post("/musicas/retorna_musica/" + self.$route.params.id_musica, data)
                .then(function (response) {
                    self.music = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        closeCipherContainer: function () {
            this.showCipherContainer = false;
        },
        openCipherContainer: function () {
            this.showCipherContainer = true;
        },
        getParams: function () {
            let url = new URLSearchParams(window.location.search);
            let event = url.get("event");

            if (event != null && event != "") {
                this.event_id = event;
            }
        },
        confirmDeleteMusic: function () {
            this.showDeleteModal = true;
        },
        deleteMusic: function () {
            let self = this;
            this.showDeleteModal = false;
            api.delete("/musicas/" + self.music.id)
                .then(function () {
                    self.$router.go(-1);
                })
                .catch(function (error) {
                    const message = error.response && error.response.data ? error.response.data.message || error.response.data : "Não foi possível excluir a música";
                    alert(message);
                });
        }
    },
    mounted: function () {
        this.getParams();
        this.getMusic();
    }
}
</script>

<style scoped>
.music-detail-container {
    padding-bottom: 7rem;
    animation: fadeIn var(--transition-normal);
}

/* Detail header card (wraps embedded music component and tone) */
.music-detail-header-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 1.5rem;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.embedded-music-component {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
    flex: 1;
    backdrop-filter: none !important;
}

.tone-info-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    margin-left: 12px;
}

.tone-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--neutral-gray-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.music-detail-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.music-action-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
}

.music-action-buttons button {
    flex: 1;
    margin: 0 !important;
}

.danger-btn {
    background: transparent !important;
    border: 1.5px solid rgba(241, 76, 76, 0.4) !important;
    color: var(--others-red) !important;
}

.danger-btn:hover {
    background: rgba(241, 76, 76, 0.12) !important;
    border-color: var(--others-red) !important;
    box-shadow: 0 0 12px rgba(241, 76, 76, 0.25);
}

/* Video Section Card */
.video-section-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 16px;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--neutral-white);
}

.section-title h5 {
    font-size: var(--font-size-h5);
    font-weight: 600;
    margin: 0;
}

.video-icon {
    font-size: 22px;
    color: var(--others-red);
}

.youtube-video-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: var(--radius-sm);
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Cipher fullscreen layout */
.music-cipher-overlay {
    height: 100vh;
    width: 100%;
    background: var(--primary-bg);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 1000;
    animation: slideInUp var(--transition-normal);
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

/* Comments section */
.music-comments-section {
    margin-top: 2rem;
}

.music-comments-section h3 {
    font-size: var(--font-size-h3);
    margin-bottom: 1rem;
    border-left: 4px solid var(--secondary-blue-soft);
    padding-left: 10px;
}

@media (max-width: 480px) {
    .music-detail-header-card {
        padding: 12px;
    }
    
    .cipher-header-bar {
        padding: 10px 12px;
    }
    
    .close-cipher-btn {
        padding: 6px 10px;
        font-size: 12px;
    }
    
    .close-cipher-btn span:nth-child(2) {
        display: none; /* Esconder a palavra "Voltar" em telas muito pequenas */
    }
    
    .cipher-title-info h4 {
        font-size: var(--font-size-4);
    }
    
    .cipher-tone-badge {
        padding: 4px 10px;
        font-size: var(--font-size-5);
    }
}

.confirm-delete-box {
    padding: 10px 0;
    font-size: var(--font-size-4);
    line-height: 1.5;
    color: var(--neutral-white);
}

.confirm-delete-box .warning-text {
    color: var(--others-red);
    font-weight: 700;
    margin-bottom: 12px;
}

.confirm-delete-box .helper-text {
    margin-top: 10px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}
</style>
