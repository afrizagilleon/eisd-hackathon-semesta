export function simulateCircuit(nodes, edges) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const results = {
    poweredNodes: new Set(),
    litLEDs: new Set(),
    activeComponents: new Set(),
    isComplete: false,
    hasShortCircuit: false,
    completePaths: [],
    currentFlowEdges: new Map() // Maps edge.id -> direction ('forward' or 'reverse')
  };

  const batteryNodes = nodes.filter(n => n.type === 'battery');
  if (batteryNodes.length === 0) {
    return results;
  }

  const battery = batteryNodes[0];

  // Normalize handle IDs (remove -out or -in suffix for bidirectional components)
  function normalizeHandle(handleId) {
    if (!handleId) return handleId;
    return handleId.replace(/-(out|in)$/, '');
  }

  // Helper function to get output handles based on input handle
  function getOutputHandles(node, inputHandle) {
    const normalized = normalizeHandle(inputHandle);
    const outputMap = {
      battery: { positive: [], negative: [] },
      led: { anode: ['cathode'], cathode: [] }, // LED only allows current anode -> cathode
      resistor: { pin1: ['pin2', 'pin2-out'], pin2: ['pin1', 'pin1-out'] }, // Bidirectional
      switch: { pin1: ['pin2', 'pin2-out'], pin2: ['pin1', 'pin1-out'] }, // Bidirectional
      wire: { end1: ['end2', 'end2-out'], end2: ['end1', 'end1-out'] } // Bidirectional
    };

    return outputMap[node.type]?.[normalized] || [];
  }

  // Trace all possible paths from battery positive to battery negative
  function traceCircuit(currentNodeId, currentHandle, visitedEdges = new Set(), path = [], edgePath = []) {
    const completePaths = [];
    const currentNode = nodeMap.get(currentNodeId);

    if (!currentNode) return completePaths;

    // Add current position to path (with normalized handle)
    const normalizedHandle = normalizeHandle(currentHandle);
    const currentStep = { nodeId: currentNodeId, handle: normalizedHandle, type: currentNode.type };
    const newPath = [...path, currentStep];

    // Find all outgoing edges from current handle (check both normalized and original)
    const outgoingEdges = edges.filter(edge =>
      edge.source === currentNodeId &&
      (normalizeHandle(edge.sourceHandle) === normalizedHandle) &&
      !visitedEdges.has(edge.id)
    );

    for (const edge of outgoingEdges) {
      const newVisited = new Set(visitedEdges);
      newVisited.add(edge.id);

      const targetNode = nodeMap.get(edge.target);
      if (!targetNode) continue;

      const normalizedTargetHandle = normalizeHandle(edge.targetHandle);
      const newEdgePath = [...edgePath, { edgeId: edge.id, direction: 'forward' }];

      // Check if we've reached the battery negative terminal (complete circuit!)
      if (edge.target === battery.id && normalizedTargetHandle === 'negative') {
        const completePath = [...newPath, {
          nodeId: edge.target,
          handle: 'negative',
          type: targetNode.type
        }];
        completePaths.push({ path: completePath, edges: newEdgePath });
        continue;
      }

      // Handle switch - if open, current cannot flow through
      if (targetNode.type === 'switch' && targetNode.data.isClosed === false) {
        continue;
      }

      // Get the next possible handles from the target node
      const nextHandles = getOutputHandles(targetNode, normalizedTargetHandle);

      for (const nextHandle of nextHandles) {
        const subPaths = traceCircuit(
          edge.target,
          nextHandle,
          newVisited,
          newPath,
          newEdgePath
        );
        completePaths.push(...subPaths);
      }
    }

    return completePaths;
  }

  // Start tracing from battery positive terminal
  const allCompletePaths = traceCircuit(battery.id, 'positive');
  results.completePaths = allCompletePaths;

  // If we found at least one complete path, mark the circuit as complete
  if (allCompletePaths.length > 0) {
    results.isComplete = true;

    // Mark all components in complete paths as powered/active
    for (const pathData of allCompletePaths) {
      const path = pathData.path;
      const edgePath = pathData.edges;

      // Record current flow direction for each edge
      for (const edgeInfo of edgePath) {
        results.currentFlowEdges.set(edgeInfo.edgeId, edgeInfo.direction);
      }

      for (const step of path) {
        results.poweredNodes.add(step.nodeId);
        results.activeComponents.add(step.nodeId);

        // Check if LED should light up (must be in correct polarity)
        if (step.type === 'led') {
          // Find if current enters through anode in this path
          const stepIndex = path.indexOf(step);
          if (stepIndex > 0) {
            const previousStep = path[stepIndex - 1];
            // Find the edge connecting previous to current
            const connectingEdge = edges.find(e =>
              e.source === previousStep.nodeId &&
              e.target === step.nodeId
            );

            // LED lights up only if current enters through anode
            if (connectingEdge && normalizeHandle(connectingEdge.targetHandle) === 'anode') {
              results.litLEDs.add(step.nodeId);
            }
          }
        }
      }
    }
  }

  return results;
}

export function validateCircuitSolution(nodes, edges, expectedSolution) {
  const simulation = simulateCircuit(nodes, edges);

  // If no expected solution provided, just check if circuit is complete
  if (!expectedSolution) {
    const isComplete = simulation.isComplete;
    const hasLED = nodes.some(n => n.type === 'led');
    const ledIsLit = simulation.litLEDs.size > 0;

    // Success if circuit is complete and (no LED or LED is lit)
    const isCorrect = isComplete && (!hasLED || ledIsLit);

    return {
      isCorrect,
      feedback: isCorrect
        ? 'Perfect! Your circuit is correct and working as expected!'
        : !isComplete
        ? 'Circuit is not complete. Make sure to connect all components from battery positive to negative.'
        : 'The LED should be lit. Check the polarity (anode = +, cathode = -).',
      simulation
    };
  }

  const requiredComponents = expectedSolution.components || [];
  const placedTypes = nodes.map(n => n.type);

  const hasAllComponents = requiredComponents.every(comp =>
    placedTypes.includes(comp.type)
  );

  if (!hasAllComponents) {
    return {
      isCorrect: false,
      feedback: 'Not all required components are placed.',
      simulation
    };
  }

  // Check if circuit is complete (has a path from battery+ to battery-)
  if (!simulation.isComplete) {
    return {
      isCorrect: false,
      feedback: 'Circuit is not complete. Make sure to connect all components from battery positive to negative.',
      simulation
    };
  }

  const requiredConnections = expectedSolution.connections || [];
  const hasRequiredConnections = requiredConnections.length === 0 ||
    requiredConnections.every(conn => {
      return edges.some(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        return sourceNode?.type === conn.from && targetNode?.type === conn.to;
      });
    });

  if (!hasRequiredConnections) {
    return {
      isCorrect: false,
      feedback: 'Some required connections are missing or incorrect.',
      simulation
    };
  }

  const shouldLightLED = expectedSolution.shouldLightLED !== false;
  const ledIsLit = simulation.litLEDs.size > 0;

  if (shouldLightLED && !ledIsLit) {
    return {
      isCorrect: false,
      feedback: 'The LED should be lit. Check your connections and LED polarity (anode = +, cathode = -).',
      simulation
    };
  }

  if (!shouldLightLED && ledIsLit) {
    return {
      isCorrect: false,
      feedback: 'The LED should not be lit in this configuration.',
      simulation
    };
  }

  return {
    isCorrect: true,
    feedback: 'Perfect! Your circuit is correct and working as expected!',
    simulation
  };
}
