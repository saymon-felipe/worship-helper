<template>
    <div class="auto-complete">
        <div class="member" v-for="(member, index) in members" :key="index" v-on:click="selectUser(member)">
            <img :src="member.imagem_usuario">
            <div class="member-informations">
                <h5>{{ member.nome_usuario }}</h5>
                <p>{{ member.descricao_usuario }}</p>
            </div>
        </div>
        <div class="member" v-for="(func, index) in functions" :key="index" v-on:click="selectFunction(func)">
            <div class="member-informations">
                <h5>{{ func.nome_funcao }}</h5>
            </div>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
import api from '../config/api';

export default {
    name: "autoComplete",
    props: ['search', 'isFunction', 'igreja'],
    data() {
        return {
            members: [],
            functions: []
        }
    },
    watch: {
        search: function (string) {
            this.ajaxSearch();
            this.filterSearch(string);
        }
    },
    methods: {
        searchFunctions: function () {
            let self = this;

            let data = {
                id_igreja: self.getCurrentChurchId()
            }
            
            $(".auto-complete").show();
            api.post('/igreja/retorna-funcoes', data)
            .then(function (response) {
                self.functions = response.data.returnObj;
            })
        },
        filterSearch: function (string) {
            let self = this;
            
            self.members = self.members.filter(user => { 
                return user.nome_usuario.toLowerCase().includes(string.toLowerCase());
            });
            
            if (this.search.length > 3 && this.members.length == 0) {
                $(".auto-complete").hide();
            }
        },
        ajaxSearch: function () {
            let self = this;

            if (self.search.length != 3) {
                return;
            }
            let data = {
                search: self.search
            }
            
            $(".auto-complete").show();
            api.post('/usuario/find_users', data)
            .then(function (response) {
                if (response.data.status == "empty") {
                    self.$emit('emptySearch', "Nenhum usuário encontrado");
                } else {
                    self.members = response.data.returnObj;
                }
            })
            .catch(function (error) {
                self.members = [];
                $(".auto-complete").hide();
                const data = error.response ? error.response.data : null;
                const message = typeof data === "string"
                    ? data
                    : (data && (data.message || data.error)) || "Nenhum usuário encontrado";
                self.$emit('emptySearch', message);
            })
        },
        selectUser: function (user) {
            this.members = [];
            $(".auto-complete").hide();
            
            this.$emit('selectUser', user);
        },
        selectFunction: function (func) {
            this.functions = [];
            $(".auto-complete").hide();
            
            this.$emit('selectFunction', func);
        }
    },
    mounted: function () {
        if (this.isFunction) {
            this.searchFunctions();
        }
    }
}
</script>
<style scoped>
.auto-complete {
    background: var(--primary-primary-blue-medium);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);
    padding: 6px;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 99;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    display: none;
    box-sizing: border-box;
    max-height: 220px;
    overflow-y: auto;
}

.member {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    margin: 2px 0;
    box-sizing: border-box;
}

.member:hover {
    background: rgba(255, 255, 255, 0.05);
}

.member img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0;
}

.member-informations {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.member-informations h5 {
    margin: 0;
    font-size: var(--font-size-5);
    font-weight: 600;
    color: var(--neutral-white);
}

.member-informations p {
    margin: 0;
    font-size: 11px;
    color: var(--neutral-gray-medium);
}
</style>
