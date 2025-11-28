import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import useAudio from '../hooks/useAudio'
import '../styles/profile.css'

function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      fetchStats()
    }
  }, [profile])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_stats', { p_user_id: user.id })
        .maybeSingle()

      if (error) throw error
      setStats(data || {
        total_experiments: 0,
        successful_experiments: 0,
        success_rate: 0,
        total_xp_earned: 0,
        favorite_topic: '-'
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSave = async () => {
    playClickSound()
    await updateProfile({ display_name: displayName })
    setIsEditing(false)
  }

  const handleBack = () => {
    playClickSound()
    navigate('/')
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <p className="loading-text">Memuat profil...</p>
      </div>
    )
  }

  const levelTitle = profile.level <= 3 ? 'Magang' :
                     profile.level <= 7 ? 'Gesit' :
                     profile.level <= 12 ? 'Ahli' : 'Master'

  const currentLevelXP = (profile.level - 1) * (profile.level - 1) * 100
  const nextLevelXP = profile.level * profile.level * 100
  const xpProgress = profile.total_xp - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP
  const progressPercent = (xpProgress / xpNeeded) * 100

  return (
    <div className="profile-container">
      <div className="profile-content">
        <button onClick={handleBack} className="back-button" onMouseEnter={playHoverSound}>
          ← Kembali
        </button>

        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-section">
              <div className="avatar-frame">
                <div className="avatar-glow"></div>
                <div className="avatar-placeholder">
                  {profile.display_name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="profile-info">
              {isEditing ? (
                <div className="edit-name">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="name-input"
                  />
                  <button onClick={handleSave} className="save-button">
                    Simpan
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="profile-name">{profile.display_name}</h1>
                  <button
                    onClick={() => {
                      playClickSound()
                      setIsEditing(true)
                    }}
                    className="edit-button"
                    onMouseEnter={playHoverSound}
                  >
                    ✎ Edit
                  </button>
                </>
              )}

              <div className="level-badge">
                <span className="level-title">{levelTitle}</span>
                <span className="level-number">Level {profile.level}</span>
              </div>
            </div>
          </div>

          <div className="xp-section">
            <div className="xp-bar-container">
              <div className="xp-bar" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="xp-text">
              {xpProgress} / {xpNeeded} XP untuk level berikutnya
            </p>
          </div>

          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🔬</div>
                <div className="stat-value">{stats.total_experiments}</div>
                <div className="stat-label">Total Eksperimen</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-value">{stats.successful_experiments}</div>
                <div className="stat-label">Berhasil</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.success_rate}%</div>
                <div className="stat-label">Tingkat Keberhasilan</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">{profile.total_xp}</div>
                <div className="stat-label">Total XP</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
