<template>
    <div class="choose-church">
        <div class="my-groups">
            <h3>Minhas igrejas</h3>
            <div v-for="(igreja, index) in lista_igrejas" :key="index" class="church">
                <router-link :to="'/home/church/' + igreja.id_igreja" class="church-link" v-on:click="setCurrentChurchInLocalStorage(igreja)">
                    <img :src="igreja.imagem_igreja" class="avatar-p">
                    <div class="church-informations">
                        <h5>{{igreja.nome_igreja}}</h5>
                        <p class="font-size-3">{{ returnMembersText(igreja.quantidade_membros)}} </p>
                    </div>
                    <span class="material-icons login-icon">login</span>
                </router-link>
            </div>
            <div class="church-empty" v-if="lista_igrejas.length <= 0">
                <h5>Vazio!</h5>
                <p>Você ainda não é membro de nenhuma igreja, contate o responsável pela sua igreja e peça para entrar no Worship Helper</p>
            </div>
        </div>
        <div class="my-invites" v-if="Object.keys(this.churchInviteList).length > 0">
            <h3>Convites</h3>
            <div v-for="(church, index) in churchInviteList" :key="index" class="church">
                <img :src="church.imagem_igreja" class="avatar-p">
                <div class="church-informations">
                    <h5>{{church.nome_igreja}}</h5>
                    <p class="font-size-3">{{returnMembersText(church.membros)}}</p>
                </div>
                <div class="invite-actions">
                    <span class="material-icons accept-invite" v-on:click="acceptInvite(church.id_igreja)">done</span>
                    <span class="material-icons exclude-invite" v-on:click="denyInvite(church.id_igreja)">clear</span>
                </div>
            </div>
        </div>
        <div class="background-button" v-if="haveAppPermission">
            <button class="btn primary register-church" v-on:click="goToRegisterChurchPage()">Cadastrar igreja</button>
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
            lista_igrejas: {},
            churchInviteList: {},
            haveAppPermission: false
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
                    location.reload();
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
                    location.reload();
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        goToRegisterChurchPage: function () {
            this.$router.push("/register-church");
        }
    },
    mounted: function () {
        this.checkAppPermission();
        this.getMyChurchs();
        this.getChurchInvitesList();
    }
}
</script>
<style scoped>
.accept-invite, .exclude-invite {
    color: var(--neutral-white);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-left: 10px;
    cursor: pointer;
}
.exclude-invite {
    background: var(--others-red);
}

.accept-invite {
    background: var(--others-green);
}
.invite-actions {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;
}
.choose-church {
    color: var(--neutral-white);
}

.church-link {
    display: flex;
    text-decoration: none;
    align-items: center;
    color: var(--neutral-white);
    width: 100%;
}

.church .login-icon {
    position: absolute;
    right: 0;
}

</style>