import { FootprintComponentKind } from '@onefootprint/footprint-components-js';
import { useEffect, useState } from 'react';

// We must have a unique containerId that remains stable across re-renders,
// in case there are multiple components on the same page
const useStableContainerId = (kind: FootprintComponentKind) => {
  const [containerId, setContainerId] = useState<string | null>(null);

  useEffect(() => {
    const randomSeed = Math.floor(Math.random() * 1000);
    setContainerId(`footprint-component-${kind}-${randomSeed}`);
  }, [kind]);

  return containerId;
};

export default useStableContainerId;
