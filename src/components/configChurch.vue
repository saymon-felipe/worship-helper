<template>
    <div class="config-church app-inner-content">
        <div class="config-church-container">
            <div class="page-title-header">
                <h3>Configurações da Igreja</h3>
                <p>Personalize tags de usuários, funções e permissões da equipe.</p>
            </div>

            <div class="settings-tabs-wrapper">
                <div class="segmented-control">
                    <button type="button" class="segment-tab" :class="{ active: activeTab === 'tags' }" @click="activeTab = 'tags'">
                        <span class="material-icons tab-icon">sell</span>
                        <span>Tags de usuários</span>
                    </button>
                    <button type="button" class="segment-tab" :class="{ active: activeTab === 'functions' }" @click="activeTab = 'functions'">
                        <span class="material-icons tab-icon">assignment_ind</span>
                        <span>Funções</span>
                    </button>
                </div>
            </div>

            <div class="settings-panel">
                <div class="settings-card glass-card" v-if="activeTab === 'tags'">
                    <div class="settings-card-header">
                        <div class="header-main">
                            <span class="material-icons header-icon">sell</span>
                            <div class="header-text">
                                <h5>Tags de usuários</h5>
                                <p>Classifique membros por características da equipe</p>
                            </div>
                        </div>
                        <span class="counter-badge">{{ tags.length }}</span>
                    </div>

                    <div class="search-box-inline">
                        <span class="material-icons">search</span>
                        <input type="text" v-model="tagSearchQuery" placeholder="Filtrar tags...">
                    </div>

                    <div class="chips-list-container">
                        <div class="chips-wrapper" v-if="filteredTags.length > 0">
                            <div class="modern-chip tag-chip" v-for="tag in filteredTags" :key="tag.id_tag">
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

                    <button type="button" class="btn primary btn-add-setting" @click="toggleAddTagInput('tag')" :disabled="!hasActiveChurch">
                        <span class="material-icons">add</span>
                        <span>Adicionar tag</span>
                    </button>
                </div>

                <div class="settings-card glass-card" v-if="activeTab === 'functions'">
                    <div class="settings-card-header">
                        <div class="header-main">
                            <span class="material-icons header-icon">assignment_ind</span>
                            <div class="header-text">
                                <h5>Funções dos integrantes</h5>
                                <p>Cargos, responsabilidades e permissões de acesso</p>
                            </div>
                        </div>
                        <span class="counter-badge">{{ functions.length }}</span>
                    </div>

                    <div class="search-box-inline">
                        <span class="material-icons">search</span>
                        <input type="text" v-model="functionSearchQuery" placeholder="Filtrar funções...">
                    </div>

                    <div class="function-list-container" v-if="filteredFunctions.length > 0">
                        <div class="function-card" v-for="currentFunction in filteredFunctions" :key="currentFunction.id_funcao">
                            <div class="function-card-main">
                                <div>
                                    <h6>{{ currentFunction.nome_funcao }}</h6>
                                    <p>{{ permissionSummary(currentFunction) }}</p>
                                </div>
                                <div class="function-actions">
                                    <button type="button" class="btn-delete-chip" @click="editFunction(currentFunction)" title="Editar função">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button type="button" class="btn-delete-chip" @click="deleteFunction(currentFunction.id_funcao)" title="Excluir função">
                                        <span class="material-icons">close</span>
                                    </button>
                                </div>
                            </div>
                            <div class="permission-chip-list" v-if="permissionLabelsForFunction(currentFunction).length > 0">
                                <span class="modern-chip function-chip permission-chip" v-for="permission in permissionLabelsForFunction(currentFunction)" :key="permission">
                                    {{ permission }}
                                </span>
                            </div>
                            <div class="permission-chip-list muted" v-else>
                                <span class="material-icons">lock_open</span>
                                <span>Sem permissões administrativas</span>
                            </div>
                        </div>
                    </div>
                    <div class="empty-chips-state" v-else>
                        <span class="material-icons">badge</span>
                        <p>{{ functionSearchQuery ? 'Nenhuma função corresponde à busca' : 'Nenhuma função cadastrada' }}</p>
                    </div>

                    <button type="button" class="btn primary btn-add-setting" @click="toggleAddTagInput('function')" :disabled="!hasActiveChurch">
                        <span class="material-icons">add</span>
                        <span>Adicionar função</span>
                    </button>
                </div>
            </div>

            <p class="response">{{ response }}</p>
        </div>

        <Teleport to="body">
            <Transition name="modal-fade">
                <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm(); returnPageInformations();">
                    <registerTagOrFunction
                        :type="type"
                        :churchId="resolvedChurchId"
                        :permissionOptions="permissionOptions"
                        :initialFunction="editingFunction"
                        @success="closeModal(); returnPageInformations();"
                        @error="handleRegisterError"
                    />
                </modal>
            </Transition>
        </Teleport>

        <!-- Confirm Delete Tag Modal -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <modal 
                    v-if="showConfirmDeleteTag" 
                    title="Excluir Tag" 
                    @closeModal="showConfirmDeleteTag = false" 
                    class="modal" 
                    @cancelEvent="showConfirmDeleteTag = false" 
                    button2Title="Não, cancelar" 
                    buttonTitle="Sim, excluir" 
                    :isDelete="true" 
                    @submitEvent="confirmDeleteTag()"
                >
                    <div class="confirm-delete-box">
                        <p class="warning-text">Tem certeza que deseja excluir esta tag?</p>
                        <p>Os membros associados a ela perderão essa identificação.</p>
                    </div>
                </modal>
            </Transition>
        </Teleport>

        <!-- Confirm Delete Function Modal -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <modal 
                    v-if="showConfirmDeleteFunction" 
                    title="Excluir Função" 
                    @closeModal="showConfirmDeleteFunction = false" 
                    class="modal" 
                    @cancelEvent="showConfirmDeleteFunction = false" 
                    button2Title="Não, cancelar" 
                    buttonTitle="Sim, excluir" 
                    :isDelete="true" 
                    @submitEvent="confirmDeleteFunction()"
                >
                    <div class="confirm-delete-box">
                        <p class="warning-text">Tem certeza que deseja excluir esta função?</p>
                        <p>Os membros associados a ela perderão esse cargo e suas permissões de acesso associadas.</p>
                    </div>
                </modal>
            </Transition>
        </Teleport>
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
            activeTab: "tags",
            editingFunction: null,
            tagSearchQuery: "",
            functionSearchQuery: "",
            permissionOptions: [
                { key: "members.manage", label: "Gerenciar membros", parent: null },
                { key: "members.invite", label: "Convidar membros", parent: "members.manage" },
                { key: "members.remove", label: "Remover membros", parent: "members.manage" },
                { key: "members.roles", label: "Alterar cargos", parent: "members.manage" },
                { key: "members.tags", label: "Alterar tags", parent: "members.manage" },
                { key: "events.manage", label: "Gerenciar eventos", parent: null },
                { key: "events.create", label: "Criar eventos", parent: "events.manage" },
                { key: "events.edit", label: "Editar eventos", parent: "events.manage" },
                { key: "music.manage", label: "Gerenciar músicas", parent: null },
                { key: "music.create", label: "Cadastrar músicas", parent: "music.manage" },
                { key: "music.delete", label: "Remover músicas", parent: "music.manage" },
                { key: "music.cifra.edit", label: "Editar cifras", parent: "music.manage" },
                { key: "warnings.manage", label: "Gerenciar avisos", parent: null },
                { key: "warnings.create", label: "Publicar avisos", parent: "warnings.manage" },
                { key: "warnings.edit", label: "Editar avisos", parent: "warnings.manage" },
                { key: "warnings.delete", label: "Remover avisos", parent: "warnings.manage" }
            ],
            showConfirmDeleteTag: false,
            tagIdToDelete: null,
            showConfirmDeleteFunction: false,
            functionIdToDelete: null
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
            if (!this.hasActiveChurch) {
                this.showResponse("Não foi possível identificar a igreja atual. Recarregue a página e tente novamente.", ".response", "error");
                return;
            }

            this.editingFunction = null;
            this.type = type;
            this.modalTitle = type === "function" ? "Cadastrar função" : "Cadastrar tag";
            this.modalButtonTitle = "Cadastrar";
            this.showModal = true;
            setTimeout(() => {
                $("#entity").focus();
            }, 100);
        },
        editFunction: function (currentFunction) {
            this.type = "function";
            this.editingFunction = { ...currentFunction };
            this.modalTitle = "Editar função";
            this.modalButtonTitle = "Salvar";
            this.showModal = true;
        },
        deleteTag: function (id_tag) {
            this.tagIdToDelete = id_tag;
            this.showConfirmDeleteTag = true;
        },
        confirmDeleteTag: function () {
            const id_tag = this.tagIdToDelete;
            if (!id_tag) return;
            const churchId = this.getCurrentChurchId();
            const data = {
                id_tag: id_tag,
                id_igreja: churchId
            };
            this.tags = this.tags.filter(tag => tag.id_tag !== id_tag);
            api.post("/igreja/deletar-tag", data);
            this.showConfirmDeleteTag = false;
            this.tagIdToDelete = null;
        },
        deleteFunction: function (id_function) {
            this.functionIdToDelete = id_function;
            this.showConfirmDeleteFunction = true;
        },
        confirmDeleteFunction: function () {
            const id_function = this.functionIdToDelete;
            if (!id_function) return;
            const churchId = this.getCurrentChurchId();
            const data = {
                id_function: id_function,
                id_igreja: churchId
            };
            this.functions = this.functions.filter(currentFunction => currentFunction.id_funcao !== id_function);
            api.post("/igreja/deletar-funcao", data);
            this.showConfirmDeleteFunction = false;
            this.functionIdToDelete = null;
        },
        permissionLabelsForFunction: function (currentFunction) {
            const functionPermissions = Array.isArray(currentFunction.permissoes) ? currentFunction.permissoes : [];
            return this.permissionOptions
                .filter((permission) => functionPermissions.includes(permission.key))
                .map((permission) => permission.label);
        },
        permissionSummary: function (currentFunction) {
            const labels = this.permissionLabelsForFunction(currentFunction);
            if (labels.length === 0) {
                return "Cargo sem permissões administrativas";
            }
            return labels.length === 1 ? "1 permissão" : labels.length + " permissões";
        },
        returnChurchTags: function () {
            const churchId = this.getCurrentChurchId();
            if (!churchId) return;
            api.post("/igreja/retorna-tags", { id_igreja: churchId })
                .then((response) => {
                    this.tags = response.data.returnObj;
                    this.response = "";
                })
                .catch((error) => {
                    this.showResponse(error.response.data, ".response", "error");
                })
        },
        returnChurchFunctions: function () {
            const churchId = this.getCurrentChurchId();
            if (!churchId) return;
            api.post("/igreja/retorna-funcoes", { id_igreja: churchId })
                .then((response) => {
                    this.functions = response.data.returnObj;
                    this.response = "";
                })
                .catch((error) => {
                    this.showResponse(error.response.data, ".response", "error");
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
        if (this.getCurrentChurchId()) {
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

.settings-tabs-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 0.5rem;
}

.segmented-control {
    display: flex;
    background: rgba(24, 21, 56, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-pill);
    padding: 4px;
    width: 100%;
    max-width: 480px;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.segment-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: none;
    color: var(--neutral-gray-medium);
    padding: 10px 16px;
    font-size: var(--font-size-5);
    font-weight: 700;
    cursor: pointer;
    border-radius: var(--radius-pill);
    transition: all var(--transition-normal) cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
    user-select: none;
}

.segment-tab:hover {
    color: var(--neutral-white);
}

.segment-tab.active {
    background: linear-gradient(135deg, var(--secondary-blue-soft) 0%, #1e8cb8 100%);
    color: var(--primary-bg);
    box-shadow: 0 4px 12px rgba(56, 182, 255, 0.3);
}

.tab-icon {
    font-size: 16px;
}

.settings-panel {
    min-height: 0;
}

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
    min-height: 420px;
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

.chips-list-container,
.function-list-container {
    flex: 1;
    overflow-y: auto;
    max-height: 46vh;
    padding-right: 4px;
}

.chips-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

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

.function-chip {
    background: rgba(60, 208, 112, 0.05);
    border: 1px solid rgba(60, 208, 112, 0.2);
    color: var(--others-green);
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
    font-size: 18px;
}

.function-list-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.function-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md);
    padding: 12px;
}

.function-card-main {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.function-card h6 {
    margin: 0;
    color: var(--neutral-white);
    font-size: var(--font-size-4);
}

.function-card p {
    margin: 4px 0 0;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
}

.function-actions {
    display: flex;
    gap: 10px;
    align-items: flex-start;
}

.permission-chip-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
}

.permission-chip {
    font-size: 10px;
    padding: 4px 8px;
}

.permission-chip-list.muted {
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
}

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
