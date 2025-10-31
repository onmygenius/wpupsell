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
    text: 'Sales by Category',
    style: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
    name: 'Sales',
    colorByPoint: true,
    data: [{
      name: 'Electronics',
      y: 61.41,
      color: '#3b82f6'
    }, {
      name: 'Clothing',
      y: 11.84,
      color: '#8b5cf6'
    }, {
      name: 'Food',
      y: 10.85,
      color: '#10b981'
    }, {
      name: 'Books',
      y: 4.67,
      color: '#f59e0b'
    }, {
      name: 'Other',
      y: 11.23,
      color: '#6b7280'
    }]
  }]
});
</script>

<template>
  <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
    <Chart :options="chartOptions" />
  </div>
</template>
