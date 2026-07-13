<template>
    <div class="church-dashboard">
        <div class="container">
            <button class="latest-warning-banner" v-if="latestWarning" type="button" v-on:click="goToWarnings()">
                <div class="banner-icon">
                    <span class="material-icons">campaign</span>
                </div>
                <div class="banner-content">
                    <div class="banner-meta">
                        <span>Último aviso</span>
                        <span>{{ returnRelativeData(latestWarning.data_criacao) }}</span>
                    </div>
                    <h4>{{ latestWarning.mensagem }}</h4>
                    <div class="banner-footer">
                        <span>{{ latestWarning.criador.nome_usuario }}</span>
                        <span class="banner-dot"></span>
                        <span>{{ formatResponsesCount(latestWarning.quantidade_respostas) }}</span>
                    </div>
                </div>
                <span class="material-icons banner-arrow">chevron_right</span>
            </button>

            <div class="event-list-header">
                <h3>Próximos Eventos</h3>
                <p class="subtitle">Acompanhe as escalas e programações agendadas</p>
            </div>
            <div class="event-list-content">
                <eventComponent :event="event" v-for="(event, index) in eventos" :key="index" />
                <div class="church-empty" v-if="eventos.length <= 0">
                    <span class="material-icons empty-icon">calendar_today</span>
                    <h5>Nenhum evento agendado</h5>
                    <p>Fique atento! Novas escalas e cultos aparecerão aqui em breve.</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import eventComponent from "./eventComponent.vue";
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';

export default {
    name: "churchDashboard",
    mixins: [globalMethods],
    data() {
        return {
            eventos: [],
            latestWarning: null
        }
    },
    methods: {
        returnRelativeData: function (data) {
            return this.relativeTime(data);
        },
        formatResponsesCount: function (count) {
            return count === 1 ? "1 resposta" : `${count || 0} respostas`;
        },
        goToWarnings: function () {
            const churchId = this.getCurrentChurchId();

            if (churchId) {
                this.$router.push("/home/manage-church/" + churchId);
            }
        },
        returnLatestWarning: function () {
            let self = this;
            let churchId = self.getCurrentChurchId();

            if (churchId == null) {
                return;
            }

            api.post("/igreja/ultimo-aviso", { id_igreja: churchId })
            .then(function (response) {
                self.latestWarning = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        returnEvents: function () {
            let self = this;
            let churchId = self.getCurrentChurchId();

            if (churchId == null) {
                return;
            }

            let data = {
                id_igreja: churchId
            }

            api.post("/igreja/retorna-eventos", data)
            .then(function (response) {
                self.eventos = response.data.returnObj;
            })
            .catch(function (error) {
                console.log(error);
            })
        }
    },
    mounted: function () {
        setTimeout(() => {
            this.returnLatestWarning();
            this.returnEvents();
        }, 100);
    },
    components: {
        eventComponent
    }
}
</script>
<style scoped>
.church-dashboard {
    color: var(--neutral-white);
    padding-bottom: 7rem;
    animation: fadeIn var(--transition-normal);
}

.event-list-header {
    margin-bottom: 1.5rem;
}

.latest-warning-banner {
    width: 100%;
    border: 1px solid rgba(56, 182, 255, 0.24);
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, rgba(56, 182, 255, 0.14), rgba(63, 57, 161, 0.18));
    color: var(--neutral-white);
    display: grid;
    grid-template-columns: 44px 1fr 24px;
    gap: 12px;
    align-items: center;
    padding: 14px;
    margin-bottom: 18px;
    text-align: left;
    cursor: pointer;
    box-shadow: var(--card-shadow);
}

.banner-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(56, 182, 255, 0.14);
    color: var(--secondary-blue-soft);
}

.banner-content {
    min-width: 0;
}

.banner-meta,
.banner-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
    font-weight: 700;
}

.banner-meta span:first-child {
    color: var(--secondary-blue-soft);
    text-transform: uppercase;
}

.latest-warning-banner h4 {
    margin: 3px 0 5px;
    font-size: var(--font-size-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.banner-dot {
    width: 4px;
    height: 4px;
    border-radius: var(--radius-pill);
    background: var(--neutral-gray-low);
}

.banner-arrow {
    color: var(--secondary-blue-soft);
}

h3 {
    font-size: var(--font-size-h3);
    font-weight: 700;
    margin-bottom: 4px;
    border-left: 4px solid var(--secondary-blue-soft);
    padding-left: 10px;
}

.subtitle {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
    margin-left: 14px;
}

.event-list-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.church-empty {
    margin-top: 2rem;
    text-align: center;
    padding: 3rem 1.5rem;
    border: 1.5px dashed rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.empty-icon {
    font-size: 40px;
    color: var(--neutral-gray-low);
    margin-bottom: 8px;
}

.church-empty h5 {
    font-size: var(--font-size-h5);
    font-weight: 600;
    color: var(--neutral-gray-medium);
}

.church-empty p {
    font-size: var(--font-size-4);
    color: var(--neutral-gray-low);
    max-width: 320px;
}
</style>

