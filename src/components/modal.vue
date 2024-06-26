<template>
    <div class="modal-wrapper">
        <div class="modal-container">
            <div class="modal-header">
                <span class="material-icons" v-on:click="closeModal()">chevron_left</span>
                <h4>{{ title }}</h4>
            </div>
            <div class="modal-body">
                <slot />
            </div>
            <div class="modal-footer" v-if="buttonTitle != ''">
                <button v-on:click="emitSubmitEvent()" class="btn primary">{{ buttonTitle }}</button>
                <button v-on:click="emitCancelEvent()" class="btn secondary" v-if="button2Title != ''">{{ button2Title }}</button>
            </div>
        </div>
        <div class="modal-overlay" v-on:click="closeModal()"></div>
    </div>
</template>
<script>
import $ from 'jquery';

export default {
    name: "modal",
    props: ['title', 'buttonTitle', 'button2Title'],
    methods: {
        closeModal: function () {
            let modalContainer = $(".modal-container");
            modalContainer.css("transform", "translateY(80vh)");
            setTimeout(() => {
                this.$emit("closeModal");
            }, 400);
        },
        showModal: function () {
            let modalContainer = $(".modal-container");
            modalContainer.css("transform", "translateY(0)");
        },
        emitSubmitEvent: function () {
            this.$emit("submitEvent");
        },
        emitCancelEvent: function () {
            this.$emit("cancelEvent");
        }
    },
    mounted: function () {
        setTimeout(() => {
            this.showModal();
        }, 10);
    }
}
</script>
<style scoped>
.modal-wrapper {
    width: 100%;
}

.modal-overlay {
    z-index: 1;
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: black;
    opacity: 0.3;
    cursor: pointer;
}

.modal-container {
    position: relative;
    z-index: 2;
    height: 80vh;
    width: 100%;
    max-width: 900px;
    max-height: 1000px;
    background: var(--primary-primary-blue-low);
    border-radius: 20px 20px 0 0;
    color: var(--neutral-white);
    padding: 1rem;
    margin: auto;
    transition: all 0.4s;
    transform: translateY(80vh);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

    .modal-header span {
        position: absolute;
        left: 0;
        font-size: 30px;
        cursor: pointer;
    }

.modal-body {
    overflow-y: auto;
    min-height: calc(100% - 95px);
}

.modal-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
    display: flex;
    justify-content: center;
}

    .modal-footer button:nth-child(2) {
        margin-left: 12px;
    }
</style>