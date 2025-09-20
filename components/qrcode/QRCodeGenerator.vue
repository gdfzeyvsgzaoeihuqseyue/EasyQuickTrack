<template>
  <div class="card p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-6">Générer un QR Code</h3>

    <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
      <button @click="mode = 'link'" :class="[
        'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
        mode === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      ]">
        À partir d'un lien court
      </button>
      <button @click="mode = 'url'" :class="[
        'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
        mode === 'url' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      ]">
        À partir d'une URL
      </button>
    </div>

    <form @submit.prevent="generateQRCode" class="space-y-6">
      <div v-if="mode === 'url'">
        <label class="block text-sm font-medium text-gray-700 mb-2">URL à encoder</label>
        <input v-model="inputUrl" type="url" required placeholder="https://exemple.com"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="qrStore.loading" />
      </div>

      <div v-else>
        <label class="block text-sm font-medium text-gray-700 mb-2">Sélectionner un lien court</label>
        <select v-model="selectedLinkId" required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="qrStore.loading">
          <option value="">Choisir un lien...</option>
          <option v-for="link in linksStore.links" :key="link.id" :value="link.id">
            {{ link.shortCode }} - {{ truncateUrl(link.longUrl, 50) }}
          </option>
        </select>
      </div>

      <div class="border-t pt-6">
        <button type="button" @click="showAdvanced = !showAdvanced"
          class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4">
          <IconChevronRight :class="['w-4 h-4 mr-2 transition-transform', showAdvanced ? 'rotate-90' : '']" />
          Options avancées
        </button>

        <div v-show="showAdvanced" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select v-model="options.format"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="svg">SVG</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Taille (px)</label>
              <input v-model.number="options.size" type="number" min="100" max="2000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Couleur du QR code</label>
              <div class="flex items-center space-x-2">
                <input v-model="options.foregroundColor" type="color"
                  class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer" />
                <input v-model="options.foregroundColor" type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
              <div class="flex items-center space-x-2">
                <input v-model="options.backgroundColor" type="color"
                  class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer" />
                <input v-model="options.backgroundColor" type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Correction d'erreur</label>
              <select v-model="options.errorCorrectionLevel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="L">Faible (~7%)</option>
                <option value="M">Moyen (~15%)</option>
                <option value="Q">Élevé (~25%)</option>
                <option value="H">Très élevé (~30%)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Marge</label>
              <input v-model.number="options.margin" type="number" min="0" max="20"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Logo (optionnel)</label>
            <input ref="logoInput" type="file" accept="image/*" @change="handleLogoUpload"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            <p class="text-xs text-gray-500 mt-1">Formats acceptés: PNG, JPEG, WebP</p>
          </div>

          <div v-if="options.logoFile">
            <label class="block text-sm font-medium text-gray-700 mb-2">Taille du logo (%)</label>
            <input v-model.number="options.logoSize" type="range" min="5" max="30" class="w-full" />
            <div class="text-sm text-gray-600 text-center">{{ options.logoSize }}%</div>
          </div>

          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input v-model="options.addSignature" type="checkbox" disabled
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span class="ml-2 text-sm font-medium text-gray-700">Ajouter la signature "by PGS"</span>
            </label>
          </div>

          <div v-if="options.addSignature" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Couleur de la signature</label>
              <div class="flex items-center space-x-2">
                <input v-model="options.signatureColor" type="color"
                  class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer" />
                <input v-model="options.signatureColor" type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Taille de police</label>
              <input v-model.number="options.signatureFontSize" type="number" min="8" max="24"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div v-if="options.format === 'jpeg' || options.format === 'webp'">
            <label class="block text-sm font-medium text-gray-700 mb-2">Qualité ({{ options.quality }}%)</label>
            <input v-model.number="options.quality" type="range" min="1" max="100" class="w-full" />
          </div>
        </div>
      </div>

      <button type="submit" :disabled="qrStore.loading || (!inputUrl && !selectedLinkId)"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
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

    <div v-if="qrStore.hasQRCode" class="mt-8 p-6 bg-success-50 rounded-xl border border-success-200">
      <h4 class="text-lg font-semibold text-success-800 mb-4 text-center lg:text-left">
        QR Code généré avec succès !
      </h4>

      <div class="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        <div class="flex-1 text-center">
          <div class="inline-block p-4 bg-white rounded-lg shadow-sm max-w-full">
            <img v-if="qrStore.qrCodeUrl" :src="qrStore.qrCodeUrl" alt="QR Code généré"
              class="max-w-full h-auto mx-auto" style="max-width: 300px; width: 100%;" @error="handleImageError"
              @load="handleImageLoad" />
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

          <button @click="clearQRCode"
            class="w-full inline-flex justify-center items-center bg-black text-white hover:bg-gray-800 rounded-lg py-3 font-medium transition-colors">
            <IconQrcode class="w-4 h-4 mr-2" />
            Nouveau QR Code
          </button>
        </div>
      </div>
    </div>

    <div v-if="qrStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
      <p class="text-red-700">{{ qrStore.error }}</p>
      <button @click="qrStore.clearError" class="text-red-600 hover:text-red-800 text-sm mt-2">
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQRCodeStore } from '~/stores/qrcode'
import type { QRCodeOptions } from '@/types'
import { useLinksStore } from '~/stores/links'
import { IconChevronRight, IconCopy, IconDownload, IconLoader2, IconQrcode } from '@tabler/icons-vue'

const qrStore = useQRCodeStore()
const linksStore = useLinksStore()
const route = useRoute()

// État local
const mode = ref<'url' | 'link'>('url')
const inputUrl = ref('')
const selectedLinkId = ref('')
const showAdvanced = ref(false)
const copied = ref(false)
const logoInput = ref<HTMLInputElement>()

// État pour le debug des images
const imageLoaded = ref(false)
const imageError = ref(false)

// Options du QR Code
const options = reactive<QRCodeOptions>({
  format: 'png',
  size: 300,
  quality: 92,
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  errorCorrectionLevel: 'M',
  margin: 4,
  logoFile: null,
  logoSize: 20,
  addSignature: true,
  signatureColor: '#666666',
  signatureFontSize: 12
})

// Méthodes
const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    options.logoFile = file
  }
}

// Gestion des événements d'image
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
  console.log('Image QR Code chargée avec succès')
}

const handleImageError = (event: Event) => {
  imageError.value = true
  imageLoaded.value = false
  console.error('Erreur de chargement de l\'image QR Code:', event)
  console.log('URL de l\'image:', qrStore.qrCodeUrl)
}

const generateQRCode = async () => {
  qrStore.clearError()
  imageLoaded.value = false
  imageError.value = false

  if (mode.value === 'url') {
    await qrStore.generateQRCodeFromUrl(inputUrl.value, options)
  } else {
    await qrStore.generateQRCodeFromLink(selectedLinkId.value, options)
  }

  // Debug: vérifier l'URL générée
  if (qrStore.qrCodeUrl) {
    console.log('QR Code URL générée:', qrStore.qrCodeUrl)
    console.log('Type de blob:', qrStore.generatedQRCode?.type)
  }
}

const downloadQRCode = () => {
  const filename = mode.value === 'url'
    ? `qrcode-url-${Date.now()}_EasyQuickTrack.${options.format}`
    : `qrcode-link-${Date.now()}_EasyQuickTrack.${options.format}`

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

const clearQRCode = () => {
  qrStore.clearQRCode()
  inputUrl.value = ''
  selectedLinkId.value = ''
  options.logoFile = null
  if (logoInput.value) {
    logoInput.value.value = ''
  }
}

const truncateUrl = (url: string, maxLength: number) => {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url
}

// Charger les liens au montage
onMounted(() => {
  if (linksStore.links.length === 0) {
    linksStore.fetchLinks()
  }
})

// Initialiser le composant avec un lien
watch(() => route.query.linkId, (newId) => {
  if (newId) {
    mode.value = 'link'
    selectedLinkId.value = newId as string
  }
}, { immediate: true })
</script>
