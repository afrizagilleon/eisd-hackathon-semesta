import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function BatteryNode({ data, selected }) {
  const isFlipped = data.flipped || false;

  return (
    <div className={`circuit-node battery-node ${selected ? 'selected' : ''} ${data.isPowered ? 'powered' : ''} ${isFlipped ? 'flipped' : ''}`}>
      <Handle
        type="source"
        position={isFlipped ? Position.Left : Position.Right}
        id="positive"
        className="handle-positive"
        title="Positive Terminal (+)"
        style={{ [isFlipped ? 'left' : 'right']: 0 }}
      />
      <Handle
        type="target"
        position={isFlipped ? Position.Right : Position.Left}
        id="negative"
        className="handle-negative"
        title="Negative Terminal (-)"
        style={{ [isFlipped ? 'right' : 'left']: 0 }}
      />
      <div className="node-content">
        <div className="battery-symbol">
          <div className="battery-bar short"></div>
          <div className="battery-bar long"></div>
        </div>
        <div className="terminal-label positive-label" style={{ [isFlipped ? 'left' : 'right']: '5px' }}>+</div>
        <div className="terminal-label negative-label" style={{ [isFlipped ? 'right' : 'left']: '5px' }}>-</div>
        <div className="node-label">{data.label || 'Battery'}</div>
        <div className="node-value">{data.voltage || '9V'}</div>
      </div>
    </div>
  );
}

export default memo(BatteryNode);
