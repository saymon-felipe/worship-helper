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

            this.checkPermission();
        },
        getCurrentChurchInLocalStorage: function () {
            let church = JSON.parse(sessionStorage.getItem("current_church"));
            return church;
        },
        setJwtInLocalStorage: function (jwt) {
            localStorage.setItem("wh_jwt", jwt);
            this.checkAndSetJwt();
        },
        checkAndSetJwt: function() {
            let interval = setInterval(() => {
                let jwt = this.getJwtFromLocalStorage();

                if (jwt != null) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
                    this.$root.jwtLoaded = true;
                    clearInterval(interval);
                }
            }, 100)
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
        logoutUser: function () {
            let self = this;

            self.removeJwtFromLocalStorage();
            self.$router.push("/login");
        },
        checkIfUserIsAuthenticated: function () {
            return new Promise((resolve) => {
                let self = this;
                let pathName = window.location.href;
                let jwt = "Bearer " + self.getJwtFromLocalStorage();

                if (jwt == "Bearer null") {
                    if (pathName.indexOf("/home") != -1) {
                        self.$router.push("/login");
                        return;
                    }
                } else {
                    let data = {
                        token: jwt
                    }
                    
                    api.post("/usuario/check_jwt", data, {
                        headers: {
                            'Authorization': jwt
                        }
                    }) // Se ja estiver logado no sistema e acessar a página de login, é checkado a valia do token JWT e então redirecionado para a index.
                    .then(function (res) { 
                        self.setJwtInLocalStorage(res.data.returnObj.newToken); // Setando o novo jwt que foi resetado

                        if (pathName.indexOf("/login") != -1) { // Se o usuário estiver logado e entrar em login, o mesmo é logado novamente e direcionado para a index.
                            let loginForm = $("#login-form");
                            loginForm.find("input").attr("disabled", "disabled");
                            loginForm.find("button").attr("disabled", "disabled").addClass("btn-loading");

                            setTimeout(() => {
                                self.$router.push("/home");
                            }, 1000);
                        }
                        resolve();
                    })
                    .catch(function () { // Caso contrário ele é deslogado e enviado para login.
                        self.logoutUser();
                        return;
                    })
                    .then(function () { // Chamada recursiva da função se o usuario estiver na home
                        if (pathName.indexOf("/home") != -1) {
                            setTimeout(self.checkIfUserIsAuthenticated, 10 * 1000);
                        }
                    })
                }
            })
        },
        reload: function () {
            location.reload();
        },
        requireUser: async function() { // Função retorna o usuário pelo id.
            let self = this;
            self.user = await api.get("/usuario/return_user").then(res => res.data.returnObj);
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
            }, 1)

            setTimeout(() => {
                element.css("opacity", 0);
            }, 5 * 1000)
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
            
            self.selected_member = event;
            $("#adm-id").attr("placeholder", "");
        },
        select_function: function (event) {
            let self = this;

            self.selected_function = event;
            self.searchParam = "";
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
            })
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
            let self = this;

            api.get("/igreja/listar-igrejas").then(function (response) {
                self.igrejas = response.data.returnObj;
            })
        },
        showModalFunction: function (showModal, modalTitle, modalButtonTitle, modalButton2Title) {
            this.showModal = showModal;
            this.modalTitle = modalTitle;
            this.modalButtonTitle = modalButtonTitle;
            this.modalButton2Title = modalButton2Title;
        },
        relativeTime: function (timeString) {
            const relativeTime = moment(timeString).fromNow();
            return relativeTime;
        },
        fillSearchParam: function (event) {
            let value = $(event.target).val();
            
            this.searchParam = value;
        }
    },
    data() {
        return {
            user: {},
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
        }
    },
    mounted: function () {
        this.$root.igreja = this.igreja;
    }
}