import { useEffect } from 'react'
import Scene from './components/Scene'
import Menu from './components/Menu'
import useAudio from './hooks/useAudio'

function App() {
  const { initializeAudio } = useAudio()

  useEffect(() => {
    initializeAudio()
    console.log('ElectroQuest initialized - Ready to learn electronics!')
  }, [])

  return (
    <div className="container">
      <Scene />
      <div className="content">
        <header className="header">
          <h1 className="title">ElectroQuest</h1>
          <p className="subtitle">Master the Art of Electronics</p>
        </header>

        <Menu />

        <footer className="footer">
          <p className="credit">by semesta</p>
        </footer>
      </div>
    </div>
  )
}

export default App
