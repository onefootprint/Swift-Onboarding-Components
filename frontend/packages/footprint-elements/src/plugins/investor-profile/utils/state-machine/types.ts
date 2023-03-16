import { DeviceInfo } from '@onefootprint/hooks';

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  authToken?: string;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
      };
    }
  | {
      type: 'employmentSubmitted';
      payload: {};
    }
  | {
      type: 'brokerageEmploymentSubmitted';
      payload: {};
    }
  | {
      type: 'incomeSubmitted';
      payload: {};
    }
  | {
      type: 'netWorthSubmitted';
      payload: {};
    }
  | {
      type: 'riskToleranceSubmitted';
      payload: {};
    }
  | {
      type: 'conflictOfInterestSubmitted';
      payload: {};
    }
  | {
      type: 'navigatedToPrevPage';
    };
