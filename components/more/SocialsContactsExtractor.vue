<template>
  <div v-if="isModal && visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-8 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Extraction d'informations de contact et sociales</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <IconX class="w-6 h-6" />
        </button>
      </div>
      <!-- Contenu du composant SocialsContactsExtractor -->
      <div class="socials-contacts-extractor-content">
        <p class="text-gray-600 mb-4">
          Extrayez les adresses email, numéros de téléphone et liens de réseaux sociaux d'une URL.
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="url" class="block text-sm font-medium text-gray-700 mb-2">URL à analyser</label>
            <input id="url" v-model="form.url" type="url" required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :disabled="socialsContactsStore.loading" placeholder="https://www.example.com" />
          </div>

          <div class="space-y-2">
            <div class="flex items-center">
              <input id="analyzeContactPage" v-model="form.analyzeContactPage" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                :disabled="socialsContactsStore.loading || form.analyzeAllPages" />
              <label for="analyzeContactPage" class="ml-2 text-sm font-medium text-gray-700">
                Analyser les pages de contact (ex: /contact, /about)
              </label>
            </div>
            <div class="flex items-center">
              <input id="analyzeAllPages" v-model="form.analyzeAllPages" type="checkbox"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                :disabled="socialsContactsStore.loading" />
              <label for="analyzeAllPages" class="ml-2 text-sm font-medium text-gray-700">
                Analyser plus de pages du site (limité à 50 - peut être lent)
              </label>
            </div>
          </div>

          <div v-if="!form.analyzeAllPages">
            <label for="specificPages" class="block text-sm font-medium text-gray-700 mb-2">
              Pages spécifiques à analyser (une par lignes)
            </label>
            <textarea id="specificPages" v-model="form.specificPagesInput" rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
              :disabled="socialsContactsStore.loading" placeholder="/terms&#10;/blog"></textarea>
          </div>

          <button type="submit" :disabled="socialsContactsStore.loading || !form.url"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="socialsContactsStore.loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Extraction en cours...
            </span>
            <span v-else>Extraire les données</span>
          </button>
        </form>

        <div v-if="socialsContactsStore.error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700">{{ socialsContactsStore.error }}</p>
        </div>

        <!-- Progression en temps réel -->
        <div v-if="socialsContactsStore.loading || socialsContactsStore.progressMessages.length > 0"
          class="mt-8 border-t pt-6">
          <h4 class="text-lg font-bold text-gray-900 mb-4">Progression de l'extraction</h4>
          <div class="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto text-sm space-y-2">
            <div v-for="(message, index) in socialsContactsStore.progressMessages" :key="index" :class="{
              'text-blue-700': message.type === 'info',
              'text-green-700': message.type === 'start' || message.type === 'complete' || message.type === 'success',
              'text-gray-700': message.type === 'progress',
              'text-orange-700': message.type === 'warning',
              'text-red-700': message.type === 'error',
            }">
              <span class="font-semibold">[{{ (message.type || 'info').toUpperCase() }}]</span>
              <span v-if="message.url" class="ml-1">{{ message.url }}:</span>
              <span class="ml-1">{{ message.message }}</span>
            </div>
          </div>
        </div>

        <div v-if="socialsContactsStore.result" class="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <h4 class="text-lg font-semibold text-green-800 mb-4">Résultats de l'extraction</h4>
          <div class="space-y-4">
            <div>
              <h5 class="font-medium text-gray-700 mb-2">Emails :</h5>
              <ul v-if="socialsContactsStore.result.emails.length" class="list-disc list-inside text-gray-600">
                <li v-for="email in socialsContactsStore.result.emails" :key="email">{{ email }}</li>
              </ul>
              <p v-else class="text-gray-600">Aucun email trouvé.</p>
            </div>
            <div>
              <h5 class="font-medium text-gray-700 mb-2">Numéros de téléphone :</h5>
              <ul v-if="socialsContactsStore.result.phoneNumbers.length" class="list-disc list-inside text-gray-600">
                <li v-for="phone in socialsContactsStore.result.phoneNumbers" :key="phone">{{ phone }}</li>
              </ul>
              <p v-else class="text-gray-600">Aucun numéro de téléphone trouvé.</p>
            </div>
            <div>
              <h5 class="font-medium text-gray-700 mb-2">Liens sociaux :</h5>
              <ul v-if="Object.keys(socialsContactsStore.result.socialLinks).length"
                class="list-disc list-inside text-gray-600">
                <li v-for="(link, platform) in socialsContactsStore.result.socialLinks" :key="platform">
                  {{ platform }}: <a :href="link" target="_blank" class="text-primary-600 hover:underline">{{ link }}</a>
                </li>
              </ul>
              <p v-else class="text-gray-600">Aucun lien social trouvé.</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-4">
            <button @click="copyResultsToClipboard" class="btn-secondary flex items-center">
              <IconCopy class="w-4 h-4 mr-2" />
              Copier les résultats
            </button>
            <button @click="downloadResultsAsCsv" class="btn-primary flex items-center">
              <IconDownload class="w-4 h-4 mr-2" />
              Télécharger CSV
            </button>
            <button @click="socialsContactsStore.clearResults" class="btn-secondary">
              Effacer les résultats
            </button>
          </div>
        </div>
        <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
          @close="closeNotification" />
      </div>
    </div>
  </div>
  <!-- Non-modal version -->
  <div v-if="!isModal" class="socials-contacts-extractor-content">
    <h2 class="text-2xl font-bold text-gray-900">Extraction d'informations de contact et sociales</h2>
    <p class="text-gray-600 mb-4">
      Extrayez les adresses email, numéros de téléphone et liens de réseaux sociaux d'une URL.
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="url" class="block text-sm font-medium text-gray-700 mb-2">URL à analyser</label>
        <input id="url" v-model="form.url" type="url" required
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          :disabled="socialsContactsStore.loading" placeholder="https://www.example.com" />
      </div>

      <div class="space-y-2">
        <div class="flex items-center">
          <input id="analyzeContactPage" v-model="form.analyzeContactPage" type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            :disabled="socialsContactsStore.loading || form.analyzeAllPages" />
          <label for="analyzeContactPage" class="ml-2 text-sm font-medium text-gray-700">
            Analyser les pages de contact (ex: /contact, /about)
          </label>
        </div>
        <div class="flex items-center">
          <input id="analyzeAllPages" v-model="form.analyzeAllPages" type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            :disabled="socialsContactsStore.loading" />
          <label for="analyzeAllPages" class="ml-2 text-sm font-medium text-gray-700">
            Analyser plus de pages du site (limité à 50 - peut être lent)
          </label>
        </div>
      </div>

      <div v-if="!form.analyzeAllPages">
        <label for="specificPages" class="block text-sm font-medium text-gray-700 mb-2">
          Pages spécifiques à analyser (une par lignes)
        </label>
        <textarea id="specificPages" v-model="form.specificPagesInput" rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
          :disabled="socialsContactsStore.loading" placeholder="/terms&#10;/blog"></textarea>
      </div>

      <button type="submit" :disabled="socialsContactsStore.loading || !form.url"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="socialsContactsStore.loading" class="flex items-center justify-center">
          <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Extraction en cours...
        </span>
        <span v-else>Extraire les données</span>
      </button>
    </form>

    <div v-if="socialsContactsStore.error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
      <p class="text-red-700">{{ socialsContactsStore.error }}</p>
    </div>

    <!-- Progression en temps réel -->
    <div v-if="socialsContactsStore.loading || socialsContactsStore.progressMessages.length > 0"
      class="mt-8 border-t pt-6">
      <h4 class="text-lg font-bold text-gray-900 mb-4">Progression de l'extraction</h4>
      <div class="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto text-sm space-y-2">
        <div v-for="(message, index) in socialsContactsStore.progressMessages" :key="index" :class="{
          'text-blue-700': message.type === 'info',
          'text-green-700': message.type === 'start' || message.type === 'complete' || message.type === 'success',
          'text-gray-700': message.type === 'progress',
          'text-orange-700': message.type === 'warning',
          'text-red-700': message.type === 'error',
        }">
          <span class="font-semibold">[{{ (message.type || 'info').toUpperCase() }}]</span>
          <span v-if="message.url" class="ml-1">{{ message.url }}:</span>
          <span class="ml-1">{{ message.message }}</span>
        </div>
      </div>
    </div>

    <div v-if="socialsContactsStore.result" class="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
      <h4 class="text-lg font-semibold text-green-800 mb-4">Résultats de l'extraction</h4>
      <div class="space-y-4">
        <div>
          <h5 class="font-medium text-gray-700 mb-2">Emails :</h5>
          <ul v-if="socialsContactsStore.result.emails.length" class="list-disc list-inside text-gray-600">
            <li v-for="email in socialsContactsStore.result.emails" :key="email">{{ email }}</li>
          </ul>
          <p v-else class="text-gray-600">Aucun email trouvé.</p>
        </div>
        <div>
          <h5 class="font-medium text-gray-700 mb-2">Numéros de téléphone :</h5>
          <ul v-if="socialsContactsStore.result.phoneNumbers.length" class="list-disc list-inside text-gray-600">
            <li v-for="phone in socialsContactsStore.result.phoneNumbers" :key="phone">{{ phone }}</li>
          </ul>
          <p v-else class="text-gray-600">Aucun numéro de téléphone trouvé.</p>
        </div>
        <div>
          <h5 class="font-medium text-gray-700 mb-2">Liens sociaux :</h5>
          <ul v-if="Object.keys(socialsContactsStore.result.socialLinks).length"
            class="list-disc list-inside text-gray-600">
            <li v-for="(link, platform) in socialsContactsStore.result.socialLinks" :key="platform">
              {{ platform }}: <a :href="link" target="_blank" class="text-primary-600 hover:underline">{{ link }}</a>
            </li>
          </ul>
          <p v-else class="text-gray-600">Aucun lien social trouvé.</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3 mt-4">
        <button @click="copyResultsToClipboard" class="btn-secondary flex items-center">
          <IconCopy class="w-4 h-4 mr-2" />
          Copier les résultats
        </button>
        <button @click="downloadResultsAsCsv" class="btn-primary flex items-center">
          <IconDownload class="w-4 h-4 mr-2" />
          Télécharger CSV
        </button>
        <button @click="socialsContactsStore.clearResults" class="btn-secondary">
          Effacer les résultats
        </button>
      </div>
    </div>
    <AppNotification :isVisible="showNotification" :message="notificationMessage" :type="notificationType"
      @close="closeNotification" />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue';
import { useSocialsContactsStore } from '~/stores/socialsContacts';
import { IconLoader2, IconCopy, IconDownload, IconX } from '@tabler/icons-vue';
import AppNotification from '~/components/AppNotification.vue';

const props = defineProps<{
  initialUrl?: string;
  isModal?: boolean; 
  visible?: boolean; 
}>();

const emit = defineEmits(['close']); 

const socialsContactsStore = useSocialsContactsStore();

const form = reactive({
  url: props.initialUrl || '',
  analyzeContactPage: true,
  analyzeAllPages: false,
  specificPagesInput: '',
});

watch(() => props.initialUrl, (newUrl) => {
  if (newUrl) {
    form.url = newUrl;
  }
}, { immediate: true });

// Initialize form.url with initialUrl prop on mount
onMounted(() => {
  if (props.initialUrl) {
    form.url = props.initialUrl;
  }
});

// États pour la notification
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('success');
let notificationTimeout: NodeJS.Timeout | null = null;

const showFloatingNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  notificationTimeout = setTimeout(() => {
    closeNotification();
  }, 3000);
};

const closeNotification = () => {
  showNotification.value = false;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
};

// Watcher pour désactiver analyzeAllPages pour analyzeContactPage
watch(() => form.analyzeAllPages, (newValue) => {
  if (newValue) {
    form.analyzeContactPage = false;
    form.specificPagesInput = '';
  }
});

const handleSubmit = async () => {
  const specificPagesArray = form.specificPagesInput
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  await socialsContactsStore.extractData(
    form.url,
    form.analyzeContactPage,
    form.analyzeAllPages,
    specificPagesArray
  );
  if (socialsContactsStore.result) {
    showFloatingNotification('Extraction terminée !', 'success');
  } else if (socialsContactsStore.error) {
    showFloatingNotification(socialsContactsStore.error, 'error');
  }
};

const formatResultsForCopy = () => {
  const result = socialsContactsStore.result;
  if (!result) return '';

  let text = `Emails:\n${result.emails.length > 0 ? result.emails.join('\n') : 'Aucun'}\n\n`;
  text += `Numéros de téléphone:\n${result.phoneNumbers.length > 0 ? result.phoneNumbers.join('\n') : 'Aucun'}\n\n`;
  text += `Liens sociaux:\n`;
  if (Object.keys(result.socialLinks).length > 0) {
    for (const platform in result.socialLinks) {
      text += `${platform}: ${result.socialLinks[platform]}\n`;
    }
  } else {
    text += 'Aucun\n';
  }
  return text;
};

const copyResultsToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formatResultsForCopy());
    showFloatingNotification('Résultats copiés dans le presse-papiers !', 'success');
  } catch (err) {
    console.error('Erreur lors de la copie:', err);
    showFloatingNotification('Impossible de copier les résultats.', 'error');
  }
};

const downloadResultsAsCsv = () => {
  const result = socialsContactsStore.result;
  if (!result) return;

  let csvContent = 'Type,Value,Platform\n';

  result.emails.forEach(email => {
    csvContent += `Email,${email},\n`;
  });

  result.phoneNumbers.forEach(phone => {
    csvContent += `Phone,${phone},\n`;
  });

  for (const platform in result.socialLinks) {
    csvContent += `Social,${result.socialLinks[platform]},${platform}\n`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'social_contacts_extraction.csv';
  link.click();
  URL.revokeObjectURL(link.href);
  showFloatingNotification('Fichier CSV téléchargé !', 'success');
};
</script>
