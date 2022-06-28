<template>
    <siteTemplate>
        <h1>Olá, mundo</h1>
    </siteTemplate>
</template>
<script>
import siteTemplate from "../templates/siteTemplate.vue";

export default {
    name: "main",
    components: {
        siteTemplate
    }
}
</script>
<style scoped>
h1 {
    color: white;
}
</style>