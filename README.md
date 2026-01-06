# 划词翻译浏览器插件

这是一个功能强大的谷歌浏览器划词翻译插件，支持划词时悬浮卡片显示翻译结果，并提供发音功能。

## ✨ 功能特性

- 🎯 **划词翻译**：选中任意文本，自动弹出翻译卡片
- 🔊 **发音功能**：支持英文单词发音，点击即可播放
- 🌐 **多语言支持**：支持4种语言之间的互相翻译
  - 英语、中文、日语、韩语
- ⚙️ **灵活配置**：通过popup界面自定义源语言和目标语言
- 🔄 **语言交换**：一键交换源语言和目标语言设置
- 🖱️ **右键菜单**：通过右键菜单快速启用/禁用划词翻译
- 🎨 **拖拽功能**：支持拖拽翻译卡片到任意位置

## 📦 安装方法

### 从源码构建

1. 克隆项目到本地
   ```bash
   git clone https://github.com/sxy15/translate-chinese-extension.git
   cd translate-chinese-extension
   ```

2. 安装依赖
   ```bash
   pnpm install
   ```

3. 构建项目
   ```bash
   pnpm build
   ```

4. 加载扩展
   - 打开Chrome浏览器，访问 `chrome://extensions/
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录下的 `build/chrome-mv3-prod` 文件夹

### 从release页面安装

1. 访问项目的release页面
   https://github.com/sxy15/translate-chinese-extension/releases

2. 下载最新版本的zip文件

3. 解压zip文件到任意目录

4. 加载扩展
   - 打开Chrome浏览器，访问 `chrome://extensions/
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择解压后的文件夹
