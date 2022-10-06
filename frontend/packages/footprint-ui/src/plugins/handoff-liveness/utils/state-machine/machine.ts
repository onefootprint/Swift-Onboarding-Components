import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

export const createHandoffLivenessMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'handoffLiveness',
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
              },
            ],
          },
        },
        [States.register]: {
          on: {
            [Events.registerFailed]: {
              target: States.registerRetry,
            },
            [Events.registerSucceeded]: {
              target: States.success,
            },
            [Events.canceled]: {
              target: States.canceled,
            },
            [Events.statusPollingErrored]: {
              target: States.expired,
              actions: [Actions.clearAuthToken],
            },
          },
        },
        [States.registerRetry]: {
          on: {
            [Events.registerSucceeded]: {
              target: States.success,
            },
            [Events.canceled]: {
              target: States.canceled,
            },
            [Events.statusPollingErrored]: {
              target: States.expired,
              actions: [Actions.clearAuthToken],
            },
          },
        },
        [States.canceled]: {
          type: 'final',
        },
        [States.unavailable]: {
          type: 'final',
        },
        [States.success]: {
          type: 'final',
        },
        [States.expired]: {
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
        [Actions.clearAuthToken]: assign((context, event) => {
          if (event.type === Events.statusPollingErrored) {
            context.authToken = '';
          }
          return context;
        }),
      },
    },
  );

const handoffLivenessMachine = createHandoffLivenessMachine();

export default handoffLivenessMachine;
