import { useEffect, useRef } from 'react'

function Scene() {
  const sceneRef = useRef(null)
  const moonRef = useRef(null)
  const houseRef = useRef(null)

  useEffect(() => {
    // Create floating particles
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

    // Add particle animation styles
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

    // Create atmospheric clouds
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

    // Add cloud animation
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

    // Parallax effect for moon and house
    const handleMouseMove = (e) => {
      const mouseX = e.clientX / window.innerWidth
      const mouseY = e.clientY / window.innerHeight

      const moonX = (mouseX - 0.5) * 20
      const moonY = (mouseY - 0.5) * 20
      const houseX = (mouseX - 0.5) * -10
      const houseY = (mouseY - 0.5) * -10

      if (moonRef.current) {
        moonRef.current.style.transform = `translate(${moonX}px, ${moonY}px)`
      }
      if (houseRef.current) {
        houseRef.current.style.transform = `translate(${houseX}px, ${houseY}px)`
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      <div className="orientation-warning">
        <div className="warning-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <h2>Please Use Desktop, Tablet, or Rotate Your Phone</h2>
          <p>ElectroQuest is best experienced on larger screens or in landscape mode.</p>
        </div>
      </div>

      <div className="fog-layer fog-1"></div>
      <div className="fog-layer fog-2"></div>
      <div className="fog-layer fog-3"></div>

      <div className="scene" ref={sceneRef}>
        <div className="particles"></div>

        <div className="moon" ref={moonRef}></div>

        <div className="haunted-house" ref={houseRef}>
          <img src="/assets/semesta-gambar rumah.png" alt="Haunted House" className="house-image" />
        </div>

        <div className="ground">
          <img src="/assets/semesta-gambar rumput.png" alt="Grass" className="grass-image" />
        </div>
      </div>
    </>
  )
}

export default Scene
