<template>
    <div class="add-occupation-container">
        <h5>Selecione o cargo que quer atribuir ao usuário: {{ member.nome_usuario }}</h5>
        <div class="occupations-list">
            <form action="replace_occupation" id="replace_occupation_form" @submit.prevent="replaceOccupation(member.id_usuario)">
                <div v-for="(occupation, index) in occupations" v-bind:key="index">
                    <div class="input-group">
                        <div class="input-checkbox-container">
                            <input type="radio" name="id_tag" :value="occupation.id_tag" :id="'occupation-' + occupation.id_tag">
                            <label :for="'occupation-' + occupation.id_tag">{{ occupation.nome_tag }}</label>
                        </div>
                    </div>
                </div>
                <input type="submit" id="submit-informations-form" style="display: none;">
            </form>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
import api from '../config/api';
import { globalMethods } from '../js/globalMethods';

export default {
    name: "addTagModalContent",
    mixins: [globalMethods],
    props: ["member"],
    data() {
        return {
            occupations: []
        }
    },
    watch: {
        occupations: function () {
            this.checkCurrentTag();
        }
    },
    methods: {
        checkCurrentTag: function () {
            setTimeout(() => {
                if (this.member.tag_usuario[0] == undefined) {
                    return;
                }
                for (let i = 0; i < this.occupations.length; i++) {
                    if (this.occupations[i].id_tag == this.member.tag_usuario[0].id_tag) {
                        $("#occupation-"  + this.occupations[i].id_tag).prop("checked", true);
                    }
                }
            }, 10)
        },
        replaceOccupation: function(id_usuario) {
            let self = this;
            let data = $("#replace_occupation_form").serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
                obj[item.name] = parseInt(item.value);
                return obj;
            }, {});

            data["id_usuario"] = id_usuario;
            data["id_igreja"] = this.igreja.id_igreja;

            if (self.member.tag_usuario.length != 0 && data["id_tag"] == self.member.tag_usuario[0].id_tag) {
                this.$emit("success", true);
                return;
            }

            api.post("/usuario/altera-tag", data).then(() => {
                self.$emit("success", true);
            })
        },
        returnOccupations: function () {
            let self = this;
            let data = {
                id_igreja: this.igreja.id_igreja
            }

            api.post("/igreja/retorna-tags", data)
                .then(function (response) {
                    self.occupations = response.data.returnObj;
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
.add-occupation-container {
    padding: 1rem;
}
</style>