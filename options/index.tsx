import { useEffect, useRef, useState } from "react"

import "./index.css"

interface Firework {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  alpha: number
  size: number
}

interface UserSettings {
  isOnToolbar: boolean
}

function OptionsIndex() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [isPinned, setIsPinned] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const hasPinnedRef = useRef(false)

  useEffect(() => {
    const checkCompletedStatus = () => {
      chrome.storage.local.get(["completedWelcome"], (result) => {
        if (result.completedWelcome) {
          setShowWelcome(false)
        }
      })
    }

    checkCompletedStatus()

    const checkPinStatus = async () => {
      try {
        if (chrome?.action?.getUserSettings) {
          const settings =
            (await chrome.action.getUserSettings()) as UserSettings
          if (settings.isOnToolbar && !hasPinnedRef.current) {
            chrome.storage.local.set({ completedWelcome: true })
            setShowWelcome(false)
            hasPinnedRef.current = true
            setIsPinned(true)
          }
        }
      } catch (error) {
        console.error("Failed to check pin status:", error)
      }
    }

    checkPinStatus()
    const intervalId = setInterval(checkPinStatus, 800)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!showWelcome && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const resizeCanvas = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      const fireworks: Firework[] = []
      const colors = [
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#F1948A"
      ]

      const createFirework = () => {
        const x = Math.random() * canvas.width
        const y = canvas.height * (0.3 + Math.random() * 0.5)
        const color = colors[Math.floor(Math.random() * colors.length)]
        const particles: Firework[] = []

        for (let i = 0; i < 100; i++) {
          const angle = (Math.PI * 2 * i) / 100
          const velocity = Math.random() * 6 + 3
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 4,
            color,
            alpha: 1,
            size: Math.random() * 5 + 3
          })
        }

        return particles
      }

      let lastFirework = 0

      const animate = (timestamp: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (timestamp - lastFirework > 400) {
          fireworks.push(...createFirework())
          lastFirework = timestamp
        }

        for (let i = fireworks.length - 1; i >= 0; i--) {
          const p = fireworks[i]
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.03
          p.alpha -= 0.008

          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()

          if (p.alpha <= 0) {
            fireworks.splice(i, 1)
          }
        }

        animationRef.current = requestAnimationFrame(animate)
      }

      animate(0)

      return () => {
        window.removeEventListener("resize", resizeCanvas)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [showWelcome])

  if (showWelcome) {
    return (
      <div className="welcome-container">
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>

        {!isPinned && (
          <div className="pin-tip">
            <div className="pin-tip-icon">📌</div>
            <div className="pin-tip-text">
              <span>点击右上角扩展图标</span>
              <span>固定到工具栏</span>
            </div>
          </div>
        )}

        <div className="main-content">
          <div className="logo-section">
            <div className="logo-wrapper">
              <div className="logo-icon">🎯</div>
            </div>
            <div className="app-name">划词翻译</div>
          </div>

          <div className="hero-section">
            <h1 className="main-title">准备好开始使用</h1>
            <p className="subtitle">简单、快速的英文翻译工具</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-container">
      <div className="decoration decoration-1"></div>
      <div className="decoration decoration-2"></div>
      <div className="decoration decoration-3"></div>

      <div className="main-content">
        <div className="logo-section">
          <div className="logo-wrapper">
            <div className="logo-icon">🎯</div>
          </div>
          <div className="app-name">划词翻译</div>
        </div>

        <div className="hero-section">
          <h1 className="main-title">准备好开始使用</h1>
          <p className="subtitle">简单、快速的英文翻译工具</p>
        </div>
      </div>

      <canvas ref={canvasRef} className="fireworks-canvas" />
    </div>
  )
}

export default OptionsIndex
