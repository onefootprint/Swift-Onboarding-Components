import { COUNTRIES, getCountryFromCode } from '@onefootprint/global-constants';

const useCountryOptions = (onlyUsSupported: boolean) => {
  if (onlyUsSupported) {
    return [getCountryFromCode('US')];
  }
  return COUNTRIES;
};

export default useCountryOptions;
