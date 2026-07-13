<template>
    <div class="header" v-if="load">
        <img src="../assets/img/worship-helper-icon.png" class="app-icon" v-on:click="backToHome()" alt="Worship Helper Logo">
        <nav class="header-menu-container">
            <div class="user-container">
                <div class="user-information" v-on:click="toogleMenuContainer()">
                    <img :src="user.imagem_usuario" :alt="'Imagem do usuário ' + user.nome_usuario" class="avatar-pp">
                    <span class="material-icons dropdown-arrow" :class="{ 'rotated': showDropdown }">expand_more</span>
                </div>
                <ul class="menu-items-container" :class="{ 'active': showDropdown }">
                    <li v-on:click="toogleMenuContainer()" v-if="$route.path != '/home'">
                        <router-link to="/home">
                            <span class="material-icons">home</span>
                            <span>Ir para home</span>
                        </router-link>
                    </li>
                    <li v-on:click="toogleMenuContainer()" v-if="$route.path != '/home/manage-profile'">
                        <router-link to="/home/manage-profile">
                            <span class="material-icons">person</span>
                            <span>Alterar perfil</span>
                        </router-link>
                    </li>
                    <li v-on:click="goToAdmin()" v-if="haveAppPermission">
                        <span class="material-icons">admin_panel_settings</span>
                        <span>Admin</span>
                    </li>
                    <li v-on:click="logout()">
                        <span class="material-icons logout-icon">power_settings_new</span>
                        <span>Sair</span>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="menu-wrapper" v-if="showDropdown" v-on:click="toogleMenuContainer()"></div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';

export default {
    name: "headerComponent",
    mixins: [globalMethods],
    data() {
        return {
            load: true,
            showDropdown: false
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
            this.showDropdown = !this.showDropdown;
        },
        goToAdmin: function () {
            // Se houver lógica específica para admin, adicionamos aqui
            this.toogleMenuContainer();
        }
    },
    mounted: function () {
        this.requireUser();
    }
}
</script>
<style scoped>
.header {
    background: rgba(24, 21, 56, 0.8);
    backdrop-filter: var(--glass-blur);
    border-bottom: 1px solid var(--card-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    color: var(--neutral-white);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header img.app-icon {
    height: 38px;
    width: auto;
    object-fit: contain;
    transition: transform var(--transition-fast);
}

.header img.app-icon:hover {
    transform: scale(1.05);
}

.user-container {
    position: relative;
}

.user-information {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-pill);
    transition: background-color var(--transition-fast);
}

.user-information:hover {
    background-color: rgba(255, 255, 255, 0.08);
}

.avatar-pp {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 2px solid var(--secondary-blue-soft);
}

.dropdown-arrow {
    font-size: 20px;
    color: var(--neutral-gray-medium);
    transition: transform var(--transition-fast);
}

.dropdown-arrow.rotated {
    transform: rotate(180deg);
}

.menu-items-container {
    position: absolute;
    background: var(--primary-bg-light);
    border: 1px solid var(--card-border);
    top: calc(100% + 12px);
    right: 0;
    width: 190px;
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: none;
    transition: all var(--transition-fast);
    list-style-type: none;
    margin: 0;
    padding: 6px;
    border-radius: var(--radius-md);
    z-index: 102;
    box-shadow: var(--card-shadow);
}

.menu-items-container.active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.menu-items-container li {
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: background var(--transition-fast);
}

.menu-items-container li:hover {
    background: rgba(255, 255, 255, 0.08);
}

.menu-items-container li a, .menu-items-container li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    cursor: pointer;
    color: var(--neutral-white) !important;
    font-size: var(--font-size-4);
    width: 100%;
}

.menu-items-container li span.material-icons {
    font-size: 18px;
    color: var(--secondary-blue-soft);
}

.menu-items-container li span.logout-icon {
    color: var(--others-red);
}

.menu-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 101;
    background: transparent;
}
</style>

