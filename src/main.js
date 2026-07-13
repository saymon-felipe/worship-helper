import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import api from './config/api';
import { moment, momentTimezone } from './config/moment';
import { appStore } from './store/appStore';

const app = createApp(App);

const emptyChurch = {
    imagem_igreja: "",
    nome_igreja: ""
};

Object.defineProperty(app.config.globalProperties, "igreja", {
    get() {
        return appStore.state.church || emptyChurch;
    },
    set(value) {
        appStore.setChurch(value);
    }
});

Object.defineProperty(app.config.globalProperties, "haveAdminPermission", {
    get() {
        return appStore.state.churchPermission.administrador;
    },
    set(value) {
        appStore.setChurchPermission({
            ...appStore.state.churchPermission,
            administrador: value
        });
    }
});

Object.defineProperty(app.config.globalProperties, "is_member", {
    get() {
        return appStore.state.churchPermission.apenas_membro;
    },
    set(value) {
        appStore.setChurchPermission({
            ...appStore.state.churchPermission,
            apenas_membro: value
        });
    }
});

Object.defineProperty(app.config.globalProperties, "haveAppPermission", {
    get() {
        return appStore.state.auth.isAppAdmin;
    },
    set() {}
});

app.config.globalProperties.$appStore = appStore.state;
app.config.globalProperties.$globalState = appStore.state;
app.config.globalProperties.moment = moment;
app.config.globalProperties.momentTimezone = momentTimezone;

function getCurrentChurchId() {
    let churchId = app.config.globalProperties.$route.params.id_igreja;

    if (churchId == undefined) {
        const storedChurch = JSON.parse(sessionStorage.getItem("current_church"));
        churchId = storedChurch ? storedChurch.id_igreja : undefined;
    }

    return churchId != undefined && !isNaN(churchId) ? parseInt(churchId, 10) : undefined;
}

function isCachedAdminPermission(value) {
    return typeof value === "boolean" || value === 0 || value === 1 || value === "0" || value === "1";
}

function isAdminPermission(value) {
    return value === true || value === 1 || value === "1";
}

function getMyChurch() {
    const churchId = getCurrentChurchId();

    if (churchId == undefined) {
        appStore.state.loadingApp = false;
        return;
    }

    if (appStore.state.church && appStore.state.church.id_igreja == churchId) {
        appStore.state.loadingApp = false;
        return;
    }

    api.post("/igreja/retorna-igreja", { id_igreja: churchId })
        .then(function (response) {
            appStore.setChurch(response.data.returnObj);
            appStore.state.loadingApp = false;
        })
        .catch(function (error) {
            console.log(error);
            appStore.state.loadingApp = false;
        });
}

app.config.globalProperties.getMyChurch = getMyChurch;

function checkPermission() {
    if (window.location.pathname == "/home") {
        appStore.state.loadingApp = false;
        return;
    }

    const churchId = getCurrentChurchId();
    const storedChurch = JSON.parse(sessionStorage.getItem("current_church"));

    if (churchId == undefined) {
        appStore.state.loadingApp = false;
        return;
    }

    if (storedChurch && storedChurch.id_igreja == churchId && isCachedAdminPermission(storedChurch.administrador)) {
        appStore.setChurchPermission({
            administrador: isAdminPermission(storedChurch.administrador),
            apenas_membro: !isAdminPermission(storedChurch.administrador)
        });
        getMyChurch();
        return;
    }

    api.post("/igreja/permissao", { id_igreja: churchId })
        .then(function (response) {
            appStore.setChurchPermission(response.data.returnObj);
            getMyChurch();
        })
        .catch(function (error) {
            console.log(error);
            appStore.state.loadingApp = false;
        });
}

app.config.globalProperties.checkPermission = checkPermission;

function checkAppPermission() {
    return appStore.state.auth.isAppAdmin;
}

app.config.globalProperties.checkAppPermission = checkAppPermission;

app.use(router);

app.mount('#app');
