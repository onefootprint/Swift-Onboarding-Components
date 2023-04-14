import { assign, createMachine } from 'xstate';

import { BootstrapData } from '../../../idv.types';
import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';
import shouldShowSandboxOutcome from './utils/should-show-sandbox-outcome';

export type IdvMachineArgs = {
  tenantPk: string;
  bootstrapData?: BootstrapData;
};

const createIdvMachine = ({ tenantPk, bootstrapData }: IdvMachineArgs) =>
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
          on: {
            configRequestFailed: {
              target: 'configInvalid',
            },
            initContextUpdated: [
              {
                target: 'sandboxOutcome',
                actions: ['assignInitContext'],
                cond: (context, event) =>
                  shouldShowSandboxOutcome(context, event),
              },
              {
                target: 'identify',
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
            sandboxOutcomeSubmitted: {
              target: 'identify',
              actions: ['assignSandboxOutcome'],
            },
          },
        },
        identify: {
          on: {
            identifyCompleted: [
              {
                target: 'onboarding',
                actions: ['assignAuthToken', 'assignUserFound', 'assignEmail'],
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
        assignInitContext: assign((context, event) => {
          const { device, config } = event.payload;
          context.device = device !== undefined ? device : context.device;
          context.config = config !== undefined ? config : context.config;

          return context;
        }),
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
        assignAuthToken: assign((context, event) => ({
          ...context,
          authToken: event.payload.authToken,
        })),
        assignValidationToken: assign((context, event) => ({
          ...context,
          validationToken: event.payload.validationToken,
        })),
      },
    },
  );

export default createIdvMachine;
