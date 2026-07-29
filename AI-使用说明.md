# AI 使用说明

## 1. 使用的 AI 工具

- **Claude Code**：用于生成网站代码（HTML/CSS/JS）、部署配置、调试排查
- **Qwen API（通义千问）**：网站中 RAG 问答模块的后端大模型

## 2. AI 帮助完成的工作

- 生成个人介绍网站的整体框架（HTML 结构、CSS 样式、JS 交互逻辑）
- 编写 RAG 问答模块的前端代码（对话 UI、流式请求、错误处理）
- 编写后端 API 函数代码（Cloudflare Pages Functions / 腾讯云函数格式）
- 配置部署相关文件（vercel.json、.gitignore、.nojekyll）
- 排查部署问题（CORS 跨域、浏览器缓存、平台兼容性）

## 3. 自己手动修改的内容

- **RAG 模块设计**：将简历全文作为知识源注入 system prompt，实现基于个人简历的问答能力，无需向量数据库，采用 naive RAG 方案
- **API 对接**：手动配置 Qwen API 的调用参数（模型选择、温度、token 限制），调试请求格式使其兼容 Dashscope 接口
- **简历内容整理**：将 PDF 简历内容提取并结构化，写入 RAG 知识库
- **页面内容填充**：根据简历手动调整各区块的文案、标签、排版

## 4. 遇到的问题及解决方式

| 问题 | 原因 | 解决方式 |
|------|------|----------|
| Vercel 无法访问 | 国内网络限制 | 改用 GitHub Pages 部署静态页面 |
| Cloudflare Workers 响应超时 | workers.dev 域名在国内被限制 | 改为前端直连 Qwen API，去掉后端依赖 |
| 浏览器请求旧接口返回 405 | 浏览器缓存了旧版 JS 文件 | 重命名文件 + 添加版本参数 + 设置 no-cache 头 |
| Qwen API 调用报错 | 请求体格式不兼容 | 通过 curl 逐字段测试，修正 model 名称和参数格式 |

## 5. 最终网站链接

**https://returnqian.github.io**
