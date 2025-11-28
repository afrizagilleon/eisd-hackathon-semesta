import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const useAudio = () => {
  const { user } = useAuth()
  const ambientMusicRef = useRef(null)
  const clickSoundRef = useRef(null)
  const hoverSoundRef = useRef(null)
  const [audioStarted, setAudioStarted] = useState(false)
  const [settings, setSettings] = useState({
    effects_enabled: true,
    effects_volume: 50
  })

  useEffect(() => {
    ambientMusicRef.current = document.getElementById('ambient-music')
    clickSoundRef.current = document.getElementById('click-sound')
    hoverSoundRef.current = document.getElementById('hover-sound')

    if (ambientMusicRef.current) ambientMusicRef.current.volume = 0.3
    if (clickSoundRef.current) clickSoundRef.current.volume = 0.5
    if (hoverSoundRef.current) hoverSoundRef.current.volume = 0.3

    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('effects_enabled, effects_volume')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching audio settings:', error)
    }
  }

  const startBackgroundMusic = () => {
    if (!audioStarted && ambientMusicRef.current) {
      ambientMusicRef.current.play().catch(e =>
        console.log('Background music autoplay prevented:', e)
      )
      setAudioStarted(true)
    }
  }

  const playClickSound = () => {
    if (clickSoundRef.current && settings.effects_enabled) {
      clickSoundRef.current.currentTime = 0
      clickSoundRef.current.volume = settings.effects_volume / 100
      clickSoundRef.current.play().catch(e =>
        console.log('Click sound failed:', e)
      )
    }
  }

  const playHoverSound = () => {
    if (hoverSoundRef.current && settings.effects_enabled) {
      hoverSoundRef.current.currentTime = 0
      hoverSoundRef.current.volume = settings.effects_volume / 100
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
