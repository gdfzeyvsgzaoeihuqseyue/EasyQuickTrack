<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">Modifier le QR Code</h3>
        <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
          <IconX class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <!-- Titre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
          <input
            v-model="localOptions.title"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="loading"
          />
        </div>

        <!-- Options de base -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select v-model="localOptions.format"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              :disabled="loading">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="svg">SVG</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Taille (px)</label>
            <input v-model.number="localOptions.size" type="number" min="100" max="2000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              :disabled="loading" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Couleur du QR code</label>
            <div class="flex items-center space-x-2">
              <input v-model="localOptions.foregroundColor" type="color"
                class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                :disabled="loading" />
              <input v-model="localOptions.foregroundColor" type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                :disabled="loading" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
            <div class="flex items-center space-x-2">
              <input v-model="localOptions.backgroundColor" type="color"
                class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                :disabled="loading" />
              <input v-model="localOptions.backgroundColor" type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                :disabled="loading" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Correction d'erreur</label>
            <select v-model="localOptions.errorCorrectionLevel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              :disabled="loading">
              <option value="L">Faible (~7%)</option>
              <option value="M">Moyen (~15%)</option>
              <option value="Q">Élevé (~25%)</option>
              <option value="H">Très élevé (~30%)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Marge</label>
            <input v-model.number="localOptions.margin" type="number" min="0" max="20"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              :disabled="loading" />
          </div>
        </div>

        <!-- Options avancées -->
        <div class="border-t pt-6">
          <button type="button" @click="showAdvanced = !showAdvanced"
            class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4"
            :disabled="loading">
            <IconChevronRight :class="['w-4 h-4 mr-2 transition-transform', showAdvanced ? 'rotate-90' : '']" />
            Options avancées
          </button>

          <div v-show="showAdvanced" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Logo (optionnel)</label>
              <input ref="logoInput" type="file" accept="image/*" @change="handleLogoUpload"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                :disabled="loading" />
              <p class="text-xs text-gray-500 mt-1">Formats acceptés: PNG, JPEG, WebP</p>
            </div>

            <div v-if="localOptions.logoFile">
              <label class="block text-sm font-medium text-gray-700 mb-2">Taille du logo (%)</label>
              <input v-model.number="localOptions.logoSize" type="range" min="5" max="30" class="w-full"
                :disabled="loading" />
              <div class="text-sm text-gray-600 text-center">{{ localOptions.logoSize }}%</div>
            </div>

            <div class="flex items-center space-x-4">
              <label class="flex items-center">
                <input v-model="localOptions.addSignature" type="checkbox" 
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500" disabled />
                <span class="ml-2 text-sm font-medium text-gray-700">Ajouter la signature "by PGS"</span>
              </label>
            </div>

            <div v-if="localOptions.addSignature" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Couleur de la signature</label>
                <div class="flex items-center space-x-2">
                  <input v-model="localOptions.signatureColor" type="color"
                    class="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    :disabled="loading" />
                  <input v-model="localOptions.signatureColor" type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    :disabled="loading" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Taille de police</label>
                <input v-model.number="localOptions.signatureFontSize" type="number" min="8" max="24"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  :disabled="loading" />
              </div>
            </div>

            <div v-if="localOptions.format === 'jpeg' || localOptions.format === 'webp'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Qualité ({{ localOptions.quality }}%)</label>
              <input v-model.number="localOptions.quality" type="range" min="1" max="100" class="w-full"
                :disabled="loading" />
            </div>
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <!-- Boutons d'action -->
        <div class="flex space-x-3 pt-6">
          <button type="submit" :disabled="loading" class="flex-1 btn-primary disabled:opacity-50">
            <span v-if="loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Mise à jour...
            </span>
            <span v-else>Mettre à jour</span>
          </button>
          <button type="button" @click="$emit('cancel')" class="flex-1 btn-secondary" :disabled="loading">
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { IconChevronRight, IconLoader2, IconX } from '@tabler/icons-vue'
import type { QRCodeRecord } from '~/stores/qrcode'

const props = defineProps<{
  visible: boolean
  qrCode: QRCodeRecord | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', options: any): void
  (e: 'cancel'): void
}>()

// État local
const showAdvanced = ref(false)
const logoInput = ref<HTMLInputElement>()

// Options locales pour éviter de muter les props
const localOptions = reactive({
  title: '',
  format: 'png',
  size: 300,
  quality: 92,
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  errorCorrectionLevel: 'M',
  margin: 4,
  logoFile: null as File | null,
  logoSize: 20,
  addSignature: true,
  signatureColor: '#666666',
  signatureFontSize: 12
})

// Initialiser les options quand la modale s'ouvre ou que le QR code change
watch(
  () => [props.visible, props.qrCode],
  () => {
    if (props.visible && props.qrCode) {
      // Réinitialiser avec les valeurs du QR code existant
      localOptions.title = props.qrCode.title || ''
      localOptions.format = props.qrCode.options?.format || 'png'
      localOptions.size = props.qrCode.options?.size || 300
      localOptions.quality = props.qrCode.options?.quality || 92
      localOptions.foregroundColor = props.qrCode.options?.foregroundColor || '#000000'
      localOptions.backgroundColor = props.qrCode.options?.backgroundColor || '#FFFFFF'
      localOptions.errorCorrectionLevel = props.qrCode.options?.errorCorrectionLevel || 'M'
      localOptions.margin = props.qrCode.options?.margin || 4
      localOptions.logoFile = null // Reset file input
      localOptions.logoSize = props.qrCode.options?.logoSize || 20
      localOptions.addSignature = props.qrCode.options?.addSignature !== false
      localOptions.signatureColor = props.qrCode.options?.signatureColor || '#666666'
      localOptions.signatureFontSize = props.qrCode.options?.signatureFontSize || 12
    }
  },
  { immediate: true }
)

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    localOptions.logoFile = file
  }
}

const onSubmit = () => {
  emit('submit', { ...localOptions })
}
</script>