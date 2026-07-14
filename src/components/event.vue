<template>
    <section class="event-page-container">
        <!-- Event Header Card -->
        <div class="event-hero-card">
            <div class="hero-top">
                <h2>{{ event.nome_evento }}</h2>
                <button type="button" class="btn secondary edit-event-button" v-if="canEditEvent" @click="openEditEvent()">
                    <span class="material-icons">edit</span>
                    <span>Editar evento</span>
                </button>
                <div class="event-meta-info" v-if="event.criador_tag">
                    <span class="creator-tag">{{ event.criador_tag }}</span>
                </div>
            </div>
            <div class="hero-details">
                <div class="detail-item" v-if="event.data_inicio_evento">
                    <span class="material-icons detail-icon">today</span>
                    <div class="detail-text">
                        <p class="detail-label">Data e Hora</p>
                        <p class="detail-value">{{ formatEventDate(event.data_inicio_evento) }}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <span class="material-icons detail-icon">library_music</span>
                    <div class="detail-text">
                        <p class="detail-label">Louvores</p>
                        <p class="detail-value">{{ returnMusicText(event.quantidade_musicas) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Musics Section -->
        <div class="event-section">
            <h3>Louvores Escalados</h3>
            <div class="music-list">
                <div class="music-row-card" v-for="(music, index) in event.musicas" :key="index" v-on:click="goToMusic(music.id_musica)">
                    <div class="music-row-left">
                        <img :src="music.imagem_musica || default_music_image" class="music-thumbnail">
                        <div class="music-row-details">
                            <h5>{{ music.nome_musica }}</h5>
                            <p>{{ music.artista_musica }}</p>
                        </div>
                    </div>
                    <div class="music-row-right">
                        <div class="music-tone-badge" title="Tom da música">
                            <span>{{ music.tom }}</span>
                        </div>
                        <span class="material-icons chevron-icon">chevron_right</span>
                    </div>
                </div>
                <div class="church-empty" v-if="!event.musicas || event.musicas.length <= 0">
                    <span class="material-icons empty-icon">music_off</span>
                    <h5>Nenhuma música escalada</h5>
                    <p>Adicione louvores a este evento para visualizá-los aqui.</p>
                </div>
            </div>
        </div>

        <!-- Members Section -->
        <div class="event-section">
            <h3>Escala de Membros</h3>
            <div class="member-list">
                <div class="member-row-card" v-for="(member, index) in event.membros_evento" :key="index">
                    <div class="member-row-left">
                        <img :src="member.imagem_usuario" class="member-thumbnail">
                        <div class="member-row-details">
                            <h5 class="user-name">{{ member.nome_usuario }}</h5>
                            <p class="user-occupation" v-if="member.user_occupation">{{ member.user_occupation }}</p>
                        </div>
                    </div>
                    <div class="member-row-right">
                        <span class="occupation-badge" v-if="member.user_occupation">{{ member.user_occupation }}</span>
                    </div>
                </div>
                <div class="church-empty" v-if="!event.membros_evento || event.membros_evento.length <= 0">
                    <span class="material-icons empty-icon">person_off</span>
                    <h5>Nenhum membro escalado</h5>
                    <p>Adicione músicos ou auxiliares na escala deste evento.</p>
                </div>
            </div>
        </div>

        <div class="event-section">
            <h3>Comentários do Evento</h3>
            <commentsComponent
                type="evento"
                :id_evento="event_id"
                :can-create-thread="canCommentEvent"
            />
        </div>
        <Teleport to="body">
            <Transition name="modal-fade">
                <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm();">
                    <createEventModalContent :eventToEdit="event" @success="closeModal(); getEvent();" />
                </modal>
            </Transition>
        </Teleport>
    </section>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import moment from 'moment';
import 'moment/locale/pt-br';
import commentsComponent from "./commentsComponent.vue";
import createEventModalContent from "./createEventModalContent.vue";
import modal from "./modal.vue";
import { appStore } from '../store/appStore';
moment.locale('pt-br');

export default {
    name: "eventDetail",
    mixins: [globalMethods],
    data() {
        return {
            event_id: null,
            event: {},
            currentUser: null,
            default_music_image: api.defaults.baseURL + "/public/music-default-image.png" // Fallback seguro
        }
    },
    computed: {
        canCommentEvent: function () {
            const userId = this.currentUser ? this.currentUser.id_usuario : null;
            if (!userId || !this.event) {
                return false;
            }

            if (this.event.id_criador == userId) {
                return true;
            }

            const members = Array.isArray(this.event.membros_evento) ? this.event.membros_evento : [];
            return members.some((member) => member.id_usuario == userId);
        },
        canEditEvent: function () {
            const userId = this.currentUser ? this.currentUser.id_usuario : null;
            return Boolean(
                this.hasChurchPermission("events.edit") ||
                (userId && this.event && this.event.id_criador == userId)
            );
        }
    },
    methods: {
        goToMusic: function (music_id) {
            this.$router.push('/home/musics/' + music_id + "?event=" + this.event_id);
        },
        getParam: function () {
            this.event_id = this.$route.params.id_evento;
        },
        getEvent: function () {
            let self = this;
            let churchId = this.getCurrentChurchId();

            if (churchId == null) {
                return;
            }

            let data = {
                id_igreja: churchId
            }

            api.post("/igreja/retorna-evento/" + self.event_id, data)
            .then(function (response) {
                self.event = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        openEditEvent: function () {
            this.modalTitle = "Editar evento";
            this.modalButtonTitle = "Salvar";
            this.modalButton2Title = "";
            this.showModal = true;
        },
        formatEventDate: function (date) {
            let rawDate = moment.parseZone(date).format("dddd, DD/MM/YYYY [às] HH:mm");
            return rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
        }
    },
    mounted: function () {
        this.currentUser = appStore.state.user;
        this.requireUser().then((user) => {
            this.currentUser = user;
        }).catch(() => {});
        this.getParam();
        this.getEvent();
    },
    components: {
        commentsComponent,
        createEventModalContent,
        modal
    }
}
</script>
<style scoped>
.event-page-container {
    color: var(--neutral-white);
    padding-bottom: 7rem;
    animation: fadeIn var(--transition-normal);
}

/* Hero Event Card */
.event-hero-card {
    background: linear-gradient(135deg, var(--primary-bg-light) 0%, rgba(24, 21, 56, 0.9) 100%);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 2rem;
    box-shadow: var(--card-shadow);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    width: 100%;
}

.hero-top h2 {
    font-size: var(--font-size-h2);
    font-weight: 700;
    margin: 0;
    flex: 1 1 250px;
}

.edit-event-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    white-space: nowrap;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--neutral-white);
    transition: all var(--transition-fast);
}

.edit-event-button:hover {
    background: var(--secondary-blue-soft);
    border-color: var(--secondary-blue-soft);
    color: var(--primary-bg);
    box-shadow: 0 4px 12px rgba(56, 182, 255, 0.25);
}

.hero-details {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 20px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1 1 200px;
}

.detail-icon {
    font-size: 28px;
    color: var(--secondary-blue-soft);
    background: var(--secondary-blue-soft-2);
    padding: 8px;
    border-radius: var(--radius-md);
}

.detail-text {
    display: flex;
    flex-direction: column;
}

.detail-label {
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.detail-value {
    font-size: var(--font-size-4);
    font-weight: 500;
}

/* Sections styling */
.event-section {
    margin-bottom: 2.5rem;
}

.event-section h3 {
    font-size: var(--font-size-h3);
    margin-bottom: 1.2rem;
    border-left: 4px solid var(--secondary-blue-soft);
    padding-left: 10px;
}

/* Music List styling */
.music-list, .member-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.music-row-card, .member-row-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    cursor: pointer;
    box-shadow: var(--card-shadow);
}

.music-row-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

.music-row-left, .member-row-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.music-thumbnail {
    width: 46px;
    height: 46px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.music-row-details h5, .member-row-details h5 {
    font-size: var(--font-size-3);
    font-weight: 600;
    margin: 0;
}

.music-row-details p {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
}

.music-row-right, .member-row-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.music-tone-badge {
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
    width: 38px;
    height: 38px;
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: var(--font-size-3);
}

.chevron-icon {
    font-size: 22px;
    color: var(--neutral-gray-low);
}

/* Members layout details */
.member-row-card {
    cursor: default; /* Membros não são necessariamente clicáveis */
}

.member-thumbnail {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 2px solid var(--primary-primary-blue-high-2);
}

.user-occupation {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
}

.occupation-badge {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--neutral-gray-high);
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    font-size: var(--font-size-5);
    font-weight: 500;
}

.church-empty {
    margin-top: 1rem;
    text-align: center;
    padding: 2rem 1rem;
    border: 1.5px dashed rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.01);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.empty-icon {
    font-size: 32px;
    color: var(--neutral-gray-low);
    margin-bottom: 4px;
}

.church-empty h5 {
    font-size: var(--font-size-h5);
    font-weight: 600;
    color: var(--neutral-gray-medium);
}

.church-empty p {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-low);
}

@media (max-width: 480px) {
    .event-hero-card {
        padding: 16px;
    }
    
    .hero-top h2 {
        font-size: var(--font-size-1);
    }
    
    .hero-details {
        gap: 16px;
        padding-top: 16px;
    }
    
    .detail-icon {
        font-size: 24px;
        padding: 6px;
    }
    
    .music-row-card, .member-row-card {
        padding: 12px;
    }
    
    .occupation-badge {
        display: none; /* Esconder badge extra no mobile para não amontoar */
    }
}
</style>

