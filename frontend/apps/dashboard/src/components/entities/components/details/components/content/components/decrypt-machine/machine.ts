import { createMachine } from 'xstate';

import type { Context, MachineEvents, MachineStates } from './types';
import { Action, Event, Guard, State } from './types';

export const createDecryptStateMachine = () =>
  createMachine<Context, MachineEvents, MachineStates>(
    {
      id: 'user-decrypt-fields',
      predictableActionArguments: true,
      initial: State.idle,
      states: {
        [State.idle]: {
          on: {
            [Event.started]: {
              target: State.selectingFields,
            },
            [Event.submittedFields]: [
              {
                target: State.confirmingDecryptAllReason,
                actions: [Action.assignFields],
              },
            ],
          },
        },
        [State.selectingFields]: {
          on: {
            [Event.canceled]: {
              target: State.idle,
            },
            [Event.submittedFields]: [
              {
                target: State.confirmingReason,
                actions: [Action.assignFields],
                cond: Guard.hasAtLeastOneFieldSelected,
              },
            ],
          },
        },
        [State.confirmingReason]: {
          on: {
            [Event.canceled]: {
              target: State.selectingFields,
            },
            [Event.submittedReason]: {
              target: State.decrypting,
              actions: Action.assignReason,
            },
          },
        },
        [State.confirmingDecryptAllReason]: {
          on: {
            [Event.canceled]: {
              target: State.idle,
            },
            [Event.submittedReason]: {
              target: State.decryptingAll,
              actions: Action.assignReason,
            },
          },
        },
        [State.decrypting]: {
          on: {
            [Event.decryptSucceeded]: {
              target: State.idle,
            },
            [Event.decryptFailed]: {
              target: State.confirmingReason,
            },
          },
        },
        [State.decryptingAll]: {
          on: {
            [Event.decryptSucceeded]: {
              target: State.idle,
            },
            [Event.decryptFailed]: {
              target: State.confirmingDecryptAllReason,
            },
          },
        },
      },
    },
    {
      guards: {
        [Guard.hasAtLeastOneFieldSelected]: (_context, event) => {
          if (event.type === Event.submittedFields) {
            return event.payload.fields.length > 0 || event.payload.documents.length > 0;
          }
          return false;
        },
      },
      actions: {
        [Action.assignFields]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.dis = event.payload.fields;
            context.documents = event.payload.documents;
          }
        },
        [Action.assignReason]: (context, event) => {
          if (event.type === Event.submittedReason) {
            context.reason = event.payload.reason;
          }
        },
      },
    },
  );

const decryptStateMachine = createDecryptStateMachine();
export default decryptStateMachine;
