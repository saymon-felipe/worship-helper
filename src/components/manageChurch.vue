<template>
    <div class="manage-church">
        <div class="manage-container">
            <div class="church-profile">
                <img :src="igreja.imagem_igreja" class="avatar-p">
                <div class="church-informations">
                    <h5>{{ igreja.nome_igreja }}</h5>
                    <p>
                        <span class="material-icons" style="font-size: 16px;">people</span>
                        <span>{{ returnMembersText(igreja.quantidade_membros) }}</span>
                    </p>
                </div>
            </div>
            <div class="church-actions-container">
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/musics'">
                        <span class="material-icons">playlist_play</span>
                        <span>Acervo de músicas</span>
                    </router-link>
                </div>
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/members'">
                        <span class="material-icons">group</span>
                        <span>{{ canManageChurch ?"Gerenciar" : "Ver" }} membros</span>
                    </router-link>
                </div>
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/events'">
                        <span class="material-icons">event</span>
                        <span>Calendário de cultos</span>
                    </router-link>
                </div>
                <div class="church-action" v-if="canManageChurch">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/config'">
                        <span class="material-icons">settings</span>
                        <span>Configurações da igreja</span>
                    </router-link>
                </div>
            </div>
            <div class="warnings">
                <h5>Avisos</h5>
                <commentsComponent type="aviso" :can-create-thread="canManageChurch"></commentsComponent>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import commentsComponent from "./commentsComponent.vue";
import api from '../config/api';

export default {
    name: "manageChurch",
    mixins: [globalMethods],
    data() {
        return {
            canManageChurch: false
        }
    },
    methods: {
        loadChurchPermission: function () {
            const churchId = this.getCurrentChurchId();
            const currentChurch = this.getCurrentChurchInLocalStorage();

            if (currentChurch && currentChurch.id_igreja == churchId) {
                this.canManageChurch = currentChurch.administrador == 1 || currentChurch.administrador === true;
            }

            if (!churchId) {
                return;
            }

            api.post("/igreja/permissao", { id_igreja: churchId })
                .then((response) => {
                    this.canManageChurch = response.data.returnObj.administrador == 1 || response.data.returnObj.administrador === true;
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    mounted: function () {
        this.loadChurchPermission();
    },
    components: {
        commentsComponent
    }
    
}
</script>
<style scoped>
.church-action {
    background: var(--primary-primary-blue-medium);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    border-radius: 10px;
    cursor: pointer;
    text-align: center;
    margin: 1rem;
    padding: 1rem;
}

    .church-action span:first-child {
        font-size: var(--font-size-h2);
    }

    .church-action a {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

.church-actions-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

@media (max-width: 372px) {
    .church-action {
        width: 105px;
        height: 105px;
        margin: .5rem;
    }

        .church-action span:first-child {
            font-size: var(--font-size-h4);
        }
}
</style>
