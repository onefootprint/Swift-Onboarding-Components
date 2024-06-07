import type { ReadonlyURLSearchParams } from 'next/navigation';

const omitSearchParams = (keysToIgnore: string[], readOnlyParams: ReadonlyURLSearchParams): URLSearchParams => {
  const out = new URLSearchParams();

  readOnlyParams.forEach((value, key) => {
    if (!keysToIgnore.includes(key)) {
      out.append(key, String(value));
    }
  });

  return out;
};

export default omitSearchParams;
