<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
    <AppHeader />
    <SiteNotificationManager /> 
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '~/components/app/AppHeader.vue' 
import AppFooter from '~/components/app/AppFooter.vue'
</script>