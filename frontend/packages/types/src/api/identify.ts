import { ChallengeKind, Identifier } from '../data';

export type IdentifyRequest = {
  identifier: Identifier;
};

export type IdentifyResponse = {
  userFound: boolean;
  availableChallengeKinds?: ChallengeKind[];
};
