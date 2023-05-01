import { D2PStatus } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

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
            target: 'completed',
            cond: (context, event) =>
              event.payload.status === D2PStatus.completed ||
              event.payload.status === D2PStatus.failed,
          },
        ],
      },
      states: {
        init: {
          on: {
            started: [
              {
                actions: ['assignAuthToken'],
                target: 'liveness',
              },
            ],
            completed: [
              {
                target: 'completed',
              },
            ],
          },
        },
        // checkRequirements: {
        //   on: {
        //     requirementsReceived: [
        //       {
        //         actions: ['assignRequirements'],
        //       },
        //       {
        //         target: 'liveness',
        //         cond: context => !!context.requirements?.missingLiveness,
        //       },
        //       {
        //         target: 'idDoc',
        //         cond: context => !!context.requirements?.missingIdDoc,
        //       },
        //       {
        //         target: 'completed',
        //       },
        //     ],
        //   },
        // },
        liveness: {
          on: {
            requirementCompleted: {
              target: 'completed',
            },
          },
        },
        // idDoc: {
        //   on: {
        //     requirementCompleted: {
        //       target: 'checkRequirements',
        //     },
        //   },
        // },
        expired: {
          type: 'final',
        },
        canceled: {
          type: 'final',
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignAuthToken: assign((context, event) => {
          context.authToken = event.payload.authToken;
          return context;
        }),
        // assignRequirements: assign((context, event) => {
        //   context.requirements = {
        //     ...event.payload,
        //   };
        //   return context;
        // }),
        resetContext: assign(() => ({})),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
