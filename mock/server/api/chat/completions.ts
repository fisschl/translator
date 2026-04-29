import { defineHandler } from "nitro";

export default defineHandler(() => {
  return new Response(
    `data: {"type":"start"}

data: {"type":"start-step"}

data: {"type":"text-start","id":"txt-0"}

data: {"type":"text-delta","id":"txt-0","delta":"你好"}

data: {"type":"text-delta","id":"txt-0","delta":"，世界"}

data: {"type":"text-end","id":"txt-0"}

data: {"type":"finish-step"}

data: {"type":"finish","finishReason":"stop"}

data: [DONE]

`,
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Vercel-AI-UI-Message-Stream": "v1",
      },
    },
  );
});
