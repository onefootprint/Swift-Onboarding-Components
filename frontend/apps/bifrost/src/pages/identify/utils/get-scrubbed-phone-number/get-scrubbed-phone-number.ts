import { ChallengeData, Identifier } from '@onefootprint/types';

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

  // Manually scrub the phone number
  if (identifyPhone) {
    const regex = /([0-9]{2,})/gi;
    const lastTwoChars = identifyPhone.slice(-2);
    const scrubbed = identifyPhone.replaceAll(regex, (substring: string) =>
      Array(substring.length).fill('•').join(''),
    );
    const withLastTwo = `${scrubbed.slice(0, -2)}${lastTwoChars}`;
    const paranthesesStart = withLastTwo.indexOf('•');
    const paranthesesEnd = paranthesesStart + 3;
    return `${withLastTwo.slice(0, paranthesesStart)}(${withLastTwo.slice(
      paranthesesStart,
      paranthesesEnd,
    )})${withLastTwo.slice(paranthesesEnd)}`;
  }

  // Fix the format of the scrubbed phone number from challenge
  const challengePhone = challengeData?.scrubbedPhoneNumber;
  if (challengePhone) {
    return challengePhone.replaceAll('*', '•').replaceAll('-', ' ');
  }

  return '';
};

export default getScrubbedPhoneNumber;
