import { createMachine } from 'xstate';

import {
  Action,
  Context,
  Event,
  Guard,
  MachineEvents,
  MachineStates,
  State,
} from './types';
import getDiFields from './utils/get-di-fields/get-di-fields';

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
      },
    },
    {
      guards: {
        [Guard.hasAtLeastOneFieldSelected]: (context, event) => {
          if (event.type === Event.submittedFields) {
            const dis = getDiFields(event.payload.fields);
            return dis.length > 0;
          }
          return false;
        },
      },
      actions: {
        [Action.assignFields]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.dis = getDiFields(event.payload.fields);
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
