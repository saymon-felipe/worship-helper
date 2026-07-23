<template>
    <div class="event-card-container" :class="{ 'past-card': isPastEvent }" v-on:click="goToEvent(event.id_evento)">
        <div class="event-card-header">
            <div class="event-meta">
                <span class="date-badge" :class="{ 'badge-urgent': urgent_event, 'badge-past': isPastEvent }">
                    <span class="material-icons badge-icon">{{ isPastEvent ? 'check_circle' : 'schedule' }}</span>
                    <span>{{ isPastEvent ? '' : event_close }}{{ returnCloseText() }}</span>
                </span>
                <span class="material-icons pulse-bell pulse" :class="urgent_event ? 'danger' : 'warning'" v-if="!isPastEvent">notifications</span>
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
import 'moment/locale/pt-br';
moment.locale('pt-br');

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
    computed: {
        isPastEvent: function () {
            if (!this.event || !this.event.data_inicio_evento) return false;
            return moment.parseZone(this.event.data_inicio_evento).isBefore(moment());
        }
    },
    methods: {
        goToEvent: function (event_id) {
            this.$router.push("/home/event/" + event_id);
        },
        returnCloseText: function () {
            if (this.isPastEvent) {
                return "Encerrado";
            }
            const dateDiff = this.eventDayDifference();
            let returnText = "Faltam " + dateDiff + " dias";

            if (dateDiff === 0) {
                returnText = "Hoje";
            } else if (dateDiff === 1) {
                returnText = "Amanhã";
            }

            return returnText;
        },
        checkIfEventIsClose: function () {
            if (this.isPastEvent) {
                this.urgent_event = false;
                return;
            }
            const dateDiff = this.eventDayDifference();

            if (dateDiff >= 0 && dateDiff < 5) {
                this.event_close = "Próximo - ";
                this.urgent_event = true;
            }
        },
        eventDayDifference: function () {
            const eventDay = moment.parseZone(this.event.data_inicio_evento).format('YYYY-MM-DD');
            const startDate = moment(eventDay, 'YYYY-MM-DD').startOf('day');
            const today = moment().startOf('day');
            return startDate.diff(today, 'days');
        },
        formatEventDate: function (date) {
            moment.locale('pt-br');
            const eventDate = moment.parseZone(date).locale('pt-br');
            const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
            return weekdays[eventDate.day()] + eventDate.format(", DD/MM/YYYY [às] HH:mm");
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
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
}

.past-card {
    opacity: 0.85;
}

.event-card-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.event-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.date-badge {
    background-color: rgba(56, 182, 255, 0.1);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-urgent {
    background-color: rgba(241, 76, 76, 0.1);
    border-color: rgba(241, 76, 76, 0.25);
    color: var(--others-red);
}

.badge-past {
    background-color: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    color: var(--neutral-gray-medium);
}

.badge-icon {
    font-size: 14px;
}

.pulse-bell {
    font-size: 18px;
}

.event-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    color: var(--neutral-white);
    line-height: 1.35;
    letter-spacing: -0.3px;
}

.event-time {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

.time-icon {
    font-size: 15px;
    color: var(--secondary-blue-soft);
}

.event-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 12px;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.creator-tag {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--neutral-gray-high);
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.music-count-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-high);
    font-weight: 600;
}

.music-badge-icon {
    font-size: 16px;
    color: var(--secondary-blue-soft);
}

.members-stack {
    display: flex;
    align-items: center;
}

.members-stack .avatar-pp {
    width: 28px;
    height: 28px;
    border: 2px solid #201d3a;
    border-radius: var(--radius-pill);
    margin-right: -8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    transition: all var(--transition-fast);
    object-fit: cover;
}

.members-stack .avatar-pp:hover {
    transform: translateY(-2px);
    z-index: 10;
}

.members-stack .avatar-information {
    background: var(--primary-primary-blue-high-2);
    font-size: 10px;
    font-weight: 700;
    color: var(--neutral-white);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 2px solid #201d3a;
    border-radius: var(--radius-pill);
    margin-right: -8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
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
