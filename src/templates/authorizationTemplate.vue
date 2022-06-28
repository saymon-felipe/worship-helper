<template>
    <div class="authorization">
        <div class="authorization-container">
            <div class="app-logo">
                <img src="../assets/img/worship-helper-icon.png" class="icon">
                <img src="../assets/img/worship-helper-letter.png" class="letter">
            </div>
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: "authorizationTemplate"
}
</script>

<style scoped>
    .authorization {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 2rem;
        color: var(--neutral-white);
    }
    .authorization-container {
        width: 90%;
        max-width: 400px;
    }
</style>