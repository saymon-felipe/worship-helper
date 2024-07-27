<template>
    <div class="config-church app-inner-content">
        <div class="config-church-container">
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
                        <div class="tag" v-for="(currentFunction, index) in functions" v-bind:key="index" :id="'function-' + currentFunction.id_funcao">
                            <label>{{ currentFunction.nome_funcao }}</label>
                            <span class="material-icons" v-on:click="deleteFunction(currentFunction.id_funcao)">clear</span>
                        </div>
                    </div>
                </div>
                <p class="response">{{ response }}</p>
            </div>
        </div>
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm(); returnPageInformations();">
            <registerTagOrFunction @success="closeModal(); returnPageInformations();" :type="type" />
        </modal>
    </div>
</template>
<script>
import modal from "./modal.vue";
import registerTagOrFunction from "./registerTagOrFunction.vue";
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';

export default {
    name: "configChurch",
    mixins: [globalMethods],
    data() {
        return {
            tags: [],
            functions: [],
            type: ""
        }
    },
    methods: {
        toggleAddTagInput: function (type) {
            let self = this;
            
            if (type == "function") {
                self.modalTitle = "Cadastrar função";
            } else if (type == "tag") {
                self.modalTitle = "Cadastrar tag";
            }

            self.type = type;
            self.modalButtonTitle = "Cadastrar";
            self.showModal = true;

            setTimeout(() => {
                $("#entity").focus();
            }, 100);
        },
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
            let data = {
                id_tag: id_tag,
                id_igreja: self.igreja.id_igreja
            }

            self.removeTagFromDom(id_tag);

            api.post("/igreja/deletar-tag", data);
        },
        deleteFunction: function (id_function) {
            let self = this;
            let data = {
                id_function: id_function,
                id_igreja: self.igreja.id_igreja
            }

            self.removeFunctionFromDom(id_function);

            api.post("/igreja/deletar-funcao", data);
        },
        returnChurchTags: function () {
            let self = this;
            let data = {
                id_igreja: self.igreja.id_igreja
            }

            api.post("/igreja/retorna-tags", data)
                .then(function (response) {
                    self.tags = response.data.returnObj;
                    self.response = "";
                })
                .catch(function (error) {
                    self.showResponse(error.response.data, ".response", "error");
                })
        },
        returnChurchFunctions: function () {
            let self = this;
            let data = {
                id_igreja: self.igreja.id_igreja
            }

            api.post("/igreja/retorna-funcoes", data)
                .then(function (response) {
                    self.functions = response.data.returnObj;
                    self.response = "";
                })
                .catch(function (error) {
                    self.showResponse(error.response.data, ".response", "error");
                })
        },
        returnPageInformations: function () {
            this.returnChurchTags();
            this.returnChurchFunctions();
        }
    },
    mounted: function () {
        this.returnPageInformations();
    },
    components: {
        modal,
        registerTagOrFunction
    }
}
</script>
<style scoped>
.tag, .function {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 1.5rem 0;
}

.tag span, .function span {
    cursor: pointer;
    margin-right: 14px;
    color: var(--others-red);
}

.tag label, .function label {
    margin-left: 14px;
}

.configuration-container, .tags-list, .functions-list {
    margin-top: 1rem;
}

.config-church-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.configuration-container {
    flex: 1;
}
</style>