declare module '*.json' {
    const value: any;
    export default value;
}

declare module '@/assets/stockInfo.json' {
    const value: { code: string, board_log: number, region: string, name: string }[]
    export default value
}

// 或为特定文件添加精确类型
declare module '@/assets/backTestResult.json' {
    export interface BackTestResult {
        initialBalance: number,
        profitsPCT: number[],
        tradingFees: number,
        riskFreeCash: number,
        records: {
            tradeType: number
            code: string,
            openDate: string
            closeDate: string
            openPrice: number
            closePrice: number
            size: number
            holdCount: number
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
            },
            tradingFee: number
        }[],
        dayData: {
            date: string[],
            cash: number[],
            balance: number[],
            drawdown: number[],
            returns: number[],
        },
        monthData: {
            date: string[],
            cash: number[],
            balance: number[],
            drawdown: number[],
            returns: number[],
        },
        yearData: {
            date: string[],
            cash: number[],
            balance: number[],
            drawdown: number[],
            returns: number[],
        },
    }
    const value: BackTestResult;
    export default value;
}