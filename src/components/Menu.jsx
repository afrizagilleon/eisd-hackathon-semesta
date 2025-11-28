import { useNavigate } from 'react-router-dom'
import useAudio from '../hooks/useAudio'

function Menu() {
  const { playClickSound, playHoverSound } = useAudio()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'play', label: 'Main', path: '/play' },
    { id: 'profile', label: 'Profil', path: '/profile' },
    { id: 'settings', label: 'Pengaturan', path: '/settings' }
  ]

  const handleClick = (e, item) => {
    e.preventDefault()
    playClickSound()

    e.currentTarget.style.color = '#fbbf24'
    e.currentTarget.style.textShadow = '0 0 20px rgba(251, 191, 36, 0.8)'

    setTimeout(() => {
      e.currentTarget.style.color = ''
      e.currentTarget.style.textShadow = ''
      navigate(item.path)
    }, 200)
  }

  const handleMouseEnter = () => {
    playHoverSound()
  }

  return (
    <nav className="menu">
      {menuItems.map(item => (
        <a
          key={item.id}
          href={item.path}
          className="menu-item"
          onClick={(e) => handleClick(e, item)}
          onMouseEnter={handleMouseEnter}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export default Menu
