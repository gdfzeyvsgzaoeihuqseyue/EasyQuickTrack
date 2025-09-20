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
          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>

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

const props = defineProps<{
  visible: boolean
  link: Readonly<ShortLink> | null;
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', newUrl: string): void
  (e: 'cancel'): void
}>()

// État local pour ne pas muter directement le parent
const localLongUrl = ref('')

// Quand on ouvre la modale ou que le lien change, on réinitialise le champ
watch(
  () => [props.visible, props.link?.longUrl],
  () => {
    if (props.visible) {
      localLongUrl.value = props.link?.longUrl ?? ''
    }
  },
  { immediate: true }
)

const loading = computed(() => props.loading === true)
const error = computed(() => props.error ?? null)

const onSubmit = () => {
  if (!localLongUrl.value) return
  emit('submit', localLongUrl.value.trim())
}
</script>
