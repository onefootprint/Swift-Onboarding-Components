import type { ChallengeData, Identifier } from '@onefootprint/types';

export type GetScrubbedPhoneNumberArgs = {
  successfulIdentifier?: Identifier;
  phoneNumber?: string;
  challengeData?: ChallengeData;
};

const getScrubbedPhoneNumber = ({
  successfulIdentifier,
  phoneNumber,
  challengeData,
}: GetScrubbedPhoneNumberArgs): string => {
  const identifyPhone = successfulIdentifier && 'phoneNumber' in successfulIdentifier ? phoneNumber : null;

  if (identifyPhone) {
    const match = identifyPhone.match(/(\+\d{1,3} )?(.*)/);
    if (!match) {
      return '';
    }
    const countryCode = match[1] ? match[1] : '';
    const number = match[2];
    return (countryCode + number).replaceAll(' ', '\u00A0').replaceAll('-', '\u2011');
  }

  const challengePhone = challengeData?.scrubbedPhoneNumber;
  if (challengePhone) {
    return challengePhone.replaceAll('*', '•').replaceAll(' ', '\u00A0').replaceAll('-', '\u2011');
  }

  return '';
};

export default getScrubbedPhoneNumber;
