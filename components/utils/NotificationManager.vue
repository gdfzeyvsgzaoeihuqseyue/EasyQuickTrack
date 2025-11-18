<template>
  <div>
    <NotificationItem
      v-for="notification in filteredNotifications"
      :key="notification.id"
      :notification="notification"
      @dismiss="handleDismiss"
      @track-event="handleNotificationTrack"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useSiteInfoStore } from '@/stores/siteInfo';
import { NotificationItem } from '@/components/utils';
import type { SiteInfo } from '@/types';

const siteInfoStore = useSiteInfoStore();

// Stocke les IDs des notifications que l'utilisateur a choisi de ne plus afficher
const dismissedNotificationIds = ref<string[]>([]);

// Fonction pour charger les IDs masqués depuis localStorage
const loadDismissedNotifications = () => {
  const dismissed = localStorage.getItem('dismissedNotifications');
  if (dismissed) {
    dismissedNotificationIds.value = JSON.parse(dismissed);
  }
};

// Fonction pour sauvegarder les IDs masqués dans localStorage
const saveDismissedNotifications = () => {
  localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotificationIds.value));
};

// Filtre les notifications pour ne pas afficher celles qui ont été masquées
const filteredNotifications = computed(() => {
  return siteInfoStore.activeNotifications.filter(
    (notification) => !dismissedNotificationIds.value.includes(notification.id)
  );
});

// Gère l'événement 'dismiss' émis par NotificationItem
const handleDismiss = (notificationId: string) => {
  if (!dismissedNotificationIds.value.includes(notificationId)) {
    dismissedNotificationIds.value.push(notificationId);
    saveDismissedNotifications();
    siteInfoStore.trackEvent(notificationId, 'dismissals');
  }
};

// Gère les événements de suivi émis par NotificationItem
const handleNotificationTrack = (payload: { id: string; eventType: 'clicks' | 'closes' }) => {
  siteInfoStore.trackEvent(payload.id, payload.eventType);
};

onMounted(async () => {
  loadDismissedNotifications();
  await siteInfoStore.fetchActiveSiteInfos();

  filteredNotifications.value.forEach((notification) => {
    siteInfoStore.trackEvent(notification.id, 'views');
  });
});

watch(filteredNotifications, (newNotifications, oldNotifications) => {
  const oldIds = new Set(oldNotifications.map(n => n.id));
  newNotifications.forEach(notification => {
    if (!oldIds.has(notification.id)) {
      siteInfoStore.trackEvent(notification.id, 'views');
    }
  });
}, { deep: true }); 

</script>
