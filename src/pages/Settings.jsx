import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import useAudio from '../hooks/useAudio'
import Background from '../components/Background'
import '../styles/settings.css'

function Settings() {
  const { user, signOut } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const navigate = useNavigate()

  const [settings, setSettings] = useState({
    music_enabled: true,
    effects_enabled: true,
    music_volume: 30,
    effects_volume: 50
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setSettings(data)
        applyAudioSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyAudioSettings = (newSettings) => {
    const ambientMusic = document.getElementById('ambient-music')
    const clickSound = document.getElementById('click-sound')
    const hoverSound = document.getElementById('hover-sound')

    if (ambientMusic) {
      ambientMusic.volume = newSettings.music_volume / 100
      ambientMusic.muted = !newSettings.music_enabled
    }
    if (clickSound) {
      clickSound.volume = newSettings.effects_volume / 100
    }
    if (hoverSound) {
      hoverSound.volume = newSettings.effects_volume / 100
    }
  }

  const saveSettings = async (newSettings) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('settings')
        .update(newSettings)
        .eq('user_id', user.id)

      if (error) throw error
      applyAudioSettings(newSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key) => {
    playClickSound()
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleVolumeChange = (key, value) => {
    const newSettings = { ...settings, [key]: parseInt(value) }
    setSettings(newSettings)
  }

  const handleVolumeRelease = (key) => {
    saveSettings(settings)
  }

  const handleBack = () => {
    playClickSound()
    navigate('/')
  }

  const handleSignOut = async () => {
    playClickSound()
    await signOut()
    navigate('/auth')
  }

  if (loading) {
    return (
      <div className="settings-container">
        <p className="loading-text">Memuat pengaturan...</p>
      </div>
    )
  }

  return (
    <div className="settings-container">
      <Background />
      <div className="settings-content">
        <button onClick={handleBack} className="back-button" onMouseEnter={playHoverSound}>
          ← Kembali
        </button>

        <div className="settings-card">
          <h1 className="settings-title">Pengaturan</h1>

          <div className="settings-section">
            <h2 className="section-title">Audio</h2>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Musik Latar</span>
                <span className="setting-description">Musik ambient background</span>
              </div>
              <button
                className={`toggle-button ${settings.music_enabled ? 'active' : ''}`}
                onClick={() => handleToggle('music_enabled')}
                onMouseEnter={playHoverSound}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>

            {settings.music_enabled && (
              <div className="setting-item volume-item">
                <span className="setting-label">Volume Musik</span>
                <div className="volume-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.music_volume}
                    onChange={(e) => handleVolumeChange('music_volume', e.target.value)}
                    onMouseUp={() => handleVolumeRelease('music_volume')}
                    onTouchEnd={() => handleVolumeRelease('music_volume')}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.music_volume}%</span>
                </div>
              </div>
            )}

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Efek Suara</span>
                <span className="setting-description">Suara klik dan hover</span>
              </div>
              <button
                className={`toggle-button ${settings.effects_enabled ? 'active' : ''}`}
                onClick={() => handleToggle('effects_enabled')}
                onMouseEnter={playHoverSound}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>

            {settings.effects_enabled && (
              <div className="setting-item volume-item">
                <span className="setting-label">Volume Efek</span>
                <div className="volume-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.effects_volume}
                    onChange={(e) => handleVolumeChange('effects_volume', e.target.value)}
                    onMouseUp={() => handleVolumeRelease('effects_volume')}
                    onTouchEnd={() => handleVolumeRelease('effects_volume')}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.effects_volume}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h2 className="section-title">Akun</h2>
            <button
              onClick={handleSignOut}
              className="signout-button"
              onMouseEnter={playHoverSound}
            >
              Keluar
            </button>
          </div>

          {saving && <div className="saving-indicator">Menyimpan...</div>}
        </div>

        <footer className="footer">
          <p className="credit">by semesta</p>
        </footer>
      </div>
    </div>
  )
}

export default Settings
