# 🐱 猫咪养成 - Cat Care Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)

一个轻量化的养猫游戏 Chrome 浏览器插件，采用弹窗式设计，使用小图标进行交互。可以在浏览网页的同时照顾你的虚拟猫咪！

## ✨ 功能特性

### 🍖 猫粮系统
- 手动补充猫粮（一键加满）
- 猫粮每 5 秒自动消耗 1 点
- 猫粮消耗时饥饿值同步减少
- 猫粮为空时饥饿值开始上升

### 🛁 洗澡系统
- 清洁度 ≥ 25 时：10 分钟冷却时间
- 清洁度 < 25 时：可立即洗澡（紧急情况）
- 洗澡恢复清洁度到 100%

### 🎾 逗猫系统
- 逗猫增加饥饿值 +5、疲惫值 +5、清洁度 -5
- 疲惫值达到 80 时自动进入睡眠
- 睡眠时疲惫值自动恢复，归零后醒来

### 📷 自定义猫咪
- 支持上传自己的猫咪照片
- 支持自定义猫咪名字
- 照片和名字自动保存

### 🎈 悬浮球功能
- 每个网页右下角显示可爱的猫咪悬浮球
- 可拖动到任意位置
- 点击展开完整游戏面板

### 😸 状态显示
- 实时显示：饥饿值、疲惫值、清洁度、猫粮
- 猫咪表情根据状态实时变化
- 支持深色模式

## 📦 安装方法

### 方式一：直接下载（推荐）

1. 前往 [Releases](https://github.com/wangzitianwzt-art/CatCareGame/releases) 页面
2. 下载最新版本的 `CatCarePlugin-Release.zip`
3. 解压 ZIP 文件
4. 打开 Chrome，进入 `chrome://extensions/`
5. 启用右上角的「开发者模式」
6. 点击「加载已解压的扩展程序」
7. 选择解压后的 `release/dist` 文件夹
8. 完成！点击工具栏中的猫咪图标开始游戏

### 方式二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/wangzitianwzt-art/CatCareGame.git
cd CatCareGame

# 安装依赖
npm install

# 构建插件
npm run build

# 在 Chrome 中加载 dist 文件夹
```

## 🎮 使用方法

1. **点击插件图标** 或 **点击悬浮球** 打开游戏面板
2. **查看猫咪状态**：饥饿、疲惫、清洁度、猫粮
3. **使用小图标操作**：
   - 🍖 补充猫粮
   - 🛁 给猫洗澡
   - 🎾 逗猫咪
   - 🔄 重置游戏（保留照片和名字）

## 🛠️ 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Chrome Storage API** - 数据持久化
- **Content Scripts** - 悬浮球注入

## 📁 项目结构

```
CatCarePlugin/
├── src/
│   ├── assets/              # 图标资源
│   ├── components/          # UI 组件
│   │   ├── CatDisplay.tsx   # 猫咪展示组件
│   │   └── StatsDisplay.tsx # 状态显示组件
│   ├── hooks/
│   │   └── useGameState.ts  # 游戏状态管理
│   ├── styles/              # 样式文件
│   ├── types/
│   │   └── game.ts          # 类型定义
│   ├── Popup.tsx            # 弹窗主组件
│   ├── content.ts           # 悬浮球功能
│   ├── content.css          # 悬浮球样式
│   └── background.ts        # 后台服务
├── manifest.json            # Chrome 扩展配置
├── vite.config.ts           # Vite 配置
└── package.json             # 项目配置
```

## 🎯 游戏参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 猫粮消耗速度 | 5 秒/点 | 每 5 秒消耗 1 点猫粮 |
| 饥饿值增加速度 | 5 秒/点 | 猫粮为空时每 5 秒增加 1 点 |
| 睡眠阈值 | 80% | 疲惫值达到 80 时自动睡眠 |
| 睡眠恢复速度 | 1 秒/2点 | 睡眠时每秒恢复 2 点疲惫值 |
| 洗澡冷却时间 | 10 分钟 | 清洁度 ≥ 25 时的冷却时间 |
| 紧急洗澡阈值 | 25% | 清洁度低于此值可立即洗澡 |

## 🌐 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Brave
- ✅ 其他 Chromium 系列浏览器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

- **wangzitianwzt-art** - [GitHub](https://github.com/wangzitianwzt-art)

## 🙏 致谢

感谢所有为这个项目做出贡献的人！

---

如果这个项目对你有帮助，请给一个 ⭐ Star！
