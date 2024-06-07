import { ChallengeKind } from '@onefootprint/types';

const shouldChallengeEmail = (isNoPhoneFlow: boolean, availableChallengeKinds?: ChallengeKind[]): boolean => {
  // If the user is not in the no-phone flow, don't go to email challenge
  if (!isNoPhoneFlow) {
    return false;
  }
  // If no challenge kinds are available, default to email (it must be a new user)
  if (!availableChallengeKinds) {
    return true;
  }

  // For existing users, we get available challenge kinds,
  // avoid going to email challenge if the user has other challenge kinds available
  if (
    availableChallengeKinds.includes(ChallengeKind.sms) ||
    availableChallengeKinds.includes(ChallengeKind.biometric)
  ) {
    return false;
  }
  return true;
};

export default shouldChallengeEmail;
