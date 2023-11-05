import type { CountryCode } from '@onefootprint/types';
import { isCountryCode } from '@onefootprint/types';

const checkCountryCode = (value?: string | null): value is CountryCode => {
  if (!value) return false;
  return isCountryCode(value);
};

export default checkCountryCode;
