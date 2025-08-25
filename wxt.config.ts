import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    name: "文本模板",
    description: "一个 Chrome 扩展，帮助您创建和快速输入文本模板。",
    permissions: [
      "contextMenus",
      "activeTab",
      "storage",
      "sidePanel",
      "tabs",
      "scripting",
    ],
    side_panel: {
      default_path: "sidepanel.html",
    },
  },
});
