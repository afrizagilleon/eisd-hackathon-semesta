import { useNavigate } from 'react-router-dom'
import Scene from '../components/Scene'
import Menu from '../components/Menu'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <Scene />
      <div className="content">
        <header className="header">
          <h1 className="title">ElectroQuest</h1>
          <p className="subtitle">Kuasai Seni Elektronika</p>
        </header>

        <Menu />

        <footer className="footer">
          <p className="credit">by semesta</p>
        </footer>
      </div>
    </div>
  )
}

export default Home
