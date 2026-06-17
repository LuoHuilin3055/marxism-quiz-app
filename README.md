# 马克思主义刷题小程序

一个基于 React + Vite + TypeScript 的纯前端刷题网页应用，题库来自本地 `马克思主义.pdf` 提取结果。应用不需要后端，刷题记录、错题本、收藏和历史记录都保存在当前浏览器的 `localStorage` 中。

在线地址：

```text
https://LuoHuilin3055.github.io/marxism-quiz-app/
```

## 功能

- 顺序刷题和随机刷题
- 单选题、多选题答题
- 点击或提交后立即显示对错
- 显示正确答案和解析
- 上一题、下一题切换
- 自动记录错题本
- 收藏题目
- 首页展示总题数、已完成、未完成、正确率、错题数、收藏数
- 历史记录页面，可查看最近答题并跳回对应题目
- 统计分析页面，包含每日刷题数量、正确/错误占比、题号区间正确率、错题排行
- 数据刷新后不丢失

## 手机使用

手机浏览器打开：

```text
https://LuoHuilin3055.github.io/marxism-quiz-app/
```

然后可以添加到手机桌面：

- iPhone Safari：点击分享按钮，选择“添加到主屏幕”
- Android Chrome/Edge：点击右上角菜单，选择“添加到主屏幕”或“安装应用”

注意：刷题数据保存在手机浏览器本地。换手机、换浏览器或清除浏览器数据后，记录不会自动同步。

## 本地运行

进入项目目录：

```powershell
cd "C:\Users\Huilin Luo\Desktop\MY\marxism-quiz-app"
```

安装依赖：

```powershell
npm install
```

启动开发服务器：

```powershell
npm run dev
```

电脑浏览器访问：

```text
http://localhost:5173/
```

如果手机和电脑在同一个 Wi-Fi 下，也可以用电脑局域网 IP 访问开发服务器，例如：

```text
http://电脑局域网IP:5173/
```

## 构建

```powershell
npm run build
```

构建产物会生成到：

```text
dist/
```

由于项目部署在 GitHub Pages 的子路径 `/marxism-quiz-app/` 下，`vite.config.ts` 中配置了：

```ts
base: "/marxism-quiz-app/"
```

如果以后仓库名改变，需要同步修改这个 `base`。

## 部署到 GitHub Pages

项目已经配置 GitHub Actions：

```text
.github/workflows/deploy.yml
```

每次推送到 `main` 分支后，会自动执行：

```text
npm ci
npm run build
发布 dist/ 到 GitHub Pages
```

手动推送：

```powershell
git add .
git commit -m "Update app"
git push origin main
```

部署状态查看：

```text
https://github.com/LuoHuilin3055/marxism-quiz-app/actions
```

## 项目结构

```text
src/
  data/
    questions.json          # PDF 提取后的题库
  pages/
    Home.tsx                # 首页
    Practice.tsx            # 刷题页
    WrongBook.tsx           # 错题本
    Favorites.tsx           # 收藏题
    History.tsx             # 历史记录
    Statistics.tsx          # 可视化统计
  components/
    QuestionCard.tsx        # 题目卡片
    ProgressBar.tsx         # 进度条
    StatsCard.tsx           # 统计卡片
  utils/
    storage.ts              # localStorage 读写
    questionUtils.ts        # 题目和统计工具函数
```

PDF 提取脚本：

```text
scripts/extract_questions.py
```

重新从 PDF 生成题库：

```powershell
python .\scripts\extract_questions.py
```

## 常见问题

### 手机打开是 404

确认地址必须完整包含仓库名：

```text
https://LuoHuilin3055.github.io/marxism-quiz-app/
```

如果刚刚部署完成，等待几十秒后刷新页面。

### 页面空白或样式丢失

检查 `vite.config.ts` 中的 `base` 是否与仓库名一致：

```ts
base: "/marxism-quiz-app/"
```

### 刷题记录不见了

记录保存在当前浏览器的 `localStorage`。以下情况会导致记录消失：

- 清理浏览器缓存或网站数据
- 换浏览器
- 换手机
- 使用无痕模式

## 技术栈

- React
- Vite
- TypeScript
- Recharts
- GitHub Pages
- GitHub Actions
