import { assign, createMachine } from 'xstate';

import { BootstrapData } from '../../../types';
import { MachineContext, MachineEvents } from './types';

export type IdvMachineArgs = {
  authToken?: string;
  tenantPk: string;
  bootstrapData?: BootstrapData;
};

const createIdvMachine = ({
  authToken,
  tenantPk,
  bootstrapData,
}: IdvMachineArgs) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idv',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        authToken,
        tenantPk,
        bootstrapData,
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
              cond: context => !!context.tenantPk,
            },
            {
              target: 'complete',
            },
          ],
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
                  'assignSandboxOutcome',
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
          tenantPk: context.tenantPk,
          bootstrapData: context.bootstrapData,
        })),
        assignSandboxOutcome: assign((context, event) => ({
          ...context,
          sandboxSuffix: event.payload.sandboxSuffix,
        })),
        assignUserFound: assign((context, event) => ({
          ...context,
          userFound: event.payload.userFound,
        })),
        assignEmail: assign((context, event) => ({
          ...context,
          email: event.payload.email,
        })),
        assignAuthToken: assign((context, event) => {
          const { authToken: newAuthToken } = event.payload;
          if (newAuthToken) {
            context.authToken = newAuthToken;
          }
          return context;
        }),
        assignValidationToken: assign((context, event) => ({
          ...context,
          validationToken: event.payload.validationToken,
        })),
      },
    },
  );

export default createIdvMachine;
