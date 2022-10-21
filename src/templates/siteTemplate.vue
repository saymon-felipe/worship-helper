<template>
    <div>
        <headerComponent />
        <div class="main-container">
            <div class="inner-container">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
import headerComponent from '../components/header.vue';

export default {
    name: "siteTemplate",
    components: {
        headerComponent
    }
}
</script>
<style scoped>
.main-container {
    flex-grow: 1;
}
.inner-container {
    width: 100%;
    max-width: 900px;
    height: 100%;
    margin: auto;
    padding: 1rem 1rem 5rem 1rem;
}
</style>