import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function SwitchNode({ data, selected }) {
  const isClosed = data.isClosed !== undefined ? data.isClosed : true;

  return (
    <div className={`circuit-node switch-node ${selected ? 'selected' : ''} ${isClosed ? 'closed' : 'open'}`}>
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
