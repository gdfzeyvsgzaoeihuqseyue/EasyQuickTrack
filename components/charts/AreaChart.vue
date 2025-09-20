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
      chartInstance.data.datasets[0].data = values;
    }
    chartInstance.update();
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: props.title,
        data: values,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 3
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
          type: 'category',
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Nombre de clics'
          },
          ticks: { precision: 0 }
        }
      },
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
