<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">{{ isEditMode ? 'Modifier' : 'Générer' }} robots.txt</h3>
        <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
          <IconX class="w-6 h-6" />
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Titre <span
              class="text-red-500">*</span></label>
          <input id="title" v-model="form.title" type="text" required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="loading" placeholder="Ma configuration principale" />
        </div>

        <!-- User-agent rules -->
        <div class="border-t pt-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Règles User-agent</h4>
          <div v-for="(rules, userAgent) in form.userAgents" :key="userAgent"
            class="mb-4 p-4 border rounded-lg bg-gray-50">
            <div class="flex justify-between items-center mb-3">
              <label class="block text-sm font-medium text-gray-700">User-agent: {{ userAgent }}</label>
              <button v-if="userAgent !== '*'" type="button" @click="removeUserAgent(userAgent as string)"
                class="text-red-500 hover:text-red-700">
                <IconTrash class="w-5 h-5" />
              </button>
            </div>

            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Disallow:</label>
              <!-- Vérification de l'existence et accès sécurisé -->
              <div v-if="rules.disallow" v-for="(rule, index) in rules.disallow" :key="`disallow-${userAgent}-${index}`"
                class="flex items-center mb-1">
                <input v-model="rules.disallow![index]" type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm"
                  :disabled="loading" />
                <button type="button" @click="removeRule(userAgent as string, 'disallow', index)"
                  class="ml-2 text-red-500 hover:text-red-700">
                  <IconMinus class="w-5 h-5" />
                </button>
              </div>
              <button type="button" @click="addRule(userAgent as string, 'disallow')"
                class="mt-2 btn-secondary text-sm py-1 px-3">
                <IconPlus class="w-4 h-4 mr-1" /> Ajouter Disallow
              </button>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Allow:</label>
              <!-- Vérification de l'existence et accès sécurisé -->
              <div v-if="rules.allow" v-for="(rule, index) in rules.allow" :key="`allow-${userAgent}-${index}`"
                class="flex items-center mb-1">
                <input v-model="rules.allow![index]" type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm"
                  :disabled="loading" />
                <button type="button" @click="removeRule(userAgent as string, 'allow', index)"
                  class="ml-2 text-red-500 hover:text-red-700">
                  <IconMinus class="w-5 h-5" />
                </button>
              </div>
              <button type="button" @click="addRule(userAgent as string, 'allow')"
                class="mt-2 btn-secondary text-sm py-1 px-3">
                <IconPlus class="w-4 h-4 mr-1" /> Ajouter Allow
              </button>
            </div>
          </div>
          <button type="button" @click="addNewUserAgent" class="btn-primary text-sm py-2 px-4">
            <IconPlus class="w-4 h-4 mr-1" /> Ajouter un User-agent
          </button>
        </div>

        <!-- Sitemap URL -->
        <div class="border-t pt-6">
          <label for="sitemapUrl" class="block text-sm font-medium text-gray-700 mb-2">URL du Sitemap
            (optionnel)</label>
          <input id="sitemapUrl" v-model="form.sitemapUrl" type="url"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="loading" placeholder="https://example.com/sitemap.xml" />
        </div>

        <!-- Custom Rules -->
        <div class="border-t pt-6">
          <label for="customRules" class="block text-sm font-medium text-gray-700 mb-2">Règles personnalisées
            (optionnel)</label>
          <textarea id="customRules" v-model="form.customRules" rows="5"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
            :disabled="loading" placeholder="Crawl-delay: 10"></textarea>
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700">{{ error }}</p>
        </div>

        <div class="flex space-x-3 pt-6">
          <button type="submit" :disabled="loading" class="flex-1 btn-primary disabled:opacity-50">
            <span v-if="loading" class="flex items-center justify-center">
              <IconLoader2 class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              {{ isEditMode ? 'Mise à jour...' : 'Génération en cours...' }}
            </span>
            <span v-else>{{ isEditMode ? 'Mettre à jour' : 'Générer' }}</span>
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
import { ref, reactive, watch, computed } from 'vue';
import { IconX, IconChevronRight, IconLoader2, IconPlus, IconMinus, IconTrash } from '@tabler/icons-vue';
import type { GenerateRobotsTxtPayload, RobotsTxtConfig, UserAgentRules } from '@/types';

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  error?: string | null;
  initialConfig?: RobotsTxtConfig | null; 
}>();

const emit = defineEmits<{
  (e: 'submit', payload: GenerateRobotsTxtPayload): void;
  (e: 'cancel'): void;
}>();

const isEditMode = computed(() => !!props.initialConfig);

const form = reactive<GenerateRobotsTxtPayload>({
  title: '',
  userAgents: {
    '*': { allow: [], disallow: [] } 
  },
  sitemapUrl: '',
  customRules: '',
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.initialConfig) {
      form.title = props.initialConfig.title;
      form.sitemapUrl = props.initialConfig.sitemapUrl || '';
      form.customRules = props.initialConfig.customRules || '';

      form.userAgents = {};
      for (const userAgentKey in props.initialConfig.userAgents) {
        const rules = props.initialConfig.userAgents[userAgentKey];
        form.userAgents[userAgentKey] = {
          allow: rules.allow ? [...rules.allow] : [],
          disallow: rules.disallow ? [...rules.disallow] : [] 
        };
      }
    } else {
      Object.assign(form, {
        title: '',
        userAgents: {
          '*': { allow: [], disallow: [] } 
        },
        sitemapUrl: '',
        customRules: '',
      });
    }
  }
}, { immediate: true });

const addRule = (userAgent: string, type: 'allow' | 'disallow') => {
  if (!form.userAgents[userAgent]) {
    form.userAgents[userAgent] = { allow: [], disallow: [] };
  }
  
  const userAgentRules = form.userAgents[userAgent];
  
  if (type === 'allow') {
    if (!userAgentRules.allow) {
      userAgentRules.allow = []; 
    }
    userAgentRules.allow.push(''); 
  } else { 
    if (!userAgentRules.disallow) {
      userAgentRules.disallow = []; 
    }
    userAgentRules.disallow.push(''); 
  }
};

const removeRule = (userAgent: string, type: 'allow' | 'disallow', index: number) => {
  const userAgentRules = form.userAgents[userAgent];
  if (!userAgentRules) return;
  
  // Supprimer la règle selon le type
  if (type === 'allow' && userAgentRules.allow) {
    userAgentRules.allow.splice(index, 1); // Fonctionne maintenant
  } else if (type === 'disallow' && userAgentRules.disallow) {
    userAgentRules.disallow.splice(index, 1); // Fonctionne maintenant
  }
};

const addNewUserAgent = () => {
  let newUserAgentName = prompt('Nom du nouveau User-agent (ex: Googlebot)');
  if (newUserAgentName) {
    newUserAgentName = newUserAgentName.trim();
    if (newUserAgentName && !form.userAgents[newUserAgentName]) {
      form.userAgents[newUserAgentName] = { allow: [], disallow: [] };
    } else if (newUserAgentName) {
      alert('Ce User-agent existe déjà.');
    }
  }
};

const removeUserAgent = (userAgent: string) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le User-agent "${userAgent}" ?`)) {
    if (form.userAgents[userAgent]) {
      delete form.userAgents[userAgent];
    }
  }
};

const onSubmit = () => {
  // Nettoyer les règles vides avant de soumettre
  const payloadUserAgents: { [key: string]: UserAgentRules } = {};
  for (const uaKey in form.userAgents) {
    const rules = form.userAgents[uaKey];
    const cleanedRules: UserAgentRules = {};
    if (rules.allow) {
      cleanedRules.allow = rules.allow.filter(rule => rule.trim() !== '');
    }
    if (rules.disallow) {
      cleanedRules.disallow = rules.disallow.filter(rule => rule.trim() !== '');
    }
    // Ajouter l'agent utilisateur seulement s'il a des règles non vides
    if ((cleanedRules.allow && cleanedRules.allow.length > 0) || (cleanedRules.disallow && cleanedRules.disallow.length > 0)) {
      payloadUserAgents[uaKey] = cleanedRules;
    }
  }

  emit('submit', {
    title: form.title,
    userAgents: payloadUserAgents,
    sitemapUrl: form.sitemapUrl,
    customRules: form.customRules,
  });
};
</script>
