import { D2PStatus } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';
import initContextComplete from './utils/init-context-complete';

export const createHandoffMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'handoff',
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
        statusReceived: [
          {
            target: 'expired',
            cond: (context, event) => !!event.payload.isError,
          },
          {
            target: 'canceled',
            cond: (context, event) =>
              event.payload.status === D2PStatus.canceled,
          },
          {
            target: 'complete',
            cond: (context, event) =>
              event.payload.status === D2PStatus.completed ||
              event.payload.status === D2PStatus.failed,
          },
        ],
      },
      states: {
        init: {
          on: {
            initContextUpdated: [
              {
                description:
                  'Only transition to next state if all required info is collected',
                actions: ['assignInitContext'],
                target: 'router',
                cond: (context, event) => initContextComplete(context, event),
              },
              {
                actions: ['assignInitContext'],
              },
            ],
            d2pAlreadyCompleted: [
              {
                target: 'complete',
              },
            ],
          },
        },
        router: {
          always: [
            {
              target: 'liveness',
              cond: context => !!context.requirements?.missingLiveness,
            },
            {
              target: 'idDoc',
              cond: context => !!context.requirements?.missingIdDoc,
            },
            {
              target: 'complete',
            },
          ],
        },

        liveness: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        idDoc: {
          on: {
            requirementCompleted: {
              target: 'checkRequirements',
            },
          },
        },
        checkRequirements: {
          on: {
            requirementsReceived: {
              target: 'router',
              actions: ['assignRequirements'],
            },
          },
        },
        expired: {
          type: 'final',
        },
        canceled: {
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
          const { device, authToken, opener, onboardingConfig, requirements } =
            event.payload;

          context.device = device !== undefined ? device : context.device;
          context.opener = opener !== undefined ? opener : context.opener;
          context.authToken =
            authToken !== undefined ? authToken : context.authToken;
          context.onboardingConfig =
            onboardingConfig !== undefined
              ? onboardingConfig
              : context.onboardingConfig;
          context.requirements =
            requirements !== undefined ? requirements : context.requirements;

          return context;
        }),
        assignRequirements: assign((context, event) => {
          context.requirements = {
            ...event.payload,
          };
          return context;
        }),
        resetContext: assign(() => ({})),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
