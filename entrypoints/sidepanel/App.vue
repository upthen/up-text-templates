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
      <h2>文本模板</h2>
      <div class="import-section">
        <input
          type="file"
          ref="fileInput"
          accept=".json"
          @change="handleFileImport"
          style="display: none"
        />
        <button @click="triggerFileSelect" class="import-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
            />
            <path
              d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"
            />
          </svg>
          导入JSON模板
        </button>
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
            <div class="template-header">
              <div class="template-title">{{ template.title }}</div>
              <div class="template-category">{{ template.category }}</div>
            </div>
            <div class="template-preview">
              {{ template.text.substring(0, 100)
              }}{{ template.text.length > 100 ? "..." : "" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <button @click="backToList" class="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
            />
          </svg>
          返回
        </button>
        <h3>{{ selectedTemplate.title }}</h3>
      </div>
      <div class="detail-content">
        <div class="detail-field">
          <label>分类:</label>
          <span class="category-tag">{{ selectedTemplate.category }}</span>
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
  width: 350px;
  min-height: 400px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background-color: #f8f9fa;
}

h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

/* 列表视图样式 */
.import-section {
  margin-bottom: 20px;
  text-align: center;
}

.import-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.import-button:hover {
  background-color: #359c6d;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.import-button:active {
  transform: translateY(0);
}

.loading,
.error,
.no-templates {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-size: 14px;
}

.error {
  color: #e74c3c;
}

.templates-list {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 5px;
}

/* 滚动条样式 */
.templates-list::-webkit-scrollbar {
  width: 6px;
}

.templates-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.templates-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.templates-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.template-item {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.template-item:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.template-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 15px;
}

.template-category {
  background-color: #edf2f7;
  color: #4a5568;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.template-preview {
  color: #718096;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 详情视图样式 */
detail-view {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 20px;
}

.back-button {
  background-color: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  margin-bottom: 15px;
}

.back-button:hover {
  background-color: #e2e8f0;
}

.detail-header h3 {
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
  font-size: 18px;
}

.detail-content {
  padding: 10px 0;
}

.detail-field {
  margin-bottom: 20px;
}

.detail-field label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 14px;
}

.category-tag {
  background-color: #4299e1;
  color: white;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
  display: inline-block;
}

.template-text {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  color: #2d3748;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>
