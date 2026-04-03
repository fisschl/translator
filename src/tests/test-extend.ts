import { test as testBase } from 'vitest'
import { worker } from './mocks/browser'

export const test = testBase.extend({
  worker: [
    async ({}, use) => {
      // 在测试前启动 worker，设置严格模式：未处理的请求报错
      await worker.start({
        onUnhandledRequest: 'error'
      })

      // 将 worker 对象暴露到测试上下文中
      await use(worker)

      // 清除测试中添加的 handler，防止影响其他测试
      worker.resetHandlers()

      // 测试结束后停止 worker
      worker.stop()
    },
    {
      auto: true,
    },
  ],
})
