import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function LEDNode({ data, selected }) {
  const isFlipped = data.flipped || false;

  return (
    <div className={`circuit-node led-node ${selected ? 'selected' : ''} ${data.isLit ? 'lit' : ''} ${isFlipped ? 'flipped' : ''}`}>
      {/* Anode - Input only (receives current) */}
      <Handle
        type="target"
        position={isFlipped ? Position.Right : Position.Left}
        id="anode"
        className="handle-anode"
        title="Anode (+)"
        style={{ top: '50%', [isFlipped ? 'right' : 'left']: 0 }}
      />
      {/* Cathode - Bidirectional (outputs current, but can also receive connections) */}
      <Handle
        type="source"
        position={isFlipped ? Position.Left : Position.Right}
        id="cathode"
        className="handle-cathode"
        title="Cathode (-)"
        style={{ top: '50%', [isFlipped ? 'left' : 'right']: 0 }}
      />
      <Handle
        type="target"
        position={isFlipped ? Position.Left : Position.Right}
        id="cathode-in"
        className="handle-cathode"
        title="Cathode (-)"
        style={{ top: '50%', [isFlipped ? 'left' : 'right']: 0, opacity: 0 }}
      />
      <div className="node-content">
        <div className={`led-bulb ${data.isLit ? 'glowing' : ''}`}>
          <div className="led-core"></div>
          {data.isLit && (
            <>
              <div className="glow-ring ring-1"></div>
              <div className="glow-ring ring-2"></div>
              <div className="glow-ring ring-3"></div>
            </>
          )}
        </div>
        <div className="terminal-label anode-label" style={{ [isFlipped ? 'right' : 'left']: '5px' }}>+</div>
        <div className="terminal-label cathode-label" style={{ [isFlipped ? 'left' : 'right']: '5px' }}>-</div>
        <div className="node-label">{data.label || 'LED'}</div>
        <div className="node-value">{data.color || 'Red'}</div>
      </div>
    </div>
  );
}

export default memo(LEDNode);
