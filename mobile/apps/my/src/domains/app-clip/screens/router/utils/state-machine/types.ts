import { D2PStatus } from '@onefootprint/types';

export type MachineContext = {
  authToken?: string;
};

export type MachineEvents =
  | {
      type: 'authTokenChanged';
      payload: {
        authToken: string;
      };
    }
  | {
      type: 'authTokenFailed';
    }
  | {
      type: 'initCompleted';
    }
  | {
      type: 'initFailed';
    }
  | {
      type: 'requirementCompleted';
    }
  | {
      type: 'statusReceived';
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    };
