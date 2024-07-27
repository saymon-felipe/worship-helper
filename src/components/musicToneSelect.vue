<template>
    <div class="select-tones">
        <div class="select-input" v-on:click="showSelect = !showSelect">
            <div class="selected-item" :class="selectedTone.id == 0 ? 'select-tone' : ''" :style="'opacity: ' + selectedTone.id != undefined ? '1' : '0'">
                <span>{{ selectedTone.nome }}</span>
            </div>
            <span class="material-icons">expand_more</span>
        </div>
        <div class="select-list" v-if="showSelect">
            <div class="church-tones">
                <label>Tons recentes</label>
                <div class="option" v-for="(tone, index) in churchTones" :key="index" :value="tone.id" v-on:click="selectItem(tone)">
                    <span>{{ tone.nome }}</span>
                </div>
                <div class="empty">
                    <span>Nenhum tom para essa música foi definido ainda</span>
                </div>
            </div>
            <div class="all-tones">
                <label>Todos os tons</label>
                <div class="option" v-for="(tone2, index2) in allTones" :key="index2" :value="tone2.id" v-on:click="selectItem(tone2)">
                    <span>{{ tone2.nome }}</span>
                </div>
            </div>
        </div>
        <div class="select-wrapper" v-if="showSelect" v-on:click="showSelect = !showSelect"></div>
    </div>
</template>
<script>
import api from '../config/api';

export default {
    name: "musicToneSelect",
    props: ["musicid"],
    data() {
        return {
            churchTones: [],
            allTones: [],
            selectedTone: {
                id: 0,
                nome: "Selecione"
            },
            showSelect: false
        }
    },
    methods: {
        returnChurchTones: function () {
            let self = this;

            let data = {
                id_igreja: this.igreja.id_igreja
            }

            api.post("/igreja/tons_de_musica/" + this.musicid, data)
            .then(function (response) {
                self.churchTones = response.data.returnObj.churchTones;
                self.allTones = response.data.returnObj.allTones;
            })
        },
        selectItem: function (tone) {
            this.selectedTone = tone;
            this.$emit("select", this.selectedTone);
            this.showSelect = false;
        }
    },
    mounted: function () {
        this.returnChurchTones();
    }
}
</script>
<style scoped>
.select-wrapper {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
}

.select-tones {
    position: relative;
}

.select-tone {
    background: none !important;
}

.selected-item {
    display: flex;
    align-items: center;
    background: var(--neutral-gray-high-2);
    margin-right: 7px;
    border-radius: 7px;
    padding: 4px 7px;
    text-transform: capitalize;
}

.select-list {
    position: absolute;
    top: 110%;
    background: var(--neutral-white);
    color: var(--neutral-black-medium);
    border-radius: 10px;
    width: 100%;
    max-height: 250px;
    overflow: hidden;
    overflow-y: auto;
    z-index: 2;
}

.option, .church-tones label, .all-tones label, .empty {
    padding: 10px;
    display: block;
}

.option, .church-tones, .all-tones {
    cursor: pointer;
    text-transform: capitalize;
    font-weight: 600;
    border-bottom: 1px solid var(--neutral-gray-high-2);
}

    .option:hover {
        background: var(--secondary-blue-soft-2);
    }

.select-input {
    padding: 13px 10px;
    border-radius: 10px;
    border: none;
    font-size: var(--font-size-3);
    background: var(--neutral-white);
    height: 47px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--neutral-black-low);
    cursor: pointer;
}
</style>