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
                            <input type="checkbox" :name="'id_funcao_' + occupation.id_funcao" :value="occupation.id_funcao" :id="'occupation-' + occupation.nome_funcao">
                            <label :for="'occupation-' + occupation.nome_funcao">{{ occupation.nome_funcao }}</label>
                        </div>
                    </div>
                </div>
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
    props: ["member", "igreja"],
    mixins: [globalMethods],
    data() {
        return {
            functions: {}
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
                console.log(this.member)
                for (let i = 0; i < this.functions.length; i++) {
                    this.member.funcoes_usuario.filter(funcao => {
                        if (funcao.id_funcao == this.functions[i].id_funcao) {
                            $("#occupation-"  + this.functions[i].nome_funcao).prop("checked", true);
                            return funcao;
                        }
                    })
                }
            }, 10)
        },
        replaceOccupation: function(id_usuario) {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let checkedInputs = [];
            let inputs = $(".input-checkbox-container input");
            let data = {};
            inputs.each((index, item) => {
                if (item.checked) {
                    checkedInputs.push(item.value);
                }
            })
            data.id_usuario = id_usuario;
            data.id_igreja = this.igreja.id_igreja;
            data.new_functions = checkedInputs;

            this.$emit("success", true);

            api.post("/usuario/altera-funcoes", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    console.log(response)
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        returnOccupations: function () {
            let self = this;
            let jwt = "Bearer " + self.getJwtFromLocalStorage();
            let data = {
                id_igreja: this.igreja.id_igreja
            }

            api.post("/igreja/retorna-funcoes", data, {
                headers: {
                    Authorization: jwt
                }
            })
                .then(function (response) {
                    self.functions = response.data.lista_funcoes;
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

.add-function-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>