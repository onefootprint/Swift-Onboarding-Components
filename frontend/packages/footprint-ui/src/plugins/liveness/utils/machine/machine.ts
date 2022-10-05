import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createLivenessMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'liveness',
      initial: States.init,
      context: {
        authToken: '',
        scopedAuthToken: '',
        device: {
          type: 'mobile',
          hasSupportForWebauthn: false,
        },
      },
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: {
              target: States.deviceSupport,
              actions: Actions.assignInitialContext,
            },
          },
        },
        [States.deviceSupport]: {
          always: [
            {
              target: States.newTabRequest,
              cond: context =>
                context.device.type === 'mobile' &&
                context.device.hasSupportForWebauthn,
            },
            {
              target: States.skipLiveness,
            },
          ],
        },
        [States.newTabRequest]: {
          on: {
            [Events.scopedAuthTokenGenerated]: {
              actions: [Actions.assignScopedAuthToken],
            },
            [Events.newTabOpened]: {
              target: States.newTabProcessing,
              actions: [Actions.assignTab],
            },
          },
        },
        [States.newTabProcessing]: {
          on: {
            [Events.newTabRegisterCanceled]: {
              target: States.newTabRequest,
            },
            [Events.newTabRegisterSucceeded]: {
              target: States.success,
            },
            [Events.newTabRegisterFailed]: {
              target: States.skipLiveness,
            },
            [Events.statusPollingErrored]: {
              target: States.newTabRequest,
              actions: [Actions.clearScopedAuthToken],
            },
          },
        },
        [States.skipLiveness]: {
          on: {
            [Events.livenessSkipped]: {
              target: States.failure,
            },
          },
        },
        [States.success]: {
          type: 'final',
        },
        [States.failure]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignInitialContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { device, authToken, tenant } = event.payload;
            context.device = device;
            context.authToken = authToken;
            context.tenant = tenant;
          }
          return context;
        }),
        [Actions.assignScopedAuthToken]: assign((context, event) => {
          if (event.type === Events.scopedAuthTokenGenerated) {
            context.scopedAuthToken = event.payload.scopedAuthToken;
          }
          return context;
        }),
        [Actions.assignTab]: assign((context, event) => {
          if (event.type === Events.newTabOpened) {
            context.tab = event.payload.tab;
          }
          return context;
        }),
        [Actions.clearTab]: assign((context, event) => {
          if (event.type === Events.newTabRegisterCanceled) {
            context.tab = undefined;
          }
          return context;
        }),
        [Actions.clearScopedAuthToken]: assign((context, event) => {
          if (event.type === Events.statusPollingErrored) {
            context.scopedAuthToken = '';
          }
          return context;
        }),
      },
    },
  );

export default createLivenessMachine;
