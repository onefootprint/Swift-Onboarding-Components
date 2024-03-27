const isPhoneCountryCode = (value: string) => /^[0-9]{1,3}$/.test(value);

export default isPhoneCountryCode;
