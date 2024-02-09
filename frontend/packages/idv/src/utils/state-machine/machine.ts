import type {
  IdDocOutcome,
  IdvBootstrapData,
  ObConfigAuth,
} from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { CompletePayload, MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';
import shouldShowIdentify from './utils/should-show-identify';
import shouldShowSandbox from './utils/should-show-sandbox';

export type IdvMachineArgs = {
  authToken?: string;
  obConfigAuth?: ObConfigAuth;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  showCompletionPage?: boolean;
  idDocOutcome?: IdDocOutcome;
  showLogo?: boolean;
  onClose?: () => void;
  onComplete?: (payload: CompletePayload) => void;
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
      context: {
        ...args,
      },
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
                cond: (context, event) =>
                  isContextReady(context, event) &&
                  shouldShowSandbox(context, event),
              },
              {
                target: 'identify',
                actions: ['assignInitContext'],
                cond: (context, event) =>
                  isContextReady(context, event) &&
                  shouldShowIdentify(context, event),
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
                actions: [
                  'assignAuthToken',
                  'assignUserFound',
                  'assignEmail',
                  'assignPhoneNumber',
                ],
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
        assignUserFound: assign((context, event) => ({
          ...context,
          userFound: event.payload.userFound,
        })),
        assignEmail: assign((context, event) => {
          context.bootstrapData = context.bootstrapData || {};
          if (event.payload.email) {
            context.bootstrapData[IdDI.email] = event.payload.email;
          }
          return context;
        }),
        assignPhoneNumber: assign((context, event) => {
          context.bootstrapData = context.bootstrapData || {};
          if (event.payload.phoneNumber) {
            context.bootstrapData[IdDI.phoneNumber] = event.payload.phoneNumber;
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
