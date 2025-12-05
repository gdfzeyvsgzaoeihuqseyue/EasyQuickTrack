<template>
  <div class="card p-8 max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
      Générer un QR Code gratuitement
    </h2>

    <div v-if="!showResult" class="space-y-4">
      <!-- Sélecteur de mode -->
      <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button @click="mode = 'url'" :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          mode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        ]">
          À partir d'une URL
        </button>
        <button @click="mode = 'link'" :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          mode === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        ]">
          À partir d'un lien court
        </button>
      </div>

      <form @submit.prevent="generateQRCode">
        <!-- Mode URL -->
        <div v-if="mode === 'url'">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            URL à encoder
          </label>
          <div class="relative">
            <input v-model="inputUrl" type="url" placeholder="https://exemple.com/votre-url"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              :disabled="qrStore.loading" required />
          </div>
        </div>

        <!-- Mode lien court invité -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Code court</label>
            <input v-model="linkIdentifier" type="text" placeholder="abc123"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
              :disabled="qrStore.loading" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jeton d'accès</label>
            <input v-model="accessToken" type="text" placeholder="Votre jeton secret"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              :disabled="qrStore.loading" required />
          </div>
        </div>

        <!-- Info Box -->
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

                <NuxtLink to="/guest/qrcode"
                  class="font-semibold text-gray-500 hover:text-gray-700 transition-colors underline flex items-center">
                  QR Codes publics
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <button type="submit"
          :disabled="qrStore.loading || (mode === 'url' && !inputUrl) || (mode === 'link' && (!linkIdentifier || !accessToken))"
          class="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="qrStore.loading" class="flex items-center justify-center">
            <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Génération en cours...
          </span>
          <span v-else>
            <IconQrcode class="w-5 h-5 mr-2 inline" />
            Générer le QR Code
          </span>
        </button>
      </form>
    </div>

    <!-- Résultat -->
    <div v-else class="space-y-6">
      <div class="p-6 bg-success-50 rounded-xl border border-success-200">
        <h3 class="text-lg font-semibold text-success-800 mb-4 text-center lg:text-left">
          QR Code généré avec succès !
        </h3>

        <div class="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          <div class="flex-1 text-center">
            <div class="inline-block p-4 bg-white rounded-lg shadow-sm max-w-full">
              <img v-if="qrStore.qrCodeUrl" :src="qrStore.qrCodeUrl" alt="QR Code généré"
                class="max-w-full h-auto mx-auto" style="max-width: 300px; width: 100%;" />
              <div v-else class="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <IconLoader2 class="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            </div>
          </div>

          <div class="flex-1 flex flex-col gap-4 w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button class="btn-primary w-full inline-flex justify-center items-center" @click="downloadQRCode">
                <IconDownload class="w-4 h-4 mr-2" />
                Télécharger
              </button>

              <button class="btn-secondary w-full inline-flex justify-center items-center" @click="copyQRCodeUrl">
                <IconCopy class="w-4 h-4 mr-2" />
                {{ copied ? 'Copié!' : 'Copier l\'image' }}
              </button>
            </div>

            <button @click="resetForm"
              class="w-full inline-flex justify-center items-center bg-black text-white hover:bg-gray-800 rounded-lg py-3 font-medium transition-colors">
              <IconQrcode class="w-4 h-4 mr-2" />
              Nouveau QR Code
            </button>
          </div>
        </div>
      </div>

      <!-- Limite d'utilisation -->
      <div class="p-6 bg-orange-50 rounded-xl border border-orange-200">
        <h4 class="text-md font-semibold text-orange-800 mb-2 flex items-center">
          <IconClock class="w-5 h-5 mr-2" />
          Limite d'utilisation
        </h4>
        <p class="text-sm text-orange-700 mb-2">
          Les utilisateurs non authentifiés peuvent générer jusqu'à <strong>2 QR codes par jour</strong>.
        </p>
        <p class="text-xs text-orange-600">
          Connectez-vous pour créer des QR codes illimités avec des options avancées.
        </p>
      </div>

      <!-- Lien vers la page de consultation -->
      <div v-if="mode === 'link' && generatedQRCodeId" class="text-center">
        <NuxtLink :to="`/guest/qrcode?id=${generatedQRCodeId}&token=${accessToken}`"
          class="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
          <IconChartBar class="w-5 h-5 mr-2" />
          Voir les détails du QR Code
        </NuxtLink>
      </div>

      <div class="text-center">
        <button @click="resetForm" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
          Créer un autre QR Code
        </button>
      </div>
    </div>

    <!-- Messages d'erreur -->
    <div v-if="qrStore.error && !showResult" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-800">{{ qrStore.error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQRCodeStore } from '~/stores/qrcode'
import { IconLoader2, IconInfoCircle, IconChartBar, IconClock, IconQrcode, IconDownload, IconCopy } from '@tabler/icons-vue'

const { getSSOUrl } = useSSO()
const loginUrl = computed(() => getSSOUrl('login'))

const qrStore = useQRCodeStore()

// Mode de génération
const mode = ref('url')
const inputUrl = ref('')
const linkIdentifier = ref('')
const accessToken = ref('')
const showResult = ref(false)
const copied = ref(false)
const generatedQRCodeId = ref(null)

onMounted(() => {
  qrStore.clearError()
})

const generateQRCode = async () => {
  qrStore.clearError()
  showResult.value = false

  let result = null

  if (mode.value === 'url') {
    console.log('🔍 Mode URL:', inputUrl.value)
    result = await qrStore.generatePublicQRCodeFromUrl(inputUrl.value)
  } else {
    console.log('🔍 Mode Link:', {
      identifier: linkIdentifier.value,
      accessToken: accessToken.value ? `${accessToken.value.substring(0, 10)}...` : 'VIDE/UNDEFINED'
    })

    if (!linkIdentifier.value || !accessToken.value) {
      qrStore.error = 'Veuillez remplir tous les champs requis'
      return
    }

    result = await qrStore.generatePublicQRCodeFromLink(linkIdentifier.value, accessToken.value)
  }

  if (result) {
    showResult.value = true
    if (result.qrCodeId) {
      generatedQRCodeId.value = result.qrCodeId
    }
  }
}

const downloadQRCode = () => {
  const filename = mode.value === 'url'
    ? `qrcode-url-${Date.now()}_EasyQuickTrack.png`
    : `qrcode-link-${Date.now()}_EasyQuickTrack.png`

  qrStore.downloadQRCode(filename)
}

const copyQRCodeUrl = async () => {
  if (!qrStore.qrCodeUrl) return

  try {
    const response = await fetch(qrStore.qrCodeUrl)
    const blob = await response.blob()

    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ])

    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
    try {
      await navigator.clipboard.writeText(qrStore.qrCodeUrl)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (fallbackErr) {
      console.error('Erreur lors de la copie de l\'URL:', fallbackErr)
    }
  }
}

const resetForm = () => {
  inputUrl.value = ''
  linkIdentifier.value = ''
  accessToken.value = ''
  generatedQRCodeId.value = null
  showResult.value = false
  qrStore.clearQRCode()
}
</script>
