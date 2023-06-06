import { createMachine } from 'xstate';

import { MachineEvents } from './types';

const createRequirementsMachine = () =>
  createMachine({
    predictableActionArguments: true,
    id: 'requirements',
    schema: {
      events: {} as MachineEvents,
    },
    tsTypes: {} as import('./machine.typegen').Typegen0,
    initial: 'check',
    states: {
      check: {
        on: {
          requirementsReceived: [
            {
              target: 'liveness',
              cond: (context, { payload }) => {
                return !!payload.remainingRequirements.liveness;
              },
            },
            {
              target: 'idDoc',
              cond: (context, { payload }) => {
                return !!payload.remainingRequirements.idDoc;
              },
            },
            {
              target: 'completed',
            },
          ],
        },
      },
      liveness: {
        on: {
          requirementCompleted: {
            target: 'check',
          },
        },
      },
      idDoc: {
        on: {
          requirementCompleted: {
            target: 'check',
          },
        },
      },
      completed: {
        type: 'final',
      },
    },
  });

export default createRequirementsMachine;
