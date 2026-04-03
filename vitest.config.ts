import { playwright } from "@vitest/browser-playwright";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

const testConfig = defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        {
          browser: "chromium",
          viewport: { width: 1920, height: 1080 },
        },
      ],
    },
  },
});

export default mergeConfig(viteConfig, testConfig);
