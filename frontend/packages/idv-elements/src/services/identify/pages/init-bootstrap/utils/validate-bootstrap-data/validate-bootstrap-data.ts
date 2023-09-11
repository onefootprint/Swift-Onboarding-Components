import type { IdentifyBootstrapData } from '@onefootprint/types';
import { PhoneNumberUtil } from 'google-libphonenumber';
import IsEmail from 'isemail';

const SANDBOX_NUMBER = '+1 555-555-0100';

const validateBootstrapData = (bootstrapData?: IdentifyBootstrapData) => {
  if (!bootstrapData) {
    return { email: undefined, phoneNumber: undefined };
  }

  const { email, phoneNumber } = bootstrapData;
  const isEmailValid = email && IsEmail.validate(email ?? '');

  // Check if phone number is valid unless we are in sandbox mode
  // (since we have a special test number for sandbox)
  let isPhoneValid = false;
  if (phoneNumber) {
    const phoneUtils = PhoneNumberUtil.getInstance();
    const matchesSandboxNumber =
      phoneUtils.isNumberMatch(phoneNumber, SANDBOX_NUMBER) ===
      PhoneNumberUtil.MatchType.EXACT_MATCH;
    if (matchesSandboxNumber) {
      isPhoneValid = true;
    } else {
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
  }

  // Pass the email & phone along with their suffixes
  return {
    email: isEmailValid ? email : undefined,
    phoneNumber: isPhoneValid ? phoneNumber : undefined,
  };
};

export default validateBootstrapData;
