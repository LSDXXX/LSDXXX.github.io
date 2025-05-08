
import dayjs, { Dayjs } from 'dayjs';
import * as math from 'mathjs';

/**
 * 获取日期范围内数据的开始和结束索引
 * @param data 原始数据数组（假设已按日期排序）
 * @param startDate 开始日期字符串
 * @param endDate 结束日期字符串
 * @returns { startIndex: number; endIndex: number } 开始和结束索引（包含）
 */
export function getDateRangeIndexes(
    data: string[],
    startDate: Dayjs,
    endDate: Dayjs
): { startIndex: number; endIndex: number } {
    const start = startDate;
    const end = endDate;

    if (!start.isValid() || !end.isValid()) {
        throw new Error('Invalid date format');
    }

    // 使用二分查找提高效率（假设数组已按日期排序）
    let startIndex = 0;
    let endIndex = data.length - 1;

    // 查找第一个 >= startDate 的索引
    while (startIndex < data.length && dayjs(data[startIndex]).isBefore(start)) {
        startIndex++;
    }

    // 查找最后一个 <= endDate 的索引
    while (endIndex >= 0 && dayjs(data[endIndex]).isAfter(end)) {
        endIndex--;
    }

    // 如果没有符合条件的范围
    if (startIndex > endIndex) {
        return { startIndex: -1, endIndex: -1 };
    }

    return { startIndex, endIndex };
}

const riskFreeRate: number = 0.03
const monthRiskFreeRate = (math.pow(1 + riskFreeRate, 1 / 12) as number) - 1

export function sharpRatio(monthReturns: number[]) {
    let m = math.mean(monthReturns) - monthRiskFreeRate
    let s = math.std(monthReturns, 'unbiased') as number
    return ((m * 12) / (Math.sqrt(12) * s))
}

export function sortinoRatio(monthReturns: number[]) {
    let excess_returns = monthReturns.map((value) => {
        return value - monthRiskFreeRate
    })

    let downside_returns = excess_returns.filter((value) => {
        return value < 0
    })
    if (downside_returns.length == 0) {
        return undefined
    }
    let ds = math.std(downside_returns, 'unbiased') as number
    let m = math.mean(excess_returns)
    return (m / ds) * Math.sqrt(12)
}

// export function 