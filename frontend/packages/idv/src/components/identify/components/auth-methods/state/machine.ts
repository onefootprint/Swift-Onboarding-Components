import { UserChallengeActionKind } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../../../../hooks/use-device-info';
import {
  assignDecryptedData,
  assignDevice,
  assignUpdateMethod,
  assignUserDashboard,
  assignVerifyToken,
} from './assigners';
import type { Typegen0 } from './machine.typegen';
import type { AuthMethodsMachineContext, AuthMethodsMachineEvents } from './types';

export type AuthMethodsMachineArgs = {
  authToken: string;
  initialMachineState?: Typegen0['matchesStates'];
};
const isTest = process.env.NODE_ENV === 'test';
const fixtureTestDevice = { hasSupportForWebauthn: true } as DeviceInfo;

const createAuthMethodsMachine = (args: AuthMethodsMachineArgs) =>
  createMachine(
    {
      id: 'user',
      predictableActionArguments: true,
      schema: {
        context: {} as AuthMethodsMachineContext,
        events: {} as AuthMethodsMachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0, // eslint-disable-line @typescript-eslint/consistent-type-imports
      initial: args.initialMachineState || 'identify',
      context: {
        authToken: args.authToken,
        updateMethod: UserChallengeActionKind.addPrimary,
        userDashboard: {
          email: { status: 'empty' },
          phone: { status: 'empty' },
          passkey: { status: 'empty' },
        },
        verifyToken: isTest ? 'utok_INITIAL-TEST-MODE' : undefined,
        device: isTest ? fixtureTestDevice : undefined,
      },
      on: {
        decryptUserDone: {
          actions: ['assignDecryptedData'],
        },
        updateUserDashboard: {
          target: 'dashboard',
          actions: ['assignUserDashboard'],
        },
        setDevice: {
          actions: ['assignDevice'],
        },
      },
      states: {
        identify: {
          on: {
            setVerifyToken: {
              target: 'dashboard',
              actions: ['assignVerifyToken'],
            },
          },
        },
        dashboard: {
          on: {
            updateEmail: {
              target: 'updateEmail',
              actions: ['assignUpdateMethod'],
            },
            updatePhone: {
              target: 'updatePhone',
              actions: ['assignUpdateMethod'],
            },
            updatePasskey: {
              target: 'updatePasskey',
              actions: ['assignUpdateMethod'],
            },
          },
        },
        updateEmail: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        updatePhone: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        updatePasskey: {
          on: {
            goToBack: { target: 'dashboard' },
          },
        },
        success: { type: 'final' },
      },
    },
    {
      actions: {
        assignUpdateMethod: assign(assignUpdateMethod),
        assignDecryptedData: assign(assignDecryptedData),
        assignUserDashboard: assign(assignUserDashboard),
        assignVerifyToken: assign(assignVerifyToken),
        assignDevice: assign(assignDevice),
      },
    },
  );

export default createAuthMethodsMachine;
