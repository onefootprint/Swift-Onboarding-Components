import { PhoneNumberUtil } from 'google-libphonenumber';

import { BootstrapData } from '../state-machine/bifrost/types';

const validateBootstrapData = (bootstrapData: BootstrapData) => {
  const { email, phoneNumber } = bootstrapData;
  const validatedData: BootstrapData = {
    email,
  };

  let isPhoneValid = false;
  if (phoneNumber) {
    const phoneUtils = PhoneNumberUtil.getInstance();
    try {
      const parsedPhoneNumber = phoneUtils.parseAndKeepRawInput(phoneNumber);
      const region = phoneUtils.getRegionCodeForNumber(parsedPhoneNumber);
      isPhoneValid = phoneUtils.isValidNumberForRegion(
        parsedPhoneNumber,
        region,
      );
    } catch (_) {
      // do nothing
    }
  }
  if (isPhoneValid) {
    validatedData.phoneNumber = phoneNumber;
  }

  return validatedData;
};

export default validateBootstrapData;
