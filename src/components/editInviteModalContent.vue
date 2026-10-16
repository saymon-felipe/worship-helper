<template>
    <div class="edit-invite-container">
        <form action="edit-invite" @submit.prevent="saveInvite()">
            <p class="edit-invite-target">
                Convite para <strong>{{ invite.nome_usuario || invite.email_usuario }}</strong>
            </p>

            <div class="input-group">
                <label for="edit-invite-role-select">Cargo</label>
                <select id="edit-invite-role-select" class="invite-role-select" v-model="selected_function_id" :disabled="saving">
                    <option value="">Sem cargo (apenas membro)</option>
                    <option v-for="churchFunction in churchFunctions" :key="churchFunction.id_funcao" :value="churchFunction.id_funcao" :disabled="!canPick(churchFunction)">
                        {{ churchFunction.nome_funcao }}{{ canPick(churchFunction) ? "" : " (acima das suas permissões)" }}
                    </option>
                </select>
                <small class="invite-helper">Ao aceitar o convite, a pessoa entra na igreja com este cargo e as permissões dele. Você só pode escolher cargos que não deem mais permissões do que as suas.</small>
            </div>

            <div class="invite-loading" v-if="saving">
                <span class="material-icons rotating">sync</span>
                <span>Salvando...</span>
            </div>

            <p class="response">{{ response }}</p>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>

<script>
import { globalMethods } from '../js/globalMethods';
import $ from 'jquery';
import api from '../config/api';

export default {
    name: "editInviteModalContent",
    mixins: [globalMethods],
    props: ["invite"],
    data() {
        return {
            churchFunctions: [],
            selected_function_id: this.invite && this.invite.id_funcao ? this.invite.id_funcao : "",
            response: "",
            saving: false
        }
    },
    methods: {
        // Manter o cargo atual e sempre permitido, mesmo que ele esteja acima do nivel de quem edita (ex.: definido por um administrador)
        canPick: function (churchFunction) {
            return churchFunction.atribuivel || Number(churchFunction.id_funcao) === Number(this.invite.id_funcao);
        },
        getErrorMessage: function (error, fallback = "Não foi possível concluir a ação") {
            const data = error && error.response ? error.response.data : error;

            if (typeof data === "string") {
                return data;
            }

            if (data && typeof data === "object") {
                return data.error || data.message || fallback;
            }

            return fallback;
        },
        loadChurchFunctions: function () {
            const churchId = this.getCurrentChurchId();
            if (!churchId) {
                return;
            }

            api.post("/igreja/retorna-funcoes-atribuiveis", { id_igreja: churchId })
            .then((response) => {
                this.churchFunctions = response.data.returnObj || [];
            })
            .catch((error) => {
                console.log(error);
            });
        },
        saveInvite: function () {
            const self = this;

            if (self.saving) {
                return;
            }

            $(".response").removeClass("error");
            self.response = "";
            self.saving = true;
            self.$emit("loading", true);

            api.post("/igreja/editar-convite", {
                id_igreja: self.getCurrentChurchId(),
                id_convite: self.invite.id,
                id_funcao: self.selected_function_id === "" ? null : Number(self.selected_function_id)
            })
            .then(function (response) {
                self.$emit("success", response.data.returnObj);
            })
            .catch(function (error) {
                const message = self.getErrorMessage(error, "Não foi possível editar o convite");
                self.showResponse(message, ".response", "error");
            })
            .finally(function () {
                self.saving = false;
                self.$emit("loading", false);
            });
        }
    },
    mounted: function () {
        this.loadChurchFunctions();
    }
}
</script>

<style scoped>
.edit-invite-container {
    padding: 1rem;
}

.edit-invite-target {
    margin: 0;
    color: var(--neutral-gray-high);
    font-size: var(--font-size-4);
    overflow-wrap: anywhere;
}

.edit-invite-target strong {
    color: var(--neutral-white);
}

.invite-helper {
    display: block;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
    line-height: 1.4;
    margin-top: 6px;
}

.invite-role-select option {
    background: #181538;
    color: var(--neutral-white);
}

.invite-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 1.5rem;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    color: var(--secondary-blue-soft);
    font-size: var(--font-size-4);
    font-weight: 600;
}

.rotating {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
