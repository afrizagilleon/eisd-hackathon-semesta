import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function ResistorNode({ data, selected }) {
  return (
    <div className={`circuit-node resistor-node ${selected ? 'selected' : ''} ${data.hasCurrent ? 'active' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="pin1"
        className="handle-pin"
        title="Pin 1"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="pin2"
        className="handle-pin"
        title="Pin 2"
      />
      <div className="node-content">
        <div className="resistor-symbol">
          <div className="resistor-body">
            <div className="resistor-band band-1"></div>
            <div className="resistor-band band-2"></div>
            <div className="resistor-band band-3"></div>
            <div className="resistor-band band-4"></div>
          </div>
          <div className="resistor-lead left"></div>
          <div className="resistor-lead right"></div>
        </div>
        <div className="node-label">{data.label || 'Resistor'}</div>
        <div className="node-value">{data.resistance || '220Ω'}</div>
      </div>
    </div>
  );
}

export default memo(ResistorNode);
