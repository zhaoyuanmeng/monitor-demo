export function deepCopy(target) {
    if (typeof target === 'object') {
        const result = Array.isArray(target) ? [] : {}
        for (const key in target) {
            if (typeof target[key] == 'object') {
                result[key] = deepCopy(target[key])
            } else {
                result[key] = target[key]
            }
        }

        return result
    }

    return target
}
// 当一条会话历史记录被执行的时候将会触发页面显示 (pageshow) 事件。
// (这包括了后退 / 前进按钮操作，同时也会在 onload 事件触发后初始化页面时触发)
export function onBFCacheRestore(callback) {
    window.addEventListener('pageshow', event => {
        // persisted表示网页是否来自于缓存
        if (event.persisted) {
            callback(event)
        }
    }, true)
}

export function onBeforeunload(callback) {
    window.addEventListener('beforeunload', callback, true)
}

export function onHidden(callback, once) {
    const onHiddenOrPageHide = (event) => {
        if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
            callback(event)
            if (once) {
                window.removeEventListener('visibilitychange', onHiddenOrPageHide, true)
                window.removeEventListener('pagehide', onHiddenOrPageHide, true)
            }
        }
    }

    window.addEventListener('visibilitychange', onHiddenOrPageHide, true)
    window.addEventListener('pagehide', onHiddenOrPageHide, true)
}

// 就是保证加载后执行callback函数
export function executeAfterLoad(callback) {
    // document.readyState  loading（加载中） interactive（文档已被解析，但是诸如图像，样式表和框架之类的子资源仍在加载） 
    // complete（文档和所有子资源已完成加载。状态表示 load 事件即将被触发） 
    if (document.readyState === 'complete') {
        callback()
    } else {
        const onLoad = () => {
            callback()
            window.removeEventListener('load', onLoad, true)
        }

        window.addEventListener('load', onLoad, true)
    }
}

// 获取当前页面的url
export function getPageURL() {
    return window.location.href 
}