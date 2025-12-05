<template>
  <div class="card p-8 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
      Raccourcissez votre lien gratuitement
    </h2>

    <div v-if="!showResult" class="space-y-4">
      <form @submit.prevent="shortenUrl">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            URL à raccourcir
          </label>
          <div class="relative">
            <input v-model="longUrl" type="url" placeholder="https://exemple.com/votre-lien-tres-long"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              :disabled="linksStore.loading" required />
          </div>
        </div>

        <div class="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div class="flex items-start space-x-3">
            <IconInfoCircle class="w-6 h-6 flex-shrink-0 text-primary-600 mt-0.5" />

            <div class="text-sm text-gray-700">
              <p class="font-bold text-primary-800 mb-2">
                Débloquez plus de puissance
              </p>

              <p class="mb-3 leading-relaxed">
                <span class="font-medium">Connectez-vous</span> pour accéder à des fonctionnalités complètes et
                avancées.
              </p>

              <div class="mt-4 pt-3 border-t border-gray-100 flex space-x-4 justify-center">
                <a :href="loginUrl"
                  class="font-semibold text-primary-600 hover:text-primary-800 transition-colors flex items-center">
                  <span class="underline">Connectez-vous</span>
                </a>

                <span class="text-gray-300">|</span>

                <NuxtLink to="/guest/link"
                  class="font-semibold text-gray-500 hover:text-gray-700 transition-colors underline flex items-center">
                  Statistiques publiques
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" :disabled="linksStore.loading || !longUrl"
          class="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="linksStore.loading" class="flex items-center justify-center">
            <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Création en cours...
          </span>
          <span v-else>Raccourcir le lien</span>
        </button>
      </form>
    </div>

    <!-- Résultat avec token -->
    <div v-else class="space-y-6">
      <div class="p-6 bg-success-50 rounded-xl border border-success-200">
        <h3 class="text-lg font-semibold text-success-800 mb-4 text-center lg:text-left">
          Lien raccourci avec succès !
        </h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-success-700 mb-1">Lien raccourci :</label>
            <div class="flex items-center space-x-2">
              <input ref="shortUrlInput" :value="shortLink?.shortLink" readonly
                class="flex-1 px-3 py-2 bg-white border border-success-300 rounded-lg text-sm" />
              <button @click="copyToClipboard(shortLink?.shortLink)"
                class="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors text-sm font-medium">
                {{ copiedShort ? 'Copié!' : 'Copier' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Date d'expiration -->
      <div v-if="expiresAt" class="p-6 bg-orange-50 rounded-xl border border-orange-200">
        <h4 class="text-md font-semibold text-orange-800 mb-2 flex items-center">
          <IconClock class="w-5 h-5 mr-2" />
          Expiration automatique
        </h4>
        <p class="text-sm text-orange-700 mb-2">
          Ce lien expirera automatiquement le <strong>{{ formatExpirationDate(expiresAt) }}</strong> (dans 15 jours).
        </p>
        <p class="text-xs text-orange-600">
          Connectez-vous pour créer des liens permanents avec des options avancées.
        </p>
      </div>

      <!-- Token d'accès -->
      <div class="p-6 bg-warning-50 rounded-xl border border-warning-200">
        <h4 class="text-md font-semibold text-warning-800 mb-2 flex items-center">
          <IconKey class="w-5 h-5 mr-2" />
          Jeton d'accès aux statistiques
        </h4>
        <p class="text-sm text-warning-700 mb-3">
          Conservez précieusement ce jeton pour consulter les statistiques de votre lien. Sans ce jeton, vous ne pourrez
          pas y accéder.
        </p>
        <div class="flex items-center space-x-2">
          <input :value="guestToken" readonly
            class="flex-1 px-3 py-2 bg-white border border-warning-300 rounded-lg text-sm font-mono" />
          <button @click="copyToClipboard(guestToken)"
            class="px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors text-sm font-medium">
            {{ copiedToken ? 'Copié!' : 'Copier' }}
          </button>
        </div>
      </div>

      <!-- Lien vers la page de consultation -->
      <div class="text-center">
        <NuxtLink :to="`/guest/link?id=${shortLink?.shortCode}&token=${guestToken}`"
          class="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          <IconChartBar class="w-5 h-5 mr-2" />
          Voir les statistiques maintenant
        </NuxtLink>
      </div>

      <div class="text-center">
        <button @click="resetForm" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
          Créer un autre lien
        </button>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="linksStore.error && !showResult" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800">{{ linksStore.error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLinksStore } from '~/stores/links'
import { IconLoader2, IconInfoCircle, IconKey, IconChartBar, IconClock } from '@tabler/icons-vue'

const { getSSOUrl } = useSSO()
const loginUrl = computed(() => getSSOUrl('login'))

const linksStore = useLinksStore()

const longUrl = ref('')
const shortLink = ref(null)
const guestToken = ref(null)
const expiresAt = ref(null)
const showResult = ref(false)
const copiedShort = ref(false)
const copiedToken = ref(false)
const shortUrlInput = ref(null)

onMounted(() => {
  linksStore.clearError()
})

const formatExpirationDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const shortenUrl = async () => {
  linksStore.clearError()
  showResult.value = false

  const result = await linksStore.createPublicLink(longUrl.value)

  if (result) {
    shortLink.value = result.link
    guestToken.value = result.token
    expiresAt.value = result.expiresAt
    showResult.value = true
  }
}

const copyToClipboard = async (text) => {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)

    if (text === shortLink.value?.shortLink) {
      copiedShort.value = true
      setTimeout(() => { copiedShort.value = false }, 2000)
    } else if (text === guestToken.value) {
      copiedToken.value = true
      setTimeout(() => { copiedToken.value = false }, 2000)
    }
  } catch (err) {
    console.error('Échec de la copie:', err)
  }
}

const resetForm = () => {
  longUrl.value = ''
  shortLink.value = null
  guestToken.value = null
  showResult.value = false
  linksStore.clearGuestLink()
}
</script>
