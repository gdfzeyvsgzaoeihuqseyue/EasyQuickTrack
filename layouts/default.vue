<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
    <AppHeader />
    <NotificationManager /> 
    <main>
      <slot />
    </main>
    <AppFooter />
    <FeedbackButton />
  </div>
</template>

<script setup>
import { AppHeader, AppFooter } from '@/components/app';
import { NotificationManager, FeedbackButton } from '@/components/utils';
</script>