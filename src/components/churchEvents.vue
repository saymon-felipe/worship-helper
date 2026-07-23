<template>
    <div class="church-events">
        <div class="church-profile" v-if="igreja.id_igreja && igreja.id_igreja == getCurrentChurchId()">
            <img :src="igreja.imagem_igreja || default_church_image" class="avatar-p">
            <div class="church-informations">
                <h5>{{ igreja.nome_igreja }}</h5>
                <p v-if="igreja.quantidade_membros !== undefined && igreja.quantidade_membros !== null">
                    <span class="material-icons" style="font-size: 16px;">people</span>
                    <span>{{ returnMembersText(igreja.quantidade_membros) }}</span>
                </p>
            </div>
        </div>
        <div class="church-events-content">
            <div class="events-header-row">
                <h5>{{ activeEventTab === 'past' ? 'Eventos Anteriores' : 'Eventos Agendados' }}</h5>
            </div>
            <div class="event-tabs-container">
                <div class="event-tabs">
                    <div class="tab-indicator" :style="indicatorStyle"></div>
                    <button type="button" class="tab-btn" :class="{ active: activeEventTab === 'upcoming' }" @click="setEventTab('upcoming')">
                        Próximos
                    </button>
                    <button type="button" class="tab-btn" :class="{ active: activeEventTab === 'past' }" @click="setEventTab('past')">
                        Anteriores
                    </button>
                </div>
            </div>
            <div class="church-events-list">
                <skeletonLoader v-if="isLoading" type="event-card" :count="3" />
                <template v-else-if="eventos.length > 0">
                    <eventComponent v-for="(event, index) in eventos" :event="event" :key="index" />
                </template>
                <div class="church-empty" v-else>
                    <span class="material-icons empty-icon" style="font-size: 48px; color: var(--neutral-gray-low); margin-bottom: 12px;">{{ activeEventTab === 'past' ? 'history_toggle_off' : 'event_busy' }}</span>
                    <h5>{{ activeEventTab === 'past' ? 'Nenhum evento anterior encontrado' : 'Nenhum evento agendado' }}</h5>
                    <p>{{ activeEventTab === 'past' ? 'Os eventos encerrados da igreja serão exibidos aqui.' : 'Crie um novo evento para escalar membros e planejar o repertório.' }}</p>
                </div>
            </div>
        </div>
        <div class="create-event-button-container">
            <button class="btn primary create-event" v-on:click="createEvent()" v-if="canCreateEvent">
                Novo Evento
                <span class="material-icons">add</span>
            </button>
        </div>
        <Teleport to="body">
            <Transition name="modal-fade">
                <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
                    <createEventModalContent @church="igreja" @success="handleEventCreated" />
                </modal>
            </Transition>
        </Teleport>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import createEventModalContent from "./createEventModalContent.vue";
import eventComponent from "./eventComponent.vue";
import modal from "./modal.vue";
import skeletonLoader from "./skeletonLoader.vue";
import api from '../config/api';

export default {
    name: "churchEvents",
    mixins: [globalMethods],
    data() {
        return {
            isLoading: true,
            eventos: [],
            activeEventTab: 'upcoming'
        }
    },
    computed: {
        canCreateEvent: function () {
            return this.hasChurchPermission("events.create");
        },
        indicatorStyle() {
            return {
                transform: this.activeEventTab === 'past' ? 'translateX(100%)' : 'translateX(0)'
            };
        }
    },
    methods: {
        createEvent: function () {
            this.showModal = true;
            this.modalTitle = "Novo evento";
            this.modalButtonTitle = "Criar evento";
        },
        setEventTab: function (tab) {
            if (this.activeEventTab === tab) return;
            this.activeEventTab = tab;
            this.returnEvents();
        },
        returnEvents: function () {
            let self = this;
            let churchId = self.getCurrentChurchId();

            if (churchId == null) {
                self.isLoading = false;
                return;
            }

            let data = {
                id_igreja: churchId,
                tipo: self.activeEventTab
            }

            self.isLoading = true;
            api.post("/igreja/retorna-eventos", data)
            .then(function (response) {
                self.eventos = response.data.returnObj || [];
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
                self.isLoading = false;
            });
        },
        handleEventCreated: function (event) {
            if (event) {
                this.eventos.push(event);
                this.eventos.sort((first, second) => new Date(first.data_inicio_evento) - new Date(second.data_inicio_evento));
            }
            this.closeModal();
        }
    },
    mounted: function () {
        this.returnEvents();
    },
    components: {
        modal,
        createEventModalContent,
        eventComponent,
        skeletonLoader
    }
}
</script>
<style scoped>
.church-events {
    position: relative;
    margin-top: 1rem;
    height: calc(100% - 44px);
}

.events-header-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.event-tabs-container {
    width: 100%;
    margin-bottom: 1.25rem;
    display: flex;
    justify-content: center;
}

.event-tabs {
    position: relative;
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-pill);
    padding: 3px;
    width: 100%;
}

.tab-indicator {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(50% - 3px);
    background: var(--primary-primary-blue-high-2);
    border-radius: var(--radius-pill);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.tab-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    background: transparent;
    border: none;
    color: var(--neutral-gray-medium);
    font-size: 13px;
    font-weight: 600;
    padding: 8px 0;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: color 0.3s;
}

.tab-btn.active {
    color: var(--neutral-white);
}

.create-event {
    display: flex;
    align-items: center;
    justify-content: center;
}

    .create-event span {
        margin-left: 1rem;
        font-size: var(--font-size-h3);
        font-weight: bold;
    }

.create-event-button-container {
    position: absolute;
    bottom: -90px;
    width: 100%;
}

    .create-event-button-container button {
        margin: auto;
    }

.church-events-list {
    height: 53vh;
    overflow-y: auto;
}
</style>
