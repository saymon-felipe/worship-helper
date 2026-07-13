<template>
    <footer v-if="current_church.id_igreja != null">
        <div class="nav-container">
            <div class="menu-option" v-on:click="returnToHome()" :class="{ 'active-option': isHomeActive }">
                <span class="material-icons">home</span>
                <p>Início</p>
            </div>
            <div class="menu-option">
                <router-link :to="'/home/manage-church/' + current_church.id_igreja + '/musics'" active-class="active-option" class="nav-link">
                    <span class="material-icons">queue_music</span>
                    <p>Músicas</p>
                </router-link>
            </div>
            <div class="menu-option">
                <router-link :to="'/home/manage-church/' + current_church.id_igreja" active-class="active-option" class="nav-link">
                    <span class="material-icons">home_work</span>
                    <p>{{ returnLabelAdmin() }}</p>
                </router-link>
            </div>
        </div>
    </footer>
</template>
<script>
import { globalMethods } from '../js/globalMethods';

export default {
    name: "footerComponent",
    mixins: [globalMethods],
    data() {
        return {
            currentId: null,
            current_church: {
                id_igreja: null
            }
        }
    },
    computed: {
        isHomeActive() {
            return this.$route.path === '/home/church/' + this.current_church.id_igreja || 
                   this.$route.path.startsWith('/home/event/');
        }
    },
    methods: {
        returnToHome: function () {
            let self = this;
            self.$router.push("/home/church/" + self.current_church.id_igreja);
        },
        returnLabelAdmin: function () {
            if (this.current_church.administrador == 1) {
                return "Painel";
            }
            return "Visualizar";
        },
        watchChurchInSessionStorage: function () {
            setInterval(() => {
                if (sessionStorage.getItem("current_church") != null && this.currentId != JSON.parse(sessionStorage.getItem("current_church")).id_igreja) {
                    this.currentId = JSON.parse(sessionStorage.getItem("current_church")).id_igreja;
                    this.current_church = this.getCurrentChurchInLocalStorage();
                }
            }, 1000)
        }
    },
    mounted: function () {
        this.watchChurchInSessionStorage();
    }
}
</script>
<style scoped>
footer {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 500px;
    background: rgba(18, 16, 41, 0.85);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    z-index: 99;
    padding: 8px 16px;
    animation: fadeIn var(--transition-normal);
}

.nav-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
}

.menu-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: transform var(--transition-fast);
    position: relative;
    padding: 4px;
}

.menu-option:active {
    transform: scale(0.92);
}

.nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--neutral-gray-medium) !important;
    text-decoration: none;
}

.menu-option span, .nav-link span {
    font-size: 24px;
    color: var(--neutral-gray-low);
    transition: color var(--transition-fast), text-shadow var(--transition-fast);
}

.menu-option p, .nav-link p {
    font-size: 11px;
    font-weight: 500;
    margin-top: 2px;
    color: var(--neutral-gray-medium);
    transition: color var(--transition-fast);
}

/* Estado Ativo */
.active-option span, 
.router-link-active span,
.router-link-exact-active span,
.menu-option.active-option span {
    color: var(--secondary-blue-soft) !important;
    text-shadow: 0 0 10px rgba(56, 182, 255, 0.4);
}

.active-option p,
.router-link-active p,
.router-link-exact-active p,
.menu-option.active-option p {
    color: var(--neutral-white) !important;
    font-weight: 600;
}

/* Indicador dinâmico de bolinha por baixo da opção ativa */
.active-option::after,
.router-link-active::after,
.menu-option.active-option::after {
    content: "";
    position: absolute;
    bottom: -4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--secondary-blue-soft);
    box-shadow: 0 0 8px var(--secondary-blue-soft);
}
</style>
