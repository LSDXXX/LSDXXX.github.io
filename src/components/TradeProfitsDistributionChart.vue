<template>
    <div ref="profitsDistributionChart" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { EChartsOption, EChartsType, init } from 'echarts';

const profitsDistributionChart = ref()
interface Props {
    tradeProfits: number[]
}

const props = defineProps<Props>()

const getChartData = (profits: number[]) :[number[], number[]] =>{
    let m = new Map<number, number>()
    profits.forEach((value: number)=> {
        const v = parseFloat((value).toFixed(2))
        m.set(v, (m.get(v) ?? 0) + 1)
    })
    let keys = Array.from( m.keys())
    keys = keys.sort((a, b) => a - b)
    let values: number[] = []
    keys.forEach((key: number) => {
        values.push(m.get(key)!)
    })
    return [keys, values]
}

const getOrUpdateOptions = () => {
    const [x, y] = getChartData(props.tradeProfits)
    const getColorByXValue = (xValue: number) => {
      if (xValue > 0) return '#4CAF50';  // 正数 - 绿色
      if (xValue < 0) return '#F44336';  // 负数 - 红色
      return '#9E9E9E';                 // 零 - 灰色
    };

    const seriesData = x.map((xValue, index) => ({
      value: y[index],  // Y轴值（柱子高度）
      itemStyle: {
        color: getColorByXValue(xValue),  // 根据X轴值决定颜色
      },
      // 可以在data中存储额外的xValue供tooltip使用
      xValue: xValue
    }));
    let option: EChartsOption= {
        xAxis: [
          {
            type: 'category',
            data: x,
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
        yAxis: [
            {
                type: 'value',
            }
        ],
        series: [
            {
                name: 'count',
                type: 'bar',
                data: seriesData,
            }
        ]
    }
    chart.setOption(option)
    return option
}

let chart: EChartsType

watch(
    () => props,
    getOrUpdateOptions,
    {deep: true}
)

onMounted(() => {
  // 初始化echarts实例
  chart = init(profitsDistributionChart.value)
  // 设置echarts配置属性
  getOrUpdateOptions()
})

</script>