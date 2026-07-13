<template>
    <div class="choose-church-container">
        <div class="my-groups" v-if="lista_igrejas.length > 0">
            <h3>Minhas igrejas</h3>
            <div class="churches-grid">
                <div v-for="(igreja, index) in lista_igrejas" :key="index" class="church-card">
                    <router-link :to="'/home/church/' + igreja.id_igreja" class="church-link" v-on:click="setCurrentChurchInLocalStorage(igreja)">
                        <img :src="igreja.imagem_igreja || default_church_image" class="church-avatar">
                        <div class="church-details">
                            <h5>{{igreja.nome_igreja}}</h5>
                            <p class="member-count">
                                <span class="material-icons">people_outline</span>
                                <span>{{ returnMembersText(igreja.quantidade_membros) }}</span>
                            </p>
                        </div>
                        <div class="login-action">
                            <span class="material-icons login-icon">login</span>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
        <div class="church-empty" v-else>
            <h5>Nenhuma igreja encontrada</h5>
            <p>Você ainda não é membro de nenhuma igreja. Solicite ao administrador da sua igreja o convite de acesso.</p>
        </div>

        <div class="my-invites" v-if="Object.keys(this.churchInviteList).length > 0">
            <h3>Convites Pendentes</h3>
            <div class="invites-grid">
                <div v-for="(church, index) in churchInviteList" :key="index" class="church-card invite-card">
                    <img :src="church.imagem_igreja || default_church_image" class="church-avatar">
                    <div class="church-details">
                        <h5>{{church.nome_igreja}}</h5>
                        <p class="member-count">
                            <span class="material-icons">people_outline</span>
                            <span>{{ returnMembersText(church.membros) }}</span>
                        </p>
                    </div>
                    <div class="invite-actions">
                        <button class="action-btn accept-btn" v-on:click="acceptInvite(church.id_igreja)" title="Aceitar convite">
                            <span class="material-icons">done</span>
                        </button>
                        <button class="action-btn deny-btn" v-on:click="denyInvite(church.id_igreja)" title="Recusar convite">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="background-button" v-if="haveAppPermission">
            <button class="btn primary register-church" v-on:click="goToRegisterChurchPage()">
                <span class="material-icons">church</span>
                <span>Igrejas cadastradas</span>
            </button>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';

export default {
    name: "chooseChurch",
    mixins: [globalMethods],
    data() {
        return {
            lista_igrejas: [],
            churchInviteList: {}
        }
    },
    methods: {
        getMyChurchs: function () {
            let self = this;

            api.post("/usuario/minhas-igrejas")
                .then(function (response) {
                    self.lista_igrejas = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error)
                })
        },
        getChurchInvitesList: function (reload_churches = false) {
            let self = this;

            api.get("/usuario/retorna-convites")
                .then(function (response) {
                    self.churchInviteList = response.data.returnObj;
                    if (reload_churches) {
                        self.getMyChurchs();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        acceptInvite: function (id_igreja) {
            let self = this;
            let data = {
                id_igreja: id_igreja
            }

            api.post("/usuario/aceita-convite", data)
                .then(function () {
                    self.returnInformations();
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        denyInvite: function (id_igreja) {
            let self = this;
            let data = {
                id_igreja: id_igreja
            }

            api.post("/usuario/rejeita-convite", data)
                .then(function () {
                    self.returnInformations();
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        goToRegisterChurchPage: function () {
            this.$router.push("/register-church");
        },
        returnInformations: function () {
            this.getMyChurchs();
            this.getChurchInvitesList();
        }
    },
    mounted: function () {
        this.returnInformations();
    }
}
</script>
<style scoped>
.choose-church-container {
    padding-bottom: 6rem;
    animation: fadeIn var(--transition-normal);
}

.my-groups, .my-invites {
    margin-bottom: 2.5rem;
}

h3 {
    font-size: var(--font-size-h3);
    font-weight: 700;
    margin-bottom: 1.2rem;
    border-left: 4px solid var(--secondary-blue-soft);
    padding-left: 10px;
    color: var(--neutral-white);
}

.churches-grid, .invites-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.church-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    overflow: hidden;
}

.church-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.church-link {
    display: flex;
    align-items: center;
    padding: 16px;
    text-decoration: none;
    color: var(--neutral-white);
    width: 100%;
}

.church-avatar {
    width: 58px;
    height: 58px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 2px solid var(--secondary-blue-soft);
    margin-right: 16px;
    flex-shrink: 0;
}

.church-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.church-details h5 {
    font-size: var(--font-size-h5);
    font-weight: 600;
    margin: 0;
}

.member-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-4);
    color: var(--neutral-gray-medium);
}

.member-count span.material-icons {
    font-size: 16px;
}

.login-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.05);
    transition: background var(--transition-fast), transform var(--transition-fast);
}

.church-card:hover .login-action {
    background: var(--primary-primary-blue-high-2);
    transform: scale(1.08);
}

.login-icon {
    font-size: 20px;
    color: var(--neutral-white);
}

/* Estilos de Convites */
.invite-card {
    display: flex;
    align-items: center;
    padding: 16px;
}

.invite-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-pill);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--neutral-white);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.action-btn:active {
    transform: scale(0.9);
}

.accept-btn {
    background: linear-gradient(135deg, var(--others-green) 0%, #2fa757 100%);
}

.deny-btn {
    background: linear-gradient(135deg, var(--others-red) 0%, #c43b3b 100%);
}

.action-btn span {
    font-size: 20px;
}

@media (max-width: 480px) {
    .church-avatar {
        width: 48px;
        height: 48px;
        margin-right: 12px;
    }
    
    .church-details h5 {
        font-size: var(--font-size-3);
    }
}
</style>
