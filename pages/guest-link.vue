<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Statistiques de votre lien court
          </h1>
          <p class="text-gray-600">
            Consultez les performances de votre lien raccourci
          </p>
        </div>

        <!-- Formulaire de recherche si pas de params -->
        <div v-if="!hasValidParams" class="card p-8 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Accédez à vos statistiques
          </h2>
          <form @submit.prevent="fetchLinkData" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Code court du lien ou ID
              </label>
              <input v-model="linkIdentifier" type="text" placeholder="abc123"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Jeton d'accès
              </label>
              <input v-model="accessToken" type="text" placeholder="Votre jeton d'accès secret"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                required />
            </div>
            <button type="submit" :disabled="linksStore.loading" class="w-full btn-primary disabled:opacity-50">
              <span v-if="linksStore.loading" class="flex items-center justify-center">
                <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5" />
                Chargement...
              </span>
              <span v-else>Voir les statistiques</span>
            </button>
          </form>

          <div v-if="linksStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">{{ linksStore.error }}</p>
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
              <div class="flex items-start justify-between">
                <span class="text-sm text-gray-600">Lien court :</span>
                <div class="flex items-center gap-2">
                  <a :href="linkData.shortLink" target="_blank"
                    class="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    {{ linkData.shortLink }}
                  </a>
                  <button @click="copyToClipboard(linkData.shortLink)" class="p-1 hover:bg-gray-100 rounded">
                    <IconCopy class="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div class="flex items-start justify-between">
                <span class="text-sm text-gray-600">URL originale :</span>
                <a :href="linkData.longUrl" target="_blank"
                  class="text-gray-900 hover:text-primary-600 font-medium text-sm max-w-md truncate">
                  {{ linkData.longUrl }}
                </a>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Créé le :</span>
                <span class="text-gray-900 font-medium text-sm">
                  {{ formatDate(linkData.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconChartBar class="w-5 h-5 mr-2 text-success-600" />
              Statistiques
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-primary-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">
                  {{ linkData.clicks || 0 }}
                </div>
                <div class="text-sm text-primary-700">Clics totaux</div>
              </div>
              <div class="bg-success-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-success-600">
                  {{ uniqueVisitors }}
                </div>
                <div class="text-sm text-success-700">Visiteurs uniques</div>
              </div>
              <div class="bg-warning-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-warning-600">
                  {{ linkData.analytics?.length || 0 }}
                </div>
                <div class="text-sm text-warning-700">Visites enregistrées</div>
              </div>
            </div>
          </div>

          <!-- Analytics détaillées -->
          <div v-if="linkData.analytics && linkData.analytics.length > 0" class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconDeviceAnalytics class="w-5 h-5 mr-2 text-purple-600" />
              Détails des visites
            </h3>
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div v-for="(analytic, index) in linkData.analytics" :key="index"
                class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
              Métadonnées du lien
            </h3>
            <div class="space-y-2">
              <div v-if="linkData.metadata.title">
                <span class="text-sm text-gray-600">Titre :</span>
                <p class="font-medium">{{ linkData.metadata.title }}</p>
              </div>
              <div v-if="linkData.metadata.description">
                <span class="text-sm text-gray-600">Description :</span>
                <p class="text-sm text-gray-700">{{ linkData.metadata.description }}</p>
              </div>
              <div v-if="linkData.metadata.image" class="mt-4">
                <span class="text-sm text-gray-600 block mb-2">Image de prévisualisation :</span>
                <img :src="linkData.metadata.image" alt="Preview" class="max-w-sm rounded-lg border border-gray-200" />
              </div>
            </div>
          </div>

          <!-- Note importante -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-800">
              <IconInfoCircle class="w-4 h-4 inline mr-1" />
              Conservez votre jeton d'accès pour consulter ces statistiques à tout moment.
              <NuxtLink to="/auth/login" class="font-semibold underline hover:text-blue-900">
                Créez un compte
              </NuxtLink>
              pour bénéficier de fonctionnalités avancées.
            </p>
          </div>
        </div>

        <!-- État de chargement -->
        <div v-if="linksStore.loading" class="card p-12 text-center">
          <IconLoader2 class="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p class="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLinksStore } from '~/stores/links'
import {
  IconLink, IconChartBar, IconDeviceAnalytics, IconInfoCircle,
  IconLoader2, IconCopy
} from '@tabler/icons-vue'

const route = useRoute()
const router = useRouter()
const linksStore = useLinksStore()

const linkIdentifier = ref('')
const accessToken = ref('')
const linkData = ref(null)

const hasValidParams = computed(() => {
  return route.query.id && route.query.token
})

const uniqueVisitors = computed(() => {
  if (!linkData.value?.analytics) return 0
  const uniqueIps = new Set(linkData.value.analytics.map(a => a.geolocalisation?.ip).filter(Boolean))
  return uniqueIps.size
})

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchLinkData = async () => {
  const id = linkIdentifier.value || route.query.id
  const token = accessToken.value || route.query.token

  if (!id || !token) return

  const result = await linksStore.fetchGuestLink(id, token)

  if (result) {
    linkData.value = result

    // Mettre à jour l'URL sans recharger
    if (!hasValidParams.value) {
      router.push({
        query: { id, token }
      })
    }
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Vous pouvez ajouter une notification ici
  } catch (err) {
    console.error('Erreur de copie:', err)
  }
}

onMounted(() => {
  if (hasValidParams.value) {
    linkIdentifier.value = route.query.id
    accessToken.value = route.query.token
    fetchLinkData()
  }
})

usePageSeo('guestLink')
</script>
