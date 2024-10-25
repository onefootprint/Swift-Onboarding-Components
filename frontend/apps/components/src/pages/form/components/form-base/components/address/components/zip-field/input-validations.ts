import type { CountryCode } from '@onefootprint/types';

type ZipcodeValidation = {
  mask?: { numericOnly: boolean };
  pattern?: RegExp;
  maxLength?: number;
  minLength?: number;
};

const getInputValidations = (countryCode: CountryCode): { zipcode: ZipcodeValidation } => {
  if (countryCode === 'US') {
    return {
      zipcode: {
        mask: { numericOnly: true },
        pattern: /^\d{5}$/,
        maxLength: 5,
        minLength: 5,
      },
    };
  }
  return {
    zipcode: {
      mask: undefined,
      maxLength: undefined,
      minLength: undefined,
      pattern: /.*/, // This pattern accepts any input
    },
  };
};

export default getInputValidations;
