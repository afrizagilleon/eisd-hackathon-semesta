import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background as FlowBackground,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/puzzle.css';

import BatteryNode from './nodes/BatteryNode';
import LEDNode from './nodes/LEDNode';
import ResistorNode from './nodes/ResistorNode';
import SwitchNode from './nodes/SwitchNode';
import WireNode from './nodes/WireNode';

import { simulateCircuit, validateCircuitSolution } from '../utils/circuitSimulator';

let nodeIdCounter = 0;

const nodeTypes = {
  battery: BatteryNode,
  led: LEDNode,
  resistor: ResistorNode,
  switch: SwitchNode,
  wire: WireNode
};

function CircuitPuzzle({ experiment, onComplete, onHintRequest }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [usedHints, setUsedHints] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  if (!experiment) {
    return <div className="circuit-puzzle">Loading experiment...</div>;
  }

  useEffect(() => {
    if (experiment?.components) {
      setAvailableComponents(experiment.components.map(comp => ({ ...comp, placed: false })));
    }
  }, [experiment]);

  const simulation = useMemo(() => {
    return simulateCircuit(nodes, edges);
  }, [nodes, edges]);

  const enrichedNodes = useMemo(() => {
    return nodes.map(node => {
      const isLit = simulation.litLEDs.has(node.id);
      const isPowered = simulation.poweredNodes.has(node.id);
      const hasCurrent = simulation.activeComponents.has(node.id);

      return {
        ...node,
        data: {
          ...node.data,
          isLit: node.type === 'led' ? isLit : node.data.isLit,
          isPowered: node.type === 'battery' ? isPowered : node.data.isPowered,
          hasCurrent: hasCurrent
        }
      };
    });
  }, [nodes, simulation]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'default',
        animated: true,
        style: { stroke: '#fbbf24', strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#fbbf24'
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleAddComponent = (component) => {
    const nodeId = `node-${nodeIdCounter++}`;
    const newNode = {
      id: nodeId,
      type: component.type,
      position: { x: 250 + Math.random() * 100, y: 100 + Math.random() * 100 },
      data: {
        label: component.label,
        voltage: component.voltage,
        resistance: component.resistance,
        color: component.color,
        isClosed: component.isClosed !== undefined ? component.isClosed : true
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setAvailableComponents((comps) =>
      comps.map((c) => (c.id === component.id ? { ...c, placed: true } : c))
    );
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setAvailableComponents(
      experiment.components.map(comp => ({ ...comp, placed: false }))
    );
    setCurrentHint(null);
    setValidationResult(null);
    nodeIdCounter = 0;
  };

  const handleRequestHint = () => {
    if (usedHints < experiment.max_hints) {
      setCurrentHint(experiment.hints[usedHints]);
      setUsedHints((prev) => prev + 1);
      if (onHintRequest) onHintRequest();
    }
  };

  const handleCheckSolution = () => {
    const requiredTypes = experiment.components.map(c => c.type);
    const placedTypes = nodes.map(n => n.type);

    const missingComponents = requiredTypes.filter(
      type => !placedTypes.includes(type)
    );

    if (missingComponents.length > 0) {
      setCurrentHint(`Komponen yang belum ditempatkan: ${missingComponents.join(', ')}`);
      return;
    }

    if (edges.length === 0) {
      setCurrentHint('Hubungkan komponen dengan menarik dari handle satu komponen ke handle komponen lain!');
      return;
    }

    const result = validateCircuitSolution(nodes, edges, experiment.expectedSolution);
    setValidationResult(result);

    if (result.isCorrect) {
      setShowSuccess(true);
    } else {
      setCurrentHint(result.feedback);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    if (onComplete) {
      onComplete({
        success: true,
        hintsUsed: usedHints,
        connections: edges.length
      });
    }
  };

  const onNodeDoubleClick = useCallback((event, node) => {
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));

    const componentType = node.type;
    setAvailableComponents((comps) =>
      comps.map((c) => {
        if (c.type === componentType && c.placed) {
          return { ...c, placed: false };
        }
        return c;
      })
    );
  }, [setNodes, setEdges]);

  return (
    <div className="circuit-puzzle">

      <div className="puzzle-instructions">
        <h3>Cara Bermain:</h3>
        <ol>
          <li>Klik komponen dari panel kiri untuk menambahkannya ke canvas</li>
          <li>Drag komponen untuk memposisikannya</li>
          <li>Tarik dari handle (titik koneksi) satu komponen ke handle komponen lain untuk menghubungkan</li>
          <li>Double-click komponen untuk menghapusnya</li>
          <li>Perhatikan LED menyala ketika rangkaian benar!</li>
          <li>Klik "Periksa Solusi" setelah selesai</li>
        </ol>
      </div>

      <div className="puzzle-area">
        <div className="components-drawer">
          <h3>Komponen Tersedia</h3>
          <div className="components-list">
            {availableComponents.map((component) => (
              <button
                key={component.id}
                className={`component-item ${component.placed ? 'placed' : ''}`}
                onClick={() => !component.placed && handleAddComponent(component)}
                disabled={component.placed}
              >
                <div className="component-label">{component.label}</div>
                {component.placed && <div className="placed-badge">Terpasang</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="circuit-canvas-container">
          <ReactFlow
            nodes={enrichedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            className="circuit-canvas"
          >
            <FlowBackground color="#374151" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (simulation.litLEDs.has(node.id)) return '#fbbf24';
                if (simulation.poweredNodes.has(node.id)) return '#10b981';
                return '#6b7280';
              }}
            />
          </ReactFlow>
        </div>
      </div>

      <div className="puzzle-controls">
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>

        <button
          className="hint-button"
          onClick={handleRequestHint}
          disabled={usedHints >= experiment.max_hints}
        >
          Hint ({usedHints}/{experiment.max_hints})
        </button>

        <button className="check-button" onClick={handleCheckSolution}>
          Periksa Solusi
        </button>
      </div>

      {currentHint && (
        <div className="hint-display">
          <div className="hint-icon">💡</div>
          <div className="hint-text">{currentHint}</div>
          <button className="hint-close" onClick={() => setCurrentHint(null)}>
            ✕
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="success-overlay" onClick={handleCloseSuccess}>
          <div className="success-card" onClick={(e) => e.stopPropagation()}>
            <button className="success-close" onClick={handleCloseSuccess}>
              ✕
            </button>
            <div className="success-icon">🎉</div>
            <h2>Eksperimen Berhasil!</h2>
            <p>Kamu telah menyelesaikan rangkaian dengan benar!</p>
            <div className="success-stats">
              <div>Hint Digunakan: {usedHints}/{experiment.max_hints}</div>
              <div>XP yang Didapat: {experiment.base_xp - usedHints * 10}</div>
            </div>
            <div className="success-actions">
              <button className="success-continue-btn" onClick={handleCloseSuccess}>
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CircuitPuzzle;
