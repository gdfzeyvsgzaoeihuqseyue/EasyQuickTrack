<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
      <h3 class="text-xl font-bold text-gray-900 mb-6">Modifier le lien</h3>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nouvelle URL</label>
          <input
            v-model="localLongUrl"
            type="url"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="loading"
          />
        </div>

        <!-- Option avancées -->
        <div class="border-t pt-6">
          <button type="button" @click="showAdvanced = !showAdvanced"
            class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-4">
            <IconChevronRight :class="['w-4 h-4 mr-2 transition-transform', showAdvanced ? 'rotate-90' : '']" />
            Options avancées
          </button>

          <div v-show="showAdvanced" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Activer à partir de (optionnel)
                </label>
                <input
                  v-model="localActivateAt"
                  type="datetime-local"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  :disabled="loading"
                />
                <p class="mt-1 text-xs text-gray-500">Le lien ne sera actif qu'à partir de cette date et heure.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Désactiver le (optionnel)
                </label>
                <input
                  v-model="localExpiresAt"
                  type="datetime-local"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  :disabled="loading"
                />
                <p class="mt-1 text-xs text-gray-500">Le lien expirera et ne sera plus redirigé après cette date et heure.</p>
              </div>
            </div>
          </div>
        </div>
        <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

        <div class="flex space-x-3">
          <button type="submit" :disabled="loading" class="flex-1 btn-primary disabled:opacity-50">
            <span v-if="loading">Mise à jour...</span>
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
import { ref, watch, computed } from 'vue'
import type { ShortLink } from '~/types'
import { IconChevronRight } from '@tabler/icons-vue'

const props = defineProps<{
  visible: boolean
  link: Readonly<ShortLink> | null;
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', newUrl: string, activateAt?: string, expiresAt?: string): void
  (e: 'cancel'): void
}>()

const localLongUrl = ref('')
const localActivateAt = ref('');
const localExpiresAt = ref('');
const showAdvanced = ref(false);

// Helper to format date for datetime-local input
const formatToDatetimeLocal = (dateInput: string | number | undefined): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Quand on ouvre la modale ou que le lien change, on réinitialise le champ
watch(
  () => [props.visible, props.link?.longUrl, props.link?.activateAt, props.link?.expiresAt],
  () => {
    if (props.visible && props.link) {
      localLongUrl.value = props.link.longUrl ?? '';
      localActivateAt.value = formatToDatetimeLocal(props.link.activateAt);
      localExpiresAt.value = formatToDatetimeLocal(props.link.expiresAt);
      showAdvanced.value = false;
    }
  },
  { immediate: true }
)

const loading = computed(() => props.loading === true)
const error = computed(() => props.error ?? null)

const onSubmit = () => {
  if (!localLongUrl.value) return
  emit(
    'submit', 
    localLongUrl.value.trim(), 
    localActivateAt.value || undefined,
    localExpiresAt.value || undefined
  )
}
</script>
