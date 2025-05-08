<template>
    <a-table :columns="columns" :data-source="data" :pagination="false">
    <template #bodyCell="{ column, text }">
        <div style="white-space: pre-line; padding: 0; margin: 0; line-height: 1.2;"> {{ text }}</div>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { Tab } from 'ant-design-vue/es/tabs/src/interface';
import { onMounted, ref, watch } from 'vue';

const columns = [
    {
        title: '指标',
        dataIndex: 'indicator',
    }, 
    {
        title: '全部',
        dataIndex: 'all',
    }, 
    {
        title: '做多',
        dataIndex: 'long',
    }, 
    {
        title: '做空',
        dataIndex: 'short',
    }, 
]

interface value {
    value: number,
    pct?: number,
}

interface PerformanceValue {
    all?: value, 
    long?: value,
    short?: value,
} 

const formatValue = (v: value|undefined, defaultValue: number|undefined = undefined)=> {
    if (v == undefined){
        return defaultValue ===undefined? ' ': `${defaultValue}`
    }
    let s = ''
    if(v.value !== undefined) {
        s = `${v.value.toFixed(2)}`
    }
    if(v.pct !== undefined) {
        s = s + (s.length > 0? '\n': '') + `${(v.pct*100).toFixed(2)}%`
    }
    return s
}

interface PerformanceData {
    netProfit?: PerformanceValue, 
    grossProfit?: PerformanceValue,
    grossLoss?: PerformanceValue,
    tradeFee?: PerformanceValue,
    initialBalance?: PerformanceValue,
    maxBalance?: PerformanceValue,
    maxDrawdown?: PerformanceValue,
}

type TableData<T, K extends string> = {
    key: K
    data: T
}

type TablePerformanceData = TableData<PerformanceData, 'PerformanceData'>

const performanceNameMap = (v : keyof PerformanceData) => {
    const m =  {
        'kind': 'PerformanceData',
        'netProfit': '净利润',
        'grossProfit': '毛利润',
        'grossLoss': '毛亏损',
        'tradeFee': '交易费用',
        'initialBalance': '初始资金',
        'maxBalance': '峰值资金',
        'maxDrawdown': '最大回撤',
    }
    return m[v]
}

const setDefaultPerformanceData = (data: Partial<PerformanceData> = {}) =>{
    return {
        netProfit: data.netProfit ?? {
            all: {
                value: 0,
                pct: 0,
            }
        },
        grossProfit: data.grossProfit ?? {
            all: {
                value: 0,
                pct: 0,
            }, 
            long: {
                value: 0,
                pct: 0,
            },
            short: {
                value: 0,
                pct: 0,
            }
        },
        grossLoss: data.grossLoss?? {
            all: {
                value: 0,
                pct: 0,
            }, 
            long: {
                value: 0,
                pct: 0,
            },
            short: {
                value: 0,
                pct: 0,
            }
        }, 
        tradeFee: data.tradeFee ?? {
            all: {
                value: 0,
            }
        },
        initialBalance: data.initialBalance ?? {
            all: {
                value: 0,
            }
        },
        maxBalance: data.maxBalance ?? {
            all: {
                value: 0,
            }
        },
        maxDrawdown: data.maxDrawdown ?? {
            all: {
                value: 0,
                pct: 0,
            }
        }
    }
}

interface TradeAnalysisData {
    tradeCount?: PerformanceValue
    openTradeCount?: PerformanceValue
    winCount?: PerformanceValue
    loseCount?: PerformanceValue
    winPercent?: PerformanceValue
    averagePNL?: PerformanceValue
    averageWin?: PerformanceValue
    averageLoss?: PerformanceValue
    riskRewardRatio?: PerformanceValue
    maxReward?: PerformanceValue
    maxRewardPercent?: PerformanceValue
    maxLoss?: PerformanceValue
    maxLossPercent?: PerformanceValue
    tradeAverageCount?: PerformanceValue
    winTradeAverageCount?: PerformanceValue
    loseTradeAverageCount?: PerformanceValue
}

const analysisNameMap = (v: keyof TradeAnalysisData) => {
    const m = {
    tradeCount: '总交易' ,
    openTradeCount: '总未平仓交易' ,
    winCount:  '盈利交易',
    loseCount: '亏损交易' ,
    winPercent: '获利百分比' ,
    averagePNL:  '平均P&L',
    averageWin: '平均盈利交易' ,
    averageLoss: '平均亏损交易' ,
    riskRewardRatio: '平均盈利/平均亏损',
    maxReward: '最大盈利交易' ,
    maxRewardPercent: '最大盈利交易百分比' ,
    maxLoss: '最大亏损交易' ,
    maxLossPercent: '最大亏损交易百分比' ,
    tradeAverageCount: '交易的平均k线数' ,
    winTradeAverageCount: '盈利交易的平均k线数' ,
    loseTradeAverageCount: '亏损交易的平均k线数' 
    }
    return m[v]
}

type TableTradeAnalysisData = TableData<TradeAnalysisData, 'TradeAnalysisData'>

const setDefaultTradeAnalysisData = (data: Partial<TradeAnalysisData> = {}) => {
    return {
        tradeCount: data.tradeCount ?? {
            all: {
                value: 0,
            },
            long: {
                value: 0,
            },
            short: {
                value: 0,
            }
        },
        openTradeCount: data.openTradeCount ?? {
            all: {
                value: 0,
            },
            long: {
                value: 0,
            },
            short: {
                value: 0
            }
        },
        winCount:  data.winCount?? {},
        loseCount: data.loseCount ?? {} ,
        winPercent: data.winPercent ?? {},
        averagePNL: data.averagePNL?? {},
        averageWin: data.averageWin?? {} ,
        averageLoss: data.averageLoss?? {} ,
        riskRewardRatio: data.riskRewardRatio?? {},
        maxReward: data.maxReward ?? {} ,
        maxRewardPercent: data.maxRewardPercent ?? {} ,
        maxLoss: data.maxLoss?? {} ,
        maxLossPercent: data.maxLossPercent ?? {},
        tradeAverageCount: data.tradeAverageCount ?? {} ,
        winTradeAverageCount: data.winTradeAverageCount ?? {} ,
        loseTradeAverageCount: data.loseTradeAverageCount ?? {}, 
    }
}

interface IndicatorAnalysisData {
    sharpeRatio: PerformanceValue
    sortinoRatio: PerformanceValue
    profitFactor: PerformanceValue
}

const indicatorNameMap = (v: keyof IndicatorAnalysisData) => {
    const m =  {
        sharpeRatio: '夏普比率',
        sortinoRatio: 'sortino比率',
        profitFactor: '盈利因子',
    }
    return m[v]
}

type TableIndicatorAnalysisData = TableData<IndicatorAnalysisData, 'IndicatorAnalysisData'>

const setDefaultIndicatorAnalysisData = (data: Partial<IndicatorAnalysisData> = {}) => {
    return {
        sharpeRatio: data.sharpeRatio?? {},
        sortinoRatio: data.sortinoRatio?? {},
        profitFactor: data.profitFactor?? {}
    }
}

interface Props {
    data: TablePerformanceData | TableTradeAnalysisData | TableIndicatorAnalysisData
}

const props = defineProps<Props>()

let data = ref<any[]>() 

const updateTable = () => {
    const tableData: any[] = []
    if (props.data.key == 'PerformanceData') {
        const d = setDefaultPerformanceData(props.data.data)
        Object.keys(d).forEach((value: string, index: number) => {
            tableData.push({
                key: `${index+1}`,
                indicator: performanceNameMap(value as keyof PerformanceData),
                all: formatValue(d[value as keyof PerformanceData]?.all),
                long: formatValue(d[value as keyof PerformanceData]?.long),
                short: formatValue(d[value as keyof PerformanceData]?.short),
            })
        })
    } else if(props.data.key == 'TradeAnalysisData') {
        const d = setDefaultTradeAnalysisData(props.data.data)
        Object.keys(d).forEach((value: string, index: number) => {
            tableData.push({
                key: `${index+1}`,
                indicator: analysisNameMap(value as keyof TradeAnalysisData),
                all: formatValue(d[value as keyof TradeAnalysisData]?.all),
                long: formatValue(d[value as keyof TradeAnalysisData]?.long),
                short: formatValue(d[value as keyof TradeAnalysisData]?.short),
            })
        })
    } else if(props.data.key == 'IndicatorAnalysisData') {
        const d = setDefaultIndicatorAnalysisData(props.data.data)
        Object.keys(d).forEach((value: string, index: number) => {
            tableData.push({
                key: `${index+1}`,
                indicator: indicatorNameMap(value as keyof IndicatorAnalysisData),
                all: formatValue(d[value as keyof IndicatorAnalysisData]?.all),
                long: formatValue(d[value as keyof IndicatorAnalysisData]?.long),
                short: formatValue(d[value as keyof IndicatorAnalysisData]?.short),
            })
        })
    }
    
    data.value = tableData

}

watch(
    () => props,
    updateTable,
    {deep: true}
)

onMounted(() => {
    updateTable()
})

</script>

<style >

  .ant-table-wrapper .ant-table-thead>tr>th,
  .ant-table-wrapper .ant-table-tbody>tr>td,
  .ant-table-wrapper tfoot>tr>th,
  .ant-table-wrapper tfoot>tr>td {
    padding: 6px !important
  }
</style>