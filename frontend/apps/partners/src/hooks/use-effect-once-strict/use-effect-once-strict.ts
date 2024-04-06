import type { EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

const isProd = process.env.NODE_ENV === 'production';

const useEffectOnceStrictDev = (effect: EffectCallback) => {
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

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export default isProd ? useEffectOnce : useEffectOnceStrictDev;
