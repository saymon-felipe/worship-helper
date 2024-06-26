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
    props: ["type"],
    mixins: [globalMethods],
    data() {
        return {
        }
    },
    methods: {
        createEntity: function() {
            let self = this;

            let data = $("#" + event.target.id).serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            }, {});

            data["id_igreja"] = self.$root.igreja.id_igreja;

            let path = "criar-funcao";

            if (self.type == "tag") {
                path = "criar-tag";
            }

            api.post("/igreja/" + path, data).then(function () {
                self.$emit("success", true);
            })
        }
    },
    mounted: function () {
        this.checkPermission();
    }
}
</script>
<style scoped>
</style>