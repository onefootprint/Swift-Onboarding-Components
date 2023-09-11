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
}: GetScrubbedPhoneNumberArgs) => {
  const identifyPhone =
    successfulIdentifier && 'phoneNumber' in successfulIdentifier
      ? phoneNumber
      : null;

  if (identifyPhone) {
    const match = identifyPhone.match(/(\+\d{1,3} )?(.*)/);
    if (!match) {
      return '';
    }
    const countryCode = match[1] ? match[1] : '';
    const number = match[2];
    const scrubbed = number.replace(/\d(?!\d{0,1}$)/g, '•');
    return countryCode + scrubbed;
  }

  const challengePhone = challengeData?.scrubbedPhoneNumber;
  if (challengePhone) {
    return challengePhone.replaceAll('*', '•');
  }

  return '';
};

export default getScrubbedPhoneNumber;
