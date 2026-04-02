import { playwright } from "@vitest/browser-playwright";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

const testConfig = defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});

export default mergeConfig(viteConfig, testConfig);
