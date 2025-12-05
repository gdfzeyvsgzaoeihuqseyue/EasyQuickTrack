<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-1">
            Statistiques du lien
          </h1>
          <p class="text-gray-600">Informations sur votre lien raccourci</p>
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

              <!-- Statut et expiration -->
              <div v-if="linkData.expiresAt" class="pt-3 mt-3 border-t border-gray-100">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">Statut :</span>
                  <span :class="getStatusClass(linkData.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusLabel(linkData.status) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Expire le :</span>
                  <span class="text-gray-900 font-medium">{{ formatDate(linkData.expiresAt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Compte à rebours -->
          <div v-if="linkData.expiresAt && !linkData.isExpired" class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconClock class="w-5 h-5 mr-2 text-orange-600" />
              Temps restant avant expiration
            </h3>

            <div class="grid grid-cols-4 gap-3 text-center">
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
                <div class="text-3xl md:text-4xl font-bold text-white font-mono">
                  {{ countdown.days }}
                </div>
                <div class="text-xs text-slate-400 mt-1 uppercase tracking-wide">Jours</div>
              </div>
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
                <div class="text-3xl md:text-4xl font-bold text-white font-mono">
                  {{ countdown.hours }}
                </div>
                <div class="text-xs text-slate-400 mt-1 uppercase tracking-wide">Heures</div>
              </div>
              <div class="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
                <div class="text-3xl md:text-4xl font-bold text-white font-mono">
                  {{ countdown.minutes }}
                </div>
                <div class="text-xs text-slate-400 mt-1 uppercase tracking-wide">Minutes</div>
              </div>
              <div
                class="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg relative overflow-hidden">
                <div class="text-3xl md:text-4xl font-bold text-orange-400 font-mono animate-pulse">
                  {{ countdown.seconds }}
                </div>
                <div class="text-xs text-slate-400 mt-1 uppercase tracking-wide">Secondes</div>
              </div>
            </div>

            <div v-if="linkData.remainingDays <= 3" class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p class="text-sm text-orange-700 flex items-center">
                <IconAlertTriangle class="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Attention : votre lien expire bientôt ! Connectez-vous pour créer des liens permanents.</span>
              </p>
            </div>
          </div>

          <!-- Lien expiré -->
          <div v-if="linkData.isExpired" class="card p-6 bg-red-50 border-red-200">
            <div class="flex items-center text-red-700">
              <IconAlertTriangle class="w-6 h-6 mr-3" />
              <div>
                <h3 class="font-semibold">Ce lien a expiré</h3>
                <p class="text-sm mt-1">Les liens publics expirent automatiquement après 15 jours. Connectez-vous pour
                  créer des liens permanents.</p>
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconChartBar class="w-5 h-5 mr-2 text-success-600" />
              Statistiques
            </h3>

            <div
              class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow max-w-xs">
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
          </div>

          <!-- Message -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <IconInfoCircle class="w-4 h-4 inline mr-1" />
            Conservez précieusement votre jeton d'accès pour consulter les statistiques de ce lien.
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLinksStore } from '~/stores/links'
import { IconLink, IconChartBar, IconClick, IconClock, IconAlertTriangle, IconInfoCircle, IconLoader2, IconCopy, IconCheck } from '@tabler/icons-vue'
import AppNotification from '~/components/app/AppNotification.vue'
import { LogoLoader } from '@/components/utils';

const route = useRoute()
const router = useRouter()
const linksStore = useLinksStore()

const linkIdentifier = ref('')
const accessToken = ref('')
const linkData = ref(null)
const copied = ref(false)
let countdownInterval = null

const countdown = reactive({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00'
})

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

const formatDate = ts => new Date(ts).toLocaleString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const padZero = (num) => String(num).padStart(2, '0')

const updateCountdown = () => {
  if (!linkData.value?.expiresAt) return

  const now = new Date().getTime()
  const expiresAt = new Date(linkData.value.expiresAt).getTime()
  const diff = expiresAt - now

  if (diff <= 0) {
    countdown.days = '00'
    countdown.hours = '00'
    countdown.minutes = '00'
    countdown.seconds = '00'
    linkData.value.isExpired = true
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  countdown.days = padZero(days)
  countdown.hours = padZero(hours)
  countdown.minutes = padZero(minutes)
  countdown.seconds = padZero(seconds)
}

const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'disabled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'expired':
      return 'Expiré'
    case 'disabled':
      return 'Désactivé'
    default:
      return 'Inconnu'
  }
}

const fetchLinkData = async () => {
  const id = linkIdentifier.value || route.query.id
  const token = accessToken.value || route.query.token

  const result = await linksStore.fetchGuestLink(id, token)

  if (result) {
    linkData.value = result

    if (!hasValidParams.value) {
      router.push({ query: { id, token } })
    }

    // Démarrer le compte à rebours si le lien n'est pas expiré
    if (result.expiresAt && !result.isExpired) {
      startCountdown()
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

// Watcher pour démarrer le compte à rebours quand les données sont chargées
watch(linkData, (newData) => {
  if (newData?.expiresAt && !newData.isExpired) {
    startCountdown()
  }
})

onMounted(() => {
  if (hasValidParams.value) {
    linkIdentifier.value = route.query.id
    accessToken.value = route.query.token
    fetchLinkData()
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
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
</style>
