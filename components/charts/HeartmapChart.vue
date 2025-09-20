<template>
  <div class="chart-container">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    <div v-if="!data || data.length === 0" class="text-center text-gray-500 py-8">
      Aucune donnée disponible
    </div>
    <div v-else class="heatmap-wrapper">
      <div class="heatmap-grid" :style="gridStyle">
        <div v-for="(cell, index) in processedData" :key="index" class="heatmap-cell" :style="getCellStyle(cell)"
          :title="`${cell.label}: ${cell.value} (${cell.percentage})`">
          <div class="cell-content">
            <div class="cell-label">{{ truncateLabel(cell.label) }}</div>
            <div class="cell-value">{{ cell.value }}</div>
          </div>
        </div>
      </div>
      <div class="heatmap-legend">
        <span class="legend-label">Faible</span>
        <div class="legend-gradient" :style="legendGradientStyle"></div>
        <span class="legend-label">Élevé</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface HeatmapData {
  label: string;
  value: number;
}

interface Props {
  data: HeatmapData[];
  title: string;
  columns?: number;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
}

const props = withDefaults(defineProps<Props>(), {
  columns: 4,
  colorScheme: 'blue'
});

const colorSchemes = {
  blue: {
    min: [219, 234, 254],
    max: [37, 99, 235]
  },
  green: {
    min: [220, 252, 231],
    max: [34, 197, 94]
  },
  red: {
    min: [254, 226, 226],
    max: [239, 68, 68]
  },
  purple: {
    min: [237, 233, 254],
    max: [139, 92, 246]
  }
};

const processedData = computed(() => {
  if (!props.data.length) return [];
  const values = props.data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const total = values.reduce((sum, current) => sum + current, 0);

  return props.data.map(item => ({
    ...item,
    normalizedValue: maxValue === minValue ? 1 : (item.value - minValue) / (maxValue - minValue),
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) + '%' : '0%'
  }));
});

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.min(props.columns, props.data.length)}, 1fr)`,
}));

const legendGradientStyle = computed(() => {
  const colors = colorSchemes[props.colorScheme];
  return {
    background: `linear-gradient(to right, rgb(${colors.min.join(',')}), rgb(${colors.max.join(',')}))`
  };
});

const getCellStyle = (cell: any) => {
  const colors = colorSchemes[props.colorScheme];
  const intensity = cell.normalizedValue;

  // Interpolation linéaire des couleurs RGB
  const r = Math.round(colors.min[0] + (colors.max[0] - colors.min[0]) * intensity);
  const g = Math.round(colors.min[1] + (colors.max[1] - colors.min[1]) * intensity);
  const b = Math.round(colors.min[2] + (colors.max[2] - colors.min[2]) * intensity);

  // Choisir la couleur du texte en fonction de la luminosité
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 128 ? '#374151' : '#ffffff';

  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    color: textColor,
    borderColor: intensity > 0.7 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)'
  };
};

const truncateLabel = (label: string) => {
  return label.length > 12 ? label.substring(0, 12) + '...' : label;
};
</script>

<style scoped>
.chart-container {
  @apply w-full;
}

.heatmap-wrapper {
  @apply space-y-4;
}

.heatmap-grid {
  @apply grid gap-2;
}

.heatmap-cell {
  @apply p-3 rounded-lg border transition-all duration-200 cursor-pointer;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heatmap-cell:hover {
  @apply transform scale-105 shadow-md;
}

.cell-content {
  @apply text-center;
}

.cell-label {
  @apply text-sm font-medium mb-1;
}

.cell-value {
  @apply text-lg font-bold;
}

.heatmap-legend {
  @apply flex items-center justify-center space-x-3 mt-4;
}

.legend-label {
  @apply text-sm text-gray-600 font-medium;
}

.legend-gradient {
  @apply w-20 h-4 rounded;
}
</style>