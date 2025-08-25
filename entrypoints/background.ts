export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  // 定义默认自定义文本数组
  let customTexts = [];

  // 从存储中加载自定义文本
  browser.storage.local.get(["customTemplates"]).then((result) => {
    console.log("从存储中获取的模板:", result);
    if (result.customTemplates) {
      customTexts = result.customTemplates;
      console.log("更新后的customTexts:", customTexts);
      updateContextMenu();
    }
  });

  // 更新右键菜单
  function updateContextMenu() {
    console.log("开始更新右键菜单，当前模板:", customTexts);
    // 清除现有的菜单项
    browser.contextMenus.removeAll().then(() => {
      // 按分类组织菜单项
      const categories: { [key: string]: typeof customTexts } = {};

      customTexts.forEach((item) => {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push(item);
      });

      console.log("分类后的菜单项:", categories);

      // 为每个分类创建父菜单项
      Object.keys(categories).forEach((category) => {
        browser.contextMenus.create({
          id: `category_${category}`,
          title: category,
          contexts: ["editable"],
          documentUrlPatterns: ["<all_urls>"],
        });

        // 为每个文本创建子菜单项
        categories[category].forEach((item) => {
          browser.contextMenus.create({
            id: item.id,
            parentId: `category_${category}`,
            title: item.title,
            contexts: ["editable"],
            documentUrlPatterns: ["<all_urls>"],
          });
        });
      });

      console.log("右键菜单更新完成");
    });
  }

  // 监听右键菜单点击事件
  browser.contextMenus.onClicked.addListener((info, tab) => {
    console.log("右键菜单点击事件:", info);
    // 查找匹配的自定义文本
    const customText = customTexts.find((item) => item.id === info.menuItemId);

    if (customText && tab?.id) {
      console.log("找到匹配的文本:", customText);
      // 在当前活动标签页中执行脚本，插入对应的自定义文本
      browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: insertText,
        args: [customText.text],
      });
    } else {
      console.log("未找到匹配的文本");
    }
  });

  // 监听内容脚本发送的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("收到消息:", message);
    if (message.action === "inputFocused") {
      console.log("输入框聚焦:", message.elementId);
    } else if (message.action === "contextMenuClicked") {
      console.log("右键菜单点击:", message.elementId);
    } else if (message.action === "importTemplates") {
      // 处理模板导入
      console.log("导入模板:", message.templates);
      customTexts = message.templates;
      browser.storage.local.set({ customTemplates: customTexts }).then(() => {
        console.log("模板已保存到存储");
        updateContextMenu();
      });
    }
  });

  // 初始化菜单
  updateContextMenu();

  // 插入文本的函数
  function insertText(text: string) {
    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement
    ) {
      const startPos = activeElement.selectionStart || 0;
      const endPos = activeElement.selectionEnd || 0;
      const before = activeElement.value.substring(0, startPos);
      const after = activeElement.value.substring(endPos);
      activeElement.value = before + text + after;

      // 设置光标位置到插入文本之后
      const newCursorPos = startPos + text.length;
      activeElement.setSelectionRange(newCursorPos, newCursorPos);

      // 触发输入事件，使其他监听器能够响应
      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
});
