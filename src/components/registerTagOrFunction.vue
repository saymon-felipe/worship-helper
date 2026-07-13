<template>
    <div class="inner-modal-container">
        <form id="create-entity" @submit.prevent="createEntity()">
            <div class="input-group">
                <label for="entity">Nome</label>
                <input type="text" id="entity" name="nome" required>
            </div>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';

export default {
    name: "returnTagOrFunction",
    props: ["type", "churchId"],
    mixins: [globalMethods],
    data() {
        return {
        }
    },
    methods: {
        createEntity: function() {
            let self = this;

            let data = $("#create-entity").serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});

            const resolvedChurchId = Number(self.churchId ?? self.getCurrentChurchId());

            if (!Number.isInteger(resolvedChurchId) || resolvedChurchId <= 0) {
                self.$emit("error", "Não foi possível identificar a igreja atual. Recarregue a página e tente novamente.");
                return;
            }

            data["id_igreja"] = resolvedChurchId;

            let path = "criar-funcao";

            if (self.type == "tag") {
                path = "criar-tag";
            }

            api.post("/igreja/" + path, data).then(function () {
                $("#entity").val("");
                self.$emit("success", true);
            }).catch(function (error) {
                const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "Erro ao cadastrar.";
                self.$emit("error", errorMessage);
            });
        }
    },
    mounted: function () {
    }
}
</script>
<style scoped>
</style>
