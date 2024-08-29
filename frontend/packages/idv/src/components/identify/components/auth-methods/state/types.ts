import type { AuthMethodKind, DecryptUserResponse, UserChallengeActionKind } from '@onefootprint/types';

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
};

export type AuthMethodsMachineEvents =
  | { type: 'decryptUserDone'; payload: DecryptUserResponse }
  | { type: 'goToBack' }
  | { type: 'setVerifyToken'; payload: string }
  | { type: 'updateEmail'; payload: UserChallengeActionKind }
  | { type: 'updatePasskey'; payload: UserChallengeActionKind }
  | { type: 'updatePhone'; payload: UserChallengeActionKind }
  | { type: 'updateUserDashboard'; payload: DashboardPayload };
