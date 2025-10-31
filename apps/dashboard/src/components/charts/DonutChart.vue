<script setup lang="ts">
import { ref } from 'vue';
import { Chart } from 'highcharts-vue';

const chartOptions = ref<any>({
  chart: {
    type: 'pie',
    backgroundColor: 'transparent',
    height: 300
  },
  title: {
    text: 'Performance Metrics',
    style: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  tooltip: {
    pointFormat: '<b>{point.percentage:.1f}%</b>'
  },
  accessibility: {
    point: {
      valueSuffix: '%'
    }
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        distance: -50,
        style: {
          fontWeight: 'bold',
          color: 'white'
        }
      },
      startAngle: -90,
      endAngle: 90,
      center: ['50%', '75%'],
      size: '110%',
      innerSize: '50%'
    }
  },
  series: [{
    type: 'pie',
    name: 'Metric',
    data: [
      { name: 'Conversions', y: 32, color: '#3b82f6' },
      { name: 'Bounce Rate', y: 45, color: '#f59e0b' },
      { name: 'Page Views', y: 87, color: '#10b981' }
    ]
  }]
});
</script>

<template>
  <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
    <Chart :options="chartOptions" />
  </div>
</template>
