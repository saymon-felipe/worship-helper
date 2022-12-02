<template>
    <div class="auto-complete">
        <div class="member" v-for="(member, index) in members" :key="index" v-on:click="selectUser(member)">
            <img :src="member.imagem_usuario">
            <div class="member-informations">
                <h5>{{ member.nome_usuario }}</h5>
                <p>{{ member.descricao_usuario }}</p>
            </div>
        </div>
        <div class="member" v-for="(tag, index) in tags" :key="index" v-on:click="selectTag(tag)">
            <div class="member-informations">
                <h5>{{ tag.nome_tag }}</h5>
            </div>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
import api from '../config/api';

export default {
    name: "autoComplete",
    props: ['search', 'isTag', 'igreja'],
    data() {
        return {
            members: [],
            tags: []
        }
    },
    watch: {
        search: function (string) {
            this.ajaxSearch();
            this.filterSearch(string);
        }
    },
    methods: {
        searchTags: function () {
            let self = this;

            let data = {
                id_igreja: self.igreja.id_igreja
            }
            
            $(".auto-complete").show();
            api.post('/igreja/retorna-tags', data)
            .then(function (response) {
                self.tags = response.data.lista_tags;
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
                    self.$emit('emptySearch');
                } else {
                    self.members = response.data.lista_de_usuarios;
                }
            })
        },
        selectUser: function (user) {
            this.$emit('selectUser', user);
        }
    },
    mounted: function () {
        if (this.isTag) {
            this.searchTags();
        }
    }
}
</script>
<style scoped>
.auto-complete {
    background: var(--secondary-secondary-blue-high-2);
    padding: .1rem .5rem;
    border-radius: 10px;
    margin-top: 1rem;
    position: absolute;
    display: none;
    top: 5rem;
    /*top: 100%;*/
    z-index: 3;
}

.member {
    display: flex;
    align-items: center;
    margin: .5rem 0;
    cursor: pointer;
    transition: all 0.4s;
    padding: .5rem;
}

    .member:hover {
        background: var(--secondary-secondary-blue-medium);
    }

    .member img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 1rem;
        object-fit: cover;
    }
</style>