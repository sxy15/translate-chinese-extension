// 初始化右键菜单的函数
const initContextMenu = () => {
  // 先移除旧菜单，避免重复创建
  chrome.contextMenus.removeAll(() => {
    // 检查用户之前的配置，如果没有则使用默认值
    chrome.storage.sync.get(["translationEnabled"], (result) => {
      const isEnabled = result.translationEnabled ?? true

      // 创建右键菜单，使用保存的配置或默认值
      chrome.contextMenus.create({
        id: "toggle-translation",
        title: isEnabled ? "启用/关闭划词翻译" : "关闭/启用划词翻译",
        contexts: ["page", "selection"],
        type: "normal"
      })
    })
  })
}

// 扩展安装时初始化菜单
chrome.runtime.onInstalled.addListener(initContextMenu)

// 浏览器启动时初始化菜单
chrome.runtime.onStartup.addListener(initContextMenu)

// 监听菜单点击事件
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "toggle-translation") {
    // 存储用户设置
    chrome.storage.sync.get(["translationEnabled"], (result) => {
      const isEnabled = result.translationEnabled ?? true
      chrome.storage.sync.set({ translationEnabled: !isEnabled })

      // 更新菜单项标题
      chrome.contextMenus.update("toggle-translation", {
        title: isEnabled ? "关闭/启用划词翻译" : "启用/关闭划词翻译",
      })
    })
  }
})
