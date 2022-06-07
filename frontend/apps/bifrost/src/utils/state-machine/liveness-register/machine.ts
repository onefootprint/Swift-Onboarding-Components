import { DeviceInfo } from 'src/utils/state-machine/types';
import { createMachine } from 'xstate';

import { Events, MachineContext, MachineEvents, States } from './types';

const createLivenessRegisterMachine = (
  device: DeviceInfo,
  authToken?: string,
) =>
  createMachine<MachineContext, MachineEvents>({
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
            cond: context => context.device.type !== 'mobile',
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
