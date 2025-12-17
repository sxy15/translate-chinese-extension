import styleText from "data-text:./index.scss"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import React, { useCallback, useEffect, useState } from "react"

import { getAudioUrl, getTranslation, sleep } from "./utils"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

// 使用inline锚点将组件挂载到body
export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  return document.body
}

const TranslationCard = () => {
  const [state, setState] = useState({
    show: false,
    originalText: "",
    translation: "",
    x: 0,
    y: 0,
    isLoading: false
  })

  // 跟踪划词翻译是否启用
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true)

  // 跟踪当前文本的发音是否可用
  const [isPronounceAvailable, setIsPronounceAvailable] = useState(false)

  // 从Chrome存储读取翻译功能开关状态
  useEffect(() => {
    chrome.storage.sync.get(['translationEnabled'], (result) => {
      setIsTranslationEnabled(result.translationEnabled ?? true)
    })

    // 监听存储变化
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.translationEnabled) {
        console.log('translationEnabled changed:', changes.translationEnabled.newValue)
        setIsTranslationEnabled(changes.translationEnabled.newValue ?? true)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [isTranslationEnabled])

  // 处理鼠标释放事件 - 统一处理划词和点击关闭逻辑
  const handleMouseUp = useCallback(async (event: MouseEvent) => {
    // 如果翻译功能已禁用，不处理划词
    if (!isTranslationEnabled) {
      // 如果有显示的卡片，关闭它
      setState(prev => ({ ...prev, show: false }))
      return
    }

    await sleep(100) // 防止再次点击原选中文本时，卡片位置变化

    const card = document.getElementById("ec-translation-card")
    const selection = window.getSelection()
    const text = selection?.toString().trim() || ""

    // 如果点击的是卡片内部，不做任何操作
    if (card?.contains(event.target as Node)) {
      return
    }

    // 情况1: 有选中文本 - 显示翻译卡片
    if (text && text.length >= 2 && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (!range.collapsed) {
        const { clientX, clientY } = event

        // 更新组件状态
        setState({
          show: true,
          originalText: text,
          translation: "翻译中...",
          x: clientX,
          y: clientY,
          isLoading: true
        })

        // 获取翻译
        try {
          const translation = await getTranslation(text)
          setState((prev) => ({
            ...prev,
            translation: translation || "翻译失败",
            isLoading: false
          }))
        } catch (error) {
          setState((prev) => ({
            ...prev,
            translation: "翻译失败，请稍后重试",
            isLoading: false
          }))
        }
        return
      }
    }

    // 情况2: 没有选中文本 - 关闭卡片
    setState((prev) => ({ ...prev, show: false }))
  }, [isTranslationEnabled])

  // 添加事件监听器 - 只需要监听mouseup事件
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseUp])

  // 检查音频URL是否有效
  const checkAudioAvailability = useCallback(async (text: string) => {
    const audioUrl = getAudioUrl(text)
    if (!audioUrl) {
      setIsPronounceAvailable(false)
      return
    }

    try {
      // 使用Promise包装Audio对象的元数据加载事件
      const isAudioValid = await new Promise<boolean>((resolve) => {
        const audio = new Audio()
        audio.preload = "metadata" // 只加载元数据
        audio.src = audioUrl

        // 元数据加载成功
        audio.onloadedmetadata = () => {
          resolve(audio.duration > 0)
        }

        // 音频加载失败
        audio.onerror = () => {
          resolve(false)
        }

        // 清理函数
        return () => {
          audio.onloadedmetadata = null
          audio.onerror = null
        }
      })

      setIsPronounceAvailable(isAudioValid)
    } catch (e) {
      setIsPronounceAvailable(false)
    }
  }, [])

  // 发音功能
  const pronounceText = useCallback((text: string) => {
    const audioUrl = getAudioUrl(text)
    if (!audioUrl) return
    const audio = new Audio(audioUrl)
    audio.play().catch((e) => {})
  }, [])

  // 当原始文本变化时检查发音可用性
  useEffect(() => {
    // 重置发音可用性状态
    setIsPronounceAvailable(false)

    // 如果是纯英文单词，检查发音是否可用
    if (state.originalText && !state.originalText.includes(" ")) {
      checkAudioAvailability(state.originalText)
    }
  }, [state.originalText, checkAudioAvailability])

  // 如果不显示卡片，返回null
  if (!state.show) {
    return null
  }

  // 计算卡片位置
  const left = Math.min(state.x + 10, window.innerWidth - 420)
  const top = Math.min(state.y + 10, window.innerHeight - 250)

  return (
    <div
      id="ec-translation-card"
      className="ec-translation-card"
      style={{
        position: "fixed", // 使用fixed定位
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 2147483647 // 最大z-index
      }}>
      <div className="ec-translation-card__title-bar">
        <div className="ec-translation-card__title">
          翻译 {state.isLoading && "(加载中...)"}
        </div>
        <button
          className="ec-translation-card__close-button"
          title="关闭"
          onMouseUp={(event) => {
            event.stopPropagation() // 阻止Click事件冒泡
            setState((prev) => ({ ...prev, show: false }))
          }}>
          ✕
        </button>
      </div>

      <div className="ec-translation-card__original-text">
        {state.originalText}
        {!state.originalText.includes(" ") && isPronounceAvailable && (
          <button
            className="ec-translation-card__pronounce-button"
            title="发音"
            onMouseUp={(event) => {
              event.stopPropagation() // 阻止MouseUp事件冒泡
              pronounceText(state.originalText)
            }}>
            🔊
          </button>
        )}
      </div>

      <div className="ec-translation-card__translation">
        {state.translation}
      </div>
    </div>
  )
}

export default TranslationCard
