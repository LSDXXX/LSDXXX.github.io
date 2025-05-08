<template>
    <a-table :columns="columns" :data-source="data"  bordered >
    <template #bodyCell="{ column, text ,record}">
        <template v-if="column.dataIndex == 'jumpTo'">
            <button @click="onJumpToClicked(record.key)">跳转</button>
        </template>
        <template v-else>
            <div style="white-space: pre-line; padding: 0; margin: 0; line-height: 1.2;"> {{ text }}</div>
        </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type JumpToFunction = (stock: string, date: string) => void

const onJumpToClicked = (key: string)=> {
    const index = data.value?.findIndex((value) => {
        if(value.key == key) {
            return true
        }
        return false
    })
    if(index == -1|| !index) {
        return
    }
    const value =  data.value![index]
    props.jumpTo(value.code, value.datetime)
}

interface TradeRecord {
    tradeType: number
    code: string,
    openDate: string
    closeDate: string
    openPrice: number
    closePrice: number
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
}

interface Props {
    records: TradeRecord[]
    jumpTo: JumpToFunction
}

const formatValue = (v: {value: number, pct: number})=> {
    let s = ''
    if(v.value !== undefined) {
        s = `${v.value.toFixed(2)}`
    }
    if(v.pct !== undefined) {
        s = s + (s.length > 0? '\n': '') + `${(v.pct*100).toFixed(2)}%`
    }
    return s
}

const props = defineProps<Props>()

const getTableData = (records: TradeRecord[]) => {
    let data: any[]  = []
    records.forEach((record: TradeRecord, index: number) => {
        data.push({
            key: `${index*2+1}`,
            tradeId: `${index+1}`,
            code: record.code,
            type: record.tradeType == 1? '多头入场': '空头入场',
            datetime: record.openDate, 
            price: record.openPrice,
            contracts: record.size,
            profit: formatValue(record.profit),
            maxProfit: formatValue(record.maxProfit),
            maxLoss: formatValue(record.maxLoss),
        })

        data.push({
            key: `${index*2+2}`,
            tradeId: null,
            type: record.tradeType == 1? '多头出场': '空头出场',
            datetime: record.closeDate,
            code: record.code,
            price: record.closePrice,
        })
    })
    return data
}

const sharedOnCell = (_: any, index: number) => {
  if (index % 2 === 1 ) {
    return { rowSpan: 0 };
  } 
  return {rowSpan: 2}
};

const columns = [
    {
      title: '交易 #',
      dataIndex: 'tradeId',
      key: 'tradeId',
      customCell: sharedOnCell,
      customRender: ({ text }: { text: number | null }) => text || '',
    },
    {
        title: '代码',
        dataIndex: 'code',
        key: 'code',
        customCell: sharedOnCell,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '日期/时间',
      dataIndex: 'datetime',
      key: 'datetime',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '合约',
      dataIndex: 'contracts',
      key: 'contracts',
      customRender: ({ text }: { text: number | undefined }) => text || '',
      customCell: sharedOnCell,
    },
    {
      title: '获利',
      dataIndex: 'profit',
      key: 'profit',
      customCell: sharedOnCell,
    },
    //{
    //  title: '累计获利',
    //  dataIndex: 'cumulativeProfit',
    //  key: 'cumulativeProfit',
    //  customCell: sharedOnCell,
    //},
    {
        title: '最大交易获利',
        dataIndex: 'maxProfit',
        key: 'maxProfit',
        customCell: sharedOnCell,
    }, 
    {
        title: '最大交易亏损',
        dataIndex: 'maxLoss',
        key: 'maxLoss',
        customCell: sharedOnCell,
    },
    {
        title: '滚动到k线',
        dataIndex: 'jumpTo',
        key: 'jumpTo',
    },
];

let data = ref<any[]>()

onMounted(() => {
    data.value = getTableData(props.records)
})

</script>