<template>
    <siteTemplate>
        <router-view path="$router.key" />
    </siteTemplate>
</template>
<script>
import siteTemplate from "../templates/siteTemplate.vue";
import { globalMethods } from '../js/globalMethods';

/* eslint-disable vue/multi-word-component-names, vue/no-reserved-component-names */
export default {
    name: "main",
    mixins: [globalMethods],
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
