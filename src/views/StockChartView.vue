<template>
    <a-flex >
    <a-select 
    @select="changeSelectedStock"
    style="width: 150px;"
    v-model:value="selectedStock"
    :options="stocksOption"
    ></a-select>
    </a-flex>
    <KlineChart ref="klineChart" :kline-data="klineData" :buy-sell-points="buySellPoints" :jumped-point="jumpedPoint"></KlineChart>
</template>

<script setup lang="ts">
import KlineChart from '@/components/KlineChart.vue';
import { SelectProps } from 'ant-design-vue';
import { onMounted, ref, watch } from 'vue';
import stockInfo from '@/assets/stockInfo.json'
import backTestResult from '@/assets/backTestResult.json' 

const loadStockData = async (code: string) => {
  try {
    const response = await fetch('/stockdata/' + code +'.json')
    if (!response.ok) {
      throw new Error('Failed to load JSON file')
    }
    let value = await response.json()
    return value
  } catch (error) {
    console.error(error)
  }
}


const klineData = ref()
const selectedStock = ref(stockInfo[0].code) 
const buySellPoints = ref()
const jumpedPoint = ref()
const klineChart = ref()

const changeSelectedStock = (value: string) => {
    loadStockData(value).then((value) => {
        klineData.value = value ['data']
    })
    buySellPoints.value = tradeMarkPoint.get(value)
    // jumpedPoint.value = '2018-11-20T00:00:00'
    // klineChart.value.focusOnDate('2018-11-20T00:00:00')
    jumpedPoint.value = undefined
}

const testChange = ()=> {
    klineChart.value.focusOnDate('2018-11-20T00:00:00')
}

let tradeMarkPoint = new Map<string, {direction: number, coord: string, value: number}[]>()

const changeStockAndSetFocusDate = (stock: string, date: string) => {
    changeSelectedStock(stock)
    jumpedPoint.value = date
    selectedStock.value = stock 
}

defineExpose({changeStockAndSetFocusDate})

backTestResult.records.forEach((value) => {
    let points = tradeMarkPoint.get(value.code)
    if(!points) {
        points = []
    }
    points.push({
        direction: value.tradeType == 1? 1: 0,
        coord: value.openDate,
        value: value.openPrice, 
    })
    points.push({
        direction: value.tradeType == 1? 0: 1,
        coord: value.closeDate,
        value: value.closePrice,
    })
    tradeMarkPoint.set(value.code, points)
})

onMounted(() => {
    // loadStockData('09992').then((value) => {
    //     klineData.value = value['data']
    // })
    changeSelectedStock(selectedStock.value)
})

const stocksOption = ref<SelectProps['options']>(stockInfo.map((value)=> {
    return {
        value: value.code,
        label: value.name
    }
}))


</script>