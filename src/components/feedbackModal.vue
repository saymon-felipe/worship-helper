<template>
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="show" class="feedback-modal-wrapper">
                <div class="feedback-modal-overlay" @click="$emit('close')"></div>
                <section class="feedback-modal-container" role="alertdialog" aria-modal="true" :aria-label="title">
                    <div class="feedback-icon" aria-hidden="true">
                        <span class="material-icons">event_busy</span>
                    </div>
                    <h4>{{ title }}</h4>
                    <p>{{ message }}</p>
                    <button type="button" class="btn primary" @click="$emit('close')">Entendi</button>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

<script>
export default {
    name: "feedbackModal",
    props: {
        show: Boolean,
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    },
    emits: ["close"]
}
</script>

<style scoped>
.feedback-modal-wrapper,
.feedback-modal-overlay {
    position: fixed;
    inset: 0;
}

.feedback-modal-wrapper {
    z-index: 2200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.feedback-modal-overlay {
    background: rgba(0, 0, 0, 0.68);
}

.feedback-modal-container {
    position: relative;
    z-index: 1;
    width: min(100%, 380px);
    padding: 28px 24px 24px;
    border: 1px solid rgba(255, 190, 60, 0.3);
    border-radius: 20px;
    background: var(--primary-primary-blue-low);
    color: var(--neutral-white);
    text-align: center;
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.45);
}

.feedback-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: 14px;
    border-radius: 50%;
    color: #ffca47;
    background: rgba(255, 202, 71, 0.12);
}

.feedback-icon span {
    font-size: 30px;
}

.feedback-modal-container h4 {
    margin: 0 0 8px;
    font-size: 18px;
}

.feedback-modal-container p {
    margin: 0 0 22px;
    color: var(--neutral-gray-high);
    line-height: 1.5;
}

.feedback-modal-container .btn {
    width: 100%;
}
</style>
