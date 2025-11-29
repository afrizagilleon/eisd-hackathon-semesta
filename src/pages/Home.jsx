import { useNavigate } from 'react-router-dom'
import Scene from '../components/Scene'
import Menu from '../components/Menu'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <Scene />
      <div className="content">
        <p className="credit-top-right">by semesta</p>
        <header className="header">
          <h1 className="title">ElectroQuest</h1>
          <p className="subtitle">Kuasai Seni Elektronika</p>
          <Menu />
        </header>
      </div>
    </div>
  )
}

export default Home
