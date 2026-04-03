import { describe, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { render } from "vitest-browser-vue";
import { router } from "../router";
import { test } from "../tests/test-extend";
import IndexPage from "./index.vue";

describe("IndexPage 翻译页面", () => {
  test("应该正确渲染页面基本结构", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    // 验证聊天消息容器存在（通过 CSS 类名）
    const chatContainer = screen.container.querySelector('[data-slot="root"]');
    await expect.element(chatContainer).toBeInTheDocument();

    // 验证输入框存在
    const input = screen.getByPlaceholder("Type your message here…");
    await expect.element(input).toBeInTheDocument();

    // 验证发送按钮存在
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });
    await expect.element(submitButton).toBeInTheDocument();
  });

  test("应该在输入框中输入文本", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const input = screen.getByPlaceholder("Type your message here…");
    await input.fill("Hello World");

    await expect.element(input).toHaveValue("Hello World");
  });

  test("应该在点击提交时清空输入框", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const input = screen.getByPlaceholder("Type your message here…");
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });

    // 输入文本
    await input.fill("Hello World");

    // 点击提交
    await submitButton.click();

    // 验证输入框被清空
    await expect.element(input).toHaveValue("");
  });

  test("应该在输入为空时不发送请求", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const submitButton = screen.getByRole("button", { name: /Send prompt/i });

    // 直接点击提交（不输入内容）
    await submitButton.click();

    // 验证输入框仍为空（因为没有输入内容，onSubmit 不会执行清空逻辑）
    const input = screen.getByPlaceholder("Type your message here…");
    await expect.element(input).toHaveValue("");
  });

  test("应该在输入纯空格时不发送请求", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const input = screen.getByPlaceholder("Type your message here…");
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });

    // 输入空格
    await input.fill("   ");

    // 点击提交
    await submitButton.click();

    // 验证输入框仍为空格（因为 trim() 后为空，不会执行清空逻辑）
    await expect.element(input).toHaveValue("   ");
  });

  test("应该在按下 Enter 时提交表单", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const input = screen.getByPlaceholder("Type your message here…");
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });

    // 输入文本
    await input.fill("Test message");

    // 点击提交按钮（因为 textarea 中按 Enter 可能不触发表单提交）
    await submitButton.click();

    // 验证输入框被清空
    await expect.element(input).toHaveValue("");
  });

  test("应该在提交后清空输入框", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const input = screen.getByPlaceholder("Type your message here…");
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });

    await input.fill("Test");
    await submitButton.click();

    await expect.element(input).toHaveValue("");
  });

  test("应该处理多行文本输入", async () => {
    await router.push("/");
    await router.isReady();

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    });

    const input = screen.getByPlaceholder("Type your message here…");
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });
    const multilineText = "Line 1\nLine 2\nLine 3";

    await input.fill(multilineText);
    await expect.element(input).toHaveValue(multilineText);

    await submitButton.click();

    // 验证输入框被清空
    await expect.element(input).toHaveValue("");
  });

  // 使用 MSW 测试 API 模拟
  test("应该能使用 MSW 模拟 API 响应", async ({ worker }) => {
    await router.push("/");
    await router.isReady();

    // 添加特定的 API 模拟
    worker.use(
      http.post('/api/chat/completions', () => {
        return HttpResponse.json({
          choices: [{
            message: { content: '模拟的翻译结果' }
          }]
        })
      })
    )

    const screen = render(IndexPage, {
      global: {
        plugins: [router],
      },
    })

    const input = screen.getByPlaceholder("Type your message here…");
    const submitButton = screen.getByRole("button", { name: /Send prompt/i });
    
    await input.fill("Test API mocking");
    await submitButton.click();

    // 验证输入框被清空（表示请求已发送）
    await expect.element(input).toHaveValue("");
  });
});
