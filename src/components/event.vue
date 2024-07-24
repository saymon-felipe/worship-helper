<template>
    <section class="event-page">
        <div class="event-header">
            <h2>{{ event.nome_evento }}</h2>
            <div class="event-informations">
                <div class="creator-tag">
                    {{ event.criador_tag }}
                </div>
                <div class="music-quantity">
                    <span class="material-icons">playlist_play</span>
                    <p>{{ returnMusicText(event.quantidade_musicas) }}</p>
                </div>
            </div>
        </div>
        <div class="event-musics">
            <h3>Músicas</h3>
            <div class="music-list">
                <div class="music" v-for="(music, index) in event.musicas" :key="index" v-on:click="goToMusic(music.id_musica)">
                    <img :src="music.imagem_musica" class="avatar-pp">
                    <div class="music-informations">
                        <h5>{{ music.nome_musica }}</h5>
                        <p>{{ music.artista_musica }}</p>
                    </div>
                    <div class="vote" v-if="false">
                        <span class="material-icons success" v-if="user_voted">check_circle</span>
                        <span class="material-icons warning" v-if="!user_voted">error</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="event-members">
            <h3>Membros selecionados</h3>
            <div class="member-list">
                <div class="member" v-for="(member, index) in event.membros_evento" :key="index">
                    <img :src="member.imagem_usuario" class="avatar-pp">
                    <div class="user-informations">
                        <h5 class="user-name">{{ member.nome_usuario }}</h5>
                        <p class="user-occupation">{{ member.user_occupation }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';

export default {
    name: "event",
    mixins: [globalMethods],
    data() {
        return {
            event_id: null,
            event: {}
        }
    },
    methods: {
        goToMusic: function (music_id) {
            this.$router.push('/home/musics/' + music_id);
        },
        getParam: function () {
            this.event_id = this.$route.params.id_evento;
        },
        getEvent: function () {
            let self = this;
            let data = {
                id_igreja: this.igreja.id_igreja
            }

            api.post("/igreja/retorna-evento/" + self.event_id, data)
            .then(function (response) {
                self.event = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    },
    mounted: function () {
        this.getParam();
        this.getEvent();
    }
}
</script>
<style scoped>
.event-musics, .event-members {
    margin: 1.5rem 0;
}

.event-page {
    color: var(--neutral-white);
}

.event-informations, .music-quantity {
    display: flex;
    align-items: center;
}

    .event-informations .creator-tag {
        margin-right: 1rem;
    }



.music, .member {
    display: flex;
    align-items: center;
    position: relative;
    margin: 1rem 0;
    cursor: pointer;
}

.vote {
    position: absolute;
    right: 0;
}

.music-informations, .user-informations {
    margin-left: 1rem;
}

.vote span {
    font-size: var(--font-size-h2);
}
</style>