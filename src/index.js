import error from './error/index'
import performance from './performance/index'
import behavior from './behavior/index'
import { setConfig } from './config'
import { onBeforeunload, onHidden } from './utils/utils'
import { report } from './utils/report'
import { getCache, clearCache } from './utils/cache'

const monitor = {
    init(options = {}) {
        // 生成配置
        setConfig(options)
        // 处理报错信息并上传
        error()
        // 处理性能指标参数并上传
        performance()
        behavior();

        // 当页面进入后台或关闭前时，将所有的 cache 数据进行上报
        [onBeforeunload, onHidden].forEach(fn => {
            fn(() => {
                const data = getCache()
                if (data.length) {
                    report(data, true)
                    clearCache()
                }
            })
        })
    },
    report,
}

export default monitor