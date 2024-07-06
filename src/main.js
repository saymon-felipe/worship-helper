import { createApp, VueElement } from 'vue';
import App from './App.vue';
import router from './router';
import api from './config/api';

const app = createApp(App);

app.config.globalProperties.igreja = {
    imagem_igreja: "",
    nome_igreja: ""
}

app.config.globalProperties.haveAdminPermission = false;
app.config.globalProperties.is_member = false;
app.config.globalProperties.haveAppPermission = false;

function getMyChurch() {
    let church_id = this.$route.params.id_igreja;

    if (church_id == undefined) {
        church_id = JSON.parse(sessionStorage.getItem("current_church")).id_igreja;
    }

    let data = {
        id_igreja: church_id
    }

    api.post("/igreja/retorna-igreja", data)
        .then(function (response) {
            app.config.globalProperties.igreja = response.data.returnObj;
        })
        .catch(function (error) {
            console.log(error)
        })
}

app.config.globalProperties.getMyChurch = getMyChurch;

function checkPermission() {
    let church_id = this.$route.params.id_igreja;
    let localStorageChurch = JSON.parse(sessionStorage.getItem("current_church"));

    if (church_id == undefined) {
        church_id = localStorageChurch != undefined ? localStorageChurch.id_igreja : undefined;
    }
    
    if (church_id == undefined) return;

    let data = {
        id_igreja: church_id
    }

    api.post("/igreja/permissao", data)
        .then(function (response) {
            app.config.globalProperties.haveAdminPermission = response.data.returnObj.administrador;
            app.config.globalProperties.is_member = response.data.returnObj.apenas_membro;
            
            app.config.globalProperties.getMyChurch();
        })
}

app.config.globalProperties.checkPermission = checkPermission;

function checkAppPermission() {
    api.post("/usuario/app_administrator")
        .then(function () {
            app.config.globalProperties.haveAppPermission = true;
        })
        .catch(function () {
            app.config.globalProperties.haveAppPermission = false;
        })
}

app.config.globalProperties.checkAppPermission = checkAppPermission;

app.use(router);

app.mount('#app');
