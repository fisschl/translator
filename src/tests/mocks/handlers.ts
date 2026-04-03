import { http, HttpResponse } from 'msw'

// 模拟翻译 API 响应
export const handlers = [
  http.post('/api/chat/completions', async ({ request }) => {
    const body = await request.json()
    const messages = body?.messages || []
    const lastMessage = messages[messages.length - 1]
    
    // 模拟流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // 模拟响应文本
        const responseText = '这是翻译后的内容'
        
        // 发送数据块
        const chunk = {
          choices: [{
            delta: { content: responseText },
            index: 0
          }]
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })
    
    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  })
]
