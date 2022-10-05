import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createD2PMachine = () =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'd2p',
      initial: States.init,
      context: {
        missingRequirements: {},
      },
      states: {
        [States.init]: {
          on: {
            [Events.receivedContext]: [
              {
                target: States.success,
                actions: Actions.assignContext,
                cond: (context, event) =>
                  Object.keys(event.payload.missingRequirements).length === 0,
              },
              {
                target: States.deviceSupport,
                actions: Actions.assignContext,
              },
            ],
          },
        },
        [States.deviceSupport]: {
          always: [
            {
              target: States.qrRegister,
              cond: context =>
                context.device?.type !== 'mobile' ||
                !context.device?.hasSupportForWebauthn,
            },
            {
              target: States.success,
            },
          ],
        },
        [States.qrRegister]: {
          on: {
            [Events.scopedAuthTokenGenerated]: {
              actions: [Actions.assignScopedAuthToken],
            },
            [Events.qrCodeLinkSentViaSms]: {
              target: States.qrCodeSent,
            },
            [Events.qrCodeScanned]: {
              target: States.qrCodeScanned,
            },
            [Events.qrRegisterSucceeded]: {
              target: States.success,
            },
            [Events.qrRegisterFailed]: {
              target: States.failure,
            },
            [Events.statusPollingErrored]: {
              actions: [Actions.clearScopedAuthToken],
            },
          },
        },
        [States.qrCodeScanned]: {
          on: {
            [Events.qrCodeCanceled]: {
              target: States.qrRegister,
              actions: [Actions.clearScopedAuthToken],
            },
            [Events.qrRegisterSucceeded]: {
              target: States.success,
            },
            [Events.qrRegisterFailed]: {
              target: States.failure,
            },
            [Events.statusPollingErrored]: {
              target: States.qrRegister,
              actions: [Actions.clearScopedAuthToken],
            },
          },
        },
        [States.qrCodeSent]: {
          on: {
            [Events.qrCodeCanceled]: {
              target: States.qrRegister,
              actions: [Actions.clearScopedAuthToken],
            },
            [Events.qrRegisterSucceeded]: {
              target: States.success,
            },
            [Events.qrRegisterFailed]: {
              target: States.failure,
            },
            [Events.statusPollingErrored]: {
              target: States.qrRegister,
              actions: [Actions.clearScopedAuthToken],
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
        [Actions.assignContext]: assign((context, event) => {
          if (event.type === Events.receivedContext) {
            const { authToken, device, missingRequirements, tenant } =
              event.payload;
            context.authToken = authToken;
            context.device = device;
            context.missingRequirements = { ...missingRequirements };
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
        [Actions.clearScopedAuthToken]: assign((context, event) => {
          if (event.type === Events.statusPollingErrored) {
            context.scopedAuthToken = '';
          }
          return context;
        }),
      },
    },
  );

export default createD2PMachine;
