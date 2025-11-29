import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function BatteryNode({ data, selected }) {
  return (
    <div className={`circuit-node battery-node ${selected ? 'selected' : ''} ${data.isPowered ? 'powered' : ''}`}>
      <Handle
        type="source"
        position={Position.Right}
        id="positive"
        className="handle-positive"
        title="Positive Terminal (+)"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="negative"
        className="handle-negative"
        title="Negative Terminal (-)"
      />
      <div className="node-content">
        <div className="battery-symbol">
          <div className="battery-bar short"></div>
          <div className="battery-bar long"></div>
        </div>
        <div className="terminal-label positive-label">+</div>
        <div className="terminal-label negative-label">-</div>
        <div className="node-label">{data.label || 'Battery'}</div>
        <div className="node-value">{data.voltage || '9V'}</div>
      </div>
    </div>
  );
}

export default memo(BatteryNode);
