// 不明白为什么要使用原型，可能是加快执行速度吧
export const originalProto = XMLHttpRequest.prototype
export const originalOpen = originalProto.open
export const originalSend = originalProto.send