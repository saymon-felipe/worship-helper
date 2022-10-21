<template>
    <div class="config-church">
        <div class="loading" v-if="loading">Loading</div>
        <div class="config-church-container" v-if="!loading">
            <h3>Configurar igreja</h3>
            <div class="configuration-container">
                <div class="configuration-header">
                    <h5>Configurar tags</h5>
                    <button class="create-new-tag" v-on:click="toggleAddTagInput('tag')">
                        <span class="material-icons">add</span>
                    </button>
                </div>
                <div class="tags-list">
                    <div class="tags-list-container">
                        <div class="tag" v-for="(tag, index) in tags" v-bind:key="index" :id="'tag-' + tag.id_tag">
                            <label>{{ tag.nome_tag }}</label>
                            <span class="material-icons" v-on:click="deleteTag(tag.id_tag)">clear</span>
                        </div>
                    </div>
                </div>
                <div class="configuration-header">
                    <h5>Configurar funções</h5>
                    <button class="create-new-tag" v-on:click="toggleAddTagInput('function')">
                        <span class="material-icons">add</span>
                    </button>
                </div>
                <div class="functions-list">
                    <div class="functions-list-container">
                        <div class="tag" v-for="(currentFunction, index) in functions" v-bind:key="index" :id="'function-' + currentFunction.id_funcoes_igreja">
                            <label>{{ currentFunction.nome_funcao }}</label>
                            <span class="material-icons" v-on:click="deleteFunction(currentFunction.id_funcoes_igreja)">clear</span>
                        </div>
                    </div>
                </div>
                <input type="text" class="input" id="new-tag-input" v-on:focusout="createNewTag($event)" maxlength="50">
                <div class="input-new-tag-wrapper" v-on:click="toggleAddTagInput('tag')"></div>
                <input type="text" class="input" id="new-function-input" v-on:focusout="createNewFunction($event)" maxlength="50">
                <div class="input-new-function-wrapper" v-on:click="toggleAddTagInput('function')"></div>
                <p class="response">{{ response }}</p>
            </div>
        </div>
        <footerComponent />
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';
import footerComponent from "./footerComponent.vue";

export default {
    name: "configChurch",
    mixins: [globalMethods],
    data() {
        return {
            tags: [],
            functions: [],
            igreja: {
                imagem_igreja: "",
                nome_igreja: ""
            },
            response: ""
        }
    },
    components: {
        footerComponent
    },
    watch: {
        loading: function () {
            this.getMyChurch();
        }
    },
    methods: {
        removeTagFromDom: function (id_tag) {
            let tag = $("#tag-" + id_tag);
            tag.remove();
        },
        removeFunctionFromDom: function (id_function) {
            let functionElement = $("#function-" + id_function);
            functionElement.remove();
        },
        deleteTag: function (id_tag) {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_tag: id_tag,
                id_igreja: self.$route.params.id_igreja
            }

            api.post("/igreja/deletar-tag", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.removeTagFromDom(id_tag);
                    self.returnChurchTags();
                })
                .catch(function (error) {
                    console.log(error.response.data.message);
                })
        },
        deleteFunction: function (id_function) {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_function: id_function,
                id_igreja: self.$route.params.id_igreja
            }

            api.post("/igreja/deletar-funcao", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.removeFunctionFromDom(id_tag);
                    self.returnChurchFunctions();
                })
                .catch(function (error) {
                    console.log(error.response.data.message);
                })
        },
        createNewTag: function (event) {
            let value = $("#" + event.target.id).val();
            if (value.trim().length == 0) {
                return;
            }

            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: self.$route.params.id_igreja,
                new_tag: value
            }

            api.post("/igreja/criar-tag", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function () {
                    self.toggleAddTagInput('tag');
                    self.returnChurchTags();
                })
                .catch(function (error) {
                    console.log(error.response.data.message);
                })
        },
        createNewFunction: function (event) {
            let value = $("#" + event.target.id).val();
            if (value.trim().length == 0) {
                return;
            }

            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: self.$route.params.id_igreja,
                new_function: value
            }

            api.post("/igreja/criar-funcao", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function () {
                    self.toggleAddTagInput('function');
                    self.returnChurchFunctions();
                })
                .catch(function (error) {
                    console.log(error.response.data.message);
                })
        },
        returnChurchTags: function () {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: self.$route.params.id_igreja
            }

            api.post("/igreja/retorna-tags", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.tags = response.data.lista_tags;
                    self.response = "";
                })
                .catch(function (error) {
                    self.showResponse(error.response.data.message, ".response");
                })
        },
        returnChurchFunctions: function () {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: self.$route.params.id_igreja
            }

            api.post("/igreja/retorna-funcoes", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.functions = response.data.lista_funcoes;
                    self.response = "";
                })
                .catch(function (error) {
                    self.showResponse(error.response.data.message, ".response");
                })
        }
    },
    mounted: function () {
        this.checkPermission();
        this.returnChurchTags();
        this.returnChurchFunctions();
    }
}
</script>
<style scoped>
.tag, .function {
    display: flex;
    align-items: center;
}

.tag span, .function span {
    cursor: pointer;
    margin-left: 2rem;
    color: var(--others-red);
}

.configuration-container, .tags-list, .functions-list {
    margin-top: 1rem;
}

.tags-list, .functions-list {
    overflow: hidden;
}

.tags-list-container, .functions-list-container {
    overflow-y: auto;
    height: 150px;
}

.configuration-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
}
</style>