import { useEffect, useState } from 'react';

import useWasRenderedOnClientAtLeastOnce from './use-was-rendered-on-client';
import { measureHeight } from './utils/measure-height';

const use100vh = () => {
  const [height, setHeight] = useState<number | null>(measureHeight);

  const wasRenderedOnClientAtLeastOnce = useWasRenderedOnClientAtLeastOnce();

  useEffect(() => {
    if (!wasRenderedOnClientAtLeastOnce) {
      return undefined;
    }

    function setMeasuredHeight() {
      const measuredHeight = measureHeight();
      setHeight(measuredHeight);
    }

    window.addEventListener('resize', setMeasuredHeight);
    return () => {
      window.removeEventListener('resize', setMeasuredHeight);
    };
  }, [wasRenderedOnClientAtLeastOnce]);

  return wasRenderedOnClientAtLeastOnce ? height : null;
};

export default use100vh;
