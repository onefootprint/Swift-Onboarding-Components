import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

export const createLivenessMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'liveness',
      initial: States.init,
      context: {},
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: [
              {
                target: States.register,
                actions: Actions.assignContext,
                cond: (context, event) => {
                  const {
                    device: { type, hasSupportForWebauthn },
                  } = event.payload;
                  return type === 'mobile' && !!hasSupportForWebauthn;
                },
              },
              {
                target: States.unavailable,
                actions: Actions.assignContext,
              },
            ],
          },
        },
        [States.register]: {
          on: {
            [Events.failed]: {
              target: States.retry,
            },
            [Events.succeeded]: {
              target: States.success,
            },
          },
        },
        [States.retry]: {
          on: {
            [Events.failed]: {
              target: States.retry,
            },
            [Events.skipped]: {
              target: States.completed,
            },
            [Events.succeeded]: {
              target: States.success,
            },
          },
        },
        [States.unavailable]: {
          on: {
            [Events.completed]: {
              target: States.completed,
            },
          },
        },
        [States.success]: {
          on: {
            [Events.completed]: {
              target: States.completed,
            },
          },
        },
        [States.completed]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { authToken, device, tenant } = event.payload;
            context.authToken = authToken;
            context.device = device;
            context.tenant = tenant;
          }
          return context;
        }),
      },
    },
  );

const LivenessMachine = createLivenessMachine();

export default LivenessMachine;
