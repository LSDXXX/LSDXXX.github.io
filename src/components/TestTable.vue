<template>
  <a-table
    :columns="columns"
    :dataSource="data"
    bordered
    size="middle"
    :pagination="false"
    :rowClassName="setRowClassName"
  />
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import { Table } from 'ant-design-vue';

interface TradeData {
  key: string;
  tradeId: number | null;
  type: string;
  signal: string;
  datetime: string;
  price: string;
  contracts?: number;
  profit: string;
  cumulativeProfit: string;
  colSpan?: number
  customCell?: any
}

const sharedOnCell = (_: any, index: number) => {
  if (index % 2 === 1 ) {
    return { rowSpan: 0 };
  } else {
    return {rowSpan: 2}
  }
};

    const columns = [
      {
        title: '交易 #',
        dataIndex: 'tradeId',
        key: 'tradeId',
        // colSpan: 0,
        // rowSpan: 2,
        customCell: sharedOnCell,
        customRender: ({ text }: { text: number | null }) => text || '',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '信号',
        dataIndex: 'signal',
        key: 'signal',
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
      },
      {
        title: '获利',
        dataIndex: 'profit',
        key: 'profit',
      },
      {
        title: '累计获利',
        dataIndex: 'cumulativeProfit',
        key: 'cumulativeProfit',
      },
    ];

    const data: TradeData[] = [
      {
        key: '32-exit',
        tradeId: 32,
        type: '空头出场',
        signal: '开盘价',
        datetime: '2025年4月25日',
        price: '128.0 HKD',
        contracts: 7,
        profit: '+217.00 HKD',
        cumulativeProfit: '446.30 HKD',
      },
      {
        key: '32-enter',
        tradeId: 32,
        type: '空头进场',
        signal: 'Enter Short',
        datetime: '2025年3月26日',
        price: '159.0 HKD',
        profit: '+19.50%',
        cumulativeProfit: '17.65',
      },
      {
        key: '31-exit',
        tradeId: 31,
        type: '多头出场',
        signal: 'Exit Long',
        datetime: '2025年3月26日',
        price: '159.0 HKD',
        contracts: 8,
        profit: '-57.60 HKD',
        cumulativeProfit: '229.30 HKD',
      },
      {
        key: '31-enter',
        tradeId: null,
        type: '多头进场',
        signal: 'Enter Long',
        datetime: '2025年2月11日',
        price: '166.2 HKD',
        profit: '-4.33%',
        cumulativeProfit: '-4.45%',
      },
    ];

    const setRowClassName = (record: TradeData) => {
      return record.tradeId === null ? 'trade-sub-row' : '';
    };

</script>

<style scoped>
/* 为子行添加缩进效果 */
.trade-sub-row {
  background-color: #fafafa;
}

.trade-sub-row :deep(td:first-child) {
  padding-left: 32px !important;
}

/* 调整表格整体样式 */
:deep(.ant-table) {
  font-family: 'Arial', sans-serif;
}

:deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  background-color: #f0f2f5;
}
</style>