# Python 基础学练测评考平台

面向高校/培训机构的 Python 基础教学闭环平台，覆盖"学-练-测-评"全流程。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **代码编辑器**: CodeMirror 6
- **Python 运行**: Pyodide (WebAssembly)
- **本地存储**: idb-keyval (IndexedDB)
- **后端**: Cloudflare Workers + Hono + D1

## 核心功能

### 学 (Learn)
- 静态 Markdown 课程章节
- 左侧章节目录树 + 右侧内容区
- 代码块语法高亮

### 练 (Practice)
- 即时评测 (< 500ms 返回结果)
- 多题型支持: output / function / interactive
- 实时反馈与教学提示
- 代码本地持久化 (IndexedDB)

### 考 (Exam)
- 完全隔离模式 (不显示 expected)
- 确定性打乱 (基于 SHA256 种子)
- 双端计时 + 断网保护
- 审计日志 (focus/blur/paste/fullscreen)

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署

项目使用 Cloudflare Pages + Workers 部署。详情见 `wrangler.toml`。
