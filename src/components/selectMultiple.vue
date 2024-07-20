<template>
    <div class="select-multiple">
        <div class="select-input" v-on:click="showSelect = !showSelect">
            <div class="selected-items">
                <div class="selected-item" v-for="(item, index) in selectedItems" :key="index">
                    <span>{{ item.nome }}</span>
                    <span class="material-icons" v-on:click="removeItem(item); showSelect = false;">close</span>
                </div>
            </div>
            <span class="material-icons">expand_more</span>
        </div>
        <div class="select-list" v-if="showSelect">
            <div class="option" v-for="(item, index) in items" :key="index" :value="item.id" v-on:click="selectItem(item)">
                <span :class="selectedItems.indexOf(item) != -1 ? 'selected' : ''">{{ item.nome }}</span>
            </div>
        </div>
        <div class="select-wrapper" v-if="showSelect" v-on:click="showSelect = !showSelect"></div>
    </div>
</template>
<script>
export default {
    name: "selectMultiple",
    props: ["items", "maxlength"],
    data() {
        return {
            selectedItems: [],
            showSelect: false
        }
    },
    methods: {
        selectItem: function (item) {
            if (this.selectedItems.length >= parseInt(this.maxlength)) return;

            if (this.selectedItems.indexOf(item) == -1) {
                this.selectedItems.push(item);
            }
            
            this.$emit("selectedItems", this.selectedItems);
        },
        removeItem: function (item) {
            this.selectedItems = this.selectedItems.filter(obj => obj.id != item.id);
            this.$emit("selectedItems", this.selectedItems);
        }
    }
}
</script>
<style scoped>
.selected {
    opacity: 0.5;
}

.select-wrapper {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
}

.select-multiple {
    position: relative;
}

.selected-items {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    max-width: 90%;
    overflow-x: auto;
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

    .selected-item span:first-child {
        margin-right: 3px;
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

.option {
    padding: 10px;
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