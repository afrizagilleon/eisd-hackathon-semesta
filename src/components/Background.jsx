import { useEffect, useRef } from 'react'

function Background() {
  const sceneRef = useRef(null)
  const moonRef = useRef(null)

  useEffect(() => {
    const particlesContainer = sceneRef.current.querySelector('.particles')
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'

      const size = Math.random() * 3 + 1
      const startX = Math.random() * 100
      const duration = Math.random() * 20 + 15
      const delay = Math.random() * 10

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        left: ${startX}%;
        bottom: -10px;
        animation: floatUp ${duration}s ${delay}s linear infinite;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
      `

      particlesContainer.appendChild(particle)
    }

    const style = document.createElement('style')
    style.textContent = `
      @keyframes floatUp {
        0% {
          transform: translateY(0) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 0.5;
        }
        90% {
          opacity: 0.5;
        }
        100% {
          transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)

    const cloudCount = 3
    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement('div')
      cloud.className = 'cloud'

      const size = Math.random() * 100 + 80
      const topPosition = Math.random() * 30 + 10
      const duration = Math.random() * 60 + 80
      const delay = Math.random() * -30

      cloud.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: rgba(150, 170, 190, 0.1);
        border-radius: 50%;
        top: ${topPosition}%;
        left: -150px;
        animation: cloudDrift ${duration}s ${delay}s linear infinite;
        filter: blur(15px);
        z-index: 3;
      `

      sceneRef.current.appendChild(cloud)
    }

    const cloudStyle = document.createElement('style')
    cloudStyle.textContent = `
      @keyframes cloudDrift {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(calc(100vw + 200px));
        }
      }
    `
    document.head.appendChild(cloudStyle)

    const handleMouseMove = (e) => {
      const mouseX = e.clientX / window.innerWidth
      const mouseY = e.clientY / window.innerHeight

      const moonX = (mouseX - 0.5) * 20
      const moonY = (mouseY - 0.5) * 20

      if (moonRef.current) {
        moonRef.current.style.transform = `translate(${moonX}px, ${moonY}px)`
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
      <div className="fog-layer fog-1"></div>
      <div className="fog-layer fog-2"></div>
      <div className="fog-layer fog-3"></div>

      <div className="scene" ref={sceneRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div className="particles"></div>
        <div className="moon" ref={moonRef}></div>
      </div>
    </div>
  )
}

export default Background
