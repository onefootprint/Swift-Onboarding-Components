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
        expired: {
          target: 'expired',
        },
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
      },
      states: {
        init: {
          on: {
            invalidUrlReceived: {
              target: 'invalidUrl',
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
        expired: {
          on: {
            reset: {
              target: 'init',
              actions: ['resetContext'],
            },
          },
        },
        idv: { on: { idvCompleted: { target: 'complete' } } },
        complete: { type: 'final' },
        invalidUrl: { type: 'final' },
      },
    },
    {
      actions: {
        resetContext: assign(() => ({})),
        assignInitContext: assign((context, event) => {
          const {
            obConfigAuth,
            businessBoKycData,
            onboardingConfig,
            authToken,
          } = event.payload;
          context.obConfigAuth =
            obConfigAuth !== undefined ? obConfigAuth : context.obConfigAuth;
          context.authToken =
            authToken !== undefined ? authToken : context.authToken;
          context.businessBoKycData =
            businessBoKycData !== undefined
              ? businessBoKycData
              : context.businessBoKycData;
          context.onboardingConfig =
            onboardingConfig !== undefined
              ? onboardingConfig
              : context.onboardingConfig;

          return context;
        }),
      },
    },
  );

const HostedMachine = createHostedMachine();

export default HostedMachine;
