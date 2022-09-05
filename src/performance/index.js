import observeEntries from './observeEntries'
import observePaint from './observePaint'
import observeLCP from './observeLCP'
import observeCLS from './observeCLS'
import observeFID from './observeFID'
import observerLoad from './observerLoad'
import observeFirstScreenPaint from './observeFirstScreenPaint'
import xhr from './xhr'
import fetch from './fetch'
import fps from './fps'
import onVueRouter from './onVueRouter'
import config from '../config'
// 性能的监控
export default function performance() {
    // 监控上报页面指标信息
    observeEntries()
    observePaint()
    observeLCP()
    observeCLS()
    observeFID()
    xhr()
    fetch()
    fps()
    observerLoad()
    observeFirstScreenPaint()

    if (config.vue?.Vue && config.vue?.router) {
        onVueRouter(config.vue.Vue, config.vue.router)
    }
}