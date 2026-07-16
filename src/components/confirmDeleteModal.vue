<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div class="modal-wrapper" v-if="show">
                <div class="modal-overlay" @click="cancel"></div>
                <div class="modal-container delete-confirm-container">
                    <div class="modal-header">
                        <span class="material-icons" @click="cancel">chevron_left</span>
                        <h4>{{ title }}</h4>
                    </div>
                    <div class="modal-body confirm-body-layout">
                        <div class="warning-icon-wrapper">
                            <span class="material-icons warning-icon">delete_forever</span>
                        </div>
                        <p class="confirm-message">{{ message }}</p>
                        <p class="confirm-submessage" v-if="subMessage">{{ subMessage }}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn delete-confirm-btn" @click="confirm">{{ buttonTitle }}</button>
                        <button class="btn primary delete-cancel-btn" @click="cancel">{{ button2Title }}</button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
export default {
    name: "confirmDeleteModal",
    props: {
        show: {
            type: Boolean,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        subMessage: {
            type: String,
            default: ""
        },
        buttonTitle: {
            type: String,
            default: "Sim, excluir"
        },
        button2Title: {
            type: String,
            default: "Não, cancelar"
        }
    },
    data() {
        return {
            hasPushState: false
        };
    },
    watch: {
        show: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    if (!this.hasPushState) {
                        window.history.pushState({ confirmDeleteModalOpen: true }, "");
                        this.hasPushState = true;
                    }
                    window.activeModalStack = window.activeModalStack || [];
                    window.activeModalStack.push(this);
                    window.addEventListener("popstate", this.handlePopState);
                } else {
                    this.cleanupHistory();
                }
            }
        }
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
            this.$emit("cancel");
        },
        cleanupHistory() {
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
        },
        confirm() {
            this.cleanupHistory();
            this.$emit("confirm");
        },
        cancel() {
            this.cleanupHistory();
            this.$emit("cancel");
        }
    },
    beforeUnmount() {
        this.cleanupHistory();
    }
}
</script>

<style scoped>
.modal-wrapper {
    z-index: 2000 !important;
}

.delete-confirm-container {
    height: auto !important;
    max-height: 90vh;
    border-radius: 24px 24px 0 0;
    padding: 24px 20px;
    box-sizing: border-box;
    background: linear-gradient(135deg, rgba(23, 20, 50, 0.98) 0%, rgba(15, 12, 35, 0.99) 100%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
}

.confirm-body-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px !important;
    overflow: visible !important;
}

.warning-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 74, 74, 0.1);
    border: 1px solid rgba(255, 74, 74, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 0 25px rgba(255, 74, 74, 0.2);
    animation: pulseRed 2s infinite ease-in-out;
}

@keyframes pulseRed {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 74, 74, 0.4);
    }
    70% {
        box-shadow: 0 0 0 12px rgba(255, 74, 74, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(255, 74, 74, 0);
    }
}

.warning-icon {
    font-size: 32px;
    color: #ff4a4a;
}

.confirm-message {
    font-size: 17px;
    color: #fff;
    line-height: 1.5;
    margin: 0 0 10px 0;
    font-weight: 600;
}

.confirm-submessage {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
    margin: 0;
    max-width: 320px;
}

.modal-footer {
    display: flex;
    width: 100%;
    gap: 16px;
    justify-content: center;
    border-top: none !important;
    padding-top: 16px !important;
}

.modal-footer .btn {
    flex: 1;
    height: 48px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.delete-confirm-btn {
    background: rgba(255, 74, 74, 0.08) !important;
    border: 1px solid rgba(255, 74, 74, 0.3) !important;
    color: #ff4a4a !important;
}

.delete-confirm-btn:hover {
    background: rgba(255, 74, 74, 0.15) !important;
    border-color: rgba(255, 74, 74, 0.5) !important;
    box-shadow: 0 0 16px rgba(255, 74, 74, 0.25);
}

.delete-cancel-btn {
    background: var(--secondary-blue-soft) !important;
    color: #fff !important;
}

.delete-cancel-btn:hover {
    background: #4cc3ff !important;
    box-shadow: var(--glow-shadow);
}

/* Local Transition Override for confirm delete modal bottom-sheet */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .delete-confirm-container,
.modal-fade-leave-active .delete-confirm-container {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from .delete-confirm-container,
.modal-fade-leave-to .delete-confirm-container {
    transform: translateY(100%);
}
</style>
