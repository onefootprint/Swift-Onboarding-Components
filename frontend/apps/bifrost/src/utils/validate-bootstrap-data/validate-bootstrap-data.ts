import { PhoneNumberUtil } from 'google-libphonenumber';
import IsEmail from 'isemail';

import { BootstrapData } from '../state-machine/bifrost/types';

const validateBootstrapData = (bootstrapData: BootstrapData) => {
  // Strip any sandbox suffixes before checking for validity.
  const { email, phoneNumber } = bootstrapData;

  const emailParts = email?.split('#') ?? [];
  const emailBody = emailParts.length >= 1 ? emailParts[0] : undefined;
  const isEmailBodyValid = emailBody && IsEmail.validate(emailBody ?? '');

  let isPhoneBodyValid = false;
  const phoneParts = phoneNumber?.split('#') ?? [];
  const phoneBody = phoneParts.length >= 1 ? phoneParts[0] : undefined;
  if (phoneBody) {
    const phoneUtils = PhoneNumberUtil.getInstance();
    try {
      const parsedPhoneNumber = phoneUtils.parseAndKeepRawInput(phoneBody);
      const region = phoneUtils.getRegionCodeForNumber(parsedPhoneNumber);
      isPhoneBodyValid = phoneUtils.isValidNumberForRegion(
        parsedPhoneNumber,
        region,
      );
    } catch (_) {
      // do nothing
    }
  }

  // Pass the email & phone along with their suffixes
  return {
    email: isEmailBodyValid ? email : undefined,
    phoneNumber: isPhoneBodyValid ? phoneNumber : undefined,
  };
};

export default validateBootstrapData;
