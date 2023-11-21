import type { DataIdentifier } from '@onefootprint/types';
import flat from 'flat';
import { createMachine } from 'xstate';

import type { Context, MachineEvents, MachineStates } from './types';
import { Action, Event, State } from './types';

export const createEditStateMachine = () =>
  createMachine<Context, MachineEvents, MachineStates>(
    {
      id: 'user-edit-fields',
      predictableActionArguments: true,
      initial: State.idle,
      states: {
        [State.idle]: {
          on: {
            [Event.started]: {
              target: State.editingFields,
            },
          },
        },
        [State.editingFields]: {
          on: {
            [Event.canceled]: {
              target: State.idle,
            },
            [Event.submittedFields]: [
              {
                target: State.savingEdit,
                actions: [Action.assignFields],
              },
            ],
          },
        },
        [State.savingEdit]: {
          on: {
            [Event.editSucceeded]: {
              target: State.idle,
            },
            [Event.editFailed]: {
              target: State.editingFields,
            },
          },
        },
      },
    },
    {
      actions: {
        [Action.assignFields]: (context, event) => {
          if (event.type === Event.submittedFields) {
            context.dis = Object.keys(
              flat(event.payload.fields),
            ) as DataIdentifier[];
          }
        },
      },
    },
  );

const editStateMachine = createEditStateMachine();
export default editStateMachine;
