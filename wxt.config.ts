import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["contextMenus", "activeTab", "storage", "sidePanel"],
    side_panel: {
      default_path: "sidepanel.html",
    },
  },
});
