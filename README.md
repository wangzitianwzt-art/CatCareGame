# 🐱 猫咪养成 - Chrome 浏览器插件

一个轻量化的养猫游戏浏览器插件，采用弹窗式设计，使用小图标进行交互。

## 功能特性

### 🍖 猫粮系统
- 手动补充猫粮
- 猫粮随时间自动消耗
- 猫粮为空时饥饿值上升

### 🛁 洗澡系统
- 每 24 小时限洗一次
- 洗澡恢复清洁度到 100%
- 冷却时间显示

### 🎾 逗猫系统
- 点击逗猫增加疲惫值
- 疲惫值达到 80% 时自动进入睡眠
- 睡眠中疲惫值自动恢复

### 😸 猫咪状态
- 实时显示饥饿值、疲惫值、清洁度
- 猫咪表情根据状态变化
- 数据自动保存

## 安装方法

### 开发模式

1. **克隆或下载项目**
   ```bash
   cd /home/ubuntu/CatCarePlugin
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建插件**
   ```bash
   npm run build
   ```

4. **在 Chrome 中加载插件**
   - 打开 Chrome，进入 `chrome://extensions/`
   - 启用「开发者模式」（右上角）
   - 点击「加载已解压的扩展程序」
   - 选择 `dist` 文件夹

### 发布版本

构建后的插件文件位于 `dist/` 目录，可以上传到 Chrome Web Store。

## 使用方法

1. **点击插件图标**打开弹窗
2. **查看猫咪状态**：实时显示饥饿、疲惫、清洁度
3. **使用小图标操作**：
   - 🍖 补充猫粮
   - 🛁 给猫洗澡
   - 🎾 逗猫咪
   - 🔄 重置游戏

## 项目结构

```
CatCarePlugin/
├── src/
│   ├── assets/           # 图标资源
│   ├── hooks/
│   │   └── useGameState.ts    # 游戏状态管理
│   ├── types/
│   │   └── game.ts       # 类型定义
│   ├── styles/
│   │   └── popup.css     # 弹窗样式
│   ├── Popup.tsx         # 弹窗主组件
│   ├── popup.tsx         # 弹窗入口
│   ├── popup.html        # 弹窗 HTML
│   └── background.ts     # 后台服务
├── manifest.json         # 插件配置
├── vite.config.ts        # Vite 配置
└── package.json          # 项目配置
```

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Chrome Storage API** - 数据持久化

## 游戏常数

| 常数 | 值 | 说明 |
|------|-----|------|
| `TICK_INTERVAL` | 1000ms | 每秒更新一次 |
| `FOOD_CONSUME_INTERVAL` | 10s | 每 10 秒消耗 1 猫粮 |
| `HUNGER_INCREASE_INTERVAL` | 5s | 猫粮为空时每 5 秒增加 1 饥饿值 |
| `HUNGER_THRESHOLD` | 70% | 饥饿值超过此值时猫咪不满 |
| `TIREDNESS_THRESHOLD` | 80% | 疲惫值超过此值时自动睡眠 |
| `BATH_COOLDOWN` | 24h | 洗澡冷却时间 |
| `SLEEP_DURATION` | 5min | 睡眠持续时间 |

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ 其他 Chromium 系列浏览器

## 开发命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 许可证

MIT

## 作者

Manus AI
