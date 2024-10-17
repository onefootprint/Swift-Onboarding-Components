import { useLayoutEffect, useState } from 'react';
import useResizeObserver from 'use-resize-observer'; // useResizeObserver is now available in usehooks-ts@2.13.0

// Used to track video element size as it gets mounted and/or resized.
// This size will be used to create a matching sized canvas to copy the
// video image over when captured.
const useSize = (target: React.RefObject<HTMLVideoElement | undefined>) => {
  const [size, setSize] = useState<{ width: number; height: number }>();

  useLayoutEffect(() => {
    if (!target?.current) return;

    const { width, height } = target.current.getBoundingClientRect();
    if (width && height) {
      setSize({ width, height });
    }
  }, [target]);

  useResizeObserver({
    ref: target.current,
    onResize: ({ width, height }) => {
      if (width && height) {
        setSize({ width, height });
      }
    },
  });

  return size;
};

export default useSize;
