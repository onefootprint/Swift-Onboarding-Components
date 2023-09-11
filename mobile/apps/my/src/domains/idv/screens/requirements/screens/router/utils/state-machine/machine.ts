import { assign, createMachine } from 'xstate';

import type { Typegen0 } from './machine.typegen';
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
    tsTypes: {} as Typegen0,
    initial: 'check',
    states: {
      check: {
        on: {
          remainingRequirementsReceived: [
            {
              target: 'passkeys',
              cond: (context, { payload }) => {
                return !!payload.remainingRequirements.liveness;
              },
              actions: assign((context, { payload }) => {
                context.remainingRequirements = payload.remainingRequirements;
                return context;
              }),
            },
            {
              target: 'idDoc',
              cond: (context, { payload }) => {
                return !!payload.remainingRequirements.idDoc;
              },
              actions: assign((context, { payload }) => {
                context.remainingRequirements = payload.remainingRequirements;
                return context;
              }),
            },
            {
              target: 'completed',
              actions: assign((context, { payload }) => {
                context.remainingRequirements = payload.remainingRequirements;
                return context;
              }),
            },
          ],
        },
      },
      passkeys: {
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
