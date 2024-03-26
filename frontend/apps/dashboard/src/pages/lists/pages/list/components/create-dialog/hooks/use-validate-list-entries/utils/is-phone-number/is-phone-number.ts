import isMobilePhone from 'validator/lib/isMobilePhone';

const isPhoneNumber = (phoneNumber: string) => isMobilePhone(phoneNumber);

export default isPhoneNumber;
