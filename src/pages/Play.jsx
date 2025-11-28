import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import useAudio from '../hooks/useAudio'
import Background from '../components/Background'
import '../styles/play.css'

function Play() {
  const { user } = useAuth()
  const { playClickSound, playHoverSound } = useAudio()
  const navigate = useNavigate()
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const topics = [
    {
      id: 'components',
      title: 'Kodeks Komponen',
      description: 'Pelajari komponen dasar elektronika seperti resistor, capacitor, dan lainnya',
      icon: '⚡',
      color: '#fbbf24'
    },
    {
      id: 'circuits',
      title: 'Sihir Sirkuit',
      description: 'Kuasai rangkaian seri & paralel, Hukum Ohm, dan analisis sirkuit',
      icon: '🔮',
      color: '#60a5fa'
    },
    {
      id: 'practical',
      title: 'Alkimia Praktis',
      description: 'Eksperimen breadboard, proyek nyata, dan aplikasi dunia nyata',
      icon: '🧪',
      color: '#34d399'
    }
  ]

  useEffect(() => {
    fetchDailyChallenge()
  }, [user])

  const fetchDailyChallenge = async () => {
    try {
      await supabase.rpc('generate_daily_challenge')

      const today = new Date().toISOString().split('T')[0]
      const { data: challenge, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .maybeSingle()

      if (challengeError) throw challengeError

      if (challenge && user) {
        const { data: completion } = await supabase
          .from('user_daily_completions')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge_id', challenge.id)
          .maybeSingle()

        setChallengeCompleted(!!completion)
        setDailyChallenge(challenge)
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error)
    }
  }

  const handleTopicClick = (topicId) => {
    playClickSound()
    navigate(`/difficulty/${topicId}`)
  }

  const handleDailyChallengeClick = () => {
    if (dailyChallenge && !challengeCompleted) {
      playClickSound()
      navigate(`/laboratory/${dailyChallenge.topic}/${dailyChallenge.difficulty}?daily=true`)
    }
  }

  const handleBack = () => {
    playClickSound()
    navigate('/')
  }

  const getDifficultyText = (difficulty) => {
    const map = {
      'apprentice': 'Magang',
      'journeyman': 'Gesit',
      'master': 'Master'
    }
    return map[difficulty] || difficulty
  }

  const getTopicText = (topic) => {
    const map = {
      'components': 'Kodeks Komponen',
      'circuits': 'Sihir Sirkuit',
      'practical': 'Alkimia Praktis'
    }
    return map[topic] || topic
  }

  return (
    <div className="play-container">
      <Background />
      <div className="play-content">
        <button onClick={handleBack} className="back-button" onMouseEnter={playHoverSound}>
          ← Kembali
        </button>

        <h1 className="play-title">Pilih Petualanganmu</h1>

        {dailyChallenge && (
          <div
            className={`daily-challenge ${challengeCompleted ? 'completed' : ''}`}
            onClick={handleDailyChallengeClick}
            onMouseEnter={playHoverSound}
          >
            <div className="challenge-badge">
              <span className="challenge-icon">🌟</span>
              <span className="challenge-label">Tantangan Harian</span>
            </div>
            <div className="challenge-content">
              <h3 className="challenge-title">
                {getTopicText(dailyChallenge.topic)} - {getDifficultyText(dailyChallenge.difficulty)}
              </h3>
              <p className="challenge-description">{dailyChallenge.description}</p>
              <div className="challenge-reward">
                <span className="reward-icon">⭐</span>
                <span>+{dailyChallenge.bonus_xp} Bonus XP</span>
              </div>
            </div>
            {challengeCompleted && (
              <div className="completed-overlay">
                <span className="completed-text">✓ Selesai</span>
              </div>
            )}
          </div>
        )}

        <div className="topics-grid">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="topic-card"
              onClick={() => handleTopicClick(topic.id)}
              onMouseEnter={playHoverSound}
              style={{ '--topic-color': topic.color }}
            >
              <div className="topic-icon">{topic.icon}</div>
              <h2 className="topic-title">{topic.title}</h2>
              <p className="topic-description">{topic.description}</p>
              <div className="topic-arrow">→</div>
            </div>
          ))}
        </div>

        <footer className="footer">
          <p className="credit">by semesta</p>
        </footer>
      </div>
    </div>
  )
}

export default Play
