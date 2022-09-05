import { lazyReportCache } from '../utils/report'
import { onBFCacheRestore, getPageURL } from '../utils/utils'
import config from '../config'

// 闭包的思路写 并且拿到全局的config已经处理好的 但是我认为这样不好 会给自己增加心智负担 后期改成传递参数的形式
export default function error() {
    // 这里利用了切片编程 跟vue2监听数组的方式改写本身方法思路一样
    const oldConsoleError = window.console.error 
    window.console.error = (...args) => { 
        // 保证了之前的方式
        oldConsoleError.apply(this, args)
        // 新增的处理
        lazyReportCache({
            type: 'error',
            subType: 'console-error',
            // performance是全局对象可以直接引用在v8引擎下
            startTime: performance.now(),
            errData: args,
            pageURL: getPageURL(),
        })
    }

    // 捕获资源加载失败错误 js css img...
    window.addEventListener('error', e => {
        const target = e.target
        if (!target) return

        if (target.src || target.href) {
            const url = target.src || target.href
            lazyReportCache({
                url,
                type: 'error',
                subType: 'resource',
                startTime: e.timeStamp,
                html: target.outerHTML,
                resourceType: target.tagName,
                paths: e.path.map(item => item.tagName).filter(Boolean),
                pageURL: getPageURL(),
            })
        }
    }, true)

    // 监听 js 错误
    window.onerror = (msg, url, line, column, error) => {
        lazyReportCache({
            msg,
            line,
            column,
            error: error.stack,
            subType: 'js',
            pageURL: url,
            type: 'error',
            startTime: performance.now(),
        })
    }

    // 监听 promise 错误 缺点是获取不到列数据 后期补充优化方案
    window.addEventListener('unhandledrejection', e => {
        lazyReportCache({
            reason: e.reason?.stack,
            subType: 'promise',
            type: 'error',
            startTime: e.timeStamp,
            pageURL: getPageURL(),
        })
    })
    // 这个就要对接上vue的报错了，vue会给我们提供一个回调函数的写法就是下面的这样
    // 思路拓展一下 react的不也可以吗
    if (config.vue?.Vue) {
        config.vue.Vue.config.errorHandler = (err, vm, info) => {
            console.error(err)

            lazyReportCache({
                info,
                error: err.stack,
                subType: 'vue',
                type: 'error',
                startTime: performance.now(),
                pageURL: getPageURL(),
            })
        }
    }

    // 这里表示也要检查缓存的页面数据
    onBFCacheRestore(() => {
        error()
    })
}