<template>
    <div class="church-events">
        <div class="church-profile">
            <img :src="igreja.imagem_igreja" class="avatar-p">
            <div class="church-informations">
                <h5>{{ igreja.nome_igreja }}</h5>
                <p class="font-size-3">{{ returnMembersText(igreja.quantidade_membros) }}</p>
            </div>
        </div>
        <div class="church-events">
            <h5>Eventos</h5>
            <div class="church-events-list">
                <eventComponent v-for="(event, index) in eventos" :event="event" :key="index" />
            </div>
        </div>
        <div class="create-event-button-container">
            <button class="btn primary create-event" v-on:click="createEvent()">
                Novo Evento
                <span class="material-icons">add</span>
            </button>
        </div>
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm()">
            <createEventModalContent @church="igreja" @success="closeModal()" />
        </modal>
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
    methods: {
        createEvent: function () {
            this.showModal = true;
            this.modalTitle = "Novo evento";
            this.modalButtonTitle = "Criar evento";
        },
        returnEvents: function () {
            let self = this;
            let data = {
                id_igreja: self.igreja.id_igreja
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