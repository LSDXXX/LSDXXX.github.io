<template>
    <div ref="klineChart" style="width: 100%; height: 100%;"></div>
</template>

<script setup lang="ts">
import { onMounted, 
  onUnmounted, 
  ref, 
  defineProps,
  watch} from 'vue'
import type { EChartsOption, EChartsType } from 'echarts'
import { init } from 'echarts'

const upColor = '#00da3c';
const downColor = '#ec0000';

const klineChart = ref()

interface Props {
    klineData?: (string | number)[][],
    buySellPoints?: {
      direction: number,
      coord: string,
      value: number
    }[],
    jumpedPoint?: string
}

const props = defineProps<Props>()

const getOrUpdateOptions = () => {
  if(props.klineData == undefined) {
    return
  }
  let markPoints = props.buySellPoints?.map((value)=>{
    return  {
      name: value.direction == 1? 'buy': 'sell',
      coord: [value.coord, value.value],
      itemStyle: {
        color: value.direction == 1? 'green': 'red',
      },
      value: value.direction == 1? '买入': '卖出',
    }
  }) 
    let option: EChartsOption = {
        animation: false,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            },
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
              color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
              const obj: Record<string, number> = {
                top: 10
              };
              obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
              return obj;
            },
        },
        axisPointer: {
            link: [
              {
                xAxisIndex: 'all'
              }
            ],
            label: {
              backgroundColor: '#777'
            }
        },
        grid: [
           {
             left: '3%',
             right: '3%',
             height: '50%'
           },
           {
             left: '3%',
             right: '3%',
             top: '63%',
             height: '16%'
           }
        ],
        xAxis: [
            {
              type: 'category',
              data: props.klineData.map(item=>item[0]),
              boundaryGap: false,
              axisLine: { onZero: false },
              splitLine: { show: false },
              min: 'dataMin',
              max: 'dataMax',
              axisPointer: {
                z: 100
              }
            },
            {
              type: 'category',
              gridIndex: 1,
              data: props.klineData.map(item=>item[0]),
              boundaryGap: false,
              axisLine: { onZero: false },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: { show: false },
              min: 'dataMin',
              max: 'dataMax'
            }
        ],
        yAxis: [
            {
              scale: true,
              splitArea: {
                show: true
              }
            },
            {
              scale: true,
              gridIndex: 1,
              splitNumber: 2,
              axisLabel: { show: false },
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { show: false }
            }
        ],
        dataZoom: [
            {
              type: 'inside',
              xAxisIndex: [0, 1],
              start: 50,
              end: 100
            },
            {
              show: true,
              xAxisIndex: [0, 1],
              type: 'slider',
              top: '85%',
              start: 50,
              end: 100
            }
        ],
        series: [
            {
              name: '日线数据',
              type: 'candlestick',
              data: props.klineData.map(item=>[item[1], item[2], item[3], item[4]]),
              markPoint: {
                data: markPoints,
              },
              itemStyle: {
                color: upColor,
                color0: downColor,
                borderColor: undefined,
                borderColor0: undefined
              }
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: props.klineData.map(item=>item[5]),
            }
        ]
    }
    chart.setOption(option)
    return option
}

let chart: EChartsType

onMounted(() => {
  // 初始化echarts实例
  chart = init(klineChart.value)
  // 设置echarts配置属性
  getOrUpdateOptions()
  setupResizeObserver()
})

const focusOnDate = (jumpedPoint: string) => {
  if (chart && props.klineData) {
    const dataIndex =  props.klineData!.findIndex(item => item[0] === jumpedPoint);
    if (dataIndex !== -1) {
      // 计算目标日期的坐标位置
      const xStart = (dataIndex / props.klineData!.length) * 100;
      const xEnd = xStart + 10; // 控制缩放范围

      // 使用 dataZoom 来调整视图范围
      chart.dispatchAction({
        type: 'dataZoom',
        start: xStart,
        end: xEnd
      });

      // 显示 tooltip 提示
      chart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: dataIndex
      });
    }
  }
}

defineExpose({focusOnDate})

watch(
  ()=>props,
  ()=> {
    getOrUpdateOptions()
    if(props.jumpedPoint) {
      focusOnDate(props.jumpedPoint)
    }
  },
  {'deep': true}
)

// watch(
//   () => props.jumpedPoint,
//   () => {
//     focusOnDate()
//   },
  // {'deep': true}
// )


let resizeObserver: ResizeObserver

const setupResizeObserver = () => {
    resizeObserver = new ResizeObserver((entries) => {
        window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) return;
          chart.resize()
        });

      }
    );
    resizeObserver.observe(klineChart.value);
}


onUnmounted(() => {
  // if (resizeObserver) {
  //   resizeObserver.unobserve(klineChart.value);
  //   resizeObserver.disconnect();
  // }
})




</script>