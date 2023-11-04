import type { D2PStatus } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
};

export type MachineEvents =
  | {
      type: 'initCompleted';
    }
  | {
      type: 'initFailed';
    }
  | {
      type: 'requirementsCompleted';
    }
  | {
      type: 'statusReceived';
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    };
