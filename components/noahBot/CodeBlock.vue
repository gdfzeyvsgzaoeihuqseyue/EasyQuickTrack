<template>
  <div class="relative group">
    <button
      @click="copyCode"
      class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1"
      :class="{ 'bg-green-600': copied }"
    >
      <IconCheck v-if="copied" class="w-3 h-3" />
      <IconCopy v-else class="w-3 h-3" />
      <span>{{ copied ? 'Copié!' : 'Copier' }}</span>
    </button>
    <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import hljs from 'highlight.js/lib/common';
import { IconCopy, IconCheck } from '@tabler/icons-vue';

interface Props {
  code: string;
  language?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript'
});

const copied = ref(false);

const highlightedCode = computed(() => {
  if (props.language && hljs.getLanguage(props.language)) {
    try {
      return hljs.highlight(props.code, { language: props.language }).value;
    } catch (err) {
      console.error('Highlight error:', err);
    }
  }
  return hljs.highlightAuto(props.code).value;
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<style scoped>
pre {
  @apply bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-3;
}

code {
  @apply text-sm font-mono;
}
</style>
