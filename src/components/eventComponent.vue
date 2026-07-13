<template>
    <div class="event-card-container" v-on:click="goToEvent(event.id_evento)">
        <div class="event-card-header">
            <div class="event-meta">
                <span class="date-badge" :class="{ 'badge-urgent': urgent_event }">
                    <span class="material-icons-outlined badge-icon">schedule</span>
                    <span>{{ event_close }} {{ returnCloseText() }}</span>
                </span>
                <span class="material-icons pulse-bell pulse" :class="urgent_event ?'danger' : 'warning'">notifications</span>
            </div>
            <h4 class="event-title">{{ event.nome_evento }}</h4>
            <div class="event-time">
                <span class="material-icons time-icon">today</span>
                <span>{{ formatEventDate(event.data_inicio_evento) }}</span>
            </div>
        </div>
        <div class="event-card-footer">
            <div class="footer-left">
                <div class="creator-tag" v-if="event.criador_tag">
                    {{ event.criador_tag }}
                </div>
                <div class="music-count-badge">
                    <span class="material-icons music-badge-icon">library_music</span>
                    <p>{{ returnMusicText(event.quantidade_musicas) }}</p>
                </div>
            </div>
            <div class="members-stack contract-avatar">
                <template v-for="(member, index) in event.membros_evento" :key="index">
                    <img :src="member.imagem_usuario" class="avatar-pp border-img" v-on:mouseenter="pushAvatars(member.id_usuario)" v-on:mouseleave="restoreAvatars(member.id_usuario)" :id="'member-' + member.id_usuario" v-if="index < 4" :alt="member.nome_usuario">
                    <div class="avatar-pp avatar-information" v-if="index == 5">
                        <span class="material-icons">add</span>
                        <span>{{ event.quantidade_membros - index }}</span>
                    </div>
                </template>
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
            let returnText = "Faltam " + dateDiff + " dias";

            if (dateDiff == 0) {
                returnText = "Hoje";
            }

            return returnText;
        },
        checkIfEventIsClose: function () {
            let startDate = moment(this.event.data_inicio_evento);
            let dateDiff = startDate.diff(this.current_date, 'days');

            if (dateDiff < 5) {
                this.event_close = "Próximo - ";
                this.urgent_event = true;
            }
        },
        formatEventDate: function (date) {
            // Capitalizar primeiro caractere do dia da semana retornado pelo moment
            let rawDate = moment.parseZone(date).format("dddd, DD/MM/YYYY [às] HH:mm");
            return rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
        }
    },
    mounted: function () {
        this.checkIfEventIsClose();
    }
}
</script>
<style scoped>
.event-card-container {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 16px;
    margin: 12px 0;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.event-card-container:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.event-card-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.event-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.date-badge {
    background-color: var(--secondary-blue-soft-2);
    color: var(--secondary-blue-soft);
    font-size: var(--font-size-5);
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.badge-urgent {
    background-color: var(--red-high);
    color: var(--others-red);
}

.badge-icon {
    font-size: 14px;
}

.pulse-bell {
    font-size: 20px;
}

.event-title {
    font-size: var(--font-size-h4);
    font-weight: 700;
    margin: 0;
    color: var(--neutral-white);
    line-height: 1.3;
}

.event-time {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
}

.time-icon {
    font-size: 16px;
    color: var(--secondary-blue-soft);
}

.event-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 12px;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.music-count-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

.music-badge-icon {
    font-size: 18px;
    color: var(--others-yellow);
}

.members-stack {
    display: flex;
    align-items: center;
}

.members-stack .avatar-pp {
    width: 34px;
    height: 34px;
    border: 2.5px solid var(--primary-bg-light);
}

.members-stack .avatar-information {
    background: var(--primary-primary-blue-high);
    font-size: 10px;
}

@media (max-width: 480px) {
    .event-card-container {
        padding: 14px;
    }
    
    .event-title {
        font-size: var(--font-size-3);
    }
    
    .footer-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }
    
    .event-card-footer {
        padding-top: 10px;
    }
}
</style>
