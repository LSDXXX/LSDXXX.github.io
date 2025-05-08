<template>
  <SplitView>
    <template #top>
      <!-- 顶部组件的内容 -->
       <!-- <div style="height: 600px;"> -->
       <StockChartView ref="stockChart"></StockChartView>
      <!-- </div> -->
    </template>
    <template #bottom>
      <BackTestView ref="backTestChart"></BackTestView>
    </template>
  </SplitView>
</template>

<script setup lang="ts">
import SplitView from '@/components/SplitView.vue'; 
import BackTestView from './BackTestView.vue';
import StockChartView from './StockChartView.vue';
import { onMounted, ref } from 'vue';
const stockChart = ref()
const backTestChart = ref()
onMounted(()=> {
  backTestChart.value.setJumpToFunction(stockChart.value.changeStockAndSetFocusDate)
})
</script>
