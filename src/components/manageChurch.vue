<template>
    <div class="manage-church">
        <div class="manage-container">
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
                        <span>{{ canManageMembers ?"Gerenciar" : "Ver" }} membros</span>
                    </router-link>
                </div>
                <div class="church-action">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/events'">
                        <span class="material-icons">event</span>
                        <span>Calendário de cultos</span>
                    </router-link>
                </div>
                <div class="church-action" v-if="canConfigureChurch">
                    <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/config'">
                        <span class="material-icons">settings</span>
                        <span>Configurações da igreja</span>
                    </router-link>
                </div>
            </div>
            <div class="warnings">
                <h5>Avisos</h5>
                <commentsComponent type="aviso" :can-create-thread="canCreateWarnings" :can-manage-thread="canManageWarnings"></commentsComponent>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import commentsComponent from "./commentsComponent.vue";
import api from '../config/api';
import { appStore } from '../store/appStore';

export default {
    name: "manageChurch",
    mixins: [globalMethods],
    data() {
        return {
            canManageChurch: false,
            canManageMembers: false,
            canConfigureChurch: false,
            canCreateWarnings: false,
            canManageWarnings: false
        }
    },
    methods: {
        updateActionPermissions: function () {
            this.canManageChurch = this.haveAdminPermission || this.haveAppPermission;
            this.canManageMembers = this.canManageChurch || this.hasChurchPermission("members.manage") || this.hasChurchPermission("members.invite") || this.hasChurchPermission("members.remove") || this.hasChurchPermission("members.roles") || this.hasChurchPermission("members.tags");
            this.canConfigureChurch = this.canManageChurch || this.hasChurchPermission("members.roles") || this.hasChurchPermission("members.tags");
            this.canCreateWarnings = this.canManageChurch || this.hasChurchPermission("warnings.create");
            this.canManageWarnings = this.canManageChurch || this.hasChurchPermission("warnings.edit") || this.hasChurchPermission("warnings.delete");
        },
        loadChurchPermission: function () {
            const churchId = this.getCurrentChurchId();
            const currentChurch = this.getCurrentChurchInLocalStorage();
            const cachedAdmin = currentChurch ? currentChurch.administrador : null;
            const hasCachedPermission = typeof cachedAdmin === "boolean" || cachedAdmin === 0 || cachedAdmin === 1 || cachedAdmin === "0" || cachedAdmin === "1";

            if (currentChurch && currentChurch.id_igreja == churchId && hasCachedPermission && (cachedAdmin === true || cachedAdmin === 1 || cachedAdmin === "1")) {
                this.canManageChurch = cachedAdmin === true || cachedAdmin === 1 || cachedAdmin === "1";
                appStore.setChurchPermission({
                    administrador: this.canManageChurch,
                    apenas_membro: !this.canManageChurch,
                    permissions: []
                });
                this.updateActionPermissions();
                return;
            }

            if (!churchId) {
                return;
            }

            if (appStore.state.church && appStore.state.church.id_igreja == churchId) {
                this.canManageChurch = appStore.state.churchPermission.administrador;
                this.updateActionPermissions();
                return;
            }

            api.post("/igreja/permissao", { id_igreja: churchId })
                .then((response) => {
                    appStore.setChurchPermission(response.data.returnObj);
                    this.canManageChurch = response.data.returnObj.administrador == 1 || response.data.returnObj.administrador === true;
                    this.updateActionPermissions();
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
