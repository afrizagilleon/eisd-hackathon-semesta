import { useEffect, useRef, useState } from 'react'

const useAudio = () => {
  const ambientMusicRef = useRef(null)
  const clickSoundRef = useRef(null)
  const hoverSoundRef = useRef(null)
  const [audioStarted, setAudioStarted] = useState(false)

  useEffect(() => {
    ambientMusicRef.current = document.getElementById('ambient-music')
    clickSoundRef.current = document.getElementById('click-sound')
    hoverSoundRef.current = document.getElementById('hover-sound')

    if (ambientMusicRef.current) ambientMusicRef.current.volume = 0.3
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.5
    if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.3
  }, [])

  const startBackgroundMusic = () => {
    if (!audioStarted && ambientMusicRef.current) {
      ambientMusicRef.current.play().catch(e =>
        console.log('Background music autoplay prevented:', e)
      )
      setAudioStarted(true)
    }
  }

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0
      clickSoundRef.current.play().catch(e =>
        console.log('Click sound failed:', e)
      )
    }
  }

  const playHoverSound = () => {
    if (hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0
      hoverSoundRef.current.play().catch(e =>
        console.log('Hover sound failed:', e)
      )
    }
  }

  const initializeAudio = () => {
    const startMusic = () => {
      startBackgroundMusic()
    }

    document.addEventListener('click', startMusic, { once: true })
    document.addEventListener('mouseenter', startMusic, { once: true })

    return () => {
      document.removeEventListener('click', startMusic)
      document.removeEventListener('mouseenter', startMusic)
    }
  }

  return {
    initializeAudio,
    playClickSound,
    playHoverSound,
    startBackgroundMusic
  }
}

export default useAudio
