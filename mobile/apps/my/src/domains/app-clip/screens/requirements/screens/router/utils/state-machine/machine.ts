import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const createRequirementsMachine = () =>
  createMachine({
    predictableActionArguments: true,
    id: 'requirements',
    schema: {
      events: {} as MachineEvents,
      context: {} as MachineContext,
    },
    context: {
      remainingRequirements: {
        liveness: null,
        idDoc: null,
      },
    },
    tsTypes: {} as import('./machine.typegen').Typegen0,
    initial: 'check',
    states: {
      check: {
        on: {
          remainingRequirementsReceived: [
            {
              actions: assign((context, { payload }) => {
                context.remainingRequirements = payload.remainingRequirements;
                return context;
              }),
            },
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
