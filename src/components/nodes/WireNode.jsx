import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function WireNode({ data, selected }) {
  return (
    <div className={`circuit-node wire-node ${selected ? 'selected' : ''} ${data.hasCurrent ? 'active' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="end1"
        className="handle-wire"
        title="Wire End 1"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="end2"
        className="handle-wire"
        title="Wire End 2"
      />
      <div className="node-content">
        <div className="wire-symbol">
          <div className="wire-line"></div>
        </div>
        <div className="node-label">{data.label || 'Wire'}</div>
      </div>
    </div>
  );
}

export default memo(WireNode);
