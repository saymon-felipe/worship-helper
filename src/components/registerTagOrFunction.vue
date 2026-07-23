<template>
    <div class="inner-modal-container">
        <form id="create-entity" @submit.prevent="createEntity()">
            <div class="input-group">
                <label for="entity" class="input-label">Nome da função / tag</label>
                <input type="text" id="entity" name="nome" v-model="entityName" class="modern-input" placeholder="Ex: Guitarrista, Ministério Infantil..." required>
            </div>
            <div class="permissions-section" v-if="isFunction">
                <label class="section-title">Permissões de Acesso</label>
                <div class="permission-group-card" v-for="group in groupedPermissionOptions" :key="group.key">
                    <div class="group-header">
                        <label class="permission-option parent-option">
                            <input
                                type="checkbox"
                                :checked="isGroupFullySelected(group)"
                                :indeterminate="isGroupPartiallySelected(group)"
                                :aria-checked="groupSelectionState(group)"
                                @change="toggleParentPermission(group, $event.target.checked)"
                            >
                            <span class="custom-checkbox"></span>
                            <span class="option-text">{{ group.label }}</span>
                        </label>
                    </div>
                    <div class="permission-children-grid">
                        <label class="permission-option child-option" v-for="child in group.children" :key="child.key">
                            <input type="checkbox" :checked="isPermissionSelected(child.key)" @change="toggleChildPermission(group.key, child.key, $event.target.checked)">
                            <span class="custom-checkbox"></span>
                            <span class="option-text">{{ child.label }}</span>
                        </label>
                    </div>
                </div>
            </div>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';

export default {
    name: "returnTagOrFunction",
    props: ["type", "churchId", "permissionOptions", "initialFunction"],
    mixins: [globalMethods],
    data() {
        return {
            entityName: "",
            selectedPermissions: []
        }
    },
    computed: {
        isFunction: function () {
            return this.type === "function";
        },
        isEditing: function () {
            return Boolean(this.initialFunction && this.initialFunction.id_funcao);
        },
        groupedPermissionOptions: function () {
            const options = Array.isArray(this.permissionOptions) ? this.permissionOptions : [];
            return options
                .filter((permission) => !permission.parent)
                .map((permission) => ({
                    ...permission,
                    children: options.filter((child) => child.parent === permission.key)
                }));
        }
    },
    methods: {
        createEntity: function() {
            let self = this;

            const resolvedChurchId = Number(self.churchId ?? self.getCurrentChurchId());

            if (!Number.isInteger(resolvedChurchId) || resolvedChurchId <= 0) {
                self.$emit("error", "Não foi possível identificar a igreja atual. Recarregue a página e tente novamente.");
                return;
            }

            const data = {
                id_igreja: resolvedChurchId,
                nome: self.entityName,
                permissoes: self.isFunction ? self.selectedPermissions : []
            };

            let path = "criar-funcao";

            if (self.type == "tag") {
                path = "criar-tag";
            } else if (self.isEditing) {
                path = "atualizar-funcao";
                data.id_function = self.initialFunction.id_funcao;
            }

            api.post("/igreja/" + path, data).then(function (response) {
                self.entityName = "";
                self.selectedPermissions = [];
                self.$emit("success", {
                    type: self.type,
                    isEditing: self.isEditing,
                    entity: response.data.returnObj
                });
            }).catch(function (error) {
                const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Erro ao cadastrar.";
                self.$emit("error", errorMessage);
            });
        },
        isPermissionSelected: function (permissionKey) {
            return this.selectedPermissions.includes(permissionKey);
        },
        isGroupFullySelected: function (group) {
            if (group.children.length === 0) {
                return this.isPermissionSelected(group.key);
            }

            return group.children.every((child) => this.isPermissionSelected(child.key));
        },
        isGroupPartiallySelected: function (group) {
            if (group.children.length === 0) {
                return false;
            }

            const selectedChildren = group.children.filter((child) => this.isPermissionSelected(child.key)).length;
            return selectedChildren > 0 && selectedChildren < group.children.length;
        },
        groupSelectionState: function (group) {
            if (this.isGroupPartiallySelected(group)) {
                return "mixed";
            }

            return this.isGroupFullySelected(group) ? "true" : "false";
        },
        toggleParentPermission: function (group, checked) {
            const childKeys = group.children.map((child) => child.key);

            if (checked) {
                this.addPermission(group.key);
                childKeys.forEach((childKey) => this.addPermission(childKey));
                return;
            }

            this.selectedPermissions = this.selectedPermissions.filter((permission) => permission !== group.key && !childKeys.includes(permission));
        },
        toggleChildPermission: function (parentKey, childKey, checked) {
            if (checked) {
                this.addPermission(parentKey);
                this.addPermission(childKey);
                return;
            }

            this.selectedPermissions = this.selectedPermissions.filter((permission) => permission !== childKey);

            const parentGroup = this.groupedPermissionOptions.find((group) => group.key === parentKey);
            const hasSelectedChild = parentGroup && parentGroup.children.some((child) => this.isPermissionSelected(child.key));
            if (!hasSelectedChild) {
                this.selectedPermissions = this.selectedPermissions.filter((permission) => permission !== parentKey);
            }
        },
        addPermission: function (permissionKey) {
            if (!this.selectedPermissions.includes(permissionKey)) {
                this.selectedPermissions.push(permissionKey);
            }
        }
    },
    watch: {
        initialFunction: {
            immediate: true,
            handler: function (initialFunction) {
                this.entityName = initialFunction?.nome_funcao || "";
                this.selectedPermissions = Array.isArray(initialFunction?.permissoes)
                    ? [...initialFunction.permissoes]
                    : [];

                this.groupedPermissionOptions.forEach((group) => {
                    if (group.children.some((child) => this.isPermissionSelected(child.key))) {
                        this.addPermission(group.key);
                    }
                });
            }
        }
    }
}
</script>
<style scoped>
.input-label {
    display: block;
    margin-bottom: 6px;
    font-size: var(--font-size-5);
    font-weight: 600;
    color: var(--neutral-gray-high);
}

.modern-input {
    width: 100%;
    height: 42px;
    padding: 0 14px;
    font-size: var(--font-size-4);
    background: rgba(24, 21, 56, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md);
    color: var(--neutral-white);
    outline: none;
    transition: all var(--transition-fast);
}

.modern-input:focus {
    border-color: var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
}

.permissions-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 1.5rem;
}

.section-title {
    font-size: var(--font-size-4);
    font-weight: 700;
    color: var(--neutral-white);
    margin-bottom: 4px;
}

.permission-group-card {
    background: transparent;
    border: none;
    padding: 0;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.group-header {
    width: 100%;
}

.permission-option {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    transition: all var(--transition-fast);
    box-sizing: border-box;
}

/* Parent Option Box */
.parent-option {
    color: var(--neutral-white);
    font-weight: 700;
    font-size: var(--font-size-4);
    padding: 14px 16px;
    min-height: 48px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md);
}

.parent-option:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.12);
}

.parent-option:has(input:checked) {
    background: rgba(56, 182, 255, 0.12);
    border-color: rgba(56, 182, 255, 0.45);
    box-shadow: 0 4px 12px rgba(56, 182, 255, 0.15);
}

.parent-option:has(input:indeterminate) {
    background: rgba(56, 182, 255, 0.07);
    border-color: rgba(56, 182, 255, 0.3);
}

/* Child Option Box */
.child-option {
    color: var(--neutral-gray-high);
    font-size: var(--font-size-5);
    font-weight: 500;
    padding: 12px 14px;
    min-height: 46px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: var(--radius-md);
}

.child-option:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
    color: var(--neutral-white);
}

.child-option:has(input:checked) {
    background: rgba(56, 182, 255, 0.06);
    border-color: rgba(56, 182, 255, 0.25);
    color: var(--neutral-white);
}

/* Nesting layout (Hierarquia de árvore) */
.permission-children-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 20px;
    margin-left: 24px;
    border-left: 2px dashed rgba(255, 255, 255, 0.08);
    margin-top: 4px;
    margin-bottom: 4px;
}

/* HIDE DEFAULT CHECKBOX */
.permission-option input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

/* CUSTOM CHECKBOX INDICATOR */
.custom-checkbox {
    position: relative;
    height: 20px;
    width: 20px;
    background-color: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-sm);
    display: inline-block;
    flex-shrink: 0;
    transition: all var(--transition-fast);
}

/* Hover state */
.permission-option:hover .custom-checkbox {
    border-color: var(--secondary-blue-soft);
    background-color: rgba(56, 182, 255, 0.05);
}

/* Checked state */
.permission-option input:checked ~ .custom-checkbox {
    background-color: var(--secondary-blue-soft);
    border-color: var(--secondary-blue-soft);
    box-shadow: 0 0 6px rgba(56, 182, 255, 0.35);
}

.permission-option input:indeterminate ~ .custom-checkbox {
    background-color: rgba(56, 182, 255, 0.45);
    border-color: var(--secondary-blue-soft);
    box-shadow: 0 0 6px rgba(56, 182, 255, 0.2);
}

/* Checkmark indicator (hidden when not checked) */
.custom-checkbox:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 9px;
    border: solid var(--primary-bg);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

/* Show checkmark when checked */
.permission-option input:checked ~ .custom-checkbox:after {
    display: block;
}

.permission-option input:indeterminate ~ .custom-checkbox:after {
    display: block;
    left: 4px;
    top: 8px;
    width: 10px;
    height: 0;
    border-width: 0 0 2px 0;
    transform: none;
}
</style>
