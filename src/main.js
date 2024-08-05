import { createApp, reactive } from 'vue';
import App from './App.vue';
import router from './router';
import api from './config/api';
import { moment, momentTimezone } from './config/moment';

const app = createApp(App);

app.config.globalProperties.igreja = {
    imagem_igreja: "",
    nome_igreja: ""
}

app.config.globalProperties.haveAdminPermission = false;
app.config.globalProperties.is_member = false;
app.config.globalProperties.haveAppPermission = false;
app.config.globalProperties.moment = moment;
app.config.globalProperties.momentTimezone = momentTimezone;

app.config.globalProperties.$globalState = reactive({
    loadingApp: true
});

function getMyChurch() {
    let church_id = app.config.globalProperties.$route.params.id_igreja;

    if (church_id == undefined) {
        church_id = JSON.parse(sessionStorage.getItem("current_church")).id_igreja;
    }

    let data = {
        id_igreja: church_id
    }

    api.post("/igreja/retorna-igreja", data)
        .then(function (response) {
            app.config.globalProperties.igreja = response.data.returnObj;
            app.config.globalProperties.$globalState.loadingApp = false;
        })
        .catch(function (error) {
            console.log(error)
        })
}

app.config.globalProperties.getMyChurch = getMyChurch;

function checkPermission() {
    if (window.location.pathname != "/home") { //Se entrar aqui está na raiz
        let church_id = app.config.globalProperties.$route.params.id_igreja;
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
                
                getMyChurch();
            })
    } else {
        app.config.globalProperties.$globalState.loadingApp = false;
    }
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
