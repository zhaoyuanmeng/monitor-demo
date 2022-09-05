// 判断是否支持PerformanceObserver 
// PerformanceObserver 可用于获取性能相关的数据，例如首帧fp、首屏fcp、首次有意义的绘制 fmp等等
export function isSupportPerformanceObserver() {
    return !!window.PerformanceObserver
}