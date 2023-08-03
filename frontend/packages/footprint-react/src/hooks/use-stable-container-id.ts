import { useEffect, useState } from 'react';

// We must have a unique containerId that remains stable across re-renders,
// in case there are multiple components on the same page
const useStableContainerId = () => {
  const [containerId, setContainerId] = useState<string | null>(null);

  useEffect(() => {
    const randomSeed = Math.floor(Math.random() * 1000);
    setContainerId(`footprint-${randomSeed}`);
  }, []);

  return containerId;
};

export default useStableContainerId;
