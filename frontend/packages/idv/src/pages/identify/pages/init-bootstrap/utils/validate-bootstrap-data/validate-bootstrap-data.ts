import { PhoneNumberUtil } from 'google-libphonenumber';
import IsEmail from 'isemail';

import { BootstrapData } from '../../../../../../types';

const validateBootstrapData = (bootstrapData?: BootstrapData) => {
  if (!bootstrapData) {
    return { email: undefined, phoneNumber: undefined };
  }

  const { email, phoneNumber } = bootstrapData;
  const isEmailValid = email && IsEmail.validate(email ?? '');

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

  // Pass the email & phone along with their suffixes
  return {
    email: isEmailValid ? email : undefined,
    phoneNumber: isPhoneValid ? phoneNumber : undefined,
  };
};

export default validateBootstrapData;
