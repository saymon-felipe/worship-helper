<template>
    <div class="install-app-content">
        <div class="install-icon">
            <span class="material-icons">download</span>
        </div>
        <div class="install-copy">
            <h3>Use como aplicativo</h3>
            <p>Você está usando o Worship Helper no navegador. Instale para abrir direto pela tela inicial do seu celular.</p>
        </div>
        <div v-if="showIOSInstructions" class="ios-instructions">
            <span class="material-icons">ios_share</span>
            <p>No Safari, toque em Compartilhar e selecione <strong>Adicionar à Tela de Início</strong>.</p>
        </div>
        <p v-if="errorMessage" class="install-error">{{ errorMessage }}</p>
    </div>
</template>

<script>
export default {
    name: "installAppModalContent",
    props: {
        isIOS: Boolean,
        showIOSInstructions: Boolean,
        errorMessage: String
    }
};
</script>

<style scoped>
.install-app-content {
    min-height: 270px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    text-align: center;
}

.install-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--secondary-blue-soft);
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.25);
}

.install-icon .material-icons {
    font-size: 32px;
}

.install-copy {
    max-width: 440px;
}

.install-copy h3 {
    margin-bottom: 0.5rem;
}

.install-copy p,
.ios-instructions p,
.install-error {
    color: var(--neutral-gray-medium);
    line-height: 1.55;
}

.ios-instructions {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 440px;
    padding: 1rem;
    text-align: left;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.05);
}

.ios-instructions .material-icons {
    color: var(--secondary-blue-soft);
}

.install-error {
    color: var(--others-yellow);
    font-size: var(--font-size-4);
}
</style>
