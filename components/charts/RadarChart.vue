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
  maxValue?: number;
}

const props = defineProps<Props>();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = async () => {
  if (!chartCanvas.value) return;
  const labels = (props.data || []).map(item => item.label);
  const values = (props.data || []).map(item => item.value);

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

  // Calculer la valeur max pour un meilleur scaling
  const maxDataValue = Math.max(...values);
  const suggestedMax = props.maxValue || Math.ceil(maxDataValue * 1.2);

  chartInstance = new ChartJS(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: props.label || props.title,
        data: values,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.r || 0;
              const total = context.dataset.data.reduce((acc, current) => {
                const numAcc = typeof acc === 'number' ? acc : 0;
                const numCurrent = typeof current === 'number' ? current : 0;
                return numAcc + numCurrent;
              }, 0);
              const percentage = (typeof total === 'number' && total > 0) ? ((value / total) * 100).toFixed(1) : '0';

              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: suggestedMax,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          pointLabels: {
            color: '#374151',
            font: {
              size: 12
            }
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 10
            },
            callback: function (value: any) {
              return Number.isInteger(value) ? value : '';
            }
          }
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
