import { DeviceInfo } from '@onefootprint/hooks';
import { CountryCode3, IdDocRequirement, IdDocType } from '@onefootprint/types';

export type MachineContext = {
  authToken: string;
  device: DeviceInfo;
  type?: IdDocType;
  requirement: IdDocRequirement;
};

export type MachineEvents =
  | {
      type: 'receivedCountryAndType';
      payload: {
        type?: IdDocType;
        country?: CountryCode3;
      };
    }
  | {
      type: 'receivedImage';
    };
