import type { AuthMethodKind, DecryptUserResponse, UserChallengeActionKind } from '@onefootprint/types';

import type { DeviceInfo } from '@/idv/hooks';

type DashboardEntryStatus = 'empty' | 'set';
type DashboardPayload = {
  kind: `${AuthMethodKind}`;
  entry: DashboardEntry;
};
type DashboardEntry = { label?: string; status: DashboardEntryStatus };

export type AuthMethodsMachineContext = {
  authToken: string;
  updateMethod: UserChallengeActionKind;
  userDashboard: { [T in AuthMethodKind]?: DashboardEntry };
  verifyToken: undefined | string;
  device?: DeviceInfo;
};

export type AuthMethodsMachineEvents =
  | { type: 'decryptUserDone'; payload: DecryptUserResponse }
  | { type: 'goToBack' }
  | { type: 'setDevice'; payload: DeviceInfo }
  | { type: 'setVerifyToken'; payload: string }
  | { type: 'updateEmail'; payload: UserChallengeActionKind }
  | { type: 'updatePasskey'; payload: UserChallengeActionKind }
  | { type: 'updatePhone'; payload: UserChallengeActionKind }
  | { type: 'updateUserDashboard'; payload: DashboardPayload };
