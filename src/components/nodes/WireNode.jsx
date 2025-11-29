import { memo } from 'react';
import { Handle, Position } from 'reactflow';

function WireNode({ data, selected }) {
  return (
    <div className={`circuit-node wire-node ${selected ? 'selected' : ''} ${data.hasCurrent ? 'active' : ''}`}>
      {/* End 1 - Bidirectional (both source and target) */}
      <Handle
        type="target"
        position={Position.Left}
        id="end1"
        className="handle-wire"
        title="Wire End 1"
        style={{ top: '50%', left: 0 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="end1-out"
        className="handle-wire"
        title="Wire End 1"
        style={{ top: '50%', left: 0, opacity: 0 }}
      />
      {/* End 2 - Bidirectional (both source and target) */}
      <Handle
        type="target"
        position={Position.Right}
        id="end2"
        className="handle-wire"
        title="Wire End 2"
        style={{ top: '50%', right: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="end2-out"
        className="handle-wire"
        title="Wire End 2"
        style={{ top: '50%', right: 0, opacity: 0 }}
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
