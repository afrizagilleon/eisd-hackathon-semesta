export function simulateCircuit(nodes, edges) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const results = {
    poweredNodes: new Set(),
    litLEDs: new Set(),
    activeComponents: new Set(),
    isComplete: false,
    hasShortCircuit: false
  };

  const batteryNodes = nodes.filter(n => n.type === 'battery');
  if (batteryNodes.length === 0) {
    return results;
  }

  function traceCircuit(startNodeId, startHandle, visitedEdges = new Set(), path = []) {
    const paths = [];
    const currentNode = nodeMap.get(startNodeId);

    if (!currentNode) return paths;

    path.push({ nodeId: startNodeId, handle: startHandle });
    results.poweredNodes.add(startNodeId);

    const outgoingEdges = edges.filter(edge =>
      edge.source === startNodeId &&
      edge.sourceHandle === startHandle &&
      !visitedEdges.has(edge.id)
    );

    for (const edge of outgoingEdges) {
      visitedEdges.add(edge.id);

      const targetNode = nodeMap.get(edge.target);
      if (!targetNode) continue;

      results.activeComponents.add(edge.target);

      if (targetNode.type === 'led') {
        results.litLEDs.add(edge.target);
      }

      if (targetNode.type === 'switch' && !targetNode.data.isClosed) {
        continue;
      }

      const nextHandles = getOutputHandles(targetNode, edge.targetHandle);

      for (const nextHandle of nextHandles) {
        if (edge.target === batteryNodes[0].id && nextHandle === 'negative') {
          paths.push([...path, { nodeId: edge.target, handle: nextHandle }]);
          results.isComplete = true;
        } else {
          const subPaths = traceCircuit(
            edge.target,
            nextHandle,
            new Set(visitedEdges),
            [...path]
          );
          paths.push(...subPaths);
        }
      }
    }

    return paths;
  }

  function getOutputHandles(node, inputHandle) {
    const outputMap = {
      battery: { positive: [], negative: [] },
      led: { anode: ['cathode'] },
      resistor: { pin1: ['pin2'], pin2: ['pin1'] },
      switch: { pin1: ['pin2'], pin2: ['pin1'] },
      wire: { end1: ['end2'], end2: ['end1'] }
    };

    return outputMap[node.type]?.[inputHandle] || [];
  }

  for (const battery of batteryNodes) {
    traceCircuit(battery.id, 'positive');
  }

  return results;
}

export function validateCircuitSolution(nodes, edges, expectedSolution) {
  const simulation = simulateCircuit(nodes, edges);

  if (!expectedSolution) {
    return {
      isCorrect: simulation.isComplete && simulation.litLEDs.size > 0,
      feedback: simulation.isComplete
        ? 'Circuit is complete and LED is lit!'
        : 'Circuit is not complete. Make sure to connect all components properly.',
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
      feedback: 'The LED should be lit. Check your connections.',
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
