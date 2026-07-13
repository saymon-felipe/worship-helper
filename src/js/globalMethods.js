import $ from 'jquery';
import api from '../config/api';
import { appStore } from '../store/appStore';
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

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
            appStore.setChurch(obj);
            appStore.setChurchPermission({
                administrador: obj.administrador == 1 || obj.administrador === true,
                apenas_membro: obj.administrador != 1 && obj.administrador !== true
            });

            this.checkPermission();
        },
        getCurrentChurchInLocalStorage: function () {
            return JSON.parse(sessionStorage.getItem("current_church"));
        },
        getCurrentChurchId: function () {
            if (this.igreja && this.igreja.id_igreja != null) {
                return this.igreja.id_igreja;
            }

            if (this.$route && this.$route.params && this.$route.params.id_igreja != null) {
                return this.$route.params.id_igreja;
            }

            let church = this.getCurrentChurchInLocalStorage();
            return church ? church.id_igreja : null;
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
                this.user = appStore.state.user;
                return this.user;
            }

            this.user = await api.get("/usuario/return_user").then((res) => {
                appStore.setUser(res.data.returnObj);
                return appStore.state.user;
            });
            return this.user;
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
            let membersText = "membro";
            if (count > 1) {
                membersText = "membros";
            }
            return count + " " + membersText;
        },
        showResponse: function (text, element_primary_class, element_class = "") {
            this.response = text;
            let element = $(element_primary_class);
            this.resetResponseClass(element);
            element.addClass(element_class);
            element.show();
            setTimeout(() => {
                element.css("opacity", 1);
            }, 1);

            setTimeout(() => {
                element.css("opacity", 0);
            }, 5 * 1000);
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
    data() {
        return {
            user: appStore.state.user || {},
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
