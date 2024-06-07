import { PhoneNumberUtil } from 'google-libphonenumber';

const SANDBOX_NUMBER = '+1 555-555-0100';

// Check if phone number is valid unless we are in sandbox mode
// (since we have a special test number for sandbox)
const checkIsPhoneValid = (phoneNumber: string, isSandbox?: boolean) => {
  const phoneUtils = PhoneNumberUtil.getInstance();
  const matchesSandboxNumber =
    phoneUtils.isNumberMatch(phoneNumber, SANDBOX_NUMBER) === PhoneNumberUtil.MatchType.EXACT_MATCH;

  if (isSandbox && matchesSandboxNumber) {
    return true;
  }

  let isPhoneValid = false;
  try {
    const parsedPhoneNumber = phoneUtils.parseAndKeepRawInput(phoneNumber);
    const region = phoneUtils.getRegionCodeForNumber(parsedPhoneNumber);
    isPhoneValid = phoneUtils.isValidNumberForRegion(parsedPhoneNumber, region);
  } catch (_) {
    // do nothing
  }

  return isPhoneValid;
};

export default checkIsPhoneValid;
