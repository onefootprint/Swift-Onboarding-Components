import { createMachine } from 'xstate';

import { Events, MachineContext, MachineEvents, States } from './types';

const createLivenessRegisterMachine = (
  initialDevice: MachineContext['device'],
  authToken?: MachineContext['authToken'],
) =>
  createMachine<MachineContext, MachineEvents>({
    id: 'livenessRegister',
    initial: States.biometricRegister,
    context: {
      authToken,
      device: {
        hasSupportForWebAuthn: initialDevice.hasSupportForWebAuthn,
        type: initialDevice.type,
      },
    },
    states: {
      [States.init]: {
        on: {
          [Events.livenessRegisterStarted]: [
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
              cond: context => context.device.type !== 'mobile',
            },
          ],
        },
      },
      [States.biometricRegister]: {
        on: {
          [Events.biometricRegisterSucceeded]: {
            target: States.livenessRegisterCompleted,
          },
          [Events.biometricRegisterFailed]: {
            target: States.biometricRegisterFailure,
          },
        },
      },
      [States.qrRegister]: {
        on: {
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
  });

export default createLivenessRegisterMachine;
