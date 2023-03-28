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
import { getDocumentFields, getIdDocumentFields, getTextFields } from './utils';

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
                actions: [
                  Action.assignFields,
                  Action.assignText,
                  Action.assignIdDocument,
                  Action.assignDocument,
                ],
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
            const textFields = getTextFields(event.payload.fields);
            const idDocumentFields = getIdDocumentFields(event.payload.fields);
            const documentFields = getDocumentFields(event.payload.fields);

            return (
              textFields.length > 0 ||
              idDocumentFields.length > 0 ||
              documentFields.length > 0
            );
          }
          return false;
        },
      },
      actions: {
        [Action.assignFields]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.fields = event.payload.fields;
          }
        },
        [Action.assignText]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.textFields = getTextFields(event.payload.fields);
          }
        },
        [Action.assignIdDocument]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.idDocumentFields = getIdDocumentFields(
              event.payload.fields,
            );
          }
        },
        [Action.assignDocument]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.documentFields = getDocumentFields(event.payload.fields);
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
