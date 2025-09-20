<template>
  <div class="chart-container">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    <div v-if="!data || data.length === 0" class="text-center text-gray-500 py-8">
      Aucune donnée disponible
    </div>
    <canvas v-else ref="chartCanvas" class="w-full h-64"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { Chart as ChartJS, type Chart, registerables } from 'chart.js';

ChartJS.register(...registerables);

interface ChartData {
  label: string;
  value: number;
}

interface Props {
  data: ChartData[];
  title: string;
  label?: string;
}

const props = defineProps<Props>();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = async () => {
  if (!chartCanvas.value) return;

  const labels = (props.data || []).map(item => item.label);
  const values = (props.data || []).map(item => item.value);

  const backgroundColors = [
    '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#60a5fa', '#a855f7', '#22c55e', '#f97316', '#dc2626', '#3b82f6'
  ];

  if (chartInstance) {
    chartInstance.data.labels = labels;
    if (chartInstance.data.datasets && chartInstance.data.datasets[0]) {
      chartInstance.data.datasets[0].data = values;
      chartInstance.data.datasets[0].label = props.label || props.title;
    }
    chartInstance.update();
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new ChartJS(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: props.label || props.title,
        data: values,
        backgroundColor: backgroundColors.slice(0, labels.length),
        hoverOffset: 4,
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 20,
            padding: 15,
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((acc, current) => acc + (current as number), 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
      }
    }
  });
};

onMounted(() => {
  nextTick(createChart);
});

watch(() => props.data, () => {
  nextTick(createChart);
}, { deep: true, immediate: true });

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>
