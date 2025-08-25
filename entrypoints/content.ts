export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    // 监听输入框聚焦事件
    document.addEventListener("focusin", (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        // 发送消息到后台脚本，通知输入框已聚焦
        browser.runtime.sendMessage({
          action: "inputFocused",
          elementId: event.target.id || "",
        });
      }
    });

    // 监听右键菜单点击事件
    document.addEventListener("contextmenu", (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        // 发送消息到后台脚本，通知右键菜单被点击
        browser.runtime.sendMessage({
          action: "contextMenuClicked",
          elementId: event.target.id || "",
        });
      }
    });
  },
});
