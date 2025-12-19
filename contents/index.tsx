import styleText from "data-text:./index.scss"
import type {
  PlasmoCSConfig,
  PlasmoGetInlineAnchor,
  PlasmoGetStyle
} from "plasmo"
import React, { useCallback, useEffect, useRef, useState } from "react"

import { useDragHook } from "./useDragHook"
import {
  checkAudioAvailable,
  getAudioUrl,
  getTranslation,
  sleep
} from "./utils"

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
  const cardRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState({
    show: false,
    originalText: "",
    translation: "",
    isLoading: false
  })

  // 拖拽
  const {
    position,
    isDragging,
    setPosition,
    addDragListeners,
    removeDragListeners
  } = useDragHook(cardRef, { left: 0, top: 0 })

  // 划词翻译是否启用
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true)

  // 发音是否启用
  const [isPronounceAvailable, setIsPronounceAvailable] = useState(false)

  // 从 chrome 存储中获取配置 & 监听变化
  useEffect(() => {
    chrome.storage.sync.get(["translationEnabled"], (result) => {
      setIsTranslationEnabled(result.translationEnabled ?? true)
    })

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes.translationEnabled) {
        setIsTranslationEnabled(changes.translationEnabled.newValue ?? true)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const handleMouseUp = useCallback(
    async (e: MouseEvent) => {
      if (!isTranslationEnabled) {
        setState((prev) => ({ ...prev, show: false }))
        return
      }

      await sleep(0) // 防止再次点击选中文本导致卡片位置变动

      const selection = window.getSelection()
      const text = selection?.toString().trim() || ""

      const webComponent = e.target as HTMLElement
      // 判断是否点击的是卡片的webComponent
      const card = webComponent.shadowRoot?.querySelector(
        "#ec-translation-card"
      )

      if (card || state.isLoading || selection.rangeCount === 0) {
        return
      }

      if (text.length === 0) {
        setState((prev) => ({ ...prev, show: false }))
        return
      }

      const range = selection.getRangeAt(0)
      if (!range.collapsed) {
        const { clientX, clientY } = e

        setState({
          show: true,
          originalText: text,
          translation: "ing...",
          isLoading: true
        })
        setPosition({ 
          left: clientX, 
          top: clientY + 20 
        })

        const translation = await getTranslation(text).catch((e) => {})
        setState((prev) => ({
          ...prev,
          translation: translation || "翻译失败",
          isLoading: false
        }))
      }
    },
    [isTranslationEnabled]
  )

  // 发音功能
  const pronounceText = useCallback((text: string) => {
    const audioUrl = getAudioUrl(text)
    if (!audioUrl) return
    const audio = new Audio(audioUrl)
    audio.play().catch((e) => {})
  }, [])

  const handleClose = useCallback(async () => {
    await sleep(0)
    setState({ ...state, show: false })
  }, [state])

  useEffect(() => {
    setIsPronounceAvailable(false)

    const text = state.originalText
    if (text && !text.includes(" ")) {
      checkAudioAvailable(getAudioUrl(text)).then((isAvailable) =>
        setIsPronounceAvailable(isAvailable)
      )
    }
  }, [state.originalText])

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp, true)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp, true)
    }
  }, [handleMouseUp])

  useEffect(() => {
    if (state.show) {
      addDragListeners()
    } else {
      removeDragListeners()
    }
  }, [state.show])

  if (!state.show) {
    return null
  }

  return (
    <div
      ref={cardRef}
      id="ec-translation-card"
      className={`ec-translation-card ${isDragging ? "dragging" : ""}`}
      style={{
        position: "fixed",
        left: `${position.left}px`,
        top: `${position.top}px`,
        zIndex: 2147483647 // 最大z-index
      }}>
      <div className="ec-translation-card__title-bar">
        <div className="ec-translation-card__title">
          翻译 {state.isLoading && "(ing...)"}
        </div>
        <button
          className="ec-translation-card__close-button"
          title="关闭"
          onClick={() => {handleClose()}}>
          ✕
        </button>
      </div>

      <div className="ec-translation-card__original-text">
        {state.originalText}
        {isPronounceAvailable && (
          <button
            className="ec-translation-card__pronounce-button"
            title="发音"
            onClick={(e) => {
              e.stopPropagation()
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
