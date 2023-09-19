import type {
  IdDocOutcomes,
  IdvBootstrapData,
  ObConfigAuth,
} from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';

export type IdvMachineArgs = {
  authToken?: string;
  obConfigAuth?: ObConfigAuth;
  bootstrapData?: IdvBootstrapData;
  isTransfer?: boolean;
  showCompletionPage?: boolean;
  onClose?: () => void;
  onComplete?: (validationToken?: string, delay?: number) => void;
  showLogo?: boolean;
  idDocOutcome?: IdDocOutcomes;
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
      tsTypes: {} as Typegen0,
      initial: 'init',
      context: {
        ...args,
      },
      on: {
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
      },
      states: {
        init: {
          always: [
            {
              target: 'identify',
              cond: context => !context.authToken,
            },
            {
              target: 'onboarding',
            },
          ],
        },
        identify: {
          on: {
            expireSession: {
              target: 'sessionExpired',
            },
            identifyCompleted: [
              {
                target: 'onboarding',
                actions: [
                  'assignAuthToken',
                  'assignUserFound',
                  'assignEmail',
                  'assignPhoneNumber',
                  'assignIdDocOutcome',
                ],
              },
            ],
          },
        },
        onboarding: {
          on: {
            expireSession: {
              target: 'sessionExpired',
            },
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
        assignUserFound: assign((context, event) => ({
          ...context,
          userFound: event.payload.userFound,
        })),
        assignEmail: assign((context, event) => {
          context.bootstrapData = context.bootstrapData || {};
          context.bootstrapData[IdDI.email] = event.payload.email;
          return context;
        }),
        assignPhoneNumber: assign((context, event) => {
          context.bootstrapData = context.bootstrapData || {};
          context.bootstrapData[IdDI.phoneNumber] = event.payload.phoneNumber;
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
        assignIdDocOutcome: assign((context, event) => {
          context.idDocOutcome = event.payload.idDocOutcome;
          return context;
        }),
      },
    },
  );

export default createIdvMachine;
