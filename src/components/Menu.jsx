import useAudio from '../hooks/useAudio'

function Menu() {
  const { playClickSound, playHoverSound } = useAudio()

  const menuItems = [
    { id: 'learn', label: 'Begin Your Journey', href: '#learn' },
    { id: 'components', label: 'Component Library', href: '#components' },
    { id: 'projects', label: 'Quest Projects', href: '#projects' },
    { id: 'community', label: 'Join the Guild', href: '#community' }
  ]

  const handleClick = (e, target) => {
    e.preventDefault()
    playClickSound()

    e.currentTarget.style.color = '#fbbf24'
    e.currentTarget.style.textShadow = '0 0 20px rgba(251, 191, 36, 0.8)'

    setTimeout(() => {
      e.currentTarget.style.color = ''
      e.currentTarget.style.textShadow = ''
    }, 200)

    console.log(`Navigating to: ${target}`)
  }

  const handleMouseEnter = () => {
    playHoverSound()
  }

  return (
    <nav className="menu">
      {menuItems.map(item => (
        <a
          key={item.id}
          href={item.href}
          className="menu-item"
          onClick={(e) => handleClick(e, item.id)}
          onMouseEnter={handleMouseEnter}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export default Menu
