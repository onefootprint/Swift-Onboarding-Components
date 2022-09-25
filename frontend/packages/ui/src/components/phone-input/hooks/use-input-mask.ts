import type { CountryCode } from '@onefootprint/types';
import { useState } from 'react';

const useInputMask = (countryCode: CountryCode) => {
  const [currentCode, setCode] = useState<CountryCode | undefined>();
  const [isLoading, setLoading] = useState(true);
  const [masks, setMasks] = useState<Partial<Record<CountryCode, boolean>>>({});

  const loadMask = async (code: CountryCode) => {
    setLoading(true);
    try {
      await import(`cleave.js/dist/addons/cleave-phone.${code.toLowerCase()}`);
    } catch (_) {
      // do nothing
    }
    setMasks({ ...masks, [code]: true });
    setLoading(false);
  };

  if (!currentCode || currentCode !== countryCode) {
    setCode(countryCode);
    loadMask(countryCode);
  }

  return { isLoading, masks };
};

export default useInputMask;
