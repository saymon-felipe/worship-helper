<template>
    <div class="push-notifications-content">
        <div class="push-icon" :class="{ blocked: reason !== 'default' }">
            <span class="material-icons">{{ reason === "default" ? "notifications" : "notifications_off" }}</span>
        </div>

        <div v-if="reason === 'denied'">
            <h3>Notificações bloqueadas</h3>
            <p>Você ainda não recebe os avisos da igreja, novos eventos e comentários. Para liberar:</p>
            <ol class="push-steps" v-if="platform === 'ios'">
                <li>Abra o app <strong>Ajustes</strong> do iPhone.</li>
                <li>Toque em <strong>Notificações</strong> e depois em <strong>Worship Helper</strong>.</li>
                <li>Ative <strong>Permitir Notificações</strong> e volte para o app.</li>
            </ol>
            <ol class="push-steps" v-else-if="platform === 'android'">
                <li>Toque e segure o ícone do <strong>Worship Helper</strong> e escolha <strong>Informações do app</strong>.</li>
                <li>Entre em <strong>Notificações</strong> e ative.</li>
                <li>Se não aparecer, no Chrome vá em <strong>Configurações › Configurações do site › Notificações</strong> e permita este site.</li>
            </ol>
            <p v-else class="push-hint">Libere as notificações deste app nas configurações do navegador ou do sistema e volte para cá.</p>
        </div>

        <div v-else-if="reason === 'unsupported'">
            <h3>Atualize o iPhone</h3>
            <p>As notificações do app precisam do iOS 16.4 ou mais recente. Atualize em <strong>Ajustes › Geral › Atualização de Software</strong> e abra o Worship Helper pela Tela de Início.</p>
        </div>

        <div v-else>
            <h3>Fique por dentro</h3>
            <p>Receba avisos da igreja, novos eventos e comentários dos eventos em que você participa.</p>
        </div>

        <p v-if="message" class="push-status">{{ message }}</p>
    </div>
</template>

<script>
export default {
    name: "pushNotificationsModalContent",
    props: {
        reason: {
            type: String,
            default: "default"
        },
        platform: {
            type: String,
            default: "other"
        },
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

.push-icon.blocked {
    color: var(--others-yellow);
    background: rgba(255, 200, 44, 0.1);
    border-color: rgba(255, 200, 44, 0.3);
}

.push-icon .material-icons {
    font-size: 32px;
}

.push-notifications-content h3 {
    margin-bottom: 0.5rem;
}

.push-notifications-content p {
    max-width: 440px;
    margin-left: auto;
    margin-right: auto;
    color: var(--neutral-gray-medium);
    line-height: 1.55;
}

.push-steps {
    max-width: 440px;
    margin: 0.75rem auto 0;
    padding-left: 1.25rem;
    text-align: left;
    color: var(--neutral-gray-high);
    line-height: 1.55;
}

.push-steps li + li {
    margin-top: 0.4rem;
}

.push-notifications-content strong {
    color: var(--neutral-white);
}

.push-notifications-content .push-status {
    color: var(--others-yellow);
    font-size: var(--font-size-4);
}
</style>
