<template>
  <div :class="['flex group', message.role === 'user' ? 'justify-end' : 'justify-start']">
    <div :class="['max-w-[80%] flex', message.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
      <!-- Avatar -->
      <div :class="['flex-shrink-0', message.role === 'user' ? 'ml-2' : 'mr-2']">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center',
          message.role === 'user' ? 'bg-gray-300' : 'bg-primary-600'
        ]">
          <IconUser v-if="message.role === 'user'" class="w-5 h-5 text-gray-600" />
          <img v-else :src="sharedFiles.paths.logo.noah" alt="NOAH AI" class="w-5 h-5" />
        </div>
      </div>

      <!-- Contenu du message -->
      <div class="flex-1 min-w-0">
        <div :class="[
          'p-3 rounded-lg shadow-sm overflow-hidden',
          message.role === 'user'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-800'
        ]">
          <!-- Badge -->
          <div v-if="message.role === 'assistant' && message.agent"
            class="text-xs text-gray-500 mb-2 flex items-center space-x-1 flex-wrap">
            <span class="px-2 py-0.5 bg-gray-100 rounded-full">
              {{ message.agent === 'mistral' ? '⚡ Mimic' : '🌟 Genius' }}
            </span>

            <!-- Indicateur de régénération -->
            <span v-if="message.metadata?.regeneration_count && message.metadata.regeneration_count > 0"
              class="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
              Régénéré {{ message.metadata.regeneration_count }} fois
            </span>

            <!-- Outils -->
            <span v-if="message.metadata?.tools_used && message.metadata.tools_used.length > 0"
              class="text-xs flex items-center space-x-1">
              <span v-for="tool in message.metadata.tools_used" :key="tool" class="px-2 py-0.5 rounded-full text-xs"
                :class="getToolBadgeClass(tool)">
                {{ getToolLabel(tool) }}
              </span>
            </span>
          </div>

          <!-- Indicateur de modification -->
          <div v-if="message.role === 'user' && message.metadata?.edit_count && message.metadata.edit_count > 0"
            class="text-xs text-gray-400 mb-2">
            <span class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              Modifié {{ message.metadata.edit_count }} fois
            </span>
          </div>

          <!-- Reflexion -->
          <ThinkingSteps v-if="message.metadata?.thinking_steps" :steps="message.metadata.thinking_steps" />

          <!-- Text Markdown -->
          <div v-if="message.role === 'user'" class="whitespace-pre-wrap break-words">
            {{ message.content }}
          </div>
          <MarkdownRenderer v-else :content="message.content" />

          <!-- Web Search -->
          <div v-if="message.metadata?.web_search_results && message.metadata.web_search_results.length > 0"
            class="mt-3 border-t pt-3">
            <p class="text-xs font-semibold mb-2 flex items-center">
              <IconSearch class="w-3 h-3 mr-1" />
              Sources consultées:
            </p>
            <div class="space-y-1">
              <a v-for="(result, index) in message.metadata.web_search_results.slice(0, 3)" :key="index"
                :href="result.url" target="_blank" rel="noopener noreferrer"
                class="block text-xs text-blue-600 hover:underline">
                {{ result.title }}
              </a>
            </div>
          </div>

          <!-- Images -->
          <div v-if="message.images && message.images.length > 0" class="mt-3 space-y-2">
            <img v-for="(image, index) in message.images" :key="index" :src="image"
              :alt="`Generated image ${index + 1}`"
              class="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition" @click="openImageModal(image)" />
          </div>
        </div>

        <!-- Footer message -->
        <div class="mt-1 flex items-center justify-between">
          <!-- Timestamp -->
          <div v-if="message.role === 'assistant'" class="text-xs text-gray-500">
            {{ formatTime(message.timestamp) }}
          </div>
          <!-- Vide -->
          <div v-if="message.role === 'user'" class="text-xs text-red-500"></div>
          <!-- Actions -->
          <MessageActions :content="message.content" :role="message.role" :message-id="message.id"
            :is-last-user-message="isLastUserMessage" :is-last-assistant-message="isLastAssistantMessage"
            @regenerate="$emit('regenerate', message.id)" @edit="handleEdit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/types';
import { IconUser, IconSearch } from '@tabler/icons-vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import ThinkingSteps from './ThinkingSteps.vue';
import MessageActions from './MessageActions.vue';
import { useSharedFiles } from '~/stores/sharedFiles';

const sharedFiles = useSharedFiles();

interface Props {
  message: ChatMessage;
}

const props = defineProps<{
  message: ChatMessage;
  isLastUserMessage?: boolean;
  isLastAssistantMessage?: boolean;
}>();
const emit = defineEmits<{
  regenerate: [messageId: string];
  edit: [messageId: string, newContent: string];
}>();

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const openImageModal = (imageUrl: string) => {
  window.open(imageUrl, '_blank');
};

const getToolBadgeClass = (tool: string) => {
  const classes: Record<string, string> = {
    web_search: 'bg-blue-100 text-blue-700',
    code_interpreter: 'bg-green-100 text-green-700',
    image_generation: 'bg-pink-100 text-pink-700',
  };
  return classes[tool] || 'bg-gray-100 text-gray-700';
};

const getToolLabel = (tool: string) => {
  const labels: Record<string, string> = {
    web_search: '🔍 Web',
    code_interpreter: '💻 Code',
    image_generation: '🎨 Image',
  };
  return labels[tool] || tool;
};

const handleEdit = (newContent: string) => {
  emit('edit', props.message.id, newContent);
};
</script>
