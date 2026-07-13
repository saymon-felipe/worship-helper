<template>
  <RouterView v-slot="{ Component }">
    <Transition name="route" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
@import '@/assets/base.css';
</style>
<script>
import '@lottiefiles/lottie-player';
</script>

