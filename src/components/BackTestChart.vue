<template>
 <div style="width: auto; padding-top: 10px;">
  <a-table
    :columns="columns"
    :dataSource="data"
    size="middle"
    :pagination="false"
  />
  </div>
 <div ref="backTestChart" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { onMounted, 
  onUnmounted, 
  ref, 
  defineProps, 
  watch} from 'vue'
import type { EChartsOption, EChartsType } from 'echarts'
import { init, number } from 'echarts'

const backTestChart = ref()

interface Props {
  datetime: string[],
  drawdown: number[], 
  balance:  number[],
  cash: number[],
  tableData?: {
    totalPNL: number,
    maxDrawdown: number,
    tradeCount: number,
    winRate: number,
    cagr: number
  }
}

const columns = [
  {
    title: '总损益',
    dataIndex: 'totalPNL',
  },
  {
    title: '最大回撤',
    dataIndex: 'maxDrawdown'
  },
  {
    title: '总交易次数',
    dataIndex: 'tradeCount',
  },
  {
    title: '胜率',
    dataIndex: 'winRate',
  },
  {
    title: '复利年化',
    dataIndex: 'cagr',
  }
]

const data = ref()

const props = defineProps<Props>()

const getOrUpdateOptions = () => {
  let option: EChartsOption = {
  xAxis: [
    {
      type: 'category',
      data: props.datetime,
    }
  ],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      animation: false,
      label: {
        backgroundColor: '#505765'
      }
    }
  },
  legend: {
    data: ['净值', '回撤', '现金']
  },
  visualMap: {
    type: 'piecewise',
    show: false,
    dimension: 1,
    seriesIndex: 0,
    pieces: [
        { lte: props.balance[0]-0.0001, color: 'red' },
        // almost succeed to hide the zero label
        { gt: props.balance[0]-0.0001, lt: props.balance[0]+ 0.0001, color: 'transparent', label: ' '},
        { gte: props.balance[0]+ 0.0001, color: 'green' }
    ],
    outOfRange: {
	    color: '#999'
	  }
  },
  yAxis: [
    {
      type: 'value',
    },
    {
      type: 'value',
      inverse: true,
      alignTicks: true,
      axisLabel: {
        formatter: (value) => {
          return  value+'%'
        }
      }
    }
  ],
  dataZoom: [
            {
              type: 'inside',
              xAxisIndex: [0],
              start: 0,
              end: 100
            },
  ],
  
  series: [
    {
      name: '净值',
      type: 'line',
      data: props.balance.map((value)=>{
        return value.toFixed(2)
      }),
      areaStyle: {
        origin: props.balance[0],
        opacity: 0.1,
      },
      smooth: true,
      markLine: {
        silent: true,
        data: [
          {
            yAxis: props.balance[0],
            lineStyle: {
              color: '#999',
              type: 'dashed'
            },
            label: {
              formatter: `初始${props.balance[0].toFixed(2)}`,
              position: 'start'
            }
          }, 
          {
            yAxis: props.balance[props.balance.length-1],
            lineStyle: {
              color: '#999',
              type: 'dashed'
            },
            label: {
              formatter: `末期${props.balance[props.balance.length-1].toFixed(2)}`,
              position: 'start'
            }
          }
        ]
      },
    },
    {
      name: '现金',
      type: 'bar',
      data: props.cash.map((value)=>{
        return value.toFixed(2)
      }), 
      // smooth: true,
      color: 'orange',
    },
    {
      name: '回撤',
      type: 'bar',
      data: props.drawdown.map((value) => {
        return -(value*100).toFixed(2)
      }),
      yAxisIndex: 1,
      color: 'rgba(227, 196, 255, 0.9)'
    }
  ]
  }
  chart.setOption(option)

  if(props.tableData) {
  data.value = [{
    key: '1',
    totalPNL: (props.tableData.totalPNL*100).toFixed(2) + '%',
    maxDrawdown: (props.tableData.maxDrawdown*100).toFixed(2) + '%',
    cagr: (props.tableData.cagr*100).toFixed(2) + '%',
    tradeCount: props.tableData.tradeCount,
    winRate: (props.tableData.winRate*100).toFixed(2)+'%',
  }]
}

  return option
}

watch(
  () => props,
  () => {
    getOrUpdateOptions()
  },
  { deep: true } // immediate: true 会在组件挂载时立即执行一次
)

defineExpose({getOrUpdateOptions})

let chart: EChartsType

onMounted(() => {

  // 初始化echarts实例
  chart = init(backTestChart.value)
  // 设置echarts配置属性
  getOrUpdateOptions()
  // chart.setOption(option)
})

onUnmounted(() => {
})

</script>
