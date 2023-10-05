import { ChallengeKind } from '@onefootprint/types';

import getScrubbedPhoneNumber from './get-scrubbed-phone-number';

describe('getScrubbedPhoneNumber', () => {
  it('handles empty or invalid args', () => {
    expect(getScrubbedPhoneNumber({})).toBe('');

    expect(
      getScrubbedPhoneNumber({
        successfulIdentifier: { email: '' },
        phoneNumber: '',
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
        },
      }),
    ).toBe('');

    expect(
      getScrubbedPhoneNumber({
        successfulIdentifier: { email: 'piip@onefootprint.com' },
        phoneNumber: '+1 (123) 456-7890',
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
        },
      }),
    ).toBe('');
  });

  it('correctly scrubs full phone number', () => {
    expect(
      getScrubbedPhoneNumber({
        successfulIdentifier: { phoneNumber: '+1 (123) 456-7890#test1' },
        phoneNumber: '+1 (123) 456-7891',
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
        },
      }),
    ).toBe('+1 (123) 456-7891');

    expect(
      getScrubbedPhoneNumber({
        successfulIdentifier: { phoneNumber: '+1 (123) 456-7890' },
        phoneNumber: '+1 (123) 456-7890',
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
        },
      }),
    ).toBe('+1 (123) 456-7890');

    expect(
      getScrubbedPhoneNumber({
        successfulIdentifier: { phoneNumber: '+55 48988124050' },
        phoneNumber: '+55 48988124050',
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
        },
      }),
    ).toBe('+55 48988124050');
  });

  it('converts scrubbed phone number challenge data to right format', () => {
    expect(
      getScrubbedPhoneNumber({
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
          scrubbedPhoneNumber: '+1 (***) ***-**00',
        },
      }),
    ).toBe('+1 (•••) •••-••00');

    expect(
      getScrubbedPhoneNumber({
        successfulIdentifier: { phoneNumber: '+1 (123) 456-7890' },
        phoneNumber: '+1 (123) 456-7890',
        challengeData: {
          challengeToken: 'token',
          challengeKind: ChallengeKind.sms,
          scrubbedPhoneNumber: '+1 (***) ***-**90',
        },
      }),
    ).toBe('+1 (123) 456-7890');
  });
});
