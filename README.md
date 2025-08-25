# up-text-templates

一个 Chrome 扩展，帮助您创建和快速输入文本模板。

## 功能特性

- 创建和管理文本模板
- 通过右键菜单快速插入预定义文本
- 支持按分类组织模板
- 支持从 JSON 文件导入模板
- 在任何可编辑元素中使用（输入框、文本域等）

## 安装

1. 克隆或下载此仓库
2. 在终端中运行 `npm install` 安装依赖
3. 运行 `npm run dev` 启动开发服务器
4. 在 Chrome 浏览器中打开 `chrome://extensions/`
5. 启用 "开发者模式"
6. 点击 "加载已解压的扩展程序" 并选择项目目录

## 使用方法

### 管理模板

1. 点击浏览器工具栏中的扩展图标打开侧边栏
2. 点击 "导入 JSON 模板" 按钮
3. 选择一个符合格式的 JSON 文件
4. 模板将自动加载并在右键菜单中可用

### 插入文本

1. 在任何可编辑元素中右键点击
2. 在上下文菜单中找到对应的模板分类
3. 选择要插入的模板
4. 文本将自动插入到光标位置

## 模板格式

模板文件应为 JSON 格式，包含一个模板对象数组。每个模板对象应具有以下字段：

- `id`: 模板的唯一标识符
- `title`: 模板的显示名称
- `text`: 要插入的实际文本内容
- `category`: 模板的分类

示例模板文件 (`user-templates.json`)：

```json
[
  {
    "id": "greeting1",
    "title": "bug修复模板",
    "text": "Problem Analysis: 功能缺陷\nSolved Solution: 修复功能缺陷\nImpact Analysis: no impact to other components for the function is internal used\nSolved Version:\nTest Instruction:\nredo the test\nUnit Test Case No./Name:\nChangeSet:\nReviewer:",
    "category": "BugFix"
  },
  {
    "id": "LGTM",
    "title": "LGTM",
    "text": "LGTM",
    "category": "CodeReview"
  }
]
```

## 权限说明

此扩展需要以下权限：

- `contextMenus`: 创建和管理右键菜单项
- `activeTab`: 访问当前活动标签页以插入文本
- `storage`: 存储和检索用户定义的模板
- `sidePanel`: 显示侧边栏界面
