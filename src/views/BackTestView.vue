<template>
    <a-flex gap="middle">
        <a-select
        v-model:value="selectedChart"
        :options="chartSelectedOption"
        ></a-select>
        <a-select
        v-model:value="selectedPeriod"
        :options="periodSelectedOption"
        @change="handlePeriodChange"
        ></a-select>
        <a-range-picker 
        v-model:value="selectedTimeRage" 
        @change="handleTimeRangeChange"/>
    </a-flex> 
    <div>
        <template v-if="selectedChart=='BackTestChart'">
            <!-- <div style="height: 600px;"> -->
            <BackTestChart ref="backTestChart"
                :cash="backTestData.cash" 
                :datetime="backTestData.date" 
                :drawdown="backTestData.drawdown" 
                :balance="backTestData.balance"
                :table-data="backTestTableData"
                ></BackTestChart>
            <!-- </div> -->
        </template>
        <template v-else-if="selectedChart=='ReturnsChart'">
            <div style="height: 600px;">
                <ReturnsChart 
                :datetime="backTestData.date" 
                :returns="backTestData.returns"></ReturnsChart>
            </div>
        </template>
        <template v-else-if="selectedChart=='TradePerformanceTable'">
            <div style="height: 600px;">
                <TradePerformanceTable
                :data="performanceTableData"></TradePerformanceTable>
            </div>
        </template>
        <template v-else-if="selectedChart=='TradeAnalysisTable'">
            <div style="height: 600px;">
                <TradePerformanceTable
                :data="tradeAnalysisTableData"></TradePerformanceTable>
            </div>
        </template>
        <template v-else-if="selectedChart=='TradeIndicatorsTable'">
            <div style="height: 600px;">
                <TradePerformanceTable
                :data="tradeIndicatorsTableData"></TradePerformanceTable>
            </div>
        </template>
        <template v-else-if="selectedChart=='TradeProfitsDistributionChart'">
            <div style="height: 600px;">
                <TradeProfitsDistributionChart :trade-profits="tradeProfitsPCT">
                </TradeProfitsDistributionChart>
            </div>
        </template>
        <template ref="tradeListTable" v-else-if="selectedChart=='TradeListTable'">
            <div style="height: 600px;">
                <TradeListTable :records="tradeRecords" :jump-to="jumpTo">
                </TradeListTable>
            </div>
        </template>
        
    </div>
</template>

<script setup lang="ts">

import BackTestChart from '@/components/BackTestChart.vue';
import { onMounted, ref, watch } from 'vue';
import TradePerformanceTable from '@/components/TradePerformanceTable.vue';
import ReturnsChart from '@/components/ReturnsChart.vue';
import TradeProfitsDistributionChart from '@/components/TradeProfitsDistributionChart.vue';
import TradeListTable from '@/components/TradeListTable.vue';
import backTestResult from '@/assets/backTestResult.json' 
import { SelectProps } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { getDateRangeIndexes, sharpRatio, sortinoRatio } from '@/utils/utils';
// import * as dfd from 'danfojs' 
// import * as dfd from 'danfojs/dist/danfojs-browser/src' 
type RangeValue = [Dayjs, Dayjs];

const backTestChart = ref()
const performanceTableData = ref()
const tradeAnalysisTableData = ref()
const tradeIndicatorsTableData = ref()
const tradeProfitsPCT = ref()
const backTestTableData = ref()

const jumpTo = ref()

const setJumpToFunction = (f: (stock: string, date: string)=>void) =>{
    jumpTo.value = f
}

defineExpose({setJumpToFunction})


const selectedTimeRage = ref<RangeValue>()
const backTestData = ref<{
        date: string[],
        cash: number[],
        balance: number[],
        drawdown: number[],
        returns: number[]}>(backTestResult.monthData)

const tradeRecords = ref< {
            code: string,
            openDate: string
            closeDate: string
            openPrice: number
            closePrice: number
            holdCount: number
            size: number
            profit: {
                value: number,
                pct: number,
            }
            maxProfit: {
                value: number,
                pct: number,
            }
            maxLoss: {
                value: number,
                pct: number
            }
            tradeType: number,
            tradingFee: number
        }[]> (backTestResult.records)

const selectedPeriod = ref('month')
const periodSelectedOption = ref<SelectProps['options']>([
    {
        value: 'day',
        label: '日',
    },
    {
        value: 'month',
        label: '月'
    },
    {
        value: 'year',
        label: '年'
    }
])

const handleTimeRangeChange = (range: [Dayjs, Dayjs]) => {
    updateBackTestData()
}

const getPeriodData = () => {
    let data: {
        date: string[],
        cash: number[],
        balance: number[],
        drawdown: number[],
        returns: number[],
    } 
    if(selectedPeriod.value == 'day') {
        data = backTestResult.dayData
    } else if(selectedPeriod.value == 'month') {
        data = backTestResult.monthData
    } else {
        data = backTestResult.yearData
    }
    return data
}

const updateBackTestData = () => {
    let data = getPeriodData()
    const {startIndex, endIndex} = getDateRangeIndexes(data.date, selectedTimeRage.value![0], selectedTimeRage.value![1])
    backTestData.value = {
        date: data.date.slice(startIndex, endIndex+1),
        balance: data.balance.slice(startIndex, endIndex+1),
        drawdown: data.drawdown.slice(startIndex, endIndex+1),
        cash: data.cash.slice(startIndex, endIndex+1),
        returns: data.returns.slice(startIndex, endIndex+1),
    }
    tradeRecords.value =  backTestResult.records.filter((value) => {
        return ((dayjs(value.openDate).isAfter(selectedTimeRage.value![0]) && dayjs(value.openDate).isBefore(selectedTimeRage.value![1])) || 
            (dayjs(value.closeDate).isAfter(selectedTimeRage.value![0]) && dayjs(value.closeDate).isBefore(selectedTimeRage.value![1])))
    })
}

const handlePeriodChange = (period: string)  => {
    updateBackTestData()
}

const updateAnalysisData = () => {
    let netProfit = [0, 0, 0]
    let grossProfit = [0, 0, 0]
    let grossLoss = [0, 0, 0]
    let tradingFee: number = 0
    let profitPCT: number[] = []
    let winCount = [0, 0, 0] 
    let maxReward = [0, 0, 0]
    let maxRewardPCT = [0, 0, 0]
    let maxLoss = [0, 0, 0]
    let maxLossPCT = [0, 0, 0]
    let winHoldCount = [0, 0, 0]
    let loseHoldCount = [0, 0, 0]
    let [longCount, shortCount] = [0, 0]
    tradeRecords.value?.forEach((record)=> {
        netProfit[0] += record.profit.value
        if(record.tradeType == 1) {
            longCount++
            netProfit[1] += record.profit.value
        } else {
            netProfit[2] += record.profit.value
            shortCount++
        }
        if(record.profit.value > 0) {
            const f = (n: number) => {
                grossProfit[n] += record.profit.value
                maxReward[n] = Math.max(record.profit.value, maxReward[n])
                maxRewardPCT[n] = Math.max(record.profit.pct, maxRewardPCT[n])
                winCount[n]++
                winHoldCount[n]+=record.holdCount
            }
            f(0)
            if(record.tradeType == 1) {
                f(1)
            } else {
                f(2)
            }
        } else {
            const f = (n: number) => {
                grossLoss[n] += record.profit.value
                maxLoss[n] = Math.max(-record.profit.value, maxLoss[n])
                maxLossPCT[n] = Math.max(-record.profit.pct, maxLossPCT[n])
                loseHoldCount[n] += record.holdCount
            }
            f(0)
            if(record.tradeType == 1) {
                f(1)
            } else {
                f(2)
            }
        }
        profitPCT.push(record.profit.pct)
        tradingFee += record.tradingFee
    })
    let maxDrawDown = Math.min(...backTestData.value.drawdown)
    let maxBalance = Math.max(...backTestData.value.balance)
    const {startIndex, endIndex} = getDateRangeIndexes(backTestResult.monthData.date, selectedTimeRage.value![0], selectedTimeRage.value![1])
    let monthReturns = backTestResult.monthData.returns.slice(startIndex, endIndex+1)
    let sharp = sharpRatio(monthReturns)
    let sortino = sortinoRatio(monthReturns)
    const initialBalance = backTestData.value.balance[0]
    const finalBalance = backTestData.value.balance[backTestData.value.balance.length-1]
    const years =  selectedTimeRage.value![1].diff(selectedTimeRage.value![0], 'day', true) / 365.25
    const cagr = Math.pow(finalBalance/initialBalance, 1/ years) - 1

    performanceTableData.value = {
        key: 'PerformanceData',
        data: {
            netProfit: {
                all: {
                    value: netProfit[0],
                    pct: netProfit[0]/initialBalance,
                },
                long: {
                    value: netProfit[1],
                    pct: netProfit[1]/initialBalance,
                }, 
                short: {
                    value: netProfit[2],
                    pct: netProfit[2]/initialBalance
                }
            },
            grossProfit:  {
                all: {
                    value: grossProfit[0],
                    pct: grossProfit[0]/initialBalance,
                },
                long: {
                    value: grossProfit[1],
                    pct: grossProfit[1]/initialBalance,
                },
                short: {
                    value: grossProfit[2],
                    pct: grossProfit[2]/initialBalance,
                }

            },
            grossLoss: {
                all: {
                    value: grossLoss[0],
                    pct: grossLoss[0]/initialBalance,
                },
                long: {
                    value: grossLoss[1],
                    pct: grossLoss[1]/initialBalance,
                },
                short: {
                    value: grossLoss[2],
                    pct: grossLoss[2]/initialBalance,
                }
            },
            tradeFee: tradingFee,
            maxBalance: {
                all: {
                    value: maxBalance 
                }
            },
            maxDrawdown: {
                all: {
                    pct: maxDrawDown
                }
            },
            initialBalance: {
                all: {
                    value: initialBalance
                }
            } 
        }
    }
    const tradeCount = tradeRecords.value.length

    tradeAnalysisTableData.value = {
        key: 'TradeAnalysisData' ,
        data : {
            tradeCount: {
                all: {
                    value: tradeCount 
                },
                long: {
                    value: longCount,
                },
                short: {
                    value: shortCount,
                }
            },
            winCount: {
                all: {
                    value: winCount[0]
                },
                long: {
                    value: winCount[1],
                },
                short: {
                    value: winCount[2]
                }
            },
            loseCount: {
                all: {
                    value: tradeCount - winCount[0]
                },
                long: {
                    value: longCount - winCount[1],
                }, 
                short: {
                    value: shortCount - winCount[2],
                }
            },
            winPercent: {
                all: {
                    pct: winCount[0]/ tradeCount,
                },
                long: {
                    pct: longCount ==0 ?undefined: winCount[1]/longCount,
                },
                short: {
                    pct: shortCount == 0? undefined: winCount[2]/shortCount,
                }
            },
            averagePNL: {
                all: {
                    value: netProfit[0]/tradeCount, 
                    pct: netProfit[0]/tradeCount/initialBalance,
                },
                long: {
                    value: longCount==0? undefined: netProfit[1]/longCount,
                    pct: longCount == 0? undefined: netProfit[1]/longCount/initialBalance,
                }, 
                short: {
                    value: shortCount == 0? undefined: netProfit[2]/shortCount,
                    pct: shortCount == 0? undefined: netProfit[2]/shortCount/initialBalance,
                }
            },
            averageWin: {
                all: {
                    value: grossProfit[0]/winCount[0],
                    pct: grossProfit[0]/winCount[0]/initialBalance,
                },
                long: {
                    value: winCount[1]==0? undefined: grossProfit[1]/winCount[1],
                    pct: winCount[1]==0? undefined: grossProfit[1]/winCount[1]/initialBalance,
                },
                short: {
                    value: winCount[2]==0? undefined: grossProfit[2]/winCount[2],
                    pct: winCount[2]==0? undefined: grossProfit[2]/winCount[2]/initialBalance,
                }
            },
            averageLoss: {
                all: {
                    value: grossLoss[0]/(tradeCount-winCount[0]),
                    pct: grossLoss[0]/(tradeCount-winCount[0])/initialBalance,
                },
                long: {
                    value: (longCount-winCount[1])==0? undefined: grossLoss[1]/(longCount-winCount[1]),
                    pct: (longCount-winCount[1]) ==0? undefined: grossLoss[1]/(longCount-winCount[1])/initialBalance,
                },
                short: {
                    value: (shortCount-winCount[2])==0? undefined: grossLoss[2]/(shortCount-winCount[2]),
                    pct: (shortCount-winCount[2]) ==0? undefined: grossLoss[2]/(shortCount-winCount[2])/initialBalance,
                }
            },
            riskRewardRatio: {
                all: {
                    value: -(grossProfit[0]/winCount[0]) / (grossLoss[0]/(tradeCount-winCount[0]))
                },
                long: {
                    value: (longCount - winCount[1]) == 0? undefined: -(grossProfit[1]/winCount[1]) / (grossLoss[1]/(longCount-winCount[1]))
                },
                short: {
                    value: (shortCount- winCount[2]) == 0? undefined: -(grossProfit[2]/winCount[2]) / (grossLoss[2]/(shortCount-winCount[2]))
                }
            },
            maxReward: {
                all: {
                    value: maxReward[0],
                },
                long: {
                    value: maxReward[1],
                },
                short: {
                    value: maxReward[2],
                }
            },
            maxRewardPercent: {
                all: {
                    pct: maxRewardPCT[0],
                },
                long: {
                    pct: maxRewardPCT[1],
                },
                short: {
                    pct: maxRewardPCT[2],
                },
            },
            maxLoss: {
                all: {
                    value: maxLoss[0]
                },
                long: {
                    value: maxLoss[1]
                },
                short: {
                    value: maxLoss[2]
                },
            },
            maxLossPercent: {
                all: {
                    pct: maxLossPCT[0],
                },
                long: {
                    pct: maxLossPCT[1],
                },
                short: {
                    pct: maxLossPCT[2],
                },
            },
            tradeAverageCount: {
                all: {
                    value: (winHoldCount[0]+loseHoldCount[0])/tradeCount
                },
                long: {
                    value: longCount ==0 ? undefined: (winHoldCount[1]+loseHoldCount[1])/longCount
                },
                short: {
                    value: shortCount==0 ? undefined: (winHoldCount[2]+loseHoldCount[2])/shortCount
                },
            },
            winTradeAverageCount: {
                all: {
                    value: winHoldCount[0] / tradeCount 
                }, 
                long: {
                    value: longCount == 0? undefined: winHoldCount[1]/longCount
                },
                short: {
                    value: shortCount == 0? undefined: winHoldCount[2]/shortCount
                }
            },
            loseTradeAverageCount: {
                all: {
                    value: loseHoldCount[0] / tradeCount 
                }, 
                long: {
                    value: longCount == 0? undefined: loseHoldCount[1]/longCount
                },
                short: {
                    value: shortCount == 0? undefined: loseHoldCount[2]/shortCount
                }
            }

            
        }
    }

    tradeIndicatorsTableData.value = {
        key: 'IndicatorAnalysisData',
        data: {
            sharpeRatio: {
                    all: {
                        value: sharp,
                    }
                },
                sortinoRatio: {
                    all: {
                        value: sortino,
                    }
                },
                profitFactor: {
                    all: {
                        value: -grossProfit[0]/ grossLoss[0]
                    },
                    long: {
                        value: grossLoss[1] == 0 ? undefined: -grossProfit[1]/ grossLoss[1]
                    }, 
                    short: {
                        value: grossLoss[2] == 0? undefined: -grossProfit[2]/ grossLoss[2]
                    }
                }
        }
    }
    tradeProfitsPCT.value = profitPCT
    backTestTableData.value=  {
        totalPNL: netProfit[0] / initialBalance,
        maxDrawdown: maxDrawDown,
        tradeCount: tradeCount,
        winRate: winCount[0]/tradeCount,
        cagr: cagr
    }
}

watch(
    () => backTestData,
    updateAnalysisData,
    {deep: true}
)
    

const selectedChart = ref('BackTestChart')
const chartSelectedOption = ref<SelectProps['options']>([
    {
        value: 'BackTestChart',
        label: '回测概览'
    },
    {
        value: 'ReturnsChart',
        label: '收益表',
    },
    {
        value: 'TradePerformanceTable',
        label: '交易表现表',
    },
    {
        value: 'TradeAnalysisTable',
        label: '交易分析',
    },
    {
        value: 'TradeIndicatorsTable',
        label: '风险/表现比表'
    },
    {
        value: 'TradeProfitsDistributionChart',
        label: '交易盈亏分布',
    },
    {
        value: 'TradeListTable',
        label: '交易清单',
    }

])

onMounted(()=> {
    const start = backTestResult.dayData.date[0]
    const end = backTestResult.dayData.date[backTestResult.dayData.date.length-1]
    selectedTimeRage.value = [dayjs(start), dayjs(end)]
    updateAnalysisData()
})

</script>