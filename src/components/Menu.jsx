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

  const handleClick = (path) => {
    playClickSound()
    setTimeout(() => {
      navigate(path)
    }, 100)
  }

  const handleMouseEnter = () => {
    playHoverSound()
  }

  return (
    <nav className="menu">
      {menuItems.map(item => (
        <button
          key={item.id}
          className="menu-item"
          onClick={() => handleClick(item.path)}
          onMouseEnter={handleMouseEnter}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export default Menu
