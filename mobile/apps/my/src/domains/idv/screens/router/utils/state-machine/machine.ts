import { D2PStatus } from '@onefootprint/types';
import { createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
import type { MachineContext, MachineEvents } from './types';

const createHandoffMachine = (authToken: string) =>
  createMachine({
    predictableActionArguments: true,
    id: 'handoff',
    schema: {
      context: {} as MachineContext,
      events: {} as MachineEvents,
    },
    tsTypes: {} as Typegen0,
    initial: 'init',
    context: {
      authToken,
    },
    on: {
      statusReceived: [
        {
          target: 'expired',
          cond: (_, event) => !!event.payload.isError,
        },
        {
          target: 'canceled',
          cond: (_, event) => event.payload.status === D2PStatus.canceled,
        },
        {
          target: 'completed',
          cond: (_, event) => event.payload.status === D2PStatus.completed || event.payload.status === D2PStatus.failed,
        },
      ],
    },
    states: {
      init: {
        on: {
          initCompleted: {
            target: 'requirements',
          },
          initFailed: {
            target: 'error',
          },
        },
      },
      requirements: {
        on: {
          requirementsCompleted: {
            target: 'completed',
          },
        },
      },
      error: {
        type: 'final',
      },
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
  });

export default createHandoffMachine;
