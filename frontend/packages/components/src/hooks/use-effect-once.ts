import type { EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

const useEffectOnce = (effect: EffectCallback) => {
  const firstRef = useRef(false);
  const effectRef = useRef(false);

  useEffect(() => {
    if (firstRef.current && !effectRef.current) {
      effectRef.current = true;
      effect();
    }
    return () => {
      firstRef.current = true;
    };
  }, [effect]);
};

export default useEffectOnce;
