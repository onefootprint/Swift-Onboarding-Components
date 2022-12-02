import { PhoneNumberUtil } from 'google-libphonenumber';
import IsEmail from 'isemail';

const validateUserData = (userData: {
  email?: string;
  phoneNumber?: string;
}) => {
  const { email, phoneNumber } = userData;
  const isEmailValid = IsEmail.validate(email ?? '');

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

  return isEmailValid || isPhoneValid;
};

export default validateUserData;
