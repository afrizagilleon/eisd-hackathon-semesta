import { useState, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import '../styles/puzzle.css'

const ItemTypes = {
  COMPONENT: 'component'
}

function DraggableComponent({ component, index, onPlace }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { component, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const getComponentIcon = (type) => {
    const icons = {
      battery: '🔋',
      resistor: '⚡',
      led: '💡',
      capacitor: '🔌',
      transistor: '🔧',
      motor: '⚙️',
      switch: '🎚️',
      button: '🔘',
      buzzer: '🔔',
      diode: '➡️',
      wire: '〰️',
      multimeter: '📊',
      breadboard: '🧱'
    }
    return icons[type] || '📦'
  }

  return (
    <div
      ref={drag}
      className={`component-item ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="component-icon">{getComponentIcon(component.type)}</div>
      <div className="component-label">{component.label}</div>
    </div>
  )
}

function DropZone({ position, component, onDrop, isConnected }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.COMPONENT,
    drop: (item) => onDrop(position, item.component),
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  const getComponentIcon = (type) => {
    const icons = {
      battery: '🔋',
      resistor: '⚡',
      led: '💡',
      capacitor: '🔌',
      transistor: '🔧',
      motor: '⚙️',
      switch: '🎚️',
      button: '🔘',
      buzzer: '🔔',
      diode: '➡️',
      wire: '〰️',
      multimeter: '📊',
      breadboard: '🧱'
    }
    return icons[type] || '📦'
  }

  return (
    <div
      ref={drop}
      className={`drop-zone ${isOver ? 'hover' : ''} ${component ? 'filled' : ''} ${isConnected ? 'connected' : ''}`}
    >
      {component ? (
        <>
          <div className="component-icon">{getComponentIcon(component.type)}</div>
          <div className="component-name">{component.label}</div>
        </>
      ) : (
        <div className="drop-placeholder">Drop komponen di sini</div>
      )}
    </div>
  )
}

function CircuitPuzzle({ experiment, onComplete, onHintRequest }) {
  const [placedComponents, setPlacedComponents] = useState({})
  const [connections, setConnections] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [usedHints, setUsedHints] = useState(0)
  const [currentHint, setCurrentHint] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const totalSlots = experiment.components.length + 2

  const handleDrop = useCallback((position, component) => {
    setPlacedComponents(prev => ({
      ...prev,
      [position]: component
    }))
  }, [])

  const handleSlotClick = (position) => {
    if (selectedSlot === null) {
      if (placedComponents[position]) {
        setSelectedSlot(position)
      }
    } else {
      if (selectedSlot !== position && placedComponents[position]) {
        const newConnection = { from: selectedSlot, to: position }
        setConnections(prev => [...prev, newConnection])
      }
      setSelectedSlot(null)
    }
  }

  const handleRemoveComponent = (position) => {
    setPlacedComponents(prev => {
      const updated = { ...prev }
      delete updated[position]
      return updated
    })
    setConnections(prev => prev.filter(c => c.from !== position && c.to !== position))
  }

  const handleRequestHint = () => {
    if (usedHints < experiment.max_hints) {
      setCurrentHint(experiment.hints[usedHints])
      setUsedHints(prev => prev + 1)
      if (onHintRequest) onHintRequest()
    }
  }

  const handleCheckSolution = () => {
    const allComponentsPlaced = experiment.components.every(comp =>
      Object.values(placedComponents).some(placed => placed.id === comp.id)
    )

    if (!allComponentsPlaced) {
      setCurrentHint('Semua komponen harus ditempatkan pada papan!')
      return
    }

    const hasEnoughConnections = connections.length >= 2

    if (!hasEnoughConnections) {
      setCurrentHint('Hubungkan komponen dengan mengklik dua komponen secara berurutan!')
      return
    }

    setShowSuccess(true)

    setTimeout(() => {
      if (onComplete) {
        onComplete({
          success: true,
          hintsUsed: usedHints,
          connections: connections
        })
      }
    }, 2000)
  }

  const isConnected = (position) => {
    return connections.some(c => c.from === position || c.to === position)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="circuit-puzzle">
        <div className="puzzle-instructions">
          <h3>Cara Bermain:</h3>
          <ol>
            <li>Drag komponen dari kotak komponen ke papan rangkaian</li>
            <li>Klik komponen pertama, lalu klik komponen kedua untuk menghubungkannya</li>
            <li>Klik kanan pada komponen untuk menghapusnya</li>
            <li>Gunakan hint jika kesulitan</li>
            <li>Tekan "Periksa Solusi" setelah selesai</li>
          </ol>
        </div>

        <div className="puzzle-area">
          <div className="components-drawer">
            <h3>Komponen Tersedia</h3>
            <div className="components-list">
              {experiment.components.map((component, index) => {
                const isPlaced = Object.values(placedComponents).some(p => p.id === component.id)
                return !isPlaced ? (
                  <DraggableComponent
                    key={component.id}
                    component={component}
                    index={index}
                    onPlace={handleDrop}
                  />
                ) : (
                  <div key={component.id} className="component-item placed-indicator">
                    <div className="component-icon">✓</div>
                    <div className="component-label">Terpasang</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="circuit-board">
            <h3>Papan Rangkaian</h3>
            <svg className="connection-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {connections.map((conn, idx) => {
                const fromEl = document.querySelector(`[data-position="${conn.from}"]`)
                const toEl = document.querySelector(`[data-position="${conn.to}"]`)

                if (fromEl && toEl) {
                  const fromRect = fromEl.getBoundingClientRect()
                  const toRect = toEl.getBoundingClientRect()
                  const containerRect = fromEl.closest('.circuit-board').getBoundingClientRect()

                  const x1 = fromRect.left + fromRect.width / 2 - containerRect.left
                  const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
                  const x2 = toRect.left + toRect.width / 2 - containerRect.left
                  const y2 = toRect.top + toRect.height / 2 - containerRect.top

                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                  )
                }
                return null
              })}
            </svg>

            <div className="drop-zones-grid">
              {Array.from({ length: totalSlots }).map((_, index) => (
                <div
                  key={index}
                  data-position={index}
                  onClick={() => handleSlotClick(index)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    handleRemoveComponent(index)
                  }}
                  style={{ position: 'relative' }}
                >
                  <DropZone
                    position={index}
                    component={placedComponents[index]}
                    onDrop={handleDrop}
                    isConnected={isConnected(index)}
                  />
                  {selectedSlot === index && (
                    <div className="selected-indicator">Dipilih</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="puzzle-controls">
          <button
            className="hint-button"
            onClick={handleRequestHint}
            disabled={usedHints >= experiment.max_hints}
          >
            💡 Hint ({usedHints}/{experiment.max_hints})
          </button>

          <button
            className="check-button"
            onClick={handleCheckSolution}
          >
            ✓ Periksa Solusi
          </button>
        </div>

        {currentHint && (
          <div className="hint-display">
            <div className="hint-icon">💡</div>
            <div className="hint-text">{currentHint}</div>
            <button className="hint-close" onClick={() => setCurrentHint(null)}>✕</button>
          </div>
        )}

        {showSuccess && (
          <div className="success-overlay">
            <div className="success-card">
              <div className="success-icon">🎉</div>
              <h2>Eksperimen Berhasil!</h2>
              <p>Kamu telah menyelesaikan rangkaian dengan benar!</p>
              <div className="success-stats">
                <div>Hint Digunakan: {usedHints}/{experiment.max_hints}</div>
                <div>XP yang Didapat: {experiment.base_xp - (usedHints * 10)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  )
}

export default CircuitPuzzle
