<template>
    <div class="config-church app-inner-content">
        <div class="config-church-container">
            <div class="page-title-header">
                <h3>Configurações da Igreja</h3>
                <p>Personalize as tags de eventos e as funções dos membros da equipe.</p>
            </div>
            <div class="settings-grid">
                <!-- CARD: TAGS DE EVENTOS -->
                <div class="settings-card glass-card">
                    <div class="settings-card-header">
                        <div class="header-main">
                            <span class="material-icons header-icon">sell</span>
                            <div class="header-text">
                                <h5>Tags de Músicas / Eventos</h5>
                                <p>Classifique repertórios e programações</p>
                            </div>
                        </div>
                        <span class="counter-badge">{{ tags.length }}</span>
                    </div>
                    <!-- Busca Inline -->
                    <div class="search-box-inline">
                        <span class="material-icons">search</span>
                        <input type="text" v-model="tagSearchQuery" placeholder="Filtrar tags...">
                    </div>
                    <!-- Lista de Tags -->
                    <div class="chips-list-container">
                        <div class="chips-wrapper" v-if="filteredTags.length > 0">
                            <div class="modern-chip tag-chip" v-for="(tag, index) in filteredTags" :key="index">
                                <span class="chip-text">{{ tag.nome_tag }}</span>
                                <button type="button" class="btn-delete-chip" @click="deleteTag(tag.id_tag)" title="Excluir tag">
                                    <span class="material-icons">close</span>
                                </button>
                            </div>
                        </div>
                        <div class="empty-chips-state" v-else>
                            <span class="material-icons">local_offer</span>
                            <p>{{ tagSearchQuery ? 'Nenhuma tag corresponde à busca' : 'Nenhuma tag cadastrada' }}</p>
                        </div>
                    </div>
                    <!-- Ação Adicionar -->
                    <button type="button" class="btn primary btn-add-setting" @click="toggleAddTagInput('tag')" :disabled="!hasActiveChurch">
                        <span class="material-icons">add</span>
                        <span>Adicionar Tag</span>
                    </button>
                </div>
                <!-- CARD: FUNÇÕES DOS MEMBROS -->
                <div class="settings-card glass-card">
                    <div class="settings-card-header">
                        <div class="header-main">
                            <span class="material-icons header-icon">assignment_ind</span>
                            <div class="header-text">
                                <h5>Funções dos Integrantes</h5>
                                <p>Cargos e responsabilidades na equipe</p>
                            </div>
                        </div>
                        <span class="counter-badge">{{ functions.length }}</span>
                    </div>
                    <!-- Busca Inline -->
                    <div class="search-box-inline">
                        <span class="material-icons">search</span>
                        <input type="text" v-model="functionSearchQuery" placeholder="Filtrar funções...">
                    </div>
                    <!-- Lista de Funções -->
                    <div class="chips-list-container">
                        <div class="chips-wrapper" v-if="filteredFunctions.length > 0">
                            <div class="modern-chip function-chip" v-for="(currentFunction, index) in filteredFunctions" :key="index">
                                <span class="chip-text">{{ currentFunction.nome_funcao }}</span>
                                <button type="button" class="btn-delete-chip" @click="deleteFunction(currentFunction.id_funcao)" title="Excluir função">
                                    <span class="material-icons">close</span>
                                </button>
                            </div>
                        </div>
                        <div class="empty-chips-state" v-else>
                            <span class="material-icons">badge</span>
                            <p>{{ functionSearchQuery ? 'Nenhuma função corresponde à busca' : 'Nenhuma função cadastrada' }}</p>
                        </div>
                    </div>
                    <!-- Ação Adicionar -->
                    <button type="button" class="btn primary btn-add-setting" @click="toggleAddTagInput('function')" :disabled="!hasActiveChurch">
                        <span class="material-icons">add</span>
                        <span>Adicionar Função</span>
                    </button>
                </div>
            </div>
            <p class="response">{{ response }}</p>
        </div>
        <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm(); returnPageInformations();">
            <registerTagOrFunction
                :type="type"
                :churchId="resolvedChurchId"
                @success="closeModal(); returnPageInformations();"
                @error="handleRegisterError"
            />
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
            type: "",
            tagSearchQuery: "",
            functionSearchQuery: ""
        }
    },
    computed: {
        hasActiveChurch: function () {
            return this.resolvedChurchId != null;
        },
        resolvedChurchId: function () {
            const churchId = Number(this.getCurrentChurchId());
            return Number.isInteger(churchId) && churchId > 0 ? churchId : null;
        },
        filteredTags: function () {
            if (!this.tagSearchQuery) {
                return this.tags;
            }
            const query = this.tagSearchQuery.toLowerCase().trim();
            return this.tags.filter(tag => tag.nome_tag.toLowerCase().includes(query));
        },
        filteredFunctions: function () {
            if (!this.functionSearchQuery) {
                return this.functions;
            }
            const query = this.functionSearchQuery.toLowerCase().trim();
            return this.functions.filter(currentFunction => currentFunction.nome_funcao.toLowerCase().includes(query));
        }
    },
    methods: {
        toggleAddTagInput: function (type) {
            let self = this;

            if (!self.hasActiveChurch) {
                self.showResponse("Nao foi possivel identificar a igreja atual. Recarregue a pagina e tente novamente.", ".response", "error");
                return;
            }

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
        deleteTag: function (id_tag) {
            let self = this;
            let churchId = self.getCurrentChurchId();
            let data = {
                id_tag: id_tag,
                id_igreja: churchId
            }
            self.tags = self.tags.filter(tag => tag.id_tag !== id_tag);
            api.post("/igreja/deletar-tag", data);
        },
        deleteFunction: function (id_function) {
            let self = this;
            let churchId = self.getCurrentChurchId();
            let data = {
                id_function: id_function,
                id_igreja: churchId
            }
            self.functions = self.functions.filter(currentFunction => currentFunction.id_funcao !== id_function);
            api.post("/igreja/deletar-funcao", data);
        },
        returnChurchTags: function () {
            let self = this;
            let churchId = self.getCurrentChurchId();
            if (!churchId) return;
            let data = {
                id_igreja: churchId
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
            let churchId = self.getCurrentChurchId();
            if (!churchId) return;
            let data = {
                id_igreja: churchId
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
        },
        handleRegisterError: function (message) {
            this.showResponse(message, ".response", "error");
        }
    },
    watch: {
        igreja: {
            handler: function (val) {
                if (val && val.id_igreja) {
                    this.returnPageInformations();
                }
            },
            deep: true
        }
    },
    mounted: function () {
        let churchId = this.getCurrentChurchId();
        if (churchId) {
            this.returnPageInformations();
        }
    },
    components: {
        modal,
        registerTagOrFunction
    }
}
</script>
<style scoped>
.config-church {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.config-church-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
}
.page-title-header h3 {
    margin: 0 0 4px;
    font-size: var(--font-size-h3);
    font-weight: 700;
    color: var(--neutral-white);
}
.page-title-header p {
    margin: 0;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}
/* --- GRID DE CONFIGURAÇÕES --- */
.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-top: 0.5rem;
}
/* --- CARD GLASS --- */
.settings-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 380px;
}
.settings-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}
.header-main {
    display: flex;
    gap: 12px;
    align-items: center;
}
.header-icon {
    font-size: 26px;
    color: var(--secondary-blue-soft);
    background: rgba(56, 182, 255, 0.08);
    padding: 8px;
    border-radius: var(--radius-md);
    flex-shrink: 0;
}
.header-text h5 {
    margin: 0 0 2px;
    font-size: var(--font-size-4);
    font-weight: 700;
    color: var(--neutral-white);
}
.header-text p {
    margin: 0;
    font-size: 11px;
    color: var(--neutral-gray-medium);
}
.counter-badge {
    background: rgba(56, 182, 255, 0.15);
    color: var(--secondary-blue-soft);
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
}
/* --- BUSCA INLINE --- */
.search-box-inline {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}
.search-box-inline span {
    position: absolute;
    left: 12px;
    color: var(--neutral-gray-medium);
    font-size: 18px;
    pointer-events: none;
}
.search-box-inline input {
    width: 100%;
    height: 38px;
    padding-left: 38px;
    padding-right: 12px;
    font-size: var(--font-size-5);
    background: rgba(24, 21, 56, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-sm);
    color: var(--neutral-white);
    outline: none;
    transition: all var(--transition-fast);
}
.search-box-inline input:focus {
    border-color: var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
}
/* --- CHIPS CONTAINER --- */
.chips-list-container {
    flex: 1;
    overflow-y: auto;
    max-height: 180px;
    padding-right: 4px;
}
.chips-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
/* Chip Moderno */
.modern-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    font-size: var(--font-size-5);
    font-weight: 600;
    transition: all var(--transition-fast);
}
.tag-chip {
    background: rgba(56, 182, 255, 0.05);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
}
.tag-chip:hover {
    background: rgba(56, 182, 255, 0.08);
    border-color: rgba(56, 182, 255, 0.35);
}
.function-chip {
    background: rgba(60, 208, 112, 0.05);
    border: 1px solid rgba(60, 208, 112, 0.2);
    color: var(--others-green);
}
.function-chip:hover {
    background: rgba(60, 208, 112, 0.08);
    border-color: rgba(60, 208, 112, 0.35);
}
.chip-text {
    white-space: nowrap;
}
.btn-delete-chip {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--neutral-gray-low);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color var(--transition-fast);
}
.btn-delete-chip:hover {
    color: var(--others-red);
}
.btn-delete-chip span {
    font-size: 14px;
}
/* Estado Vazio */
.empty-chips-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 8px;
    padding: 1.5rem 1rem;
    color: var(--neutral-gray-medium);
    height: 100%;
}
.empty-chips-state span {
    font-size: 32px;
    color: var(--neutral-gray-low);
}
.empty-chips-state p {
    margin: 0;
    font-size: var(--font-size-5);
}
/* --- BOTÃO DE AÇÃO --- */
.btn-add-setting {
    width: 100%;
    height: 44px;
    font-size: var(--font-size-5);
    margin-top: auto;
}
.response {
    text-align: center;
    margin-top: 1rem;
}
</style>
