import { useEffect, useState } from 'react';

import { isClient } from './utils/measure-height';

// Once we ended up on the client, the first render must look the same as on
// the server so hydration happens without problems. _Then_ we immediately
// schedule a subsequent update and return the height measured on the client.
// It's not needed for CSR-only apps, but is critical for SSR.
const useWasRenderedOnClientAtLeastOnce = () => {
  const [wasRenderedOnClientAtLeastOnce, setWasRenderedOnClientAtLeastOnce] = useState(false);

  useEffect(() => {
    if (isClient()) {
      setWasRenderedOnClientAtLeastOnce(true);
    }
  }, []);

  return wasRenderedOnClientAtLeastOnce;
};

export default useWasRenderedOnClientAtLeastOnce;
