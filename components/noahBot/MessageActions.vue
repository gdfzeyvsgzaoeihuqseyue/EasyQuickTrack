<template>
  <div class="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <!-- Copier -->
    <button @click="handleCopy" class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Copier le message">
      <IconCheck v-if="copied" class="w-4 h-4 text-green-600" />
      <IconCopy v-else class="w-4 h-4 text-gray-600" />
    </button>

    <!-- Régénérer -->
    <button v-if="role === 'assistant' && isLastAssistantMessage" @click="$emit('regenerate')"
      class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Régénérer la réponse" :disabled="isRegenerating">
      <IconRefresh class="w-4 h-4 text-gray-600" :class="{ 'animate-spin': isRegenerating }" />
    </button>

    <!-- Modifier -->
    <button v-if="role === 'user' && isLastUserMessage" @click="handleEditToggle"
      class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Modifier le message">
      <IconEdit class="w-4 h-4 text-gray-600" />
    </button>

    <!-- Partager -->
    <button @click="handleShare" class="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Partager">
      <IconShare class="w-4 h-4 text-gray-600" />
    </button>
  </div>

  <!-- Modal de modification -->
  <Transition name="fade">
    <div v-if="isEditing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="cancelEdit">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h3 class="text-lg font-semibold mb-4">Modifier le message</h3>
        <textarea v-model="editContent"
          class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none" rows="5"
          placeholder="Modifiez votre message..."></textarea>
        <div class="mt-4 flex justify-end space-x-2">
          <button @click="cancelEdit" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            Annuler
          </button>
          <button @click="confirmEdit" :disabled="!editContent.trim()"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Renvoyer
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IconCopy, IconCheck, IconRefresh, IconEdit, IconShare } from '@tabler/icons-vue';

interface Props {
  content: string;
  role: 'user' | 'assistant';
  messageId: string;
  isLastUserMessage?: boolean;
  isLastAssistantMessage?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  regenerate: [];
  edit: [newContent: string];
}>();

const copied = ref(false);
const isRegenerating = ref(false);
const isEditing = ref(false);
const editContent = ref('');

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const handleEditToggle = () => {
  editContent.value = props.content;
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editContent.value = '';
};

const confirmEdit = () => {
  if (editContent.value.trim()) {
    emit('edit', editContent.value);
    isEditing.value = false;
    editContent.value = '';
  }
};

const handleShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Message NOAH AI',
        text: props.content
      });
    } else {
      // Fallback: copier dans le presse-papiers
      await navigator.clipboard.writeText(props.content);
      alert('Message copié dans le presse-papiers');
    }
  } catch (err) {
    console.error('Failed to share:', err);
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
