import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
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
            introductionCompleted: {
              target: 'idv',
            },
          },
        },
        idv: {},
      },
    },
    {
      actions: {
        resetContext: assign(() => ({})),
        assignInitContext: assign((context, event) => {
          const { tenantPk, authToken, businessBoKycData, onboardingConfig } =
            event.payload;
          context.tenantPk =
            tenantPk !== undefined ? tenantPk : context.tenantPk;
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
