import { useLayoutEffect, useState } from 'react';
import useResizeObserver from 'use-resize-observer/polyfilled';

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

  useResizeObserver({
    ref: target as React.RefObject<HTMLElement>,
    onResize: newSize => {
      const { width, height } = newSize;
      if (!width || !height) {
        return;
      }
      setSize({ width, height });
    },
  });

  return size;
};

export default useSize;
