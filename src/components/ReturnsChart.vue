<template>
    <div ref="returnsChart" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { EChartsOption, EChartsType, init } from 'echarts';
import { onMounted, ref, watch } from 'vue';

const returnsChart = ref()

interface Props {
    datetime: string[],
    returns: number[],
}

const props = defineProps<Props>()

const getOrUpdateOptions = () => {
    const getColor = (value: number) => {
        return value >= 0? 'green': 'red'
    }
    let option: EChartsOption= {
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
              backgroundColor: '#505765',
            }
          },
        },
        dataZoom: [
            {
              type: 'inside',
              xAxisIndex: [0],
              start: 0,
              end: 100
            },
        ],
        visualMap: {
            type: 'piecewise',
            show: false,
            dimension: 1,
            seriesIndex: 0,
            pieces: [
                { lte: 0-0.0001, color: 'red' },
                // almost succeed to hide the zero label
                { gt: 0-0.0001, lt: 0+ 0.0001, color: 'transparent', label: ' '},
                { gte: 0+ 0.0001, color: 'green' }
            ],
            outOfRange: {
	         color: '#999'
	        }
        },
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                formatter: function(value) {
                    // value 是原始数据（如 0.85）
                    return value + '%'; // 转换为 85%
                }
             }
            }
        ],
        series: [
            {
                name: '回报',
                type: 'bar',
                data: props.returns.map((value)=> {
                    return {
                        value: (value*100).toFixed(2), 
                        itemStyle: {
                            color: getColor(value),
                        }
                    }
                }),
                // label: {
                //     show: true,
                //     formatter: '{@[1]}%' // 数据标签显示百分比（需预处理数据）
                // }
            }
        ]
    }
    chart.setOption(option)
    return option
}

watch(
    () => props,
    () => {
        getOrUpdateOptions()
    },
    {'deep': true}
)

let chart: EChartsType

onMounted(() => {
  chart = init(returnsChart.value)
  // 设置echarts配置属性
  getOrUpdateOptions()
})


</script>
