import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建浏览器模式的 MSW worker
export const worker = setupWorker(...handlers)
