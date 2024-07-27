<template>
    <div class="manage-church">
        <div class="container">
            <div class="event-list">
                <h5>Eventos</h5>
                <eventComponent :event="event" v-for="(event, index) in eventos" :key="index" />
                <div class="church-empty" v-if="eventos.length <= 0">
                    <h5>Vazio!</h5>
                    <p>Nenhum evento disponível para a sua igreja</p>
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
    name: "manageChurch",
    mixins: [globalMethods],
    data() {
        return {
            eventos: []
        }
    },
    methods: {
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
        setTimeout(() => {
            this.returnEvents();
        }, 100);
    },
    components: {
        eventComponent
    }
}
</script>
<style scoped>
a {
    text-decoration: none;
    color: var(--neutral-white);
}

.manage-church {
    color: var(--neutral-white);
    padding-bottom: 7rem;
}
</style>