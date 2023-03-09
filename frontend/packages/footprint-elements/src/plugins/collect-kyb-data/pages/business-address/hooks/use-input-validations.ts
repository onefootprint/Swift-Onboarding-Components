import type { CountryCode } from '@onefootprint/types';

const useInputValidations = (countryCode: CountryCode) => {
  if (countryCode === 'US') {
    return {
      zip: {
        mask: {
          numericOnly: true,
        },
        pattern: /^\d{5}$/,
        maxLength: 5,
        minLength: 5,
      },
    };
  }
  return {
    zip: {
      mask: undefined,
      maxLength: undefined,
      minLength: undefined,
      pattern: undefined,
    },
  };
};

export default useInputValidations;
