import { useNavigate, useParams } from 'react-router-dom'
import useAudio from '../hooks/useAudio'
import '../styles/difficulty.css'

function Difficulty() {
  const { topic } = useParams()
  const { playClickSound, playHoverSound } = useAudio()
  const navigate = useNavigate()

  const difficulties = [
    {
      id: 'apprentice',
      title: 'Ujian Magang',
      description: 'Eksperimen terpandu dengan petunjuk tersedia. Sempurna untuk pemula yang baru belajar.',
      icon: '🌱',
      color: '#34d399',
      multiplier: '1x XP'
    },
    {
      id: 'journeyman',
      title: 'Tantangan Gesit',
      description: 'Bantuan moderat, beberapa percobaan diperlukan. Untuk yang sudah memahami dasar-dasar.',
      icon: '⚔️',
      color: '#fbbf24',
      multiplier: '1.5x XP'
    },
    {
      id: 'master',
      title: 'Ujian Master',
      description: 'Panduan minimal, eksperimen murni. Hanya untuk yang berani menghadapi tantangan sejati.',
      icon: '👑',
      color: '#f87171',
      multiplier: '2.5x XP'
    }
  ]

  const topicTitles = {
    components: 'Kodeks Komponen',
    circuits: 'Sihir Sirkuit',
    practical: 'Alkimia Praktis'
  }

  const handleDifficultyClick = (difficultyId) => {
    playClickSound()
    navigate(`/laboratory/${topic}/${difficultyId}`)
  }

  const handleBack = () => {
    playClickSound()
    navigate('/play')
  }

  return (
    <div className="difficulty-container">
      <div className="difficulty-content">
        <button onClick={handleBack} className="back-button" onMouseEnter={playHoverSound}>
          ← Kembali
        </button>

        <div className="difficulty-header">
          <h1 className="difficulty-title">{topicTitles[topic] || topic}</h1>
          <p className="difficulty-subtitle">Pilih tingkat kesulitanmu</p>
        </div>

        <div className="difficulties-grid">
          {difficulties.map((difficulty) => (
            <div
              key={difficulty.id}
              className="difficulty-card"
              onClick={() => handleDifficultyClick(difficulty.id)}
              onMouseEnter={playHoverSound}
              style={{ '--difficulty-color': difficulty.color }}
            >
              <div className="difficulty-icon">{difficulty.icon}</div>
              <h2 className="difficulty-card-title">{difficulty.title}</h2>
              <p className="difficulty-description">{difficulty.description}</p>
              <div className="difficulty-multiplier">{difficulty.multiplier}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Difficulty
