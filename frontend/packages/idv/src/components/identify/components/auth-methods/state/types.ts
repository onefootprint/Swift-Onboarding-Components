import type { AuthMethodKind, DecryptUserResponse } from '@onefootprint/types';

type DashboardEntryStatus = 'empty' | 'set';
type DashboardPayload = {
  kind: `${AuthMethodKind}`;
  entry: DashboardEntry;
};
type DashboardEntry = { label?: string; status: DashboardEntryStatus };

export type AuthMethodsMachineContext = {
  authToken: string;
  userDashboard: { [T in AuthMethodKind]?: DashboardEntry };
  verifyToken: undefined | string;
};

export type AuthMethodsMachineEvents =
  | { type: 'decryptUserDone'; payload: DecryptUserResponse }
  | { type: 'goToBack' }
  | { type: 'setVerifyToken'; payload: string }
  | { type: 'updateEmail' }
  | { type: 'updatePasskey' }
  | { type: 'updatePhone' }
  | { type: 'updateUserDashboard'; payload: DashboardPayload };
