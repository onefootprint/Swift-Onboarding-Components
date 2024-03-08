import type { AuthMethodKind, DecryptUserResponse } from '@onefootprint/types';

import type { UpdateAuthMethodActionKind } from '../../../types';

type DashboardEntryStatus = 'empty' | 'set';
type DashboardPayload = {
  kind: `${AuthMethodKind}`;
  entry: DashboardEntry;
};
type DashboardEntry = { label?: string; status: DashboardEntryStatus };

export type AuthMethodsMachineContext = {
  authToken: string;
  updateMethod: UpdateAuthMethodActionKind;
  userDashboard: { [T in AuthMethodKind]?: DashboardEntry };
  verifyToken: undefined | string;
};

export type AuthMethodsMachineEvents =
  | { type: 'decryptUserDone'; payload: DecryptUserResponse }
  | { type: 'goToBack' }
  | { type: 'setVerifyToken'; payload: string }
  | { type: 'updateEmail'; payload: UpdateAuthMethodActionKind }
  | {
      type: 'updatePasskey';
      payload: UpdateAuthMethodActionKind;
    }
  | { type: 'updatePhone'; payload: UpdateAuthMethodActionKind }
  | { type: 'updateUserDashboard'; payload: DashboardPayload };
