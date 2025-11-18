<template>
  <Transition :name="animationName">
    <div v-if="isVisible"
      :class="['p-4 shadow-lg rounded-lg', positionClasses, displayTypeClasses, { 'fixed': notification.displayType !== 'banner', 'z-50': notification.displayType !== 'banner' }]"
      :style="notificationStyles"
      @click="handleNotificationClick"
    >
      <h3 class="font-bold" :style="{ color: notification.stylesSettings.textColor }">{{ notification.title }}</h3>
      <p class="mt-1" :style="{ color: notification.stylesSettings.textColor }" v-html="processedMessageHtml"></p>

      <div v-if="notification.links && notification.links.length" class="mt-2">
        <a v-for="(link, index) in notification.links" :key="index" :href="link.url"
           :target="notification.linkSettings.openInNewTab ? '_blank' : '_self'"
           :style="{ color: notification.stylesSettings.linkColor, textDecoration: notification.linkSettings.underline ? 'underline' : 'none' }"
           class="mr-3"
           data-notification-link="true"
        >
          {{ link.label }}
        </a>
      </div>

      <button v-if="notification.showCloseButton" @click="closeNotification"
        class="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none"
        :style="{ color: notification.stylesSettings.textColor }"
      >
        <IconX class="w-5 h-5" />
      </button>

      <button v-if="notification.showDismissButton" @click="dismissNotification"
        class="mt-3 px-3 py-1 text-sm rounded-md border border-white text-white hover:bg-white hover:text-primary transition-colors"
        :style="{ borderColor: notification.stylesSettings.textColor, color: notification.stylesSettings.textColor }"
      >
        Ne plus afficher
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { SiteInfo } from '@/types';
import { IconX } from '@tabler/icons-vue';

interface Props {
  notification: SiteInfo;
}

const props = defineProps<Props>();
const emit = defineEmits(['dismiss', 'track-event']);

const isVisible = ref(true);
let autoHideTimeout: NodeJS.Timeout | null = null;

// Styles dynamiques
const notificationStyles = computed(() => ({
  backgroundColor: props.notification.stylesSettings.backgroundColor,
  borderColor: props.notification.stylesSettings.borderColor,
  fontSize: props.notification.stylesSettings.fontSize,
  fontWeight: props.notification.stylesSettings.fontWeight,
  borderWidth: '1px', 
  borderStyle: 'solid',
}));

// Classes de positionnement
const positionClasses = computed(() => {
  if (props.notification.displayType === 'banner') {
    return 'relative';
  }

  switch (props.notification.position) {
    case 'top': return 'top-0 left-0 right-0 w-full';
    case 'bottom': return 'bottom-0 left-0 right-0 w-full';
    case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'top-left': return 'top-4 left-4';
    case 'top-right': return 'top-4 right-4';
    case 'bottom-left': return 'bottom-4 left-4';
    case 'bottom-right': return 'bottom-4 right-4';
    default: return 'top-0 left-0 right-0 w-full';
  }
});

// Classes pour le type d'affichage
const displayTypeClasses = computed(() => {
  switch (props.notification.displayType) {
    case 'banner': return 'py-3 px-6'; // Bannières pleine largeur
    case 'modal': return 'w-11/12 md:max-w-md mx-auto'; // Modales centrées
    case 'popup': return 'w-80'; // Popups plus petites
    case 'toast': return 'w-72'; // Toasts compacts
    default: return 'py-3 px-6';
  }
});

// Nom de l'animation pour 
const animationName = computed(() => {
  switch (props.notification.animationSettings.type) {
    case 'slideDown': return 'slide-down';
    case 'fadeIn': return 'fade-in';
    case 'slideUp': return 'slide-up';
    case 'none': return ''; 
    default: return 'fade-in'; 
  }
});

// Formatage du lien
const processedMessageHtml = computed(() => {
  const message = props.notification.message;
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;

  return message.replace(linkRegex, (match, linkText, url) => {
    const target = props.notification.linkSettings.openInNewTab ? '_blank' : '_self';
    const underline = props.notification.linkSettings.underline ? 'underline' : 'none';
    const color = props.notification.stylesSettings.linkColor;
    return `<a href="${url}" target="${target}" rel="noopener noreferrer" style="color: ${color}; text-decoration: ${underline};" data-notification-link="true">${linkText}</a>`;
  });
});

// Fonctions de gestion des boutons
const closeNotification = () => {
  isVisible.value = false;
  if (autoHideTimeout) clearTimeout(autoHideTimeout);
  emit('track-event', { id: props.notification.id, eventType: 'closes' }); 
};

const dismissNotification = () => {
  isVisible.value = false;
  if (autoHideTimeout) clearTimeout(autoHideTimeout);
  emit('dismiss', props.notification.id); 
};

// Handle clicks on the notification, specifically for links
const handleNotificationClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === 'A' && target.hasAttribute('data-notification-link')) {
    emit('track-event', { id: props.notification.id, eventType: 'clicks' }); 
  }
};

onMounted(() => {
  if (props.notification.animationSettings.autoHide) {
    autoHideTimeout = setTimeout(() => {
      closeNotification();
    }, props.notification.animationSettings.autoHideDelay);
  }
});

onUnmounted(() => {
  if (autoHideTimeout) clearTimeout(autoHideTimeout);
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all v-bind('notification.animationSettings.duration + "ms"') ease-in-out;
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.fade-in-enter-active, .fade-in-leave-active {
  transition: opacity v-bind('notification.animationSettings.duration + "ms"') ease-in-out;
}
.fade-in-enter-from, .fade-in-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all v-bind('notification.animationSettings.duration + "ms"') ease-in-out;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

