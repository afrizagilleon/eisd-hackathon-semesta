import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function SwitchNode({ data, selected }) {
  const isClosed = data.isClosed !== undefined ? data.isClosed : true;

  return (
    <div className={`circuit-node switch-node ${selected ? 'selected' : ''} ${isClosed ? 'closed' : 'open'}`}>
      {/* Pin 1 - Bidirectional (both source and target) */}
      <Handle
        type="target"
        position={Position.Left}
        id="pin1"
        className="handle-pin"
        title="Pin 1"
        style={{ top: '50%', left: 0 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="pin1-out"
        className="handle-pin"
        title="Pin 1"
        style={{ top: '50%', left: 0, opacity: 0 }}
      />
      {/* Pin 2 - Bidirectional (both source and target) */}
      <Handle
        type="target"
        position={Position.Right}
        id="pin2"
        className="handle-pin"
        title="Pin 2"
        style={{ top: '50%', right: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="pin2-out"
        className="handle-pin"
        title="Pin 2"
        style={{ top: '50%', right: 0, opacity: 0 }}
      />
      <div className="node-content">
        <div className="switch-symbol">
          <div className="switch-contact left"></div>
          <div className="switch-contact right"></div>
          <div className={`switch-lever ${isClosed ? 'closed' : 'open'}`}></div>
        </div>
        <div className="node-label">{data.label || 'Switch'}</div>
        <div className="node-value">{isClosed ? 'Closed' : 'Open'}</div>
      </div>
    </div>
  );
}

export default memo(SwitchNode);
