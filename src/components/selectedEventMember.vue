<template>
    <span class="event-selected-member" v-if="member.id_usuario != null" :id="'member-' + member.id_usuario">
        <div class="event-member-content">
            <img class="avatar-pp" :src="member.imagem_usuario">
            <div class="member-informations">
                <p>{{ member.nome_usuario }}</p>
                <span>{{ member.nome_funcao }}</span>
            </div>
        </div>
        <span class="material-icons" id="member-more-actions" v-on:click="openMemberMoreActions(member.id_usuario)">more_vert</span>
        <div class="member-more-actions">
            <ul>
                <li v-on:click="removeMemberFunction(member)">
                    <span>Remover membro</span>
                </li>
            </ul>
        </div>
        <div class="member-more-actions-wrapper" v-if="showMemberMoreActions" v-on:click="closeMemberMoreActions()"></div>
    </span>
</template>
<script>
import { globalMethods } from '../js/globalMethods';

export default {
    name: "selectedEventMember",
    props: ["member"],
    mixins: [globalMethods],
    methods: {
        removeMemberFunction: function (member) {
            this.$emit("removeUser", member.id_usuario);
        }
    }
}
</script>
<style scoped>
.event-selected-member {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem;
}

.event-member-content {
    display: flex;
    align-items: center;
}

.member-informations {
    display: flex;
    flex-direction: column;
    margin-left: 7px;
}

    .member-informations > p {
        white-space: nowrap;
        max-width: 72vw;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>