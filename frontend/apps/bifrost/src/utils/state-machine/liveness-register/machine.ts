import { DeviceInfo } from 'src/utils/state-machine/types';
import { assign, createMachine } from 'xstate';

import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

const createLivenessRegisterMachine = (
  device: DeviceInfo,
  authToken?: string,
) =>
  createMachine<MachineContext, MachineEvents>(
    {
      id: 'livenessRegister',
      initial: States.init,
      context: {
        authToken,
        device,
      },
      states: {
        [States.init]: {
          always: [
            {
              target: States.biometricRegister,
              cond: context =>
                context.device.hasSupportForWebAuthn &&
                context.device.type === 'mobile',
            },
            {
              target: States.captchaRegister,
              cond: context =>
                context.device.type === 'mobile' &&
                !context.device.hasSupportForWebAuthn,
            },
            {
              target: States.qrRegister,
            },
          ],
        },
        [States.biometricRegister]: {
          on: {
            [Events.biometricRegisterSucceeded]: {
              target: States.livenessRegisterCompleted,
            },
          },
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
              target: States.livenessRegisterCompleted,
            },
            [Events.qrRegisterFailed]: {
              target: States.livenessRegisterCompleted,
            },
          },
        },
        [States.qrCodeScanned]: {
          on: {
            [Events.qrCodeCanceled]: {
              target: States.qrRegister, // TODO: is this right?
            },
            [Events.qrRegisterSucceeded]: {
              target: States.livenessRegisterCompleted,
            },
          },
        },
        [States.qrCodeSent]: {
          on: {
            [Events.qrCodeCanceled]: {
              target: States.qrRegister, // TODO: is this right?
            },
            [Events.qrRegisterSucceeded]: {
              target: States.livenessRegisterCompleted,
            },
          },
        },
        [States.captchaRegister]: {
          on: {
            [Events.captchaRegisterSucceeded]: {
              target: States.livenessRegisterCompleted,
            },
          },
        },
        [States.livenessRegisterCompleted]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignScopedAuthToken]: assign((context, event) => {
          if (event.type === Events.scopedAuthTokenGenerated) {
            context.scopedAuthToken = event.payload.scopedAuthToken;
          }
          return context;
        }),
      },
    },
  );

export default createLivenessRegisterMachine;
