<template>
    <div class="push-notifications-content">
        <div class="push-icon">
            <span class="material-icons">notifications</span>
        </div>
        <div>
            <h3>Fique por dentro</h3>
            <p>Receba avisos da igreja, novos eventos e comentarios dos eventos em que voce participa.</p>
        </div>
        <p v-if="message" class="push-status">{{ message }}</p>
    </div>
</template>

<script>
export default {
    name: "pushNotificationsModalContent",
    props: {
        message: String
    }
};
</script>

<style scoped>
.push-notifications-content {
    min-height: 270px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    text-align: center;
}

.push-icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--secondary-blue-soft);
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.25);
}

.push-icon .material-icons {
    font-size: 32px;
}

.push-notifications-content h3 {
    margin-bottom: 0.5rem;
}

.push-notifications-content p {
    max-width: 440px;
    color: var(--neutral-gray-medium);
    line-height: 1.55;
}

.push-notifications-content .push-status {
    color: var(--others-yellow);
    font-size: var(--font-size-4);
}
</style>
