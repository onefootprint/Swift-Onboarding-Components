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

export const createDecryptStateMachine = () =>
  createMachine<Context, MachineEvents, MachineStates>(
    {
      id: 'user-decrypt-fields',
      predictableActionArguments: true,
      initial: State.idle,
      states: {
        [State.idle]: {
          on: {
            [Event.hydrated]: {
              actions: Action.assignInitialFields,
            },
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
            [Event.submittedFields]: {
              target: State.confirmingReason,
              actions: Action.assignField,
              cond: Guard.hasAtLeastOneFieldSelected,
            },
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
            const { fields } = event.payload;
            const hasAnyFieldSelected = Object.keys(fields).length > 0;
            return hasAnyFieldSelected;
          }
          return false;
        },
      },
      actions: {
        [Action.assignInitialFields]: (context, event) => {
          if (event.type === Event.hydrated) {
            context.fields = event.payload.fields;
          }
        },
        [Action.assignField]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.fields = event.payload.fields;
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
