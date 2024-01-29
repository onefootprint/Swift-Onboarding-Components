import type {
  ChallengeData,
  ChallengeKind,
  DecryptUserResponse,
  IdentifyResponse,
} from '@onefootprint/types';

import type { UserChallengeResponse } from '@/src/queries';
import type { UserChallengeKind } from '@/src/types';

type DashboardEntryStatus = 'empty' | 'set';
type UserDashboardPayload = {
  kind: `${UserChallengeKind}`;
  entry: DashboardEntry;
};
type DashboardEntry = { label?: string; status: DashboardEntryStatus };

export type UserMachineContext = {
  authToken: string;
  email: undefined | string;
  emailChallenge: undefined | ChallengeData;
  emailReplaceChallenge: undefined | UserChallengeResponse;
  kindToChallenge: undefined | ChallengeKind;
  passkeyChallenge: undefined | ChallengeData;
  passkeyReplaceChallenge: undefined | UserChallengeResponse;
  phoneChallenge: undefined | ChallengeData;
  phoneNumber: undefined | string;
  phoneReplaceChallenge: undefined | UserChallengeResponse;
  userDashboard: { [T in UserChallengeKind]?: DashboardEntry };
  userFound: undefined | NonNullable<IdentifyResponse>;
  verifyToken: undefined | string;
};

export type UserMachineEvents =
  | { type: 'decryptUserDone'; payload: DecryptUserResponse }
  | { type: 'goToBack' }
  | { type: 'goToChallenge'; payload: ChallengeKind }
  | { type: 'goToSmsChallenge' }
  | { type: 'identifyUserDone'; payload: IdentifyResponse }
  | { type: 'identifyUserFailed' }
  | { type: 'setChallengeKind'; payload: ChallengeKind }
  | { type: 'setEmail'; payload: string }
  | { type: 'setEmailChallenge'; payload: ChallengeData }
  | { type: 'setEmailReplaceChallenge'; payload: UserChallengeResponse }
  | { type: 'setPasskeyChallenge'; payload: ChallengeData }
  | { type: 'setPhoneChallenge'; payload: ChallengeData }
  | { type: 'setPhoneNumber'; payload: string }
  | { type: 'setSmsReplaceChallenge'; payload: UserChallengeResponse }
  | { type: 'setVerifyToken'; payload: string }
  | { type: 'updateEmail' }
  | { type: 'updatePasskey' }
  | { type: 'updatePhone' }
  | { type: 'updateUserDashboard'; payload: UserDashboardPayload };
