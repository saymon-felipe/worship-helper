import $ from 'jquery';
import api from '../config/api';
import moment from 'moment';

export const globalMethods = {
    methods: {
        setCurrentChurchInLocalStorage: function (object) {
            let obj = {
                id_igreja: object.id_igreja,
                nome_igreja: object.nome_igreja,
                imagem_igreja: object.imagem_igreja,
                quantidade_membros: object.quantidade_membros,
                administrador: object.administrador
            }
            sessionStorage.setItem("current_church", JSON.stringify(obj));
        },
        getCurrentChurchInLocalStorage: function () {
            let church = JSON.parse(sessionStorage.getItem("current_church"));
            return church;
        },
        setJwtInLocalStorage: function (jwt) {
            localStorage.setItem("wh_jwt", jwt);
        },
        removeJwtFromLocalStorage: function () {
            localStorage.removeItem("wh_jwt");
        },
        getJwtFromLocalStorage: function () {
            let jwt = localStorage.getItem("wh_jwt");
            return jwt;
        },
        resetResponseClass: function (object) {
            if (object.hasClass("success")) {
                object.removeClass("success");
            }
            if (object.hasClass("error")) {
                object.removeClass("error");
            }
        },
        checkIfUserIsAuthenticated: function () {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let pathName = window.location.href;
            let windowLocation = window.location.pathname;

            if (windowLocation.indexOf("/register") != -1) {
                return;
            }
            
            if (jwt == "Bearer null" && windowLocation.indexOf("/login") == -1) {
                self.$router.push("/login");
            } else {
                api.post("/usuario/check_jwt", "", {
                    headers: {
                        Authorization: jwt
                    }
                })
                .then(function () {
                    if (pathName.indexOf("/login") != -1) {
                        self.$router.push("/home");
                    }
                })
                .catch(function () {
                    if (pathName.indexOf("/login") == -1) {
                        self.removeJwtFromLocalStorage();
                        self.$router.push("/login");
                    }
                })
                .then(function () {
                    if (pathName.indexOf("/login") == -1) {
                        setTimeout(() => {
                            self.checkIfUserIsAuthenticated();
                        }, 60 * 1000); //Repetição da função a cada 1 minuto
                    }
                })
            }
        },
        toggleAddTagInput: function (type) {
            let inputString;
            let wrapperString;
            if (type == "function") {
                inputString = "#new-function-input";
                wrapperString = ".input-new-function-wrapper";
            } else {
                inputString = "#new-tag-input";
                wrapperString = ".input-new-tag-wrapper";
            }
            let input = $(inputString);
            let wrapper = $(wrapperString);
            input.val("");
            if (input.is(":visible")) {
                input.css("opacity", 0);
                setTimeout(() => {
                    input.hide();
                    wrapper.hide();
                }, 400);
            } else {
                wrapper.show();
                input.show();
                input.focus();
                setTimeout(() => {
                    input.css("opacity", 1);
                }, 10)
            }
        },
        reload: function () {
            location.reload();
        },
        requireUser: async function() { // Função retorna o usuário pelo id.
            let self = this, jwt = "Bearer " + self.getJwtFromLocalStorage();
            self.user = await api.get("/usuario/return_user", { headers: { Authorization: jwt } }).then(res => res.data.usuario);
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
        getMyChurch: function () {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: self.$route.params.id_igreja
            }

            api.post("/igreja/retorna-igreja", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.igreja = response.data.igreja;
                })
                .catch(function (error) {
                    console.log(error)
                })
        },
        checkPermission: function() {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: self.$route.params.id_igreja
            }

            api.post("/igreja/permissao-gerenciar", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.havePermission = true;
                    self.loading = false;
                })
                .catch(function (error) {
                    self.havePermission = false;
                    self.loading = false;
                    console.log(error);
                })
        },
        checkAppPermission: function() {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();

            api.post("/usuario/app_administrator", "", {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function () {
                    self.haveAppPermission = true;
                })
                .catch(function () {
                    self.haveAppPermission = false;
                })
        },
        showResponse: function (text, element_primary_class, element_class = "") {
            this.response = text;
            let element = $(element_primary_class);
            this.resetResponseClass(element);
            element.addClass(element_class);
            element.show();
            setTimeout(() => {
                element.css("opacity", 1);
            }, 10);
        },
        close_modal: function () {
            let self = this;
            self.showModal = false;
            self.modalTitle = "";
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
            let self = this;
            self.selected_tag = event;
            $("#adm-id").attr("placeholder", "");
        },
        select_tag: function (event) {
            let self = this;
            self.selected_member = event;
            self.searchParam = "";
        },
        restoreInputLabel: function (element_id, text) {
            $(element_id).attr("placeholder", text);
        },
        resetSelectedMember: function () {
            this.selected_member.id_usuario = null;
            this.selected_member.imagem_usuario = "";
            this.selected_member.nome_usuario = "";
        },
        listAllChurches: function () {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();

            api.get("/igreja/listar-igrejas", {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.igrejas = response.data.lista_igrejas;
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        showModalFunction: function (showModal, modalTitle, modalButtonTitle, modalButton2Title) {
            this.showModal = showModal;
            this.modalTitle = modalTitle;
            this.modalButtonTitle = modalButtonTitle;
            this.modalButton2Title = modalButton2Title;
        }
    },
    data() {
        return {
            user: {},
            default_church_image: api.defaults.baseURL + "/public/church-default-image.jpg",
            current_date: moment(),
            loading: true
        }
    },
    beforeMount: function () {
        this.checkIfUserIsAuthenticated();
    }
}