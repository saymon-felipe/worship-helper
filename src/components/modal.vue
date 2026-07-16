<template>
    <div class="modal-wrapper">
        <div class="modal-container">
            <div class="modal-header">
                <span class="material-icons" v-on:click="!disabled && closeModal()">chevron_left</span>
                <h4>{{ title }}</h4>
            </div>
            <div class="modal-body">
                <slot />
            </div>
            <div class="modal-footer" v-if="buttonTitle != ''">
                <button 
                    v-on:click="emitSubmitEvent()" 
                    :class="['btn', !isDelete ? 'primary' : '']" 
                    :disabled="disabled"
                >
                    {{ buttonTitle }}
                </button>
                <button 
                    v-on:click="emitCancelEvent()" 
                    :class="['btn', isDelete ? 'primary' : '']" 
                    v-if="button2Title != ''" 
                    :disabled="disabled"
                >
                    {{ button2Title }}
                </button>
            </div>
        </div>
        <div class="modal-overlay" v-on:click="!disabled && closeModal()"></div>
    </div>
</template>
<script>
/* eslint-disable vue/multi-word-component-names */
export default {
    name: "modal",
    props: ['title', 'buttonTitle', 'button2Title', 'disabled', 'isDelete'],
    data() {
        return {
            hasPushState: false
        };
    },
    mounted() {
        if (!this.hasPushState) {
            window.history.pushState({ genericModalOpen: true }, "");
            this.hasPushState = true;
        }
        window.activeModalStack = window.activeModalStack || [];
        window.activeModalStack.push(this);
        window.addEventListener("popstate", this.handlePopState);
    },
    methods: {
        handlePopState() {
            if (window.isPoppingForClose) {
                window.isPoppingForClose = false;
                return;
            }
            if (window.activeModalStack && window.activeModalStack[window.activeModalStack.length - 1] !== this) {
                return;
            }
            this.hasPushState = false;
            if (window.activeModalStack) {
                window.activeModalStack = window.activeModalStack.filter(item => item !== this);
            }
            window.removeEventListener("popstate", this.handlePopState);
            this.$emit("closeModal");
        },
        closeModal: function () {
            if (this.disabled) return;
            if (this.hasPushState) {
                window.history.back();
            } else {
                if (window.activeModalStack) {
                    window.activeModalStack = window.activeModalStack.filter(item => item !== this);
                }
                this.$emit("closeModal");
            }
        },
        emitSubmitEvent: function () {
            if (this.disabled) return;
            this.$emit("submitEvent");
        },
        emitCancelEvent: function () {
            if (this.disabled) return;
            this.$emit("cancelEvent");
        },
        cleanupPopState() {
            window.removeEventListener("popstate", this.handlePopState);
            if (window.activeModalStack) {
                window.activeModalStack = window.activeModalStack.filter(item => item !== this);
            }
            if (this.hasPushState) {
                this.hasPushState = false;
                if (window.activeModalStack && window.activeModalStack.length > 0) {
                    window.isPoppingForClose = true;
                }
                window.history.back();
            }
        }
    },
    beforeUnmount() {
        this.cleanupPopState();
    }
}
</script>
<style scoped>
.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    cursor: pointer;
    z-index: 1;
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
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header span {
    position: absolute;
    left: 0;
    font-size: 30px;
    cursor: pointer;
}

.modal-body {
    overflow-y: auto;
    flex: 1;
    padding: 1rem 0;
    scrollbar-width: thin;
}

.modal-footer {
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: center;
}

.modal-footer button:nth-child(2) {
    margin-left: 12px;
}
</style>
