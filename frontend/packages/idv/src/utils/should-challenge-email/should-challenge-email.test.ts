import { ChallengeKind } from '@onefootprint/types';

import shouldChallengeEmail from './should-challenge-email';

describe('shouldChallengeEmail', () => {
  it('when in no-phone flow', () => {
    expect(shouldChallengeEmail(true)).toBe(true);
    expect(shouldChallengeEmail(true, [])).toBe(true);
    expect(shouldChallengeEmail(true, [ChallengeKind.sms])).toBe(false);
    expect(shouldChallengeEmail(true, [ChallengeKind.biometric])).toBe(false);
    expect(shouldChallengeEmail(true, [ChallengeKind.sms, ChallengeKind.biometric])).toBe(false);
    expect(shouldChallengeEmail(true, [ChallengeKind.email])).toBe(true);
  });

  it('when in normal flow', () => {
    expect(shouldChallengeEmail(false)).toBe(false);
    expect(shouldChallengeEmail(false, [])).toBe(false);
    expect(shouldChallengeEmail(false, [ChallengeKind.sms])).toBe(false);
    expect(shouldChallengeEmail(false, [ChallengeKind.biometric])).toBe(false);
    expect(shouldChallengeEmail(false, [ChallengeKind.sms, ChallengeKind.biometric])).toBe(false);
    expect(shouldChallengeEmail(false, [ChallengeKind.email])).toBe(false);
  });
});
