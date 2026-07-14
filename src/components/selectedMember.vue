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
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    height: 28px;
    border-radius: var(--radius-pill);
    background: rgba(56, 182, 255, 0.1);
    border: 1px solid rgba(56, 182, 255, 0.3);
    color: var(--neutral-white);
    transition: all var(--transition-fast);
    box-sizing: border-box;
}

.selected-member img {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: 50%;
    object-fit: cover;
}

.member-informations {
    display: flex;
    align-items: center;
    gap: 8px;
}

.member-informations > p {
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    max-width: 120px;
    text-overflow: ellipsis;
    overflow: hidden;
}

.member-informations .material-icons {
    font-size: 14px;
    color: var(--neutral-gray-medium);
    cursor: pointer;
    transition: color var(--transition-fast);
}

.member-informations .material-icons:hover {
    color: var(--others-red);
}
</style>