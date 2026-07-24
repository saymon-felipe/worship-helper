import $ from 'jquery';
import api from '../config/api';
import { appStore } from '../store/appStore';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

const currentChurchStorageKey = "wh_current_church";

const permissionParents = {
    "members.invite": "members.manage",
    "members.remove": "members.manage",
    "members.roles": "members.manage",
    "members.tags": "members.manage",
    "events.create": "events.manage",
    "events.edit": "events.manage",
    "music.create": "music.manage",
    "music.delete": "music.manage",
    "music.cifra.edit": "music.manage",
    "warnings.create": "warnings.manage",
    "warnings.edit": "warnings.manage",
    "warnings.delete": "warnings.manage"
};

export const globalMethods = {
    methods: {
        setCurrentChurchInLocalStorage: function (object) {
            let obj = {
                id_igreja: object.id_igreja,
                nome_igreja: object.nome_igreja,
                imagem_igreja: object.imagem_igreja,
                quantidade_membros: object.quantidade_membros,
                administrador: object.administrador
            };

            sessionStorage.setItem("current_church", JSON.stringify(obj));
            localStorage.setItem(currentChurchStorageKey, JSON.stringify(obj));
            appStore.setChurch(obj);
            appStore.setChurchPermission({
                administrador: obj.administrador == 1 || obj.administrador === true,
                apenas_membro: obj.administrador != 1 && obj.administrador !== true,
                permissions: []
            });

            this.checkPermission();
        },
        getCurrentChurchInLocalStorage: function () {
            try {
                const storedChurch = sessionStorage.getItem("current_church") || localStorage.getItem(currentChurchStorageKey);
                return storedChurch ? JSON.parse(storedChurch) : null;
            } catch (error) {
                sessionStorage.removeItem("current_church");
                localStorage.removeItem(currentChurchStorageKey);
                return null;
            }
        },
        getCurrentChurchId: function () {
            let id = null;
            if (this.$route && this.$route.params && this.$route.params.id_igreja != null) {
                id = this.$route.params.id_igreja;
            } else if (this.$route && this.$route.query && this.$route.query.church != null) {
                id = this.$route.query.church;
            } else if (this.igreja && this.igreja.id_igreja != null) {
                id = this.igreja.id_igreja;
            } else {
                let church = this.getCurrentChurchInLocalStorage();
                id = church ? church.id_igreja : null;
            }
            return id != null && !isNaN(id) ? parseInt(id, 10) : null;
        },
        setJwtInLocalStorage: function (jwt) {
            appStore.setToken(jwt);
            this.checkAndSetJwt();
        },
        checkAndSetJwt: function () {
            let jwt = this.getJwtFromLocalStorage();

            if (jwt != null) {
                api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
                this.$root.jwtLoaded = true;
            }
        },
        removeJwtFromLocalStorage: function () {
            appStore.clearAuth();
        },
        getJwtFromLocalStorage: function () {
            return appStore.state.auth.token || localStorage.getItem("wh_jwt");
        },
        resetResponseClass: function (object) {
            if (object.hasClass("success")) {
                object.removeClass("success");
            }
            if (object.hasClass("error")) {
                object.removeClass("error");
            }
        },
        logoutUser: function () {
            this.removeJwtFromLocalStorage();
            this.$router.push("/login");
        },
        checkIfUserIsAuthenticated: function () {
            return new Promise((resolve, reject) => {
                let self = this;
                let pathName = window.location.href;
                let jwt = self.getJwtFromLocalStorage();

                if (!appStore.isTokenValid(jwt)) {
                    appStore.clearAuth();
                    if (pathName.indexOf("/home") != -1) {
                        self.$router.push("/login");
                    }
                    resolve();
                    return;
                }

                api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
                self.$root.jwtLoaded = true;

                const refreshPromise = appStore.state.auth.refreshed
                    ? Promise.resolve()
                    : api.post("/usuario/refresh_jwt").then(function (res) {
                        self.setJwtInLocalStorage(res.data.returnObj.newToken);
                    });

                refreshPromise
                    .then(function () {
                        if (pathName.indexOf("/login") != -1) {
                            let loginForm = $("#login-form");
                            loginForm.find("input").attr("disabled", "disabled");
                            loginForm.find("button").attr("disabled", "disabled").addClass("btn-loading");

                            setTimeout(() => {
                                self.$router.push("/home");
                            }, 1000);
                        }
                        resolve();
                    })
                    .catch(function (error) {
                        self.logoutUser();
                        reject(error);
                    });
            });
        },
        reload: function () {
            location.reload();
        },
        requireUser: async function (force = false) {
            if (!force && appStore.state.user) {
                return appStore.state.user;
            }

            return await api.get("/usuario/return_user").then((res) => {
                appStore.setUser(res.data.returnObj);
                return appStore.state.user;
            });
        },
        hasChurchPermission: function (permissionKey) {
            const permission = appStore.state.churchPermission || {};
            const permissions = Array.isArray(permission.permissions) ? permission.permissions : [];
            const parent = permissionParents[permissionKey];
            return Boolean(
                this.haveAppPermission ||
                permission.administrador ||
                (permissions.includes(permissionKey) && (!parent || permissions.includes(parent)))
            );
        },
        pushAvatars: function (target_id) {
            let target = $("#member-" + target_id);
            target.addClass("push-right");
        },
        restoreAvatars: function (target_id) {
            let target = $("#member-" + target_id);
            target.removeClass("push-right");
        },
        returnMusicText: function (number) {
            let returnText = number + " Louvor";

            if (number > 1) {
                returnText = number + " Louvores";
                return returnText;
            }

            return returnText;
        },
        returnMembersText: function (count) {
            if (count === null || count === undefined) {
                return "";
            }
            let membersText = "membro";
            if (count > 1) {
                membersText = "membros";
            }
            return count + " " + membersText;
        },
        showResponse: function (text, element_primary_class, element_class = "") {
            const responseText = typeof text === "string"
                ? text
                : (text && (text.error || text.message)) || "Não foi possível concluir a ação";

            this.response = responseText;
            this.responseTimers = this.responseTimers || {};
            let element = $(element_primary_class);
            const currentTimer = this.responseTimers[element_primary_class];

            if (currentTimer) {
                clearTimeout(currentTimer.show);
                clearTimeout(currentTimer.hide);
            }

            const responseId = Date.now().toString() + Math.random().toString(16).slice(2);
            element.data("response-id", responseId);
            this.resetResponseClass(element);
            element.addClass(element_class);
            element.show();

            const showTimer = setTimeout(() => {
                if (element.data("response-id") === responseId) {
                    element.css("opacity", 1);
                }
            }, 1);

            const hideTimer = setTimeout(() => {
                if (element.data("response-id") === responseId) {
                    element.css("opacity", 0);
                }
            }, 5 * 1000);

            this.responseTimers[element_primary_class] = {
                show: showTimer,
                hide: hideTimer
            };
        },
        close_modal: function () {
            this.showModal = false;
            this.modalTitle = "";
        },
        closeModal: function () {
            let modalContainer = $(".modal-container");
            modalContainer.css("transform", "translateY(80vh)");
            setTimeout(() => {
                $(".modal-overlay").hide();
                $(".modal-wrapper").hide();
                this.close_modal();
            }, 400);
        },
        submitForm: function () {
            $("#submit-informations-form").click();
        },
        select_user: function (event) {
            this.selected_member = event;
            $("#adm-id").attr("placeholder", "");
        },
        select_function: function (event) {
            this.selected_function = event;
            this.searchParam = "";
        },
        openMemberMoreActions: function (element_id) {
            let element = $("#member-" + element_id + " .member-more-actions");
            this.showMemberMoreActions = true;
            element.show();
            setTimeout(() => {
                element.css("opacity", 1);
            }, 10);
        },
        closeMemberMoreActions: function () {
            let elements = $(".member-more-actions");
            this.showMemberMoreActions = false;
            elements.each(function (index, element) {
                element.style.opacity = 0;
                setTimeout(() => {
                    element.style.display = "none";
                }, 400);
            });
        },
        restoreInputLabel: function (element_id, text) {
            $(element_id).attr("placeholder", text);
        },
        returnOccupations: function (funcoes_usuario) {
            let occupations = "";
            for (let i = 0; i < funcoes_usuario.length; i++) {
                occupations += funcoes_usuario[i].nome_funcao;
                if (funcoes_usuario.length > 1 && i == funcoes_usuario.length - 2) {
                    occupations += " e ";
                } else if (i < funcoes_usuario.length - 1) {
                    occupations += ", ";
                }
            }
            return occupations;
        },
        resetSelectedMember: function () {
            this.selected_member.id_usuario = null;
            this.selected_member.imagem_usuario = "";
            this.selected_member.nome_usuario = "";
        },
        listAllChurches: function () {
            api.get("/igreja/listar-igrejas").then((response) => {
                this.igrejas = response.data.returnObj;
            });
        },
        showModalFunction: function (showModal, modalTitle, modalButtonTitle, modalButton2Title) {
            this.showModal = showModal;
            this.modalTitle = modalTitle;
            this.modalButtonTitle = modalButtonTitle;
            this.modalButton2Title = modalButton2Title;
        },
        relativeTime: function (timeString) {
            return moment(timeString).fromNow();
        },
        fillSearchParam: function (event) {
            this.searchParam = $(event.target).val();
        }
    },
    computed: {
        user() {
            return appStore.state.user || {};
        }
    },
    data() {
        return {
            default_church_image: api.defaults.baseURL + "/public/church-default-image.jpg",
            current_date: moment(),
            loading: true,
            year: new Date().getFullYear(),
            selected_function: {},
            showModal: false,
            modalTitle: "",
            modalButtonTitle: "",
            modalButton2Title: "",
            showMemberMoreActions: false,
            response: ""
        };
    },
    mounted: function () {
        this.$root.igreja = this.igreja;
    }
};
