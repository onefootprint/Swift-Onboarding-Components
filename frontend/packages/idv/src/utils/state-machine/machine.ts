import type { IdDocOutcome, IdvBootstrapData, ObConfigAuth } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { DeviceInfo } from '../../hooks/ui/use-device-info';
import type { UserData } from '../../types';
import type { CompletePayload, ComponentsSdkContext, MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';
import shouldShowIdentify from './utils/should-show-identify';
import shouldShowSandbox from './utils/should-show-sandbox';

export type IdvMachineArgs = {
  authToken?: string;
  obConfigAuth?: ObConfigAuth;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  componentsSdkContext?: ComponentsSdkContext;
  isInIframe?: boolean;
  device?: DeviceInfo;
  idDocOutcome?: IdDocOutcome;
  showLogo?: boolean;
  onClose?: () => void;
  onComplete?: (payload: CompletePayload) => void;
};

const getIdvMachineContext = (args: IdvMachineArgs): MachineContext => {
  const { bootstrapData, ...restOfArgs } = args;
  const userData: UserData = {};
  Object.entries(bootstrapData || {}).forEach(([key, value]) => {
    if (value) {
      // @ts-expect-error
      userData[key as IdDI] = { value, isBootstrap: true };
    }
  });
  return {
    userData,
    ...restOfArgs,
  };
};

const createIdvMachine = (args: IdvMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idv',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: getIdvMachineContext(args),
      on: {
        expireSession: {
          target: 'sessionExpired',
        },
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
        authTokenChanged: {
          actions: ['assignAuthToken'],
        },
        receivedDeviceResponseJson: {
          actions: ['assignDeviceResponseJson'],
        },
      },
      states: {
        init: {
          on: {
            configRequestFailed: {
              target: 'configInvalid',
            },
            initContextUpdated: [
              {
                target: 'sandboxOutcome',
                actions: ['assignInitContext'],
                cond: (context, event) => isContextReady(context, event) && shouldShowSandbox(context, event),
              },
              {
                target: 'identify',
                actions: ['assignInitContext'],
                cond: (context, event) => isContextReady(context, event) && shouldShowIdentify(context, event),
              },
              {
                target: 'onboarding',
                actions: ['assignInitContext'],
                cond: (context, event) => isContextReady(context, event),
              },
              {
                actions: ['assignInitContext'],
              },
            ],
          },
        },
        sandboxOutcome: {
          on: {
            sandboxOutcomeSubmitted: [
              {
                target: 'identify',
                actions: ['assignSandboxOutcome'],
              },
            ],
          },
        },
        identify: {
          on: {
            identifyCompleted: [
              {
                target: 'onboarding',
                actions: ['assignAuthToken', 'assignIdentifyResult'],
              },
            ],
          },
        },
        onboarding: {
          on: {
            onboardingCompleted: {
              target: 'complete',
              actions: ['assignValidationToken'],
            },
          },
        },
        sessionExpired: {
          on: {
            reset: [
              {
                target: 'init',
                actions: ['eraseAuthToken', 'resetContext'],
              },
            ],
          },
        },
        configInvalid: {
          type: 'final',
        },
        complete: {
          type: 'final',
        },
        expired: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        resetContext: assign(context => ({
          isTransfer: context.isTransfer,
          obConfigAuth: context.obConfigAuth,
          onClose: context.onClose,
          onComplete: context.onComplete,
        })),
        assignInitContext: assign((context, event) => {
          const { device, config } = event.payload;
          context.device = device !== undefined ? device : context.device;
          context.config = config !== undefined ? config : context.config;
          return context;
        }),
        assignSandboxOutcome: assign((context, event) => ({
          ...context,
          idDocOutcome: event.payload.idDocOutcome,
          sandboxId: event.payload.sandboxId,
          overallOutcome: event.payload.overallOutcome,
        })),
        assignIdentifyResult: assign((context, event) => {
          // Pass the phone and email collected in the identify machine into the requirements
          // machine. In very few cases, the phone and email are needed in the requirements machine
          if (event.payload.email) {
            context.userData[IdDI.email] = event.payload.email;
          }
          if (event.payload.phoneNumber) {
            context.userData[IdDI.phoneNumber] = event.payload.phoneNumber;
          }
          return context;
        }),
        assignAuthToken: assign((context, event) => {
          const { authToken: newAuthToken } = event.payload;
          if (newAuthToken) {
            context.authToken = newAuthToken;
          }
          return context;
        }),
        eraseAuthToken: assign(context => {
          context.authToken = undefined;
          return context;
        }),
        assignValidationToken: assign((context, event) => ({
          ...context,
          validationToken: event.payload.validationToken,
        })),
        assignDeviceResponseJson: assign((context, event) => ({
          ...context,
          deviceResponseJson: event.payload.deviceResponseJson,
        })),
      },
    },
  );

export default createIdvMachine;
