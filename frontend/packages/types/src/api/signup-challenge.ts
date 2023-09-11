import type { ChallengeData, Identifier, ObConfigAuth } from '../data';

export type SignupChallengeRequest = Identifier & {
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
