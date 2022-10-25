import { DeviceInfo } from '@onefootprint/hooks';
import { D2PStatus, TenantInfo } from '@onefootprint/types';

export enum States {
  init = 'init',
  checkRequirements = 'checkRequirements',
  liveness = 'liveness',
  idScan = 'idScan',
  canceled = 'canceled',
  expired = 'expired',
  complete = 'complete',
}

export enum Events {
  authTokenReceived = 'authTokenReceived',
  tenantInfoReceived = 'tenantInfoReceived', // Fetching tenant by tenant pk is complete
  deviceInfoIdentified = 'deviceInfoIdentified',
  requirementsReceived = 'requirementsReceived', // Fetching onboarding requirements is complete
  livenessCompleted = 'livenessCompleted',
  idScanCompleted = 'idScanCompleted',
  statusReceived = 'statusReceived', // Fetching d2p status is complete
  d2pAlreadyCompleted = 'd2pAlreadyCompleted',
}

export enum Actions {
  assignDeviceInfo = 'assignDeviceInfo',
  assignAuthToken = 'assignAuthToken',
  assignTenantPk = 'assignTenantPk',
  assignTenant = 'assignTenant',
  assignRequirements = 'assignRequirements',
}

export type MachineContext = {
  device?: DeviceInfo;
  tenant?: TenantInfo;
  tenantPk?: string;
  authToken?: string;
  requirements?: {
    missingIdDocument?: boolean;
    missingLiveness?: boolean;
  };
};

export type MachineEvents =
  | {
      type: Events.d2pAlreadyCompleted;
    }
  | {
      type: Events.authTokenReceived;
      payload: {
        authToken: string;
        tenantPk?: string;
      };
    }
  | {
      type: Events.tenantInfoReceived;
      payload: {
        tenant: TenantInfo;
      };
    }
  | {
      type: Events.deviceInfoIdentified;
      payload: DeviceInfo;
    }
  | {
      type: Events.statusReceived;
      payload: {
        isError?: boolean;
        status?: D2PStatus;
      };
    }
  | {
      type: Events.requirementsReceived;
      payload: {
        missingIdDocument?: boolean;
        missingLiveness?: boolean;
      };
    }
  | {
      type: Events.livenessCompleted;
    }
  | {
      type: Events.idScanCompleted;
    };
