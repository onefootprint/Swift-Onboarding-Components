import { ChallengeData, ChallengeKind, IdentifyType } from '../data';

export type IdentifyRequest = {
  identifier: {
    email?: string;
    phoneNumber?: string;
  };
  identifyType: IdentifyType;
  preferredChallengeKind?: ChallengeKind;
};

export type IdentifyResponse = {
  userFound: boolean;
  challengeData?: ChallengeData;
  availableChallengeKinds?: ChallengeKind[];
};
