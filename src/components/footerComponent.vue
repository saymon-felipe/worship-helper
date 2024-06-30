<template>
    <footer>
        <div class="container" v-if="current_church.id_igreja != null">
            <div class="menu-option" v-on:click="returnToHome()">
                <span class="material-icons">home</span>
                <p>Início</p>
            </div>
            <div class="menu-option">
                <router-link :to="'/home/manage-church/' + current_church.id_igreja + '/musics'">
                    <span class="material-icons">search</span>
                    <p>Biblioteca de <br> louvores</p>
                </router-link>
            </div>
            <div class="menu-option">
                <router-link class="link" :to="'/home/manage-church/' + current_church.id_igreja">
                    <span class="material-icons">home_work</span>
                    <p>{{ returnLabelAdmin() }} <br> igreja</p>
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
    methods: {
        returnToHome: function () {
            let self = this;
            self.$router.push("/home/church/" + self.current_church.id_igreja);
        },
        returnLabelAdmin: function () {
            if (this.current_church.administrador == 1) {
                return "Gerenciar";
            }
            return "Visualizar";
        },
        watchChurchInSessionStorage: function () {
            setInterval(() => {
                if (sessionStorage.getItem("current_church") != null && this.currentId != JSON.parse(sessionStorage.getItem("current_church")).id_igreja) {
                    this.currentId = sessionStorage.getItem("current_church").id_igreja;
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
    width: 100%;
    background: var(--primary-primary-blue-low);
}

.container {
    width: 95%;
    max-width: 1000px;
    display: flex;
    justify-content: space-around;
    padding: 0.5rem;
    margin: auto;
}

.menu-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100px;
    cursor: pointer;
}

    .menu-option span {
        font-size: var(--font-size-h2);
    }

    .menu-option p {
        font-size: var(--font-size-6);
    }
</style>