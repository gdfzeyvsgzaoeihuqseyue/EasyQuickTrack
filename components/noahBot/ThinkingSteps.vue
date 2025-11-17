<template>
  <div v-if="steps && steps.length > 0" class="my-3 border border-gray-200 rounded-lg overflow-hidden">
    <button @click="isExpanded = !isExpanded"
      class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div class="flex items-center space-x-2">
        <IconBrain class="w-4 h-4 text-primary-600" />
        <span class="text-sm font-medium">Étapes de réflexion ({{ steps.length }})</span>
      </div>
      <IconChevronDown class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isExpanded }" />
    </button>

    <Transition name="expand">
      <div v-if="isExpanded" class="p-3 bg-white border-t border-gray-200 max-h-[400px] overflow-y-auto">
        <div class="space-y-2">
          <div v-for="(step, index) in steps" :key="index" class="flex items-start space-x-2 p-2 rounded bg-gray-50">
            <div class="flex-shrink-0 mt-0.5">
              <IconSearch v-if="step.type === 'web_search'" class="w-4 h-4 text-blue-600" />
              <IconCode v-else-if="step.type === 'code_execution'" class="w-4 h-4 text-green-600" />
              <IconPhoto v-else-if="step.type === 'image_generation'" class="w-4 h-4 text-purple-600" />
              <IconBulb v-else class="w-4 h-4 text-yellow-600" />
            </div>
            <div class="flex-1 min-w-0 overflow-hidden">
              <p class="text-xs text-gray-700 break-words">{{ step.description }}</p>
              <div v-if="step.data" class="mt-1 text-xs text-gray-500">
                <pre
                  class="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-[150px] break-words whitespace-pre-wrap">{{ formatData(step.data) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ThinkingStep } from '@/types';
import { IconBrain, IconChevronDown, IconSearch, IconCode, IconPhoto, IconBulb } from '@tabler/icons-vue';

interface Props {
  steps: ThinkingStep[];
}

defineProps<Props>();

const isExpanded = ref(false);

const formatData = (data: any): string => {
  if (typeof data === 'string') return data;
  return JSON.stringify(data, null, 2);
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
