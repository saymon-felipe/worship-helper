<template>
    <div class="select-multiple">
        <div class="select-input" ref="selectInput" v-on:click="toggleSelect()" :class="{ open: showSelect }">
            <div class="selected-items">
                <div class="selected-item" v-for="(item, index) in selectedItems" :key="index">
                    <span>{{ item.nome }}</span>
                    <span class="material-icons" v-on:click.stop="removeItem(item)">close</span>
                </div>
                <span class="placeholder" v-if="selectedItems.length === 0">Selecione até {{ maxlength }} tags</span>
            </div>
            <span class="material-icons select-arrow">expand_more</span>
        </div>
        <div class="select-list" v-if="showSelect">
            <div class="option" v-for="(item, index) in items" :key="index" :value="item.id" v-on:click="selectItem(item)">
                <span>{{ item.nome }}</span>
                <span class="material-icons option-check" v-if="isSelected(item)">check</span>
            </div>
        </div>
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
        isSelected: function (item) {
            return this.selectedItems.some((selectedItem) => selectedItem.id === item.id);
        },
        toggleSelect: function () {
            this.showSelect = !this.showSelect;
        },
        closeSelect: function () {
            this.showSelect = false;
        },
        selectItem: function (item) {
            if (this.isSelected(item)) {
                this.removeItem(item);
                return;
            }

            if (this.selectedItems.length >= parseInt(this.maxlength)) return;

            this.selectedItems.push(item);
            
            this.$emit("selectedItems", this.selectedItems);
        },
        removeItem: function (item) {
            this.selectedItems = this.selectedItems.filter(obj => obj.id != item.id);
            this.$emit("selectedItems", this.selectedItems);
        },
        documentClick: function (e) {
            if (this.showSelect) {
                const el = this.$el;
                if (el && !el.contains(e.target)) {
                    this.closeSelect();
                }
            }
        }
    },
    mounted: function () {
        document.addEventListener("click", this.documentClick);
    },
    beforeUnmount: function () {
        document.removeEventListener("click", this.documentClick);
    }
}
</script>
<style scoped>
.select-multiple {
    position: relative;
    z-index: 20;
}

.selected-items {
    display: flex;
    align-items: center;
    max-width: 90%;
    overflow-x: auto;
}

.selected-item {
    display: flex;
    align-items: center;
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.28);
    color: var(--secondary-blue-soft);
    margin-right: 7px;
    border-radius: var(--radius-pill);
    padding: 4px 8px;
    text-transform: capitalize;
    white-space: nowrap;
    font-size: var(--font-size-5);
    font-weight: 700;
}

.selected-item span:first-child {
    margin-right: 3px;
}

.selected-item .material-icons {
    font-size: 16px;
    cursor: pointer;
}

.placeholder {
    color: var(--neutral-gray-low);
    font-size: var(--font-size-4);
}

.select-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background: var(--primary-bg-light);
    color: var(--neutral-white);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    max-height: 250px;
    overflow-y: auto;
    z-index: 9999;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
    backdrop-filter: var(--glass-blur);
    padding: 6px;
}

.option {
    padding: 10px 12px;
    cursor: pointer;
    text-transform: capitalize;
    font-weight: 600;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--neutral-gray-high);
    transition: background var(--transition-fast), color var(--transition-fast);
}

.option:hover {
    background: var(--secondary-blue-soft-2);
    color: var(--neutral-white);
}

.option-check {
    color: var(--secondary-blue-soft);
    font-size: 18px;
}

.select-input {
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    font-size: var(--font-size-3);
    background: rgba(24, 21, 56, 0.5);
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--neutral-white);
    cursor: pointer;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.select-input.open,
.select-input:hover {
    background: rgba(24, 21, 56, 0.85);
    border-color: var(--primary-primary-blue-high-2);
    box-shadow: var(--glow-shadow);
}

.select-arrow {
    color: var(--neutral-gray-medium);
    transition: transform var(--transition-fast);
}

.select-input.open .select-arrow {
    transform: rotate(180deg);
}
</style>
