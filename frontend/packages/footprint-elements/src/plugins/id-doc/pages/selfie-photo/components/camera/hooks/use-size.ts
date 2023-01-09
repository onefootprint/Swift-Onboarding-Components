import useResizeObserver from '@react-hook/resize-observer';
import { useLayoutEffect, useState } from 'react';

// Used to track video element size as it gets mounted and/or resized.
// This size will be used to create a matching sized canvas to copy the
// video image over when captured.
const useSize = (target: React.RefObject<HTMLElement | undefined>) => {
  const [size, setSize] = useState<{
    width: number;
    height: number;
  }>();
  useLayoutEffect(() => {
    if (!target?.current) {
      return;
    }
    const rect = target?.current.getBoundingClientRect();
    setSize({
      width: rect.width,
      height: rect.height,
    });
  }, [target]);

  useResizeObserver(target as React.RefObject<HTMLElement>, entry =>
    setSize(entry.contentRect),
  );

  return size;
};

export default useSize;
