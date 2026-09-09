# 作业答案库 — 静态部署包

## 架构一览
| 位置 | 内容 | 说明 |
|------|------|------|
| GitHub `main` | 源码、构建脚本、Books 原始目录 (`books/`) | 只有这里存源文件 |
| GitHub `data` 分支 | `search-index.json` | 前端运行时 `fetch` 实时检索 |
| GitHub Pages | `dist/` 全部文件 | 纯静态站点，无后端 |

## 一键初始化
```bash
# 1. 解压/克隆到本地
cd answer-site

# 2. 安装依赖并本地验证（可选）
npm ci && npm run build   # 生成 dist/
npx serve dist            # 预览

# 3. 在 GitHub 新建同名仓库，然后
git init
git add .
git commit -m "init: static answer site"
git branch -M main
git remote add origin git@github.com:你的用户名/answer-site.git
git push -u origin main
```

## GitHub Pages 配置
1. 进仓库 **Settings → Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存。以后每次 `push main`，Actions 跑完会自动把 `dist/` 发布到 Pages。

## 日常维护（加书/改书）
```bash
# 把新书文件夹扔进 books/
git add books/《新书名》/
git commit -m "add 新书"
git push
```
**自动完成**：构建 → GitHub Pages 部署 → `data` 分支索引更新 → 用户刷新即见。

## 前端关键常量（如需改域名/仓库）
`src/assets/app.js` 顶部：
```js
const REPO = 'haoyiheng/answer-site';   // ← 改成实际 user/repo
```
