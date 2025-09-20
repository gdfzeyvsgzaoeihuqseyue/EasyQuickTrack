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

  // Si déjà créé : update des données
  if (chartInstance) {
    chartInstance.data.labels = labels;
    if (chartInstance.data.datasets && chartInstance.data.datasets[0]) {
      chartInstance.data.datasets[0].label = props.label || props.title;
      chartInstance.data.datasets[0].data = values;
    }
    chartInstance.update();
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: props.label || props.title,
        data: values,
        backgroundColor: [
          '#8b5cf6', '#10b981', '#f59e0b',
          '#6d28d9', '#059669', '#d97706',
        ],
        borderColor: [
          '#8b5cf6', '#10b981', '#f59e0b',
          '#6d28d9', '#059669', '#d97706',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false,
          text: props.title,
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#1f2937'
        },
        legend: {
          display: false
        },
        tooltip: { 
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0; 
              const total = context.dataset.data.reduce((acc, current) => {
                const numAcc = typeof acc === 'number' ? acc : 0;
                const numCurrent = typeof current === 'number' ? current : 0;
                return numAcc + numCurrent;
              }, 0);
              const percentage = (typeof total === 'number' && total > 0) ? ((value / total) * 100).toFixed(1) : '0';

              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: props.label
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Nombre de clics'
          },
        }
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
