import { D2PStatus } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';
import initContextComplete from './utils/init-context-complete';

export const createHandoffMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'handoff',
      initial: States.init,
      context: {},
      on: {
        [Events.reset]: {
          target: States.init,
          actions: [Actions.resetContext],
        },
        [Events.statusReceived]: [
          {
            target: States.expired,
            cond: (context, event) => !!event.payload.isError,
          },
          {
            target: States.canceled,
            cond: (context, event) =>
              event.payload.status === D2PStatus.canceled,
          },
          {
            target: States.complete,
            cond: (context, event) =>
              event.payload.status === D2PStatus.completed ||
              event.payload.status === D2PStatus.failed,
          },
        ],
      },
      states: {
        [States.init]: {
          on: {
            [Events.initContextUpdated]: [
              {
                description:
                  'Only transition to next state if all required info is collected',
                actions: [Actions.assignInitContext],
                target: States.checkRequirements,
                cond: (context, event) => initContextComplete(context, event),
              },
              {
                actions: [Actions.assignInitContext],
              },
            ],
            [Events.d2pAlreadyCompleted]: [
              {
                target: States.complete,
              },
            ],
          },
        },
        [States.checkRequirements]: {
          on: {
            [Events.requirementsReceived]: [
              {
                target: States.liveness,
                actions: [Actions.assignRequirements],
                cond: (context, event) => !!event.payload.missingLiveness,
              },
              {
                target: States.idDoc,
                actions: [Actions.assignRequirements],
                cond: (context, event) => !!event.payload.missingIdDoc,
              },
              {
                target: States.complete,
              },
            ],
          },
        },
        [States.liveness]: {
          on: {
            [Events.livenessCompleted]: [
              {
                target: States.idDoc,
                cond: context => !!context.requirements?.missingIdDoc,
              },
              {
                target: States.complete,
              },
            ],
          },
        },
        [States.idDoc]: {
          on: {
            [Events.idDocCompleted]: {
              target: States.complete,
            },
          },
        },
        [States.expired]: {
          type: 'final',
        },
        [States.canceled]: {
          type: 'final',
        },
        [States.complete]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignInitContext]: assign((context, event) => {
          if (event.type !== Events.initContextUpdated) {
            return context;
          }
          const { device, authToken, opener } = event.payload;
          context.device = device !== undefined ? device : context.device;
          context.opener = opener !== undefined ? opener : context.opener;
          context.authToken =
            authToken !== undefined ? authToken : context.authToken;

          return context;
        }),
        [Actions.assignRequirements]: assign((context, event) => {
          if (event.type === Events.requirementsReceived) {
            context.requirements = {
              ...event.payload,
            };
          }
          return context;
        }),
        [Actions.resetContext]: assign(() => ({})),
      },
    },
  );

const handoffMachine = createHandoffMachine();

export default handoffMachine;
