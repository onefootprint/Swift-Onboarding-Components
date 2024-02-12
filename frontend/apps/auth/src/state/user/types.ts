import type { DecryptUserResponse } from '@onefootprint/types';

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
  phoneNumber: undefined | string;
  userDashboard: { [T in UserChallengeKind]?: DashboardEntry };
  verifyToken: undefined | string;
};

export type UserMachineEvents =
  | { type: 'decryptUserDone'; payload: DecryptUserResponse }
  | { type: 'goToBack' }
  | { type: 'setEmail'; payload: string }
  | { type: 'setPhoneNumber'; payload: string }
  | { type: 'setVerifyToken'; payload: string }
  | { type: 'updateEmail' }
  | { type: 'updatePasskey' }
  | { type: 'updatePhone' }
  | { type: 'updateUserDashboard'; payload: UserDashboardPayload };
