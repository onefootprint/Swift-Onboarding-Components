import { isEmail, isPhoneNumber } from '@onefootprint/core';

import type { IdentifyBootstrapData } from '../../components/identify-login/state/types';

const validateBootstrapData = (bootstrapData?: IdentifyBootstrapData) => {
  const { email = '', phoneNumber = '' } = bootstrapData || {};

  const validateField = (isValid: boolean, value: string) => {
    return isValid ? { value, isBootstrap: true } : undefined;
  };

  return {
    email: validateField(isEmail(email), email),
    phoneNumber: validateField(isPhoneNumber(phoneNumber), phoneNumber),
  };
};

export default validateBootstrapData;
