<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <NuxtLink to="/db/links" class="text-primary-600 hover:text-primary-700 flex items-center">
            <IconChevronLeft class="w-5 h-5 mr-2" />
            Retour aux liens
          </NuxtLink>
        </div>

        <div v-if="linksStore.currentLink">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Détails du lien</h1>
          <p class="text-gray-600">Informations et historique pour {{ linksStore.currentLink.shortCode }}</p>
        </div>
      </div>

      <div v-if="linksStore.loading" class="flex justify-center py-12">
        <IconLoader class="animate-spin w-8 h-8 text-primary-600" />
      </div>

      <div v-else-if="linksStore.error" class="card p-8 text-center">
        <IconAlertTriangle class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">{{ linksStore.error }}</p>
        <NuxtLink to="/db/links" class="btn-primary">Retour au dashboard</NuxtLink>
      </div>

      <div v-else-if="linksStore.currentLink" class="space-y-8">
        <LinkInfoCard :link="linksStore.currentLink" :status-loading="statusLoading" :copied="copied"
          :total-logs="logsStore.totalLogs" @toggle-status="toggleLinkStatus"
          @show-analytics="showAnalyticsModal = true" @copy-link="copyToClipboard" @generate-qr-code="generateQRCode"
          @edit-link="editLink" @show-delete-info="showDeleteInfo" />
        <LinkMetadataCard :link-metadata="linksStore.currentLink?.metadata" :loading="linksStore.metadataLoading"
          :error="linksStore.metadataError" @refresh="refreshMetadata" />
        <LinkHistoryCard :logs="logsStore.logs" :loading="logsStore.loading" :error="logsStore.error"
          @refresh-logs="refreshLogs" />

        <!-- Section QR Code associé -->
        <AssociatedQrCode :associated-q-r-code="associatedQRCode" @generate-qr-code="generateQRCode"
          @edit-qr-code="openEditQrCodeModal" />

        <!-- Section Sitemap associé -->
        <AssociatedSitemap :associated-sitemap="associatedSitemap"
          @open-generate-sitemap-modal="openGenerateSitemapModal" />

        <!-- Section Robots.txt associé -->
        <AssociatedRobotsTxt :associated-robots-txt="associatedRobotsTxt"
          @open-generate-robots-txt-modal="openGenerateRobotsTxtModal" />

        <!-- Outils d'analyse de page -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Outils d'analyse de page</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button @click="openSocialsContactsModal"
              class="btn-secondary flex flex-col items-center justify-center text-center p-4">
              <IconMail class="w-8 h-8 text-primary-600 mb-2" />
              <span class="text-sm font-medium">Extraction de contacts</span>
            </button>
            <button @click="openPageSpeedModal"
              class="btn-secondary flex flex-col items-center justify-center text-center p-4">
              <IconGauge class="w-8 h-8 text-success-600 mb-2" />
              <span class="text-sm font-medium">Analyse PageSpeed</span>
            </button>
            <button @click="openPagePreviewModal"
              class="btn-secondary flex flex-col items-center justify-center text-center p-4">
              <IconEye class="w-8 h-8 text-warning-600 mb-2" />
              <span class="text-sm font-medium">Aperçu de page</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAnalyticsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="relative">
        <LinkAnalyticsDetails :analytics="analyticsStore.currentLinkAnalytics" :loading="analyticsStore.loading"
          :error="analyticsStore.error" :link-id="linkId" @close="showAnalyticsModal = false" />
      </div>
    </div>

    <EditLinkModal :visible="showEditModal" :link="linksStore.currentLink" @submit="handleUpdateLink"
      @cancel="cancelEdit" />
    <DeleteLinkModal :visible="showDeleteModal" :link="linkToDelete" @confirm="deleteLink" @cancel="cancelDelete" />

    <GenerateSitemapModal :visible="showGenerateSitemapModal" :loading="sitemapStore.loading"
      :error="sitemapStore.error" :initial-url="linksStore.currentLink?.longUrl" :initial-sitemap="sitemapToEdit"
      @submit="handleGenerateSitemap" @cancel="closeGenerateSitemapModal" />

    <GenerateRobotsTxtModal :visible="showGenerateRobotsTxtModal" :loading="robotsTxtStore.loading"
      :error="robotsTxtStore.error" :initial-config="robotsTxtToEdit" @submit="handleGenerateRobotsTxt"
      @cancel="closeGenerateRobotsTxtModal" />

    <EditQRCodeModal :visible="showEditQrCodeModal" :qrCode="qrCodeToEdit" :loading="qrStore.loading"
      :error="qrStore.error" @submit="handleUpdateQRCode" @cancel="cancelEditQrCode" />

    <SocialsContactsExtractor :visible="showSocialsContactsModal" :is-modal="true"
      :initial-url="linksStore.currentLink?.longUrl || ''" @close="closeSocialsContactsModal" />

    <PageSpeedChecker :visible="showPageSpeedModal" :is-modal="true"
      :initial-url="linksStore.currentLink?.longUrl || ''" @close="closePageSpeedModal" />

    <PagePreview :visible="showPagePreviewModal" :is-modal="true" :initial-url="linksStore.currentLink?.longUrl || ''"
      @close="closePagePreviewModal" />

    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLinksStore } from '~/stores/links';
import { useLogsStore } from '~/stores/logs';
import { useAnalyticsStore } from '~/stores/analytics';
import { useSitemapStore } from '~/stores/sitemap';
import { useRobotsTxtStore } from '~/stores/robotstxt';
import { useQRCodeStore } from '~/stores/qrcode';
import { DeleteLinkModal, EditLinkModal, LinkAnalyticsDetails, LinkMetadataCard, LinkInfoCard, LinkHistoryCard, AssociatedQrCode, AssociatedSitemap, AssociatedRobotsTxt } from '@/components/link';
import { GenerateSitemapModal } from '@/components/sitemap';
import { GenerateRobotsTxtModal } from '@/components/robotstxt';
import { SocialsContactsExtractor, PageSpeedChecker, PagePreview } from '@/components/more';
import { EditQRCodeModal } from '@/components/qrcode'; 
import { IconAlertTriangle, IconChevronLeft, IconLoader, IconMail, IconGauge, IconEye } from '@tabler/icons-vue';
import type { GenerateSitemapResponse, SitemapGenerationOptions, GenerateRobotsTxtPayload, GenerateRobotsTxtResponse, RobotsTxtConfig, ShortLinkSitemap } from '@/types';
import type { ShortLink } from '~/types';
import type { QRCodeRecord } from '~/stores/qrcode';

definePageMeta({
  layout: 'dashboard'
});

const route = useRoute();
const router = useRouter();
const linksStore = useLinksStore();
const logsStore = useLogsStore();
const analyticsStore = useAnalyticsStore();
const sitemapStore = useSitemapStore();
const robotsTxtStore = useRobotsTxtStore();
const qrStore = useQRCodeStore();

const linkId = route.params.id as string;
const copied = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showAnalyticsModal = ref(false);
const statusLoading = ref(false);
const showGenerateSitemapModal = ref(false);
const showGenerateRobotsTxtModal = ref(false);
const linkToDelete = ref<ShortLink | null>(null);
const associatedQRCode = ref<QRCodeRecord | null>(null);
const sitemapToEdit = ref<ShortLinkSitemap | null>(null);
const robotsTxtToEdit = ref<RobotsTxtConfig | null>(null);
const showEditQrCodeModal = ref(false);
const qrCodeToEdit = ref<QRCodeRecord | null>(null);

// States for new modals
const showSocialsContactsModal = ref(false);
const showPageSpeedModal = ref(false);
const showPagePreviewModal = ref(false);

const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
const showNotification = ref(false);
let notificationTimeout: NodeJS.Timeout | null = null;

const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;

  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000);
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

watch(() => linksStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

watch(() => sitemapStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

watch(() => robotsTxtStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

watch(() => qrStore.error, (newError) => {
  if (newError) {
    showFloatingNotification(newError, 'error');
  }
});

onMounted(async () => {
  if (linkId) {
    await Promise.all([
      linksStore.fetchLinkById(linkId),
      logsStore.fetchLinkLogs(linkId),
      qrStore.fetchQRCodes(),
      sitemapStore.fetchSitemaps(),
      robotsTxtStore.fetchRobotsTxtConfigs(),
    ]);

    if (linksStore.currentLink) {
      associatedQRCode.value = qrStore.qrCodes.find(
        (qr) => qr.qrCodeType === 'shortlink' && qr.shortLink?.id === linksStore.currentLink?.id
      ) || null;
    }
  }
});

// Sitemap
const associatedSitemap = computed(() => {
  if (!linksStore.currentLink || !sitemapStore.sitemaps) return null;
  return sitemapStore.sitemaps.find(sitemap =>
    sitemap.url === linksStore.currentLink?.longUrl ||
    sitemap.url === linksStore.currentLink?.shortLink
  ) as any;
});

// Robots.txt
const associatedRobotsTxt = computed(() => {
  if (!linksStore.currentLink || !robotsTxtStore.robotsTxtConfigs) return null;
  return robotsTxtStore.robotsTxtConfigs.find(config =>
    config.sitemapUrl === linksStore.currentLink?.shortLink ||
    config.sitemapUrl === linksStore.currentLink?.longUrl
  ) as any;
});

watch(showAnalyticsModal, (newValue) => {
  if (newValue && linkId) {
    analyticsStore.fetchAnalyticsForLink(linkId);
  } else if (!newValue) {
    analyticsStore.clearError();
  }
});

onUnmounted(() => {
  linksStore.clearCurrentLink();
  logsStore.clearLogs();
  analyticsStore.clearError();
  linksStore.clearMetadataError();
  sitemapStore.clearError();
  robotsTxtStore.clearError();
  qrStore.clearError();
});

const refreshLogs = async () => {
  if (linkId) {
    await logsStore.fetchLinkLogs(linkId);
  }
};

const refreshMetadata = async () => {
  if (linksStore.currentLink) {
    await linksStore.extractMetadata(linksStore.currentLink.longUrl);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
    showFloatingNotification('Lien copié dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier le lien.', 'error');
  }
};

const generateQRCode = () => {
  navigateTo(`/db/qrcode/create?linkId=${linkId}`);
};

//QR Code Modal
const openEditQrCodeModal = (qrCode: QRCodeRecord) => {
  qrCodeToEdit.value = qrCode;
  showEditQrCodeModal.value = true;
};

const handleUpdateQRCode = async (options: any) => {
  if (!qrCodeToEdit.value) return;

  const success = await qrStore.updateQRCode(qrCodeToEdit.value.id, options);

  if (success) {
    showEditQrCodeModal.value = false;
    showFloatingNotification('QR Code mis à jour avec succès !', 'success');
    if (linksStore.currentLink) {
      await qrStore.fetchQRCodes();
      associatedQRCode.value = qrStore.qrCodes.find(
        (qr) => qr.qrCodeType === 'shortlink' && qr.shortLink?.id === linksStore.currentLink?.id
      ) || null;
    }
  } else {
    showFloatingNotification(qrStore.error || 'Erreur lors de la mise à jour du QR Code.', 'error');
  }
};

const cancelEditQrCode = () => {
  showEditQrCodeModal.value = false;
  qrStore.clearError();
};

const editLink = () => {
  showEditModal.value = true;
};

const handleUpdateLink = async (newLongUrl: string) => {
  if (!linksStore.currentLink) {
    showFloatingNotification('Aucun lien à mettre à jour.', 'error');
    return;
  }
  const success = await linksStore.updateLink(linksStore.currentLink.id, newLongUrl);
  if (success) {
    showEditModal.value = false;
    await logsStore.fetchLinkLogs(linkId);
    showFloatingNotification('Lien mis à jour avec succès !', 'success');
  } else {
    showFloatingNotification(linksStore.error || 'Erreur lors de la mise à jour.', 'error');
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  linksStore.clearError();
};

const showDeleteInfo = () => {
  navigateTo('/db/deleteInfo');
};

const deleteLink = async () => {
  if (!linkToDelete.value) return;

  linksStore.clearError();

  const deletedSuccessfully = await linksStore.deleteLink(linkToDelete.value.id);

  if (deletedSuccessfully) {
    showDeleteModal.value = false;
    showFloatingNotification('Lien supprimé avec succès !', 'success');
    await router.push('/db/links');
  } else {
    showFloatingNotification(linksStore.error || 'Erreur lors de la suppression.', 'error');
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  linksStore.clearError();
  linksStore.clearMetadataError();
};

const toggleLinkStatus = async (event: Event) => {
  if (!linksStore.currentLink) return;
  const target = event.target as HTMLInputElement;
  const shouldDisable = !target.checked;
  statusLoading.value = true;
  try {
    const success = await linksStore.toggleLinkStatus(linksStore.currentLink.id, shouldDisable);
    if (success) {
      const action = shouldDisable ? 'désactivé' : 'activé';
      showFloatingNotification(`Lien ${action} avec succès !`, 'success');
      await logsStore.fetchLinkLogs(linkId);
    } else {
      target.checked = !shouldDisable;
      showFloatingNotification(linksStore.error || 'Erreur lors du changement de statut.', 'error');
    }
  } catch (error) {
    target.checked = !shouldDisable;
    showFloatingNotification('Une erreur inattendue est survenue.', 'error');
  } finally {
    statusLoading.value = false;
  }
};

// Sitemap generation functions
const openGenerateSitemapModal = (sitemap: ShortLinkSitemap | null) => {
  sitemapToEdit.value = sitemap;
  showGenerateSitemapModal.value = true;
  sitemapStore.clearError();
};

const closeGenerateSitemapModal = () => {
  showGenerateSitemapModal.value = false;
  sitemapToEdit.value = null;
  sitemapStore.clearError();
};

const handleGenerateSitemap = async (options: SitemapGenerationOptions, sitemapId: string | null) => {
  let result: GenerateSitemapResponse | ShortLinkSitemap | null = null;
  if (sitemapId) {
    result = await sitemapStore.updateSitemap(sitemapId, options.title || '');
    if (result) {
      showFloatingNotification(`Sitemap "${options.title}" mis à jour avec succès !`, 'success');
      await sitemapStore.fetchSitemaps(); 
    }
  } else {
    // Generate new sitemap
    result = await sitemapStore.generateSitemap(options);
    if (result) {
      showFloatingNotification(`Sitemap généré avec succès pour ${result.urlsCount} URLs !`, 'success');
      await sitemapStore.fetchSitemaps(); 
    }
  }

  if (result) {
    closeGenerateSitemapModal();
  }
};

// Robots.txt
const openGenerateRobotsTxtModal = (config: RobotsTxtConfig | null) => {
  robotsTxtToEdit.value = config; 
  showGenerateRobotsTxtModal.value = true;
  robotsTxtStore.clearError();
};

const closeGenerateRobotsTxtModal = () => {
  showGenerateRobotsTxtModal.value = false;
  robotsTxtToEdit.value = null;
  robotsTxtStore.clearError();
};

const handleGenerateRobotsTxt: any = async (payload: GenerateRobotsTxtPayload, configId: string | null) => {
  let result: GenerateRobotsTxtResponse | RobotsTxtConfig | null = null;
  if (configId) {
    result = await robotsTxtStore.updateRobotsTxt(configId, payload);
    if (result) {
      showFloatingNotification(`Configuration robots.txt "${payload.title}" mise à jour avec succès !`, 'success');
      await robotsTxtStore.fetchRobotsTxtConfigs();
    }
  } else {
    // Generate new robots.txt config
    result = await robotsTxtStore.generateRobotsTxt(payload);
    if (result) {
      showFloatingNotification(`Configuration robots.txt "${result.data.title}" générée avec succès !`, 'success');
      await robotsTxtStore.fetchRobotsTxtConfigs(); 
    }
  }

  if (result) {
    closeGenerateRobotsTxtModal();
  }
};

// Functions for new modals
const openSocialsContactsModal = () => {
  showSocialsContactsModal.value = true;
};
const closeSocialsContactsModal = () => {
  showSocialsContactsModal.value = false;
};

const openPageSpeedModal = () => {
  showPageSpeedModal.value = true;
};
const closePageSpeedModal = () => {
  showPageSpeedModal.value = false;
};

const openPagePreviewModal = () => {
  showPagePreviewModal.value = true;
};
const closePagePreviewModal = () => {
  showPagePreviewModal.value = false;
};

const linkDetailsTitle = ref('Détails du lien');
watch(() => linksStore.currentLink, (newLink) => {
  if (newLink) {
    linkDetailsTitle.value = `Détails de ${newLink.shortCode}`;
  }
}, { immediate: true });

useSeoMeta({
  title: linkDetailsTitle,
  description: 'Détails et historique d\'un lien raccourci.',
  robots: 'noindex, nofollow',
});
</script>
