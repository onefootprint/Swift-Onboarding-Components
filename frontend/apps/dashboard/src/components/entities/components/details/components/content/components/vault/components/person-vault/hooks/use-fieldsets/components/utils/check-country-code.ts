import { CountryCode, isCountryCode } from '@onefootprint/types';

const checkCountryCode = (value: any): value is CountryCode => {
  if (!value) return false;
  return isCountryCode(value);
};

export default checkCountryCode;
