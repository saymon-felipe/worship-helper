<template>
    <siteTemplate>
        <router-view v-slot="{ Component }">
            <Transition name="route" mode="out-in">
                <component :is="Component" />
            </Transition>
        </router-view>
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
