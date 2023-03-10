import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';
import shouldShowSandboxOutcome from './utils/should-show-sandbox-outcome';

export const createBifrostMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'bifrost',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
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
                cond: context => !!context.config,
              },
              {
                target: 'authenticationSuccess',
                actions: ['assignAuthToken', 'assignUserFound', 'assignEmail'],
              },
            ],
          },
        },
        onboarding: {
          on: {
            onboardingCompleted: {
              target: 'complete',
              actions: ['assignValidationToken', 'assignStatus'],
            },
          },
        },
        configInvalid: {
          type: 'final',
        },
        authenticationSuccess: {
          type: 'final',
        },
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignInitContext: assign((context, event) => {
          const { device, config, bootstrapData } = event.payload;
          context.device = device !== undefined ? device : context.device;
          context.config = config !== undefined ? config : context.config;
          context.bootstrapData =
            bootstrapData !== undefined ? bootstrapData : context.bootstrapData;

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
        assignStatus: assign((context, event) => ({
          ...context,
          status: event.payload.status,
        })),
        resetContext: assign(() => ({})),
      },
    },
  );

const BifrostMachine = createBifrostMachine();

export default BifrostMachine;
