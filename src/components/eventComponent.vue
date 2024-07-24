<template>
    <div class="event-container" v-on:click="goToEvent(event.id_evento)">
        <div class="event-header">
            <div class="event-informations">
                {{ event_close }} {{ returnCloseText() }}
                <h3>{{ event.nome_evento }}</h3>
                <h4>{{ moment.parseZone(event.data_inicio_evento).format("dddd DD/MM/yyyy HH:mm") }}</h4>
            </div>
            <div class="event-icons">
                <span class="material-icons warning" style="display: none;" v-if="!event.user_voted">error</span>
                <span class="material-icons success" style="display: none;" v-if="event.user_voted">check_circle</span>
                <span class="material-icons pulse" :class="urgent_event ? 'danger' : 'warning'">notifications</span>
            </div>
        </div>
        <div class="event-footer">
            <div class="event-informations">
                <div class="creator-tag">
                    {{ event.criador_tag }}
                </div>
                <div class="music-quantity">
                    <span class="material-icons">playlist_play</span>
                    <p>{{ returnMusicText(event.quantidade_musicas) }}</p>
                </div>
            </div>
            <div class="members-list contract-avatar">
                <div class="member" v-for="(member, index) in event.membros_evento" :key="index">
                    <img :src="member.imagem_usuario" class="avatar-pp border-img" v-on:mouseenter="pushAvatars(member.id_usuario)" v-on:mouseleave="restoreAvatars(member.id_usuario)" :id="'member-' + member.id_usuario" v-if="index < 4">
                    <div class="avatar-pp avatar-information" v-if="index == 5">
                        <span class="material-icons">add</span>
                        {{ event.quantidade_membros - index }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import moment from 'moment';

export default {
    name: "eventComponent",
    mixins: [globalMethods],
    props: ["event"],
    data() {
        return {
            event_close: "",
            urgent_event: false
        }
    },
    methods: {
        goToEvent: function (event_id) {
            this.$router.push("/home/event/" + event_id);
        },
        returnCloseText: function () {
            let startDate = moment(this.event.data_inicio_evento);
            let dateDiff = startDate.diff(this.current_date, 'days');

            return "Faltam " + dateDiff + " dias";
        },
        checkIfEventIsClose: function () {
            let startDate = moment(this.event.data_inicio_evento);
            let dateDiff = startDate.diff(this.current_date, 'days');

            if (dateDiff < 5) {
                this.event_close = "Evento próximo - ";
                this.urgent_event = true;
            }
        }
    },
    mounted: function () {
        this.checkIfEventIsClose();
    }
}
</script>
<style scoped>
.event-container {
    background: var(--secondary-secondary-blue-high-2);
    border-radius: 10px;
    padding: 10px;
    margin: 1rem 0;
}

.event-icons {
    margin-left: 1rem;
    display: flex;
    flex-wrap: wrap;
}

    .event-icons span {
        margin: 10px;
    }

.event-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
}

.event-footer {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.creator-tag {
    background: rgba(255, 255, 255, 0.26);
    border-radius: 10px;
    width: fit-content;
    padding: 0 10px;
}

.music-quantity, .event-footer .event-informations {
    display: flex;
    align-items: center;
}

.event-footer .event-informations .creator-tag {
    margin-right: 1rem;
}

.members-list {
    display: flex;
    align-items: center;
}
</style>