<template>
    <div class="header" v-if="load">
        <img src="../assets/img/worship-helper-icon.png" class="app-icon" v-on:click="backToHome()">
        <nav class="header-menu-container">
            <div class="user-container">
                <div class="user-information" v-on:click="toogleMenuContainer()">
                    <img :src="user.imagem_usuario" :alt="'Imagem do usuário ' + user.nome_usuario" class="avatar-pp">
                    <span class="material-icons">expand_more</span>
                </div>
                <ul class="menu-items-container" :style="$route.path != '/home' ? 'bottom: -150px;' : ''">
                    <li v-on:click="toogleMenuContainer()" v-if="$route.path != '/home'">
                        <router-link to="home">
                            <span>Ir para home</span>
                        </router-link>
                    </li>
                    <li v-on:click="toogleMenuContainer()" v-if="$route.path != '/home/manage-profile'">
                        <router-link to="home/manage-profile">
                            <span>Alterar perfil</span>
                        </router-link>
                    </li>
                    <li v-on:click="goToAdmin()" v-if="haveAppPermission">
                        <span>Admin</span>
                    </li>
                    <li v-on:click="logout()">
                        <span class="material-icons">power_settings_new</span>
                        <span>Sair</span>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="menu-wrapper" v-on:click="toogleMenuContainer()"></div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';

export default {
    name: "headerComponent",
    mixins: [globalMethods],
    data() {
        return {
            load: true
        }
    },
    methods: {
        logout: function () {
            this.removeJwtFromLocalStorage();
            this.$router.push("/login");
        },
        backToHome: function () {
            this.$router.push("/home");
        },
        toogleMenuContainer: function () {
            let menuContainer = $(".menu-items-container");
            let menuWrapper = $(".menu-wrapper");
            
            if (menuContainer.is(":visible")) {
                menuContainer.css("opacity", 0);
                setTimeout(() => {
                    menuContainer.hide();
                    menuWrapper.hide();
                }, 400)
            } else {
                menuContainer.show();
                setTimeout(() => {
                    menuContainer.css("opacity", 1);
                    menuWrapper.show();
                }, 10)
            }
        }
    },
    mounted: function () {
        this.checkAppPermission();
        this.requireUser();
    }
}
</script>
<style scoped>
.header {
    background: var(--primary-primary-blue-high);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    color: var(--neutral-white);
}

    .header span {
        font-size: 2rem;
        cursor: pointer;
    }

    .header img {
        cursor: pointer;
    }

.user-container, .user-information {
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
}

.menu-items-container {
    display: none;
    position: absolute;
    background: var(--primary-primary-blue-high);
    top: 150% !important;
    left: -91%;
    opacity: 0;
    transition: all 0.4s;
    list-style-type: none;
    margin: 0;
    padding: 0;
    color: var(--neutral-white) !important;
    padding: 7px;
    border-radius: 10px;
    z-index: 6;
    height: fit-content;
}

    .menu-items-container li {
        padding: 7px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

        .menu-items-container li:hover {
            background: var(--primary-primary-blue-high-2) !important;
        }

        .menu-items-container li span:nth-child(2) {
            margin-left: 6px;
        }

    .menu-items-container li a span, .menu-items-container li span, .menu-items-container li a {
        font-size: var(--font-size-3);
        text-decoration: none;
        color: var(--neutral-white) !important;
    }

.menu-wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: none;
    top: 0;
    left: 0;
    z-index: 5;
}
</style>
