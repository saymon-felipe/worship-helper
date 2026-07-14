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
        <div class="church-events">
            <h5>Eventos</h5>
            <div class="church-events-list">
                <eventComponent v-for="(event, index) in eventos" :event="event" :key="index" v-if="eventos.length > 0" />
                <div class="church-empty" v-else>
                    <span class="material-icons empty-icon" style="font-size: 48px; color: var(--neutral-gray-low); margin-bottom: 12px;">event_busy</span>
                    <h5>Nenhum evento agendado</h5>
                    <p>Crie um novo evento para escalar membros e planejar o repertório.</p>
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
                <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm(); returnEvents();">
                    <createEventModalContent @church="igreja" @success="closeModal(); returnEvents();" />
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
import api from '../config/api';

export default {
    name: "churchEvents",
    mixins: [globalMethods],
    data() {
        return {
            eventos: []
        }
    },
    computed: {
        canCreateEvent: function () {
            return this.hasChurchPermission("events.create");
        }
    },
    methods: {
        createEvent: function () {
            this.showModal = true;
            this.modalTitle = "Novo evento";
            this.modalButtonTitle = "Criar evento";
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
        this.returnEvents();
    },
    components: {
        modal,
        createEventModalContent,
        eventComponent
    }
}
</script>
<style scoped>
.church-events {
    position: relative;
    margin-top: 1rem;
    height: calc(100% - 44px);
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
