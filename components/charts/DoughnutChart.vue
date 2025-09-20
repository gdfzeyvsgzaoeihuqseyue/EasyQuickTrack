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

const baseColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
];

const genColor = (i: number) => {
  const hue = (i * 137.5) % 360;
  return `hsl(${hue}deg 65% 56%)`;
};

const buildColors = (n: number) => {
  const colors = baseColors.slice(0, n);
  let idx = colors.length;
  while (colors.length < n) {
    colors.push(genColor(idx++));
  }
  return colors;
};

const createChart = async () => {
  if (!chartCanvas.value) return;
  const labels = (props.data || []).map(item => item.label);
  const values = (props.data || []).map(item => item.value);
  const colors = buildColors(values.length);

  if (chartInstance) {
    chartInstance.data.labels = labels;
    if (chartInstance.data.datasets && chartInstance.data.datasets[0]) {
      chartInstance.data.datasets[0].label = props.label || props.title;
      chartInstance.data.datasets[0].data = values;
      // @ts-ignore
      chartInstance.data.datasets[0].backgroundColor = colors;
    }
    chartInstance.update();
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new ChartJS(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: props.label || props.title,
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
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
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: { 
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
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
