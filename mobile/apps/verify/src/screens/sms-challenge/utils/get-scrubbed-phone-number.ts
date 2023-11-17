export type GetScrubbedPhoneNumberArgs = {
  phoneNumber: string;
};

// TODO: Phone nuumber may not always be scrubbed
const getScrubbedPhoneNumber = ({
  phoneNumber,
}: GetScrubbedPhoneNumberArgs): string => {
  if (phoneNumber) {
    const match = phoneNumber.match(/(\+\d{1,3} )?(.*)/);
    if (!match) {
      return '';
    }
    const countryCode = match[1] ? match[1] : '';
    const number = match[2];
    return (countryCode + number)
      .replaceAll('*', '•')
      .replaceAll(' ', '\u00A0')
      .replaceAll('-', '\u2011');
  }

  return '';
};

export default getScrubbedPhoneNumber;
