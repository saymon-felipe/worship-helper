<template>
    <div class="add-function-container">
        <div class="add-function-header">
            <h5>Adicione uma função ao usuário: {{ member.nome_usuario }}</h5>
        </div>
        <div class="function-list">
            <form action="replace_occupation" id="replace_occupation_form" @submit.prevent="replaceOccupation(member.id_usuario)">
                <div v-for="(occupation, index) in functions" v-bind:key="index">
                    <div class="input-group">
                        <div class="input-checkbox-container">
                            <input type="checkbox" :name="'id_funcao_' + occupation.id_funcao" :value="occupation.id_funcao" :id="'occupation-' + occupation.id_funcao" :disabled="!occupation.atribuivel">
                            <label :for="'occupation-' + occupation.id_funcao">{{ occupation.nome_funcao }}{{ occupation.atribuivel ? "" : " (acima das suas permissões)" }}</label>
                        </div>
                    </div>
                </div>
                <small class="locked-helper" v-if="hasLockedFunctions">Você só pode atribuir ou remover cargos que não deem mais permissões do que as suas.</small>
                <p class="response">{{ response }}</p>
                <input type="submit" id="submit-informations-form" style="display: none;">
            </form>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';

export default {
    name: "addFunctionModalContent",
    props: ["member"],
    mixins: [globalMethods],
    data() {
        return {
            functions: [],
            response: ""
        }
    },
    computed: {
        hasLockedFunctions: function () {
            return Array.isArray(this.functions) && this.functions.some((occupation) => !occupation.atribuivel);
        }
    },
    watch: {
        functions: function () {
            this.checkCurrentFunction();
        }
    },
    methods: {
        checkCurrentFunction: function () {
            setTimeout(() => {
                for (let i = 0; i < this.functions.length; i++) {
                    this.member.funcoes_usuario.filter(funcao => {
                        if (funcao.id_funcao == this.functions[i].id_funcao) {
                            $("#occupation-"  + this.functions[i].id_funcao).prop("checked", true);
                            return funcao;
                        }
                    })
                }
            }, 10)
        },
        replaceOccupation: function(id_usuario) {
            let self = this;
            let checkedInputs = [];
            let inputs = $(".input-checkbox-container input");
            let data = {};
            
            inputs.each((index, item) => {
                if (item.checked) {
                    checkedInputs.push(item.value);
                }
            })

            data.id_usuario = id_usuario;
            data.id_igreja = this.getCurrentChurchId();
            data.new_functions = checkedInputs;

            $(".response").removeClass("error");
            self.response = "";

            api.post("/usuario/altera-funcoes", data).then(function () {
                self.$emit("success", {
                    type: "functions",
                    memberId: id_usuario,
                    functions: self.functions.filter((churchFunction) => checkedInputs.includes(String(churchFunction.id_funcao)))
                });
            }).catch(function (error) {
                const message = error && error.response && typeof error.response.data === "string"
                    ? error.response.data
                    : "Não foi possível atualizar as funções";
                self.showResponse(message, ".response", "error");
            })
        },
        returnOccupations: function () {
            let self = this;
            let data = {
                id_igreja: this.getCurrentChurchId()
            }

            api.post("/igreja/retorna-funcoes-atribuiveis", data)
                .then(function (response) {
                    self.functions = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
        }
    },
    mounted: function () {
        this.returnOccupations();
    }
}
</script>
<style scoped>
.add-function-container {
    padding: 1rem;
}

.locked-helper {
    display: block;
    margin-top: 12px;
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
    line-height: 1.4;
}

.add-function-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
