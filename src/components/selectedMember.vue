<template>
    <span class="selected-member" v-if="selected_member.id_usuario != null">
        <img :src="selected_member.imagem_usuario">
        <div class="member-informations">
            <p>{{ selected_member.nome_usuario }}</p>
            <span class="material-icons" v-on:click="removeSelectedUser()">clear</span>
        </div>
    </span>
</template>
<script>
import { globalMethods } from '../js/globalMethods';

export default {
    name: "selectedMember",
    props: ["selected_member"],
    mixins: [globalMethods],
    methods: {
        removeSelectedUser: function () {
            this.resetSelectedMember();
            this.$emit("removeUser", true);
        }
    }
}
</script>
<style scoped>
.selected-member {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.4s;
    padding: .5rem;
    position: absolute;
    bottom: 3px;
    left: 3px;
    height: 40px;
    border-radius: 10px;
    background: var(--secondary-secondary-blue-medium);
}

    .selected-member img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 10px;
    }

.member-informations {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

    .member-informations > p {
        white-space: nowrap;
        max-width: 72vw;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>