<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-1">
            Détails du QR Code
          </h1>
          <p class="text-gray-600">Informations sur votre QR Code généré</p>
        </div>

        <!-- Formulaire d'accès -->
        <div v-if="!hasValidParams" class="card p-8 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Accéder à votre QR Code</h2>
          <form @submit.prevent="fetchQRCodeData" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ID du QR Code</label>
              <input v-model="qrCodeId" type="text" placeholder="ID du QR Code"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Jeton d'accès</label>
              <input v-model="accessToken" type="text" placeholder="Votre jeton secret"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                required />
            </div>

            <button type="submit" :disabled="qrStore.loading"
              class="w-full btn-primary py-3 rounded-lg text-white font-medium disabled:opacity-50">
              <span v-if="qrStore.loading" class="flex items-center justify-center">
                <IconLoader2 class="animate-spin mr-2 h-5 w-5" />
                Chargement...
              </span>
              <span v-else>Voir le QR Code</span>
            </button>
          </form>

          <div v-if="qrStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {{ qrStore.error }}
          </div>
        </div>

        <!-- Affichage des données -->
        <div v-if="qrCodeData && !qrStore.loading" class="space-y-6">

          <!-- Visualisation du QR Code -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconQrcode class="w-5 h-5 mr-2 text-primary-600" />
              QR Code Généré
            </h3>

            <div class="flex flex-col items-center">
              <div class="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <img v-if="qrCodeImageUrl" :src="qrCodeImageUrl" alt="QR Code" class="max-w-full h-auto"
                  style="max-width: 300px; width: 100%;" />
                <div v-else class="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <IconLoader2 class="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              </div>

              <div class="mt-4 flex gap-3">
                <button @click="downloadQRCode" class="btn-primary inline-flex items-center px-4 py-2">
                  <IconDownload class="w-4 h-4 mr-2" />
                  Télécharger
                </button>

                <button @click="copyQRCode" class="btn-secondary inline-flex items-center px-4 py-2">
                  <IconCopy class="w-4 h-4 mr-2" />
                  {{ copied ? 'Copié!' : 'Copier' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Informations du QR Code -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconInfoCircle class="w-5 h-5 mr-2 text-primary-600" />
              Informations
            </h3>
            <div class="space-y-3">
              <div v-if="qrCodeData.title" class="flex items-start justify-between gap-4">
                <span class="text-sm text-gray-600">Titre :</span>
                <span class="text-gray-900 font-medium text-right">{{ qrCodeData.title }}</span>
              </div>

              <div v-if="qrCodeData.url" class="flex items-start justify-between gap-4">
                <span class="text-sm text-gray-600">URL encodée :</span>
                <a :href="qrCodeData.url" target="_blank" :title="qrCodeData.url"
                  class="text-primary-600 hover:text-primary-700 font-medium max-w-md truncate">
                  {{ qrCodeData.url }}
                </a>
              </div>

              <div v-if="qrCodeData.shortLink" class="flex items-start justify-between gap-4">
                <span class="text-sm text-gray-600">Lien court associé :</span>
                <NuxtLink :to="`/guest/link?id=${qrCodeData.shortLink.shortCode}&token=${accessToken}`"
                  class="text-primary-600 hover:text-primary-700 font-medium">
                  {{ qrCodeData.shortLink.shortCode }}
                </NuxtLink>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Type :</span>
                <span class="text-gray-900 font-medium">
                  {{ qrCodeData.qrCodeType === 'url' ? 'URL' : 'Lien court' }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Créé le :</span>
                <span class="text-gray-900 font-medium">{{ formatDate(qrCodeData.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Options du QR Code -->
          <div v-if="qrCodeData.options" class="card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <IconSettings class="w-5 h-5 mr-2 text-gray-600" />
              Configuration
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div v-if="qrCodeData.options.format">
                <span class="text-sm text-gray-600">Format :</span>
                <span class="text-gray-900 font-medium ml-2">{{ qrCodeData.options.format.toUpperCase() }}</span>
              </div>
              <div v-if="qrCodeData.options.size">
                <span class="text-sm text-gray-600">Taille :</span>
                <span class="text-gray-900 font-medium ml-2">{{ qrCodeData.options.size }}px</span>
              </div>
              <div v-if="qrCodeData.options.errorCorrectionLevel">
                <span class="text-sm text-gray-600">Correction :</span>
                <span class="text-gray-900 font-medium ml-2">{{ qrCodeData.options.errorCorrectionLevel }}</span>
              </div>
              <div v-if="qrCodeData.options.margin !== undefined">
                <span class="text-sm text-gray-600">Marge :</span>
                <span class="text-gray-900 font-medium ml-2">{{ qrCodeData.options.margin }}</span>
              </div>
            </div>
          </div>

          <!-- Message -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <IconInfoCircle class="w-4 h-4 inline mr-1" />
            Conservez précieusement votre jeton d'accès pour consulter ce QR Code.
          </div>
        </div>

        <!-- Loading -->
        <LogoLoader v-if="qrStore.loading" :show-text="true" size="lg" text="Chargement du QR Code..." />
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
import { useQRCodeStore } from '~/stores/qrcode'
import { IconQrcode, IconInfoCircle, IconSettings, IconLoader2, IconDownload, IconCopy } from '@tabler/icons-vue'
import AppNotification from '~/components/app/AppNotification.vue'
import { LogoLoader } from '@/components/utils'

const route = useRoute()
const router = useRouter()
const qrStore = useQRCodeStore()

const qrCodeId = ref('')
const accessToken = ref('')
const qrCodeData = ref(null)
const qrCodeImageUrl = ref('')
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

const formatDate = ts => new Date(ts).toLocaleString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const fetchQRCodeData = async () => {
  const id = qrCodeId.value || route.query.id
  const token = accessToken.value || route.query.token

  const result = await qrStore.fetchGuestQRCode(id, token)

  if (result) {
    qrCodeData.value = result

    // Extraire l'image Base64
    if (result.qrCodeBase64) {
      qrCodeImageUrl.value = result.qrCodeBase64
    }

    if (!hasValidParams.value) {
      router.push({ query: { id, token } })
    }
  }
}

const downloadQRCode = () => {
  if (!qrCodeImageUrl.value) return

  try {
    const link = document.createElement('a')
    link.href = qrCodeImageUrl.value
    const format = qrCodeData.value?.options?.format || 'png'
    link.download = `qrcode-guest-${qrCodeId.value || Date.now()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotif('QR Code téléchargé avec succès')
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    showNotif('Impossible de télécharger le QR Code', 'error')
  }
}

const copyQRCode = async () => {
  if (!qrCodeImageUrl.value) return

  try {
    // Convertir base64 en blob
    const base64Data = qrCodeImageUrl.value.split(',')[1]
    const mimeType = qrCodeImageUrl.value.split(';')[0].split(':')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })

    await navigator.clipboard.write([
      new ClipboardItem({ [mimeType]: blob })
    ])

    copied.value = true
    showNotif('QR Code copié avec succès')
    setTimeout(() => (copied.value = false), 1200)
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    showNotif('Impossible de copier le QR Code', 'error')
  }
}

onMounted(() => {
  if (hasValidParams.value) {
    qrCodeId.value = route.query.id
    accessToken.value = route.query.token
    fetchQRCodeData()
  }
})

// SEO
useSeoMeta({
  title: 'Détails du QR Code public',
  robots: 'index, nofollow',
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200;
}
</style>
