import { originalOpen, originalSend } from './xhr'
import { addCache, getCache, clearCache } from './cache'
import generateUniqueID from '../utils/generateUniqueID'
import config from '../config'

// 判断是不是支持sendBeacon这种模式
export function isSupportSendBeacon() {
    return !!window.navigator?.sendBeacon
}
// 在 unload 事件中，使用 XHR 异步发送数据。这种做法有可能导致服务端未收到数据，浏览器就已经断开连接,，数据就会丢失。
// 虽然AJAX支持同步请求，但这种做法会阻塞页面的跳转，影响用户体验。
// 基于此引入Beacon这种方法，使用navigator.sendBeacon(url, data) 方法会使用户代理在有机会时异步地向服务器发送数据，
// 同时不会延迟页面的卸载或影响下一导航的载入性能。

// 所以这个sendBeacon 如果支持就是sendBeacon方法，如果不支持就是XMLHttpRequest的传统ajax形式
const sendBeacon = isSupportSendBeacon() ? window.navigator.sendBeacon.bind(window.navigator) : reportWithXHR

// 随机获取一个sessionID
const sessionID = generateUniqueID()
// 数据上报  暂时不知道isImmediate这个（立即）有什么用处
export function report(data, isImmediate = false) {
    if (!config.url) {
        console.error('请设置上传 url 地址')
    }

    const reportData = JSON.stringify({
        id: sessionID,
        appID: config.appID,
        userID: config.userID,
        data,
    })
    
    if (isImmediate) {
        sendBeacon(config.url, reportData)
        return
    }
    //window.requestIdleCallback()**方法插入一个函数，这个函数将在浏览器空闲时期被调用。
    // 这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。
    // 函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。
   
    // 这就是为了延迟执行    
    if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
            sendBeacon(config.url, reportData)
        }, { timeout: 3000 })
    } else {
        setTimeout(() => {
            sendBeacon(config.url, reportData)
        })
    }
}

let timer = null
// 加入了防抖的思想 不过每次点击都会把这个错误加入到cache中 只是停顿3s才会上报
export function lazyReportCache(data, timeout = 3000) {
    addCache(data)

    clearTimeout(timer)
    timer = setTimeout(() => {
        const data = getCache()
        if (data.length) {
            report(data)
            clearCache()
        }
    }, timeout)
}

export function reportWithXHR(data) {
    const xhr = new XMLHttpRequest()
    originalOpen.call(xhr, 'post', config.url)
    originalSend.call(xhr, JSON.stringify(data))
}