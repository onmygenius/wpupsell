<script setup lang="ts">
import { computed } from 'vue';
import { Chart } from 'highcharts-vue';

const props = defineProps<{
  data: Array<{ name: string; count: number; percentage: string }>
}>();

const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

const chartOptions = computed(() => ({
  chart: {
    type: 'pie',
    backgroundColor: 'transparent',
    height: 300
  },
  title: {
    text: 'Products by Category',
    style: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.y} products ({point.percentage:.1f}%)</b>'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        style: {
          color: '#ffffff'
        }
      },
      showInLegend: false,
      innerSize: '50%'
    }
  },
  series: [{
    name: 'Products',
    colorByPoint: true,
    data: props.data.length > 0 ? props.data.map((item, index) => ({
      name: item.name,
      y: item.count,
      color: colors[index % colors.length]
    })) : [{
      name: 'No data',
      y: 1,
      color: '#6b7280'
    }]
  }]
}));
</script>

<template>
  <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
    <Chart :options="chartOptions" />
  </div>
</template>
