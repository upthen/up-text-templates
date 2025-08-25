<script lang="ts" setup>
import { ref, onMounted } from "vue";

interface Template {
  id: string;
  title: string;
  text: string;
  category: string;
}

const fileInput = ref<HTMLInputElement | null>(null);
const templates = ref<Template[]>([]);
const selectedTemplate = ref<Template | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// 获取模板数据
async function fetchTemplates() {
  try {
    loading.value = true;
    error.value = null;

    // 从存储中获取模板数据
    const result = await browser.storage.local.get(["customTemplates"]);
    if (result.customTemplates) {
      templates.value = result.customTemplates;
    } else {
      // 如果存储中没有模板，则使用默认模板
      templates.value = [];
    }
  } catch (err) {
    error.value = "获取模板数据失败";
    console.error("获取模板数据时出错:", err);
  } finally {
    loading.value = false;
  }
}

// 处理文件导入
function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedTemplates = JSON.parse(content);

        // 验证导入的模板格式
        if (!Array.isArray(importedTemplates)) {
          throw new Error("模板文件格式不正确，应该是一个数组");
        }

        // 验证每个模板项的必需字段
        for (const template of importedTemplates) {
          if (
            !template.id ||
            !template.title ||
            !template.text ||
            !template.category
          ) {
            throw new Error("模板项缺少必需字段(id, title, text, category)");
          }
        }

        // 发送消息到后台脚本
        browser.runtime.sendMessage({
          action: "importTemplates",
          templates: importedTemplates,
        });

        // 更新本地数据
        templates.value = importedTemplates;

        // 清空文件输入框，允许重复导入同一个文件
        if (target) {
          target.value = "";
        }

        alert("模板导入成功！");
      } catch (error) {
        console.error("解析JSON文件时出错:", error);
        alert(
          "导入失败：" +
            (error instanceof Error ? error.message : "无效的JSON文件")
        );
      }
    };
    reader.readAsText(file);
  }
}

// 触发文件选择对话框
function triggerFileSelect() {
  fileInput.value?.click();
}

// 显示模板详情
function showTemplateDetail(template: Template) {
  selectedTemplate.value = template;
}

// 返回列表视图
function backToList() {
  selectedTemplate.value = null;
}

// 组件挂载时获取模板数据
onMounted(() => {
  fetchTemplates();
});
</script>

<template>
  <div class="popup-container">
    <!-- 列表视图 -->
    <div v-if="!selectedTemplate" class="list-view">
      <h2>文本模板插件</h2>
      <div class="import-section">
        <input
          type="file"
          ref="fileInput"
          accept=".json"
          @change="handleFileImport"
          style="display: none"
        />
        <button @click="triggerFileSelect">导入JSON模板</button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div v-if="templates.length === 0" class="no-templates">
          暂无模板数据
        </div>
        <div v-else class="templates-list">
          <div
            v-for="template in templates"
            :key="template.id"
            class="template-item"
            @click="showTemplateDetail(template)"
          >
            <div class="template-title">{{ template.title }}</div>
            <div class="template-category">{{ template.category }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <button @click="backToList" class="back-button">&larr; 返回</button>
        <h3>{{ selectedTemplate.title }}</h3>
      </div>
      <div class="detail-content">
        <div class="detail-field">
          <label>分类:</label>
          <span>{{ selectedTemplate.category }}</span>
        </div>
        <div class="detail-field">
          <label>内容:</label>
          <div class="template-text">{{ selectedTemplate.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-container {
  width: 300px; /* 调整为适合侧边栏的宽度 */
  min-height: 300px;
  padding: 20px;
}

/* 列表视图样式 */
.import-section {
  margin-bottom: 20px;
  text-align: center;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #359c6d;
}

.loading,
.error,
.no-templates {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #e74c3c;
}

.templates-list {
  max-height: 300px;
  overflow-y: auto;
}

.template-item {
  padding: 12px 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-item:hover {
  background-color: #f5f5f5;
  border-color: #ddd;
}

.template-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.template-category {
  font-size: 12px;
  color: #666;
}

/* 详情视图样式 */
.detail-view {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 20px;
}

.back-button {
  background-color: #eee;
  color: #333;
  padding: 5px 10px;
  font-size: 12px;
  margin-bottom: 10px;
}

.back-button:hover {
  background-color: #ddd;
}

.detail-content {
  padding: 10px 0;
}

.detail-field {
  margin-bottom: 15px;
}

.detail-field label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.template-text {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
