<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-1">
            Statistiques du lien
          </h1>
          <p class="text-gray-600">Analyse détaillée de votre lien raccourci</p>
        </div>

        <!-- Formulaire d'accès -->
        <div v-if="!hasValidParams" class="card p-8 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Accéder à vos statistiques</h2>
          <form @submit.prevent="fetchLinkData" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Code court</label>
              <input v-model="linkIdentifier" type="text" placeholder="abc123"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jeton d'accès</label>
              <input v-model="accessToken" type="text" placeholder="Votre jeton secret"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                required />
            </div>

            <button type="submit" :disabled="linksStore.loading"
              class="w-full btn-primary py-3 rounded-lg text-white font-medium disabled:opacity-50">
              <span v-if="linksStore.loading" class="flex items-center justify-center">
                <IconLoader2 class="animate-spin mr-2 h-5 w-5" />
                Chargement...
              </span>
              <span v-else>Voir les statistiques</span>
            </button>
          </form>

          <div v-if="linksStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {{ linksStore.error }}
          </div>
        </div>

        <!-- Affichage des données -->
        <div v-if="linkData && !linksStore.loading" class="space-y-6">

          <!-- Informations du lien -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconLink class="w-5 h-5 mr-2 text-primary-600" />
              Informations du lien
            </h3>
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-gray-600">Lien court :</span>
                <div class="flex items-center gap-2">
                  <a :href="linkData.shortLink" target="_blank"
                    class="text-primary-600 hover:text-primary-700 font-medium break-all">
                    {{ linkData.shortLink }}
                  </a>

                  <button @click="copyShortLink" class="p-1 hover:bg-gray-100 rounded">
                    <component :is="copied ? IconCheck : IconCopy" class="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-gray-600">URL originale :</span>
                <a :href="linkData.longUrl" target="_blank" :title="linkData.longUrl"
                  class="text-gray-900 hover:text-primary-600 font-medium max-w-md truncate">
                  {{ linkData.longUrl }}
                </a>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Créé le :</span>
                <span class="text-gray-900 font-medium">{{ formatDate(linkData.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconChartBar class="w-5 h-5 mr-2 text-success-600" />
              Statistiques
            </h3>

            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <!-- Clics Totaux -->
              <div
                class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconClick class="w-16 h-16 text-primary-600" />
                </div>
                <div class="relative z-10">
                  <p class="text-sm font-medium text-slate-500">Clics Totaux</p>
                  <p class="mt-2 text-3xl font-bold text-slate-900">{{ linkData.clicks || 0 }}</p>
                </div>
                <div class="mt-4 w-full bg-primary-50 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-primary-500 h-full rounded-full" style="width: 100%"></div>
                </div>
              </div>

              <!-- Visiteurs Uniques -->
              <div
                class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconUsers class="w-16 h-16 text-emerald-600" />
                </div>
                <div class="relative z-10">
                  <p class="text-sm font-medium text-slate-500">Visiteurs Uniques</p>
                  <p class="mt-2 text-3xl font-bold text-slate-900">{{ uniqueVisitors }}</p>
                </div>
                <div class="mt-4 w-full bg-emerald-50 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full rounded-full" :style="`width: ${getUniquePercentage}%`"></div>
                </div>
              </div>

              <!-- Dernière Activité -->
              <div
                class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconActivity class="w-16 h-16 text-orange-600" />
                </div>
                <div class="relative z-10">
                  <p class="text-sm font-medium text-slate-500">Dernière Activité</p>
                  <p class="mt-2 text-lg font-bold text-slate-900 truncate">{{ lastActivityTime }}</p>
                </div>
                <div class="mt-5 flex items-center text-xs text-orange-600 font-medium">
                  <span class="relative flex h-2 w-2 mr-2">
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Monitoring actif
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics -->
          <div v-if="linkData.analytics?.length" class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconDeviceAnalytics class="w-5 h-5 mr-2 text-purple-600" />
              Détails des visites
            </h3>

            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div v-for="(analytic, index) in linkData.analytics" :key="index"
                class="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span class="text-gray-600">Date :</span>
                    <div class="font-medium">{{ formatDate(analytic.timestamp) }}</div>
                  </div>
                  <div>
                    <span class="text-gray-600">Pays :</span>
                    <div class="font-medium">{{ analytic.geolocalisation?.country || 'N/A' }}</div>
                  </div>
                  <div>
                    <span class="text-gray-600">Appareil :</span>
                    <div class="font-medium">{{ analytic.appareil?.type || 'N/A' }}</div>
                  </div>
                  <div>
                    <span class="text-gray-600">Navigateur :</span>
                    <div class="font-medium">{{ analytic.appareil?.browser || 'N/A' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Métadonnées -->
          <div v-if="linkData.metadata" class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconInfoCircle class="w-5 h-5 mr-2 text-blue-600" />
              Métadonnées
            </h3>

            <div class="space-y-3">
              <div v-if="linkData.metadata.title">
                <span class="text-sm text-gray-600">Titre :</span>
                <p class="font-medium">{{ linkData.metadata.title }}</p>
              </div>

              <div v-if="linkData.metadata.description">
                <span class="text-sm text-gray-600">Description :</span>
                <p class="text-sm text-gray-700">{{ linkData.metadata.description }}</p>
              </div>

              <div v-if="linkData.metadata.image" class="mt-3">
                <span class="text-sm text-gray-600 block mb-1">Aperçu :</span>
                <img :src="linkData.metadata.image" class="max-w-sm rounded-lg border" />
              </div>
            </div>
          </div>

          <!-- Message -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <IconInfoCircle class="w-4 h-4 inline mr-1" />
            Conservez précieusement votre jeton d'accès.
          </div>
        </div>

        <!-- Loading -->
        <LogoLoader v-if="linksStore.loading" :show-text="true" size="lg" text="Chargement des statistiques..." />
      </div>
    </div>

    <!-- Notification -->
    <AppNotification :isVisible="notif.visible" :message="notif.message" :type="notif.type"
      @close="notif.visible = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLinksStore } from '~/stores/links'
import { IconLink, IconChartBar, IconDeviceAnalytics, IconInfoCircle, IconLoader2, IconCopy, IconCheck } from '@tabler/icons-vue'
import AppNotification from '~/components/app/AppNotification.vue'
import { LogoLoader } from '@/components/utils';

const route = useRoute()
const router = useRouter()
const linksStore = useLinksStore()

const linkIdentifier = ref('')
const accessToken = ref('')
const linkData = ref(null)
const copied = ref(false)

const notif = ref({
  isVisible: false,
  message: '',
  type: 'success'
})

const showNotif = (msg, type = 'success') => {
  notif.value = { visible: true, message: msg, type }
  setTimeout(() => (notif.value.visible = false), 2500)
}

const hasValidParams = computed(() => route.query.id && route.query.token)

const uniqueVisitors = computed(() => {
  if (!linkData.value?.analytics) return 0
  const uniqueIps = new Set(linkData.value.analytics.map(a => a.geolocalisation?.ip).filter(Boolean))
  return uniqueIps.size
})

const getUniquePercentage = computed(() => {
  if (!linkData.value) return 0
  const totalClicks = linkData.value.clicks || 1
  return Math.min(Math.round((uniqueVisitors.value / totalClicks) * 100), 100)
})

const lastActivityTime = computed(() => {
  if (!linkData.value?.analytics || linkData.value.analytics.length === 0) return 'Aucune'
  const last = linkData.value.analytics[linkData.value.analytics.length - 1].timestamp
  return new Date(last).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric' })
})

const formatDate = ts => new Date(ts).toLocaleString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const fetchLinkData = async () => {
  const id = linkIdentifier.value || route.query.id
  const token = accessToken.value || route.query.token

  const result = await linksStore.fetchGuestLink(id, token)

  if (result) {
    linkData.value = result

    if (!hasValidParams.value) {
      router.push({ query: { id, token } })
    }
  }
}

const copyShortLink = async () => {
  try {
    await navigator.clipboard.writeText(linkData.value.shortLink)
    copied.value = true
    showNotif('Lien copié avec succès')
    setTimeout(() => (copied.value = false), 1200)
  } catch {
    showNotif('Impossible de copier', 'error')
  }
}

onMounted(() => {
  if (hasValidParams.value) {
    linkIdentifier.value = route.query.id
    accessToken.value = route.query.token
    fetchLinkData()
  }
})

// SEO
useSeoMeta({
  title: 'Statistique de liens publics',
  robots: 'index, nofollow',
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200;
}

.stat-box {
  @apply p-4 rounded-lg text-center;
}

.stat-box .value {
  @apply text-2xl font-bold;
}

.stat-box .label {
  @apply text-sm;
}
</style>
