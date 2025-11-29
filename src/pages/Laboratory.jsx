import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateExperiment, calculateXP } from '../services/n8nService'
import useAudio from '../hooks/useAudio'
import Background from '../components/Background'
import CircuitPuzzle from '../components/CircuitPuzzle'
import '../styles/laboratory.css'

function Laboratory() {
  const { topic, difficulty } = useParams()
  const [searchParams] = useSearchParams()
  const isDaily = searchParams.get('daily') === 'true'

  const { user } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const navigate = useNavigate()

  const [experiment, setExperiment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    loadExperiment()
  }, [topic, difficulty])

  const loadExperiment = async () => {
    setLoading(true)
    setError(null)

    try {
      const experimentData = await generateExperiment(topic, difficulty)
      setExperiment(experimentData)
    } catch (err) {
      setError('Gagal memuat eksperimen. Silakan coba lagi.')
      console.error('Error loading experiment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    playClickSound()
    navigate('/play')
  }

  const handlePuzzleComplete = async (result) => {
    playClickSound()
    setCompleted(true)

    const earnedXP = calculateXP(experiment.base_xp, difficulty, hintsUsed, experiment.max_hints)

    try {
      const { error } = await supabase
        .from('experiment_history')
        .insert({
          user_id: user.id,
          experiment_id: experiment.id,
          topic,
          difficulty,
          success: result.success,
          hints_used: hintsUsed,
          xp_earned: earnedXP,
          is_daily: isDaily
        })

      if (error) throw error

      const { error: xpError } = await supabase.rpc('add_user_xp', {
        p_user_id: user.id,
        p_xp_amount: earnedXP
      })

      if (xpError) throw xpError
    } catch (err) {
      console.error('Error saving experiment result:', err)
    }
  }

  const handleHintRequest = () => {
    setHintsUsed(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="laboratory-container">
        <Background />
        <div className="laboratory-content">
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p className="loading-text">Menyiapkan laboratorium...</p>
            <p className="loading-subtext">Eksperimen sedang digenerate...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="laboratory-container">
        <Background />
        <div className="laboratory-content">
          <button onClick={handleBack} className="back-button" onMouseEnter={playHoverSound}>
            ← Kembali
          </button>
          <div className="error-section">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Terjadi Kesalahan</h2>
            <p className="error-message">{error}</p>
            <button onClick={loadExperiment} className="retry-button" onMouseEnter={playHoverSound}>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="laboratory-container">
      <Background />
      <div className="laboratory-content">
        <button onClick={handleBack} className="back-button" onMouseEnter={playHoverSound}>
          ← Kembali
        </button>

        {isDaily && (
          <div className="daily-badge">
            <span className="daily-icon">🌟</span>
            <span>Tantangan Harian</span>
          </div>
        )}

        <div className="experiment-info">
          <h1 className="experiment-title">{experiment.title}</h1>
          <div className="scenario-box">
            <p className="scenario-text">{experiment.scenario}</p>
          </div>
          <div className="objective-box">
            <strong>Objektif:</strong> {experiment.objective}
          </div>
        </div>

        <div className="workbench-section">
          <h2 className="section-title">Meja Kerja</h2>
          <CircuitPuzzle
            experiment={experiment}
            onComplete={handlePuzzleComplete}
            onHintRequest={handleHintRequest}
          />
        </div>

        <div className="experiment-details">
          <div className="hints-section">
            <h3>Petunjuk Tersedia: {experiment.max_hints}</h3>
            <p className="hint-info">Gunakan petunjuk jika kesulitan (mengurangi XP bonus)</p>
          </div>
          <div className="xp-info">
            <span className="xp-icon">⭐</span>
            <span>Base XP: {experiment.base_xp}</span>
          </div>
        </div>

        <footer className="footer">
          <p className="credit">by semesta</p>
        </footer>
      </div>
    </div>
  )
}

export default Laboratory
