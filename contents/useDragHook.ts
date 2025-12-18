/**
 * 这是一个自定义hooks，用于实现拖动功能
 * @param ref 拖动元素的ref
 * @param initialPosition 初始位置
 */
import { useState, useEffect, useRef, useCallback } from 'react'

export interface Position {
  left: number
  top: number
}

export const useDragHook = (
  ref: React.RefObject<HTMLElement>,
  initialPosition: Position,
) => {
  const [position, setPosition] = useState<Position>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  
  // 使用ref保存拖拽状态，避免闭包问题
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  // 拖拽开始事件处理
  const handleDragStart = useCallback((event: MouseEvent) => {
    // 检查是否点击在标题栏上
    const titleBar = (event.target as HTMLElement).closest('.ec-translation-card__title-bar')
    if (!titleBar || !ref.current) return

    event.stopPropagation()
    
    // 获取当前元素的位置
    const rect = ref.current.getBoundingClientRect()
    
    // 计算并保存鼠标相对于元素左上角的偏移量
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    // 更新拖拽状态
    setIsDragging(true)
    isDraggingRef.current = true
  }, [ref])

  // 拖拽过程事件处理
  const handleDrag = useCallback((event: MouseEvent) => {
    if (!isDraggingRef.current) return

    event.stopPropagation()
    
    // 获取页面可视区域尺寸
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // 计算新的位置（鼠标位置减去偏移量）
    let newLeft = event.clientX - dragOffsetRef.current.x
    let newTop = event.clientY - dragOffsetRef.current.y
    
    // 确保不超出页面边界
    const margin = 10 // 页面边缘的边距
    const cardMaxWidth = 380 // 卡片最大宽度，与CSS中的max-width保持一致
    const cardEstimatedHeight = 150 // 卡片估计高度，可根据实际情况调整
    
    // 限制left位置
    if (newLeft < margin) {
      newLeft = margin
    } else if (newLeft + cardMaxWidth + margin > viewportWidth) {
      newLeft = viewportWidth - cardMaxWidth - margin
    }
    
    // 限制top位置
    if (newTop < margin) {
      newTop = margin
    } else if (newTop + cardEstimatedHeight + margin > viewportHeight) {
      newTop = viewportHeight - cardEstimatedHeight - margin
    }
    
    // 更新位置状态
    setPosition({ left: newLeft, top: newTop })
  }, [])

  // 拖拽结束事件处理
  const handleDragEnd = useCallback((event?: MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    
    // 更新拖拽状态
    setIsDragging(false)
    isDraggingRef.current = false
  }, [])

  const addDragListeners = useCallback(() => {
    const element = ref.current
    element.addEventListener('mousedown', handleDragStart)
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('mouseleave', handleDragEnd)
  }, [ref, handleDragStart, handleDrag, handleDragEnd])

  const removeDragListeners = useCallback(() => {
    const element = ref.current
    if (!element) return
    element.removeEventListener('mousedown', handleDragStart)
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('mouseleave', handleDragEnd)
  }, [ref, handleDragStart, handleDrag, handleDragEnd])

  return {
    position,
    isDragging,
    setPosition,
    addDragListeners,
    removeDragListeners
  }
}
