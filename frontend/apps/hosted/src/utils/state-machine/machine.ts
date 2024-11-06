import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

export const createHostedMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'hosted',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
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
            errorReceived: {
              target: 'error',
              actions: ['assignError'],
            },
            initContextUpdated: [
              {
                target: 'intro',
                actions: ['assignInitContext'],
                cond: (context, event) => isContextReady(context, event),
              },
              {
                actions: ['assignInitContext'],
              },
            ],
          },
        },
        intro: {
          on: {
            introductionCompleted: { target: 'idv' },
          },
        },
        idv: { on: { idvCompleted: { target: 'complete' } } },
        complete: { type: 'final' },
        error: {
          on: {
            reset: {
              target: 'init',
              actions: ['resetContext'],
            },
          },
        },
      },
    },
    {
      actions: {
        resetContext: assign(() => ({})),
        assignError: assign((context, event) => ({ ...context, error: event.payload.error })),
        assignInitContext: assign((context, event) => {
          const { obConfigAuth, businessBoKycData, onboardingConfig, authToken, urlType, workflowRequest } =
            event.payload;
          context.obConfigAuth = obConfigAuth !== undefined ? obConfigAuth : context.obConfigAuth;
          context.authToken = authToken !== undefined ? authToken : context.authToken;
          context.businessBoKycData = businessBoKycData !== undefined ? businessBoKycData : context.businessBoKycData;
          context.onboardingConfig = onboardingConfig !== undefined ? onboardingConfig : context.onboardingConfig;
          context.workflowRequest = workflowRequest !== undefined ? workflowRequest : context.workflowRequest;
          context.urlType = urlType !== undefined ? urlType : context.urlType;

          return context;
        }),
      },
    },
  );

const HostedMachine = createHostedMachine();

export default HostedMachine;
